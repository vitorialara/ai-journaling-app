from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import journal

app = FastAPI(
    title="Feelora API",
    description="Backend API for Feelora emotion tracking application",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(journal.router, prefix="/api/journal", tags=["journal"])

@app.get("/")
async def root():
    return {"message": "Welcome to Feelora API"}
