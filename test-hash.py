from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hash1 = "$2b$12$ayTbO9LJIIDnOhrEMW2ipuB0g2mloznzJh9xvK4Pjmh.7IUoFW.Wy"
hash2 = "$2b$12$Co0F9e5NGCR7TZwiXjTk4.ZvRPJ1J8HA7mwp3fd7R0TtPrCzPRkD2"
try:
    print("hash1 match demo1234:", pwd_context.verify("demo1234", hash1))
except Exception as e:
    print("hash1 error:", e)

try:
    print("hash2 match demo1234:", pwd_context.verify("demo1234", hash2))
except Exception as e:
    print("hash2 error:", e)

try:
    print("hash1 match password123:", pwd_context.verify("password123", hash1))
except Exception as e:
    print("hash1 password123 error:", e)
