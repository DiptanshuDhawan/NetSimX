import sqlite3
import json

conn = sqlite3.connect('/app/db/netlabx.db')
conn.row_factory = sqlite3.Row

# List all tables
tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
print("Tables:", [t[0] for t in tables])

# Check each table
for table in [t[0] for t in tables]:
    print(f"\n--- {table} ---")
    try:
        rows = conn.execute(f"SELECT * FROM {table} ORDER BY id DESC LIMIT 3").fetchall()
        for row in rows:
            print(dict(row))
    except Exception as e:
        print(f"Error: {e}")

conn.close()
