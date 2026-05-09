from typing import Any, Dict, List, Optional
from datetime import datetime


class AuthResponse:
    """Authentication response structure"""
    pass


class HealthResponse:
    """Health check response structure"""
    status: str
    framework: str
    model_loaded: bool
    classes: List[str]
    timestamp: str
