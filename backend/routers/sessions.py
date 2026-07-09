from fastapi import APIRouter, HTTPException, Query
from db.database import get_db
from services.gns3_service import start_lab_project, stop_lab_project, push_startup_config, get_gns3_server, get_node_console_port
import os
import yaml
import json
import gns3fy

router = APIRouter(prefix="/api/session", tags=["sessions"])
LABS_DIR = os.getenv("LABS_DIR", "../labs")


@router.post("/start/{lab_slug}")
async def start_lab(lab_slug: str):
    conn = get_db()
    lab_row = conn.execute("SELECT * FROM labs WHERE slug = ?", (lab_slug,)).fetchone()
    
    if not lab_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Lab not found")

    lab = dict(lab_row)

    # Start GNS3 project
    try:
        gns3_info = start_lab_project(lab["gns3_project_path"])
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Failed to start GNS3 project: {e}")

    # Push startup configs
    lab_yaml_path = os.path.join(LABS_DIR, lab_slug, "lab.yaml")
    try:
        with open(lab_yaml_path, "r") as f:
            lab_def = yaml.safe_load(f)

        for node in lab_def["lab"]["nodes"]:
            config_path = os.path.join(LABS_DIR, lab_slug, "configs", f"{node['name']}-startup.cfg")
            if os.path.exists(config_path):
                push_startup_config(gns3_info["project_id"], node["name"], config_path)
    except Exception as e:
        import logging
        logging.getLogger("netlabx.sessions").warning(f"Could not push startup configs: {e}")

    # Save session to DB
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO lab_sessions (lab_id, gns3_project_id, status)
        VALUES (?, ?, 'running')
    """, (lab["id"], gns3_info["project_id"]))
    session_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        "session_id": session_id,
        "gns3_project_id": gns3_info["project_id"],
        "status": "running",
        "message": "Lab started. Routers are booting, please wait ~60 seconds before connecting.",
    }


@router.post("/stop/{session_id}")
async def stop_lab(session_id: int):
    conn = get_db()
    session_row = conn.execute("SELECT * FROM lab_sessions WHERE id = ?", (session_id,)).fetchone()
    
    if not session_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Session not found")

    session = dict(session_row)

    try:
        stop_lab_project(session["gns3_project_id"])
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Failed to stop GNS3 project: {e}")

    conn.execute("UPDATE lab_sessions SET status = 'stopped', stopped_at = CURRENT_TIMESTAMP WHERE id = ?", (session_id,))
    conn.commit()
    conn.close()

    return {"message": "Lab stopped. Server resources freed."}


@router.get("/status/{session_id}")
async def get_session_status(session_id: int):
    conn = get_db()
    session_row = conn.execute("SELECT * FROM lab_sessions WHERE id = ?", (session_id,)).fetchone()
    
    if not session_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Session not found")
        
    session = dict(session_row)
    conn.close()

    if session["status"] not in ["running", "graded"]:
        return {"status": "stopped", "nodes": [], "links": []}

    try:
        from services.gns3_service import get_lab_status
        return get_lab_status(session["gns3_project_id"])
    except Exception as e:
        return {"nodes": [], "links": [], "error": str(e)}


@router.post("/reset/{session_id}")
async def reset_session(session_id: int):
    conn = get_db()
    session_row = conn.execute("SELECT s.*, l.slug as lab_slug FROM lab_sessions s JOIN labs l ON s.lab_id = l.id WHERE s.id = ?", (session_id,)).fetchone()
    
    if not session_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Session not found")
        
    session = dict(session_row)
    conn.close()

    if session["status"] not in ["running", "graded"]:
        raise HTTPException(status_code=400, detail="Lab is not running")

    # If it was graded, switch it back to running when we reset
    if session["status"] == "graded":
        conn = get_db()
        conn.execute("UPDATE lab_sessions SET status = 'running' WHERE id = ?", (session_id,))
        conn.commit()
        conn.close()

    try:
        from services.gns3_service import reset_lab_project
        reset_lab_project(session["gns3_project_id"])

        # Re-push configs
        lab_slug = session["lab_slug"]
        lab_yaml_path = os.path.join(LABS_DIR, lab_slug, "lab.yaml")
        with open(lab_yaml_path, "r") as f:
            lab_def = yaml.safe_load(f)

        for node in lab_def["lab"]["nodes"]:
            config_path = os.path.join(LABS_DIR, lab_slug, "configs", f"{node['name']}-startup.cfg")
            if os.path.exists(config_path):
                push_startup_config(session["gns3_project_id"], node["name"], config_path)
                
        return {"message": "Lab reset successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reset failed: {e}")
