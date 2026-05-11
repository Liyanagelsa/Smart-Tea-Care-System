"""Unit tests for the /health endpoint."""
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient


@pytest.fixture
def client():
    with patch("app.services.model_service.ModelService.is_loaded", return_value=True):
        from main import app
        return TestClient(app)


class TestHealthEndpoint:
    def test_health_returns_200(self, client):
        response = client.get("/health")
        assert response.status_code == 200

    def test_health_returns_json(self, client):
        response = client.get("/health")
        data = response.json()
        assert isinstance(data, dict)

    def test_health_has_status_field(self, client):
        response = client.get("/health")
        assert "status" in response.json()

    def test_health_status_is_healthy(self, client):
        response = client.get("/health")
        assert response.json()["status"] == "healthy"

    def test_health_has_model_loaded_field(self, client):
        response = client.get("/health")
        assert "model_loaded" in response.json()

    def test_health_model_loaded_is_bool(self, client):
        response = client.get("/health")
        assert isinstance(response.json()["model_loaded"], bool)

    def test_health_has_classes_field(self, client):
        response = client.get("/health")
        assert "classes" in response.json()

    def test_health_classes_count(self, client):
        response = client.get("/health")
        assert len(response.json()["classes"]) == 6

    def test_health_has_timestamp(self, client):
        response = client.get("/health")
        assert "timestamp" in response.json()

    def test_health_no_auth_required(self, client):
        """Health endpoint must be publicly accessible."""
        response = client.get("/health")
        assert response.status_code != 401
        assert response.status_code != 403
