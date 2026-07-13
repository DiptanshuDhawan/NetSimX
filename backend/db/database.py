import sqlite3
import os
import json

# Ensure db directory exists
os.makedirs("db", exist_ok=True)

def get_db():
    """Get a database connection and return rows as dictionaries."""
    conn = sqlite3.connect("db/netlabx.db")
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
    
    # Auto-discover labs from the labs/ directory
    import glob
    import yaml
    
    # labs directory might be ../labs or ./labs depending on how backend is run
    labs_dir = os.environ.get("LABS_DIR", "../labs")
    
    # Check if labs table is empty
    cursor.execute("SELECT COUNT(*) FROM labs")
    if cursor.fetchone()[0] == 0:
        if os.path.exists(labs_dir):
            for lab_path in glob.glob(os.path.join(labs_dir, "*", "lab.yaml")):
                lab_slug = os.path.basename(os.path.dirname(lab_path))
                
                # Load metadata from yaml
                try:
                    with open(lab_path, "r") as f:
                        lab_def = yaml.safe_load(f).get("lab", {})
                        
                    cursor.execute("""
                    INSERT INTO labs (slug, title, topic, difficulty, description, yaml_path)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """, (
                        lab_slug,
                        lab_def.get("title", lab_slug.replace("-", " ").title()),
                        lab_def.get("topic", "Networking"),
                        lab_def.get("difficulty", "Beginner"),
                        lab_def.get("objective", "Complete the lab objectives."),
                        lab_path
                    ))
                except Exception as e:
                    print(f"Error loading {lab_slug}: {e}")
        else:
            print(f"Warning: Labs directory {labs_dir} not found. No initial labs loaded.")
            
    conn.commit()
    conn.close()

# Initialize DB on import
init_db()
