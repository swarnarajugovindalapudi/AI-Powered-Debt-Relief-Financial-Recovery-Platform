import os
import time
import requests

API_URL = os.getenv("API_URL", "https://ai-powered-debt-relief-financial-y50k.onrender.com")

def test_full_flow():
    print(f"Testing against {API_URL}")
    session = requests.Session()
    
    # 1. Register User
    timestamp = int(time.time())
    email = f"test_e2e_history_{timestamp}@example.com"
    password = "securepassword123"
    full_name = f"Jane E2E {timestamp}"
    
    print(f"Registering user: {email} / {full_name}")
    resp = session.post(f"{API_URL}/api/auth/register", json={
        "email": email,
        "password": password,
        "full_name": full_name
    })
    
    if resp.status_code != 200:
        print("Registration failed:", resp.status_code, resp.text)
        return
        
    data = resp.json()
    assert data["full_name"] == full_name, f"Expected {full_name}, got {data.get('full_name')}"
    
    # 2. Login User
    print("Logging in user...")
    resp = session.post(f"{API_URL}/api/auth/login", json={
        "email": email,
        "password": password
    })
    
    if resp.status_code != 200:
        print("Login failed:", resp.status_code, resp.text)
        return
        
    data = resp.json()
    assert data["full_name"] == full_name, f"Expected {full_name}, got {data.get('full_name')}"
    token = data["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Create a financial analysis
    print("Creating financial analysis...")
    resp = session.post(f"{API_URL}/api/financial-analysis", headers=headers, json={
        "monthly_income": 8000,
        "monthly_expenses": 3000,
        "total_debt": 25000,
        "monthly_emi": 1000,
        "delinquent_accounts": 2,
        "months_behind": 3,
        "lender_type": "Credit Card"
    })
    
    if resp.status_code != 200:
        print("Analysis failed:", resp.status_code, resp.text)
        return
        
    # 4. Create a settlement prediction
    print("Creating settlement prediction...")
    resp = session.post(f"{API_URL}/api/predict-settlement", headers=headers, json={
        "monthly_income": 8000,
        "monthly_expenses": 3000,
        "monthly_emi": 1000,
        "total_debt": 25000,
        "delinquency_status": "90 Days",
        "lender_type": "Credit Card",
        "hardship_reason": "Medical Emergency"
    })
    
    # 5. Generate negotiation letter
    print("Generating negotiation letter...")
    resp = session.post(f"{API_URL}/api/generate-negotiation", headers=headers, json={
        "borrower_name": full_name,
        "lender_name": "Chase",
        "loan_amount": 25000,
        "current_balance": 25000,
        "proposed_settlement": 12500,
        "hardship_reason": "Medical Emergency",
        "hardship_description": "Medical Emergency"
    })
    
    # 6. Fetch /api/history
    print("Fetching History...")
    resp = session.get(f"{API_URL}/api/history", headers=headers)
    
    if resp.status_code != 200:
        print("History fetch failed:", resp.status_code, resp.text)
        return
        
    history = resp.json()
    print("Received History Array:", history)
    
    assert isinstance(history, list), "Expected list"
    assert len(history) == 3, f"Expected 3 events, got {len(history)}"
    
    types = [h["type"] for h in history]
    assert "analysis" in types
    assert "settlement" in types
    assert "negotiation" in types
    
    print("All E2E checks passed perfectly!")

if __name__ == "__main__":
    test_full_flow()
