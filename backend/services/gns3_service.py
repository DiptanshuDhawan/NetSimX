"""
GNS3 Service — Manages GNS3 projects via the GNS3 REST API.
Uses the gns3fy library for convenient Python bindings.
"""

import os
import time
import gns3fy
from dotenv import load_dotenv

load_dotenv()

GNS3_HOST = os.getenv("GNS3_HOST", "127.0.0.1")
GNS3_PORT = int(os.getenv("GNS3_PORT", 3080))
GNS3_USER = os.getenv("GNS3_USER", "admin")
GNS3_PASSWORD = os.getenv("GNS3_PASSWORD", "")


def get_gns3_server() -> gns3fy.Gns3Connector:
    """Return a connected GNS3 server instance."""
    return gns3fy.Gns3Connector(
        url=f"http://{GNS3_HOST}:{GNS3_PORT}",
        user=GNS3_USER,
        cred=GNS3_PASSWORD,
    )


def start_lab_project(gns3_project_path: str) -> dict:
    """
    Open and start a GNS3 project. Returns project info including the project_id.
    The project_id is used to manage this session.
    """
    server = get_gns3_server()

    # Load the project from file/server
    lab = gns3fy.Project(
        project_id=gns3_project_path,
        connector=server,
    )
    lab.get()

    # Open the project if it's not already open
    if lab.status != "opened":
        lab.open()

    # Start all nodes in the project
    lab.start_nodes()

    return {
        "project_id": lab.project_id,
        "project_name": lab.name,
        "status": lab.status,
    }


def stop_lab_project(project_id: str):
    """Stop all nodes and close a GNS3 project to free RAM."""
    server = get_gns3_server()
    lab = gns3fy.Project(project_id=project_id, connector=server)
    lab.get()
    if lab.status == "opened":
        lab.stop_nodes()
        lab.close()


def get_node_console_port(project_id: str, node_name: str) -> int:
    """Get the current console Telnet port for a named node in a project."""
    server = get_gns3_server()
    lab = gns3fy.Project(project_id=project_id, connector=server)
    lab.get()

    for node in lab.nodes:
        if node.name == node_name:
            return node.console

    raise ValueError(f"Node '{node_name}' not found in project '{project_id}'")


def push_startup_config(project_id: str, node_name: str, config_path: str):
    """
    Push an initial (possibly broken) configuration to a router
    so every student starts from the same baseline.
    """
    import telnetlib
    import time

    port = get_node_console_port(project_id, node_name)

    with open(config_path, "r") as f:
        config_lines = f.read().splitlines()

    # Wait for router to be ready
    time.sleep(5)

    # Connect via Telnet and paste config line by line
    with telnetlib.Telnet(GNS3_HOST, port, timeout=30) as tn:
        # Flush any stale console buffer history
        time.sleep(1)
        tn.read_very_eager()

        # Actively poll for a prompt by sending Enter every 2 seconds
        prompt_found = False
        for _ in range(25): # Wait up to 50 seconds
            try:
                tn.write(b"\r\n")
                match_idx, match, text = tn.expect([b"\[yes/no\]", b">", b"#", b"initial configuration dialog"], timeout=2)
                if match_idx >= 0:
                    prompt_found = True
                    if match_idx == 0 or match_idx == 3:
                        tn.write(b"no\r\n")
                        tn.expect([b">", b"#"], timeout=30)
                    break
            except Exception:
                pass

        if not prompt_found:
            print(f"Warning: Could not find prompt for {node_name} after 50s. Attempting to push config anyway.")

        tn.write(b"\r\n")
        time.sleep(1)
        tn.write(b"enable\r\n")
        time.sleep(0.5)
        tn.write(b"configure terminal\r\n")
        time.sleep(0.5)

        for line in config_lines:
            tn.write(line.encode("ascii") + b"\r\n")
            time.sleep(0.1)

        tn.write(b"end\r\n")
        time.sleep(0.5)
        tn.write(b"write memory\r\n")
        # Wait for NVRAM write to finish
        try:
            tn.expect([b"\[OK\]", b"#"], timeout=10)
        except:
            time.sleep(2)
