import sys
import os
import requests

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from services.gns3_service import get_gns3_server
import gns3fy

server = get_gns3_server()
# Get a project
projects = server.get_projects()
if not projects:
    print("No projects.")
    sys.exit(1)
p = projects[0]
project_id = p["project_id"]
print(f"Testing on project {project_id} ({p['name']})")
project = gns3fy.Project(project_id=project_id, connector=server)
project.get()

# Stop project
project.stop_nodes()

import time
time.sleep(2)

node_id = project.nodes[0].node_id
url = f"{server.base_url}/projects/{project_id}/nodes/{node_id}/wipe"
print(f"POST {url}")
resp = requests.post(url, auth=(server.user, server.cred))
print(resp.status_code, resp.text)
