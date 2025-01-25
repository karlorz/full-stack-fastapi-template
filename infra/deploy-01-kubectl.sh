#!/usr/bin/env bash

set -e
set -x

AWS_LB_CONTROLLER_ROLE_ARN=${AWS_LB_CONTROLLER_ROLE_ARN:?}
ECR_IAM_ROLE_ARN=${ECR_IAM_ROLE_ARN:?}
NATS_LOGGING_WRITE_CREDS=${NATS_LOGGING_WRITE_CREDS:?}

echo "Create AWS LoadBalancer Controller service account"
envsubst < k8s/aws-load-balancer-controller/service-account.yaml | kubectl apply -f -

echo "Set IAM role for default account to allow pulling ECR images"
envsubst < k8s/service-account.yaml | kubectl apply -f -

echo "Set NATS logging write creds, used by Vector"
# Ref: https://stackoverflow.com/a/45881259/219530
kubectl -n vector-aggregator create secret generic --from-literal=nats.creds="${NATS_LOGGING_WRITE_CREDS}" nats-logging-write-secret --save-config --dry-run=client -o yaml | kubectl apply -f -
