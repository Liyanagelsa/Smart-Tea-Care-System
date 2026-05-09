from fastapi import APIRouter, File, UploadFile, Depends
from typing import Any, Dict
from app.models import ProfileUpdateRequest
from app.services import SupabaseService
from app.utils import logger, get_current_user, create_user_client
from app.config import SUPABASE_URL, SUPABASE_ANON_KEY
from supabase import create_client

router = APIRouter()

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY) if SUPABASE_URL and SUPABASE_ANON_KEY else None


@router.patch("/profile")
async def update_profile(
    body: ProfileUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Update user profile (name, language)."""
    update_data = {}

    if body.full_name is not None:
        update_data["full_name"] = body.full_name.strip()

    if body.language is not None:
        update_data["language"] = body.language

    if not update_data:
        from fastapi import HTTPException
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
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Profile update failed: {str(e)}")

    return {
        "message": "Profile updated",
        "data": result.data[0] if result.data else None
    }


@router.post("/profile/upload-photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Upload profile photo."""
    if not supabase:
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="Supabase not configured")

    if not file.content_type or not file.content_type.startswith("image/"):
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        file_content = await file.read()
        user_client = create_user_client(current_user["token"])

        return SupabaseService.upload_profile_photo(
            supabase,
            user_client,
            current_user["id"],
            file_content,
            file.content_type,
            file.filename
        )

    except Exception as e:
        logger.error(f"Error uploading profile photo: {str(e)}", exc_info=True)
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Could not upload profile photo")
