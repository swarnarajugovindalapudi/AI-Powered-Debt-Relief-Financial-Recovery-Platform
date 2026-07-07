from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict

app = FastAPI(
    title="FinRelief AI API",
    description="AI Powered Debt Relief & Financial Recovery Platform",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------
# Request Models
# ------------------------

class FinancialInput(BaseModel):
    monthly_income: float = Field(..., gt=0)
    monthly_expenses: float = Field(..., ge=0)
    total_debt: float = Field(..., ge=0)
    monthly_emi: float = Field(..., ge=0)


class NegotiationInput(BaseModel):
    borrower_name: str
    lender_name: str
    loan_amount: float
    hardship_reason: str


# ------------------------
# Utility Functions
# ------------------------

def calculate_financial_health(data: FinancialInput) -> Dict:

    surplus = data.monthly_income - data.monthly_expenses - data.monthly_emi

    debt_to_income = (
        (data.total_debt / (data.monthly_income * 12)) * 100
        if data.monthly_income > 0
        else 0
    )

    emi_ratio = (
        (data.monthly_emi / data.monthly_income) * 100
        if data.monthly_income > 0
        else 0
    )

    if emi_ratio < 30:
        stress = "Low"
        risk = "Low"
    elif emi_ratio < 50:
        stress = "Moderate"
        risk = "Medium"
    else:
        stress = "High"
        risk = "High"

    return {
        "monthly_surplus": round(surplus, 2),
        "debt_to_income_ratio": round(debt_to_income, 2),
        "emi_ratio": round(emi_ratio, 2),
        "financial_stress": stress,
        "risk_category": risk
    }


# ------------------------
# Routes
# ------------------------

@app.get("/")
def root():
    return {
        "message": "Welcome to FinRelief AI",
        "version": "2.0.0",
        "status": "Running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/api/financial-analysis")
def financial_analysis(data: FinancialInput):

    return calculate_financial_health(data)


@app.post("/api/predict-settlement")
def predict_settlement(data: FinancialInput):

    analysis = calculate_financial_health(data)

    if analysis["risk_category"] == "High":
        percent = 55
    elif analysis["risk_category"] == "Medium":
        percent = 70
    else:
        percent = 90

    settlement_amount = data.total_debt * percent / 100

    return {
        "recommended_settlement_percent": percent,
        "estimated_settlement_amount": round(settlement_amount, 2),
        "confidence_score": 88,
        "analysis": analysis
    }


@app.post("/api/generate-negotiation")
def generate_negotiation(data: NegotiationInput):

    letter = f"""
Dear {data.lender_name},

I hope you are doing well.

I am writing regarding my outstanding loan of ₹{data.loan_amount:,.2f}.

Due to {data.hardship_reason}, I am currently facing financial hardship.

I sincerely request you to consider a mutually beneficial settlement plan that allows me to repay my debt while managing my financial obligations.

I appreciate your understanding and look forward to your positive response.

Sincerely,

{data.borrower_name}
"""

    return {
        "negotiation_letter": letter
    }


@app.get("/api/dashboard")
def dashboard():
    profile = FinancialInput(
        monthly_income=65000,
        monthly_expenses=42000,
        total_debt=520000,
        monthly_emi=21000,
    )

    analysis = calculate_financial_health(profile)

    active_loans = [
        {
            "lender": "HDFC Bank",
            "amount": 220000,
            "emi": 8500,
            "status": "Active",
        },
        {
            "lender": "ICICI Bank",
            "amount": 145000,
            "emi": 6500,
            "status": "Active",
        },
        {
            "lender": "Axis Bank",
            "amount": 155000,
            "emi": 6000,
            "status": "Negotiation",
        },
    ]

    recommendations = [
        "Increase monthly repayment by ₹3,000 to reduce loan duration.",
        "Highest settlement chance currently appears with Axis Bank.",
        "Keep Debt-to-Income ratio below 40% to improve resilience.",
    ]

    return {
        "active_loans": active_loans,
        "active_loan_count": len(active_loans),
        "total_debt": profile.total_debt,
        "monthly_income": profile.monthly_income,
        "monthly_expenses": profile.monthly_expenses,
        "monthly_emi": profile.monthly_emi,
        "monthly_surplus": analysis["monthly_surplus"],
        "debt_to_income_ratio": analysis["debt_to_income_ratio"],
        "financial_stress": analysis["financial_stress"],
        "financial_health_score": 72,
        "recommended_action": "Negotiate settlement",
        "ai_recommendations": recommendations,
    }


@app.get("/api/borrower-rights")
def borrower_rights():

    return {
        "rights": [
            "Right to receive fair treatment from lenders.",
            "Right to receive loan statements.",
            "Right to transparent loan terms.",
            "Right to negotiate settlement.",
            "Right to privacy of personal financial information."
        ]
    }