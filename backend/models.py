"""Pydantic models for API request/response schemas."""

from pydantic import BaseModel
from typing import Optional


# ── WBS Extraction ──────────────────────────────────────────────────────────

class WBSTask(BaseModel):
    task_name: str
    duration: str
    responsible_party: str
    dependencies: str


class WBSExtractionResult(BaseModel):
    document_title: str
    project_manager: Optional[str] = None
    total_duration: Optional[str] = None
    tasks: list[WBSTask]


# ── SOP Extraction ──────────────────────────────────────────────────────────

class SOPStep(BaseModel):
    step_number: int
    action: str
    responsible_role: str
    safety_critical: bool


class SOPExtractionResult(BaseModel):
    document_title: str
    sop_number: Optional[str] = None
    steps: list[SOPStep]


# ── Extraction Request / Response ───────────────────────────────────────────

class ExtractionRequest(BaseModel):
    document_text: str
    document_type: str  # "wbs" or "sop"


class ExtractionResponse(BaseModel):
    success: bool
    document_type: str
    data: dict
    raw_agent_output: Optional[str] = None


# ── Forecast Request ────────────────────────────────────────────────────────

class ForecastRequest(BaseModel):
    total_tonnes: float = 800
    tonnes_per_heat: float = 80
    grade: str = "Grade A"
    confidence_level: float = 0.9  # 90% confidence


class ForecastResponse(BaseModel):
    num_heats: int
    estimated_delay_per_heat_minutes: float
    total_estimated_delay_minutes: float
    buffer_minutes: float
    total_with_buffer_minutes: float
    total_with_buffer_hours: float
    confidence_level: float
    delay_risk_breakdown: list[dict]
    recommendations: list[str]
    assumptions: list[str]


# ── Chat Request ────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    question: str
