from functools import lru_cache

import boto3
from mypy_boto3_ecr import ECRClient
from mypy_boto3_s3 import S3Client
from mypy_boto3_sqs import SQSClient

from app.core.config import CommonSettings

common_settings = CommonSettings.get_settings()


@lru_cache
def get_s3_client() -> S3Client:
    return boto3.client(
        "s3",
        endpoint_url=common_settings.AWS_ENDPOINT_URL,
        region_name=common_settings.AWS_REGION,
    )


@lru_cache
def get_ecr_client() -> ECRClient:
    return boto3.client(
        "ecr",
        # Only in LocalStack Pro, and we don't really need it locally
        # endpoint_url=common_settings.AWS_ENDPOINT_URL,
        region_name=common_settings.AWS_REGION,
    )


@lru_cache
def get_sqs_client() -> SQSClient:
    return boto3.client(
        "sqs",
        endpoint_url=common_settings.AWS_ENDPOINT_URL,
        region_name=common_settings.AWS_REGION,
    )
