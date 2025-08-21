#!/bin/bash

set -e

echo "🚀 Setting up k3d cluster for Knative"

# Check for required tools
for tool in kubectl tilt docker k3d; do
    if ! command -v $tool &> /dev/null; then
        echo "❌ $tool is not installed. Please install it first."
        exit 1
    fi
done

# Create k3d cluster with registry if it doesn't exist
if ! k3d cluster list | grep -q "^knative"; then
    k3d cluster create --config k3d-config.yaml
else
    echo "✅ k3d cluster 'knative' already exists"
fi

kubectl config use-context k3d-knative

echo "✅ Setup complete! Run 'tilt up' to install Knative and start developing."
