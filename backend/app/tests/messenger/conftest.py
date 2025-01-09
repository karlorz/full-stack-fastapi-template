from collections.abc import Generator
from unittest.mock import MagicMock, patch

import pytest

from app.core.config import CommonSettings

common_settings = CommonSettings.get_settings()


@pytest.fixture
def mock_sqs() -> Generator[MagicMock, None, None]:
    with patch("app.messenger.sqs") as mock:
        yield mock
