import pulumi
import pulumi_aws as aws
from pulumi_deployment_workflow import s3, sqs
from pulumi_deployment_workflow.config import account_id, region


# TODO: replace redis arn with variable
# Reference: https://www.pulumi.com/registry/packages/aws-iam/
# Reference: https://awspolicygen.s3.amazonaws.com/policygen.html

fastapi_cloud_admin_policy = aws.iam.Policy(
    "fastapi-cloud-admin-policy",
    name="fastapi-cloud-admin-policy",
    path="/",
    description="Policy for FastAPI Cloud Admin to allow EKS cluster to handle deployments",
    policy=pulumi.Output.json_dumps(
        {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": [
                        "sqs:ReceiveMessage",
                        "sqs:DeleteMessage",
                        "sqs:GetQueueAttributes",
                        "sqs:GetQueueUrl",
                        "sqs:ListQueues",
                    ],
                    "Resource": sqs.sqs_deployment_customer_apps.arn,
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "ecr:BatchCheckLayerAvailability",
                        "ecr:CompleteLayerUpload",
                        "ecr:GetDownloadUrlForLayer",
                        "ecr:BatchGetImage",
                        "ecr:InitiateLayerUpload",
                        "ecr:PutImage",
                        "ecr:UploadLayerPart",
                        "ecr:CreateRepository",
                        "ecr:DeleteRepository",
                        "ecr:DescribeRepositories",
                        "ecr:GetRepositoryPolicy",
                        "ecr:ListImages",
                        "ecr:DeleteRepositoryPolicy",
                        "ecr:SetRepositoryPolicy",
                    ],
                    "Resource": f"arn:aws:ecr:{region}:{account_id}:repository/*",
                },
                {
                    "Effect": "Allow",
                    "Action": ["ecr:GetAuthorizationToken"],
                    "Resource": "*",
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "s3:GetObject",
                        "s3:ListBucket",
                        "s3:PutObject",
                        "s3:GetObjectVersion",
                    ],
                    "Resource": pulumi.Output.concat(
                        s3.s3_deployment_customer_apps.arn, "/*"
                    ),
                },
            ],
        }
    ),
)

knative_customer_apps_policy = aws.iam.Policy(
    "knative-customer-apps-policy",
    name="knative-customer-apps-policy",
    path="/",
    description="Policy for Knative Customer Apps to allow EKS pull images from ECR",
    policy=pulumi.Output.json_dumps(
        {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": [
                        "ecr:BatchCheckLayerAvailability",
                        "ecr:GetDownloadUrlForLayer",
                        "ecr:BatchGetImage",
                    ],
                    "Resource": f"arn:aws:ecr:{region}:{account_id}:repository/*",
                },
                {
                    "Effect": "Allow",
                    "Action": ["ecr:GetAuthorizationToken"],
                    "Resource": "*",
                },
            ],
        }
    ),
)
