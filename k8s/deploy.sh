#!/bin/bash

# Todo App Kubernetes Deployment Script

echo "🚀 Deploying Todo App to Kubernetes..."

# Create namespace
echo "📦 Creating namespace..."
kubectl apply -f namespace.yaml

# Deploy MongoDB
echo "🗄️  Deploying MongoDB..."
kubectl apply -f mongodb.yaml

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/mongodb-deployment -n todo-app

# Deploy Server
echo "🖥️  Deploying Server..."
kubectl apply -f server.yaml

# Wait for Server to be ready
echo "⏳ Waiting for Server to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/server-deployment -n todo-app

# Deploy networking configuration
echo "🌐 Setting up networking..."
kubectl apply -f networking.yaml

# Deploy Client
echo "🌍 Deploying Client..."
kubectl apply -f client.yaml

# Wait for Client to be ready
echo "⏳ Waiting for Client to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/client-deployment -n todo-app

echo "✅ Deployment complete!"
echo ""
echo "📋 Getting service information..."
kubectl get services -n todo-app
echo ""
echo "📋 Getting pod status..."
kubectl get pods -n todo-app
echo ""
echo "🌐 Access your application:"
echo "   - If using LoadBalancer: Check external IP with 'kubectl get svc client-service -n todo-app'"
echo "   - If using port-forward: 'kubectl port-forward svc/client-service 8080:80 -n todo-app'"
echo "   - If using ingress: Add 'todo-app.local' to your /etc/hosts pointing to ingress IP"