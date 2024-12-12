import pulumi_aws as aws
from pulumi_deployment_workflow.config import stack_name


# Reference: https://www.pulumi.com/registry/packages/aws/api-docs/sqs/queue/
sqs_builder_queue = aws.sqs.Queue(
    f"fastapicloud-builder-queue-{stack_name}",
    name=f"fastapicloud-builder-queue-{stack_name}",
    visibility_timeout_seconds=600,
)
