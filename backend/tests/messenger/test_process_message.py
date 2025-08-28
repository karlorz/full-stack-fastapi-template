import uuid
from unittest.mock import Mock

import httpx
import pytest
import respx
from botocore.exceptions import ClientError

from app.core.config import CommonSettings
from app.messenger.processing import process_message
from app.models import BuildMessage, DeleteAppMessage

common_settings = CommonSettings.get_settings()


@pytest.mark.respx(base_url=common_settings.BUILDER_API_URL)
@pytest.mark.asyncio
async def test_process_message_success(respx_mock: respx.Router) -> None:
    queue_url = "test_queue_url"
    mock_sqs = Mock()

    deployment_id = uuid.uuid4()

    receipt_handle = "456"

    respx_mock.post(
        "/apps/depot/build", json={"deployment_id": str(deployment_id)}
    ).mock(return_value=httpx.Response(200))

    await process_message(
        message=BuildMessage(deployment_id=deployment_id),
        receipt_handle=receipt_handle,
        queue_url=queue_url,
        client=httpx.AsyncClient(),
        sqs=mock_sqs,
    )

    mock_sqs.delete_message.assert_called_once_with(
        QueueUrl=queue_url,
        ReceiptHandle=receipt_handle,
    )


@pytest.mark.respx(base_url=common_settings.BUILDER_API_URL)
@pytest.mark.asyncio
async def test_does_not_delete_message_on_http_error(respx_mock: respx.Router) -> None:
    queue_url = "test_queue_url"
    mock_sqs = Mock()

    deployment_id = uuid.uuid4()
    receipt_handle = "456"

    respx_mock.post(
        "/apps/depot/build", json={"deployment_id": str(deployment_id)}
    ).mock(return_value=httpx.Response(400))

    with pytest.raises(httpx.HTTPStatusError):
        await process_message(
            message=BuildMessage(deployment_id=deployment_id),
            receipt_handle=receipt_handle,
            queue_url=queue_url,
            client=httpx.AsyncClient(),
            sqs=mock_sqs,
        )

    mock_sqs.delete_message.assert_not_called()


@pytest.mark.respx(base_url=common_settings.BUILDER_API_URL)
@pytest.mark.asyncio
async def test_process_message_retries_on_http_error(respx_mock: respx.Router) -> None:
    queue_url = "test_queue_url"
    mock_sqs = Mock()

    deployment_id = uuid.uuid4()
    receipt_handle = "456"

    request_mock = respx_mock.post(
        "/apps/depot/build", json={"deployment_id": str(deployment_id)}
    ).mock(side_effect=[httpx.Response(500), httpx.Response(200)])

    await process_message(
        message=BuildMessage(deployment_id=deployment_id),
        receipt_handle=receipt_handle,
        queue_url=queue_url,
        client=httpx.AsyncClient(),
        sqs=mock_sqs,
    )

    mock_sqs.delete_message.assert_called_once_with(
        QueueUrl=queue_url,
        ReceiptHandle=receipt_handle,
    )

    assert request_mock.call_count == 2


@pytest.mark.respx(base_url=common_settings.BUILDER_API_URL)
@pytest.mark.asyncio
async def test_process_message_retries_on_sqs_error(respx_mock: respx.Router) -> None:
    queue_url = "test_queue_url"
    mock_sqs = Mock()

    deployment_id = uuid.uuid4()
    receipt_handle = "456"

    request_mock = respx_mock.post(
        "/apps/depot/build", json={"deployment_id": str(deployment_id)}
    ).mock(return_value=httpx.Response(200))

    mock_sqs.delete_message.side_effect = [
        ClientError(
            {"Error": {"Code": "Something", "Message": "Something"}},
            "DeleteAppMessage",
        ),
        None,
    ]

    await process_message(
        message=BuildMessage(deployment_id=deployment_id),
        receipt_handle=receipt_handle,
        queue_url=queue_url,
        client=httpx.AsyncClient(),
        sqs=mock_sqs,
    )

    mock_sqs.delete_message.assert_called_with(
        QueueUrl=queue_url,
        ReceiptHandle=receipt_handle,
    )

    assert mock_sqs.delete_message.call_count == 2

    assert request_mock.call_count == 1


@pytest.mark.respx(base_url=common_settings.BUILDER_API_URL)
@pytest.mark.asyncio
async def test_process_delete_message_success(respx_mock: respx.Router) -> None:
    """Test processing delete message calls cleanup endpoint."""
    queue_url = "test_queue_url"
    sqs_mock = Mock()

    app_id = "123e4567-e89b-12d3-a456-426614174000"
    receipt_handle = "456"

    respx_mock.post("/cleanup", json={"app_id": app_id}).mock(
        return_value=httpx.Response(200)
    )

    await process_message(
        message=DeleteAppMessage(app_id=app_id),
        receipt_handle=receipt_handle,
        queue_url=queue_url,
        client=httpx.AsyncClient(),
        sqs=sqs_mock,
    )

    sqs_mock.delete_message.assert_called_once_with(
        QueueUrl=queue_url,
        ReceiptHandle=receipt_handle,
    )


@pytest.mark.respx(base_url=common_settings.BUILDER_API_URL)
@pytest.mark.asyncio
async def test_process_delete_message_error(respx_mock: respx.Router) -> None:
    """Test delete message processing handles cleanup endpoint errors."""
    app_id = "123e4567-e89b-12d3-a456-426614174000"
    receipt_handle = "456"
    queue_url = "test_queue_url"
    sqs_mock = Mock()

    respx_mock.post("/cleanup", json={"app_id": app_id}).mock(
        return_value=httpx.Response(500)
    )

    with pytest.raises(httpx.HTTPStatusError):
        await process_message(
            message=DeleteAppMessage(app_id=app_id),
            receipt_handle=receipt_handle,
            queue_url=queue_url,
            client=httpx.AsyncClient(),
            sqs=sqs_mock,
        )

    sqs_mock.delete_message.assert_not_called()
