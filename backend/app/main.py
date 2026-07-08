from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, Field
from typing import Dict, Optional
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import sessionmaker, declarative_base, Session
import os

from .security import hash_password, verify_password, create_token

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
# Database Setup
# ------------------------

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./finrelief.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, default="")
    monthly_income = Column(Float, default=0)
    monthly_expenses = Column(Float, default=0)
    total_debt = Column(Float, default=0)
    monthly_emi = Column(Float, default=0)


Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Seed a demo user on startup
@app.on_event("startup")
def seed_demo_user():
    db = SessionLocal()
    try:
        existing = db.query(UserModel).filter(UserModel.email == "demo@gmail.com").first()
        if not existing:
            demo = UserModel(
                email="demo@gmail.com",
                hashed_password=hash_password("demo1234"),
                full_name="Demo Borrower",
                monthly_income=65000,
                monthly_expenses=42000,
                total_debt=520000,
                monthly_emi=21000,
            )
            db.add(demo)
            db.commit()
    finally:
        db.close()


# ------------------------
# Request / Response Models
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


class AuthLoginInput(BaseModel):
    email: str
    password: str


class RegisterInput(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = ""


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


def calculate_confidence(analysis: Dict) -> int:
    """Dynamic confidence score based on financial metrics."""
    score = 85

    dti = analysis["debt_to_income_ratio"]
    if dti < 30:
        score += 10
    elif dti < 50:
        score += 5
    elif dti > 80:
        score -= 10

    emi = analysis["emi_ratio"]
    if emi < 25:
        score += 5
    elif emi > 60:
        score -= 10

    surplus = analysis["monthly_surplus"]
    if surplus > 10000:
        score += 5
    elif surplus < 0:
        score -= 15

    return max(min(score, 99), 30)


def generate_letter_with_ai(data: NegotiationInput) -> Optional[str]:
    """Try Google Gemini API; return None on failure so caller can use fallback."""
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return None

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = (
            f"Write a professional debt settlement negotiation letter from {data.borrower_name} "
            f"to {data.lender_name} regarding an outstanding loan of ₹{data.loan_amount:,.2f}. "
            f"The borrower is facing financial hardship due to: {data.hardship_reason}. "
            f"The letter should be polite, professional, and request a mutually beneficial settlement plan. "
            f"Keep it concise (under 250 words). Do not include any subject line or date header."
        )

        response = model.generate_content(prompt)
        return response.text.strip() if response and response.text else None
    except Exception:
        return None


def build_fallback_letter(data: NegotiationInput) -> str:
    """Rule-based fallback letter when Gemini API is unavailable."""
    return f"""Dear {data.lender_name},

I hope you are doing well.

I am writing regarding my outstanding loan of ₹{data.loan_amount:,.2f}.

Due to {data.hardship_reason}, I am currently facing financial hardship.

I sincerely request you to consider a mutually beneficial settlement plan that allows me to repay my debt while managing my financial obligations.

I appreciate your understanding and look forward to your positive response.

Sincerely,

{data.borrower_name}"""


# ------------------------
# Auth Routes
# ------------------------

@app.post("/api/auth/login")
def auth_login(data: AuthLoginInput, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.email == data.email).first()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_token({"sub": user.email, "email": user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "message": "Login successful."
    }


@app.post("/api/auth/register")
def auth_register(data: RegisterInput, db: Session = Depends(get_db)):
    existing = db.query(UserModel).filter(UserModel.email == data.email).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    user = UserModel(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_token({"sub": user.email, "email": user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "message": "Registration successful."
    }


# ------------------------
# Core Routes
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
        "confidence_score": calculate_confidence(analysis),
        "analysis": analysis
    }


@app.post("/api/generate-negotiation")
def generate_negotiation(data: NegotiationInput):

    # Try Gemini AI first, fall back to rule-based template
    ai_letter = generate_letter_with_ai(data)

    letter = ai_letter if ai_letter else build_fallback_letter(data)
    source = "gemini-ai" if ai_letter else "rule-based"

    return {
        "negotiation_letter": letter,
        "source": source
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