from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class LabSummary(BaseModel):
    """Returned when listing all labs on the dashboard."""
    id: int
    slug: str
    title: str
    topic: str
    difficulty: str
    description: str
    estimated_time_minutes: int


class TaskResult(BaseModel):
    task_id: int
    description: str
    points_possible: int
    points_earned: int
    passed: bool
    hint: Optional[str] = None


class GradeReport(BaseModel):
    lab_id: str
    lab_title: str
    total_earned: int
    total_possible: int
    percentage: float
    passed: bool
    tasks: List[TaskResult]


class SessionStartResponse(BaseModel):
    session_id: int
    gns3_project_id: str
    status: str
    message: str


class SessionStatusResponse(BaseModel):
    session_id: int
    status: str
    nodes_ready: bool
