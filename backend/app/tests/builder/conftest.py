from collections.abc import Generator
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.builder.main import app


@pytest.fixture(scope="module")
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as c:
        yield c


@pytest.fixture
def mock_sqs() -> Generator[MagicMock, None, None]:
    """Mock SQS client for testing."""
    with patch("app.api.routes.apps.sqs") as mock_sqs:
        mock_sqs.get_queue_url.return_value = {"QueueUrl": "test-queue-url"}
        mock_sqs.send_message.return_value = {}
        yield mock_sqs
