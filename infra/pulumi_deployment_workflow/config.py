import pulumi

# Get some values from the Pulumi configuration (or use defaults)
aws_config = pulumi.Config("aws")
region = aws_config.get("region")
config = pulumi.Config()
account_id = config.get("aws_account_id")

min_cluster_size = config.get_int("min_cluster_size", 3)
max_cluster_size = config.get_int("max_cluster_size", 6)
desired_cluster_size = config.get_int("desired_cluster_size", 3)
eks_node_instance_type = config.get("eks_node_instance_type", "t3.medium")
vpc_network_cidr = config.get("vpc_network_cidr", "10.0.0.0/16")
stack = pulumi.get_stack()
stack_name = stack.split("/")[-1]

aws_load_balancer_name = "aws-load-balancer-controller"

sqs_deployment_customer_apps_name = f"sqs-deployment-customer-apps-{stack_name}"
