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
from components.argocd import ArgoCDComponent, ArgoCDConfig, RepositoryConfig
from components.monitoring import MonitoringStorageComponent
import json

# Get configuration
cfg = pulumi.Config()
INFRA_DOMAIN = cfg.require("infra_domain")

# Pin versions to prevent breaking changes from AWS auto-updates
eks_cluster_version = cfg.require("eks_cluster_version")
eks_node_ami_id = cfg.require("eks_node_ami_id")
eks_coredns_version = cfg.require("eks_coredns_version")
eks_kube_proxy_version = cfg.require("eks_kube_proxy_version")
eks_vpc_cni_version = cfg.require("eks_vpc_cni_version")

ALLOW_SIGNUP_TOKEN = cfg.require_secret("fastapicloud_allow_signup_token")
API_DOMAIN = cfg.require("fastapicloud_api_domain")
AWS_STS_REGIONAL_ENDPOINTS = "regional"
# BACKEND_GITHUB_CLIENT_ID = cfg.require("fastapicloud_backend_github_client_id")
# BACKEND_GITHUB_CLIENT_SECRET = cfg.require_secret("fastapicloud_backend_github_client_secret")
BACKEND_SECRET_KEY = cfg.require_secret("fastapicloud_secret_key")
BACKEND_SENTRY_DSN = cfg.require("fastapicloud_backend_sentry_dsn")
BUILDER_API_KEY = cfg.require("fastapicloud_builder_api_key")
# BUILDER_SENTRY_DSN = cfg.require("fastapicloud_builder_sentry_dsn")
CLOUDFLARE_ACCOUNT_ID = cfg.require("fastapicloud_cloudflare_account_id")
CLOUDFLARE_API_KEY = cfg.require_secret("fastapicloud_cloudflare_api_token_ssl")
CLOUDFLARE_ZONE_ID = cfg.require("fastapicloud_cloudflare_zone_id")
EMAILABLE_KEY = cfg.require_secret("fastapicloud_emailable_key")
LOGFIRE_TOKEN = cfg.require_secret("fastapicloud_logfire_token")
MESSENGER_SENTRY_DSN = cfg.require("fastapicloud_messenger_sentry_dsn")
NATS_LOGGING_WRITE_CREDS = cfg.require_secret("fastapicloud_nats_logging_write_creds")
POSTGRES_DB = cfg.require("fastapicloud_postgres_db")
POSTGRES_PASSWORD = cfg.require_secret("fastapicloud_postgres_password")
POSTGRES_PORT = cfg.require("fastapicloud_postgres_port")
POSTGRES_SERVER = cfg.require("fastapicloud_postgres_server")
POSTGRES_SSL_ENABLED = cfg.require("fastapicloud_postgres_ssl_enabled")
POSTGRES_USER = cfg.require("fastapicloud_postgres_user")
POSTHOG_API_KEY = cfg.require("fastapicloud_posthog_api_key")
SMTP_HOST = cfg.require("fastapicloud_smtp_host")
SMTP_PASSWORD = cfg.require_secret("fastapicloud_smtp_password")
SMTP_PORT = cfg.require("fastapicloud_smtp_port")
SMTP_SSL = cfg.require("fastapicloud_smtp_ssl")
SMTP_TLS = cfg.require("fastapicloud_smtp_tls")
SMTP_USER = cfg.require_secret("fastapicloud_smtp_user")

# ArgoCD OAuth configuration
argocd_config = pulumi.Config("argocd")
ARGOCD_GOOGLE_CLIENT_ID = argocd_config.require_secret("google_client_id")
ARGOCD_GOOGLE_CLIENT_SECRET = argocd_config.require_secret("google_client_secret")

### AWS Resources ###

# Role generated automatically by AWS from permission set from AWS IAM Identity Center
roles = aws.iam.get_roles(name_regex="FastAPILabsPowerUserK8s")
k8s_role_arn = roles.arns[0]

# AdministratorAccess Role provided by AWS SSO
administrator_access_roles = aws.iam.get_roles(
    name_regex="AWSReservedSSO_AdministratorAccess"
)
administrator_access_arn = administrator_access_roles.arns[0]

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
    # Lock cluster version for controlled upgrades
    version=eks_cluster_version,
    # Put the cluster in the new VPC created earlier
    vpc_id=eks_vpc.vpc_id,
    # Public subnets will be used for load balancers
    public_subnet_ids=eks_vpc.public_subnet_ids,
    # Private subnets will be used for cluster nodes
    private_subnet_ids=eks_vpc.private_subnet_ids,
    node_ami_id=eks_node_ami_id,
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
    # Lock addon version for controlled upgrades
    coredns_addon_options=eks.CoreDnsAddonOptionsArgs(
        version=eks_coredns_version,
    ),
    kube_proxy_addon_options=eks.KubeProxyAddonOptionsArgs(
        version=eks_kube_proxy_version,
    ),
    vpc_cni_options=eks.VpcCniOptionsArgs(
        addon_version=eks_vpc_cni_version,
    ),
    # Enable access via access entries, not just role maps
    authentication_mode=eks.AuthenticationMode.API_AND_CONFIG_MAP,
    # Add access entries for IAM
    access_entries={
        "administrator_access_entry": eks.AccessEntryArgs(
            principal_arn=administrator_access_arn,
            access_policies={
                "administrator_access_policy": eks.AccessPolicyAssociationArgs(
                    access_scope=aws.eks.AccessPolicyAssociationAccessScopeArgs(
                        type="cluster",
                    ),
                    policy_arn="arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy",
                )
            },
        ),
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
        ),
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

repository_posthog_proxy = aws.ecr.Repository(
    "repository-posthog-proxy",
    name="fastapicloud-posthog-proxy",
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

k8s_provider = k8s.Provider(
    "k8s-provider", kubeconfig=eks_cluster.kubeconfig.apply(lambda k: json.dumps(k))
)

k8s_labels = {
    "app.kubernetes.io/managed-by": "pulumi",
    "app.kubernetes.io/environment": stack_name,
}

default_tags = {
    "ManagedBy": "pulumi",
    "Environment": stack_name,
}

ns_map: dict[str, any] = {
    "cert-manager": {},
    "external-secrets": {},
    "fastapicloud": {},
    "knative-serving": {},
    "kourier-system": {
        "labels": {
            "app.kubernetes.io/component": "net-kourier",
            "app.kubernetes.io/name": "knative-serving",
            "networking.knative.dev/ingress-provider": "kourier",
        },
    },
    "monitoring": {},
    "origin-ca-issuer": {},
    "vector": {},
    # TODO: Delete the namespaces below
    "vector-agent": {},
    "vector-aggregator": {},
}
for k, ns in ns_map.items():
    labels = {**{"kubernetes.io/metadata.name": k, "name": k}, **k8s_labels}
    ns_map[k]["resource"] = k8s.core.v1.Namespace(
        k,
        metadata=k8s.meta.v1.ObjectMetaArgs(
            name=k,
            labels={**ns.get("labels", {}), **labels},
        ),
        spec={
            "finalizers": ["kubernetes"],
        },
        opts=pulumi.ResourceOptions(
            provider=k8s_provider,
            protect=True,
        ),
    )

sa_map: dict[str, any] = {
    "aws-load-balancer-controller": {
        "namespace": "kube-system",
        "values": {
            "global": {
                "labels": {
                    "app.kubernetes.io/component": "controller",
                },
            },
            "serviceAccount": {
                "annotations": {
                    "eks.amazonaws.com/role-arn": aws_lb_controller_role.arn,
                },
            },
        },
    },
    "default": {
        "namespace": "default",
        "values": {
            "serviceAccount": {
                "annotations": {
                    "eks.amazonaws.com/role-arn": ecr_iam_role.arn,
                },
            },
        },
    },
}
for k, sa in sa_map.items():
    sa["values"].setdefault("global", {}).setdefault("labels", {}).update(k8s_labels)
    sa_map[k]["chart"] = helm.Chart(
        k,
        helm.ChartArgs(
            chart="./helm/charts/service-account",
            namespace=sa["namespace"],
            values=sa["values"],
        ),
        opts=pulumi.ResourceOptions(provider=k8s_provider),
    )

# prometheus_chart = helm.Chart(
#     "prometheus",
#     helm.ChartArgs(
#         chart="./helm/charts/prometheus",
#         dependency_update=True,
#         namespace="monitoring",
#         # values={},
#     ),
#     opts=pulumi.ResourceOptions(
#         provider=k8s_provider,
#     ),
# )

# Ensure the Helm chart configuration includes the correct service account annotations
external_secrets_sa_name = "external-secrets"
external_secrets_sa_namespace = "external-secrets"
external_secrets_parameter_store_kind = "ClusterSecretStore"
external_secrets_parameter_store_name = "external-parameter-store"
external_secrets_enabled = True

external_secrets_chart = helm.Chart(
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
                "stores": {
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
        },
    ),
    opts=pulumi.ResourceOptions(provider=k8s_provider),
)

cloudflare_credentials_secret = aws.ssm.Parameter(
    "cloudflare-credentials",
    name="cloudflare-credentials",
    type=aws.ssm.ParameterType.SECURE_STRING,
    value=CLOUDFLARE_API_KEY,
)

cert_manager_chart = helm.Chart(
    "cert-manager",
    helm.ChartArgs(
        chart="./helm/charts/cert-manager",
        dependency_update=True,
        namespace="cert-manager",
        values={
            "externalSecrets": {
                "cloudflare": {
                    "enabled": external_secrets_enabled,
                    "key": cloudflare_credentials_secret.name,
                },
                "kind": external_secrets_parameter_store_kind,
                "name": external_secrets_parameter_store_name,
            },
        },
    ),
    opts=pulumi.ResourceOptions(
        depends_on=[external_secrets_chart],
        provider=k8s_provider,
    ),
)


synadia_credentials_secret = aws.ssm.Parameter(
    "synadia-credentials",
    name="synadia-credentials",
    type=aws.ssm.ParameterType.SECURE_STRING,
    value=NATS_LOGGING_WRITE_CREDS,
)

# Admin emails allowed to access infrastructure services
allowed_emails = [
    "sebastian@fastapilabs.com",
    "bento@fastapilabs.com",
    "martin@fastapilabs.com",
    "patrick@fastapilabs.com",
]

# Create wildcard ACM certificate for infrastructure domain
argocd_certificate = aws.acm.Certificate(
    "argocd-certificate",
    domain_name=f"*.{INFRA_DOMAIN}",
    validation_method="DNS",
    tags={
        "Name": f"wildcard-{INFRA_DOMAIN}-{stack_name}",
        "Environment": stack_name,
    },
)

# Create monitoring storage components for Mimir, Tempo, and Loki
mimir_storage = MonitoringStorageComponent(
    "mimir-storage",
    service_name="mimir",
    stack_name=stack_name,
    cluster_oidc_provider_url=oidc_url,
    cluster_oidc_provider_arn=oidc_arn,
    retention_days=365,  # 1 year for metrics
    opts=pulumi.ResourceOptions(
        provider=k8s_provider,
        depends_on=[eks_cluster],
    ),
)

tempo_storage = MonitoringStorageComponent(
    "tempo-storage",
    service_name="tempo",
    stack_name=stack_name,
    cluster_oidc_provider_url=oidc_url,
    cluster_oidc_provider_arn=oidc_arn,
    retention_days=30,  # 1 month for traces
    opts=pulumi.ResourceOptions(
        provider=k8s_provider,
        depends_on=[eks_cluster],
    ),
)

loki_storage = MonitoringStorageComponent(
    "loki-storage",
    service_name="loki",
    stack_name=stack_name,
    cluster_oidc_provider_url=oidc_url,
    cluster_oidc_provider_arn=oidc_arn,
    retention_days=90,  # 3 months for logs
    opts=pulumi.ResourceOptions(
        provider=k8s_provider,
        depends_on=[eks_cluster],
    ),
)

# Deploy ArgoCD component
argocd_component = ArgoCDComponent(
    "argocd",
    config=ArgoCDConfig(
        domain=f"argocd.{INFRA_DOMAIN}",
        namespace="argo-cd",
        enable_oauth=True,
        google_client_id=ARGOCD_GOOGLE_CLIENT_ID,
        google_client_secret=ARGOCD_GOOGLE_CLIENT_SECRET,
        acm_certificate_arn=argocd_certificate.arn,
        admin_emails=allowed_emails,
        repositories=[
            RepositoryConfig(
                name="fastapi-cloud",
                url="git@github.com:fastapilabs/cloud.git",
                ssh_private_key=cfg.require_secret("fastapi-cloud-github-ssh-key"),
            ),
        ],
        # Root application configuration
        environment=stack_name,  # Use stack name as environment (development, staging, production)
        root_app_target_revision="HEAD",
        root_app_project="default",
    ),
    k8s_provider=k8s_provider,
    tags=default_tags,
    opts=pulumi.ResourceOptions(
        depends_on=[cert_manager_chart],
    ),
)

vector_chart = helm.Chart(
    "vector",
    helm.ChartArgs(
        chart="./helm/charts/vector",
        dependency_update=True,
        namespace="vector",
        values={
            "externalSecrets": {
                "kind": external_secrets_parameter_store_kind,
                "name": external_secrets_parameter_store_name,
                "synadia": {
                    "enabled": external_secrets_enabled,
                    "remoteRef": {
                        "key": synadia_credentials_secret.name,
                    },
                },
            },
        },
    ),
    opts=pulumi.ResourceOptions(
        depends_on=[
            cert_manager_chart,
            external_secrets_chart,
        ],
        provider=k8s_provider,
    ),
)

fastapicloud_secrets: dict[str, any] = {
    "ALLOW_SIGNUP_TOKEN": ALLOW_SIGNUP_TOKEN,
    "API_DOMAIN": API_DOMAIN,
    "AWS_REGION": region,
    "AWS_ROLE_ARN": fastapicloud_iam_role,
    "AWS_STS_REGIONAL_ENDPOINTS": AWS_STS_REGIONAL_ENDPOINTS,
    # TODO:
    # "BACKEND_GITHUB_CLIENT_ID": BACKEND_GITHUB_CLIENT_ID,
    # "BACKEND_GITHUB_CLIENT_SECRET": BACKEND_GITHUB_CLIENT_SECRET,
    "BACKEND_SECRET_KEY": BACKEND_SECRET_KEY,
    "BACKEND_SENTRY_DSN": BACKEND_SENTRY_DSN,
    "BUILDER_API_KEY": BUILDER_API_KEY,
    "CLOUDFLARE_ACCOUNT_ID": CLOUDFLARE_ACCOUNT_ID,
    # "CLOUDFLARE_API_KEY": CLOUDFLARE_API_KEY, # ssm.Parameter already set above
    "CLOUDFLARE_ZONE_ID": CLOUDFLARE_ZONE_ID,
    "DEPLOYMENTS_BUCKET_NAME": s3.deployments_bucket.bucket,
    "EMAILABLE_KEY": EMAILABLE_KEY,
    "LOGFIRE_TOKEN": LOGFIRE_TOKEN,
    # "NATS_LOGGING_WRITE_CREDS": NATS_LOGGING_WRITE_CREDS, # ssm.Parameter already set above
    "POSTGRES_DB": POSTGRES_DB,
    "POSTGRES_PASSWORD": POSTGRES_PASSWORD,
    "POSTGRES_PORT": POSTGRES_PORT,
    "POSTGRES_SERVER": POSTGRES_SERVER,
    "POSTGRES_SSL_ENABLED": POSTGRES_SSL_ENABLED,
    "POSTGRES_USER": POSTGRES_USER,
    "POSTHOG_API_KEY": POSTHOG_API_KEY,
    "REDIS_SERVER": redis_backend.cache_nodes[0].address,
    "SMTP_HOST": SMTP_HOST,
    "SMTP_PASSWORD": SMTP_PASSWORD,
    "SMTP_PORT": SMTP_PORT,
    "SMTP_USER": SMTP_USER,
    "SMTP_SSL": SMTP_SSL,
    "SMTP_TLS": SMTP_TLS,
}
for k, secret in fastapicloud_secrets.items():
    k = f"FASTAPICLOUD_{k}"
    aws.ssm.Parameter(
        k.lower(), name=k, type=aws.ssm.ParameterType.SECURE_STRING, value=secret
    )

# Export values to use elsewhere
# pulumi.export("kubeconfig_data", eks_cluster.kubeconfig)
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
pulumi.export("argocd_url", f"https://argocd.{INFRA_DOMAIN}")
pulumi.export("infra_domain", INFRA_DOMAIN)

# Export monitoring storage resources
pulumi.export("mimir_bucket_name", mimir_storage.bucket.id)
pulumi.export("mimir_role_arn", mimir_storage.role.arn)
pulumi.export("tempo_bucket_name", tempo_storage.bucket.id)
pulumi.export("tempo_role_arn", tempo_storage.role.arn)
pulumi.export("loki_bucket_name", loki_storage.bucket.id)
pulumi.export("loki_role_arn", loki_storage.role.arn)
