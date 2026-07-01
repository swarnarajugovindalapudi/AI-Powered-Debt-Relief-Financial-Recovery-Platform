from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="FinRelief AI API",
    description="AI-Powered Debt Relief & Financial Recovery Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "Welcome to FinRelief AI Platform"
    }
    
@app.get("/health")
def health_check():
    return {
        "status": "Healthy",
        "application": "FinRelief AI",
        "version": "1.0.0"
    }