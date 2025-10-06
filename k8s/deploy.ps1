$ErrorActionPreference = "Stop"

Write-Host "Creating namespace..."
kubectl create namespace businesslens --dry-run=client -o yaml | kubectl apply -f -

Write-Host "Applying ConfigMap and Secrets..."
kubectl apply -f configmap.yaml
kubectl apply -f secrets.yaml

Write-Host "Deploying MongoDB..."
kubectl apply -f mongodb.yaml

Write-Host "Deploying main application..."
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

Write-Host "Waiting for deployment to complete..."
kubectl rollout status deployment/businesslens-web -n businesslens

Write-Host "Deployment completed successfully!"