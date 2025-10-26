# Docker Deployment Guide

Complete guide for building and deploying CompX using Docker.

## Table of Contents
- [Overview](#overview)
- [Quick Start](#quick-start)
- [Build Stages](#build-stages)
- [Building Images](#building-images)
- [Running Containers](#running-containers)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

---

## Overview

CompX provides a multi-stage Dockerfile that supports:
- **Web Server**: Production-ready nginx deployment (recommended for Docker)
- **Development Server**: Hot-reload development environment
- **Electron Builder**: Desktop application packaging (Linux)

### Architecture

The Dockerfile uses **npm workspaces** and a monorepo structure to build all packages efficiently:

```
┌─────────────────────────────────────────────────────┐
│ Base Stage                                          │
│ - Node 18 Alpine                                    │
│ - Python + build tools (for native modules)        │
│ - All workspace dependencies installed             │
│ - Common package source code                        │
└─────────────────┬───────────────────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
    ┌────▼─────┐    ┌─────▼─────┐
    │ Loader   │    │ Web App   │
    │ Builder  │    │ Builder   │
    └────┬─────┘    └─────┬─────┘
         │                │
         └────────┬───────┘
                  │
         ┌────────▼─────────┐
         │  Web Server      │
         │  (nginx)         │
         └──────────────────┘
```

---

## Quick Start

### Build and Run Web Server

```bash
# Build the production web server image
docker build --target web_server -t compx:latest .

# Run the container
docker run -d -p 8080:80 --name compx compx:latest

# Access the application
open http://localhost:8080
```

### Cleanup

```bash
# Stop and remove container
docker stop compx && docker rm compx

# Remove image
docker rmi compx:latest
```

---

## Build Stages

The Dockerfile defines multiple build stages for different purposes:

### 1. Base Stage (`base`)

**Purpose**: Common foundation for all build stages

**Key Features**:
- Node.js 18 Alpine (minimal size)
- Python 3.12 + setuptools (required for native npm modules)
- Build tools: `make`, `g++`
- All workspace dependencies installed centrally
- Common package source code ready

**Dependencies Installed**:
- All packages from root `package.json`
- All workspace packages (`@compx/common`, `@compx/web_app`, etc.)
- Native modules built successfully (`@parcel/watcher`, etc.)

### 2. Loader Builder Stage (`loader_builder`)

**Purpose**: Build Electron splash screen/loader

**Inherits From**: `base`

**Output**:
- Compiled loader assets in `dist/`
- Used by Electron desktop application

**Build Command**: `npm run build --workspace=@compx/electron_loader`

### 3. Web Builder Base Stage (`web_builder_base`)

**Purpose**: Prepare web application build environment

**Inherits From**: `base`

**Contains**:
- Web app source code
- Webpack configuration
- Babel configuration
- TypeScript configuration

### 4. Web Dev Stage (`web_dev`)

**Purpose**: Development server with hot reload

**Inherits From**: `web_builder_base`

**Command**: `npm run start --workspace=@compx/web_app`

**Usage**:
```bash
docker build --target web_dev -t compx:dev .
docker run -p 3000:3000 -v $(pwd)/packages/web_app/src:/compx/packages/web_app/src compx:dev
```

### 5. Web Builder Stage (`web_builder`)

**Purpose**: Build production-optimized web application

**Inherits From**: `web_builder_base`

**Environment**: `BUILD_TYPE=web`

**Output**:
- Minified, bundled JavaScript in `dist/`
- Production-ready static assets
- Optimized for performance

**Build Command**: `npm run build --workspace=@compx/web_app`

### 6. Web Server Stage (`web_server`) ⭐ **Recommended**

**Purpose**: Production web server using nginx

**Inherits From**: nginx:latest

**Features**:
- Lightweight (~250MB total)
- High-performance static file serving
- Production-ready configuration
- No Node.js runtime overhead

**Configuration**:
- Serves from `/usr/share/nginx/html/`
- Default port: 80
- Copied from `web_builder` stage

### 7. Electron Builder Stage (`electon_builder_linux`)

**Purpose**: Package Electron desktop application for Linux

**Inherits From**: `base`

**Note**: This stage is for building desktop apps and typically not needed for Docker deployments. Use `--target web_server` to avoid building this stage.

---

## Building Images

### Web Server (Production)

**Recommended approach for deployment:**

```bash
docker build --target web_server -t compx:latest .
```

**With custom tags:**
```bash
docker build --target web_server -t compx:1.0.0 -t compx:latest .
```

**Build arguments:**
```bash
docker build \
  --target web_server \
  --build-arg BUILD_TYPE=web \
  -t compx:latest \
  .
```

### Development Server

```bash
docker build --target web_dev -t compx:dev .
```

### All Stages (Not Recommended)

```bash
# This will attempt to build ALL stages including Electron
# May fail on electron-builder stage
docker build -t compx:all .
```

### Build Performance

**Cache Optimization:**
```bash
# Use BuildKit for better caching
DOCKER_BUILDKIT=1 docker build --target web_server -t compx:latest .
```

**No Cache (Clean Build):**
```bash
docker build --no-cache --target web_server -t compx:latest .
```

**Expected Build Times:**
- First build: ~3-5 minutes (downloading dependencies)
- Subsequent builds: ~30-60 seconds (using cache)
- No-cache build: ~3-5 minutes

---

## Running Containers

### Basic Usage

```bash
# Run in foreground (see logs)
docker run -p 8080:80 compx:latest

# Run in background (detached)
docker run -d -p 8080:80 --name compx compx:latest

# Run with custom port
docker run -d -p 3000:80 --name compx compx:latest
```

### Container Management

```bash
# View logs
docker logs compx

# Follow logs (live)
docker logs -f compx

# Stop container
docker stop compx

# Start stopped container
docker start compx

# Restart container
docker restart compx

# Remove container
docker rm compx

# Remove container (force)
docker rm -f compx
```

### Health Checks

```bash
# Check if container is running
docker ps | grep compx

# Test HTTP endpoint
curl http://localhost:8080

# Get container stats
docker stats compx
```

---

## Configuration

### Environment Variables

The web application supports these environment variables:

```bash
docker run -d \
  -e NODE_ENV=production \
  -e BUILD_TYPE=web \
  -p 8080:80 \
  compx:latest
```

### Volume Mounts (Development)

Mount source code for live development:

```bash
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/packages/web_app/src:/compx/packages/web_app/src \
  -v $(pwd)/packages/common/src:/compx/packages/common/src \
  compx:dev
```

### Custom nginx Configuration

Create custom nginx config:

```bash
# Create custom config
cat > nginx.conf << 'EOF'
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
EOF

# Run with custom config
docker run -d \
  -p 8080:80 \
  -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf \
  compx:latest
```

### Resource Limits

```bash
docker run -d \
  -p 8080:80 \
  --memory="512m" \
  --cpus="1.0" \
  --name compx \
  compx:latest
```

---

## Troubleshooting

### Build Failures

#### Issue: "Cannot compute electron version"

**Cause**: Building all stages including electron_builder without targeting web_server

**Solution**:
```bash
docker build --target web_server -t compx:latest .
```

#### Issue: "Module not found: @compx/common"

**Cause**: Webpack alias not configured or cache issue

**Solution**:
```bash
docker build --no-cache --target web_server -t compx:latest .
```

#### Issue: "gyp ERR! find Python"

**Cause**: Missing Python dependencies in Alpine

**Solution**: Already fixed in Dockerfile with:
```dockerfile
RUN apk add --no-cache python3 py3-setuptools make g++
```

### Runtime Issues

#### Issue: Container exits immediately

**Check logs:**
```bash
docker logs compx
```

**Verify build:**
```bash
docker run -it compx:latest sh
```

#### Issue: Cannot access on localhost

**Check port mapping:**
```bash
docker ps
# Should show: 0.0.0.0:8080->80/tcp
```

**Test from container:**
```bash
docker exec compx curl http://localhost:80
```

#### Issue: 404 errors

**Check static files:**
```bash
docker exec compx ls -la /usr/share/nginx/html/
```

**Expected files:**
- `index.html`
- `bundle.js`
- Other static assets

### Performance Issues

#### Slow Build Times

**Use BuildKit:**
```bash
export DOCKER_BUILDKIT=1
docker build --target web_server -t compx:latest .
```

**Prune build cache:**
```bash
docker builder prune
```

#### Large Image Size

**Check image size:**
```bash
docker images compx
# Should be ~250MB for web_server
```

**Reduce size further:**
```bash
# Use multi-stage build with smaller base
# Already optimized in current Dockerfile
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `ENOENT: no such file` | Missing source files | Check .dockerignore |
| `npm ERR! workspace` | Workspace misconfiguration | Verify lerna.json |
| `webpack compiled with errors` | Build failure | Check build logs |
| `Port already in use` | Port conflict | Use different port or stop conflicting process |

---

## Advanced Usage

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  compx:
    build:
      context: .
      target: web_server
    ports:
      - "8080:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3
```

**Usage:**
```bash
docker-compose up -d
docker-compose logs -f
docker-compose down
```

### Kubernetes Deployment

Create `k8s-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: compx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: compx
  template:
    metadata:
      labels:
        app: compx
    spec:
      containers:
      - name: compx
        image: compx:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: compx-service
spec:
  selector:
    app: compx
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

### CI/CD Integration

**GitHub Actions Example:**

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build --target web_server -t compx:${{ github.sha }} .

      - name: Test image
        run: |
          docker run -d -p 8080:80 --name compx-test compx:${{ github.sha }}
          sleep 5
          curl -f http://localhost:8080 || exit 1
          docker stop compx-test

      - name: Push to registry
        run: |
          echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
          docker tag compx:${{ github.sha }} username/compx:latest
          docker push username/compx:latest
```

---

## Best Practices

### Security

1. **Use specific base image versions** (not `latest` in production)
2. **Scan for vulnerabilities**: `docker scan compx:latest`
3. **Run as non-root user** (nginx already handles this)
4. **Keep dependencies updated**: Rebuild regularly

### Production Deployment

1. **Use `web_server` target** (smallest, fastest)
2. **Set resource limits** to prevent resource exhaustion
3. **Enable health checks** for orchestration
4. **Use reverse proxy** (nginx already included)
5. **Enable HTTPS** with certificates

### Development Workflow

1. **Use `web_dev` target** for development
2. **Mount volumes** for live code updates
3. **Use BuildKit** for faster builds
4. **Clean caches** periodically

---

## Related Documentation

- [Quick Start Guide](QUICK_START.md) - Local development setup
- [Development Guide](DEVELOPMENT_GUIDE.md) - Detailed development workflows
- [Architecture](ARCHITECTURE.md) - System architecture overview
- [API Reference](API_REFERENCE.md) - API documentation

---

**Last Updated**: 2025-10-25
**Docker Version**: Tested with Docker 20.10+
**Maintainer**: Aidan Petti
