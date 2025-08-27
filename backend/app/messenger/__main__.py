import asyncer
import httpx
import logfire
import sentry_sdk
from asyncer import asyncify

from app.aws_utils import get_sqs_client
from app.core.config import CommonSettings, MessengerSettings
from app.messenger.processing import process_messages

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
            await process_messages(queue_url, client, sqs)


asyncer.runnify(main)()
