#!/usr/bin/env bash

set -e

ENVIRONMENT=${ENVIRONMENT:?}

KUBECONFIG_DATA=$(pulumi stack output kubeconfig_data --stack fastapilabs/$ENVIRONMENT)
export KUBECONFIG_DATA
echo "export KUBECONFIG_DATA='${KUBECONFIG_DATA}'"

AWS_LB_CONTROLLER_ROLE_ARN="$(pulumi stack output aws_lb_controller_role_arn --stack fastapilabs/$ENVIRONMENT)"
export AWS_LB_CONTROLLER_ROLE_ARN
echo "export AWS_LB_CONTROLLER_ROLE_ARN='${AWS_LB_CONTROLLER_ROLE_ARN}'"

ECR_IAM_ROLE_ARN="$(pulumi stack output ecr_iam_role_arn --stack fastapilabs/$ENVIRONMENT)"
export ECR_IAM_ROLE_ARN
echo "export ECR_IAM_ROLE_ARN='${ECR_IAM_ROLE_ARN}'"

CLUSTER_NAME="$(pulumi stack output cluster_name --stack fastapilabs/$ENVIRONMENT)"
export CLUSTER_NAME
echo "export CLUSTER_NAME='${CLUSTER_NAME}'"

REGISTRY_ID="$(pulumi stack output ecr_registry_id --stack fastapilabs/$ENVIRONMENT)"
export REGISTRY_ID
echo "export REGISTRY_ID='${REGISTRY_ID}'"

FASTAPICLOUD_IAM_ROLE_ARN="$(pulumi stack output fastapicloud_iam_role_arn --stack fastapilabs/$ENVIRONMENT)"
export FASTAPICLOUD_IAM_ROLE_ARN
echo "export FASTAPICLOUD_IAM_ROLE_ARN='${FASTAPICLOUD_IAM_ROLE_ARN}'"

AWS_DEPLOYMENT_BUCKET="$(pulumi stack output aws_deployment_bucket --stack fastapilabs/$ENVIRONMENT)"
export AWS_DEPLOYMENT_BUCKET
echo "export AWS_DEPLOYMENT_BUCKET='${AWS_DEPLOYMENT_BUCKET}'"

ECR_REGISTRY_URL="$(pulumi stack output ecr_registry_url --stack fastapilabs/$ENVIRONMENT)"
export ECR_REGISTRY_URL
echo "export ECR_REGISTRY_URL='${ECR_REGISTRY_URL}'"

REDIS_SERVER="$(pulumi stack output redis_backend --stack fastapilabs/$ENVIRONMENT)"
export REDIS_SERVER
echo "export REDIS_SERVER='${REDIS_SERVER}'"

AWS_SQS_BUILDER_QUEUE_NAME="$(pulumi stack output sqs_builder_queue_name --stack fastapilabs/$ENVIRONMENT)"
export AWS_SQS_BUILDER_QUEUE_NAME
echo "export AWS_SQS_BUILDER_QUEUE_NAME='${AWS_SQS_BUILDER_QUEUE_NAME}'"

echo '# Once this works, run it with: eval $(bash env-vars-01.sh)'
