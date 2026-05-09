import os
import io
import logging
from typing import Any, Dict, List
import numpy as np
from PIL import Image, UnidentifiedImageError
from fastapi import HTTPException
from ultralytics import YOLO
from app.config import MODEL_PATH
from app.constants import DISEASE_CLASSES, TREATMENTS
from app.utils.severity import get_severity

logger = logging.getLogger("TeaDisease")


class ModelService:
    """Service for handling ML model operations with YOLOv8."""

    _instance = None
    model = None

    def __new__(cls):
        """Singleton pattern - only one instance of ModelService."""
        if cls._instance is None:
            cls._instance = super(ModelService, cls).__new__(cls)
        return cls._instance

    @classmethod
    def load_model(cls) -> None:
        """Load the YOLOv8 model from disk."""
        logger.info(f"Starting model loading from {MODEL_PATH}")

        if not os.path.exists(MODEL_PATH):
            logger.error(f"Model file not found: {MODEL_PATH}")
            raise RuntimeError(f"Model file not found: {MODEL_PATH}")

        try:
            logger.info(f"Loading YOLOv8 model from {MODEL_PATH}")
            cls.model = YOLO(MODEL_PATH)

            logger.info(f"Model loaded successfully")
            logger.info(f"Model framework: YOLOv8")
            logger.info(f"Model output classes: {len(DISEASE_CLASSES)}")
            logger.info(f"Disease classes: {DISEASE_CLASSES}")

        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}", exc_info=True)
            raise

    @classmethod
    def is_loaded(cls) -> bool:
        """Check if model is loaded."""
        return cls.model is not None

    @staticmethod
    def preprocess_image(img_bytes: bytes) -> np.ndarray:
        """Preprocess image for model inference."""
        try:
            img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
            img_array = np.array(img, dtype=np.uint8)
            logger.info(f"Image preprocessed - shape: {img_array.shape}")
            return img_array

        except UnidentifiedImageError:
            raise HTTPException(status_code=400, detail="Invalid image file")
        except Exception as e:
            logger.error(f"Error preprocessing image: {str(e)}", exc_info=True)
            raise HTTPException(status_code=400, detail="Could not preprocess image")

    @classmethod
    def predict(cls, img_array: np.ndarray) -> Dict[str, Any]:
        """Run inference on preprocessed image."""
        if cls.model is None:
            logger.error("Model is None - not loaded")
            raise HTTPException(status_code=500, detail="Model is not loaded")

        try:
            logger.info("Running YOLOv8 inference...")

            # Run YOLO inference
            results = cls.model.predict(source=img_array, conf=0.25, verbose=False)
            result = results[0]

            logger.info(f"Inference complete - detections: {len(result.boxes)}")

            # Parse detections
            detections = cls._parse_detections(result)

            if not detections:
                # No detections - assume healthy
                logger.info("No disease detections found - classifying as Healthy")
                return {
                    "disease": "Healthy",
                    "confidence": 100.0,
                    "severity": {"level": "None", "score": 0},
                    "treatment": TREATMENTS.get("Healthy", {}).get("en", ""),
                    "detections": [],
                    "all_probabilities": {disease: 0.0 for disease in DISEASE_CLASSES},
                    "model": "YOLOv8",
                }

            # Get top detection
            top_detection = max(detections, key=lambda x: x["confidence"])
            disease = top_detection["class_name"]
            confidence = top_detection["confidence"]

            # Calculate all probabilities (normalized from detections)
            all_probs = cls._calculate_probabilities(detections)

            # Get severity
            severity = get_severity(confidence / 100.0, disease)

            # Get treatment
            treatment = TREATMENTS.get(disease, TREATMENTS.get("Healthy", {})).get("en", "")

            logger.info(
                f"Prediction complete - Disease: {disease}, Confidence: {confidence:.2f}%, Severity: {severity['level']}"
            )

            return {
                "disease": disease,
                "confidence": round(confidence, 2),
                "severity": severity,
                "treatment": treatment,
                "detections": detections,
                "all_probabilities": all_probs,
                "model": "YOLOv8",
            }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    @staticmethod
    def _parse_detections(result) -> List[Dict[str, Any]]:
        """Parse YOLO detection results."""
        detections = []

        if result.boxes is None or len(result.boxes) == 0:
            return detections

        for box in result.boxes:
            class_id = int(box.cls)
            confidence = float(box.conf)

            # Validate class_id
            if class_id < 0 or class_id >= len(DISEASE_CLASSES):
                logger.warning(f"Invalid class_id {class_id}, skipping detection")
                continue

            disease = DISEASE_CLASSES[class_id]
            coords = box.xyxy[0].cpu().numpy() if hasattr(box.xyxy, 'cpu') else box.xyxy[0]

            detection = {
                "class_id": class_id,
                "class_name": disease,
                "confidence": round(confidence * 100, 2),
                "bbox": {
                    "x1": float(coords[0]),
                    "y1": float(coords[1]),
                    "x2": float(coords[2]),
                    "y2": float(coords[3]),
                },
            }
            detections.append(detection)
            logger.info(f"Detection: {disease} ({confidence * 100:.2f}%)")

        return detections

    @staticmethod
    def _calculate_probabilities(detections: List[Dict[str, Any]]) -> Dict[str, float]:
        """Calculate probabilities for all disease classes from detections."""
        probs = {disease: 0.0 for disease in DISEASE_CLASSES}

        if not detections:
            return probs

        # Get max confidence for each disease class
        for detection in detections:
            disease = detection["class_name"]
            confidence = detection["confidence"]
            probs[disease] = max(probs[disease], confidence)

        # Normalize to sum to 100
        total = sum(probs.values())
        if total > 0:
            probs = {k: round(v / total * 100, 2) for k, v in probs.items()}

        return probs
