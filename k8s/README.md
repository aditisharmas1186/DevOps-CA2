# Kubernetes Deployment for Todo App

This directory contains Kubernetes manifests to deploy the Todo application on any Kubernetes cluster.

## 📁 Files Structure

- `namespace.yaml` - Creates the todo-app namespace
- `mongodb.yaml` - MongoDB deployment, service, and PVC
- `server.yaml` - Node.js backend deployment and service
- `client.yaml` - React frontend deployment and service  
- `networking.yaml` - ConfigMap for nginx and Ingress configuration
- `deploy.sh` - Automated deployment script
- `cleanup.sh` - Cleanup script

## 🚀 Quick Deployment

### Prerequisites
- Kubernetes cluster (local or cloud)
- kubectl configured
- Docker images built and pushed (or use provided images)

### Deploy Everything
```bash
cd k8s
chmod +x deploy.sh
./deploy.sh
```

### Manual Deployment
```bash
# Apply in order
kubectl apply -f namespace.yaml
kubectl apply -f mongodb.yaml
kubectl apply -f server.yaml
kubectl apply -f networking.yaml
kubectl apply -f client.yaml
```

## 🌐 Accessing the Application

### Option 1: LoadBalancer (Cloud)
```bash
kubectl get svc client-service -n todo-app
# Use the EXTERNAL-IP
```

### Option 2: Port Forward (Local)
```bash
kubectl port-forward svc/client-service 8080:80 -n todo-app
# Access at http://localhost:8080
```

### Option 3: Ingress (with Ingress Controller)
```bash
# Add to /etc/hosts
echo "$(kubectl get ingress todo-app-ingress -n todo-app -o jsonpath='{.status.loadBalancer.ingress[0].ip}') todo-app.local" >> /etc/hosts
# Access at http://todo-app.local
```

## 🔧 Configuration

### Environment Variables
The server deployment uses these environment variables:
- `NODE_ENV=production`
- `MONGODB_URI=mongodb://mongodb-service:27017/todoapp`
- `PORT=5000`

### Resource Limits
- **MongoDB**: 256Mi-512Mi RAM, 250m-500m CPU
- **Server**: 128Mi-256Mi RAM, 100m-200m CPU  
- **Client**: 64Mi-128Mi RAM, 50m-100m CPU

### Scaling
```bash
# Scale server replicas
kubectl scale deployment server-deployment --replicas=3 -n todo-app

# Scale client replicas
kubectl scale deployment client-deployment --replicas=3 -n todo-app
```

## 🔍 Monitoring

### Check Pod Status
```bash
kubectl get pods -n todo-app
```

### View Logs
```bash
# Server logs
kubectl logs -f deployment/server-deployment -n todo-app

# Client logs
kubectl logs -f deployment/client-deployment -n todo-app

# MongoDB logs
kubectl logs -f deployment/mongodb-deployment -n todo-app
```

### Health Checks
```bash
# Check if services are accessible
kubectl port-forward svc/server-service 5000:5000 -n todo-app &
curl http://localhost:5000/health
```

## 🧹 Cleanup

### Remove Everything
```bash
./cleanup.sh
```

### Manual Cleanup
```bash
kubectl delete namespace todo-app
```

## 🛠️ Troubleshooting

### Common Issues

1. **Pods not starting**: Check resource limits and node capacity
2. **MongoDB connection issues**: Verify service names and ports
3. **Image pull errors**: Ensure images exist in registry
4. **LoadBalancer pending**: Use port-forward for local testing

### Debug Commands
```bash
# Describe resources
kubectl describe pod <pod-name> -n todo-app
kubectl describe svc <service-name> -n todo-app

# Get events
kubectl get events -n todo-app --sort-by=.metadata.creationTimestamp

# Shell into containers
kubectl exec -it <pod-name> -n todo-app -- /bin/sh
```

## 📊 Architecture

```
Internet
    ↓
LoadBalancer/Ingress
    ↓
Client Service (nginx) → Client Pods (React App)
    ↓ (proxy /api)
Server Service → Server Pods (Node.js API)
    ↓
MongoDB Service → MongoDB Pod
    ↓
PersistentVolume (Database Storage)
```

## 🔐 Security Notes

- All services use ClusterIP except client (LoadBalancer)
- MongoDB is not exposed externally
- Resource limits prevent resource exhaustion
- Health checks ensure pod reliability