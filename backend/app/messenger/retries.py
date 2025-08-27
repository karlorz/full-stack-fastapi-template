import botocore
import botocore.exceptions
import httpx
from stamina import AsyncRetryingCaller


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
