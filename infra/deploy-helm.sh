#!/usr/bin/env bash

set -e

CLUSTER_NAME=${CLUSTER_NAME:?}
KUBECONFIG_CONTENT=${KUBECONFIG_CONTENT:?}
AWS_LOAD_BALANCER_CONTROLLER_VERSION="1.8.1"
CERT_MANAGER_VERSION="1.15.1"
INGRESS_NGINX_VERSION="4.10.1"

echo "Configure Kubeconfig"
echo "${KUBECONFIG_CONTENT}" > kubeconfig.json
chmod 600 kubeconfig.json
export KUBECONFIG=kubeconfig.json

# Enable debugging
set -x

echo "Add Helm repo: eks, for AWS Load Balancer Controller"
helm repo add eks https://aws.github.io/eks-charts --force-update

echo "Add Helm repo: jetstack, for Cert Manager"
helm repo add jetstack https://charts.jetstack.io --force-update

echo "Add Helm repo: ingress-nginx, for Ingress Controller"
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx --force-update

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

echo "Install Ingress Nginx Controller"
helm upgrade --install ingress-nginx-external ingress-nginx/ingress-nginx \
  --namespace ingress-nginx-external \
  --create-namespace \
  --version "${INGRESS_NGINX_VERSION}" \
  -f helm-values/ingress-nginx-external-values.yaml

LOAD_BALANCER_HOSTHAME=$(kubectl -n ingress-nginx-external get service ingress-nginx-external-controller --output jsonpath='{.status.loadBalancer.ingress[0].hostname}')

echo "Add DNS record for Load Balancer before continuing:"
echo "$LOAD_BALANCER_HOSTHAME"

echo "Remove kubeconfig.json with by running:"
echo "rm kubeconfig.json"
