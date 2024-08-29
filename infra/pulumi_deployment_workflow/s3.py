import pulumi_aws as aws


# Reference: https://www.pulumi.com/registry/packages/aws/api-docs/s3/bucket/
s3_deployment_customer_apps = aws.s3.Bucket(
    "s3-deployment-customer-apps",
    bucket="s3-deployment-customer-apps",
    acl="private"
)
