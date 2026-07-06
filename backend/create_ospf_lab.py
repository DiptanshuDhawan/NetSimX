import requests

AUTH = ('admin', 'password')
URL = 'http://127.0.0.1:3080/v2'

print("Connecting to local GNS3 server...")

# Delete old project if exists
try:
    projects = requests.get(f"{URL}/projects", auth=AUTH).json()
    for p in projects:
        if p["name"] == "ospf-basic":
            print(f"Deleting existing project {p['project_id']}...")
            requests.delete(f"{URL}/projects/{p['project_id']}", auth=AUTH)
except Exception as e:
    print("Error fetching/deleting projects:", e)
    exit(1)

# Create project
print("Creating project 'ospf-basic'...")
res = requests.post(f"{URL}/projects", json={"name": "ospf-basic"}, auth=AUTH)
if res.status_code != 201:
    print("Failed to create project:", res.text)
    exit(1)
project_id = res.json()["project_id"]
print("Project created! ID:", project_id)

# Get templates
templates = requests.get(f"{URL}/templates", auth=AUTH).json()
iou_temp = None
cloud_temp = None
for t in templates:
    name = t.get("name", "").lower()
    if "iou" in name or "ios" in name or "router" in name or "i86bi" in name or "viptela" in name or "vios" in name:
        if not iou_temp: iou_temp = t
    if "cloud" in name or "nat" in name:
        if not cloud_temp: cloud_temp = t

if not iou_temp:
    print("Could not find router template. Using VPCS as fallback for frontend development.")
    iou_temp = [t for t in templates if t.get("template_type") == "vpcs"][0]

if not cloud_temp:
    print("Could not find cloud template, falling back to any cloud...")
    cloud_temp = [t for t in templates if t.get("template_type") == "cloud"][0]

print("Using Router Template:", iou_temp["name"])
print("Using Cloud Template:", cloud_temp["name"])

# Create Nodes
print("Creating Nodes...")
iou1_res = requests.post(f"{URL}/projects/{project_id}/templates/{iou_temp['template_id']}", json={"x": -100, "y": 0, "name": "IOU1", "compute_id": "local"}, auth=AUTH)
if iou1_res.status_code != 201:
    print("Failed to create IOU1:", iou1_res.text)
    exit(1)
iou1 = iou1_res.json()

iou2_res = requests.post(f"{URL}/projects/{project_id}/templates/{iou_temp['template_id']}", json={"x": 100, "y": 0, "name": "IOU2", "compute_id": "local"}, auth=AUTH)
if iou2_res.status_code != 201:
    print("Failed to create IOU2:", iou2_res.text)
    exit(1)
iou2 = iou2_res.json()

cloud_res = requests.post(f"{URL}/projects/{project_id}/templates/{cloud_temp['template_id']}", json={"x": 300, "y": 0, "name": "Cloud", "compute_id": "local"}, auth=AUTH)
if cloud_res.status_code != 201:
    print("Failed to create Cloud:", cloud_res.text)
    exit(1)
cloud = cloud_res.json()

# Links
print("Creating Links...")
# IOU1 to IOU2
link1 = {
    "nodes": [
        {"node_id": iou1["node_id"], "adapter_number": 0, "port_number": 0},
        {"node_id": iou2["node_id"], "adapter_number": 0, "port_number": 0} # VPCS usually uses port 0
    ]
}
res_l1 = requests.post(f"{URL}/projects/{project_id}/links", json=link1, auth=AUTH)
if res_l1.status_code != 201:
    print("Failed to create link 1:", res_l1.text)

print("Starting all nodes...")
requests.post(f"{URL}/projects/{project_id}/nodes/start", auth=AUTH)

print("Topology setup complete!")
