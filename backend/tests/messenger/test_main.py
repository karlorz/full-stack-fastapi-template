import uuid
from collections.abc import Generator
from unittest.mock import ANY, MagicMock, Mock, patch

import httpx
import pytest

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
        client=ANY,
        sqs=ANY,
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
