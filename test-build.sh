#!/bin/bash

# Test Build Script for ESKAPE Analysis Application
# This script tests the build process locally

echo "=========================================="
echo "ESKAPE Analysis App Build Test"
echo "=========================================="
echo ""

# Create a temporary directory for testing
TEMP_DIR=$(mktemp -d)
echo "🔨 Created temporary test directory: $TEMP_DIR"

# Function to clean up on exit
cleanup() {
  echo "🧹 Cleaning up temporary files..."
  rm -rf "$TEMP_DIR"
  echo "Done."
}

# Register cleanup function to run on script exit
trap cleanup EXIT

# Copy current code to temp directory (excluding node_modules)
echo "📋 Copying current code for testing..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'client/dist' --exclude 'server/dist' ./ "$TEMP_DIR/"

# Enter the temp directory
cd "$TEMP_DIR" || { echo "Failed to enter temp directory"; exit 1; }

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run the build script
echo "🏗️ Testing build process..."
chmod +x build.sh
./build.sh

# Check if client build succeeded
if [ ! -d "client/dist" ] || [ ! -f "client/dist/index.html" ]; then
  echo "❌ Client build failed or index.html not found"
  exit 1
else
  echo "✅ Client build succeeded"
  ls -la client/dist
fi

# Check if server build succeeded
if [ ! -d "server/dist" ] || [ ! -f "server/dist/index.js" ]; then
  echo "❌ Server build failed or index.js not found"
  exit 1
else
  echo "✅ Server build succeeded"
  ls -la server/dist
fi

echo ""
echo "🎉 Build test completed successfully!"
echo "You are ready to build for production."
echo ""