# FinRelief AI — API Documentation

## Base URL

```
http://localhost:8000
```

---

## Authentication

### POST `/api/auth/login`

Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "demo@gmail.com",
  "password": "demo1234"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJI...",
  "token_type": "bearer",
  "message": "Login successful."
}
```

**Error (401):**
```json
{
  "detail": "Invalid email or password."
}
```

### POST `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@gmail.com",
  "password": "demo1234",
  "full_name": "Aarav Sharma"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJI...",
  "token_type": "bearer",
  "message": "Registration successful."
}
```

---

## Health & Status

### GET `/`

Returns application status.

```json
{
  "message": "Welcome to FinRelief AI",
  "version": "2.0.0",
  "status": "Running"
}
```

### GET `/health`

Returns application health.

```json
{
  "status": "healthy"
}
```

---

## Financial Services

### POST `/api/financial-analysis`

Analyze borrower financial health metrics.

**Request Body:**
```json
{
  "monthly_income": 65000,
  "monthly_expenses": 42000,
  "total_debt": 485000,
  "monthly_emi": 21000
}
```

**Response:**
```json
{
  "monthly_surplus": 2000.0,
  "debt_to_income_ratio": 62.18,
  "emi_ratio": 32.31,
  "financial_stress": "Moderate",
  "risk_category": "Medium"
}
```

### POST `/api/predict-settlement`

Predict settlement percentage and estimated amount.

**Request Body:** Same as `/api/financial-analysis`.

**Response:**
```json
{
  "recommended_settlement_percent": 70,
  "estimated_settlement_amount": 339500.0,
  "confidence_score": 85,
  "analysis": { "...same as financial-analysis..." }
}
```

### GET `/api/dashboard`

Returns the borrower dashboard overview with active loans, recommendations, and financial metrics.

**Response:**
```json
{
  "active_loans": [...],
  "active_loan_count": 3,
  "total_debt": 520000,
  "monthly_income": 65000,
  "monthly_expenses": 42000,
  "monthly_emi": 21000,
  "monthly_surplus": 2000.0,
  "debt_to_income_ratio": 66.67,
  "financial_stress": "Moderate",
  "financial_health_score": 72,
  "recommended_action": "Negotiate settlement",
  "ai_recommendations": [...]
}
```

---

## AI Services

### POST `/api/generate-negotiation`

Generate a negotiation letter using Gemini AI (with rule-based fallback).

**Request Body:**
```json
{
  "borrower_name": "Aarav Sharma",
  "lender_name": "HDFC Bank",
  "loan_amount": 220000,
  "hardship_reason": "temporary income disruption due to medical expenses"
}
```

**Response:**
```json
{
  "negotiation_letter": "Dear HDFC Bank, ...",
  "source": "gemini-ai"
}
```

> When `GEMINI_API_KEY` is not configured, `source` will be `"rule-based"`.

### GET `/api/borrower-rights`

Returns a list of borrower protections.

**Response:**
```json
{
  "rights": [
    "Right to receive fair treatment from lenders.",
    "Right to receive loan statements.",
    "Right to transparent loan terms.",
    "Right to negotiate settlement.",
    "Right to privacy of personal financial information."
  ]
}
```

---

## Technologies

- **Backend:** FastAPI, Python, SQLAlchemy, SQLite
- **AI:** Google Gemini API (with rule-based fallback)
- **Auth:** JWT (python-jose), bcrypt (passlib)
- **Frontend:** React, Vite, Axios