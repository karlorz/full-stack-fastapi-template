from typing import Any

import boto3
from botocore.exceptions import ClientError


def generate_presigned_url_post(
    bucket_name: str, object_name: str, expiration: int = 600
) -> dict[str, Any] | None:
    """
    Generate a presigned POST URL to upload a file to an S3 bucket
    """
    s3_client = boto3.client("s3")
    try:
        response = s3_client.generate_presigned_post(
            Bucket=bucket_name,
            Key=object_name,
            ExpiresIn=expiration,
        )
    except ClientError as e:
        print(f"Error generating presigned POST URL: {e}")
        return None

    return response
