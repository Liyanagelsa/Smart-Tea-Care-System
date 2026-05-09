from fastapi import APIRouter, Depends
from typing import Any, Dict
from app.models import SignupRequest, SigninRequest, ForgotPasswordRequest
from app.services import SupabaseService
from app.utils import logger, get_current_user, create_user_client
from app.config import SUPABASE_URL, SUPABASE_ANON_KEY
from supabase import create_client

router = APIRouter()

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY) if SUPABASE_URL and SUPABASE_ANON_KEY else None


@router.post("/signup")
async def signup(body: SignupRequest):
    """Sign up with Supabase Auth."""
    if not supabase:
        return {"error": "Supabase not configured"}
    return SupabaseService.signup(supabase, body.email, body.password, body.full_name,
                                  body.plantation_name, body.location)


@router.post("/signin")
async def signin(body: SigninRequest):
    """Sign in with Supabase Auth."""
    if not supabase:
        return {"error": "Supabase not configured"}
    return SupabaseService.signin(supabase, body.email, body.password)


@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest):
    """Send password reset email."""
    if not supabase:
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="Supabase not configured")

    # Default redirect URL if not provided
    redirect_url = body.redirect_url or "http://localhost:3000/reset-password"

    return SupabaseService.forgot_password(supabase, body.email, redirect_url)


@router.post("/signout")
async def signout(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Sign out user."""
    try:
        user_client = create_user_client(current_user["token"])
        user_client.auth.sign_out()
    except Exception:
        pass
    return {"message": "Signed out"}


@router.get("/me")
async def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get current user profile."""
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
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Failed to load profile: {str(e)}")

    profile = result.data[0] if result.data else None

    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "profile": profile
    }
