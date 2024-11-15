#!/usr/bin/env bash

set -e
set -x

AWS_LB_CONTROLLER_ROLE_ARN=${AWS_LB_CONTROLLER_ROLE_ARN:?}
ECR_IAM_ROLE_ARN=${ECR_IAM_ROLE_ARN:?}

echo "Create AWS LoadBalancer Controller service account"
envsubst < k8s/aws-load-balancer-controller/service-account.yaml | kubectl apply -f -

echo "Set IAM role for default account to allow pulling ECR images"
envsubst < k8s/service-account.yaml | kubectl apply -f -
