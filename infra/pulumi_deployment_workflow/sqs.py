import pulumi_aws as aws
from pulumi_deployment_workflow import s3


sqs_deployment_customer_apps_name = "sqs-deployment-customer-apps"

# Reference: https://www.pulumi.com/registry/packages/aws/api-docs/sqs/queue/
sqs_deployment_customer_apps_policy = aws.iam.get_policy_document_output(
    statements=[{
        "effect": "Allow",
        "principals": [{
            "type": "*",
            "identifiers": ["*"],
        }],
        "actions": ["sqs:SendMessage"],
        "resources": [f"arn:aws:sqs:*:*:{sqs_deployment_customer_apps_name}"],
        "conditions": [{
            "test": "ArnEquals",
            "variable": "aws:SourceArn",
            "values": [s3.s3_deployment_customer_apps.arn],
        }],
    }])


sqs_deployment_customer_apps = aws.sqs.Queue(
    sqs_deployment_customer_apps_name,
    name=sqs_deployment_customer_apps_name,
    policy=sqs_deployment_customer_apps_policy.json
)

# Reference: https://www.pulumi.com/registry/packages/aws/api-docs/s3/bucketnotification/
s3_deployment_customer_apps_notification = aws.s3.BucketNotification(
    "s3-deployment-customer-apps-notification",
    bucket=s3.s3_deployment_customer_apps.id,
    queues=[{
        "queue_arn": sqs_deployment_customer_apps.arn,
        "events": ["s3:ObjectCreated:*"],
    }]
)
