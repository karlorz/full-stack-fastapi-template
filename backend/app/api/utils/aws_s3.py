from typing import Any

import boto3


def generate_presigned_url_post(
    bucket_name: str, object_name: str, expiration: int = 600
) -> dict[str, Any]:
    """
    Generate a presigned POST URL to upload a file to an S3 bucket
    """
    s3_client = boto3.client("s3")
    response = s3_client.generate_presigned_post(
        Bucket=bucket_name,
        Key=object_name,
        ExpiresIn=expiration,
    )

    return response
