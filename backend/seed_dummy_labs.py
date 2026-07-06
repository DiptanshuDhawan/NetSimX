import sqlite3
import os

DB_FILE = os.path.join(os.path.dirname(__file__), "db", "netlabx.db")

conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()

dummy_labs = [
    ('bgp-peering', 'BGP Peering & Routing', 'Routing', 'Intermediate', 'Configure eBGP between two autonomous systems and advertise loopbacks.', '', '../labs/bgp-peering/lab.yaml', 45),
    ('vlan-trunking', 'VLANs and Trunking (802.1Q)', 'Switching', 'Beginner', 'Configure access ports, VLANs, and 802.1Q trunks between two switches.', '', '../labs/vlan-trunking/lab.yaml', 25),
    ('ipsec-vpn', 'Site-to-Site IPsec VPN', 'Security', 'Advanced', 'Build a secure IPsec tunnel between two branch offices over the internet.', '', '../labs/ipsec-vpn/lab.yaml', 60),
    ('ansible-intro', 'Intro to Network Automation', 'Automation', 'Beginner', 'Use Ansible to automatically push configuration to 5 routers simultaneously.', '', '../labs/ansible-intro/lab.yaml', 40),
    ('wireless-wlc', 'WLC Basic Provisioning', 'Wireless', 'Intermediate', 'Configure a Cisco WLC to broadcast a new SSID and authenticate clients.', '', '../labs/wireless-wlc/lab.yaml', 30),
]

for lab in dummy_labs:
    # check if slug already exists to avoid unique constraint errors if run multiple times
    cursor.execute("SELECT COUNT(*) FROM labs WHERE slug = ?", (lab[0],))
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO labs (slug, title, topic, difficulty, description, gns3_project_path, yaml_path, estimated_time_minutes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, lab)

conn.commit()
conn.close()
print("Successfully inserted 5 dummy labs!")
