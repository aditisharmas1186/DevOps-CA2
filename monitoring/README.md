# Monitoring Setup - Prometheus + Grafana

This directory contains Kubernetes manifests for deploying a complete monitoring stack with Prometheus and Grafana for the Autonomous AI Tutor Orchestrator application.

## 📋 Overview

The monitoring setup provides:
- **Prometheus**: Metrics collection and alerting
- **Grafana**: Visualization and dashboarding
- **Node Exporter**: System metrics collection
- **Application Metrics**: Custom application metrics
- **Alerting**: Configurable alerting rules
- **Persistent Storage**: Data persistence for Prometheus and Grafana

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Applications  │────│   Prometheus    │────│    Grafana      │
│   (Targets)     │    │   (Collector)   │    │  (Visualizer)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                        ┌─────────────────┐
                        │  Node Exporter  │
                        │ (System Metrics)│
                        └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

1. **Kubernetes Cluster**: Running cluster with sufficient resources
2. **kubectl**: Configured to access your cluster
3. **Storage Class**: For persistent volumes (or use local storage)

### Deploy Monitoring Stack

```bash
# Apply namespace first
kubectl apply -f namespace.yml

# Apply RBAC (required for Prometheus)
kubectl apply -f rbac.yml

# Apply persistent volumes
kubectl apply -f prometheus-pvc.yml
kubectl apply -f grafana-pvc.yml

# Apply configuration
kubectl apply -f prometheus-config.yml
kubectl apply -f grafana-datasources.yml
kubectl apply -f grafana-dashboards.yml
kubectl apply -f grafana-secrets.yml

# Apply main services
kubectl apply -f prometheus-deployment.yml
kubectl apply -f prometheus-service.yml
kubectl apply -f grafana-deployment.yml
kubectl apply -f grafana-service.yml
```

### Deploy Node Exporter (for system metrics)

```bash
# Apply Node Exporter as DaemonSet for system metrics
kubectl apply -f node-exporter-daemonset.yml
kubectl apply -f node-exporter-service.yml
```

### Verify Deployment

```bash
# Check all components are running
kubectl get all -n monitoring

# Check persistent volumes
kubectl get pvc -n monitoring

# Check services
kubectl get services -n monitoring
```

## 📊 Accessing the Dashboards

### Port Forward to Access Locally

```bash
# Access Prometheus (port 9090)
kubectl port-forward svc/prometheus 9090:9090 -n monitoring

# Access Grafana (port 3000) - Default credentials: admin/admin123
kubectl port-forward svc/grafana 3000:3000 -n monitoring
```

### Access URLs
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin123)

### Production Access (Optional)

For production access, create an Ingress:

```bash
kubectl apply -f grafana-ingress.yml
```

## 📈 Metrics Collection

### Application Metrics

The setup automatically collects metrics from:
- **Node Exporter**: CPU, memory, disk, network metrics
- **Application**: Custom application metrics (if exposed)
- **Kubernetes**: Pod, deployment, and service metrics

### Sample Queries in Prometheus

```promql
# System CPU usage
100 - (avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory usage
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# Application response time (if available)
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Error rate (if available)
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100
```

## 🎨 Grafana Dashboards

### Pre-configured Dashboard

The setup includes a sample dashboard with panels for:
- **Application Response Time**: 95th percentile latency
- **Error Rate**: HTTP 5xx error percentage
- **Active Users**: Concurrent user metrics
- **System CPU Usage**: Node CPU utilization
- **Memory Usage**: System memory consumption
- **Network I/O**: Network traffic metrics

### Adding Custom Dashboards

1. **Import Dashboard JSON**:
   - Go to Grafana → Dashboards → Import
   - Upload your dashboard JSON file

2. **Create New Dashboard**:
   - Use the Query Editor to build custom panels
   - Add Prometheus as the data source

## ⚙️ Configuration Files

```
monitoring/
├── namespace.yml              # Monitoring namespace
├── prometheus-config.yml      # Prometheus scrape configuration
├── prometheus-deployment.yml  # Prometheus server deployment
├── prometheus-service.yml     # Prometheus service
├── prometheus-pvc.yml         # Prometheus storage
├── grafana-deployment.yml     # Grafana server deployment
├── grafana-service.yml        # Grafana service
├── grafana-pvc.yml           # Grafana storage
├── grafana-datasources.yml    # Grafana data source config
├── grafana-dashboards.yml    # Grafana dashboard provisioning
├── grafana-secrets.yml       # Grafana admin password
├── rbac.yml                  # Prometheus RBAC permissions
├── dashboard.json            # Sample dashboard
├── grafana-ingress.yml       # Optional: External access
├── node-exporter-daemonset.yml  # Optional: System metrics
├── node-exporter-service.yml    # Optional: Node Exporter service
└── README.md                 # This file
```

## 🔧 Customization

### Update Prometheus Configuration

Edit `prometheus-config.yml` to:
- Add new scrape targets
- Modify scrape intervals
- Configure alerting rules

### Update Grafana Settings

Edit `grafana-deployment.yml` to:
- Change default password
- Add plugins
- Modify resource limits

### Add Custom Metrics

1. **Application Level**: Expose `/metrics` endpoint in your app
2. **Infrastructure Level**: Deploy additional exporters

## 🚨 Alerting Setup (Optional)

### Configure AlertManager

```yaml
# Add to prometheus-config.yml
alerting:
  alertmanagers:
  - static_configs:
    - targets:
      - alertmanager:9093
```

### Sample Alert Rules

```yaml
groups:
- name: application_alerts
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100 > 5
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: High error rate detected
```

## 🔒 Security Considerations

- Change default Grafana password in production
- Use proper RBAC for service accounts
- Enable authentication for external access
- Regularly update container images
- Monitor for security vulnerabilities

## 📊 Scaling Considerations

- **Prometheus**: Single replica for small deployments
- **Grafana**: Single replica for dashboard access
- **Storage**: Plan for metrics growth over time
- **Resources**: Monitor CPU/memory usage of monitoring components

## 🛠️ Troubleshooting

### Common Issues

1. **Pods not starting**:
   ```bash
   kubectl describe pod <pod-name> -n monitoring
   kubectl logs <pod-name> -n monitoring
   ```

2. **Metrics not appearing**:
   ```bash
   # Check Prometheus targets
   kubectl port-forward svc/prometheus 9090:9090 -n monitoring
   # Visit http://localhost:9090/targets
   ```

3. **Grafana dashboards not loading**:
   ```bash
   kubectl logs deployment/grafana -n monitoring
   ```

### Debug Commands

```bash
# Check all monitoring components
kubectl get all -n monitoring

# Check logs for all components
kubectl logs -l app=prometheus -n monitoring
kubectl logs -l app=grafana -n monitoring

# Check persistent volumes
kubectl get pv,pvc -n monitoring

# Test Prometheus queries
kubectl exec -it deployment/prometheus -n monitoring -- prometheus --config.file=/etc/prometheus/prometheus.yml --query 'up'
```

## 📈 Production Checklist

- [ ] Configure persistent storage with proper sizing
- [ ] Set up proper RBAC and security contexts
- [ ] Configure backup strategy for metrics data
- [ ] Set up alerting and notification channels
- [ ] Configure log aggregation for monitoring components
- [ ] Plan for horizontal scaling if needed
- [ ] Set up monitoring for the monitoring stack itself

## 🔗 Integration with Application

To expose custom application metrics:

1. **Add metrics endpoint** to your application
2. **Configure Prometheus** to scrape the endpoint
3. **Create custom dashboards** in Grafana
4. **Set up alerting rules** for application-specific metrics

## 🤝 Support

For issues or questions:
1. Check pod status and logs
2. Verify configuration files
3. Test connectivity between components
4. Review resource usage and limits
5. Check storage and networking configuration

## 📚 Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Kubernetes Monitoring Guide](https://kubernetes.io/docs/tasks/debug/debug-cluster/)
