#!/bin/bash

# Todo App Kubernetes Cleanup Script

echo "🧹 Cleaning up Todo App from Kubernetes..."

# Delete all resources
kubectl delete -f client.yaml
kubectl delete -f server.yaml
kubectl delete -f networking.yaml
kubectl delete -f mongodb.yaml
kubectl delete -f namespace.yaml

echo "✅ Cleanup complete!"