param(
    [Parameter(Mandatory=$true)]
    [string]$Version
)

$ErrorActionPreference = "Stop"

Write-Host "Updating deployment to version $Version..."
kubectl set image deployment/businesslens-web businesslens-web=businesslens/web:$Version -n businesslens

Write-Host "Waiting for rollout to complete..."
kubectl rollout status deployment/businesslens-web -n businesslens

Write-Host "Update completed successfully!"