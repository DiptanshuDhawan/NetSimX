"""
NetLabX Core Grading Engine
Connects to routers, issues 'show run', and compares with solution config.
"""

import yaml
import sys
import os
import time
import logging

sys.stdout.reconfigure(encoding='utf-8')

from netmiko import ConnectHandler
from netmiko.exceptions import NetMikoTimeoutException, AuthenticationException

logger = logging.getLogger("netlabx.grading")

def load_lab_definition(yaml_path: str) -> dict:
    with open(yaml_path, "r") as f:
        return yaml.safe_load(f)


class BaseGrader:
    def __init__(self, node_name: str, node_config: dict, solution_path: str):
        self.node_name = node_name
        self.node_config = node_config
        self.solution_path = solution_path

    def sanitize_config(self, config_text: str) -> set:
        lines = []
        current_context = ""
        import re

        # IOS boilerplate lines that vary by image/version — never grade these
        SKIP_PREFIXES = (
            "Building configuration", "Current configuration",
            "ntp clock-period", "Last configuration change",
            "version ", "boot-start-marker", "boot-end-marker",
            # AAA/model lines differ between IOS versions
            "no aaa new-model", "aaa new-model",
            # HTTP server lines differ
            "no ip http", "ip http",
            # IPv6 defaults differ
            "no ipv6 cef", "ip cef", "ipv6 multicast", "ipv6 unicast",
            # STP config varies by image
            "spanning-tree",
            # VLAN database lines (L2 switch boilerplate)
            "vlan internal",
            # Control plane lines
            "control-plane",
            # Interface defaults — duplex/speed auto are defaults, not graded
            "duplex auto", "duplex full", "duplex half",
            "speed auto",
            # Timestamp/logging defaults differ
            "service timestamps", "service compress-config",
            "logging synchronous",
            # Memory/hardware lines
            "no ip domain lookup",
            # Interface state — "no shutdown" never appears in show run when up
            "no shutdown",
        )

        for line in config_text.splitlines():
            stripped = line.strip()

            # Skip blank lines and comments
            if not stripped or stripped.startswith("!"):
                continue
            if any(stripped.startswith(p) for p in SKIP_PREFIXES):
                continue
            if stripped == "end":
                continue
            if "NVRAM" in stripped or "bytes" in stripped:
                continue

            # ── Normalizations ──────────────────────────────────────────────

            # 1. Secrets / passwords — strip type digit AND value entirely.
            #    Handles: plaintext (solution files), type-5 MD5, type-4 SHA256,
            #    type-7 Vigenere, type-8/9 PBKDF2 — all collapse to the same key.
            stripped = re.sub(r'\benable secret\b.*', 'enable secret', stripped)
            stripped = re.sub(r'\busername (\S+) privilege \d+', r'username \1', stripped)
            stripped = re.sub(r'\busername (\S+) secret\b.*', r'username \1 secret', stripped)
            stripped = re.sub(r'\busername (\S+) password\b.*', r'username \1 password', stripped)
            stripped = re.sub(r'\bpassword \d+ \S+', 'password', stripped)
            stripped = re.sub(r'\bsecret \d+ \S+', 'secret', stripped)
            stripped = re.sub(r'\bpassword \S+', 'password', stripped)

            # 1b. NTP authentication key — IOS encrypts MD5 key in show run.
            #     "ntp authentication-key 1 md5 cisco" and
            #     "ntp authentication-key 1 md5 7 <hash>" both normalize to
            #     "ntp authentication-key 1 md5"
            stripped = re.sub(r'^(ntp authentication-key \d+ md5).*', r'\1', stripped)

            # 2. Banner — ignore delimiter character and message text entirely
            stripped = re.sub(r'^banner motd .*', 'banner motd', stripped)

            # 3. Line name abbreviations — IOS uses "line con 0" in show run
            #    but humans write "line console 0". Normalise both to "line con 0".
            stripped = re.sub(r'^line console 0$', 'line con 0', stripped)

            # 4. Interface name normalization — IOS expands abbreviations in show run.
            #    e.g. "int e0/0" -> "interface Ethernet0/0" -> normalise to lowercase short form.
            def normalise_iface(m):
                name = m.group(1).lower()
                # Expand common abbreviations to full name
                replacements = [
                    (r'^et?h?e?r?n?e?t?(\d)', r'ethernet\1'),
                    (r'^fa?s?t?e?t?h?e?r?n?e?t?(\d)', r'fastethernet\1'),
                    (r'^gi?g?a?b?i?t?e?t?h?e?r?n?e?t?(\d)', r'gigabitethernet\1'),
                    (r'^se?r?i?a?l?(\d)', r'serial\1'),
                    (r'^lo?o?p?b?a?c?k?(\d)', r'loopback\1'),
                    (r'^vl?a?n?(\d)', r'vlan\1'),
                    (r'^tu?n?n?e?l?(\d)', r'tunnel\1'),
                ]
                for pattern, repl in replacements:
                    name = re.sub(pattern, repl, name)
                return 'interface ' + name
            stripped = re.sub(r'^interface (\S+)$', normalise_iface, stripped, flags=re.IGNORECASE)

            # ── Context tracking (indented subcommands) ──────────────────────
            if line.startswith(" ") or line.startswith("\t"):
                if current_context:
                    lines.append(f"{current_context} -> {stripped}")
                else:
                    lines.append(stripped)
            else:
                current_context = stripped
                lines.append(current_context)

        return set(lines)

    def _connect(self) -> ConnectHandler:
        netmiko_device_type = self.node_config["device_type"]
        if netmiko_device_type in ["cisco_iol_l2", "cisco_iol"]:
            netmiko_device_type = "cisco_ios_telnet"

        console_password = self.node_config.get("console_password", "")
        enable_secret = self.node_config.get("enable_secret", "")

        host = self.node_config["host"]
        port = int(self.node_config["console_port"])

        # Send Ctrl-Z to escape any config mode BEFORE Netmiko opens its session
        import socket as _socket
        try:
            s = _socket.socket(_socket.AF_INET, _socket.SOCK_STREAM)
            s.settimeout(3)
            s.connect((host, port))
            time.sleep(0.3)
            s.sendall(b"\x15")   # Ctrl-U: clear partial input
            time.sleep(0.1)
            s.sendall(b"\x1A")   # Ctrl-Z: exit ANY config sub-mode to enable#
            time.sleep(0.8)
            s.sendall(b"\r\n")
            time.sleep(0.3)
            s.close()
            time.sleep(0.5)      # Give IOS a moment to settle before Netmiko connects
        except Exception as e:
            logger.warning(f"Pre-connect cleanup failed for {self.node_name}: {e}")

        device = {
            "device_type": netmiko_device_type,
            "host": host,
            "port": port,
            "username": "",
            "password": console_password,
            "secret": enable_secret,
            "global_delay_factor": 2,
            "timeout": 30,
        }
        return ConnectHandler(**device)


    def fetch_actual_config(self, connection: ConnectHandler) -> str:
        """Fetch running config from the device. Base implementation."""
        if not connection.check_enable_mode():
            connection.enable()
            
        connection.send_command("terminal length 0", read_timeout=10)
        return connection.send_command("show run", read_timeout=60)

    def grade(self) -> dict:
        if not os.path.exists(self.solution_path):
            logger.info(f"Skipping {self.node_name}: no solution file.")
            return {"node": self.node_name, "passed": True, "error": f"No solution file found. Skipping."}

        with open(self.solution_path, "r") as f:
            solution_text = f.read()

        connection = None
        try:
            connection = self._connect()
            actual_text = self.fetch_actual_config(connection)
            
            expected_set = self.sanitize_config(solution_text)
            actual_set = self.sanitize_config(actual_text)
            
            missing_lines = []
            for expected_line in expected_set:
                matched = False
                exp_norm = " ".join(expected_line.split()).lower()
                for actual_line in actual_set:
                    act_norm = " ".join(actual_line.split()).lower()
                    if exp_norm == act_norm:
                        matched = True
                        break
                    # If expected is a subcommand without context (e.g. "ip address 1.1.1.1 255.255.255.0")
                    # but actual has context (e.g. "interface ethernet0/0 -> ip address 1.1.1.1 255.255.255.0")
                    if " -> " in act_norm:
                        parts = act_norm.split(" -> ", 1)
                        if len(parts) == 2 and exp_norm == parts[1].strip():
                            matched = True
                            break
                if not matched:
                    missing_lines.append(expected_line)

            passed = len(missing_lines) == 0

            return {
                "node": self.node_name,
                "passed": passed,
                "missing_lines": missing_lines
            }
        except (NetMikoTimeoutException, ConnectionRefusedError) as e:
            logger.error(f"Connection failed for {self.node_name}: {e}")
            return {"node": self.node_name, "passed": False, "error": f"Could not connect to {self.node_name}."}
        except Exception as e:
            logger.exception(f"Grading failed for {self.node_name}")
            return {"node": self.node_name, "passed": False, "error": str(e)}
        finally:
            if connection:
                connection.disconnect()


class IOSGrader(BaseGrader):
    def fetch_actual_config(self, connection: ConnectHandler) -> str:
        """Override to also fetch VLAN database for Cisco IOS devices."""
        actual_text = super().fetch_actual_config(connection)
        
        device_type = self.node_config.get("device_type", "")
        if "cisco_iol_l2" in device_type:
            try:
                vlan_text = connection.send_command("show vlan brief", read_timeout=10)
                for line in vlan_text.splitlines():
                    parts = line.strip().split()
                    if parts and parts[0].isdigit():
                        vid = int(parts[0])
                        if vid not in [1, 1002, 1003, 1004, 1005]:
                            actual_text += f"\nvlan {vid}\n"
            except Exception as e:
                logger.warning(f"Failed to fetch VLANs for {self.node_name}: {e}")
            
        return actual_text


class BehavioralGrader:
    def __init__(self, node_name: str, node_config: dict, checks: list):
        self.node_name = node_name
        self.node_config = node_config
        self.checks = checks

    def grade(self) -> dict:
        if not self.checks:
            return {"node": self.node_name, "passed": True, "missing_lines": []}

        import socket
        import time
        missing_lines = []
        host = self.node_config.get("host")
        port_val = self.node_config.get("console_port")
        if not host or not port_val:
             return {"node": self.node_name, "passed": False, "missing_lines": ["Missing host/port for node"]}
        port = int(port_val)

        for check in self.checks:
            if check.get("type") == "ping":
                target = check.get("target")
                desc = check.get("description", f"Ping {target}")
                
                try:
                    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    s.settimeout(3)
                    s.connect((host, port))
                    
                    s.sendall(b"\r\n")
                    time.sleep(0.5)
                    # flush the prompt
                    s.recv(1024)
                    
                    cmd = f"ping {target}\r\n"
                    s.sendall(cmd.encode("utf-8"))
                    
                    end_time = time.time() + 5
                    output = ""
                    success = False
                    while time.time() < end_time:
                        try:
                            data = s.recv(1024).decode("utf-8", errors="ignore")
                            output += data
                            # VPCS ping success is "bytes from", IOS ping success contains "!"
                            if "bytes from" in output.lower() or "!" in output:
                                success = True
                                break
                            if "not reachable" in output.lower() or "timeout" in output.lower() or "." in output:
                                break
                        except socket.timeout:
                            break
                    s.close()
                    
                    if not success:
                        missing_lines.append(f"Connectivity: {desc} failed.")
                except Exception as e:
                    logger.error(f"Behavioral grading failed for {self.node_name}: {e}")
                    missing_lines.append(f"Connectivity: {desc} failed (Connection Error).")
                    
        passed = len(missing_lines) == 0
        return {
            "node": self.node_name,
            "passed": passed,
            "missing_lines": missing_lines
        }

def get_grader_for_device(node_name: str, node_config: dict, solution_path: str) -> BaseGrader:
    """Factory to return the correct grader class based on device type."""
    device_type = node_config.get("device_type", "")
    if "cisco_iol" in device_type or "cisco_ios" in device_type:
        return IOSGrader(node_name, node_config, solution_path)
    return BaseGrader(node_name, node_config, solution_path)


def grade_lab(yaml_path: str, skip_tasks: list = None, lab_dir: str = None) -> dict:
    lab_def = load_lab_definition(yaml_path)
    lab_info = lab_def["lab"]
    
    if not lab_dir:
        lab_dir = os.path.dirname(os.path.abspath(yaml_path))

    nodes_map = {node["name"]: node for node in lab_info["nodes"]}
    all_results = []
    
    behavioral_checks = lab_info.get("checks", [])
    node_checks_map = {}
    for check in behavioral_checks:
        n = check.get("node")
        if n:
            node_checks_map.setdefault(n, []).append(check)
            
    # Track overall behavioral success
    behavioral_ran = len(behavioral_checks) > 0
    behavioral_passed = True

    for node_name, node_config in nodes_map.items():
        solution_path = os.path.join(lab_dir, f"solution_{node_name}.cfg")
        
        # 1. Config grading
        grader = get_grader_for_device(node_name, node_config, solution_path)
        result = grader.grade()
        
        # 2. Behavioral grading
        if node_name in node_checks_map:
            b_grader = BehavioralGrader(node_name, node_config, node_checks_map[node_name])
            b_result = b_grader.grade()
            
            if not b_result["passed"]:
                behavioral_passed = False
                
            if result.get("error", "").startswith("No solution file"):
                result = b_result
            else:
                # Merge hybrid results (initially)
                result["missing_lines"].extend(b_result.get("missing_lines", []))
                result["passed"] = result["passed"] and b_result["passed"]
                if "error" in b_result:
                    result["error"] = result.get("error", "") + " " + b_result["error"]
                    
        all_results.append(result)

    # 3. Behavioral Override: If behavioral checks ran and ALL passed, override config failures for the whole lab
    if behavioral_ran and behavioral_passed:
        for r in all_results:
            r["passed"] = True
            r["missing_lines"] = []
            if "No solution file" not in r.get("error", ""):
                r["error"] = ""

    passed = all(r["passed"] for r in all_results) if all_results else False

    return {
        "lab_id": lab_info["id"],
        "lab_title": lab_info["title"],
        "total_earned": 100 if passed else 0,
        "total_possible": 100,
        "percentage": 100 if passed else 0,
        "passed": passed,
        "node_results": all_results,
    }
