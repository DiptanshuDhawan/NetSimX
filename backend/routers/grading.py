from fastapi import APIRouter, HTTPException, Query
from db.database import get_db
from services.grading_service import grade_session
import os
import json
from typing import List, Optional

router = APIRouter(prefix="/api/grade", tags=["grading"])
LABS_DIR = os.getenv("LABS_DIR", "../labs")


@router.post("/{session_id}")
async def grade_lab(session_id: int):
    conn = get_db()
    session_row = conn.execute("""
        SELECT s.*, l.slug as lab_slug, l.id as lab_id 
        FROM lab_sessions s
        JOIN labs l ON s.lab_id = l.id
        WHERE s.id = ?
    """, (session_id,)).fetchone()
    
    if not session_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Session not found")

    session = dict(session_row)
    lab_yaml_path = os.path.join(LABS_DIR, session["lab_slug"], "lab.yaml")

    # Run the grader
    report = grade_session(lab_yaml_path, session["gns3_project_id"])

    # Save results to DB
    conn.execute("""
        INSERT INTO lab_results (session_id, lab_id, score, max_score, results_json)
        VALUES (?, ?, ?, ?, ?)
    """, (session_id, session["lab_id"], report["total_earned"], report["total_possible"], json.dumps(report)))
    
    # Mark session as graded
    conn.execute("UPDATE lab_sessions SET status = 'graded' WHERE id = ?", (session_id,))
    
    conn.commit()
    conn.close()

    return report


@router.get("/incremental/{session_id}")
async def grade_incremental(session_id: int, already_passed: Optional[List[int]] = Query(None)):
    conn = get_db()
    session_row = conn.execute("""
        SELECT s.*, l.slug as lab_slug, l.id as lab_id 
        FROM lab_sessions s
        JOIN labs l ON s.lab_id = l.id
        WHERE s.id = ?
    """, (session_id,)).fetchone()
    
    if not session_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Session not found")

    session = dict(session_row)
    conn.close()

    lab_yaml_path = os.path.join(LABS_DIR, session["lab_slug"], "lab.yaml")

    skip_tasks = already_passed if already_passed else []

    # Run the grader with skip_tasks
    report = grade_session(lab_yaml_path, session["gns3_project_id"], skip_tasks=skip_tasks)

    # We don't save incremental reports to the DB to avoid spamming lab_results.
    # The frontend manages merging the incremental state.
    return report
