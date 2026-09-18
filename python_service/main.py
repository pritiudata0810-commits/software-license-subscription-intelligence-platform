"""
Software License & Subscription Intelligence Platform
Python FastAPI Intelligence & Vectorized Analytics Microservice
Person 2 (Usage & Cost Analytics) & Person 3 (AI Intelligence & Recommendations)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
from datetime import datetime

app = FastAPI(
    title="FEP License Intelligence & Analytics API",
    description="Vectorized analytics, explainable health scores, and rule-based recommendation engine powered by Pandas, NumPy and FastAPI.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LicenseInput(BaseModel):
    id: str
    software_name: str
    category: str
    vendor_name: str
    total_quantity: int
    active_assignments: int
    cost_per_license: float # Monthly INR (₹)
    renewal_date: Optional[str] = None

class BatchUtilizationRequest(BaseModel):
    licenses: List[LicenseInput]

class HealthScoreRequest(BaseModel):
    licenses: List[LicenseInput]
    expired_count: int = 0
    due_7_days_count: int = 0
    due_30_days_count: int = 0

class SoftwareRequestPayload(BaseModel):
    id: str
    user_name: str
    software_name: str
    reason: str
    priority: str

class RecommendationRequest(BaseModel):
    licenses: List[LicenseInput]
    pending_requests: List[SoftwareRequestPayload] = []

@app.get("/")
def read_root():
    return {
        "service": "License Intelligence & Analytics API",
        "status": "online",
        "framework": "FastAPI",
        "analytics_engine": f"Pandas {pd.__version__}, NumPy {np.__version__}",
        "department": "Computer Engineering - Field Engineering Project (FEP)",
        "team": ["Yamgar Shreyasi", "Shaikh Alfiya", "Sonawane Shrawani", "Jadhav Suraj", "Udata Priti"]
    }

@app.post("/api/analytics/utilization")
def compute_utilization(payload: BatchUtilizationRequest):
    if not payload.licenses:
        return {"total_licenses": 0, "active_licenses": 0, "overall_utilization": 0, "records": []}

    data = [item.model_dump() for item in payload.licenses]
    df = pd.DataFrame(data)

    df["available"] = np.maximum(0, df["total_quantity"] - df["active_assignments"])
    df["unused"] = df["available"]
    
    # Safe vectorized division
    df["utilization_rate"] = np.where(
        df["total_quantity"] > 0,
        np.round((df["active_assignments"] / df["total_quantity"]) * 100, 1),
        0.0
    )

    conditions = [
        df["utilization_rate"] >= 90.0,
        (df["utilization_rate"] >= 75.0) & (df["utilization_rate"] < 90.0),
        (df["utilization_rate"] >= 50.0) & (df["utilization_rate"] < 75.0),
        (df["utilization_rate"] >= 25.0) & (df["utilization_rate"] < 50.0),
    ]
    choices = ["EXCELLENT", "GOOD", "MODERATE", "LOW"]
    df["classification"] = np.select(conditions, choices, default="CRITICAL")

    total_total = int(df["total_quantity"].sum())
    total_active = int(df["active_assignments"].sum())
    overall_util = round((total_active / total_total) * 100, 1) if total_total > 0 else 0.0

    return {
        "total_licenses": total_total,
        "active_licenses": total_active,
        "available_licenses": int(df["available"].sum()),
        "overall_utilization": overall_util,
        "underutilized_count": int((df["utilization_rate"] < 70.0).sum()),
        "records": df.to_dict(orient="records")
    }

@app.post("/api/analytics/cost")
def compute_cost_and_savings(payload: BatchUtilizationRequest):
    if not payload.licenses:
        return {
            "total_monthly_spend": 0,
            "total_annual_spend": 0,
            "monthly_unused_cost": 0,
            "potential_annual_saving": 0,
            "breakdown": []
        }

    data = [item.model_dump() for item in payload.licenses]
    df = pd.DataFrame(data)

    df["unused_quantity"] = np.maximum(0, df["total_quantity"] - df["active_assignments"])
    df["monthly_cost"] = df["total_quantity"] * df["cost_per_license"]
    df["annual_cost"] = df["monthly_cost"] * 12
    df["unused_monthly_cost"] = df["unused_quantity"] * df["cost_per_license"]
    df["potential_annual_saving"] = df["unused_monthly_cost"] * 12

    total_monthly = float(df["monthly_cost"].sum())
    total_annual = float(df["annual_cost"].sum())
    total_unused_monthly = float(df["unused_monthly_cost"].sum())
    total_potential_annual_saving = float(df["potential_annual_saving"].sum())

    # Category aggregation using pandas
    cat_summary = df.groupby("category").agg({
        "monthly_cost": "sum",
        "unused_monthly_cost": "sum"
    }).reset_index().to_dict(orient="records")

    return {
        "total_monthly_spend": round(total_monthly, 2),
        "total_annual_spend": round(total_annual, 2),
        "monthly_unused_cost": round(total_unused_monthly, 2),
        "potential_annual_saving": round(total_potential_annual_saving, 2),
        "category_summary": cat_summary,
        "breakdown": df.to_dict(orient="records")
    }

@app.post("/api/analytics/health")
def compute_health_score(payload: HealthScoreRequest):
    if not payload.licenses:
        return {
            "total_score": 100,
            "utilization_score": 35,
            "cost_efficiency_score": 25,
            "renewal_risk_score": 20,
            "unused_licenses_score": 10,
            "overlap_risk_score": 10,
            "status": "EXCELLENT"
        }

    data = [item.model_dump() for item in payload.licenses]
    df = pd.DataFrame(data)

    total_licenses = int(df["total_quantity"].sum())
    active_licenses = int(df["active_assignments"].sum())

    df["unused"] = np.maximum(0, df["total_quantity"] - df["active_assignments"])
    df["total_cost"] = df["total_quantity"] * df["cost_per_license"]
    df["wasted_cost"] = df["unused"] * df["cost_per_license"]

    total_cost = float(df["total_cost"].sum())
    wasted_cost = float(df["wasted_cost"].sum())

    # 1. Utilization Score (0 - 35)
    util_ratio = active_licenses / total_licenses if total_licenses > 0 else 1.0
    utilization_score = int(round(util_ratio * 35))

    # 2. Cost Efficiency Score (0 - 25)
    efficiency_ratio = (total_cost - wasted_cost) / total_cost if total_cost > 0 else 1.0
    cost_efficiency_score = int(round(efficiency_ratio * 25))

    # 3. Renewal Risk Score (0 - 20)
    deductions = (payload.expired_count * 6) + (payload.due_7_days_count * 4) + (payload.due_30_days_count * 2)
    renewal_risk_score = max(0, 20 - deductions)

    # 4. Unused Licenses Minimization (0 - 10)
    unused_ratio = (total_licenses - active_licenses) / total_licenses if total_licenses > 0 else 0.0
    unused_licenses_score = int(max(0, round((1.0 - unused_ratio * 2.0) * 10)))

    # 5. Overlap Risk Score (0 - 10)
    cats = df["category"].tolist()
    duplicate_count = len(cats) - len(set(cats))
    overlap_risk_score = max(0, 10 - duplicate_count * 2)

    total_score = min(100, max(0, utilization_score + cost_efficiency_score + renewal_risk_score + unused_licenses_score + overlap_risk_score))

    if total_score >= 85:
        status = "EXCELLENT"
    elif total_score >= 70:
        status = "HEALTHY"
    elif total_score >= 50:
        status = "MODERATE"
    else:
        status = "AT_RISK"

    return {
        "total_score": total_score,
        "utilization_score": utilization_score,
        "cost_efficiency_score": cost_efficiency_score,
        "renewal_risk_score": renewal_risk_score,
        "unused_licenses_score": unused_licenses_score,
        "overlap_risk_score": overlap_risk_score,
        "status": status,
        "formula_documentation": "Score = Util(35) + CostEff(25) + Renewal(20) + UnusedMin(10) + Overlap(10)"
    }

@app.post("/api/recommendations/generate")
def generate_recommendations(payload: RecommendationRequest):
    recommendations = []

    if not payload.licenses:
        return {"recommendations": []}

    df = pd.DataFrame([item.model_dump() for item in payload.licenses])
    df["unused"] = np.maximum(0, df["total_quantity"] - df["active_assignments"])
    df["utilization_rate"] = np.where(
        df["total_quantity"] > 0,
        (df["active_assignments"] / df["total_quantity"]) * 100,
        0.0
    )

    # RULE 1: Low utilization (<70%) and unused licenses > 0
    underutilized = df[(df["utilization_rate"] < 70.0) & (df["unused"] > 0)]
    for _, row in underutilized.iterrows():
        monthly_saving = float(row["unused"] * row["cost_per_license"])
        recommendations.append({
            "software_id": row["id"],
            "type": "REALLOCATE_UNUSED",
            "severity": "CRITICAL" if row["utilization_rate"] < 40 else "WARNING",
            "title": f"Reallocate or Reduce Unused {row['software_name']} Licenses",
            "reason": f"{int(row['unused'])} of {int(row['total_quantity'])} licenses are unassigned ({row['utilization_rate']:.1f}% utilization).",
            "supporting_metrics": {
                "total_licenses": int(row["total_quantity"]),
                "active_licenses": int(row["active_assignments"]),
                "unused_licenses": int(row["unused"]),
                "utilization_rate": round(float(row["utilization_rate"]), 1),
                "cost_per_license": float(row["cost_per_license"])
            },
            "estimated_monthly_savings": monthly_saving,
            "estimated_annual_savings": monthly_saving * 12,
            "suggested_action": f"Review {int(row['unused'])} idle seats to reassign internally or reduce seat count on contract renewal."
        })

    # RULE 2: Existing unused license available for pending employee request
    for req in payload.pending_requests:
        matching_sw = df[df["software_name"].str.lower() == req.software_name.lower()]
        if not matching_sw.empty:
            avail = int(matching_sw.iloc[0]["unused"])
            cost = float(matching_sw.iloc[0]["cost_per_license"])
            if avail > 0:
                recommendations.append({
                    "software_id": matching_sw.iloc[0]["id"],
                    "type": "USE_EXISTING_LICENSE",
                    "severity": "INFO",
                    "title": f"Assign Existing Unused License for {req.software_name}",
                    "reason": f"{req.user_name} requested {req.software_name}. The system detected {avail} unassigned seat(s) in pool.",
                    "supporting_metrics": {
                        "request_id": req.id,
                        "user_name": req.user_name,
                        "available_seats": avail
                    },
                    "estimated_monthly_savings": cost,
                    "estimated_annual_savings": cost * 12,
                    "suggested_action": "Fulfill request immediately with existing unassigned license rather than purchasing new software."
                })

    # RULE 4: High Cost (> ₹30,000/mo) and Low Utilization (<60%)
    high_cost_waste = df[(df["total_quantity"] * df["cost_per_license"] >= 30000) & (df["utilization_rate"] < 60.0)]
    for _, row in high_cost_waste.iterrows():
        total_monthly_spend = float(row["total_quantity"] * row["cost_per_license"])
        potential_save = float(row["unused"] * row["cost_per_license"])
        recommendations.append({
            "software_id": row["id"],
            "type": "COST_OPTIMIZATION",
            "severity": "CRITICAL",
            "title": f"High-Spend Optimization: {row['software_name']}",
            "reason": f"High monthly expenditure (₹{total_monthly_spend:,.0f}) with only {row['utilization_rate']:.1f}% seat utilization.",
            "supporting_metrics": {
                "total_spend": total_monthly_spend,
                "utilization_rate": round(float(row["utilization_rate"]), 1),
                "unused_seats": int(row["unused"])
            },
            "estimated_monthly_savings": potential_save,
            "estimated_annual_savings": potential_save * 12,
            "suggested_action": "Conduct immediate vendor contract audit to downscale enterprise tier before next billing cycle."
        })

    # RULE 5: Duplicate Category overlap
    cat_counts = df["category"].value_counts()
    overlapping_cats = cat_counts[cat_counts > 1].index.tolist()
    for cat in overlapping_cats:
        cat_sw = df[df["category"] == cat]
        names = " & ".join(cat_sw["software_name"].tolist())
        recommendations.append({
            "software_id": cat_sw.iloc[0]["id"],
            "type": "DUPLICATE_CONSOLIDATION",
            "severity": "INFO",
            "title": f"Consolidate Overlapping {cat} Subscriptions",
            "reason": f"Multiple active tools in {cat}: {names}.",
            "supporting_metrics": {
                "category": cat,
                "tools": cat_sw["software_name"].tolist()
            },
            "estimated_monthly_savings": 5000.0,
            "estimated_annual_savings": 60000.0,
            "suggested_action": "Standardize organizational workflow on a single preferred platform to maximize enterprise volume discount."
        })

    return {"count": len(recommendations), "recommendations": recommendations}
