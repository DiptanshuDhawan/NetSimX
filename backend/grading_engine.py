"""
NetLabX Core Grading Engine
Connects to routers via Telnet, fetches startup-config, and compares with solution config.
"""

import yaml
import sys
import os

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
    Create a Netmiko connection to a GNS3 router via Telnet.
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
    Using a set means order doesn't matter, and we can check for subsets.
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
        lines.append(line)
    return set(lines)


def run_node_verification(connection: ConnectHandler, node_name: str, lab_dir: str) -> dict:
    """
    Fetch the startup config and compare it with the solution config for the node.
    """
    solution_path = os.path.join(lab_dir, f"solution_{node_name}.cfg")
    
    if not os.path.exists(solution_path):
        return {
            "node": node_name,
            "passed": True,  # If no solution config is provided, assume no grading required for this node
            "error": f"No solution file found at {solution_path}. Skipping."
        }
        
    with open(solution_path, "r") as f:
        solution_text = f.read()

    try:
        if connection.check_config_mode():
            connection.send_command("do write", read_timeout=30)
        else:
            if not connection.check_enable_mode():
                connection.enable()
            connection.send_command("write memory", read_timeout=30)

        actual_text = connection.send_command("show startup-config", read_timeout=30)
        
        expected_set = sanitize_config(solution_text)
        actual_set = sanitize_config(actual_text)
        
        # We check if the expected lines are a subset of the actual lines.
        # This allows students to have extra config lines without failing.
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


def grade_lab(yaml_path: str, skip_tasks: list = None) -> dict:
    """
    Main grading function. 
    Connects to all nodes, checks configs, and returns a single Pass/Fail result.
    """
    lab_def = load_lab_definition(yaml_path)
    lab_info = lab_def["lab"]
    lab_dir = os.path.dirname(os.path.abspath(yaml_path))

    print(f"\n{'='*60}")
    print(f"  GRADING LAB: {lab_info['title']}")
    print(f"{'='*60}\n")

    nodes_map = {node["name"]: node for node in lab_info["nodes"]}
    all_results = []
    
    # We will grade every node defined in the lab
    for node_name, node_config in nodes_map.items():
        print(f"  Checking {node_name} config...")
        try:
            print(f"    Connecting to {node_name} (port {node_config['console_port']})...")
            conn = connect_to_node(node_config)
            print(f"    ✅ Connected to {node_name}")
            
            result = run_node_verification(conn, node_name, lab_dir)
            all_results.append(result)
            
            if result["passed"]:
                print(f"    ✅ Config matched solution!")
            else:
                print(f"    ❌ Config mismatch.")
                if "missing_lines" in result and result["missing_lines"]:
                    print(f"       Missing {len(result['missing_lines'])} expected lines (e.g. '{result['missing_lines'][0]}')")
                elif "error" in result:
                    print(f"       Error: {result['error']}")
                    
            conn.disconnect()
            
        except (NetMikoTimeoutException, ConnectionRefusedError) as e:
            print(f"    ❌ FAILED to connect to {node_name}: {e}")
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

    print(f"\n{'='*60}")
    print(f"  STATUS: {'🎉 PASSED' if final_report['passed'] else '📚 NEEDS MORE WORK'}")
    print(f"{'='*60}\n")

    return final_report


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python grading_engine.py <path_to_lab.yaml>")
        sys.exit(1)

    yaml_path = sys.argv[1]
    report = grade_lab(yaml_path)
