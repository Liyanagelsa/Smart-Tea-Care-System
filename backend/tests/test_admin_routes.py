"""Unit tests for admin API routes."""
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

ADMIN_USER = {"id": "admin-uuid-123", "email": "admin@gmail.com", "token": "admin-token", "role": "admin"}
REGULAR_USER = {"id": "user-uuid-456", "email": "user@example.com", "token": "user-token", "role": "user"}

SAMPLE_USERS = [
    {"id": "user-uuid-1", "email": "farmer1@example.com", "full_name": "Farmer One", "role": "user",
     "created_at": "2026-01-15T10:00:00+00:00"},
    {"id": "admin-uuid-123", "email": "admin@gmail.com", "full_name": "Admin", "role": "admin",
     "created_at": "2026-01-01T10:00:00+00:00"},
]

SAMPLE_DETECTIONS = [
    {"id": "det-1", "user_id": "user-uuid-1", "disease": "Brown Blight", "confidence": 92.5,
     "severity_level": "Severe", "created_at": "2026-05-01T10:00:00+00:00"},
    {"id": "det-2", "user_id": "user-uuid-1", "disease": "Healthy", "confidence": 88.0,
     "severity_level": "None", "created_at": "2026-04-15T10:00:00+00:00"},
]


def make_admin_db_mock(users=None, detections=None):
    """Build a mock Supabase client where .execute().data returns configured lists."""
    users = users if users is not None else SAMPLE_USERS
    detections = detections if detections is not None else SAMPLE_DETECTIONS

    def make_table_mock(data):
        t = MagicMock()
        result = MagicMock()
        result.data = data
        # Every chained call returns the same mock so any chain ends at execute()
        t.select.return_value = t
        t.order.return_value = t
        t.range.return_value = t
        t.limit.return_value = t
        t.eq.return_value = t
        t.gte.return_value = t
        t.lte.return_value = t
        t.update.return_value = t
        t.delete.return_value = t
        t.execute.return_value = result
        return t

    mock = MagicMock()
    profiles_mock = make_table_mock(users)
    detections_mock = make_table_mock(detections)

    def table_side(name):
        return profiles_mock if name == "profiles" else detections_mock

    mock.table.side_effect = table_side
    return mock


@pytest.fixture
def admin_client():
    from main import app
    from app.utils.security import get_current_user
    app.dependency_overrides[get_current_user] = lambda: ADMIN_USER
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def user_client():
    from main import app
    from app.utils.security import get_current_user
    app.dependency_overrides[get_current_user] = lambda: REGULAR_USER
    yield TestClient(app)
    app.dependency_overrides.clear()


class TestAdminStats:
    def test_stats_requires_admin(self, user_client):
        with patch("app.routes.admin.create_admin_client", return_value=make_admin_db_mock()):
            response = user_client.get("/admin/stats")
            assert response.status_code == 403

    def test_stats_returns_200_for_admin(self, admin_client):
        with patch("app.routes.admin.create_admin_client", return_value=make_admin_db_mock()):
            response = admin_client.get("/admin/stats")
            assert response.status_code == 200

    def test_stats_has_total_users(self, admin_client):
        with patch("app.routes.admin.create_admin_client", return_value=make_admin_db_mock()):
            data = admin_client.get("/admin/stats").json()
            assert "totalUsers" in data

    def test_stats_has_total_detections(self, admin_client):
        with patch("app.routes.admin.create_admin_client", return_value=make_admin_db_mock()):
            data = admin_client.get("/admin/stats").json()
            assert "totalDetections" in data

    def test_stats_has_avg_confidence(self, admin_client):
        with patch("app.routes.admin.create_admin_client", return_value=make_admin_db_mock()):
            data = admin_client.get("/admin/stats").json()
            assert "avgConfidence" in data

    def test_stats_total_users_correct(self, admin_client):
        with patch("app.routes.admin.create_admin_client", return_value=make_admin_db_mock()):
            data = admin_client.get("/admin/stats").json()
            assert data["totalUsers"] == len(SAMPLE_USERS)

    def test_stats_total_detections_correct(self, admin_client):
        with patch("app.routes.admin.create_admin_client", return_value=make_admin_db_mock()):
            data = admin_client.get("/admin/stats").json()
            assert data["totalDetections"] == len(SAMPLE_DETECTIONS)

    def test_stats_empty_detections_zero_confidence(self, admin_client):
        with patch("app.routes.admin.create_admin_client", return_value=make_admin_db_mock(detections=[])):
            data = admin_client.get("/admin/stats").json()
            assert data["avgConfidence"] == 0

    def test_stats_has_top_disease(self, admin_client):
        with patch("app.routes.admin.create_admin_client", return_value=make_admin_db_mock()):
            data = admin_client.get("/admin/stats").json()
            assert "topDisease" in data


class TestAdminGetUsers:
    def test_get_users_requires_admin(self, user_client):
        with patch("app.routes.admin.create_admin_client", return_value=make_admin_db_mock()):
            response = user_client.get("/admin/users")
            assert response.status_code == 403

    def test_get_users_returns_200_for_admin(self, admin_client):
        with patch("app.routes.admin.create_admin_client", return_value=make_admin_db_mock()):
            response = admin_client.get("/admin/users")
            assert response.status_code == 200

    def test_get_users_response_has_users_key(self, admin_client):
        with patch("app.routes.admin.create_admin_client", return_value=make_admin_db_mock()):
            data = admin_client.get("/admin/users").json()
            assert "users" in data

    def test_get_users_response_has_total_key(self, admin_client):
        with patch("app.routes.admin.create_admin_client", return_value=make_admin_db_mock()):
            data = admin_client.get("/admin/users").json()
            assert "total" in data

    def test_get_users_returns_correct_count(self, admin_client):
        with patch("app.routes.admin.create_admin_client", return_value=make_admin_db_mock()):
            data = admin_client.get("/admin/users").json()
            assert data["total"] == len(SAMPLE_USERS)


class TestAdminDeleteUser:
    def test_delete_user_requires_admin(self, user_client):
        with patch("app.routes.admin.create_admin_client", return_value=make_admin_db_mock()):
            response = user_client.delete("/admin/users/some-other-id")
            assert response.status_code == 403

    def test_delete_user_cannot_delete_self(self, admin_client):
        with patch("app.routes.admin.create_admin_client", return_value=make_admin_db_mock()):
            response = admin_client.delete(f"/admin/users/{ADMIN_USER['id']}")
            assert response.status_code == 400

    def test_delete_user_success(self, admin_client):
        mock_db = make_admin_db_mock(users=[{"id": "user-uuid-1"}])
        with patch("app.routes.admin.create_admin_client", return_value=mock_db):
            response = admin_client.delete("/admin/users/user-uuid-1")
            assert response.status_code == 200

    def test_delete_user_returns_success_true(self, admin_client):
        mock_db = make_admin_db_mock(users=[{"id": "user-uuid-1"}])
        with patch("app.routes.admin.create_admin_client", return_value=mock_db):
            data = admin_client.delete("/admin/users/user-uuid-1").json()
            assert data["success"] is True

    def test_delete_user_not_found_returns_404(self, admin_client):
        mock_db = make_admin_db_mock(users=[])
        with patch("app.routes.admin.create_admin_client", return_value=mock_db):
            response = admin_client.delete("/admin/users/nonexistent-id")
            assert response.status_code == 404


class TestAdminUpdateRole:
    def test_update_role_requires_admin(self, user_client):
        with patch("app.routes.admin.create_admin_client", return_value=make_admin_db_mock()):
            response = user_client.patch("/admin/users/user-uuid-1/role", json={"new_role": "admin"})
            assert response.status_code == 403

    def test_update_role_invalid_role_returns_400(self, admin_client):
        with patch("app.routes.admin.create_admin_client", return_value=make_admin_db_mock()):
            response = admin_client.patch("/admin/users/user-uuid-1/role", json={"new_role": "superuser"})
            assert response.status_code == 400

    def test_update_role_to_admin_succeeds(self, admin_client):
        mock_db = make_admin_db_mock(users=[{"id": "user-uuid-1", "role": "admin"}])
        with patch("app.routes.admin.create_admin_client", return_value=mock_db):
            response = admin_client.patch("/admin/users/user-uuid-1/role", json={"new_role": "admin"})
            assert response.status_code == 200

    def test_update_role_to_user_succeeds(self, admin_client):
        mock_db = make_admin_db_mock(users=[{"id": "user-uuid-1", "role": "user"}])
        with patch("app.routes.admin.create_admin_client", return_value=mock_db):
            response = admin_client.patch("/admin/users/user-uuid-1/role", json={"new_role": "user"})
            assert response.status_code == 200

    def test_update_role_response_has_success(self, admin_client):
        mock_db = make_admin_db_mock(users=[{"id": "user-uuid-1", "role": "admin"}])
        with patch("app.routes.admin.create_admin_client", return_value=mock_db):
            data = admin_client.patch("/admin/users/user-uuid-1/role", json={"new_role": "admin"}).json()
            assert "success" in data


class TestAdminGetDetections:
    def test_get_detections_requires_admin(self, user_client):
        with patch("app.routes.admin.create_admin_client", return_value=make_admin_db_mock()):
            response = user_client.get("/admin/detections")
            assert response.status_code == 403

    def test_get_detections_returns_200(self, admin_client):
        with patch("app.routes.admin.create_admin_client", return_value=make_admin_db_mock()):
            response = admin_client.get("/admin/detections")
            assert response.status_code == 200

    def test_get_detections_has_detections_key(self, admin_client):
        with patch("app.routes.admin.create_admin_client", return_value=make_admin_db_mock()):
            data = admin_client.get("/admin/detections").json()
            assert "detections" in data

    def test_get_detections_total_correct(self, admin_client):
        with patch("app.routes.admin.create_admin_client", return_value=make_admin_db_mock()):
            data = admin_client.get("/admin/detections").json()
            assert data["total"] == len(SAMPLE_DETECTIONS)


class TestAdminDiseaseStats:
    def test_disease_stats_requires_admin(self, user_client):
        with patch("app.routes.admin.create_admin_client", return_value=make_admin_db_mock()):
            response = user_client.get("/admin/disease-stats")
            assert response.status_code == 403

    def test_disease_stats_returns_200(self, admin_client):
        with patch("app.routes.admin.create_admin_client", return_value=make_admin_db_mock()):
            response = admin_client.get("/admin/disease-stats")
            assert response.status_code == 200

    def test_disease_stats_has_diseases_key(self, admin_client):
        with patch("app.routes.admin.create_admin_client", return_value=make_admin_db_mock()):
            data = admin_client.get("/admin/disease-stats").json()
            assert "diseases" in data

    def test_disease_stats_empty_detections(self, admin_client):
        with patch("app.routes.admin.create_admin_client", return_value=make_admin_db_mock(detections=[])):
            data = admin_client.get("/admin/disease-stats").json()
            assert data["total"] == 0
