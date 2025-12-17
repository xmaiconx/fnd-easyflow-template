#!/bin/bash

# =============================================================================
# test-services-check.sh - Verify required services for API testing
# =============================================================================
# Usage: bash .claude/scripts/test-services-check.sh
#
# Checks:
#   - PostgreSQL (port 5432)
#   - Redis (port 6379)
#   - API (port 3001)
#   - Workers (optional, checks Redis queues)
#
# Returns structured output for Claude to parse
# =============================================================================

set -e

# Colors for human-readable output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Default ports (can be overridden via env vars)
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
REDIS_PORT="${REDIS_PORT:-6379}"
API_PORT="${API_PORT:-3001}"

# =============================================================================
# Helper Functions
# =============================================================================

check_port() {
    local port=$1
    local name=$2

    # Try multiple methods for cross-platform compatibility
    if command -v nc &> /dev/null; then
        nc -z localhost "$port" 2>/dev/null
    elif command -v curl &> /dev/null; then
        curl -s --connect-timeout 2 "http://localhost:$port" > /dev/null 2>&1
    else
        # Fallback: try to connect via bash
        (echo > /dev/tcp/localhost/"$port") 2>/dev/null
    fi
}

check_docker_container() {
    local container_name=$1

    if command -v docker &> /dev/null; then
        docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^${container_name}$"
    else
        return 1
    fi
}

check_api_health() {
    local url="http://localhost:${API_PORT}/api/v1/health"

    if command -v curl &> /dev/null; then
        response=$(curl -s --connect-timeout 5 "$url" 2>/dev/null || echo "")
        if [ -n "$response" ]; then
            return 0
        fi
    fi

    # Fallback: just check if port is open
    check_port "$API_PORT" "API"
}

check_redis_ping() {
    if command -v redis-cli &> /dev/null; then
        result=$(redis-cli -p "$REDIS_PORT" ping 2>/dev/null || echo "")
        [ "$result" = "PONG" ]
    else
        check_port "$REDIS_PORT" "Redis"
    fi
}

check_postgres_ready() {
    if command -v pg_isready &> /dev/null; then
        pg_isready -h localhost -p "$POSTGRES_PORT" > /dev/null 2>&1
    else
        check_port "$POSTGRES_PORT" "PostgreSQL"
    fi
}

# =============================================================================
# Main Checks
# =============================================================================

echo "========================================"
echo "SERVICES_CHECK"
echo "========================================"
echo "Timestamp: $(date -Iseconds 2>/dev/null || date)"
echo ""

# Track overall status
ALL_REQUIRED_UP=true
SERVICES_STATUS=()

# -----------------------------------------------------------------------------
# PostgreSQL
# -----------------------------------------------------------------------------
echo "--- POSTGRESQL ---"

if check_postgres_ready; then
    echo "STATUS: UP"
    echo "PORT: $POSTGRES_PORT"
    SERVICES_STATUS+=("POSTGRES:UP")

    # Check if running in Docker
    if check_docker_container "fnd-postgres"; then
        echo "SOURCE: Docker (fnd-postgres)"
    else
        echo "SOURCE: Local/Other"
    fi
else
    echo "STATUS: DOWN"
    echo "PORT: $POSTGRES_PORT"
    SERVICES_STATUS+=("POSTGRES:DOWN")
    ALL_REQUIRED_UP=false
fi
echo ""

# -----------------------------------------------------------------------------
# Redis
# -----------------------------------------------------------------------------
echo "--- REDIS ---"

if check_redis_ping; then
    echo "STATUS: UP"
    echo "PORT: $REDIS_PORT"
    SERVICES_STATUS+=("REDIS:UP")

    if check_docker_container "fnd-redis"; then
        echo "SOURCE: Docker (fnd-redis)"
    else
        echo "SOURCE: Local/Other"
    fi
else
    echo "STATUS: DOWN"
    echo "PORT: $REDIS_PORT"
    SERVICES_STATUS+=("REDIS:DOWN")
    ALL_REQUIRED_UP=false
fi
echo ""

# -----------------------------------------------------------------------------
# API
# -----------------------------------------------------------------------------
echo "--- API ---"

if check_api_health; then
    echo "STATUS: UP"
    echo "PORT: $API_PORT"
    SERVICES_STATUS+=("API:UP")

    # Try to get version/info
    if command -v curl &> /dev/null; then
        health_response=$(curl -s "http://localhost:${API_PORT}/api/v1/health" 2>/dev/null || echo "")
        if [ -n "$health_response" ]; then
            echo "HEALTH: $health_response"
        fi
    fi
else
    echo "STATUS: DOWN"
    echo "PORT: $API_PORT"
    SERVICES_STATUS+=("API:DOWN")
    ALL_REQUIRED_UP=false
fi
echo ""

# -----------------------------------------------------------------------------
# Workers (Optional)
# -----------------------------------------------------------------------------
echo "--- WORKERS ---"

# Workers are harder to detect directly
# We check if there are active queue consumers in Redis
WORKERS_DETECTED=false

if check_redis_ping && command -v redis-cli &> /dev/null; then
    # Check for BullMQ worker patterns
    worker_keys=$(redis-cli -p "$REDIS_PORT" KEYS "bull:*:id" 2>/dev/null | wc -l | tr -d ' ')

    if [ "$worker_keys" -gt 0 ]; then
        echo "STATUS: LIKELY_UP"
        echo "QUEUES_DETECTED: $worker_keys"
        SERVICES_STATUS+=("WORKERS:UP")
        WORKERS_DETECTED=true
    else
        echo "STATUS: UNKNOWN"
        echo "NOTE: No active queues detected (may be idle)"
        SERVICES_STATUS+=("WORKERS:UNKNOWN")
    fi
else
    echo "STATUS: UNKNOWN"
    echo "NOTE: Cannot check without redis-cli"
    SERVICES_STATUS+=("WORKERS:UNKNOWN")
fi
echo ""

# -----------------------------------------------------------------------------
# Docker Compose Status
# -----------------------------------------------------------------------------
echo "--- DOCKER ---"

if command -v docker &> /dev/null; then
    if [ -f "infra/docker-compose.yml" ]; then
        echo "COMPOSE_FILE: infra/docker-compose.yml"

        # List running containers from our compose
        running=$(docker ps --format '{{.Names}}' 2>/dev/null | grep "^fnd-" | tr '\n' ' ')
        if [ -n "$running" ]; then
            echo "RUNNING_CONTAINERS: $running"
        else
            echo "RUNNING_CONTAINERS: (none)"
        fi
    else
        echo "COMPOSE_FILE: Not found"
    fi
else
    echo "DOCKER: Not installed"
fi
echo ""

# =============================================================================
# Summary
# =============================================================================

echo "========================================"
echo "SUMMARY"
echo "========================================"

echo "SERVICES: ${SERVICES_STATUS[*]}"

if [ "$ALL_REQUIRED_UP" = true ]; then
    echo "READY_FOR_TESTS: YES"
    echo ""
    echo "All required services are running."
    echo "You can proceed with API tests."
else
    echo "READY_FOR_TESTS: NO"
    echo ""
    echo "MISSING_SERVICES:"

    for status in "${SERVICES_STATUS[@]}"; do
        if [[ "$status" == *":DOWN" ]]; then
            service_name=$(echo "$status" | cut -d: -f1)
            echo "  - $service_name"
        fi
    done

    echo ""
    echo "SUGGESTED_ACTIONS:"

    # Check what's missing and suggest
    if [[ " ${SERVICES_STATUS[*]} " =~ "POSTGRES:DOWN" ]] || [[ " ${SERVICES_STATUS[*]} " =~ "REDIS:DOWN" ]]; then
        echo "  1. Start infrastructure:"
        echo "     docker-compose -f infra/docker-compose.yml up -d"
    fi

    if [[ " ${SERVICES_STATUS[*]} " =~ "API:DOWN" ]]; then
        echo "  2. Start API (in separate terminal):"
        echo "     npm run dev:api"
    fi

    if [[ " ${SERVICES_STATUS[*]} " =~ "WORKERS:DOWN" ]] || [[ " ${SERVICES_STATUS[*]} " =~ "WORKERS:UNKNOWN" ]]; then
        echo "  3. Start Workers (if needed, in separate terminal):"
        echo "     npm run dev:workers"
    fi
fi

echo ""
echo "========================================"
echo "END_SERVICES_CHECK"
echo "========================================"

# Exit with appropriate code
if [ "$ALL_REQUIRED_UP" = true ]; then
    exit 0
else
    exit 1
fi
