# Monitoring

## Install Prometheus + Grafana
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm upgrade --install monitoring prometheus-community/kube-prometheus-stack -n monitoring --create-namespace

## Install blackbox-exporter
helm upgrade --install blackbox prometheus-community/prometheus-blackbox-exporter -n monitoring

## Scrape the frontend Service (HTTP 200 + latency)
kubectl apply -f monitoring/servicemonitor-blackbox.yaml

## Grafana
- Open Grafana (credentials per your Helm values).
- Import `grafana-dashboard.json` for uptime, latency, and error charts.