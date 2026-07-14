from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, Field
from typing import Dict, Optional, List
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, DateTime, text
from sqlalchemy.sql import func
from sqlalchemy.orm import sessionmaker, declarative_base, Session
import os

from .security import hash_password, verify_password, create_token, verify_token

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


class LoanModel(Base):
    __tablename__ = "loans"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    lender = Column(String, nullable=False)
    amount = Column(Float, default=0)
    emi = Column(Float, default=0)
    status = Column(String, default="Active")


class SettlementModel(Base):
    __tablename__ = "settlements"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    total_debt = Column(Float)
    recommended_percent = Column(Float)
    estimated_amount = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class HistoryModel(Base):
    __tablename__ = "history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action_type = Column(String)
    details = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class FinancialAnalysisModel(Base):
    __tablename__ = "financial_analyses"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    score = Column(Float)
    surplus = Column(Float)
    debt_to_income = Column(Float)
    emi_ratio = Column(Float)
    stress = Column(String)
    risk = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Startup event to run migrations
@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        # Idempotent migration: Add full_name column if it does not exist
        try:
            db.execute(text("ALTER TABLE users ADD COLUMN full_name VARCHAR DEFAULT ''"))
            db.commit()
        except Exception:
            db.rollback() # Column already exists, safe to ignore
    finally:
        db.close()


# ------------------------
# Auth Dependency
# ------------------------
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = verify_token(token)
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid auth credentials")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid auth credentials")
    user = db.query(UserModel).filter(UserModel.email == email).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


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
    full_name: str

class LoanInput(BaseModel):
    lender: str
    amount: float
    emi: float
    status: Optional[str] = "Active"

class LoanResponse(BaseModel):
    id: int
    lender: str
    amount: float
    emi: float
    status: str

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
    user = db.query(UserModel).filter(UserModel.email == data.email.lower()).first()

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
    existing = db.query(UserModel).filter(UserModel.email == data.email.lower()).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    user = UserModel(
        email=data.email.lower(),
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
# Loan CRUD Routes
# ------------------------

@app.get("/api/loans", response_model=List[LoanResponse])
def get_loans(current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    loans = db.query(LoanModel).filter(LoanModel.user_id == current_user.id).all()
    return loans

@app.post("/api/loans", response_model=LoanResponse)
def create_loan(data: LoanInput, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    loan = LoanModel(
        user_id=current_user.id,
        lender=data.lender,
        amount=data.amount,
        emi=data.emi,
        status=data.status
    )
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return loan

@app.put("/api/loans/{loan_id}", response_model=LoanResponse)
def update_loan(loan_id: int, data: LoanInput, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    loan = db.query(LoanModel).filter(LoanModel.id == loan_id, LoanModel.user_id == current_user.id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    loan.lender = data.lender
    loan.amount = data.amount
    loan.emi = data.emi
    loan.status = data.status
    db.commit()
    db.refresh(loan)
    return loan

@app.delete("/api/loans/{loan_id}")
def delete_loan(loan_id: int, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    loan = db.query(LoanModel).filter(LoanModel.id == loan_id, LoanModel.user_id == current_user.id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    db.delete(loan)
    db.commit()
    return {"message": "Loan deleted"}

# ------------------------
# Core Routes
# ------------------------

@app.get("/api/history")
def get_history(current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(HistoryModel).filter(HistoryModel.user_id == current_user.id).order_by(HistoryModel.created_at.desc()).all()

@app.get("/api/settlements")
def get_settlements(current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(SettlementModel).filter(SettlementModel.user_id == current_user.id).order_by(SettlementModel.created_at.desc()).all()

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
def financial_analysis(data: FinancialInput, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    # Update user profile
    current_user.monthly_income = data.monthly_income
    current_user.monthly_expenses = data.monthly_expenses
    current_user.total_debt = data.total_debt
    current_user.monthly_emi = data.monthly_emi
    db.commit()

    analysis = calculate_financial_health(data)
    score = calculate_confidence(analysis)
    
    # Save financial analysis
    fa = FinancialAnalysisModel(
        user_id=current_user.id,
        score=score,
        surplus=analysis["monthly_surplus"],
        debt_to_income=analysis["debt_to_income_ratio"],
        emi_ratio=analysis["emi_ratio"],
        stress=analysis["financial_stress"],
        risk=analysis["risk_category"]
    )
    db.add(fa)
    
    # Save to history
    history = HistoryModel(
        user_id=current_user.id,
        action_type="Financial Analysis",
        details="Completed financial health assessment"
    )
    db.add(history)
    db.commit()

    return analysis


@app.post("/api/predict-settlement")
def predict_settlement(data: FinancialInput, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    analysis = calculate_financial_health(data)

    if analysis["risk_category"] == "High":
        percent = 55
    elif analysis["risk_category"] == "Medium":
        percent = 70
    else:
        percent = 90

    settlement_amount = data.total_debt * percent / 100
    confidence = calculate_confidence(analysis)

    settlement = SettlementModel(
        user_id=current_user.id,
        total_debt=data.total_debt,
        recommended_percent=percent,
        estimated_amount=settlement_amount
    )
    db.add(settlement)

    history = HistoryModel(
        user_id=current_user.id,
        action_type="Settlement Prediction",
        details=f"Predicted settlement of ₹{settlement_amount:,.2f}"
    )
    db.add(history)
    db.commit()

    return {
        "recommended_settlement_percent": percent,
        "estimated_settlement_amount": round(settlement_amount, 2),
        "confidence_score": confidence,
        "analysis": analysis
    }


@app.post("/api/generate-negotiation")
def generate_negotiation(data: NegotiationInput, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):

    # Try Gemini AI first, fall back to rule-based template
    ai_letter = generate_letter_with_ai(data)

    letter = ai_letter if ai_letter else build_fallback_letter(data)
    source = "gemini-ai" if ai_letter else "rule-based"

    history = HistoryModel(
        user_id=current_user.id,
        action_type="Negotiation Letter",
        details=f"Generated letter for {data.lender_name}"
    )
    db.add(history)
    db.commit()

    return {
        "negotiation_letter": letter,
        "source": source
    }


@app.get("/api/dashboard")
def dashboard(current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    loans = db.query(LoanModel).filter(LoanModel.user_id == current_user.id).all()
    
    total_debt = sum(l.amount for l in loans) if loans else current_user.total_debt
    total_emi = sum(l.emi for l in loans) if loans else current_user.monthly_emi

    profile = FinancialInput(
        monthly_income=max(1.0, current_user.monthly_income),
        monthly_expenses=current_user.monthly_expenses,
        total_debt=total_debt,
        monthly_emi=total_emi,
    )

    analysis = calculate_financial_health(profile)
    
    latest_analysis = db.query(FinancialAnalysisModel).filter(FinancialAnalysisModel.user_id == current_user.id).order_by(FinancialAnalysisModel.created_at.desc()).first()
    health_score = latest_analysis.score if latest_analysis else calculate_confidence(analysis)

    active_loans = [
        {
            "lender": l.lender,
            "amount": l.amount,
            "emi": l.emi,
            "status": l.status,
        } for l in loans
    ]

    settlement_count = db.query(SettlementModel).filter(SettlementModel.user_id == current_user.id).count()
    history_count = db.query(HistoryModel).filter(HistoryModel.user_id == current_user.id).count()

    recommendations = []
    if total_debt > 0:
        recommendations.append("Consider debt consolidation to reduce interest rates.")
    if analysis["emi_ratio"] > 40:
        recommendations.append("Your EMI burden is high. Focus on paying off high-interest loans first.")
    
    return {
        "full_name": current_user.full_name,
        "active_loans": active_loans,
        "active_loan_count": len(active_loans),
        "total_debt": total_debt,
        "monthly_income": profile.monthly_income,
        "monthly_expenses": profile.monthly_expenses,
        "monthly_emi": total_emi,
        "monthly_surplus": analysis["monthly_surplus"],
        "debt_to_income_ratio": analysis["debt_to_income_ratio"],
        "financial_stress": analysis["financial_stress"],
        "financial_health_score": health_score,
        "recommended_action": "Review Finances" if analysis["financial_stress"] == "High" else "On Track",
        "ai_recommendations": recommendations,
        "settlement_predictions_count": settlement_count,
        "negotiation_history_count": history_count
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