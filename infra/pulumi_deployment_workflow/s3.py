import pulumi_aws as aws
from pulumi_deployment_workflow.config import stack_name


# Reference: https://www.pulumi.com/registry/packages/aws/api-docs/s3/bucket/
aws_deployment_bucket = aws.s3.Bucket(
    f"fastapicloud-deployments-{stack_name}", acl="private"
)
