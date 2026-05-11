import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient


@pytest.fixture(scope="session", autouse=True)
def _bootstrap_app():
    """Import the FastAPI app once per session with all external services mocked.

    auth.py calls create_client() at module level during import, so we must patch
    supabase.create_client BEFORE the first import of main to prevent key validation errors.
    ModelService.load_model is patched to avoid needing the model file on disk.
    """
    with patch("supabase.create_client") as mock_create_client, \
         patch("app.services.model_service.ModelService.load_model"):
        mock_create_client.return_value = MagicMock()
        import main  # noqa — populates sys.modules cache; app available for all tests
        yield


@pytest.fixture
def mock_supabase():
    """Mock Supabase client."""
    mock = MagicMock()
    mock.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value.data = []
    mock.table.return_value.select.return_value.execute.return_value.data = []
    mock.auth.get_user.return_value.user = None
    return mock


@pytest.fixture
def mock_admin_user():
    return {"id": "admin-uuid-123", "email": "admin@gmail.com", "token": "valid-token", "role": "admin"}


@pytest.fixture
def mock_regular_user():
    return {"id": "user-uuid-456", "email": "user@example.com", "token": "valid-token", "role": "user"}


@pytest.fixture
def app_client():
    from main import app
    return TestClient(app)
