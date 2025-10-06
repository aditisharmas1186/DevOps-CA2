$ErrorActionPreference = "Stop"

Write-Host "Rolling back deployment..."
kubectl rollout undo deployment/businesslens-web -n businesslens

Write-Host "Waiting for rollback to complete..."
kubectl rollout status deployment/businesslens-web -n businesslens

Write-Host "Rollback completed successfully!"