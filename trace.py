import requests
import uuid

API_URL = "https://ai-powered-debt-relief-financial-y50k.onrender.com"

def trace_login():
    email = f"trace_{uuid.uuid4().hex[:4]}@gmail.com"
    password = "TracePassword123"
    
    # 1. Register to create user
    print(f"--- Registering {email} ---")
    reg = requests.post(f"{API_URL}/api/auth/register", json={"email": email, "password": password, "full_name": "Trace User"})
    print(f"Register status: {reg.status_code}")
    
    # 2. Login
    print(f"--- Login ---")
    log_res = requests.post(f"{API_URL}/api/auth/login", json={"email": email, "password": password})
    print(f"Login status: {log_res.status_code}")
    
    if log_res.status_code != 200:
        print(f"Login failed: {log_res.text}")
        return
        
    data = log_res.json()
    print("1. JWT returned by login:")
    print(data)
    
    token = data.get("access_token")
    if not token:
        # Check if the token is somewhere else
        token = data.get("token") or data.get("jwt") or data.get("data", {}).get("token")
        print(f"Token extracted manually: {token}")
        
    print(f"\nExtracted Token: {token}")
    
    print("\n2. localStorage key used:")
    print("The frontend uses 'access_token' (ACCESS_TOKEN_KEY = 'access_token').")
    
    print("\n3. Authorization header actually sent:")
    headers = {"Authorization": f"Bearer {token}"}
    print(headers)
    
    print("\n4. decoded JWT payload:")
    import jwt
    try:
        decoded = jwt.decode(token, options={"verify_signature": False})
        print(decoded)
    except Exception as e:
        print(f"Failed to decode: {e}")
        
    print("\n5. Testing /api/dashboard")
    dash = requests.get(f"{API_URL}/api/dashboard", headers=headers)
    print(f"Dashboard status: {dash.status_code}")
    if dash.status_code != 200:
        print(f"why 401 occurs: {dash.text}")
    else:
        print("Success! Dashboard returned 200.")

if __name__ == "__main__":
    trace_login()
