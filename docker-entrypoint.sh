#!/bin/sh
set -e

echo "🚀 TinyCE Backend - Starting initialization..."

# ========================================
# Environment Validation
# ========================================
required_vars="DATABASE_URL REDIS_HOST REDIS_PORT JWT_SECRET"

for var in $required_vars; do
    eval value=\$$var
    if [ -z "$value" ]; then
        echo "❌ ERROR: Required environment variable $var is not set"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# ========================================
# Database Connection Check
# ========================================
echo "🔍 Checking database connection..."

max_attempts=30
attempt=0

until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' 2>/dev/null; do
    attempt=$((attempt + 1))
    if [ $attempt -ge $max_attempts ]; then
        echo "❌ ERROR: Database connection failed after $max_attempts attempts"
        exit 1
    fi
    echo "⏳ Waiting for database... (attempt $attempt/$max_attempts)"
    sleep 2
done

echo "✅ Database connection established"

# ========================================
# Redis Connection Check
# ========================================
echo "🔍 Checking Redis connection..."

max_attempts=30
attempt=0

until nc -z "$REDIS_HOST" "$REDIS_PORT" 2>/dev/null; do
    attempt=$((attempt + 1))
    if [ $attempt -ge $max_attempts ]; then
        echo "❌ ERROR: Redis connection failed after $max_attempts attempts"
        exit 1
    fi
    echo "⏳ Waiting for Redis... (attempt $attempt/$max_attempts)"
    sleep 2
done

echo "✅ Redis connection established"

# ========================================
# Database Migrations
# ========================================
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    echo "📦 Running database migrations..."

    cd /app/libs/app-database

    if npx knex migrate:latest; then
        echo "✅ Migrations completed successfully"
    else
        echo "❌ ERROR: Migrations failed"
        exit 1
    fi

    cd /app
else
    echo "⏭️  Skipping migrations (RUN_MIGRATIONS=false)"
fi

# ========================================
# Start Application
# ========================================
echo "🎯 Starting TinyCE Backend in $NODE_MODE mode..."

cd /app/apps/backend

# Graceful shutdown handler
trap 'echo "🛑 Received SIGTERM, shutting down gracefully..."; kill -TERM $PID; wait $PID' TERM INT

# Start the application
node dist/index.js &
PID=$!

echo "✅ TinyCE Backend started successfully (PID: $PID)"

# Wait for the process
wait $PID
