import sqlite3
import os

DB_FILE = os.path.join(os.path.dirname(__file__), "db", "netlabx.db")

conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()

lab = (
    'comprehensive-lab', 
    'Comprehensive CCNA Skills Lab', 
    'Routing & Switching', 
    'Advanced', 
    'Combine multiple core CCNA concepts to build a fully functional enterprise branch network. Configure device security, VLANs, Router-on-a-stick, DHCP, and OSPF routing.', 
    '', 
    '../labs/comprehensive-lab/lab.yaml', 
    60
)

cursor.execute("SELECT COUNT(*) FROM labs WHERE slug = ?", (lab[0],))
if cursor.fetchone()[0] == 0:
    cursor.execute("""
        INSERT INTO labs (slug, title, topic, difficulty, description, gns3_project_path, yaml_path, estimated_time_minutes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, lab)
    print("Successfully inserted comprehensive lab!")
else:
    print("Lab already exists in DB.")

conn.commit()
conn.close()
