#!/bin/bash

set -e

REVISION=${1:-0}

echo "Rolling back deployment..."

if [ "$REVISION" -eq 0 ]; then
    kubectl rollout undo deployment/devops-demo -n devops-demo
else
    kubectl rollout undo deployment/devops-demo --to-revision=$REVISION -n devops-demo
fi

kubectl rollout status deployment/devops-demo -n devops-demo

echo "Current pods:"
kubectl get pods -n devops-demo -l app=devops-demo

echo "Rollout history:"
kubectl rollout history deployment/devops-demo -n devops-demo
