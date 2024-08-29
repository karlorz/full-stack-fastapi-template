from pathlib import Path
import pulumi
import pulumi_awsx as awsx
import pulumi_eks as eks
import pulumi_aws as aws
import pulumi_kubernetes as k8s
from pulumi_deployment_workflow import iam, sqs, s3


# Get some values from the Pulumi configuration (or use defaults)
config = pulumi.Config()
account_id = config.get("aws_accountId")
region = config.get("aws_region")
min_cluster_size = config.get_int("minClusterSize", 3)
max_cluster_size = config.get_int("maxClusterSize", 6)
desired_cluster_size = config.get_int("desiredClusterSize", 3)
eks_node_instance_type = config.get("eksNodeInstanceType", "t3.medium")
vpc_network_cidr = config.get("vpcNetworkCidr", "10.0.0.0/16")

aws_load_balancer_name = "aws-load-balancer-controller"

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
        awsx.ec2.vpc.SubnetSpecArgs(
            type=awsx.ec2.vpc.SubnetType.PRIVATE,
            tags={"kubernetes.io/role/internal-elb": "1"},
        ),
        awsx.ec2.vpc.SubnetSpecArgs(
            type=awsx.ec2.vpc.SubnetType.PUBLIC,
            tags={"kubernetes.io/role/elb": "1"},
        ),
    ],
)

# Create the EKS cluster
eks_cluster = eks.Cluster(
    "eks-cluster",
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

k8s_iam_deployment_workflow_role = aws.iam.Role("k8sDeploymentServiceAccountRole",
    assume_role_policy=pulumi.Output.json_dumps({
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Principal": {
                "Federated": pulumi.Output.format(
                    "arn:aws:iam::{account_id}:oidc-provider/oidc.eks.{region}.amazonaws.com/id/{oidc_id}",
                    account_id=account_id,
                    region=region,
                    oidc_id=oidc_id
                )
            },
            "Action": "sts:AssumeRoleWithWebIdentity",
            "Condition": {
                "StringEquals": {
                    pulumi.Output.format(
                        "oidc.eks.{region}.amazonaws.com/id/{oidc_id}:aud",
                        region=region,
                        oidc_id=oidc_id
                    ): "sts.amazonaws.com"
                }
            }
        }]
    })
)


aws.iam.RolePolicyAttachment("eksDeploymentRolePolicyAttachment",
    role=k8s_iam_deployment_workflow_role.name,
    policy_arn=iam.knative_deploy_workflow_policy.arn
)

### Kubernetes Resources ###

provider = k8s.Provider("provider", kubeconfig=eks_cluster.kubeconfig)

aws_load_balancer_service_account = k8s.core.v1.ServiceAccount(
    f"{aws_load_balancer_name}-sa",
    metadata={
        "name": aws_load_balancer_name,
        "namespace": "kube-system",
        "labels": {
            "app.kubernetes.io/component": "controller",
            "app.kubernetes.io/name": aws_load_balancer_name,
        },
        "annotations": {"eks.amazonaws.com/role-arn": aws_lb_controller_role.arn},
    },
    opts=pulumi.ResourceOptions(provider=provider),
)

service_account = k8s.core.v1.ServiceAccount("defaultServiceAccountAnnotation",
    metadata=k8s.meta.v1.ObjectMetaArgs(
        name=k8s_service_acount_name,
        namespace=eks_namespace,
        annotations={
            "eks.amazonaws.com/role-arn": k8s_iam_deployment_workflow_role.arn
        }
    ),
    opts=pulumi.ResourceOptions(provider=provider)
)

cluster_name = eks_cluster.core.apply(lambda x: x.cluster.name)


# Redis stuff

redis_subnet_group = aws.elasticache.SubnetGroup(
    "redis-deployment-customer-apps-subnet-group",
    subnet_ids=eks_vpc.private_subnet_ids,
)

# Create a security group for Redis
redis_security_group = aws.ec2.SecurityGroup(
    "redis-security-group",
    vpc_id=eks_vpc.vpc_id,
    description="Security group for Redis to communicate with EKS cluster",
    ingress=[
        aws.ec2.SecurityGroupIngressArgs(
            protocol="tcp",
            from_port=6379,
            to_port=6379,
            security_groups=[cluster_security_group_id],
            description="Allow inbound from EKS cluster",
        )
    ],
    egress=[
        aws.ec2.SecurityGroupEgressArgs(
            protocol="-1",
            from_port=0,
            to_port=0,
            cidr_blocks=["0.0.0.0/0"],
            description="Allow all outbound traffic",
        )
    ],
    tags={
        "Name": "redis-security-group",
    },
)

# Redis cluster
redis_deployment_customer_apps = aws.elasticache.Cluster(
    "redis-deployment-customer-apps",
    cluster_id="redis-deployment-customer-apps",
    engine="redis",
    engine_version="7.0",
    node_type="cache.t3.micro",
    num_cache_nodes=1,
    port=6379,
    subnet_group_name=redis_subnet_group.name,
    security_group_ids=[redis_security_group.id],
    apply_immediately=True,  # Add this line to apply changes immediately
)
# TODO: Fix this

# error: 1 error occurred:
#         * Helm release "kube-system/aws-load-balancer-controller-bf4de232" was created, but failed to initialize completely. Use Helm CLI to investigate: failed to become available within allocated timeout. Error: Helm Release kube-system/aws-load-balancer-controller-bf4de232: client rate limiter Wait returned an error: context deadline exceeded

# aws_load_balancer_controller = k8s.helm.v3.Release(
#     aws_load_balancer_name,
#     k8s.helm.v3.ReleaseArgs(
#         chart="aws-load-balancer-controller",
#         version="1.8.1",
#         repository_opts=k8s.helm.v3.RepositoryOptsArgs(
#             repo="https://aws.github.io/eks-charts"
#         ),
#         namespace="kube-system",
#         values={
#             "clusterName": cluster_name,
#             "serviceAccount": {
#                 "create": False,
#                 "name": aws_load_balancer_service_account.metadata["name"],
#             },
#         },
#     ),
#     opts=pulumi.ResourceOptions(provider=provider),
# )


# Export values to use elsewhere
pulumi.export("kubeconfig", eks_cluster.kubeconfig)
pulumi.export("cluster_name", cluster_name)
pulumi.export("vpc_id", eks_vpc.vpc_id)
pulumi.export("k8s_role_arn", k8s_role_arn)
pulumi.export("aws_lb_controller_policy", aws_lb_controller_policy.arn)
pulumi.export("sqs_deployment_customer_apps_arn", sqs.sqs_deployment_customer_apps)
pulumi.export("s3_deployment_customer_apps", s3.s3_deployment_customer_apps.arn)
pulumi.export("redis_deployment_customer_apps", redis_deployment_customer_apps.cache_nodes[0].address)
