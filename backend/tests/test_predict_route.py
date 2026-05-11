"""Unit tests for prediction API routes."""
import io
import pytest
import numpy as np
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from PIL import Image


AUTH_USER = {"id": "user-uuid-456", "email": "user@example.com", "token": "user-token", "role": "user"}

MOCK_PREDICTION = {
    "disease": "Brown Blight",
    "confidence": 92.5,
    "severity": {"level": "Severe", "score": 3, "color": "red"},
    "treatment": {
        "cause": "Fungal pathogen",
        "immediate": ["Remove affected leaves"],
        "chemical": ["Apply fungicide"],
        "organic": ["Neem oil spray"],
        "preventive": ["Improve air circulation"]
    },
    "detections": [{"class_id": 1, "class_name": "Brown Blight", "confidence": 92.5,
                    "bbox": {"x1": 10.0, "y1": 10.0, "x2": 100.0, "y2": 100.0}}],
    "all_probabilities": {"Algal Leaf Spot": 0.0, "Brown Blight": 100.0, "Gray Blight": 0.0,
                          "Healthy": 0.0, "Helopeltis": 0.0, "Red Leaf Spot": 0.0},
    "model": "YOLOv8"
}


def make_valid_image_bytes():
    """Generate minimal valid JPEG bytes using PIL."""
    img = Image.new("RGB", (100, 100), color=(100, 150, 100))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


@pytest.fixture
def client():
    from main import app
    from app.utils.security import get_current_user
    app.dependency_overrides[get_current_user] = lambda: AUTH_USER
    yield TestClient(app)
    app.dependency_overrides.clear()


class TestPredictEndpoint:
    def test_predict_no_auth_returns_403(self):
        """Without dependency override, missing token returns 403."""
        from main import app
        bare_client = TestClient(app)
        img_bytes = make_valid_image_bytes()
        response = bare_client.post("/predict",
                                    files={"file": ("leaf.jpg", img_bytes, "image/jpeg")})
        assert response.status_code == 403

    def test_predict_non_image_returns_400(self, client):
        with patch("app.routes.predict.model_service") as mock_ms:
            mock_ms.preprocess_image.return_value = np.zeros((100, 100, 3), dtype=np.uint8)
            mock_ms.predict.return_value = MOCK_PREDICTION
            response = client.post("/predict",
                                   files={"file": ("doc.pdf", b"fake-pdf-content", "application/pdf")})
            assert response.status_code == 400

    def test_predict_success_returns_200(self, client):
        with patch("app.routes.predict.model_service") as mock_ms:
            mock_ms.preprocess_image.return_value = np.zeros((100, 100, 3), dtype=np.uint8)
            mock_ms.predict.return_value = MOCK_PREDICTION
            img_bytes = make_valid_image_bytes()
            response = client.post("/predict",
                                   files={"file": ("leaf.jpg", img_bytes, "image/jpeg")})
            assert response.status_code == 200

    def test_predict_success_returns_disease(self, client):
        with patch("app.routes.predict.model_service") as mock_ms:
            mock_ms.preprocess_image.return_value = np.zeros((100, 100, 3), dtype=np.uint8)
            mock_ms.predict.return_value = MOCK_PREDICTION
            img_bytes = make_valid_image_bytes()
            data = client.post("/predict",
                               files={"file": ("leaf.jpg", img_bytes, "image/jpeg")}).json()
            assert "disease" in data

    def test_predict_success_returns_confidence(self, client):
        with patch("app.routes.predict.model_service") as mock_ms:
            mock_ms.preprocess_image.return_value = np.zeros((100, 100, 3), dtype=np.uint8)
            mock_ms.predict.return_value = MOCK_PREDICTION
            img_bytes = make_valid_image_bytes()
            data = client.post("/predict",
                               files={"file": ("leaf.jpg", img_bytes, "image/jpeg")}).json()
            assert "confidence" in data

    def test_predict_success_returns_severity(self, client):
        with patch("app.routes.predict.model_service") as mock_ms:
            mock_ms.preprocess_image.return_value = np.zeros((100, 100, 3), dtype=np.uint8)
            mock_ms.predict.return_value = MOCK_PREDICTION
            img_bytes = make_valid_image_bytes()
            data = client.post("/predict",
                               files={"file": ("leaf.jpg", img_bytes, "image/jpeg")}).json()
            assert "severity" in data

    def test_predict_success_returns_treatment(self, client):
        with patch("app.routes.predict.model_service") as mock_ms:
            mock_ms.preprocess_image.return_value = np.zeros((100, 100, 3), dtype=np.uint8)
            mock_ms.predict.return_value = MOCK_PREDICTION
            img_bytes = make_valid_image_bytes()
            data = client.post("/predict",
                               files={"file": ("leaf.jpg", img_bytes, "image/jpeg")}).json()
            assert "treatment" in data

    def test_predict_disease_name_matches(self, client):
        with patch("app.routes.predict.model_service") as mock_ms:
            mock_ms.preprocess_image.return_value = np.zeros((100, 100, 3), dtype=np.uint8)
            mock_ms.predict.return_value = MOCK_PREDICTION
            img_bytes = make_valid_image_bytes()
            data = client.post("/predict",
                               files={"file": ("leaf.jpg", img_bytes, "image/jpeg")}).json()
            assert data["disease"] == "Brown Blight"

    def test_predict_confidence_matches(self, client):
        with patch("app.routes.predict.model_service") as mock_ms:
            mock_ms.preprocess_image.return_value = np.zeros((100, 100, 3), dtype=np.uint8)
            mock_ms.predict.return_value = MOCK_PREDICTION
            img_bytes = make_valid_image_bytes()
            data = client.post("/predict",
                               files={"file": ("leaf.jpg", img_bytes, "image/jpeg")}).json()
            assert data["confidence"] == 92.5

    def test_predict_model_error_returns_400(self, client):
        with patch("app.routes.predict.model_service") as mock_ms:
            mock_ms.preprocess_image.return_value = np.zeros((100, 100, 3), dtype=np.uint8)
            mock_ms.predict.side_effect = Exception("Model inference failed")
            img_bytes = make_valid_image_bytes()
            response = client.post("/predict",
                                   files={"file": ("leaf.jpg", img_bytes, "image/jpeg")})
            assert response.status_code == 400

    def test_predict_png_accepted(self, client):
        with patch("app.routes.predict.model_service") as mock_ms:
            mock_ms.preprocess_image.return_value = np.zeros((100, 100, 3), dtype=np.uint8)
            mock_ms.predict.return_value = MOCK_PREDICTION
            img = Image.new("RGB", (100, 100), color=(100, 150, 100))
            buf = io.BytesIO()
            img.save(buf, format="PNG")
            png_bytes = buf.getvalue()
            response = client.post("/predict",
                                   files={"file": ("leaf.png", png_bytes, "image/png")})
            assert response.status_code == 200

    def test_predict_healthy_disease(self, client):
        healthy_prediction = {**MOCK_PREDICTION, "disease": "Healthy", "confidence": 97.0,
                              "severity": {"level": "None", "score": 0, "color": "green"}}
        with patch("app.routes.predict.model_service") as mock_ms:
            mock_ms.preprocess_image.return_value = np.zeros((100, 100, 3), dtype=np.uint8)
            mock_ms.predict.return_value = healthy_prediction
            img_bytes = make_valid_image_bytes()
            data = client.post("/predict",
                               files={"file": ("healthy.jpg", img_bytes, "image/jpeg")}).json()
            assert data["disease"] == "Healthy"
            assert data["severity"]["level"] == "None"


class TestPredictAndSaveEndpoint:
    def test_predict_and_save_non_image_returns_400(self, client):
        response = client.post("/predict-and-save",
                               files={"file": ("doc.txt", b"text content", "text/plain")})
        assert response.status_code == 400

    def test_predict_and_save_success(self, client):
        mock_user_client = MagicMock()
        save_result = MagicMock()
        save_result.data = [{"id": "new-det-id", "disease": "Brown Blight"}]
        mock_user_client.table.return_value.insert.return_value.execute.return_value = save_result

        with patch("app.routes.predict.model_service") as mock_ms, \
             patch("app.routes.predict.create_user_client", return_value=mock_user_client), \
             patch("app.services.supabase_service.SupabaseService.save_detection",
                   return_value={"id": "new-det-id"}):
            mock_ms.preprocess_image.return_value = np.zeros((100, 100, 3), dtype=np.uint8)
            mock_ms.predict.return_value = MOCK_PREDICTION
            img_bytes = make_valid_image_bytes()
            response = client.post("/predict-and-save",
                                   files={"file": ("leaf.jpg", img_bytes, "image/jpeg")})
            assert response.status_code == 200

    def test_predict_and_save_returns_saved_detection(self, client):
        with patch("app.routes.predict.model_service") as mock_ms, \
             patch("app.routes.predict.create_user_client", return_value=MagicMock()), \
             patch("app.services.supabase_service.SupabaseService.save_detection",
                   return_value={"id": "new-det-id", "disease": "Brown Blight"}):
            mock_ms.preprocess_image.return_value = np.zeros((100, 100, 3), dtype=np.uint8)
            mock_ms.predict.return_value = MOCK_PREDICTION
            img_bytes = make_valid_image_bytes()
            data = client.post("/predict-and-save",
                               files={"file": ("leaf.jpg", img_bytes, "image/jpeg")}).json()
            assert "saved_detection" in data
