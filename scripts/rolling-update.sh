#!/bin/bash

set -e

NEW_IMAGE=${1:-"ghcr.io/yourusername/devops:latest"}

echo "Performing rolling update with image: $NEW_IMAGE"

kubectl set image deployment/devops-demo devops-demo=$NEW_IMAGE -n devops-demo
kubectl rollout status deployment/devops-demo -n devops-demo

echo "Rollout history:"
kubectl rollout history deployment/devops-demo -n devops-demo

echo "Current pods:"
kubectl get pods -n devops-demo -l app=devops-demo
