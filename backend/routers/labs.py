from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from db.database import get_db
import os
import yaml

router = APIRouter(prefix="/api/labs", tags=["labs"])
LABS_DIR = os.getenv("LABS_DIR", "../labs")


@router.get("/")
async def list_labs():
    """Return all available labs from the database."""
    conn = get_db()
    labs = conn.execute("SELECT * FROM labs").fetchall()
    conn.close()
    return [dict(lab) for lab in labs]


@router.get("/{slug}/topology.pdf")
async def get_lab_topology_pdf(slug: str):
    """Serve the topology PDF for a specific lab."""
    pdf_path = os.path.join(LABS_DIR, slug, "topology.pdf")
    if os.path.exists(pdf_path):
        return FileResponse(pdf_path, media_type="application/pdf")
    raise HTTPException(status_code=404, detail="Topology PDF not found")

@router.get("/{slug}")
async def get_lab(slug: str):
    """Return detailed info for a single lab, including instructions markdown."""
    conn = get_db()
    lab_row = conn.execute("SELECT * FROM labs WHERE slug = ?", (slug,)).fetchone()
    conn.close()
    
    if not lab_row:
        raise HTTPException(status_code=404, detail="Lab not found")

    lab = dict(lab_row)

    # Also load the instructions markdown file
    instructions_path = os.path.join(LABS_DIR, slug, "instructions.md")
    if os.path.exists(instructions_path):
        with open(instructions_path, "r") as f:
            lab["instructions_md"] = f.read()
    else:
        lab["instructions_md"] = "Instructions not found."

    # Load tasks and nodes from lab.yaml
    lab_yaml_path = os.path.join(LABS_DIR, slug, "lab.yaml")
    if os.path.exists(lab_yaml_path):
        with open(lab_yaml_path, "r") as f:
            lab_def = yaml.safe_load(f)
            lab["tasks"] = lab_def.get("lab", {}).get("tasks", [])
            lab["nodes"] = lab_def.get("lab", {}).get("nodes", [])
            lab["prerequisites"] = lab_def.get("lab", {}).get("prerequisites", [])
            lab["command_reference"] = lab_def.get("lab", {}).get("command_reference", [])
            lab["instructions"] = lab_def.get("lab", {}).get("instructions", "")
            lab["objective"] = lab_def.get("lab", {}).get("objective", "")
    else:
        lab["tasks"] = []
        lab["nodes"] = []
        lab["prerequisites"] = []
        lab["command_reference"] = []
        lab["instructions"] = ""
        lab["objective"] = ""

    return lab
