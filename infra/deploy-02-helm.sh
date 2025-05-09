#!/usr/bin/env bash

set -e
set -x

CLUSTER_NAME=${CLUSTER_NAME:?}
# Update finding the latest version with:
# helm search repo eks/aws-load-balancer-controller
# Then re-download the iam-policy.json file: https://kubernetes-sigs.github.io/aws-load-balancer-controller/latest/deploy/installation/#configure-iam
AWS_LOAD_BALANCER_CONTROLLER_VERSION="1.9.2"
CERT_MANAGER_VERSION="1.16.1"
# INGRESS_NGINX_VERSION="4.11.3"

echo "Add Helm repo: eks, for AWS Load Balancer Controller"
helm repo add eks https://aws.github.io/eks-charts --force-update

echo "Add Helm repo: jetstack, for Cert Manager"
helm repo add jetstack https://charts.jetstack.io --force-update

echo "Add Helm repo: vector"
helm repo add vector https://helm.vector.dev --force-update

# TODO: remove ingress-nginx if we end up not using it at all
# echo "Add Helm repo: ingress-nginx, for Ingress Controller"
# helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx --force-update

echo "Update Helm repos"
helm repo update

echo "Install AWS Load Balancer Controller"
helm upgrade --install aws-load-balancer-controller eks/aws-load-balancer-controller \
  --namespace kube-system \
  --version "${AWS_LOAD_BALANCER_CONTROLLER_VERSION}" \
  --set clusterName="${CLUSTER_NAME}" \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller

echo "Install Cert Manager"
helm upgrade --install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version "${CERT_MANAGER_VERSION}" \
  --set crds.enabled=true

echo "Install Vector Agent & Aggregator"
helm dependency update helm/charts/vector
helm upgrade --install vector helm/charts/vector \
  --namespace vector \
  --create-namespace

# TODO: remove ingress-nginx if we end up not using it at all
# echo "Install Ingress Nginx Controller"
# helm upgrade --install ingress-nginx-external ingress-nginx/ingress-nginx \
#   --namespace ingress-nginx-external \
#   --create-namespace \
#   --version "${INGRESS_NGINX_VERSION}" \
#   -f helm-values/ingress-nginx-external-values.yaml

# TODO: remove ingress-nginx if we end up not using it at all
# LOAD_BALANCER_HOSTHAME=$(kubectl -n ingress-nginx-external get service ingress-nginx-external-controller --output jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# echo "Add DNS record for Load Balancer before continuing:"
# echo "$LOAD_BALANCER_HOSTHAME"
