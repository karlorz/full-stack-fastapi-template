#!/usr/bin/env bash

set -e

CLOUDFLARE_API_TOKEN_DNS=${CLOUDFLARE_API_TOKEN_DNS:?}
DEPLOY_ENVIRONMENT=${DEPLOY_ENVIRONMENT:-development}

echo "Configure Kubeconfig"
echo "${KUBECONFIG_CONTENT}" > kubeconfig.json
chmod 600 kubeconfig.json
export KUBECONFIG=kubeconfig.json

# Enable debugging
set -x

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

echo "Add DNS record for Knative:"

KNATIVE_LOAD_BALANCER_HOSTHAME=$(kubectl -n kourier-system get service kourier --output jsonpath='{.status.loadBalancer.ingress[0].hostname}')

echo "Add DNS record for Knative Load Balancer before continuing:"
echo "$KNATIVE_LOAD_BALANCER_HOSTHAME"

echo "Remove kubeconfig.json with by running:"
echo "rm kubeconfig.json"
