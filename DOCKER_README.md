# Docker Setup for Neural Synth Modeler Frontend

This guide walks you through containerizing your React frontend application using Docker.

## Files Created

- `Dockerfile` - Production multi-stage build
- `Dockerfile.dev` - Development build with hot reload
- `nginx.conf` - Nginx configuration for serving the React app
- `.dockerignore` - Excludes unnecessary files from build context
- `docker-compose.yml` - Orchestration for easy deployment

## Quick Start

### Production Build

1. **Build the Docker image:**
   ```bash
   docker build -t neural-synth-frontend .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3001:80 neural-synth-frontend
   ```

3. **Access the application:**
   Open your browser and go to `http://localhost:3001`

### Using Docker Compose

1. **Start the production service:**
   ```bash
   docker-compose up -d
   ```

2. **Start the development service (with hot reload):**
   ```bash
   docker-compose --profile dev up -d frontend-dev
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f frontend
   ```

4. **Stop services:**
   ```bash
   docker-compose down
   ```

## Development Workflow

### Option 1: Docker Compose (Recommended)

```bash
# Start development environment
docker-compose --profile dev up -d frontend-dev

# View logs
docker-compose logs -f frontend-dev

# Stop development environment
docker-compose --profile dev down
```

### Option 2: Direct Docker Commands

```bash
# Build development image
docker build -f Dockerfile.dev -t neural-synth-frontend:dev .

# Run with volume mounting for hot reload
docker run -p 3001:3001 -v $(pwd):/app -v /app/node_modules neural-synth-frontend:dev
```

## Production Deployment

### Single Container Deployment

```bash
# Build production image
docker build -t neural-synth-frontend:latest .

# Run with restart policy
docker run -d -p 3001:80 --restart unless-stopped --name neural-synth-frontend neural-synth-frontend:latest
```

### Multi-Container Deployment

If you want to run the full stack (frontend + backend + database):

```bash
# Create a full-stack docker-compose file
# (You'll need to add your backend and database services)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Configuration

### Environment Variables

The frontend currently connects to `http://localhost:8080` for the backend API. To change this:

1. **For development:** Modify `src/services/api.ts`
2. **For production:** Use environment variables or build-time configuration

### Nginx Configuration

The `nginx.conf` file includes:
- React Router support (SPA routing)
- Gzip compression
- Security headers
- Static asset caching
- Health check endpoint

### API Proxy (Optional)

If you want to proxy API calls through nginx instead of direct frontend-to-backend communication:

1. Uncomment the API proxy section in `nginx.conf`
2. Update the `proxy_pass` URL to point to your backend service
3. Rebuild the Docker image

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using the port
   lsof -i :3000
   
   # Use a different port
   docker run -p 3001:80 neural-synth-frontend
   ```

2. **Build fails:**
   ```bash
   # Clear Docker cache
   docker system prune -a
   
   # Rebuild without cache
   docker build --no-cache -t neural-synth-frontend .
   ```

3. **Hot reload not working:**
   ```bash
   # Ensure you're using the dev profile
   docker-compose --profile dev up -d frontend-dev
   
   # Check volume mounts
   docker-compose --profile dev exec frontend-dev ls -la /app
   ```

### Health Checks

The container includes a health check endpoint at `/health`:

```bash
# Test health check
curl http://localhost:3000/health

# Check container health
docker ps
```

### Logs

```bash
# View container logs
docker logs neural-synth-frontend

# Follow logs in real-time
docker logs -f neural-synth-frontend

# View nginx logs
docker exec neural-synth-frontend tail -f /var/log/nginx/access.log
```

## Performance Optimization

### Build Optimization

The multi-stage Dockerfile:
- Uses `npm ci` for faster, reproducible builds
- Excludes dev dependencies in production
- Uses nginx for serving static files
- Implements gzip compression

### Runtime Optimization

- Nginx serves static assets with proper caching headers
- Gzip compression reduces bandwidth usage
- Security headers protect against common vulnerabilities

## Security Considerations

The nginx configuration includes:
- X-Frame-Options: Prevents clickjacking
- X-XSS-Protection: Enables XSS filtering
- X-Content-Type-Options: Prevents MIME type sniffing
- Content-Security-Policy: Controls resource loading
