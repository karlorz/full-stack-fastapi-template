from unittest.mock import MagicMock

import httpx
import pytest
import respx
from botocore.exceptions import ClientError

from app.core.config import CommonSettings
from app.messenger import process_message
from app.models import MessengerMessageBody

common_settings = CommonSettings.get_settings()


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
        message=MessengerMessageBody(deployment_id=deployment_id, type="build"),
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
            message=MessengerMessageBody(deployment_id="123", type="build"),
            receipt_handle="456",
            client=httpx.AsyncClient(),
        )

    mock_sqs.delete_message.assert_not_called()


@pytest.mark.respx(base_url=common_settings.BUILDER_API_URL)
@pytest.mark.asyncio
async def test_process_message_retries_on_http_error(
    respx_mock: respx.Router, mock_sqs: MagicMock
) -> None:
    request_mock = respx_mock.post(
        "/apps/depot/build", json={"deployment_id": "123"}
    ).mock(side_effect=[httpx.Response(500), httpx.Response(200)])

    await process_message(
        message=MessengerMessageBody(deployment_id="123", type="build"),
        receipt_handle="456",
        client=httpx.AsyncClient(),
    )

    mock_sqs.delete_message.assert_called_once_with(
        QueueUrl=common_settings.BUILDER_QUEUE_NAME, ReceiptHandle="456"
    )

    assert request_mock.call_count == 2


@pytest.mark.respx(base_url=common_settings.BUILDER_API_URL)
@pytest.mark.asyncio
async def test_process_message_retries_on_sqs_error(
    respx_mock: respx.Router, mock_sqs: MagicMock
) -> None:
    request_mock = respx_mock.post(
        "/apps/depot/build", json={"deployment_id": "123"}
    ).mock(return_value=httpx.Response(200))

    mock_sqs.delete_message.side_effect = [
        ClientError(
            {"Error": {"Code": "Something", "Message": "Something"}},
            "DeleteMessage",
        ),
        None,
    ]

    await process_message(
        message=MessengerMessageBody(deployment_id="123", type="build"),
        receipt_handle="456",
        client=httpx.AsyncClient(),
    )

    mock_sqs.delete_message.assert_called_with(
        QueueUrl=common_settings.BUILDER_QUEUE_NAME, ReceiptHandle="456"
    )

    assert mock_sqs.delete_message.call_count == 2

    assert request_mock.call_count == 1
