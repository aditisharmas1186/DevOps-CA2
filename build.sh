#!/bin/bash

# Build Script for ESKAPE Analysis Application
# This script prepares the application for production deployment

echo "=========================================="
echo "ESKAPE Analysis App Production Build Tool"
echo "=========================================="
echo ""

# 1. Create necessary directories
echo "🔨 Creating build directories..."
mkdir -p client/dist
mkdir -p server/dist

# 2. Install dependencies
echo "📦 Checking for dependencies..."
npm install

# 3. Ensure crypto polyfill is in place
echo "🔒 Setting up crypto polyfill..."
mkdir -p client/src/lib
if [ ! -f client/src/lib/crypto-polyfill.js ]; then
  cat > client/src/lib/crypto-polyfill.js << EOL
// This is a polyfill for crypto.getRandomValues for environments that don't support it
if (typeof window !== 'undefined') {
  if (typeof window.crypto === 'undefined') {
    window.crypto = {};
  }
  
  if (!window.crypto.getRandomValues) {
    window.crypto.getRandomValues = function(array) {
      const bytes = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
      return array;
    };
  }
}
EOL
fi

# Ensure the polyfill is imported in main.tsx
if ! grep -q "crypto-polyfill.js" client/src/main.tsx; then
  temp_file=$(mktemp)
  echo '// Import polyfill for crypto.getRandomValues first' > "$temp_file"
  echo 'import "./lib/crypto-polyfill.js";' >> "$temp_file"
  echo '' >> "$temp_file"
  cat client/src/main.tsx >> "$temp_file"
  mv "$temp_file" client/src/main.tsx
  echo "Added crypto polyfill import to main.tsx"
fi

# 4. Build client
echo "🏗️ Building client frontend..."
export NODE_ENV=production
npx vite build

# 5. Build server for production
echo "🏗️ Building server backend..."
# First try with our specialized build script
node build-server.js

# If that fails, try the direct esbuild approach
if [ ! -f server/dist/index.js ]; then
  echo "Falling back to direct esbuild compilation..."
  npx esbuild server/index.prod.ts --platform=node --packages=external --bundle --format=esm --outdir=server/dist
  
  # 6. Create production server entry point
  echo "🔄 Creating production server entrypoint..."
  if [ -f server/dist/index.prod.js ]; then
    cp server/dist/index.prod.js server/dist/index.js
  fi
fi

# 7. Copy environment file
echo "🌐 Setting up environment..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env file from example template"
fi

# 8. Create startup and health check scripts
echo "📜 Creating startup scripts..."
cat > start.sh << EOL
#!/bin/bash
# Production startup script for ESKAPE Analysis App
export NODE_ENV=production
node server/dist/index.js
EOL
chmod +x start.sh

cat > healthcheck.sh << EOL
#!/bin/bash
# Health check script for monitoring
curl -f http://localhost:\${PORT:-5000}/api/health || exit 1
EOL
chmod +x healthcheck.sh

echo ""
echo "✅ Build process complete!"
echo ""
echo "📋 Build Summary:"
echo "  - Frontend: client/dist/"
echo "  - Backend: server/dist/index.js"
echo "  - Start command: ./start.sh"
echo ""
echo "To start the application in production mode, run:"
echo "  ./start.sh"
echo ""

