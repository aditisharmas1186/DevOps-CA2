#!/bin/bash

set -e

echo "Monitoring Dashboard"
echo "===================="
echo ""

kubectl get namespace devops-demo
echo ""

kubectl get deployments -n devops-demo
echo ""

kubectl get pods -n devops-demo -o wide
echo ""

kubectl get services -n devops-demo
echo ""

kubectl get hpa -n devops-demo
echo ""

kubectl get events -n devops-demo --sort-by='.lastTimestamp' | tail -10
echo ""

kubectl logs -n devops-demo -l app=devops-demo --tail=20
