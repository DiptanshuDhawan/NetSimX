from fastapi import APIRouter, HTTPException, Query
from db.database import get_db
from services.gns3_service import start_lab_project, stop_lab_project, get_gns3_server, get_node_console_port
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
    lab_yaml_path = os.path.join(LABS_DIR, lab_slug, "lab.yaml")
    try:
        gns3_info = start_lab_project(lab_slug, lab_yaml_path)
    except Exception as e:
        import traceback
        traceback.print_exc()
        conn.close()
        raise HTTPException(status_code=500, detail=f"Failed to start GNS3 project: {e}")



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
        "message": "Lab started. Terminals are connecting.",
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
        import requests
        if isinstance(e, requests.exceptions.HTTPError) and "404" in str(e):
            # Project was deleted from GNS3, update DB and return stopped
            conn = get_db()
            conn.execute("UPDATE lab_sessions SET status = 'stopped' WHERE id = ?", (session_id,))
            conn.commit()
            conn.close()
            return {"status": "stopped", "nodes": [], "links": []}
            
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


                
        return {"message": "Lab reset successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reset failed: {e}")
