"""
Delay analysis and forecasting engine.
Loads Production_Delay_Data.xlsx and provides analysis functions.
"""

import os
import math
import pandas as pd
import numpy as np

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "Production_Delay_Data.xlsx")

# ── Load data once at module level ──────────────────────────────────────────

_delays_df: pd.DataFrame | None = None
_details_df: pd.DataFrame | None = None


def _load_data():
    global _delays_df, _details_df
    if _delays_df is None:
        _delays_df = pd.read_excel(DATA_PATH, sheet_name=0, engine="openpyxl")
        _details_df = pd.read_excel(DATA_PATH, sheet_name=1, engine="openpyxl")
        # Normalize column names
        _delays_df.columns = _delays_df.columns.str.strip()
        _details_df.columns = _details_df.columns.str.strip()
    return _delays_df, _details_df


# ── Overview ────────────────────────────────────────────────────────────────

def get_overview() -> dict:
    df, _ = _load_data()
    delay_col = [c for c in df.columns if "delay" in c.lower() and "min" in c.lower()][0]
    stage_col = [c for c in df.columns if "stage" in c.lower()][0]
    cat_col = [c for c in df.columns if "category" in c.lower()][0]
    shift_col = [c for c in df.columns if "shift" in c.lower()][0]

    total_records = len(df)
    total_delay = float(df[delay_col].sum())
    avg_delay = float(df[delay_col].mean())

    # Worst stage
    stage_totals = df.groupby(stage_col)[delay_col].sum()
    worst_stage = stage_totals.idxmax()
    worst_stage_delay = float(stage_totals.max())

    # Worst category
    cat_totals = df.groupby(cat_col)[delay_col].sum()
    worst_category = cat_totals.idxmax()
    worst_category_delay = float(cat_totals.max())

    # Controllable vs external
    controllable_keywords = ["equipment", "quality"]
    external_keywords = ["power", "material"]

    controllable_mask = df[cat_col].str.lower().str.contains("|".join(controllable_keywords), na=False)
    controllable_pct = float(controllable_mask.sum() / total_records * 100)

    # Worst shift
    shift_totals = df.groupby(shift_col)[delay_col].sum()
    worst_shift = str(shift_totals.idxmax())
    worst_shift_delay = float(shift_totals.max())

    return {
        "total_records": total_records,
        "total_delay_minutes": round(total_delay, 1),
        "avg_delay_minutes": round(avg_delay, 1),
        "worst_stage": worst_stage,
        "worst_stage_delay_minutes": round(worst_stage_delay, 1),
        "worst_category": worst_category,
        "worst_category_delay_minutes": round(worst_category_delay, 1),
        "controllable_pct": round(controllable_pct, 1),
        "external_pct": round(100 - controllable_pct, 1),
        "worst_shift": worst_shift,
        "worst_shift_delay_minutes": round(worst_shift_delay, 1),
    }


# ── Delays by Stage ────────────────────────────────────────────────────────

def get_delays_by_stage() -> list[dict]:
    df, _ = _load_data()
    delay_col = [c for c in df.columns if "delay" in c.lower() and "min" in c.lower()][0]
    stage_col = [c for c in df.columns if "stage" in c.lower()][0]

    result = df.groupby(stage_col).agg(
        avg_delay=(delay_col, "mean"),
        total_delay=(delay_col, "sum"),
        count=(delay_col, "count"),
        max_delay=(delay_col, "max"),
    ).reset_index()

    return [
        {
            "stage": row[stage_col],
            "avg_delay": round(float(row["avg_delay"]), 1),
            "total_delay": round(float(row["total_delay"]), 1),
            "count": int(row["count"]),
            "max_delay": round(float(row["max_delay"]), 1),
        }
        for _, row in result.iterrows()
    ]


# ── Delays by Category ─────────────────────────────────────────────────────

def get_delays_by_category() -> list[dict]:
    df, _ = _load_data()
    delay_col = [c for c in df.columns if "delay" in c.lower() and "min" in c.lower()][0]
    cat_col = [c for c in df.columns if "category" in c.lower()][0]

    result = df.groupby(cat_col).agg(
        total_delay=(delay_col, "sum"),
        avg_delay=(delay_col, "mean"),
        count=(delay_col, "count"),
    ).reset_index()

    total = float(result["total_delay"].sum())

    return [
        {
            "category": row[cat_col],
            "total_delay": round(float(row["total_delay"]), 1),
            "avg_delay": round(float(row["avg_delay"]), 1),
            "count": int(row["count"]),
            "percentage": round(float(row["total_delay"]) / total * 100, 1) if total > 0 else 0,
        }
        for _, row in result.iterrows()
    ]


# ── Delays by Shift ────────────────────────────────────────────────────────

def get_delays_by_shift() -> list[dict]:
    df, _ = _load_data()
    delay_col = [c for c in df.columns if "delay" in c.lower() and "min" in c.lower()][0]
    shift_col = [c for c in df.columns if "shift" in c.lower()][0]
    stage_col = [c for c in df.columns if "stage" in c.lower()][0]

    # Overall by shift
    overall = df.groupby(shift_col).agg(
        total_delay=(delay_col, "sum"),
        avg_delay=(delay_col, "mean"),
        count=(delay_col, "count"),
    ).reset_index()

    # By shift + stage for grouped chart
    detailed = df.groupby([shift_col, stage_col])[delay_col].mean().reset_index()
    detailed.columns = ["shift", "stage", "avg_delay"]

    return {
        "overall": [
            {
                "shift": str(row[shift_col]),
                "total_delay": round(float(row["total_delay"]), 1),
                "avg_delay": round(float(row["avg_delay"]), 1),
                "count": int(row["count"]),
            }
            for _, row in overall.iterrows()
        ],
        "by_stage": [
            {
                "shift": str(row["shift"]),
                "stage": row["stage"],
                "avg_delay": round(float(row["avg_delay"]), 1),
            }
            for _, row in detailed.iterrows()
        ],
    }


# ── Bottleneck Analysis ────────────────────────────────────────────────────

def get_bottleneck() -> dict:
    df, _ = _load_data()
    delay_col = [c for c in df.columns if "delay" in c.lower() and "min" in c.lower()][0]
    stage_col = [c for c in df.columns if "stage" in c.lower()][0]
    cat_col = [c for c in df.columns if "category" in c.lower()][0]

    stage_stats = df.groupby(stage_col).agg(
        total_delay=(delay_col, "sum"),
        avg_delay=(delay_col, "mean"),
        count=(delay_col, "count"),
        std_delay=(delay_col, "std"),
    ).reset_index()

    bottleneck_stage = stage_stats.loc[stage_stats["total_delay"].idxmax(), stage_col]

    # Breakdown for bottleneck stage
    bn_data = df[df[stage_col] == bottleneck_stage]
    bn_categories = bn_data.groupby(cat_col)[delay_col].agg(["sum", "mean", "count"]).reset_index()

    return {
        "bottleneck_stage": bottleneck_stage,
        "total_delay": round(float(stage_stats.loc[stage_stats[stage_col] == bottleneck_stage, "total_delay"].iloc[0]), 1),
        "avg_delay": round(float(stage_stats.loc[stage_stats[stage_col] == bottleneck_stage, "avg_delay"].iloc[0]), 1),
        "incident_count": int(stage_stats.loc[stage_stats[stage_col] == bottleneck_stage, "count"].iloc[0]),
        "category_breakdown": [
            {
                "category": row[cat_col],
                "total_delay": round(float(row["sum"]), 1),
                "avg_delay": round(float(row["mean"]), 1),
                "count": int(row["count"]),
            }
            for _, row in bn_categories.iterrows()
        ],
        "all_stages": [
            {
                "stage": row[stage_col],
                "total_delay": round(float(row["total_delay"]), 1),
                "avg_delay": round(float(row["avg_delay"]), 1),
                "count": int(row["count"]),
            }
            for _, row in stage_stats.iterrows()
        ],
    }


# ── Controllable vs External ───────────────────────────────────────────────

def get_controllable_vs_external() -> dict:
    df, _ = _load_data()
    delay_col = [c for c in df.columns if "delay" in c.lower() and "min" in c.lower()][0]
    cat_col = [c for c in df.columns if "category" in c.lower()][0]

    controllable_keywords = ["equipment", "quality"]
    external_keywords = ["power", "material"]
    planned_keywords = ["planned", "maintenance"]

    def classify(cat: str) -> str:
        cat_lower = str(cat).lower()
        if any(k in cat_lower for k in controllable_keywords):
            return "Controllable"
        elif any(k in cat_lower for k in external_keywords):
            return "External"
        elif any(k in cat_lower for k in planned_keywords):
            return "Planned"
        return "Other"

    df = df.copy()
    df["control_type"] = df[cat_col].apply(classify)

    result = df.groupby("control_type").agg(
        total_delay=(delay_col, "sum"),
        count=(delay_col, "count"),
    ).reset_index()

    total = float(result["total_delay"].sum())

    return {
        "breakdown": [
            {
                "type": row["control_type"],
                "total_delay": round(float(row["total_delay"]), 1),
                "count": int(row["count"]),
                "percentage": round(float(row["total_delay"]) / total * 100, 1) if total > 0 else 0,
            }
            for _, row in result.iterrows()
        ]
    }


# ── Monthly Trend ───────────────────────────────────────────────────────────

def get_monthly_trend() -> list[dict]:
    df, _ = _load_data()
    delay_col = [c for c in df.columns if "delay" in c.lower() and "min" in c.lower()][0]

    # Find a date column
    date_cols = [c for c in df.columns if "date" in c.lower() or "time" in c.lower() or "start" in c.lower()]
    if not date_cols:
        # Try planned start
        date_cols = [c for c in df.columns if "planned" in c.lower()]

    if date_cols:
        date_col = date_cols[0]
        df = df.copy()
        df["_date"] = pd.to_datetime(df[date_col], errors="coerce")
        df["_month"] = df["_date"].dt.to_period("M").astype(str)

        result = df.dropna(subset=["_month"]).groupby("_month").agg(
            total_delay=(delay_col, "sum"),
            avg_delay=(delay_col, "mean"),
            count=(delay_col, "count"),
        ).reset_index().sort_values("_month")

        return [
            {
                "month": row["_month"],
                "total_delay": round(float(row["total_delay"]), 1),
                "avg_delay": round(float(row["avg_delay"]), 1),
                "count": int(row["count"]),
            }
            for _, row in result.iterrows()
        ]

    return []


# ── Forecasting ─────────────────────────────────────────────────────────────

def forecast_order(total_tonnes: float = 800, tonnes_per_heat: float = 80,
                   confidence_level: float = 0.9) -> dict:
    df, _ = _load_data()
    delay_col = [c for c in df.columns if "delay" in c.lower() and "min" in c.lower()][0]
    stage_col = [c for c in df.columns if "stage" in c.lower()][0]
    cat_col = [c for c in df.columns if "category" in c.lower()][0]

    num_heats = math.ceil(total_tonnes / tonnes_per_heat)

    # Calculate per-heat delay stats by stage
    stage_stats = df.groupby(stage_col)[delay_col].agg(["mean", "std"]).reset_index()

    # Average total delay per heat (sum of all stages)
    avg_delay_per_heat = float(stage_stats["mean"].sum())
    std_per_heat = float(np.sqrt((stage_stats["std"] ** 2).sum()))

    # Z-score for confidence level
    z_scores = {0.8: 0.84, 0.85: 1.04, 0.9: 1.28, 0.95: 1.65, 0.99: 2.33}
    z = z_scores.get(confidence_level, 1.28)

    # Buffer = z * std * sqrt(num_heats) — accounts for variability
    buffer_per_heat = z * std_per_heat
    total_estimated_delay = avg_delay_per_heat * num_heats
    total_buffer = buffer_per_heat * num_heats

    # Risk breakdown by category
    cat_stats = df.groupby(cat_col)[delay_col].agg(["mean", "sum"]).reset_index()
    total_cat_delay = float(cat_stats["sum"].sum())

    risk_breakdown = [
        {
            "category": row[cat_col],
            "avg_delay_per_incident": round(float(row["mean"]), 1),
            "share_of_total_pct": round(float(row["sum"]) / total_cat_delay * 100, 1) if total_cat_delay > 0 else 0,
            "estimated_delay_minutes": round(float(row["sum"]) / total_cat_delay * total_estimated_delay, 1) if total_cat_delay > 0 else 0,
        }
        for _, row in cat_stats.iterrows()
    ]

    recommendations = [
        "Implement predictive maintenance for Rolling Mill to reduce equipment breakdowns — the primary bottleneck stage.",
        "Negotiate backup power supply agreements to mitigate power outage delays.",
        "Establish safety stock levels for critical raw materials to prevent material shortage delays.",
        "Deploy real-time quality monitoring (AI-based) at CCM and Rolling Mill to catch defects earlier.",
        "Standardize shift handover protocols — if one shift shows higher delays, investigate and align SOPs.",
        "Set up a delay tracking dashboard with real-time alerts for immediate corrective action.",
    ]

    assumptions = [
        "Historical delay patterns from the past 6 months are representative of future performance.",
        "Each heat goes through all 5 production stages sequentially.",
        "Delays at each stage are approximately independent of each other.",
        f"Buffer calculated at {int(confidence_level*100)}% confidence level using normal distribution.",
        "No major planned maintenance shutdowns during the order production period.",
        "Raw material availability remains consistent with historical supply patterns.",
    ]

    # For Gantt chart timeline
    # Base processing times per heat (assumed averages in minutes)
    base_times_per_heat = {
        "Blast Furnace": 120,
        "SMS": 90,
        "CCM": 60,
        "Rolling Mill": 45,
        "Finishing": 30
    }
    
    stage_sequence = ["Blast Furnace", "SMS", "CCM", "Rolling Mill", "Finishing"]
    timeline = []
    
    current_time = 0
    for stg in stage_sequence:
        base_duration = base_times_per_heat[stg] * num_heats
        stg_delay_per_heat = 0
        if stg in stage_stats[stage_col].values:
            stg_delay_per_heat = float(stage_stats.loc[stage_stats[stage_col] == stg, "mean"].iloc[0])
            
        total_stg_delay = stg_delay_per_heat * num_heats
        
        timeline.append({
            "stage": stg,
            "base_duration": round(base_duration, 1),
            "estimated_delay": round(total_stg_delay, 1),
            "start_time": round(current_time, 1),
        })
        current_time += (base_duration + total_stg_delay)

    total_with_buffer = total_estimated_delay + total_buffer

    return {
        "num_heats": num_heats,
        "estimated_delay_per_heat_minutes": round(avg_delay_per_heat, 1),
        "total_estimated_delay_minutes": round(total_estimated_delay, 1),
        "buffer_minutes": round(total_buffer, 1),
        "total_with_buffer_minutes": round(total_with_buffer, 1),
        "total_with_buffer_hours": round(total_with_buffer / 60, 1),
        "confidence_level": confidence_level,
        "delay_risk_breakdown": risk_breakdown,
        "timeline": timeline,
        "recommendations": recommendations,
        "assumptions": assumptions,
    }


# ── Anomaly Detection ──────────────────────────────────────────────────────

def get_anomalies() -> list[dict]:
    """Detect anomalous patterns in the delay data."""
    df, _ = _load_data()
    delay_col = [c for c in df.columns if "delay" in c.lower() and "min" in c.lower()][0]
    stage_col = [c for c in df.columns if "stage" in c.lower()][0]
    cat_col = [c for c in df.columns if "category" in c.lower()][0]

    anomalies = []

    # 1. Stage-level anomalies: find stages with avg delay > overall avg + 1 std
    overall_avg = float(df[delay_col].mean())
    overall_std = float(df[delay_col].std())
    threshold = overall_avg + overall_std

    stage_avgs = df.groupby(stage_col)[delay_col].mean()
    for stage, avg in stage_avgs.items():
        if avg > threshold:
            pct_above = round((avg - overall_avg) / overall_avg * 100, 1)
            anomalies.append({
                "type": "critical",
                "icon": "🔴",
                "title": f"{stage} delays {pct_above}% above average",
                "description": f"Avg delay of {round(avg, 1)} min vs plant average of {round(overall_avg, 1)} min. Investigate equipment issues.",
            })

    # 2. Monthly trend anomalies
    date_cols = [c for c in df.columns if "date" in c.lower() or "time" in c.lower() or "start" in c.lower() or "planned" in c.lower()]
    if date_cols:
        df_tmp = df.copy()
        df_tmp["_date"] = pd.to_datetime(df_tmp[date_cols[0]], errors="coerce")
        df_tmp["_month"] = df_tmp["_date"].dt.to_period("M")
        monthly = df_tmp.dropna(subset=["_month"]).groupby("_month")[delay_col].agg(["mean", "count"]).sort_index()

        if len(monthly) >= 2:
            last = monthly.iloc[-1]
            prev = monthly.iloc[-2]
            pct_change = (last["mean"] - prev["mean"]) / prev["mean"] * 100 if prev["mean"] > 0 else 0

            if pct_change > 10:
                anomalies.append({
                    "type": "warning",
                    "icon": "🟡",
                    "title": f"Monthly delay increase: +{round(pct_change, 1)}%",
                    "description": f"Average delay rose from {round(prev['mean'], 1)} to {round(last['mean'], 1)} min in the latest month.",
                })
            elif pct_change < -10:
                anomalies.append({
                    "type": "good",
                    "icon": "🟢",
                    "title": f"Monthly delay decrease: {round(pct_change, 1)}%",
                    "description": f"Average delay improved from {round(prev['mean'], 1)} to {round(last['mean'], 1)} min. Keep it up!",
                })

    # 3. Category concentration: if one category > 35% of total delay
    cat_totals = df.groupby(cat_col)[delay_col].sum()
    total = cat_totals.sum()
    for cat, val in cat_totals.items():
        pct = val / total * 100 if total > 0 else 0
        if pct > 35:
            anomalies.append({
                "type": "warning",
                "icon": "⚠️",
                "title": f"{cat} accounts for {round(pct, 1)}% of all delays",
                "description": f"This single category dominates delay distribution. Focused intervention could yield significant improvements.",
            })

    # 4. High-variance stages
    stage_stds = df.groupby(stage_col)[delay_col].std()
    for stage, std in stage_stds.items():
        if std > overall_std * 1.5:
            anomalies.append({
                "type": "info",
                "icon": "📊",
                "title": f"{stage} has highly unpredictable delays",
                "description": f"Delay variability (σ={round(std, 1)} min) is {round(std / overall_std, 1)}x the plant average. Consider standardizing processes.",
            })

    return anomalies


# ── Chat Data Summary (for AI chatbot) ─────────────────────────────────────

def get_data_summary_for_chat() -> str:
    """Generate a comprehensive text summary of the data for LLM context."""
    df, details = _load_data()
    delay_col = [c for c in df.columns if "delay" in c.lower() and "min" in c.lower()][0]
    stage_col = [c for c in df.columns if "stage" in c.lower()][0]
    cat_col = [c for c in df.columns if "category" in c.lower()][0]
    shift_col = [c for c in df.columns if "shift" in c.lower()][0]

    overview = get_overview()
    stages = df.groupby(stage_col)[delay_col].agg(["mean", "sum", "count", "std", "max"]).round(1)
    categories = df.groupby(cat_col)[delay_col].agg(["mean", "sum", "count"]).round(1)
    shifts = df.groupby(shift_col)[delay_col].agg(["mean", "sum", "count"]).round(1)

    summary = f"""STEEL MANUFACTURING PRODUCTION DELAY DATA SUMMARY
=================================================
Total Records: {overview['total_records']}
Overall Average Delay: {overview['avg_delay_minutes']} min
Total Delay: {overview['total_delay_minutes']} min

DELAYS BY PRODUCTION STAGE:
{stages.to_string()}

DELAYS BY CATEGORY:
{categories.to_string()}

DELAYS BY SHIFT:
{shifts.to_string()}

KEY FINDINGS:
- Worst Stage (bottleneck): {overview['worst_stage']} ({overview['worst_stage_delay_minutes']} min total)
- Worst Category: {overview['worst_category']} ({overview['worst_category_delay_minutes']} min total)
- Controllable Delays: {overview['controllable_pct']}%
- External Delays: {overview['external_pct']}%
- Worst Shift: Shift {overview['worst_shift']} ({overview['worst_shift_delay_minutes']} min total)

COLUMNS IN DATASET: {', '.join(df.columns.tolist())}
"""
    return summary
