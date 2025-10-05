# Kubernetes Deployment for Autonomous AI Tutor Orchestrator

This directory contains Kubernetes manifests for deploying the Autonomous AI Tutor Orchestrator application with production-ready features including rolling updates, auto-scaling, and monitoring integration.

## 📋 Overview

The Kubernetes setup provides:
- **Namespace Isolation**: Dedicated namespace for the application
- **Configuration Management**: ConfigMaps and Secrets for environment variables
- **Rolling Updates**: Zero-downtime deployment strategy
- **Auto-scaling**: Horizontal Pod Autoscaler based on resource usage
- **Service Discovery**: ClusterIP service for internal communication
- **External Access**: Ingress for external traffic (optional)

## 🏗️ Architecture

```
Internet
    ↓
[Ingress Controller]
    ↓
[Service - ClusterIP]
    ↓
[Deployment - 3 Replicas]
    ↓
[Pods with Containers]
```

## 🚀 Quick Start

### Prerequisites

1. **Kubernetes Cluster**: Running Kubernetes cluster (local or cloud)
2. **kubectl**: Configured to access your cluster
3. **Docker Image**: `pranshugupta111/ai-tutor-orchestrator:latest`

### Deploy Application

```bash
# Apply namespace first
kubectl apply -f namespace.yml

# Apply configuration and secrets
kubectl apply -f configmap.yml
kubectl apply -f secret.yml
kubectl apply -f docker-secret.yml

# Apply the main application
kubectl apply -f deployment.yml
kubectl apply -f service.yml
kubectl apply -f hpa.yml

# Optional: Apply ingress for external access
kubectl apply -f ingress.yml
```

### Verify Deployment

```bash
# Check deployment status
kubectl get deployments -n tutor-orchestrator

# Check pod status
kubectl get pods -n tutor-orchestrator

# Check service
kubectl get services -n tutor-orchestrator

# Check HPA
kubectl get hpa -n tutor-orchestrator

# View logs
kubectl logs -f deployment/tutor-orchestrator -n tutor-orchestrator
```

## 🔄 Rolling Updates & Rollback

### Perform Rolling Update

```bash
# Update image version
kubectl set image deployment/tutor-orchestrator tutor-orchestrator=pranshugupta111/ai-tutor-orchestrator:v2.0.0 -n tutor-orchestrator

# Or patch the deployment
kubectl patch deployment tutor-orchestrator -p '{"spec":{"template":{"spec":{"containers":[{"name":"tutor-orchestrator","image":"pranshugupta111/ai-tutor-orchestrator:v2.0.0"}]}}}}' -n tutor-orchestrator
```

### Monitor Rolling Update

```bash
# Watch rollout status
kubectl rollout status deployment/tutor-orchestrator -n tutor-orchestrator

# Check rollout history
kubectl rollout history deployment/tutor-orchestrator -n tutor-orchestrator

# Monitor pod updates in real-time
kubectl get pods -n tutor-orchestrator -w
```

### Rollback Deployment

```bash
# Rollback to previous version
kubectl rollout undo deployment/tutor-orchestrator -n tutor-orchestrator

# Rollback to specific revision
kubectl rollout undo deployment/tutor-orchestrator --to-revision=2 -n tutor-orchestrator
```

## 📁 File Structure

```
k8s/
├── namespace.yml        # Namespace definition
├── configmap.yml       # Application configuration
├── secret.yml         # Sensitive data (API keys, passwords)
├── docker-secret.yml   # Docker Hub registry credentials
├── deployment.yml      # Main application deployment
├── service.yml        # Service to expose deployment
├── hpa.yml           # Horizontal Pod Autoscaler
├── ingress.yml       # Ingress for external access
└── README.md         # This file
```

## ⚙️ Configuration

### Update Application Image

Edit `deployment.yml`:
```yaml
image: your-registry/your-app:new-version
```

### Update Environment Variables

Edit `configmap.yml`:
```yaml
data:
  APP_ENV: "production"
  LOG_LEVEL: "DEBUG"
```

### Update Secrets

1. **Encode your secrets**:
   ```bash
   echo -n "your-api-key" | base64
   ```

2. **Update `secret.yml`** with base64-encoded values

### Scale Application

```bash
# Manual scaling
kubectl scale deployment tutor-orchestrator --replicas=5 -n tutor-orchestrator

# Check HPA recommendations
kubectl describe hpa tutor-orchestrator-hpa -n tutor-orchestrator
```

## 🔍 Monitoring & Troubleshooting

### Check Application Health

```bash
# Port forward to access application
kubectl port-forward svc/tutor-orchestrator-service 8000:80 -n tutor-orchestrator

# Check health endpoint
curl http://localhost:8000/health
```

### Debug Issues

```bash
# Check pod events
kubectl describe pod <pod-name> -n tutor-orchestrator

# Check pod logs
kubectl logs <pod-name> -n tutor-orchestrator

# Debug with exec
kubectl exec -it <pod-name> -n tutor-orchestrator -- /bin/bash
```

### Resource Monitoring

```bash
# Check resource usage
kubectl top pods -n tutor-orchestrator
kubectl top nodes

# Check HPA status
kubectl describe hpa tutor-orchestrator-hpa -n tutor-orchestrator
```

## 🛠️ Customization

### Add Persistent Storage

```yaml
volumes:
- name: app-data
  persistentVolumeClaim:
    claimName: tutor-orchestrator-pvc
```

### Add Init Containers

```yaml
initContainers:
- name: init-config
  image: busybox
  command: ['sh', '-c', 'echo "Initializing..."']
```

### Add Sidecar Containers

```yaml
containers:
- name: tutor-orchestrator
  # Main container
- name: monitoring-sidecar
  image: monitoring-agent:latest
  # Sidecar container
```

## 🔒 Security Considerations

- Use strong secrets and rotate them regularly
- Implement network policies for namespace isolation
- Use RBAC for access control
- Scan images for vulnerabilities
- Enable audit logging

## 📊 Metrics Integration

The deployment includes:
- **Resource metrics** for auto-scaling
- **Health checks** for readiness and liveness
- **Logging** for monitoring and debugging

Ready for integration with:
- **Prometheus** for metrics collection
- **Grafana** for visualization
- **ELK Stack** for log aggregation

## 🚨 Production Checklist

- [ ] Configure proper resource limits and requests
- [ ] Set up monitoring and alerting
- [ ] Configure log aggregation
- [ ] Set up backup and disaster recovery
- [ ] Implement security best practices
- [ ] Configure ingress with proper TLS certificates
- [ ] Set up CI/CD integration for automated deployments

## 🤝 Support

For issues or questions:
1. Check pod status and logs
2. Verify configuration and secrets
3. Test connectivity between components
4. Review resource usage and limits
