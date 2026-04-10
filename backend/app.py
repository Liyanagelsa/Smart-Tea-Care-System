"""
Tea Leaf Disease Detection API
FastAPI + Supabase Auth + Supabase Database
Save as: main.py
"""

import io
import logging
import os
from typing import Any, Dict, List, Optional
from datetime import datetime
import numpy as np

import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Header, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel, Field
from supabase import Client, create_client

# =========================================================
# Logging configuration
# =========================================================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - [%(name)s] - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('api.log')
    ]
)
logger = logging.getLogger("TeaDisease")

# =========================================================
# Load environment variables
# =========================================================

logger.info("Loading environment variables...")
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

# Use best_model.pth (PyTorch format) - set explicitly to avoid fallback to .h5
_model_path = os.getenv("MODEL_PATH")
if _model_path and os.path.exists(_model_path):
    MODEL_PATH = _model_path
else:
    MODEL_PATH = "best_model.pth"

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

logger.info(f"Configuration loaded:")
logger.info(f"  - SUPABASE_URL: {'OK' if SUPABASE_URL else 'MISSING'}")
logger.info(f"  - SUPABASE_ANON_KEY: {'OK' if SUPABASE_ANON_KEY else 'MISSING'}")
logger.info(f"  - MODEL_PATH: {MODEL_PATH}")
logger.info(f"  - ALLOWED_ORIGINS: {ALLOWED_ORIGINS}")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    logger.error("SUPABASE_URL and SUPABASE_ANON_KEY must be set")
    logger.warning("Running with limited functionality - auth will not work")
    supabase = None
else:
    logger.info("Initializing Supabase client...")
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        logger.info("Supabase client initialized")
    except Exception as e:
        logger.error(f"Failed to initialize Supabase: {str(e)}")
        logger.warning("Running with limited functionality - auth will not work")
        supabase = None

# =========================================================
# FastAPI app
# =========================================================

app = FastAPI(title="Tea Leaf Disease Detection API")

# Security scheme for Swagger UI
security = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS != [""] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# Disease classes
# IMPORTANT: must match model training order exactly
# =========================================================

DISEASE_CLASSES = [
    "Algal Leaf Spot",
    "Brown Blight",
    "Gray Blight",
    "Healthy",
    "Helopeltis",
    "Red Leaf Spot"
]

# =========================================================
# Treatments
# Keys must match DISEASE_CLASSES exactly
# =========================================================

TREATMENTS = {
    "Algal Leaf Spot": {
        "en": {
            "cause": "Algal infection affecting leaf surfaces",
            "immediate": ["Remove infected leaves", "Reduce excess moisture"],
            "chemical": ["Copper-based fungicide if recommended locally"],
            "organic": ["Neem-based spray", "Improve field sanitation"],
            "preventive": ["Improve air circulation", "Avoid prolonged leaf wetness"]
        }
    },
    "Brown Blight": {
        "en": {
            "cause": "Fungal infection causing brown lesions",
            "immediate": ["Remove infected leaves", "Inspect nearby plants"],
            "chemical": ["Recommended fungicide for blight control"],
            "organic": ["Neem oil spray"],
            "preventive": ["Avoid overcrowding", "Regular monitoring"]
        }
    },
    "Gray Blight": {
        "en": {
            "cause": "Fungal leaf blight infection",
            "immediate": ["Prune infected leaves", "Keep foliage dry"],
            "chemical": ["Suitable fungicide for gray blight"],
            "organic": ["Neem oil spray"],
            "preventive": ["Improve drainage", "Regular field monitoring"]
        }
    },
    "Healthy": {
        "en": {
            "cause": "No disease detected",
            "immediate": ["No immediate action needed"],
            "chemical": ["None"],
            "organic": ["Continue regular care"],
            "preventive": ["Maintain good agronomic practices"]
        }
    },
    "Helopeltis": {
        "en": {
            "cause": "Tea mosquito bug attack",
            "immediate": ["Remove heavily damaged shoots", "Inspect nearby plants"],
            "chemical": ["Imidacloprid", "Thiamethoxam"],
            "organic": ["Neem oil spray"],
            "preventive": ["Regular monitoring", "Timely pest control"]
        }
    },
    "Red Leaf Spot": {
        "en": {
            "cause": "Leaf spot infection causing reddish lesions",
            "immediate": ["Remove infected leaves", "Improve sanitation"],
            "chemical": ["Appropriate fungicide if advised locally"],
            "organic": ["Neem oil spray"],
            "preventive": ["Improve airflow", "Avoid excess moisture"]
        }
    }
}

# =========================================================
# Pydantic models
# =========================================================

class SignupRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2, max_length=100)
    plantation_name: Optional[str] = ""
    location: Optional[str] = ""

class SigninRequest(BaseModel):
    email: str
    password: str

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

# =========================================================
# Model loading
# =========================================================

model = None

def load_model() -> None:
    global model

    logger.info(f"Starting model loading from {MODEL_PATH}")

    if not os.path.exists(MODEL_PATH):
        logger.error(f"Model file not found: {MODEL_PATH}")
        raise RuntimeError(f"Model file not found: {MODEL_PATH}")

    try:
        logger.info(f"Loading PyTorch ResNet50 model from {MODEL_PATH}")

        device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
        logger.info(f"Using device: {device}")

        model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V1)
        model.fc = nn.Linear(model.fc.in_features, len(DISEASE_CLASSES))

        state_dict = torch.load(MODEL_PATH, map_location=device, weights_only=False)
        model.load_state_dict(state_dict)

        model = model.to(device)
        model.eval()

        logger.info(f"Model loaded successfully")
        logger.info(f"Model input size: 224x224")
        logger.info(f"Model output classes: {len(DISEASE_CLASSES)}")

    except Exception as e:
        logger.error(f"Failed to load model: {str(e)}", exc_info=True)
        raise

@app.on_event("startup")
def startup_event() -> None:
    logger.info("=" * 60)
    logger.info("Tea Leaf Disease Detection API - Starting up")
    logger.info("=" * 60)
    logger.info(f"PyTorch/ResNet50 backend")
    logger.info(f"CUDA available: {torch.cuda.is_available()}")
    logger.info(f"Disease classes: {DISEASE_CLASSES}")

    load_model()

    logger.info("Startup complete - API ready to serve requests")
    logger.info("=" * 60)

# =========================================================
# Helpers
# =========================================================

def get_severity(confidence: float, disease: str) -> Dict[str, Any]:
    if disease == "Healthy":
        return {"level": "None", "score": 0, "color": "green"}
    if confidence >= 0.85:
        return {"level": "Severe", "score": 3, "color": "red"}
    if confidence >= 0.65:
        return {"level": "Moderate", "score": 2, "color": "orange"}
    return {"level": "Mild", "score": 1, "color": "yellow"}

def create_user_client(access_token: str) -> Client:
    """
    Create a Supabase client and attach the user's JWT so RLS applies.
    """
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(status_code=503, detail="Supabase not configured")
    try:
        client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        client.postgrest.auth(access_token)
        return client
    except Exception as e:
        logger.error(f"Failed to create user client: {str(e)}")
        raise HTTPException(status_code=503, detail="Database connection failed")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    logger.debug("Validating user token...")

    token = credentials.credentials

    try:
        user_response = supabase.auth.get_user(token)
        user = user_response.user
    except Exception as e:
        logger.warning(f"Token validation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    if not user:
        logger.warning("User not found in token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    logger.debug(f"User authenticated: {user.email}")
    return {
        "id": user.id,
        "email": user.email,
        "token": token
    }

# =========================================================
# Auth routes
# =========================================================

@app.post("/auth/signup")
async def signup(body: SignupRequest):
    """
    Sign up with Supabase Auth.
    Your SQL trigger auto-creates the profile row in public.profiles.
    """
    logger.info(f"Sign up attempt - Email: {body.email}, Name: {body.full_name}, Plantation: {body.plantation_name}")

    try:
        response = supabase.auth.sign_up({
            "email": body.email,
            "password": body.password,
            "options": {
                "data": {
                    "full_name": body.full_name,
                    "plantation_name": body.plantation_name,
                    "location": body.location
                }
            }
        })
    except Exception as e:
        logger.error(f"Sign up failed for {body.email}: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Signup failed: {str(e)}")

    user = response.user
    session = response.session

    if not user:
        logger.error(f"Sign up - user creation failed for {body.email}")
        raise HTTPException(status_code=400, detail="Signup failed")

    logger.info(f"Sign up successful - User: {user.email} (ID: {user.id})")

    return {
        "message": "Signup successful",
        "user": {
            "id": user.id,
            "email": user.email
        },
        # If email confirmation is enabled, these may be None until verified
        "access_token": session.access_token if session else None,
        "refresh_token": session.refresh_token if session else None,
        "token_type": "bearer" if session else None
    }

@app.post("/auth/signin")
async def signin(body: SigninRequest):
    logger.info(f"Sign in attempt - Email: {body.email}")

    try:
        response = supabase.auth.sign_in_with_password({
            "email": body.email,
            "password": body.password
        })
    except Exception as e:
        logger.error(f"Sign in failed for {body.email}: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Signin failed: {str(e)}")

    user = response.user
    session = response.session

    if not user or not session:
        logger.warning(f"Sign in validation failed for {body.email} - invalid credentials")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    logger.info(f"Sign in successful - User: {user.email} (ID: {user.id})")

    return {
        "access_token": session.access_token,
        "refresh_token": session.refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email
        }
    }

@app.post("/auth/signout")
async def signout(current_user: Dict[str, Any] = Depends(get_current_user)):
    try:
        user_client = create_user_client(current_user["token"])
        user_client.auth.sign_out()
    except Exception:
        # even if sign_out fails remotely, token removal is usually handled client-side too
        pass

    return {"message": "Signed out"}

@app.get("/auth/me")
async def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_client = create_user_client(current_user["token"])

    try:
        result = (
            user_client.table("profiles")
            .select("*")
            .eq("id", current_user["id"])
            .limit(1)
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load profile: {str(e)}")

    profile = result.data[0] if result.data else None

    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "profile": profile
    }

# =========================================================
# Profile routes
# =========================================================

@app.patch("/profile")
async def update_profile(
    body: ProfileUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    update_data = {}

    if body.full_name is not None:
        update_data["full_name"] = body.full_name.strip()

    if body.language is not None:
        update_data["language"] = body.language

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    user_client = create_user_client(current_user["token"])

    try:
        result = (
            user_client.table("profiles")
            .update(update_data)
            .eq("id", current_user["id"])
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Profile update failed: {str(e)}")

    return {
        "message": "Profile updated",
        "data": result.data[0] if result.data else None
    }

# =========================================================
# Detection history routes
# =========================================================

@app.post("/detections")
async def save_detection(
    body: DetectionSaveRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    logger.info(f"POST /detections - User: {current_user['email']}, Disease: {body.disease}")

    user_client = create_user_client(current_user["token"])

    payload = {
        "user_id": current_user["id"],
        "image_url": body.image_url,
        "disease": body.disease,
        "confidence": round(body.confidence, 2),
        "severity_level": body.severity_level,
        "severity_score": body.severity_score,
        "treatment": body.treatment,
        "all_probabilities": body.all_probabilities,
        "notes": body.notes,
        "location": body.location
    }

    logger.debug(f"Saving detection payload: {payload}")

    try:
        result = (
            user_client.table("detection_history")
            .insert(payload)
            .execute()
        )
        logger.info(f"Detection saved successfully - ID: {result.data[0]['id'] if result.data else 'unknown'}")
    except Exception as e:
        logger.error(f"Failed to save detection for user {current_user['email']}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to save detection: {str(e)}")

    return {
        "message": "Detection saved",
        "data": result.data[0] if result.data else None
    }

@app.get("/detections")
async def get_detections(current_user: Dict[str, Any] = Depends(get_current_user)):
    logger.info(f"GET /detections - User: {current_user['email']}")

    user_client = create_user_client(current_user["token"])

    try:
        result = (
            user_client.table("detection_history")
            .select("*")
            .eq("user_id", current_user["id"])
            .order("created_at", desc=True)
            .execute()
        )
        logger.info(f"Retrieved {len(result.data)} detections for user {current_user['email']}")
    except Exception as e:
        logger.error(f"Failed to load detections for user {current_user['email']}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to load detections: {str(e)}")

    return result.data

@app.get("/detections/{detection_id}")
async def get_detection(
    detection_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    user_client = create_user_client(current_user["token"])

    try:
        result = (
            user_client.table("detection_history")
            .select("*")
            .eq("id", detection_id)
            .eq("user_id", current_user["id"])
            .limit(1)
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load detection: {str(e)}")

    if not result.data:
        raise HTTPException(status_code=404, detail="Detection not found")

    return result.data[0]

@app.delete("/detections/{detection_id}")
async def delete_detection(
    detection_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    user_client = create_user_client(current_user["token"])

    try:
        result = (
            user_client.table("detection_history")
            .delete()
            .eq("id", detection_id)
            .eq("user_id", current_user["id"])
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete detection: {str(e)}")

    return {
        "message": "Detection deleted",
        "data": result.data
    }

# =========================================================
# Prediction route
# =========================================================

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    logger.info(f"POST /predict - User: {current_user['email']}")

    if model is None:
        logger.error("Model is None - not loaded")
        raise HTTPException(status_code=500, detail="Model is not loaded")

    if not file.content_type or not file.content_type.startswith("image/"):
        logger.warning(f"Invalid content type: {file.content_type}")
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        logger.info(f"Reading uploaded file: {file.filename} (type: {file.content_type})")
        img_bytes = await file.read()
        logger.info(f"File read successfully - size: {len(img_bytes)} bytes")

        image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        logger.info(f"Image loaded - dimensions: {image.size}")

    except UnidentifiedImageError as e:
        logger.error(f"Invalid image file - cannot identify format: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid image file")
    except Exception as e:
        logger.error(f"Error reading uploaded image: {str(e)}", exc_info=True)
        raise HTTPException(status_code=400, detail="Could not read uploaded image")

    try:
        logger.info("Starting image preprocessing...")

        device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')

        transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])

        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        img_tensor = transform(img).unsqueeze(0).to(device)
        logger.info(f"Image tensor shape: {img_tensor.shape}")

        logger.info("Running model inference...")
        with torch.no_grad():
            outputs = model(img_tensor)
            probabilities = torch.softmax(outputs, dim=1)[0]
            predicted_idx = torch.argmax(probabilities).item()
            confidence_val = float(probabilities[predicted_idx])

        logger.info(f"Model output - predicted index: {predicted_idx}")

        if predicted_idx < 0 or predicted_idx >= len(DISEASE_CLASSES):
            logger.error(f"Model output index out of range: {predicted_idx}")
            raise HTTPException(status_code=500, detail="Model output mismatch")

        disease = DISEASE_CLASSES[predicted_idx]
        severity = get_severity(confidence_val, disease)

        all_probs = {
            DISEASE_CLASSES[i]: round(float(probabilities[i]) * 100, 2)
            for i in range(len(DISEASE_CLASSES))
        }

        treatment = TREATMENTS.get(disease, TREATMENTS["Healthy"])["en"]

        logger.info(f"Prediction complete - Disease: {disease}, Confidence: {confidence_val*100:.2f}%, Severity: {severity['level']}")

        return {
            "disease": disease,
            "confidence": round(confidence_val * 100, 2),
            "severity": severity,
            "treatment": treatment,
            "all_probabilities": all_probs,
            "model": "PyTorch-ResNet50"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

# =========================================================
# Predict + save in one request
# =========================================================

@app.post("/predict-and-save")
async def predict_and_save(
    file: UploadFile = File(...),
    notes: Optional[str] = None,
    location: Optional[str] = None,
    image_url: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    if model is None:
        raise HTTPException(status_code=500, detail="Model is not loaded")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        img_bytes = await file.read()
        image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Invalid image file")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read uploaded image")

    try:
        device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')

        transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])

        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        img_tensor = transform(img).unsqueeze(0).to(device)

        with torch.no_grad():
            outputs = model(img_tensor)
            probabilities = torch.softmax(outputs, dim=1)[0]
            predicted_idx = torch.argmax(probabilities).item()
            confidence_val = float(probabilities[predicted_idx])

        if predicted_idx < 0 or predicted_idx >= len(DISEASE_CLASSES):
            raise HTTPException(status_code=500, detail="Model output mismatch")

        disease = DISEASE_CLASSES[predicted_idx]
        severity = get_severity(confidence_val, disease)

        all_probs = {
            DISEASE_CLASSES[i]: round(float(probabilities[i]) * 100, 2)
            for i in range(len(DISEASE_CLASSES))
        }

        treatment = TREATMENTS.get(disease, TREATMENTS["Healthy"])["en"]

        prediction_response = {
            "disease": disease,
            "confidence": round(confidence_val * 100, 2),
            "severity": severity,
            "treatment": treatment,
            "all_probabilities": all_probs,
            "model": "PyTorch-ResNet50"
        }

        user_client = create_user_client(current_user["token"])
        save_payload = {
            "user_id": current_user["id"],
            "image_url": image_url,
            "disease": disease,
            "confidence": round(confidence_val * 100, 2),
            "severity_level": severity["level"],
            "severity_score": severity["score"],
            "treatment": treatment,
            "all_probabilities": all_probs,
            "notes": notes,
            "location": location
        }

        save_result = (
            user_client.table("detection_history")
            .insert(save_payload)
            .execute()
        )

        return {
            **prediction_response,
            "saved_detection": save_result.data[0] if save_result.data else None
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction/save failed: {str(e)}")

# =========================================================
# Optional admin stats route
# Works only if your authenticated user has admin rights and
# RLS/view permissions allow it.
# =========================================================

@app.get("/admin/stats")
async def admin_stats(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_client = create_user_client(current_user["token"])

    try:
        result = user_client.table("admin_stats").select("*").execute()
    except Exception as e:
        raise HTTPException(status_code=403, detail=f"Cannot load admin stats: {str(e)}")

    return result.data[0] if result.data else {}

# =========================================================
# Profile photo upload
# =========================================================

@app.post("/profile/upload-photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Upload a profile photo for the user.
    Stores in Supabase Storage (profile-photos bucket) and updates profile.
    """
    logger.info(f"POST /profile/upload-photo - User: {current_user['email']}")

    if not file.content_type or not file.content_type.startswith("image/"):
        logger.warning(f"Invalid content type for profile photo: {file.content_type}")
        raise HTTPException(status_code=400, detail="File must be an image")

    # Validate file size (max 5MB)
    file_content = await file.read()
    if len(file_content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be less than 5MB")

    # Validate image
    try:
        Image.open(io.BytesIO(file_content)).convert("RGB")
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Invalid image file")
    except Exception as e:
        logger.error(f"Failed to validate image: {str(e)}")
        raise HTTPException(status_code=400, detail="Could not read uploaded image")

    try:
        # Generate unique filename: {user_id}_{timestamp}.{extension}
        file_ext = file.filename.split('.')[-1].lower() if file.filename else 'jpg'
        timestamp = datetime.now().timestamp()
        file_name = f"{current_user['id']}_{timestamp}.{file_ext}"

        logger.info(f"Uploading profile photo: {file_name}")

        # Upload to Supabase Storage
        storage_response = supabase.storage.from_("profile-photos").upload(
            file_name,
            file_content,
            {"contentType": file.content_type}
        )

        # Get public URL
        profile_photo_url = supabase.storage.from_("profile-photos").get_public_url(file_name)

        logger.info(f"Profile photo uploaded successfully - URL: {profile_photo_url}")

        # Update profile with photo URL
        user_client = create_user_client(current_user["token"])

        update_result = (
            user_client.table("profiles")
            .update({"profile_photo_url": profile_photo_url})
            .eq("id", current_user["id"])
            .execute()
        )

        logger.info(f"Profile updated with photo URL for user {current_user['email']}")

        return {
            "message": "Profile photo uploaded successfully",
            "profile_photo_url": profile_photo_url,
            "data": update_result.data[0] if update_result.data else None
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to upload profile photo for user {current_user['email']}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to upload profile photo: {str(e)}")

# =========================================================
# Health check
# =========================================================

@app.get("/health")
def health():
    logger.debug("Health check request")
    health_status = {
        "status": "healthy",
        "framework": "PyTorch-ResNet50",
        "model_loaded": model is not None,
        "classes": DISEASE_CLASSES,
        "timestamp": datetime.now().isoformat()
    }
    logger.debug(f"Health check response: {health_status}")
    return health_status

# =========================================================
# Run locally
# =========================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8001, reload=True)