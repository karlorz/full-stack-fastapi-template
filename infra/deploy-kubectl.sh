#!/usr/bin/env bash

set -e
set -x

CLOUDFLARE_API_TOKEN_DNS=${CLOUDFLARE_API_TOKEN_DNS:?}
REGISTRY_ID=${REGISTRY_ID:?}
SQS_SOURCE_ARN=${SQS_SOURCE_ARN:?}
DEPLOY_ENVIRONMENT=${DEPLOY_ENVIRONMENT:-development}
KNATIVE_VERSION="1.14.1"

echo "Add Cloudflare token secret"
envsubst < k8s/cert-manager/cloudflare-token.yaml | kubectl apply -f -

echo "Add Cert Manager issuer production"
kubectl apply -f k8s/cert-manager/issuer-production.yaml

echo "Add Cert Manager issuer staging"
kubectl apply -f k8s/cert-manager/issuer-staging.yaml

echo "Add wildcard cert"
kubectl apply -f "k8s/cert-manager/wildcard-cert-${DEPLOY_ENVIRONMENT}.yaml"

echo "Add wildcard cert for serving"
kubectl apply -f "k8s/cert-manager/wildcard-cert-serving-${DEPLOY_ENVIRONMENT}.yaml"

echo "Install Knative Serving CRDs"
KNATIVE_TAG="knative-v${KNATIVE_VERSION}"
kubectl apply -f https://github.com/knative/serving/releases/download/${KNATIVE_TAG}/serving-crds.yaml

echo "Install Knative Serving and Kourier"
kubectl apply -k "k8s/knative/overlays/${DEPLOY_ENVIRONMENT}"

echo "Install Knative Serving Role"
kubectl apply -f k8s/knative/deployment-workflow/knative-serving-role.yaml

echo "Install TriggerMesh Core CRDs"
kubectl apply -f k8s/knative/deployment-workflow/triggermesh-core-crds.yaml

echo "Install TriggerMesh Core"
envsubst < k8s/knative/deployment-workflow/triggermesh-core.yaml | kubectl apply -f -

echo "Install TriggerMesh CRDs v2"
kubectl apply -f k8s/knative/deployment-workflow/triggermesh-crds_v2.yaml

echo "Install TriggerMesh v2"
envsubst < k8s/knative/deployment-workflow/triggermesh_v2.yaml | kubectl apply -f -

echo "Install TriggerMesh Redis Broker"
kubectl apply -f k8s/knative/deployment-workflow/redis-broker.yaml

echo "Install TriggerMesh SQS S3 Source"
envsubst < k8s/knative/deployment-workflow/s3-source.yaml | kubectl apply -f -

echo "Add DNS record for Knative:"

KNATIVE_LOAD_BALANCER_HOSTHAME=$(kubectl -n kourier-system get service kourier --output jsonpath='{.status.loadBalancer.ingress[0].hostname}')

echo "Add DNS record for Knative Load Balancer before continuing:"
echo "$KNATIVE_LOAD_BALANCER_HOSTHAME"
