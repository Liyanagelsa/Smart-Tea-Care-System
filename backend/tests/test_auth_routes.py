"""Unit tests for authentication routes."""
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient


@pytest.fixture
def client():
    from main import app
    return TestClient(app)


def make_mock_supabase(email="test@example.com", role="user"):
    mock = MagicMock()
    mock_user = MagicMock()
    mock_user.id = "test-uuid-123"
    mock_user.email = email
    mock_session = MagicMock()
    mock_session.access_token = "access-token-abc"
    mock_session.refresh_token = "refresh-token-xyz"
    mock.auth.sign_in_with_password.return_value.user = mock_user
    mock.auth.sign_in_with_password.return_value.session = mock_session
    profile_mock = MagicMock()
    profile_mock.data = [{"role": role}]
    mock.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value = profile_mock
    mock.postgrest.auth = MagicMock()
    return mock


class TestSignIn:
    def test_signin_missing_body_returns_422(self, client):
        response = client.post("/auth/signin", json={})
        assert response.status_code == 422

    def test_signin_missing_password_returns_422(self, client):
        response = client.post("/auth/signin", json={"email": "test@example.com"})
        assert response.status_code == 422

    def test_signin_missing_email_returns_422(self, client):
        response = client.post("/auth/signin", json={"password": "password123"})
        assert response.status_code == 422

    def test_signin_invalid_credentials_returns_error(self, client):
        with patch("app.routes.auth.supabase") as mock_sb:
            mock_sb.auth.sign_in_with_password.side_effect = Exception("Invalid credentials")
            response = client.post("/auth/signin",
                                   json={"email": "bad@example.com", "password": "wrong"})
            assert response.status_code in [400, 401, 422]

    def test_signin_success_returns_access_token(self, client):
        with patch("app.routes.auth.supabase", make_mock_supabase()), \
             patch("app.routes.auth.create_user_client") as mock_client:
            mock_client.return_value.table.return_value.select.return_value \
                .eq.return_value.limit.return_value.execute.return_value.data = [{"role": "user"}]
            response = client.post("/auth/signin",
                                   json={"email": "test@example.com", "password": "pass123"})
            assert response.status_code == 200
            data = response.json()
            assert "access_token" in data

    def test_signin_success_returns_user(self, client):
        with patch("app.routes.auth.supabase", make_mock_supabase()), \
             patch("app.routes.auth.create_user_client") as mock_client:
            mock_client.return_value.table.return_value.select.return_value \
                .eq.return_value.limit.return_value.execute.return_value.data = [{"role": "user"}]
            response = client.post("/auth/signin",
                                   json={"email": "test@example.com", "password": "pass123"})
            data = response.json()
            assert "user" in data

    def test_signin_admin_returns_admin_role(self, client):
        with patch("app.routes.auth.supabase", make_mock_supabase(email="admin@gmail.com", role="admin")), \
             patch("app.routes.auth.create_user_client") as mock_client:
            mock_client.return_value.table.return_value.select.return_value \
                .eq.return_value.limit.return_value.execute.return_value.data = [{"role": "admin"}]
            response = client.post("/auth/signin",
                                   json={"email": "admin@gmail.com", "password": "Admin@1234"})
            assert response.status_code == 200
            data = response.json()
            assert data["user"]["role"] == "admin"

    def test_signin_regular_user_returns_user_role(self, client):
        with patch("app.routes.auth.supabase", make_mock_supabase()), \
             patch("app.routes.auth.create_user_client") as mock_client:
            mock_client.return_value.table.return_value.select.return_value \
                .eq.return_value.limit.return_value.execute.return_value.data = [{"role": "user"}]
            response = client.post("/auth/signin",
                                   json={"email": "test@example.com", "password": "pass123"})
            data = response.json()
            assert data["user"]["role"] == "user"


class TestSignUp:
    def test_signup_missing_body_returns_422(self, client):
        response = client.post("/auth/signup", json={})
        assert response.status_code == 422

    def test_signup_missing_password_returns_422(self, client):
        response = client.post("/auth/signup",
                               json={"email": "test@example.com", "full_name": "Test"})
        assert response.status_code == 422

    def test_signup_success(self, client):
        with patch("app.routes.auth.supabase") as mock_sb:
            mock_user = MagicMock()
            mock_user.id = "new-uuid"
            mock_user.email = "new@example.com"
            mock_session = MagicMock()
            mock_session.access_token = "new-token"
            mock_session.refresh_token = "new-refresh"
            mock_sb.auth.sign_up.return_value.user = mock_user
            mock_sb.auth.sign_up.return_value.session = mock_session
            response = client.post("/auth/signup", json={
                "email": "new@example.com",
                "password": "Password1!",
                "full_name": "New User"
            })
            assert response.status_code == 200


class TestForgotPassword:
    def test_forgot_password_missing_email_returns_422(self, client):
        response = client.post("/auth/forgot-password", json={})
        assert response.status_code == 422

    def test_forgot_password_sends_email(self, client):
        with patch("app.routes.auth.supabase") as mock_sb:
            mock_sb.auth.reset_password_for_email.return_value = MagicMock()
            response = client.post("/auth/forgot-password",
                                   json={"email": "test@example.com"})
            assert response.status_code == 200

    def test_forgot_password_response_has_message(self, client):
        with patch("app.routes.auth.supabase") as mock_sb:
            mock_sb.auth.reset_password_for_email.return_value = MagicMock()
            response = client.post("/auth/forgot-password",
                                   json={"email": "test@example.com"})
            assert "message" in response.json()
