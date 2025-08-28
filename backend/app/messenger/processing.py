import asyncer
import httpx
import logfire
import sentry_sdk
import stamina
from asyncer import asyncify
from mypy_boto3_sqs import SQSClient
from pydantic import TypeAdapter

from app.core.config import CommonSettings, MessengerSettings
from app.messenger.retries import retry_only_on_real_errors, sqs_retry
from app.models import MessengerMessageBody

common_settings = CommonSettings.get_settings()
messenger_settings = MessengerSettings.get_settings()


async def process_messages(
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
            for message in messages["Messages"]:
                receipt_handle = message.get("ReceiptHandle")

                if not receipt_handle:
                    logfire.error("No receipt handle in message")
                    sentry_sdk.capture_message("No receipt handle in message")
                    continue

                raw_body = message.get("Body")

                if not raw_body:
                    logfire.error("No body in message")
                    sentry_sdk.capture_message("No body in message")

                    logfire.info("Delete message")
                    sqs.delete_message(QueueUrl=queue_url, ReceiptHandle=receipt_handle)

                    continue

                message_body = MessengerMessageAdapter.validate_json(raw_body)

                # Schedule processing this message concurrently. By the end of the
                # async with block for the task group it would have finished
                tg.soonify(process_message)(
                    message=message_body,
                    receipt_handle=receipt_handle,
                    queue_url=queue_url,
                    client=client,
                    sqs=sqs,
                )
    except Exception as e:
        logfire.error("Error processing messages: {e}", e=e)
        sentry_sdk.capture_exception(e)


@stamina.retry(on=retry_only_on_real_errors)
async def process_message(
    *,
    message: MessengerMessageBody,
    receipt_handle: str,
    queue_url: str,
    client: httpx.AsyncClient,
    sqs: SQSClient,
) -> None:
    with logfire.span("Process message: {message}", message=message):
        timeout = httpx.Timeout(connect=5, read=600, write=5, pool=5)

        match message.type:
            case "build":
                response = await client.post(
                    f"{common_settings.BUILDER_API_URL}/apps/depot/build",
                    headers={"X-API-KEY": common_settings.BUILDER_API_KEY},
                    json={"deployment_id": str(message.deployment_id)},
                    timeout=timeout,
                )
            case "redeploy":
                response = await client.post(
                    f"{common_settings.BUILDER_API_URL}/deploy",
                    headers={"X-API-KEY": common_settings.BUILDER_API_KEY},
                    json={"deployment_id": str(message.deployment_id)},
                    timeout=timeout,
                )
            case "delete_app":
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
                QueueUrl=queue_url,
                ReceiptHandle=receipt_handle,
            )
