import pulumi_aws as aws
from pulumi_deployment_workflow.config import stack_name


# Reference: https://www.pulumi.com/registry/packages/aws/api-docs/s3/bucket/
s3_deployment_customer_apps = aws.s3.Bucket(
    f"fastapicloud-s3-deployment-customer-apps-{stack_name}", acl="private"
)
