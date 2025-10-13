# Builder stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies (including bash)
RUN apk add --no-cache python3 make g++ curl bash

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy and prepare build script
COPY build.sh ./
RUN chmod +x build.sh

# Copy all source files
COPY . .

# Run the build script (which generates start.sh & healthcheck.sh)
RUN /bin/bash build.sh

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --production

# Copy built artifacts from builder
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/dist ./server/dist

# Copy generated startup and healthcheck scripts
COPY --from=builder /app/start.sh ./
COPY --from=builder /app/healthcheck.sh ./
RUN chmod +x start.sh healthcheck.sh

# Install curl for health checks
RUN apk add --no-cache curl

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose application port
EXPOSE 5000

# Define health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD /app/healthcheck.sh

# Launch application
CMD ["/app/start.sh"]
