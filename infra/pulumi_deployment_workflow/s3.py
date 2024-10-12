import pulumi_aws as aws
import pulumi

stack = pulumi.get_stack()
stack_name = stack.split("/")[-1]


# Reference: https://www.pulumi.com/registry/packages/aws/api-docs/s3/bucket/
s3_deployment_customer_apps = aws.s3.Bucket(
    f"fastapicloud-s3-deployment-customer-apps-{stack_name}", acl="private"
)
