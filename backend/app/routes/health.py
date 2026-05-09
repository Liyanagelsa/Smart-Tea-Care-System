from fastapi import APIRouter
from datetime import datetime
from app.utils import logger
from app.services import ModelService
from app.constants import DISEASE_CLASSES

router = APIRouter()


@router.get("/health")
def health():
    """Health check endpoint."""
    logger.debug("Health check request")
    health_status = {
        "status": "healthy",
        "framework": "TensorFlow-Keras-CNN",
        "model_loaded": ModelService.is_loaded(),
        "classes": DISEASE_CLASSES,
        "timestamp": datetime.now().isoformat()
    }
    logger.debug(f"Health check response: {health_status}")
    return health_status
