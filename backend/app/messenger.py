import asyncer
import botocore
import botocore.exceptions
import httpx
import logfire
import sentry_sdk
import stamina
from asyncer import asyncify
from mypy_boto3_sqs import SQSClient
from pydantic import TypeAdapter
from stamina import AsyncRetryingCaller

from app.aws_utils import get_sqs_client
from app.core.config import CommonSettings, MessengerSettings
from app.models import MessengerMessageBody

common_settings = CommonSettings.get_settings()
messenger_settings = MessengerSettings.get_settings()


if messenger_settings.MESSENGER_SENTRY_DSN and common_settings.ENVIRONMENT != "local":
    sentry_sdk.init(
        dsn=str(messenger_settings.MESSENGER_SENTRY_DSN),
        enable_tracing=True,
        environment=common_settings.ENVIRONMENT,
    )

logfire.configure(
    token=common_settings.LOGFIRE_TOKEN,
    environment=common_settings.ENVIRONMENT,
    service_name="messenger",
    send_to_logfire="if-token-present",
)
logfire.instrument_httpx()


def retry_only_on_real_errors(exc: Exception) -> bool:
    """Retry only on real errors.

    This avoids retries on errors that are not likely to be resolved by retrying (e.g.
    authentication errors, etc).
    """
    if isinstance(exc, httpx.HTTPStatusError):
        return exc.response.status_code >= 500

    return isinstance(exc, httpx.HTTPError)


def retry_only_on_sqs_errors(exc: Exception) -> bool:
    """Retry only on SQS errors.

    This avoids retries on errors that are not likely to be resolved by retrying (e.g.
    authentication errors, etc).
    """

    if isinstance(exc, botocore.exceptions.ClientError):
        error_code = exc.response.get("Error", {}).get("Code", "")

        return error_code not in [
            "QueueDoesNotExist",
            "InvalidIdFormat",
            "ReceiptHandleIsInvalid",
        ]

    return False


# Create reusable retry caller for SQS operations
sqs_retry = AsyncRetryingCaller().on(retry_only_on_sqs_errors)


@stamina.retry(on=retry_only_on_real_errors)
async def process_message(
    *,
    message: MessengerMessageBody,
    receipt_handle: str,
    client: httpx.AsyncClient,
    sqs: SQSClient,
) -> None:
    with logfire.span("Process message: {message}", message=message):
        timeout = httpx.Timeout(connect=5, read=600, write=5, pool=5)
        if message.type == "build":
            response = await client.post(
                f"{common_settings.BUILDER_API_URL}/apps/depot/build",
                headers={"X-API-KEY": common_settings.BUILDER_API_KEY},
                json={"deployment_id": str(message.deployment_id)},
                timeout=timeout,
            )
        elif message.type == "redeploy":
            response = await client.post(
                f"{common_settings.BUILDER_API_URL}/deploy",
                headers={"X-API-KEY": common_settings.BUILDER_API_KEY},
                json={"deployment_id": str(message.deployment_id)},
                timeout=timeout,
            )
        elif message.type == "delete_app":
            response = await client.post(
                f"{common_settings.BUILDER_API_URL}/cleanup",
                headers={"X-API-KEY": common_settings.BUILDER_API_KEY},
                json={"app_id": str(message.app_id)},
                timeout=timeout,
            )
        logfire.info(
            "Response status code: {status_code}", status_code=response.status_code
        )

        response.raise_for_status()

        with logfire.span("Delete message"):
            await sqs_retry(
                asyncify(sqs.delete_message),
                QueueUrl=common_settings.BUILDER_QUEUE_NAME,
                ReceiptHandle=receipt_handle,
            )


async def _process_messages(
    queue_url: str, client: httpx.AsyncClient, sqs: SQSClient
) -> None:
    # Run in asyncify to not block the event loop
    messages = await sqs_retry(
        asyncify(sqs.receive_message),
        QueueUrl=queue_url,
        MaxNumberOfMessages=10,
        WaitTimeSeconds=20,
    )

    MessengerMessageAdapter: TypeAdapter[MessengerMessageBody] = TypeAdapter(
        MessengerMessageBody
    )

    # Create an async task group so all messages are processed concurrently
    try:
        async with asyncer.create_task_group() as tg:
            for message in messages.get("Messages", []):
                raw_body = message.get("Body")
                receipt_handle = message["ReceiptHandle"]

                if not raw_body:
                    logfire.error("No body in message")
                    sentry_sdk.capture_message("No body in message")

                    if receipt_handle:
                        logfire.info("Delete message")
                        sqs.delete_message(
                            QueueUrl=queue_url, ReceiptHandle=receipt_handle
                        )

                    continue

                message_body = MessengerMessageAdapter.validate_json(raw_body)

                # Schedule processing this message concurrently. By the end of the
                # async with block for the task group it would have finished
                tg.soonify(process_message)(
                    message=message_body,
                    receipt_handle=receipt_handle,
                    client=client,
                    sqs=sqs,
                )
    except Exception as e:
        logfire.error("Error processing messages: {e}", e=e)
        sentry_sdk.capture_exception(e)


async def main() -> None:
    logfire.info("Process queue: {name}", name=common_settings.BUILDER_QUEUE_NAME)

    sqs = get_sqs_client()

    # Run in asyncify to not block the event loop, in case we call this function
    # concurrently later
    queue_url_response = await asyncify(sqs.get_queue_url)(
        QueueName=common_settings.BUILDER_QUEUE_NAME
    )
    queue_url = queue_url_response.get("QueueUrl")
    assert queue_url

    # Create a single HTTPX client that we can reuse
    async with httpx.AsyncClient() as client:
        while True:
            await _process_messages(queue_url, client, sqs)


if __name__ == "__main__":
    asyncer.runnify(main)()
