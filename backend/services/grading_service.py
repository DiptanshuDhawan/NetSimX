"""
Grading Service — Wraps the grading engine for use by the API.
"""

import yaml
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from grading_engine import grade_lab as _grade_lab
from services.gns3_service import get_node_console_port


def grade_session(lab_yaml_path: str, gns3_project_id: str, skip_tasks: list = None) -> dict:
    """
    Grade a student's lab session.
    Dynamically resolves the current console ports from GNS3
    (ports can change between restarts), updates the YAML in memory,
    then runs the grader.
    """
    with open(lab_yaml_path, "r") as f:
        lab_def = yaml.safe_load(f)

    # Dynamically update console ports and host from live GNS3 session
    from services.gns3_service import GNS3_HOST
    for node in lab_def["lab"]["nodes"]:
        live_port = get_node_console_port(gns3_project_id, node["name"])
        node["console_port"] = live_port
        node["host"] = GNS3_HOST

    # Write updated definition to a temporary file
    import tempfile
    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".yaml", delete=False
    ) as tmp:
        yaml.dump(lab_def, tmp)
        tmp_path = tmp.name

    # The temp path has a different directory, so we must explicitly pass the original lab_dir
    original_lab_dir = os.path.dirname(os.path.abspath(lab_yaml_path))

    try:
        report = _grade_lab(tmp_path, skip_tasks=skip_tasks, lab_dir=original_lab_dir)
    finally:
        os.unlink(tmp_path)  # Clean up temp file

    return report
