import pulumi
import pulumi_aws as aws


class MonitoringStorageComponent(pulumi.ComponentResource):
    """Component for creating S3 storage and IAM roles for monitoring services (Mimir, Tempo, Loki)."""

    def __init__(
        self,
        name,
        service_name,
        stack_name,
        cluster_oidc_provider_url,
        cluster_oidc_provider_arn,
        retention_days=365,
        opts=None,
    ):
        super().__init__("fastapicloud:monitoring:storage", name, None, opts)

        # S3 bucket for metrics/logs/traces storage
        self.bucket = aws.s3.Bucket(
            f"{name}-bucket",
            bucket=f"fastapicloud-{service_name}-{stack_name}",
            acl="private",
            lifecycle_rules=[
                {
                    "enabled": True,
                    "expiration": {"days": retention_days},
                    "noncurrent_version_expiration": {"days": 30},
                }
            ],
            versioning={"enabled": True},
            server_side_encryption_configuration={
                "rule": {
                    "apply_server_side_encryption_by_default": {
                        "sse_algorithm": "AES256"
                    }
                }
            },
            tags={
                "Service": service_name,
                "Purpose": f"{service_name}-storage",
                "Environment": stack_name,
            },
            opts=pulumi.ResourceOptions(parent=self),
        )

        # IAM policy for S3 access
        self.policy = aws.iam.Policy(
            f"{name}-policy",
            name=f"{service_name}-s3-access-{stack_name}",
            policy=pulumi.Output.all(self.bucket.arn).apply(
                lambda args: {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Effect": "Allow",
                            "Action": [
                                "s3:ListBucket",
                                "s3:GetBucketLocation",
                                "s3:GetBucketVersioning",
                                "s3:GetBucketNotification",
                                "s3:GetBucketTagging",
                            ],
                            "Resource": args[0],
                        },
                        {
                            "Effect": "Allow",
                            "Action": [
                                "s3:GetObject",
                                "s3:PutObject",
                                "s3:DeleteObject",
                                "s3:GetObjectVersion",
                                "s3:PutObjectAcl",
                            ],
                            "Resource": f"{args[0]}/*",
                        },
                    ],
                }
            ),
            opts=pulumi.ResourceOptions(parent=self),
        )

        # IAM role for IRSA
        self.role = aws.iam.Role(
            f"{name}-role",
            name=f"{service_name}-irsa-{stack_name}",
            assume_role_policy=pulumi.Output.all(
                cluster_oidc_provider_url, cluster_oidc_provider_arn
            ).apply(
                lambda args: {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Effect": "Allow",
                            "Principal": {"Federated": args[1]},
                            "Action": "sts:AssumeRoleWithWebIdentity",
                            "Condition": {
                                "StringEquals": {
                                    f"{args[0]}:sub": f"system:serviceaccount:monitoring:{service_name}",
                                    f"{args[0]}:aud": "sts.amazonaws.com",
                                }
                            },
                        }
                    ],
                }
            ),
            tags={"Service": service_name, "Environment": stack_name},
            opts=pulumi.ResourceOptions(parent=self),
        )

        # Attach policy to role
        self.role_policy_attachment = aws.iam.RolePolicyAttachment(
            f"{name}-role-policy-attachment",
            role=self.role.name,
            policy_arn=self.policy.arn,
            opts=pulumi.ResourceOptions(parent=self),
        )

        # Register outputs
        self.register_outputs(
            {
                "bucket_name": self.bucket.id,
                "bucket_arn": self.bucket.arn,
                "role_arn": self.role.arn,
                "service_name": service_name,
            }
        )
