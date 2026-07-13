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


import yaml

def start_lab_project(lab_slug: str, lab_yaml_path: str = None) -> dict:
    """
    Open and start a GNS3 project. If the project does not exist,
    create it dynamically from lab_yaml_path.
    Returns project info including the project_id.
    """
    server = get_gns3_server()

    # Search for project by name (lab_slug)
    projects = server.get_projects()
    lab = None
    for p in projects:
        if p["name"] == lab_slug:
            lab = gns3fy.Project(project_id=p["project_id"], connector=server)
            lab.get()
            break

    if not lab:
        import logging
        import yaml
        logging.getLogger("netlabx.gns3").info(f"Project '{lab_slug}' not found on GNS3 server. Auto-provisioning from YAML...")
        
        if not lab_yaml_path or not os.path.exists(lab_yaml_path):
            raise ValueError(f"Cannot auto-provision: lab YAML '{lab_yaml_path}' not found.")
            
        with open(lab_yaml_path, "r") as f:
            lab_def = yaml.safe_load(f)["lab"]
            
        # Create project
        lab = gns3fy.Project(name=lab_slug, connector=server)
        lab.create()
        
        # Create nodes
        created_nodes = {}
        for node in lab_def.get("nodes", []):
            device_type = node.get("device_type", "cisco_ios_telnet")
            
            # GNS3 built-in template is uppercase "VPCS"
            if device_type.lower() == "vpcs":
                device_type = "VPCS"
            
            n = gns3fy.Node(
                project_id=lab.project_id,
                connector=server,
                name=node["name"],
                template=device_type,
                compute_id="local"
            )
            n.create()
            created_nodes[node["name"]] = n
            
            # Auto-Push Startup Config if present
            config_path = os.path.join(os.path.dirname(lab_yaml_path), "configs", f"{node['name']}-startup.cfg")
            if os.path.exists(config_path):
                import requests
                try:
                    with open(config_path, "rb") as cfg_file:
                        config_content = cfg_file.read()
                    
                    upload_url = f"http://{GNS3_HOST}:{GNS3_PORT}/v2/projects/{lab.project_id}/nodes/{n.node_id}/files/startup-config.cfg"
                    auth = (GNS3_USER, GNS3_PASSWORD) if GNS3_USER and GNS3_PASSWORD else None
                    res = requests.post(upload_url, data=config_content, auth=auth)
                    res.raise_for_status()
                    logging.getLogger("netlabx.gns3").info(f"Pushed startup config for {node['name']}")
                except Exception as e:
                    logging.getLogger("netlabx.gns3").error(f"Failed to push config for {node['name']}: {e}")
            
        # Create links
        for link in lab_def.get("links", []):
            if isinstance(link, list) and len(link) == 4:
                n1_name, p1_name, n2_name, p2_name = link
                n1 = created_nodes[n1_name]
                n2 = created_nodes[n2_name]
                
                def parse_port(port_str):
                    if port_str.lower().startswith("ethernet") or port_str.lower().startswith("e"):
                        nums = port_str.replace("Ethernet", "").replace("e", "").split("/")
                        if len(nums) == 2:
                            return int(nums[0]), int(nums[1])
                    return 0, 0
                    
                a1, p1 = parse_port(p1_name)
                a2, p2 = parse_port(p2_name)
                
                l = gns3fy.Link(
                    project_id=lab.project_id,
                    connector=server,
                    nodes=[
                        {"node_id": n1.node_id, "adapter_number": a1, "port_number": p1},
                        {"node_id": n2.node_id, "adapter_number": a2, "port_number": p2}
                    ]
                )
                l.create()
                n1.get()
                n2.get()


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
    import requests

    try:
        lab.get()
    except requests.exceptions.HTTPError as e:
        if "404" in str(e):
            raise ValueError(f"Project '{project_id}' not found in GNS3 (it may have been deleted).")
        raise e

    for node in lab.nodes:
        if node.name == node_name:
            return node.console

    raise ValueError(f"Node '{node_name}' not found in project '{project_id}'")


def get_lab_status(project_id: str) -> dict:
    """Get the status of all nodes and links in a project."""
    server = get_gns3_server()
    lab = gns3fy.Project(project_id=project_id, connector=server)
    lab.get()
    
    nodes_status = []
    for node in lab.nodes:
        nodes_status.append({"name": node.name, "status": node.status})
        
    link_state = "up" if all(n["status"] == "started" for n in nodes_status) else "down"
    
    return {
        "nodes": nodes_status,
        "links": []
    }


def reset_lab_project(project_id: str):
    """Stop and start all nodes in a project to reset them."""
    server = get_gns3_server()
    lab = gns3fy.Project(project_id=project_id, connector=server)
    lab.get()
    lab.stop_nodes()
    lab.start_nodes()


