#!/bin/bash

set -e

IMAGE_NAME=${1:-"ghcr.io/yourusername/devops"}
TAG=${2:-"latest"}

FULL_IMAGE="$IMAGE_NAME:$TAG"

echo "Building Docker image: $FULL_IMAGE"
docker build -t $FULL_IMAGE .

echo "Pushing to registry..."
docker push $FULL_IMAGE

echo "Done: $FULL_IMAGE"
