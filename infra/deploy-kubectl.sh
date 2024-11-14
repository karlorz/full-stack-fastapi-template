#!/usr/bin/env bash

set -e
set -x

# TODO: remove if only using the Cloudflare Origin CA is enough for all use cases
# CLOUDFLARE_API_TOKEN_DNS=${CLOUDFLARE_API_TOKEN_DNS:?}
CLOUDFLARE_API_TOKEN_SSL=${CLOUDFLARE_API_TOKEN_SSL:?}
REGISTRY_ID=${REGISTRY_ID:?}
ENVIRONMENT=${ENVIRONMENT:-development}
KNATIVE_VERSION="1.16.0"
CLOUDFLARE_ORIGIN_CA_ISSUER_VERSION="0.10.0"

# TODO: remove if only using the Cloudflare Origin CA is enough for all use cases
# Also remove these files
# echo "Add Cloudflare API token DNS secret"
# envsubst < k8s/cert-manager/cloudflare-token-dns.yaml | kubectl apply -f -

# echo "Add Cert Manager issuer production"
# kubectl apply -f k8s/cert-manager/issuer-production.yaml

# echo "Add Cert Manager issuer staging"
# kubectl apply -f k8s/cert-manager/issuer-staging.yaml

# echo "Add wildcard cert"
# kubectl apply -f "k8s/cert-manager/wildcard-cert-${ENVIRONMENT}.yaml"

# echo "Add wildcard cert for serving"
# kubectl apply -f "k8s/cert-manager/wildcard-cert-serving-${ENVIRONMENT}.yaml"

echo "Create fastapicloud namespace"
kubectl apply -f k8s/fastapicloud/namespace.yaml

echo "Install Cloudflare Origin Server CA"

# They don't have an official/structured installation process, so manually install
# file by file, if they add files to the directories, those would need to be added
# by hand here
# Repo: https://github.com/cloudflare/origin-ca-issuer

echo "Install Cloudflare Origin Server CA - CRDs"
kubectl apply -f https://raw.githubusercontent.com/cloudflare/origin-ca-issuer/v${CLOUDFLARE_ORIGIN_CA_ISSUER_VERSION}/deploy/crds/cert-manager.k8s.cloudflare.com_clusteroriginissuers.yaml
kubectl apply -f https://raw.githubusercontent.com/cloudflare/origin-ca-issuer/v${CLOUDFLARE_ORIGIN_CA_ISSUER_VERSION}/deploy/crds/cert-manager.k8s.cloudflare.com_originissuers.yaml

echo "Install Cloudflare Origin Server CA - RBAC"
kubectl apply -f https://raw.githubusercontent.com/cloudflare/origin-ca-issuer/v${CLOUDFLARE_ORIGIN_CA_ISSUER_VERSION}/deploy/rbac/role-approver.yaml
kubectl apply -f https://raw.githubusercontent.com/cloudflare/origin-ca-issuer/v${CLOUDFLARE_ORIGIN_CA_ISSUER_VERSION}/deploy/rbac/role.yaml
kubectl apply -f https://raw.githubusercontent.com/cloudflare/origin-ca-issuer/v${CLOUDFLARE_ORIGIN_CA_ISSUER_VERSION}/deploy/rbac/role-binding.yaml

echo "Install Cloudflare Origin Server CA - Manifests"
kubectl apply -f https://raw.githubusercontent.com/cloudflare/origin-ca-issuer/v${CLOUDFLARE_ORIGIN_CA_ISSUER_VERSION}/deploy/manifests/0-namespace.yaml
kubectl apply -f https://raw.githubusercontent.com/cloudflare/origin-ca-issuer/v${CLOUDFLARE_ORIGIN_CA_ISSUER_VERSION}/deploy/manifests/serviceaccount.yaml
kubectl apply -f https://raw.githubusercontent.com/cloudflare/origin-ca-issuer/v${CLOUDFLARE_ORIGIN_CA_ISSUER_VERSION}/deploy/manifests/deployment.yaml

echo "Add Cloudflare API token SSL secret"
envsubst < k8s/cloudflare/cloudflare-api-token-ssl.yaml | kubectl apply -f -

echo "Create Cloudflare Origin CA ClusterOriginIssuer"
kubectl apply -f k8s/cloudflare/cloudflare-origin-ca-cluster-issuer.yaml

echo "Add Cloudflare Origin certificate"
kubectl apply -f "k8s/cloudflare/origin-ca-cert-${ENVIRONMENT}.yaml"

echo "Install Knative Serving CRDs"
KNATIVE_TAG="knative-v${KNATIVE_VERSION}"
kubectl apply -f https://github.com/knative/serving/releases/download/${KNATIVE_TAG}/serving-crds.yaml

echo "Install Knative Serving and Kourier"
kubectl apply -k "k8s/knative/kustomize/overlays/${ENVIRONMENT}"

echo "Create fastapicloud service account"
kubectl apply -f k8s/fastapicloud/service-account.yaml

echo "Add DNS record for Knative:"

KNATIVE_LOAD_BALANCER_HOSTHAME=$(kubectl -n kourier-system get service kourier --output jsonpath='{.status.loadBalancer.ingress[0].hostname}')

echo "Add DNS record for Knative Load Balancer before continuing:"
echo "$KNATIVE_LOAD_BALANCER_HOSTHAME"
