from typing import Any

from pydantic_core import Url

from app.aws_utils import get_s3_client
from app.core.config import CommonSettings

common_settings = CommonSettings.get_settings()


def generate_presigned_url_post(
    bucket_name: str, object_name: str, expiration: int = 600
) -> dict[str, Any]:
    """
    Generate a presigned POST URL to upload a file to an S3 bucket
    """

    s3_client = get_s3_client()
    response = s3_client.generate_presigned_post(
        Bucket=bucket_name,
        Key=object_name,
        ExpiresIn=expiration,
    )
    if common_settings.is_local_stack_enabled:
        # LocalStack returns the URL based on its own endpoint that could be
        # inside of Docker, we need the localhost version
        url = Url(response["url"])
        assert url.host
        assert url.path
        use_host = "localhost.localstack.cloud"
        new_path = url.path.lstrip("/")
        new_url = Url.build(
            scheme=url.scheme,
            host=use_host,
            port=url.port,
            path=new_path,
            query=url.query,
            fragment=url.fragment,
        )
        response["url"] = str(new_url)

    return response
