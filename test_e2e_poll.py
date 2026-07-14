import time
import uuid
import requests

API_URL = "https://ai-powered-debt-relief-financial-y50k.onrender.com"

def poll_until_success():
    print("Polling Render deployment...")
    for attempt in range(20):
        unique_id = uuid.uuid4().hex[:8]
        email = f"testuser_{unique_id}@gmail.com"
        
        reg_response = requests.post(
            f"{API_URL}/api/auth/register",
            json={"email": email, "password": "SecurePassword123", "full_name": "Jane Doe"}
        )
        
        if reg_response.status_code == 200:
            token = reg_response.json().get("access_token")
            dash_response = requests.get(
                f"{API_URL}/api/dashboard", 
                headers={"Authorization": f"Bearer {token}"}
            )
            print(f"Attempt {attempt + 1}: Dashboard status {dash_response.status_code}")
            
            if dash_response.status_code == 200:
                print("Dashboard Success!")
                print(dash_response.json())
                return True
        else:
            print(f"Attempt {attempt + 1}: Register failed {reg_response.status_code}")
            
        print("Sleeping 15s...")
        time.sleep(15)
        
    return False

if __name__ == "__main__":
    poll_until_success()
