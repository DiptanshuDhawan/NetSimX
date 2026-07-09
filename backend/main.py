import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import labs, sessions, grading, terminal

app = FastAPI(
    title="NetLabX API",
    description="Backend API for the NetLabX CCNA Lab Platform",
    version="1.0.0",
)

import threading
from auto_template import auto_configure_templates

# Allow the Next.js frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    # Run auto template configuration in the background so it doesn't block server startup
    threading.Thread(target=auto_configure_templates, daemon=True).start()

# Register all routers
app.include_router(labs.router)
app.include_router(sessions.router)
app.include_router(grading.router)
app.include_router(terminal.router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "NetLabX API"}
