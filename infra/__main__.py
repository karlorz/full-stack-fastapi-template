import json
from pathlib import Path
import pulumi
import pulumi_aws as aws
import pulumi_awsx as awsx
import pulumi_eks as eks
from pulumi_deployment_workflow import iam, s3, sqs
from pulumi_deployment_workflow.config import (
    account_id,
    region,
    min_cluster_size,
    max_cluster_size,
    desired_cluster_size,
    eks_node_instance_type,
    vpc_network_cidr,
    stack_name,
    aws_load_balancer_name,
)
import pulumi_kubernetes as k8s
import pulumi_kubernetes.helm.v4 as helm
import os


CLOUDFLARE_API_KEY = os.environ.get("CLOUDFLARE_API_TOKEN_SSL", "")

assert CLOUDFLARE_API_KEY, "CLOUDFLARE_API_TOKEN_SSL environment variable is not set"

### AWS Resources ###

# Role generated automatically by AWS from permission set from AWS IAM Identity Center
roles = aws.iam.get_roles(name_regex="FastAPILabsPowerUserK8s")
k8s_role_arn = roles.arns[0]


# Create a VPC for the EKS cluster
eks_vpc = awsx.ec2.Vpc(
    "eks-vpc",
    subnet_strategy=awsx.ec2.vpc.SubnetAllocationStrategy.AUTO,
    enable_dns_hostnames=True,
    cidr_block=vpc_network_cidr,
    # Add tags
    # Ref: https://docs.aws.amazon.com/eks/latest/userguide/network-load-balancing.html
    subnet_specs=[
        {
            "type": awsx.ec2.vpc.SubnetType.PRIVATE,
            "tags": {"kubernetes.io/role/internal-elb": "1"},
        },
        {
            "type": awsx.ec2.vpc.SubnetType.PUBLIC,
            "tags": {"kubernetes.io/role/elb": "1"},
        },
    ],
)

# Create the EKS cluster
eks_cluster = eks.Cluster(
    f"eks-cluster-{stack_name}",
    # Put the cluster in the new VPC created earlier
    vpc_id=eks_vpc.vpc_id,
    # Public subnets will be used for load balancers
    public_subnet_ids=eks_vpc.public_subnet_ids,
    # Private subnets will be used for cluster nodes
    private_subnet_ids=eks_vpc.private_subnet_ids,
    # Change configuration values to change any of the following settings
    instance_type=eks_node_instance_type,
    desired_capacity=desired_cluster_size,
    min_size=min_cluster_size,
    max_size=max_cluster_size,
    # Do not give worker nodes a public IP address
    node_associate_public_ip_address=False,
    # Change these values for a private cluster (VPN access required)
    endpoint_private_access=False,
    endpoint_public_access=True,
    # Enable access via access entries, not just role maps
    authentication_mode=eks.AuthenticationMode.API_AND_CONFIG_MAP,
    # Add access entries for IAM
    access_entries={
        "fastapilabs_access_entry": eks.AccessEntryArgs(
            principal_arn=k8s_role_arn,
            access_policies={
                "fastapilabs_access_policy": eks.AccessPolicyAssociationArgs(
                    access_scope=aws.eks.AccessPolicyAssociationAccessScopeArgs(
                        type="cluster",
                    ),
                    policy_arn="arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy",
                    # policy_arn="arn:aws:eks::aws:cluster-access-policy/AmazonEKSViewPolicy",
                )
            },
        )
    },
    # OIDC provider for IAM
    create_oidc_provider=True,
)

# AWS Load Balancer Controller
# Ref: https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.8/deploy/installation/
aws_lb_controller_policy_content = (
    Path(__file__)
    .parent.joinpath(f"{aws_load_balancer_name}-config/iam-policy.json")
    .read_text()
)

# IAM Role for ServiceAccount
# Ref: https://www.learnaws.org/2021/06/22/aws-eks-alb-controller-pulumi/
# Ref: https://docs.aws.amazon.com/eks/latest/userguide/associate-service-account-role.html


service_account_name = f"system:serviceaccount:kube-system:{aws_load_balancer_name}"
oidc_url = eks_cluster.core.apply(lambda x: x.oidc_provider and x.oidc_provider.url)
oidc_arn = eks_cluster.core.apply(lambda x: x.oidc_provider and x.oidc_provider.arn)
oidc_id = oidc_url.apply(lambda x: x.split("/")[-1])
eks_namespace = "default"
k8s_service_acount_name = "default"
fastapi_cloud_admin_service_account_name = "fastapicloud"
fastapi_cloud_namespace = "fastapicloud"
# Get the security group ID from the EKS cluster
cluster_security_group_id = eks_cluster.cluster_security_group.id


aws_lb_controller_role = aws.iam.Role(
    f"{aws_load_balancer_name}-role",
    assume_role_policy=pulumi.Output.json_dumps(
        {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {
                        "Federated": oidc_arn,
                    },
                    "Action": "sts:AssumeRoleWithWebIdentity",
                    "Condition": {
                        "StringEquals": {
                            pulumi.Output.format(
                                "{oidc_url}:aud", oidc_url=oidc_url
                            ): "sts.amazonaws.com",
                            pulumi.Output.format(
                                "{oidc_url}:sub", oidc_url=oidc_url
                            ): service_account_name,
                        },
                    },
                }
            ],
        }
    ),
)

aws_lb_controller_policy = aws.iam.Policy(
    f"{aws_load_balancer_name}-policy",
    policy=aws_lb_controller_policy_content,
)

# Attach IAM Policy to IAM Role
aws.iam.PolicyAttachment(
    f"{aws_load_balancer_name}-attachment",
    policy_arn=aws_lb_controller_policy.arn,
    roles=[aws_lb_controller_role.name],
)

# FastAPI Cloud Admin Service Account Role and policy attachment
fastapicloud_iam_role = aws.iam.Role(
    "fastapicloud-iam-role",
    assume_role_policy=pulumi.Output.json_dumps(
        {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {
                        "Federated": pulumi.Output.format(
                            "arn:aws:iam::{account_id}:oidc-provider/oidc.eks.{region}.amazonaws.com/id/{oidc_id}",
                            account_id=account_id,
                            region=region,
                            oidc_id=oidc_id,
                        )
                    },
                    "Action": "sts:AssumeRoleWithWebIdentity",
                    "Condition": {
                        "StringEquals": {
                            pulumi.Output.format(
                                "oidc.eks.{region}.amazonaws.com/id/{oidc_id}:aud",
                                region=region,
                                oidc_id=oidc_id,
                            ): "sts.amazonaws.com"
                        }
                    },
                }
            ],
        }
    ),
)


aws.iam.RolePolicyAttachment(
    "fastapicloud-iam-role-policy-attachment",
    role=fastapicloud_iam_role.name,
    policy_arn=iam.fastapi_cloud_admin_policy.arn,
)

# Role for default service account to allow pulling ECR images
ecr_iam_role = aws.iam.Role(
    "ecr-iam-role",
    assume_role_policy=pulumi.Output.json_dumps(
        {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {
                        "Federated": pulumi.Output.format(
                            "arn:aws:iam::{account_id}:oidc-provider/oidc.eks.{region}.amazonaws.com/id/{oidc_id}",
                            account_id=account_id,
                            region=region,
                            oidc_id=oidc_id,
                        )
                    },
                    "Action": "sts:AssumeRoleWithWebIdentity",
                    "Condition": {
                        "StringEquals": {
                            pulumi.Output.format(
                                "oidc.eks.{region}.amazonaws.com/id/{oidc_id}:aud",
                                region=region,
                                oidc_id=oidc_id,
                            ): "sts.amazonaws.com"
                        }
                    },
                }
            ],
        }
    ),
)

aws.iam.RolePolicyAttachment(
    "ecr-iam-role-policy-attachment",
    role=ecr_iam_role.name,
    policy_arn=iam.ecr_read_policy.arn,
)

cluster_name = eks_cluster.core.apply(lambda x: x.cluster.name)

# Redis backend

redis_backend_subnet_group = aws.elasticache.SubnetGroup(
    "redis-backend-subnet-group",
    subnet_ids=eks_vpc.private_subnet_ids,
)

redis_backend_security_group = aws.ec2.SecurityGroup(
    "redis-backend-security-group",
    vpc_id=eks_vpc.vpc_id,
    description="Security group for Redis backend to communicate with EKS cluster",
    ingress=[
        {
            "protocol": "tcp",
            "from_port": 6379,
            "to_port": 6379,
            "cidr_blocks": [vpc_network_cidr],
            "description": "Allow inbound from EKS cluster",
        },
    ],
    egress=[
        {
            "protocol": "-1",
            "from_port": 0,
            "to_port": 0,
            "cidr_blocks": ["0.0.0.0/0"],
            "description": "Allow all outbound traffic",
        },
    ],
    tags={
        "Name": "redis-backend-security-group",
    },
)

redis_backend = aws.elasticache.Cluster(
    "redis-backend",
    cluster_id="redis-backend",
    engine="redis",
    engine_version="7.0",
    node_type="cache.t3.micro",
    num_cache_nodes=1,
    port=6379,
    subnet_group_name=redis_backend_subnet_group.name,
    security_group_ids=[redis_backend_security_group.id],
    apply_immediately=True,  # Add this line to apply changes immediately
)

# ECR Registry
repository_backend = aws.ecr.Repository(
    "repository-backend",
    name="fastapicloud-backend",
    image_scanning_configuration={
        "scan_on_push": True,
    },
)

repository_builder = aws.ecr.Repository(
    "repository-builder",
    name="fastapicloud-builder",
    image_scanning_configuration={
        "scan_on_push": True,
    },
)

repository_messenger = aws.ecr.Repository(
    "repository-messenger",
    name="fastapicloud-messenger",
    image_scanning_configuration={
        "scan_on_push": True,
    },
)

# Create an IAM Role for the Service Account
external_secrets_iam_role = aws.iam.Role(
    "external-secrets-role",
    assume_role_policy=pulumi.Output.json_dumps(
        {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {
                        "Federated": pulumi.Output.format(
                            "arn:aws:iam::{account_id}:oidc-provider/oidc.eks.{region}.amazonaws.com/id/{oidc_id}",
                            account_id=account_id,
                            region=region,
                            oidc_id=oidc_id,
                        )
                    },
                    "Action": [
                        "sts:AssumeRoleWithWebIdentity",
                    ],
                    "Condition": {
                        "StringEquals": {
                            pulumi.Output.format(
                                "oidc.eks.{region}.amazonaws.com/id/{oidc_id}:aud",
                                region=region,
                                oidc_id=oidc_id,
                            ): "sts.amazonaws.com"
                        }
                    },
                }
            ],
        }
    ),
)

# Create an IAM Policy for the External Secrets Operator
external_secrets_policy = aws.iam.Policy(
    "external-secrets-policy",
    policy=pulumi.Output.json_dumps(
        {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": [
                        "secretsmanager:GetSecretValue",
                        "secretsmanager:DescribeSecret",
                        "secretsmanager:ListSecrets",
                        "kms:Decrypt",
                        "ssm:GetParameter",
                        "ssm:GetParametersByPath",
                    ],
                    "Resource": "*",  # Adjust to specific resources for better security
                }
            ],
        }
    ),
)

# Attach the updated policy to the external-secrets-iam role
aws.iam.RolePolicyAttachment(
    "external-secrets-policy-attachment",
    role=external_secrets_iam_role.name,
    policy_arn=external_secrets_policy.arn,
)

k8s_provider = k8s.Provider("k8s-provider", 
    kubeconfig=eks_cluster.kubeconfig.apply(lambda k: json.dumps(k))
)

k8s_labels = {
    "app.kubernetes.io/managed-by": "pulumi",
    "app.kubernetes.io/environment": stack_name,
}

ns_map: dict[str, any] = {
    "cert-manager": {},
    "external-secrets": {},
    "fastapicloud": {},
    "knative-serving": {},
    "kourier-system": {
        "labels": {
            "networking.knative.dev/ingress-provider": "kourier",
        },
    },
    "vector-agent": {},
    "vector-aggregator": {},
}
for k, ns in ns_map.items():
    ns_map[k]["resource"] = k8s.core.v1.Namespace(
        k,
        metadata=k8s.meta.v1.ObjectMetaArgs(
            name=k,
            labels={**ns.get("labels", {}), **k8s_labels},
        ),
        opts=pulumi.ResourceOptions(provider=k8s_provider),
    )

# Ensure the Helm chart configuration includes the correct service account annotations
external_secrets_sa_name="external-secrets"
external_secrets_sa_namespace="external-secrets"
external_secrets_parameter_store_kind="ClusterSecretStore"
external_secrets_parameter_store_name="external-parameter-store"
custom_external_secrets_chart = helm.Chart(
    "external-secrets",
    helm.ChartArgs(
        chart="./helm/charts/external-secrets",
        dependency_update=True,
        namespace=external_secrets_sa_namespace,
        values={
            "external-secrets": {
                "serviceAccount": {
                    "name": external_secrets_sa_name,
                    "annotations": {
                        "eks.amazonaws.com/role-arn": external_secrets_iam_role.arn,
                    },
                },
            },
            "config": {
                "kind": external_secrets_parameter_store_kind,
                # This is being done because of the helm chart logic
                external_secrets_parameter_store_name.replace("external-", ""): {
                    "provider": {
                        "aws": {
                            "service": "ParameterStore",
                            "region": region,
                        },
                    },
                },
            },
        },
    ),
    opts=pulumi.ResourceOptions(provider=k8s_provider),
)

cloudflare_credentials_secret = aws.ssm.Parameter("cloudflare-credentials",
    name="cloudflare-credentials",
    type=aws.ssm.ParameterType.STRING,
    value=CLOUDFLARE_API_KEY)

cert_manager_chart = helm.Chart(
    "cert-manager",
    helm.ChartArgs(
        chart="./helm/charts/cert-manager",
        dependency_update=True,
        namespace="cert-manager",
        values={
            # TODO:
            # "externalSecrets": {
            #     "cloudflare": {
            #         "enabled": True,
            #         "key": cloudflare_credentials_secret.name,
            #     },
            #     "kind": external_secrets_parameter_store_kind,
            #     "name": external_secrets_parameter_store_name,
            # },
        },
    ),
    opts=pulumi.ResourceOptions(provider=k8s_provider),
)

# Export values to use elsewhere
pulumi.export("kubeconfig_data", eks_cluster.kubeconfig)
pulumi.export("cluster_name", cluster_name)
pulumi.export("vpc_id", eks_vpc.vpc_id)
pulumi.export("k8s_role_arn", k8s_role_arn)
pulumi.export("aws_lb_controller_policy", aws_lb_controller_policy.arn)
pulumi.export("deployments_bucket_name", s3.deployments_bucket.bucket)
pulumi.export("redis_backend", redis_backend.cache_nodes[0].address)
pulumi.export(
    "ecr_registry_url",
    repository_backend.registry_id.apply(
        lambda x: f"{x}.dkr.ecr.{region}.amazonaws.com"
    ),
)
pulumi.export("ecr_registry_id", repository_backend.registry_id)
pulumi.export("aws_lb_controller_role_arn", aws_lb_controller_role.arn)
pulumi.export("fastapicloud_iam_role_arn", fastapicloud_iam_role.arn)
pulumi.export("ecr_iam_role_arn", ecr_iam_role.arn)
pulumi.export("builder_queue_name", sqs.builder_queue.name)
pulumi.export("external_secrets_iam_role_arn", external_secrets_iam_role.arn)
