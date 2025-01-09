import asyncer
import httpx
import logfire
import sentry_sdk
from asyncer import asyncify

from app.aws_utils import get_sqs_client
from app.core.config import CommonSettings, MessengerSettings

common_settings = CommonSettings.get_settings()
messenger_settings = MessengerSettings.get_settings()
sqs = get_sqs_client()


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


async def process_message(
    *, deployment_id: str, receipt_handle: str, client: httpx.AsyncClient
) -> None:
    with logfire.span(
        "Process message, deployment_id: {deployment_id}", deployment_id=deployment_id
    ):
        timeout = httpx.Timeout(connect=5, read=600, write=5, pool=5)
        response = await client.post(
            f"{common_settings.BUILDER_API_URL}/apps/depot/build",
            headers={"X-API-KEY": common_settings.BUILDER_API_KEY},
            json={"deployment_id": str(deployment_id)},
            timeout=timeout,
        )
        logfire.info(
            "Response status code: {status_code}", status_code=response.status_code
        )
        response.raise_for_status()
        with logfire.span("Delete message"):
            await asyncify(sqs.delete_message)(
                QueueUrl=common_settings.BUILDER_QUEUE_NAME,
                ReceiptHandle=receipt_handle,
            )


async def _process_messages(queue_url: str, client: httpx.AsyncClient) -> None:
    with logfire.span("Receive messages"):
        # Run in asyncify to not block the event loop
        messages = await asyncify(sqs.receive_message)(
            QueueUrl=queue_url, MaxNumberOfMessages=10, WaitTimeSeconds=20
        )
        # Create an async task group so all messages are processed concurrently
        async with asyncer.create_task_group() as tg:
            for message in messages.get("Messages", []):
                deployment_id = message.get("Body")
                receipt_handle = message.get("ReceiptHandle")
                if not deployment_id:
                    logfire.error("No deployment_id in message")
                    if receipt_handle:
                        logfire.info("Delete message")
                        sqs.delete_message(
                            QueueUrl=queue_url, ReceiptHandle=receipt_handle
                        )
                    continue
                assert receipt_handle
                # Schedule processing this message concurrently. By the end of the
                # async with block for the task group it would have finished
                logfire.info(
                    "Schedule process deployment_id: {deployment_id}",
                    deployment_id=deployment_id,
                )
                tg.soonify(process_message)(
                    deployment_id=deployment_id,
                    receipt_handle=receipt_handle,
                    client=client,
                )


async def main() -> None:
    # Run in asyncify to not block the event loop, in case we call this function
    # concurrently later
    with logfire.span("Process queue: {name}", name=common_settings.BUILDER_QUEUE_NAME):
        queue_url_response = await asyncify(sqs.get_queue_url)(
            QueueName=common_settings.BUILDER_QUEUE_NAME
        )
        queue_url = queue_url_response.get("QueueUrl")
        assert queue_url
        # Create a single HTTPX client that we can reuse
        async with httpx.AsyncClient() as client:
            while True:
                await _process_messages(queue_url, client)


if __name__ == "__main__":
    asyncer.runnify(main)()
