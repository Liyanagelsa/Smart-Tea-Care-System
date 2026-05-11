from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from typing import Any, Dict, Optional
from app.services import ModelService, SupabaseService
from app.utils import logger, get_current_user, create_user_client
from app.models import DetectionSaveRequest

router = APIRouter()
model_service = ModelService()


@router.post("/predict")
async def predict(
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Upload tea leaf image and get disease prediction."""
    logger.info(f"POST /predict - User: {current_user['email']}")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        img_bytes = await file.read()
        logger.info(f"File read successfully - size: {len(img_bytes)} bytes")

        # Preprocess and predict
        img_array = model_service.preprocess_image(img_bytes)
        prediction = model_service.predict(img_array)

        return prediction

    except HTTPException:
        # Re-raise validation errors without logging traceback
        raise
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}", exc_info=True)
        raise HTTPException(status_code=400, detail="Could not read uploaded image")


@router.post("/predict-and-save")
async def predict_and_save(
    file: UploadFile = File(...),
    notes: Optional[str] = None,
    location: Optional[str] = None,
    image_url: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Upload image, get prediction, and save to detection history."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        img_bytes = await file.read()

        # Preprocess and predict
        img_array = model_service.preprocess_image(img_bytes)
        prediction = model_service.predict(img_array)

        # Save to database
        user_client = create_user_client(current_user["token"])
        save_payload = {
            "user_id": current_user["id"],
            "image_url": image_url,
            "disease": prediction["disease"],
            "confidence": prediction["confidence"],
            "severity_level": prediction["severity"]["level"],
            "severity_score": prediction["severity"]["score"],
            "treatment": prediction["treatment"],
            "all_probabilities": prediction["all_probabilities"],
            "notes": notes,
            "location": location
        }

        saved_detection = SupabaseService.save_detection(user_client, current_user["id"], save_payload)

        return {
            **prediction,
            "saved_detection": saved_detection
        }

    except HTTPException:
        # Re-raise validation errors without logging traceback
        raise
    except Exception as e:
        logger.error(f"Prediction/save failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Prediction/save failed: {str(e)}")
