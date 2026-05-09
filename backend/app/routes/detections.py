from fastapi import APIRouter, Depends
from typing import Any, Dict
from app.models import DetectionSaveRequest
from app.services import SupabaseService
from app.utils import logger, get_current_user, create_user_client

router = APIRouter()


@router.post("/detections")
async def save_detection(
    body: DetectionSaveRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Manually save a detection record."""
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

    result = SupabaseService.save_detection(user_client, current_user["id"], payload)
    return {"message": "Detection saved", "data": result}


@router.get("/detections")
async def get_detections(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get all detection history for current user."""
    user_client = create_user_client(current_user["token"])
    detections = SupabaseService.get_detections(user_client, current_user["id"])
    return detections


@router.get("/detections/{detection_id}")
async def get_detection(
    detection_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get a specific detection record."""
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
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Failed to load detection: {str(e)}")

    if not result.data:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Detection not found")

    return result.data[0]


@router.delete("/detections/{detection_id}")
async def delete_detection(
    detection_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete a detection record."""
    user_client = create_user_client(current_user["token"])
    result = SupabaseService.delete_detection(user_client, detection_id, current_user["id"])
    return result
