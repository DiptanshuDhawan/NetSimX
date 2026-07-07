"""
NetLabX Core Grading Engine
Connects to routers, issues 'show run', and compares with solution config.
"""

import yaml
import sys
import os
import time

# Fix Windows console emoji printing
sys.stdout.reconfigure(encoding='utf-8')

from netmiko import ConnectHandler
from netmiko.exceptions import NetMikoTimeoutException, AuthenticationException


def load_lab_definition(yaml_path: str) -> dict:
    """Load and parse a lab YAML definition file."""
    with open(yaml_path, "r") as f:
        return yaml.safe_load(f)


def connect_to_node(node: dict) -> ConnectHandler:
    """
    Create a Netmiko connection to a GNS3 router.
    """
    device = {
        "device_type": node["device_type"],
        "host": node["host"],
        "port": node["console_port"],
        "username": "",
        "password": "",
        "secret": "",
        "global_delay_factor": 2,
        "timeout": 30,
    }
    return ConnectHandler(**device)


def sanitize_config(config_text: str) -> set:
    """
    Cleans up a Cisco IOS config and returns a set of significant lines.
    Using a set means order doesn't matter, and we check for subsets.
    """
    lines = []
    for line in config_text.splitlines():
        line = line.strip()
        if not line or line.startswith("!"):
            continue
        if line.startswith("Building configuration"):
            continue
        if line.startswith("Current configuration"):
            continue
        if line.startswith("ntp clock-period"):
            continue
        if "NVRAM" in line or "bytes" in line:
            continue
        if line.startswith("Last configuration change"):
            continue
        if line.startswith("version"):
            continue
        if line == "end":
            continue
        lines.append(line)
    return set(lines)


def run_node_verification(connection: ConnectHandler, node_name: str, lab_dir: str) -> dict:
    """
    Enter enable mode, save config, fetch show run, and compare.
    """
    solution_path = os.path.join(lab_dir, f"solution_{node_name}.cfg")
    
    if not os.path.exists(solution_path):
        return {
            "node": node_name,
            "passed": True,  # If no solution config is provided, skip grading
            "error": f"No solution file found at {solution_path}. Skipping."
        }
        
    with open(solution_path, "r") as f:
        solution_text = f.read()

    try:
        # Netmiko's exit_config_mode() can crash if it connects while already in config mode 
        # (it sets base_prompt to the config prompt and then fails to match it after exiting).
        # We use a raw write_channel to guarantee we drop to exec mode reliably.
        connection.write_channel("\r\nend\r\n")
        time.sleep(1)
        connection.set_base_prompt()
            
        # Default is user exec mode, so enter enable mode
        if not connection.check_enable_mode():
            connection.enable()
            
        # Disable pagination so show run output is never truncated by --More--
        connection.send_command("terminal length 0", read_timeout=10)

        # Issue show run to see the configuration
        actual_text = connection.send_command("show run", read_timeout=60)
        
        # Compare them
        expected_set = sanitize_config(solution_text)
        actual_set = sanitize_config(actual_text)
        
        # Check if the expected lines are a subset of the actual lines.
        missing_lines = expected_set - actual_set
        passed = len(missing_lines) == 0

        return {
            "node": node_name,
            "passed": passed,
            "missing_lines": list(missing_lines)
        }
    except Exception as e:
        return {
            "node": node_name,
            "passed": False,
            "error": str(e)
        }


def grade_lab(yaml_path: str, skip_tasks: list = None, lab_dir: str = None) -> dict:
    """
    Main grading function. 
    Connects to all nodes, checks configs, and returns a single Pass/Fail result.
    """
    lab_def = load_lab_definition(yaml_path)
    lab_info = lab_def["lab"]
    
    if not lab_dir:
        lab_dir = os.path.dirname(os.path.abspath(yaml_path))

    nodes_map = {node["name"]: node for node in lab_info["nodes"]}
    all_results = []
    
    # We will grade every node defined in the lab
    for node_name, node_config in nodes_map.items():
        solution_path = os.path.join(lab_dir, f"solution_{node_name}.cfg")
        if not os.path.exists(solution_path):
            all_results.append({
                "node": node_name,
                "passed": True,
                "error": f"No solution file found at {solution_path}. Skipping."
            })
            continue

        try:
            conn = connect_to_node(node_config)
            result = run_node_verification(conn, node_name, lab_dir)
            all_results.append(result)
            conn.disconnect()
        except (NetMikoTimeoutException, ConnectionRefusedError) as e:
            all_results.append({
                "node": node_name,
                "passed": False,
                "error": f"Could not connect to {node_name} — make sure the lab is running and routers have finished booting. ({type(e).__name__})"
            })
        except Exception as e:
            all_results.append({
                "node": node_name,
                "passed": False,
                "error": f"Connection failed: {e}"
            })

    # Calculate final score: all nodes must pass
    passed = all(r["passed"] for r in all_results) if all_results else False

    final_report = {
        "lab_id": lab_info["id"],
        "lab_title": lab_info["title"],
        "total_earned": 100 if passed else 0,
        "total_possible": 100,
        "percentage": 100 if passed else 0,
        "passed": passed,
        "node_results": all_results,
    }

    return final_report
