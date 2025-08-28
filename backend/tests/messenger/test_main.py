import json
import uuid
from collections.abc import Generator
from unittest.mock import MagicMock, Mock, patch

import httpx
import pytest
import respx

from app.core.config import CommonSettings
from app.messenger.processing import process_messages
from app.models import BuildMessage

common_settings = CommonSettings.get_settings()


@pytest.fixture
def mock_process_message() -> Generator[MagicMock, None, None]:
    with patch("app.messenger.processing.process_message") as mock:
        yield mock


@pytest.mark.asyncio
async def test_process_messages_with_no_messages(
    mock_process_message: MagicMock,
) -> None:
    queue_url = "test_queue_url"
    mock_sqs = Mock()
    mock_sqs.receive_message.return_value = {"Messages": []}

    async with httpx.AsyncClient() as client:
        await process_messages(queue_url, client, mock_sqs)

    assert mock_sqs.receive_message.call_count == 1
    mock_sqs.receive_message.assert_called_with(
        QueueUrl=queue_url, MaxNumberOfMessages=10, WaitTimeSeconds=20
    )

    mock_process_message.assert_not_called()


@pytest.mark.asyncio
async def test_process_messages_with_messages(
    mock_process_message: MagicMock,
) -> None:
    deployment_id = uuid.uuid4()
    message = BuildMessage(deployment_id=deployment_id, type="build")

    queue_url = "test_queue_url"
    mock_sqs = Mock()
    mock_sqs.receive_message.return_value = {
        "Messages": [{"Body": message.model_dump_json(), "ReceiptHandle": "456"}]
    }

    async with httpx.AsyncClient() as client:
        await process_messages(queue_url, client, mock_sqs)

    assert mock_sqs.receive_message.call_count == 1
    mock_sqs.receive_message.assert_called_with(
        QueueUrl=queue_url, MaxNumberOfMessages=10, WaitTimeSeconds=20
    )

    mock_process_message.assert_called_once_with(
        message=message,
        receipt_handle="456",
        queue_url=queue_url,
        client=client,
        sqs=mock_sqs,
    )


@pytest.mark.asyncio
async def test_process_messages_with_message_but_no_body(
    mock_process_message: MagicMock,
) -> None:
    queue_url = "test_queue_url"

    mock_sqs = Mock()
    mock_sqs.receive_message.return_value = {
        "Messages": [{"Body": None, "ReceiptHandle": "456"}]
    }

    async with httpx.AsyncClient() as client:
        await process_messages(queue_url, client, mock_sqs)

    mock_sqs.delete_message.assert_called_once_with(
        QueueUrl=queue_url, ReceiptHandle="456"
    )

    mock_process_message.assert_not_called()


@pytest.mark.asyncio
async def test_process_messages_skips_messages_without_receipt_handle(
    respx_mock: respx.Router,
) -> None:
    queue_url = "test_queue_url"

    message1_body = BuildMessage(deployment_id=uuid.uuid4(), type="build")
    message2_body = BuildMessage(deployment_id=uuid.uuid4(), type="build")
    message3_body = BuildMessage(deployment_id=uuid.uuid4(), type="build")

    mock_sqs = MagicMock()
    mock_sqs.receive_message.return_value = {
        "Messages": [
            {
                "Body": message1_body.model_dump_json(),
                "ReceiptHandle": "receipt-handle-1",
            },
            {
                "Body": message2_body.model_dump_json(),
            },
            {
                "Body": message3_body.model_dump_json(),
                "ReceiptHandle": "receipt-handle-3",
            },
        ]
    }

    build_router = respx_mock.post("/apps/depot/build").mock(
        return_value=httpx.Response(200)
    )

    async with httpx.AsyncClient() as client:
        await process_messages(queue_url, client, mock_sqs)

    assert len(build_router.calls) == 2
    request1_json = json.loads(build_router.calls[0].request.content)
    request2_json = json.loads(build_router.calls[1].request.content)
    assert request1_json == {"deployment_id": str(message1_body.deployment_id)}
    assert request2_json == {"deployment_id": str(message3_body.deployment_id)}

    delete_message_calls = mock_sqs.delete_message.call_args_list
    assert len(delete_message_calls) == 2
    assert delete_message_calls[0].kwargs == {
        "QueueUrl": queue_url,
        "ReceiptHandle": "receipt-handle-1",
    }
    assert delete_message_calls[1].kwargs == {
        "QueueUrl": queue_url,
        "ReceiptHandle": "receipt-handle-3",
    }
