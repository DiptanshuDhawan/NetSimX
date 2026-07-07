import requests
import json
import time

AUTH = ('admin', 'password')
URL = 'http://127.0.0.1:3080/v2'

print("Connecting to local GNS3 server...")

try:
    projects = requests.get(f"{URL}/projects", auth=AUTH).json()
    for p in projects:
        if p["name"] == "comprehensive-lab":
            print(f"Deleting existing project {p['project_id']}...")
            requests.delete(f"{URL}/projects/{p['project_id']}", auth=AUTH)
            time.sleep(2)
except Exception as e:
    print("Error fetching/deleting projects:", e)
    exit(1)

print("Creating project 'comprehensive-lab'...")
res = requests.post(f"{URL}/projects", json={"name": "comprehensive-lab"}, auth=AUTH)
if res.status_code != 201:
    print("Failed to create project:", res.text)
    exit(1)
project_id = res.json()["project_id"]
print("Project created! ID:", project_id)

templates = requests.get(f"{URL}/templates", auth=AUTH).json()
router_temp = None
switch_temp = None
vpcs_temp = None

for t in templates:
    name = t.get("name", "").lower()
    t_type = t.get("template_type", "").lower()
    
    if "l2" in name or "switch" in name or "vios-l2" in name:
        if not switch_temp: switch_temp = t
    elif "iou" in name or "ios" in name or "router" in name or "vios" in name:
        if not router_temp: router_temp = t
    elif t_type == "vpcs":
        if not vpcs_temp: vpcs_temp = t

if not router_temp:
    print("No router template found! Using fallback.")
    router_temp = templates[0] if templates else None
if not switch_temp:
    print("No switch template found. Falling back to router template for Switch.")
    switch_temp = router_temp
if not vpcs_temp:
    print("No VPCS template found. Using router as fallback.")
    vpcs_temp = router_temp

# Create Nodes
print("Creating Nodes...")
r1_res = requests.post(f"{URL}/projects/{project_id}/templates/{router_temp['template_id']}", json={"x": 200, "y": -200, "name": "R1", "compute_id": "local"}, auth=AUTH)
r1 = r1_res.json()

s1_res = requests.post(f"{URL}/projects/{project_id}/templates/{switch_temp['template_id']}", json={"x": -100, "y": 0, "name": "S1", "compute_id": "local"}, auth=AUTH)
s1 = s1_res.json()

s2_res = requests.post(f"{URL}/projects/{project_id}/templates/{switch_temp['template_id']}", json={"x": 200, "y": 0, "name": "S2", "compute_id": "local"}, auth=AUTH)
s2 = s2_res.json()

pc0_res = requests.post(f"{URL}/projects/{project_id}/templates/{vpcs_temp['template_id']}", json={"x": -150, "y": 150, "name": "PC0", "compute_id": "local"}, auth=AUTH)
pc0 = pc0_res.json()

pc1_res = requests.post(f"{URL}/projects/{project_id}/templates/{vpcs_temp['template_id']}", json={"x": -50, "y": 150, "name": "PC1", "compute_id": "local"}, auth=AUTH)
pc1 = pc1_res.json()

pc2_res = requests.post(f"{URL}/projects/{project_id}/templates/{vpcs_temp['template_id']}", json={"x": 150, "y": 150, "name": "PC2", "compute_id": "local"}, auth=AUTH)
pc2 = pc2_res.json()

pc3_res = requests.post(f"{URL}/projects/{project_id}/templates/{vpcs_temp['template_id']}", json={"x": 250, "y": 150, "name": "PC3", "compute_id": "local"}, auth=AUTH)
pc3 = pc3_res.json()

# Links
print("Creating Links...")
def create_link(n1, p1, n2, p2):
    link = {
        "nodes": [
            {"node_id": n1["node_id"], "adapter_number": 0, "port_number": p1},
            {"node_id": n2["node_id"], "adapter_number": 0, "port_number": p2}
        ]
    }
    requests.post(f"{URL}/projects/{project_id}/links", json=link, auth=AUTH)

# R1 e0/0 <-> S2 e0/0 (Router on a stick)
create_link(r1, 0, s2, 0)

# S1 e0/0 <-> S2 e0/1 (Inter-switch Trunk)
create_link(s1, 0, s2, 1)

# S1 Access Ports
create_link(s1, 1, pc0, 0) # VLAN 10 (Blue)
create_link(s1, 2, pc1, 0) # VLAN 20 (Red)

# S2 Access Ports
create_link(s2, 2, pc2, 0) # VLAN 30 (Purple)
create_link(s2, 3, pc3, 0) # VLAN 20 (Red)

print("Starting all nodes...")
requests.post(f"{URL}/projects/{project_id}/nodes/start", auth=AUTH)
print("Topology setup complete!")
