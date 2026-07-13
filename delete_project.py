import urllib.request, json
GNS3_API = 'http://localhost:3080/v2'
projs = json.loads(urllib.request.urlopen(GNS3_API + '/projects').read())
proj = [p for p in projs if p['name'] == 'ntp-fundamentals']
if proj:
    proj_id = proj[0]['project_id']
    req = urllib.request.Request(f"{GNS3_API}/projects/{proj_id}", method='DELETE')
    urllib.request.urlopen(req)
    print(f'Deleted project {proj_id}')
else:
    print('Project not found')
