"""
Steel Manufacturing AI Assessment — FastAPI Backend
Serves the LangChain ReAct agent for WBS/SOP extraction
and pandas-based delay analysis endpoints.
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from models import ExtractionRequest, ExtractionResponse, ForecastRequest, ChatRequest
import analysis

load_dotenv()

app = FastAPI(
    title="Steel Manufacturing AI Assessment API",
    description="AI-powered WBS/SOP extraction and delay analysis for steel manufacturing",
    version="1.0.0",
)

# ── CORS ────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health Check ────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"status": "healthy", "service": "Steel Manufacturing AI Assessment API"}


@app.get("/api/health")
async def health():
    return {"status": "ok"}


# ── AI Extraction ───────────────────────────────────────────────────────────

@app.post("/api/extract", response_model=ExtractionResponse)
async def extract_document(request: ExtractionRequest):
    """Extract structured data from WBS or SOP document using AI agent."""
    if request.document_type not in ("wbs", "sop"):
        raise HTTPException(status_code=400, detail="document_type must be 'wbs' or 'sop'")

    if not request.document_text.strip():
        raise HTTPException(status_code=400, detail="document_text cannot be empty")

    if not os.getenv("GROQ_API_KEY"):
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")

    try:
        from agent import extract_document as run_extraction
        result = run_extraction(request.document_text, request.document_type)
        return ExtractionResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")


# ── Delay Analysis ──────────────────────────────────────────────────────────

@app.get("/api/analysis/overview")
async def analysis_overview():
    """Get overview dashboard metrics."""
    try:
        return analysis.get_overview()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/analysis/delays-by-stage")
async def delays_by_stage():
    """Get average and total delays by production stage."""
    try:
        return analysis.get_delays_by_stage()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/analysis/delays-by-category")
async def delays_by_category():
    """Get delay breakdown by category."""
    try:
        return analysis.get_delays_by_category()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/analysis/delays-by-shift")
async def delays_by_shift():
    """Get delay distribution across shifts."""
    try:
        return analysis.get_delays_by_shift()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/analysis/bottleneck")
async def bottleneck():
    """Identify the production bottleneck stage."""
    try:
        return analysis.get_bottleneck()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/analysis/controllable-vs-external")
async def controllable_vs_external():
    """Get breakdown of controllable vs external delays."""
    try:
        return analysis.get_controllable_vs_external()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/analysis/monthly-trend")
async def monthly_trend():
    """Get monthly delay trends over time."""
    try:
        return analysis.get_monthly_trend()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Forecasting ─────────────────────────────────────────────────────────────

@app.post("/api/forecast")
async def forecast(request: ForecastRequest):
    """Forecast delays for a customer order."""
    try:
        return analysis.forecast_order(
            total_tonnes=request.total_tonnes,
            tonnes_per_heat=request.tonnes_per_heat,
            confidence_level=request.confidence_level,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Anomaly Detection ───────────────────────────────────────────────────────

@app.get("/api/analysis/anomalies")
async def anomalies():
    """Detect anomalous patterns in the delay data."""
    try:
        return analysis.get_anomalies()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── AI Chatbot ──────────────────────────────────────────────────────────────

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Answer questions about the production delay data using AI."""
    if not os.getenv("GROQ_API_KEY"):
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")

    try:
        from langchain_groq import ChatGroq
        from langchain_core.messages import HumanMessage, SystemMessage

        llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0,
            groq_api_key=os.getenv("GROQ_API_KEY"),
        )

        data_summary = analysis.get_data_summary_for_chat()

        messages = [
            SystemMessage(content=f"""You are ForgeAI, an expert manufacturing operations analyst for a steel plant.
You have access to the following production delay data. Answer the user's question using ONLY this data.
Be concise, data-driven, and provide specific numbers. Use bullet points for clarity.
If the user asks something not related to the data, politely redirect to manufacturing topics.

{data_summary}"""),
            HumanMessage(content=request.question),
        ]

        response = llm.invoke(messages)
        return {"answer": response.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

