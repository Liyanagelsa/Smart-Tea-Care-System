from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class SignupRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2, max_length=100)
    plantation_name: Optional[str] = ""
    location: Optional[str] = ""


class SigninRequest(BaseModel):
    email: str
    password: str


class ForgotPasswordRequest(BaseModel):
    email: str
    redirect_url: Optional[str] = None


class DetectionSaveRequest(BaseModel):
    image_url: Optional[str] = None
    disease: str
    confidence: float
    severity_level: str
    severity_score: int
    treatment: Dict[str, Any]
    all_probabilities: Dict[str, float]
    notes: Optional[str] = None
    location: Optional[str] = None
    model: str


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    language: Optional[str] = Field(None, pattern="^(en|si|ta)$")
