# Deploy the application
function Deploy-Application {
    # Create namespace if it doesn't exist
    kubectl create namespace businesslens --dry-run=client -o yaml | kubectl apply -f -

    # Apply ConfigMap and Secrets first
    kubectl apply -f k8s/configmap.yaml
    kubectl apply -f k8s/secrets.yaml

    # Deploy MongoDB
    kubectl apply -f k8s/mongodb.yaml

    # Deploy the main application
    kubectl apply -f k8s/deployment.yaml
    kubectl apply -f k8s/service.yaml
}

# Perform a rolling update
function Update-Application {
    param (
        [string]$Version
    )
    
    # Update the deployment with new version
    kubectl set image deployment/businesslens-web businesslens-web=businesslens/web:$Version -n businesslens
    
    # Watch the rollout status
    kubectl rollout status deployment/businesslens-web -n businesslens
}

# Rollback to previous version
function Rollback-Application {
    # Rollback to the previous version
    kubectl rollout undo deployment/businesslens-web -n businesslens
    
    # Watch the rollout status
    kubectl rollout status deployment/businesslens-web -n businesslens
}

# View rollout history
function Get-RolloutHistory {
    kubectl rollout history deployment/businesslens-web -n businesslens
}

# Example usage:
# Initial deployment:
# ./k8s-deploy.ps1
# Deploy-Application

# Update to a new version:
# ./k8s-deploy.ps1
# Update-Application -Version "v1.1.0"

# Rollback to previous version:
# ./k8s-deploy.ps1
# Rollback-Application

# View deployment history:
# ./k8s-deploy.ps1
# Get-RolloutHistory