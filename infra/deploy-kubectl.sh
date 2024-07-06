#!/usr/bin/env bash

set -e

CLOUDFLARE_API_TOKEN_DNS=${CLOUDFLARE_API_TOKEN_DNS:?}
DEPLOY_ENVIRONMENT=${DEPLOY_ENVIRONMENT:-staging}

echo "Configure Kubeconfig"
echo "${KUBECONFIG_CONTENT}" > kubeconfig.json
chmod 600 kubeconfig.json
export KUBECONFIG=kubeconfig.json

# Enable debugging
set -x

echo "Add Cloudflare token secret"
envsubst < k8s/cert-manager-cloudflare-token.yaml | kubectl apply -f -

echo "Add Cert Manager issuer prod"
kubectl apply -f k8s/cert-manager-issuer-prod.yaml

echo "Add Cert Manager issuer staging"
kubectl apply -f k8s/cert-manager-issuer-staging.yaml

echo "Add wildcard cert"
kubectl apply -f "k8s/cert-manager-wildcard-cert-${DEPLOY_ENVIRONMENT}.yaml"

echo "Remove kubeconfig.json with by running:"
echo "rm kubeconfig.json"
