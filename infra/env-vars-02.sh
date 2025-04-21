#!/usr/bin/env bash

set -e

ENVIRONMENT=${ENVIRONMENT:?}

LOAD_BALANCER_DNS="$(aws elbv2 describe-load-balancers --profile $ENVIRONMENT --query 'LoadBalancers[*].DNSName' --output text)"
export LOAD_BALANCER_DNS
echo "export LOAD_BALANCER_DNS='${LOAD_BALANCER_DNS}'"

echo '# Once this works, run it with: eval $(bash env-vars-02.sh)'
