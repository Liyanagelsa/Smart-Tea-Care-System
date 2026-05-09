import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import API_TITLE, API_VERSION, ALLOWED_ORIGINS
from app.routes import include_routes
from app.services import ModelService
from app.utils import logger

# Initialize FastAPI app
app = FastAPI(title=API_TITLE, version=API_VERSION)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS != [""] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Startup event
@app.on_event("startup")
def startup_event():
    logger.info("=" * 60)
    logger.info("Tea Leaf Disease Detection API - Starting up")
    logger.info("=" * 60)
    logger.info("YOLOv8 backend")

    import torch
    logger.info(f"CUDA available: {torch.cuda.is_available()}")
    logger.info(f"Device: {torch.device('cuda' if torch.cuda.is_available() else 'cpu')}")

    from app.constants import DISEASE_CLASSES
    logger.info(f"Disease classes: {DISEASE_CLASSES}")

    try:
        ModelService.load_model()
    except Exception as e:
        logger.error(f"Failed to load model during startup: {str(e)}")
        raise

    logger.info("Startup complete - API ready to serve requests")
    logger.info("=" * 60)


# Include all routes
include_routes(app)
