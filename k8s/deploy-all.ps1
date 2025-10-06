#!/usr/bin/env pwsh

$ErrorActionPreference = "Stop"

Write-Host "Creating namespace..." -ForegroundColor Green
kubectl create namespace businesslens --dry-run=client -o yaml | kubectl apply -f -

Write-Host "Applying configuration resources..." -ForegroundColor Green
kubectl apply -f config.yaml

Write-Host "Deploying MongoDB..." -ForegroundColor Green
kubectl apply -f mongodb.yaml

Write-Host "Deploying Redis..." -ForegroundColor Green
kubectl apply -f redis.yaml

Write-Host "Deploying main application..." -ForegroundColor Green
kubectl apply -f deployment.yaml

Write-Host "Waiting for deployments to be ready..." -ForegroundColor Green
kubectl -n businesslens rollout status deployment/businesslens-web
kubectl -n businesslens rollout status statefulset/mongodb
kubectl -n businesslens rollout status deployment/redis

Write-Host "Getting service status..." -ForegroundColor Green
kubectl -n businesslens get services

Write-Host "Getting pod status..." -ForegroundColor Green
kubectl -n businesslens get pods

Write-Host "Deployment completed successfully!" -ForegroundColor Green