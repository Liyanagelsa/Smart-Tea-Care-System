import logging
from typing import Any, Dict
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client, create_client
from app.config import SUPABASE_URL, SUPABASE_ANON_KEY

logger = logging.getLogger("TeaDisease")
security = HTTPBearer()


def create_user_client(access_token: str) -> Client:
    """Create a Supabase client and attach the user's JWT so RLS applies."""
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
    """Validate user token and return user info."""
    logger.debug("Validating user token...")

    token = credentials.credentials

    # Initialize global supabase client
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    except Exception as e:
        logger.error(f"Failed to initialize Supabase: {str(e)}")
        raise HTTPException(status_code=503, detail="Supabase not configured")

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
