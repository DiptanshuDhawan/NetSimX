"""
NetLabX Core Grading Engine
Connects to routers via Telnet, runs verification commands, and grades labs.
"""

import yaml
import sys

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
    GNS3 exposes console ports as raw Telnet (no username/password needed).
    """
    device = {
        "device_type": node["device_type"],  # "cisco_ios_telnet"
        "host": node["host"],
        "port": node["console_port"],
        "username": "",
        "password": "",
        "secret": "",       # enable password (empty for GNS3 by default)
        "global_delay_factor": 2,
        "timeout": 30,
    }
    return ConnectHandler(**device)


def run_verification(connection: ConnectHandler, task: dict) -> dict:
    """
    Run a single verification task against a connected router.
    Returns a dict with 'passed' bool, 'output', and 'expected'.
    """
    command = task["verification"]["command"]
    expected = task["verification"]["expect_contains"]

    try:
        # Save the config as requested. If in config mode, use 'do write' and prepend 'do' to the command.
        if connection.check_config_mode():
            connection.send_command("do write", read_timeout=30)
            if not command.startswith("do "):
                command = f"do {command}"
        else:
            if not connection.check_enable_mode():
                connection.enable()
            connection.send_command("write memory", read_timeout=30)

        output = connection.send_command(command, read_timeout=30)
        passed = expected.lower() in output.lower()

        return {
            "task_id": task["id"],
            "description": task["description"],
            "points_possible": task["points"],
            "points_earned": task["points"] if passed else 0,
            "passed": passed,
            "command_run": command,
            "expected": expected,
            "output_snippet": output[:300],  # first 300 chars for display
            "hint": task.get("hint", "No hint available."),
        }
    except Exception as e:
        return {
            "task_id": task["id"],
            "description": task["description"],
            "points_possible": task["points"],
            "points_earned": 0,
            "passed": False,
            "command_run": command,
            "expected": expected,
            "output_snippet": f"ERROR: {str(e)}",
            "hint": task.get("hint", "No hint available."),
        }


def grade_lab(yaml_path: str, skip_tasks: list = None) -> dict:
    """
    Main grading function. Loads a lab YAML, connects to all nodes,
    runs all verification tasks, and returns a full results dict.
    """
    lab_def = load_lab_definition(yaml_path)
    lab_info = lab_def["lab"]

    print(f"\n{'='*60}")
    print(f"  GRADING LAB: {lab_info['title']}")
    print(f"{'='*60}\n")

    # Build a node lookup map: { "R1": node_config_dict }
    nodes_map = {node["name"]: node for node in lab_info["nodes"]}

    # Store results for all tasks
    all_results = []
    connections = {}  # cache open connections per node name

    for task in lab_info["tasks"]:
        if skip_tasks and task["id"] in skip_tasks:
            continue
            
        node_name = task["verification"]["node"]
        node_config = nodes_map[node_name]

        print(f"  Task {task['id']}: {task['description'][:60]}...")

        # Reuse connection if already open, otherwise create a new one
        if node_name not in connections:
            print(f"    Connecting to {node_name} (port {node_config['console_port']})...")
            try:
                conn = connect_to_node(node_config)
                connections[node_name] = conn
                print(f"    ✅ Connected to {node_name}")
            except (NetMikoTimeoutException, ConnectionRefusedError) as e:
                print(f"    ❌ FAILED to connect to {node_name}: {e}")
                all_results.append({
                    "task_id": task["id"],
                    "description": task["description"],
                    "points_possible": task["points"],
                    "points_earned": 0,
                    "passed": False,
                    "command_run": task["verification"]["command"],
                    "expected": task["verification"]["expect_contains"],
                    "output_snippet": f"Connection failed: {e}",
                    "hint": task.get("hint", ""),
                })
                continue

        result = run_verification(connections[node_name], task)
        all_results.append(result)

        status_icon = "✅ PASS" if result["passed"] else "❌ FAIL"
        print(f"    {status_icon} ({result['points_earned']}/{result['points_possible']} pts)")

    # Close all connections cleanly
    for node_name, conn in connections.items():
        conn.disconnect()
        print(f"\n  Disconnected from {node_name}")

    # Calculate final score
    total_earned = sum(r["points_earned"] for r in all_results)
    total_possible = sum(r["points_possible"] for r in all_results)
    percentage = round((total_earned / total_possible) * 100, 1) if total_possible > 0 else 0

    final_report = {
        "lab_id": lab_info["id"],
        "lab_title": lab_info["title"],
        "total_earned": total_earned,
        "total_possible": total_possible,
        "percentage": percentage,
        "passed": percentage >= 70,
        "tasks": all_results,
    }

    # Print summary
    print(f"\n{'='*60}")
    print(f"  FINAL SCORE: {total_earned}/{total_possible} ({percentage}%)")
    print(f"  STATUS: {'🎉 PASSED' if final_report['passed'] else '📚 NEEDS MORE WORK'}")
    print(f"{'='*60}\n")

    return final_report


# ── CLI Runner ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    """
    Usage: python grading_engine.py <path_to_lab.yaml>
    Example: python grading_engine.py ../labs/ospf-basic/lab.yaml
    """
    if len(sys.argv) < 2:
        print("Usage: python grading_engine.py <path_to_lab.yaml>")
        sys.exit(1)

    yaml_path = sys.argv[1]
    report = grade_lab(yaml_path)

    # Print detailed task breakdown
    print("\n── TASK BREAKDOWN ──────────────────────────────────────────")
    for task in report["tasks"]:
        icon = "✅" if task["passed"] else "❌"
        print(f"\n  {icon} Task {task['task_id']}: {task['description']}")
        print(f"     Points: {task['points_earned']}/{task['points_possible']}")
        if not task["passed"]:
            print(f"     Hint: {task['hint']}")
