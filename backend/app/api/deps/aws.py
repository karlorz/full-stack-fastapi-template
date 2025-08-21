from typing import Annotated

from fastapi import Depends
from mypy_boto3_ecr import ECRClient
from mypy_boto3_s3 import S3Client
from mypy_boto3_sqs import SQSClient

from app import aws_utils

S3Dep = Annotated[S3Client, Depends(aws_utils.get_s3_client)]
ECRDep = Annotated[ECRClient, Depends(aws_utils.get_ecr_client)]
SQSDep = Annotated[SQSClient, Depends(aws_utils.get_sqs_client)]
