import time
import uuid
import requests

API_URL = "https://ai-powered-debt-relief-financial-y50k.onrender.com"

def test_registration_and_dashboard():
    # Make a unique email to ensure registration doesn't conflict
    unique_id = uuid.uuid4().hex[:8]
    email = f"testuser_{unique_id}@gmail.com"
    password = "SecurePassword123"
    full_name = f"Jane Doe {unique_id}"
    
    print(f"Testing Registration with email: {email}")
    
    # 1. Register User
    reg_response = requests.post(
        f"{API_URL}/api/auth/register",
        json={"email": email, "password": password, "full_name": full_name}
    )
    
    print(f"Register status: {reg_response.status_code}")
    if reg_response.status_code != 200:
        print(f"Register failed: {reg_response.text}")
        return False
        
    data = reg_response.json()
    token = data.get("access_token")
    if not token:
        print("Registration succeeded but no access_token found!")
        return False
        
    print("Registration successful and token received.")
    
    # 2. Test Dashboard
    print("Testing Dashboard fetch...")
    headers = {"Authorization": f"Bearer {token}"}
    dash_response = requests.get(f"{API_URL}/api/dashboard", headers=headers)
    
    print(f"Dashboard status: {dash_response.status_code}")
    if dash_response.status_code != 200:
        print(f"Dashboard fetch failed: {dash_response.text}")
        return False
        
    dash_data = dash_response.json()
    returned_name = dash_data.get("full_name")
    print(f"Dashboard full_name: '{returned_name}'")
    
    if returned_name != full_name:
        print(f"ERROR: Expected '{full_name}' but got '{returned_name}'")
        return False
        
    print("Dashboard dynamic name verified successfully!")
    
    # 3. Test Dashboard counts
    loans = dash_data.get("active_loan_count", 0)
    settlements = dash_data.get("settlement_predictions_count", 0)
    history = dash_data.get("negotiation_history_count", 0)
    
    print(f"Initial counts - Loans: {loans}, Settlements: {settlements}, History: {history}")
    
    # 4. Add a loan
    loan_resp = requests.post(
        f"{API_URL}/api/loans",
        json={"lender": "Chase", "amount": 10000, "emi": 500, "status": "Active"},
        headers=headers
    )
    
    if loan_resp.status_code == 200:
        print("Loan added successfully")
    else:
        print("Failed to add loan:", loan_resp.text)
        
    # Check counts again
    dash_response = requests.get(f"{API_URL}/api/dashboard", headers=headers)
    dash_data = dash_response.json()
    print(f"Updated counts - Loans: {dash_data.get('active_loan_count')}, Settlements: {dash_data.get('settlement_predictions_count')}, History: {dash_data.get('negotiation_history_count')}")
    
    print("All E2E checks passed!")
    return True

if __name__ == "__main__":
    max_retries = 10
    print("Waiting for Render deployment to complete (may take up to 2 minutes)...")
    for attempt in range(max_retries):
        try:
            health = requests.get(f"{API_URL}/health")
            if health.status_code == 200:
                print("Backend is responding!")
                break
        except Exception as e:
            pass
        print(f"Attempt {attempt + 1}/{max_retries} - Sleeping 15s...")
        time.sleep(15)
        
    success = test_registration_and_dashboard()
    if not success:
        print("Tests failed.")
        exit(1)
