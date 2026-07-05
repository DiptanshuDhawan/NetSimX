import sqlite3
import os
import json

DB_FILE = os.path.join(os.path.dirname(__file__), "netlabx.db")

def get_db():
    """Get a database connection and return rows as dictionaries."""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the SQLite database with our tables."""
    conn = get_db()
    cursor = conn.cursor()
    
    # Create Tables
    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS labs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        topic TEXT NOT NULL,
        difficulty TEXT NOT NULL DEFAULT 'Beginner',
        description TEXT,
        gns3_project_path TEXT,
        yaml_path TEXT,
        estimated_time_minutes INTEGER DEFAULT 30,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lab_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lab_id INTEGER REFERENCES labs(id) ON DELETE CASCADE,
        gns3_project_id TEXT,
        status TEXT DEFAULT 'running',
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        stopped_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS lab_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER REFERENCES lab_sessions(id) ON DELETE CASCADE,
        lab_id INTEGER REFERENCES labs(id) ON DELETE CASCADE,
        score INTEGER NOT NULL,
        max_score INTEGER NOT NULL,
        results_json TEXT,
        graded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # Insert a dummy lab if the table is empty
    cursor.execute("SELECT COUNT(*) FROM labs")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO labs (slug, title, topic, difficulty, description, gns3_project_path, yaml_path)
        VALUES (
            'ospf-basic', 
            'Basic OSPF Configuration', 
            'OSPF', 
            'Beginner', 
            'Configure a basic OSPF adjacency between two routers.',
            '/root/GNS3/projects/0487245c-23b3-4b2d-8346-22ece7856a99',
            '../labs/ospf-basic/lab.yaml'
        )
        """)
    
    conn.commit()
    conn.close()

# Initialize DB on import
init_db()
