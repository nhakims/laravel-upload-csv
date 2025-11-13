# Docker Setup for Laravel Upload Processing Dashboard

This project includes Docker configuration for easy deployment and development.

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Git

## Quick Start

1. **Clone the repository** (if not already done)
   ```bash
   cd /Users/hakim/Projects/process-upload
   ```

2. **Copy environment file**
   ```bash
   cp .env.example .env
   ```

3. **Update .env for Docker**
   ```env
   DB_CONNECTION=sqlite
   REDIS_HOST=redis
   REDIS_PORT=6379
   QUEUE_CONNECTION=redis
   BROADCAST_CONNECTION=reverb
   ```

4. **Build and start containers**
   ```bash
   docker-compose up -d --build
   ```

5. **Run initial setup**
   ```bash
   docker-compose exec app php artisan key:generate
   docker-compose exec app php artisan migrate --force
   docker-compose exec app php artisan db:seed --class=StatusSeeder
   ```

6. **Access the application**
   - Application: http://localhost:8000
   - WebSocket (Reverb): ws://localhost:8080

## Services

The Docker setup includes the following services:

- **app**: PHP-FPM 8.2 with Laravel queue worker and Reverb WebSocket server
- **nginx**: Web server (ports 8000 for HTTP, 8080 for WebSocket)
- **redis**: Redis 7 for queue and cache

## Docker Commands

### Start containers
```bash
docker-compose up -d
```

### Stop containers
```bash
docker-compose down
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f nginx
```

### Access container shell
```bash
docker-compose exec app bash
```

### Run artisan commands
```bash
docker-compose exec app php artisan migrate
docker-compose exec app php artisan tinker
```

### Clear all data
```bash
docker-compose exec app php artisan tinker --execute="DB::table('csv_data')->truncate(); DB::table('uploads')->truncate();"
```

### Rebuild containers
```bash
docker-compose down
docker-compose up -d --build
```

## File Permissions

If you encounter permission issues:

```bash
docker-compose exec app chown -R www-data:www-data /var/www/html/storage
docker-compose exec app chmod -R 755 /var/www/html/storage
```

## Troubleshooting

### Queue not processing
```bash
docker-compose exec app php artisan queue:restart
```

### WebSocket not connecting
- Ensure port 8080 is not in use
- Check Reverb logs: `docker-compose logs -f app | grep reverb`

### Redis connection issues
```bash
docker-compose exec app redis-cli -h redis ping
```

## Production Deployment

For production, consider:

1. Using a proper database (MySQL/PostgreSQL) instead of SQLite
2. Setting up SSL/TLS certificates
3. Configuring proper environment variables
4. Using Docker secrets for sensitive data
5. Setting up proper logging and monitoring

## Stopping and Cleaning Up

```bash
# Stop containers
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Remove all (containers, networks, volumes)
docker-compose down -v --remove-orphans
```
