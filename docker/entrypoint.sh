#!/bin/sh

# Exit on error
set -e

# Check if .env exists, if not copy from .env.example
if [ ! -f /var/www/html/.env ]; then
    echo "Creating .env file from .env.example..."
    cp /var/www/html/.env.example /var/www/html/.env
fi

# Check if APP_KEY is empty and generate if needed
if ! grep -q "APP_KEY=base64:" /var/www/html/.env; then
    echo "Generating application key..."
    php artisan key:generate --force
fi

# Fix Redis host for Docker environment
if grep -q "REDIS_HOST=127.0.0.1" /var/www/html/.env; then
    echo "Updating Redis host for Docker environment..."
    sed -i 's/REDIS_HOST=127.0.0.1/REDIS_HOST=redis/g' /var/www/html/.env
fi

# Ensure queue connection is set to redis (required for Horizon)
if ! grep -q "QUEUE_CONNECTION=redis" /var/www/html/.env; then
    echo "Setting queue connection to redis..."
    sed -i 's/QUEUE_CONNECTION=.*/QUEUE_CONNECTION=redis/g' /var/www/html/.env
fi

# Check if Reverb configuration exists, if not add it
if ! grep -q "REVERB_APP_ID" /var/www/html/.env; then
    echo "Adding Reverb configuration to .env..."
    cat >> /var/www/html/.env << 'EOF'

REVERB_APP_ID=local-app-id
REVERB_APP_KEY=local-app-key
REVERB_APP_SECRET=local-app-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http

VITE_REVERB_APP_KEY=local-app-key
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
EOF
fi

# Create storage link if it doesn't exist
if [ ! -L /var/www/html/public/storage ]; then
    echo "Creating storage symlink..."
    php artisan storage:link
fi

# Create database directory if it doesn't exist
if [ ! -d /var/www/html/database ]; then
    echo "Creating database directory..."
    mkdir -p /var/www/html/database
fi

# Create empty SQLite database if it doesn't exist
if [ ! -f /var/www/html/database/database.sqlite ]; then
    echo "Creating empty SQLite database..."
    touch /var/www/html/database/database.sqlite
    chown www-data:www-data /var/www/html/database/database.sqlite
    chmod 664 /var/www/html/database/database.sqlite
fi

# Run database migrations
echo "Running database migrations..."
php artisan migrate --force

# Fix permissions
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Start supervisord
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
