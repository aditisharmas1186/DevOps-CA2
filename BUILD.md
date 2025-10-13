# ESKAPE Analysis Application Deployment Guide

This document provides detailed instructions for building, deploying, and maintaining the ESKAPE Analysis Application in various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Production Build](#production-build)
4. [Deployment Options](#deployment-options)
   - [Using Docker](#using-docker)
   - [AWS EC2 Deployment](#aws-ec2-deployment)
   - [GitHub Actions CI/CD](#github-actions-cicd)
5. [Environment Variables](#environment-variables)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 20.x or later
- npm 10.x or later
- MongoDB (accessible via URI)
- Git (for version control)

For Docker deployment:
- Docker Engine
- Docker Compose

## Local Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd eskape-analysis
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the MongoDB connection string in `.env`:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Production Build

The build process creates optimized production builds for both client and server:

1. Run the build script:
   ```bash
   ./build.sh
   ```

2. The build process will:
   - Clean previous builds
   - Install dependencies if needed
   - Create production-optimized frontend files
   - Build the server
   - Create startup scripts

3. After building, you can start the application with:
   ```bash
   ./start.sh
   ```

4. To test the build process locally without affecting your development environment:
   ```bash
   ./test-build.sh
   ```

## Deployment Options

### Using Docker

We provide Docker and Docker Compose configuration for containerized deployment:

1. Build the Docker image:
   ```bash
   docker build -t eskape-analysis .
   ```

2. Run the container:
   ```bash
   docker run -p 5000:5000 -e MONGODB_URI=<your-mongodb-uri> eskape-analysis
   ```

3. Alternatively, use Docker Compose:
   ```bash
   MONGODB_URI=<your-mongodb-uri> docker-compose up -d
   ```

### AWS EC2 Deployment

For deployment to AWS EC2:

1. Launch an EC2 instance (Amazon Linux 2 recommended)
2. Install required software:
   ```bash
   sudo yum update -y
   sudo yum install -y nodejs npm git
   ```

3. Clone the repository and build:
   ```bash
   git clone <repository-url>
   cd eskape-analysis
   npm install
   ./build.sh
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit the .env file with your configuration
   ```

5. Set up PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server/dist/index.js --name eskape-analysis
   pm2 save
   pm2 startup
   ```

6. Configure Nginx as a reverse proxy (optional):
   ```bash
   sudo yum install -y nginx
   # Configure Nginx to proxy requests to the Node.js application (port 5000)

   ```

### GitHub Actions CI/CD

We include a GitHub Actions workflow for CI/CD in `.github/workflows/deploy.yml`. To use it:

1. Add the following secrets to your GitHub repository:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `EC2_HOST` (public IP or hostname)
   - `EC2_USERNAME` (usually 'ec2-user')
   - `EC2_SSH_KEY` (private key for SSH access)
   - `MONGODB_URI` (MongoDB connection string)

2. Push to the main branch to trigger the workflow. It will:
   - Build the application
   - Upload built artifacts
   - Deploy to your EC2 instance

## Environment Variables

Configure the application with these environment variables:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |

| `PORT` | Server port | `5000` | No |

## Troubleshooting

### Common Issues

1. **Build fails with "crypto.getRandomValues is not a function"**
   - The application includes a polyfill for this Node.js environment issue

2. **Cannot connect to MongoDB**
   - Verify your MongoDB URI is correct
   - Check network connectivity and firewall settings
   - Ensure IP address is whitelisted in MongoDB Atlas

3. **Application starts but model loading fails**
   - Check browser console for network errors
   - Ensure TensorFlow.js model files are properly accessible

### Health Monitoring

The application exposes a health check endpoint at `/api/health` that returns:
- HTTP 200 when the application is running correctly
- HTTP 503 when there are issues connecting to MongoDB

Use this endpoint with monitoring tools like AWS CloudWatch, Prometheus, or Uptime Robot.
