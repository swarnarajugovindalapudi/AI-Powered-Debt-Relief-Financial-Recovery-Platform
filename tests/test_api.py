import sys
import os

# Add the backend directory to the path so we can import the app
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_returns_welcome():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Welcome to FinRelief AI"
    assert data["version"] == "2.0.0"
    assert data["status"] == "Running"


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_financial_analysis():
    payload = {
        "monthly_income": 65000,
        "monthly_expenses": 42000,
        "total_debt": 485000,
        "monthly_emi": 21000,
    }
    response = client.post("/api/financial-analysis", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "monthly_surplus" in data
    assert "debt_to_income_ratio" in data
    assert "emi_ratio" in data
    assert "financial_stress" in data
    assert "risk_category" in data
    assert data["monthly_surplus"] == 2000.0
    assert data["risk_category"] == "Medium"


def test_predict_settlement():
    payload = {
        "monthly_income": 65000,
        "monthly_expenses": 42000,
        "total_debt": 485000,
        "monthly_emi": 21000,
    }
    response = client.post("/api/predict-settlement", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "recommended_settlement_percent" in data
    assert "estimated_settlement_amount" in data
    assert "confidence_score" in data
    assert "analysis" in data
    assert data["recommended_settlement_percent"] == 70
    assert 30 <= data["confidence_score"] <= 99


def test_generate_negotiation():
    payload = {
        "borrower_name": "Test User",
        "lender_name": "Test Bank",
        "loan_amount": 100000,
        "hardship_reason": "medical expenses",
    }
    response = client.post("/api/generate-negotiation", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "negotiation_letter" in data
    assert "Test User" in data["negotiation_letter"]
    assert "Test Bank" in data["negotiation_letter"]


def test_dashboard():
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "active_loans" in data
    assert "total_debt" in data
    assert "monthly_income" in data
    assert "ai_recommendations" in data
    assert data["active_loan_count"] == 3


def test_borrower_rights():
    response = client.get("/api/borrower-rights")
    assert response.status_code == 200
    data = response.json()
    assert "rights" in data
    assert len(data["rights"]) == 5


def test_auth_login_demo_user():
    with TestClient(app) as test_client:
        response = test_client.post("/api/auth/login", json={
            "email": "demo@gmail.com",
            "password": "demo1234",
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"


def test_auth_login_invalid_password():
    with TestClient(app) as test_client:
        response = test_client.post("/api/auth/login", json={
            "email": "demo@gmail.com",
            "password": "wrongpassword",
        })
        assert response.status_code == 401


def test_financial_analysis_validation():
    payload = {
        "monthly_income": -1000,
        "monthly_expenses": 42000,
        "total_debt": 485000,
        "monthly_emi": 21000,
    }
    response = client.post("/api/financial-analysis", json=payload)
    assert response.status_code == 422