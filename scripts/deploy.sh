#!/bin/bash

set -e

echo "Starting deployment..."

kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/prometheus.yaml
kubectl apply -f k8s/grafana.yaml

echo "Waiting for deployments..."
kubectl wait --for=condition=available --timeout=300s deployment/devops-demo -n devops-demo
kubectl wait --for=condition=available --timeout=300s deployment/prometheus -n devops-demo
kubectl wait --for=condition=available --timeout=300s deployment/grafana -n devops-demo

echo "Deployment complete"
kubectl get all -n devops-demo
