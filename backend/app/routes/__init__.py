from fastapi import APIRouter
from .auth import router as auth_router
from .predict import router as predict_router
from .detections import router as detections_router
from .profile import router as profile_router
from .admin import router as admin_router
from .health import router as health_router

def include_routes(app):
    """Include all route routers into the main app."""
    app.include_router(auth_router, prefix="/auth", tags=["auth"])
    app.include_router(predict_router, tags=["predictions"])
    app.include_router(detections_router, tags=["detections"])
    app.include_router(profile_router, tags=["profile"])
    app.include_router(admin_router, prefix="/admin", tags=["admin"])
    app.include_router(health_router, tags=["health"])
