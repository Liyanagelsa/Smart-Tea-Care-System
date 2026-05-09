import io
import logging
from typing import Any, Dict, Optional
from datetime import datetime
from fastapi import HTTPException
from PIL import Image, UnidentifiedImageError
from supabase import Client, create_client
from app.config import SUPABASE_URL, SUPABASE_ANON_KEY
from app.utils.security import create_user_client

logger = logging.getLogger("TeaDisease")


class SupabaseService:
    """Service for handling Supabase database operations."""

    @staticmethod
    def initialize_client() -> Optional[Client]:
        """Initialize Supabase client."""
        if not SUPABASE_URL or not SUPABASE_ANON_KEY:
            logger.warning("Running with limited functionality - Supabase credentials missing")
            return None

        try:
            logger.info("Initializing Supabase client...")
            client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
            logger.info("Supabase client initialized")
            return client
        except Exception as e:
            logger.error(f"Failed to initialize Supabase: {str(e)}")
            return None

    @staticmethod
    def signup(supabase: Client, email: str, password: str, full_name: str,
               plantation_name: str = "", location: str = "") -> Dict[str, Any]:
        """Sign up new user."""
        logger.info(f"Sign up attempt - Email: {email}, Name: {full_name}")

        try:
            response = supabase.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": {
                        "full_name": full_name,
                        "plantation_name": plantation_name,
                        "location": location
                    }
                }
            })

            user = response.user
            session = response.session

            if not user:
                logger.error(f"Sign up - user creation failed for {email}")
                raise HTTPException(status_code=400, detail="Signup failed")

            logger.info(f"Sign up successful - User: {user.email} (ID: {user.id})")

            return {
                "message": "Signup successful",
                "user": {"id": user.id, "email": user.email},
                "access_token": session.access_token if session else None,
                "refresh_token": session.refresh_token if session else None,
                "token_type": "bearer" if session else None
            }

        except Exception as e:
            logger.error(f"Sign up failed for {email}: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Signup failed: {str(e)}")

    @staticmethod
    def forgot_password(supabase: Client, email: str, redirect_url: str) -> Dict[str, Any]:
        """Send password reset email."""
        logger.info(f"Password reset requested - Email: {email}")

        try:
            response = supabase.auth.reset_password_for_email(
                email,
                {"redirect_to": redirect_url}
            )

            logger.info(f"Password reset email sent - Email: {email}")

            return {
                "message": "Password reset email sent successfully",
                "email": email
            }

        except Exception as e:
            logger.error(f"Password reset request failed for {email}: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Password reset request failed: {str(e)}")

    @staticmethod
    def signin(supabase: Client, email: str, password: str) -> Dict[str, Any]:
        """Sign in user."""
        logger.info(f"Sign in attempt - Email: {email}")

        try:
            response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })

            user = response.user
            session = response.session

            if not user or not session:
                logger.warning(f"Sign in validation failed for {email}")
                raise HTTPException(status_code=401, detail="Invalid credentials")

            logger.info(f"Sign in successful - User: {user.email} (ID: {user.id})")

            return {
                "access_token": session.access_token,
                "refresh_token": session.refresh_token,
                "token_type": "bearer",
                "user": {"id": user.id, "email": user.email}
            }

        except Exception as e:
            logger.error(f"Sign in failed for {email}: {str(e)}")
            raise HTTPException(status_code=401, detail=f"Signin failed: {str(e)}")

    @staticmethod
    def save_detection(user_client: Client, user_id: str, detection_data: Dict[str, Any]) -> Dict[str, Any]:
        """Save detection record to database."""
        logger.info(f"Saving detection - User: {user_id}, Disease: {detection_data.get('disease')}")

        try:
            result = (
                user_client.table("detection_history")
                .insert(detection_data)
                .execute()
            )
            logger.info(f"Detection saved successfully - ID: {result.data[0]['id'] if result.data else 'unknown'}")
            return result.data[0] if result.data else None

        except Exception as e:
            logger.error(f"Failed to save detection: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Failed to save detection: {str(e)}")

    @staticmethod
    def get_detections(user_client: Client, user_id: str) -> list:
        """Get all detections for user."""
        logger.info(f"GET /detections - User: {user_id}")

        try:
            result = (
                user_client.table("detection_history")
                .select("*")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .execute()
            )
            logger.info(f"Retrieved {len(result.data)} detections for user")
            return result.data

        except Exception as e:
            logger.error(f"Failed to load detections: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Failed to load detections: {str(e)}")

    @staticmethod
    def delete_detection(user_client: Client, detection_id: str, user_id: str) -> Dict[str, Any]:
        """Delete a detection record."""
        try:
            result = (
                user_client.table("detection_history")
                .delete()
                .eq("id", detection_id)
                .eq("user_id", user_id)
                .execute()
            )
            return {"message": "Detection deleted", "data": result.data}

        except Exception as e:
            logger.error(f"Failed to delete detection: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to delete detection: {str(e)}")

    @staticmethod
    def upload_profile_photo(supabase: Client, user_client: Client, user_id: str,
                             file_content: bytes, content_type: str, filename: str) -> Dict[str, Any]:
        """Upload profile photo to Supabase Storage."""
        logger.info(f"POST /profile/upload-photo - User: {user_id}")

        # Validate file size
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
            # Generate unique filename
            file_ext = filename.split('.')[-1].lower() if filename else 'jpg'
            timestamp = datetime.now().timestamp()
            file_name = f"{user_id}_{timestamp}.{file_ext}"

            logger.info(f"Uploading profile photo: {file_name}")

            # Upload to Supabase Storage
            supabase.storage.from_("profile-photos").upload(
                file_name,
                file_content,
                {"contentType": content_type}
            )

            # Get public URL
            profile_photo_url = supabase.storage.from_("profile-photos").get_public_url(file_name)
            logger.info(f"Profile photo uploaded - URL: {profile_photo_url}")

            # Update profile
            update_result = (
                user_client.table("profiles")
                .update({"profile_photo_url": profile_photo_url})
                .eq("id", user_id)
                .execute()
            )

            logger.info(f"Profile updated with photo URL")

            return {
                "message": "Profile photo uploaded successfully",
                "profile_photo_url": profile_photo_url,
                "data": update_result.data[0] if update_result.data else None
            }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to upload profile photo: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Failed to upload profile photo: {str(e)}")
