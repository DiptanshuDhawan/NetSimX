from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import labs, sessions, grading, terminal
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="NetLabX API",
    description="Backend API for the NetLabX CCNA Lab Platform",
    version="1.0.0",
)

# Allow the Next.js frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",          # Local Next.js dev server
        "https://netlabx.vercel.app",     # Your Vercel production URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(labs.router)
app.include_router(sessions.router)
app.include_router(grading.router)
app.include_router(terminal.router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "NetLabX API"}
