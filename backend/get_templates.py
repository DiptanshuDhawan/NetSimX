import requests

AUTH = ('admin', '')
URL = 'http://127.0.0.1:3080/v2/templates'

res = requests.get(URL, auth=AUTH)
print(res.status_code)
print(res.text)
