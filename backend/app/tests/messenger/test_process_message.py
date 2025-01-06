from collections.abc import Generator
from unittest.mock import MagicMock, patch

import httpx
import pytest
import respx

from app.core.config import CommonSettings
from app.messenger import process_message

common_settings = CommonSettings.get_settings()


@pytest.fixture
def mock_sqs() -> Generator[MagicMock, None, None]:
    with patch("app.messenger.sqs") as mock:
        yield mock


@pytest.mark.respx(base_url=common_settings.BUILDER_API_URL)
@pytest.mark.asyncio
async def test_process_message_success(
    respx_mock: respx.Router, mock_sqs: MagicMock
) -> None:
    deployment_id = "123"
    receipt_handle = "456"

    respx_mock.post("/apps/depot/build", json={"deployment_id": deployment_id}).mock(
        return_value=httpx.Response(200)
    )

    await process_message(
        deployment_id=deployment_id,
        receipt_handle=receipt_handle,
        client=httpx.AsyncClient(),
    )

    mock_sqs.delete_message.assert_called_once_with(
        QueueUrl=common_settings.BUILDER_QUEUE_NAME, ReceiptHandle=receipt_handle
    )


@pytest.mark.respx(base_url=common_settings.BUILDER_API_URL)
@pytest.mark.asyncio
async def test_does_not_delete_message_on_http_error(
    respx_mock: respx.Router, mock_sqs: MagicMock
) -> None:
    respx_mock.post("/apps/depot/build", json={"deployment_id": "123"}).mock(
        return_value=httpx.Response(400)
    )

    with pytest.raises(httpx.HTTPStatusError):
        await process_message(
            deployment_id="123", receipt_handle="456", client=httpx.AsyncClient()
        )

    mock_sqs.delete_message.assert_not_called()
