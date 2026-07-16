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
        for line in config_text.splitlines():
            stripped = line.strip()
            if not stripped or stripped.startswith("!") or stripped.startswith("Building configuration") \
                    or stripped.startswith("Current configuration") or stripped.startswith("ntp clock-period") \
                    or "NVRAM" in stripped or "bytes" in stripped or stripped.startswith("Last configuration change") \
                    or stripped.startswith("version") or stripped == "end":
                continue

            # Normalize hashed passwords and banners to ignore salts and delimiters
            stripped = re.sub(r'(secret \d+) .*', r'\1', stripped)
            stripped = re.sub(r'(password \d+) .*', r'\1', stripped)
            stripped = re.sub(r'^banner motd .*', r'banner motd', stripped)

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

        # Read grading credentials from lab.yaml node definition.
        # These are set to the passwords the student is instructed to configure,
        # so the grader can authenticate after the student completes the lab.
        console_password = self.node_config.get("console_password", "")
        enable_secret = self.node_config.get("enable_secret", "")

        device = {
            "device_type": netmiko_device_type,
            "host": self.node_config["host"],
            "port": self.node_config["console_port"],
            "username": "",
            "password": console_password,
            "secret": enable_secret,
            "global_delay_factor": 2,
            "timeout": 30,
        }
        return ConnectHandler(**device)

    def fetch_actual_config(self, connection: ConnectHandler) -> str:
        """Fetch running config from the device. Base implementation."""
        connection.write_channel("\x15\r\n")
        time.sleep(0.5)
        
        try:
            if connection.check_config_mode():
                connection.exit_config_mode()
        except Exception:
            pass
            
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
    
    for node_name, node_config in nodes_map.items():
        solution_path = os.path.join(lab_dir, f"solution_{node_name}.cfg")
        grader = get_grader_for_device(node_name, node_config, solution_path)
        result = grader.grade()
        all_results.append(result)

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
