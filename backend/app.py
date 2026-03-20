"""
Authentication API
FastAPI + Supabase Auth

Save as: main.py
"""

import os
from typing import Any, Dict, Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field
from supabase import Client, create_client

# =========================================================
# Load environment variables
# =========================================================

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise RuntimeError("SUPABASE_URL and SUPABASE_ANON_KEY must be set")

# =========================================================
# FastAPI app
# =========================================================

app = FastAPI(title="Authentication API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS != [""] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# Supabase client
# =========================================================

supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# =========================================================
# Security
# =========================================================

security = HTTPBearer()

# =========================================================
# Request models
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


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    language: Optional[str] = Field(None, pattern="^(en|si|ta)$")


# =========================================================
# Auth helpers
# =========================================================

def create_user_client(access_token: str) -> Client:
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(
            status_code=503,
            detail="Supabase not configured"
        )

    try:
        client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        client.postgrest.auth(access_token)
        return client

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Database connection failed"
        )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict[str, Any]:
    token = credentials.credentials

    try:
        user_response = supabase.auth.get_user(token)
        user = user_response.user

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return {
        "id": user.id,
        "email": user.email,
        "token": token
    }


# =========================================================
# Auth endpoints
# =========================================================

@app.post("/auth/signup")
async def signup(body: SignupRequest):
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
        raise HTTPException(
            status_code=400,
            detail=f"Signup failed: {str(e)}"
        )

    user = response.user
    session = response.session

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Signup failed"
        )

    return {
        "message": "Signup successful",
        "user": {
            "id": user.id,
            "email": user.email
        },
        "access_token": session.access_token if session else None,
        "refresh_token": session.refresh_token if session else None,
        "token_type": "bearer" if session else None
    }


@app.post("/auth/signin")
async def signin(body: SigninRequest):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": body.email,
            "password": body.password
        })

    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Signin failed: {str(e)}"
        )

    user = response.user
    session = response.session

    if not user or not session:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

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
async def signout(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    try:
        user_client = create_user_client(current_user["token"])
        user_client.auth.sign_out()
    except Exception:
        pass

    return {
        "message": "Signed out successfully"
    }


@app.get("/auth/me")
async def get_me(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
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
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load profile: {str(e)}"
        )

    profile = result.data[0] if result.data else None

    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "profile": profile
    }


# =========================================================
# Profile endpoint
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
        raise HTTPException(
            status_code=400,
            detail="No fields to update"
        )

    user_client = create_user_client(current_user["token"])

    try:
        result = (
            user_client.table("profiles")
            .update(update_data)
            .eq("id", current_user["id"])
            .execute()
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Profile update failed: {str(e)}"
        )

    return {
        "message": "Profile updated",
        "data": result.data[0] if result.data else None
    }


# =========================================================
# Protected test endpoint
# =========================================================

@app.get("/protected")
async def protected_route(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    return {
        "message": "Access granted",
        "user": {
            "id": current_user["id"],
            "email": current_user["email"]
        }
    }


# =========================================================
# Health check
# =========================================================

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "Authentication API"
    }


# =========================================================
# Run locally
# =========================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True
    )