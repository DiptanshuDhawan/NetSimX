import sys
import os
import requests
import time

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from services.gns3_service import get_gns3_server
import gns3fy

server = get_gns3_server()
projects = server.get_projects()
if not projects:
    print("No projects.")
    sys.exit(1)

p = projects[0]
project_id = p["project_id"]
print(f"Testing on project {project_id} ({p['name']})")
project = gns3fy.Project(project_id=project_id, connector=server)
project.get()

if project.status != "opened":
    print("Opening project...")
    project.open()

project.stop_nodes()
time.sleep(1)

for node in project.nodes:
    wipe_url = f"{server.base_url}/projects/{project_id}/nodes/{node.node_id}/wipe"
    print(f"POST {wipe_url}")
    resp = requests.post(wipe_url, auth=(server.user, server.cred))
    print(resp.status_code, resp.text)

print("Starting nodes to verify...")
project.start_nodes()
