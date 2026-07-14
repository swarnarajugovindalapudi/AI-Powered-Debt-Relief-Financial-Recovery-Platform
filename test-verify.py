import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.security import verify_password
try:
    res = verify_password('demo1234', '$2b$12$Co0F9e5NGCR7TZwiXjTk4.ZvRPJ1J8HA7mwp3fd7R0TtPrCzPRkD2')
    print("VERIFY:", res)
except Exception as e:
    print("ERROR:", e)
