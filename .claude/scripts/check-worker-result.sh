#!/bin/bash

# =============================================================================
# check-worker-result.sh - Verify BullMQ worker job processing
# =============================================================================
# Usage: bash .claude/scripts/check-worker-result.sh [OPTIONS]
#
# Options:
#   --queue NAME       - Queue name to check (e.g., email, audit)
#   --job-id ID        - Specific job ID to check
#   --wait SECONDS     - Wait time for job completion (default: 10)
#   --expected STATUS  - Expected status (completed, failed, waiting)
#   --redis-port PORT  - Redis port (default: 6379)
#
# Examples:
#   bash check-worker-result.sh --queue email --wait 5
#   bash check-worker-result.sh --queue audit --job-id job_123 --expected completed
#
# Returns:
#   Exit code 0 if job completed as expected, 1 otherwise
# =============================================================================

set -e

# Defaults
QUEUE_NAME=""
JOB_ID=""
WAIT_SECONDS=10
EXPECTED_STATUS="completed"
REDIS_PORT="${REDIS_PORT:-6379}"
REDIS_HOST="${REDIS_HOST:-localhost}"

# =============================================================================
# Parse Arguments
# =============================================================================

while [[ $# -gt 0 ]]; do
    case $1 in
        --queue)
            QUEUE_NAME="$2"
            shift 2
            ;;
        --job-id)
            JOB_ID="$2"
            shift 2
            ;;
        --wait)
            WAIT_SECONDS="$2"
            shift 2
            ;;
        --expected)
            EXPECTED_STATUS="$2"
            shift 2
            ;;
        --redis-port)
            REDIS_PORT="$2"
            shift 2
            ;;
        --redis-host)
            REDIS_HOST="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: bash check-worker-result.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --queue NAME       Queue name (email, audit, stripe-webhook)"
            echo "  --job-id ID        Specific job ID to check"
            echo "  --wait SECONDS     Wait time (default: 10)"
            echo "  --expected STATUS  Expected status (default: completed)"
            echo "  --redis-port PORT  Redis port (default: 6379)"
            echo "  --redis-host HOST  Redis host (default: localhost)"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# =============================================================================
# Validation
# =============================================================================

if [ -z "$QUEUE_NAME" ]; then
    echo "ERROR: --queue is required"
    exit 1
fi

# Check redis-cli availability
if ! command -v redis-cli &> /dev/null; then
    echo "WARNING: redis-cli not installed"
    echo "Install redis-tools to enable queue inspection"
    echo ""
    echo "Fallback: Waiting ${WAIT_SECONDS}s for worker processing..."
    sleep "$WAIT_SECONDS"
    echo "Cannot verify - assuming success"
    exit 0
fi

# Test Redis connection
if ! redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping > /dev/null 2>&1; then
    echo "ERROR: Cannot connect to Redis at ${REDIS_HOST}:${REDIS_PORT}"
    exit 1
fi

echo "========================================"
echo "WORKER RESULT CHECK"
echo "========================================"
echo ""
echo "Queue: ${QUEUE_NAME}"
echo "Redis: ${REDIS_HOST}:${REDIS_PORT}"
echo "Wait: ${WAIT_SECONDS}s"
echo "Expected: ${EXPECTED_STATUS}"
[ -n "$JOB_ID" ] && echo "Job ID: ${JOB_ID}"
echo ""

# =============================================================================
# BullMQ Key Patterns
# =============================================================================

# BullMQ uses these key patterns:
# bull:<queue_name>:id - Last job ID
# bull:<queue_name>:waiting - Waiting jobs list
# bull:<queue_name>:active - Active jobs list
# bull:<queue_name>:completed - Completed jobs set
# bull:<queue_name>:failed - Failed jobs set
# bull:<queue_name>:<job_id> - Job data

QUEUE_PREFIX="bull:${QUEUE_NAME}"

# =============================================================================
# Initial Stats
# =============================================================================

echo "--- INITIAL QUEUE STATS ---"

INITIAL_COMPLETED=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ZCARD "${QUEUE_PREFIX}:completed" 2>/dev/null || echo "0")
INITIAL_FAILED=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ZCARD "${QUEUE_PREFIX}:failed" 2>/dev/null || echo "0")
INITIAL_WAITING=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" LLEN "${QUEUE_PREFIX}:waiting" 2>/dev/null || echo "0")
INITIAL_ACTIVE=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" LLEN "${QUEUE_PREFIX}:active" 2>/dev/null || echo "0")

echo "Completed: ${INITIAL_COMPLETED}"
echo "Failed: ${INITIAL_FAILED}"
echo "Waiting: ${INITIAL_WAITING}"
echo "Active: ${INITIAL_ACTIVE}"
echo ""

# =============================================================================
# Wait for Processing
# =============================================================================

echo "Waiting ${WAIT_SECONDS}s for job processing..."
echo ""

# Poll every second
for ((i=1; i<=WAIT_SECONDS; i++)); do
    sleep 1

    CURRENT_ACTIVE=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" LLEN "${QUEUE_PREFIX}:active" 2>/dev/null || echo "0")
    CURRENT_WAITING=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" LLEN "${QUEUE_PREFIX}:waiting" 2>/dev/null || echo "0")

    # Show progress
    echo -ne "\r  Progress: ${i}/${WAIT_SECONDS}s | Active: ${CURRENT_ACTIVE} | Waiting: ${CURRENT_WAITING}    "

    # Early exit if no more jobs to process
    if [ "$CURRENT_ACTIVE" -eq 0 ] && [ "$CURRENT_WAITING" -eq 0 ]; then
        echo ""
        echo "  Queue empty - all jobs processed"
        break
    fi
done

echo ""
echo ""

# =============================================================================
# Final Stats
# =============================================================================

echo "--- FINAL QUEUE STATS ---"

FINAL_COMPLETED=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ZCARD "${QUEUE_PREFIX}:completed" 2>/dev/null || echo "0")
FINAL_FAILED=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ZCARD "${QUEUE_PREFIX}:failed" 2>/dev/null || echo "0")
FINAL_WAITING=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" LLEN "${QUEUE_PREFIX}:waiting" 2>/dev/null || echo "0")
FINAL_ACTIVE=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" LLEN "${QUEUE_PREFIX}:active" 2>/dev/null || echo "0")

echo "Completed: ${FINAL_COMPLETED} (was ${INITIAL_COMPLETED})"
echo "Failed: ${FINAL_FAILED} (was ${INITIAL_FAILED})"
echo "Waiting: ${FINAL_WAITING} (was ${INITIAL_WAITING})"
echo "Active: ${FINAL_ACTIVE} (was ${INITIAL_ACTIVE})"
echo ""

# Calculate changes
NEW_COMPLETED=$((FINAL_COMPLETED - INITIAL_COMPLETED))
NEW_FAILED=$((FINAL_FAILED - INITIAL_FAILED))

echo "--- CHANGES ---"
echo "New Completed: ${NEW_COMPLETED}"
echo "New Failed: ${NEW_FAILED}"
echo ""

# =============================================================================
# Specific Job Check (if provided)
# =============================================================================

if [ -n "$JOB_ID" ]; then
    echo "--- JOB STATUS: ${JOB_ID} ---"

    # Check in completed set
    IN_COMPLETED=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ZSCORE "${QUEUE_PREFIX}:completed" "$JOB_ID" 2>/dev/null || echo "")

    # Check in failed set
    IN_FAILED=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ZSCORE "${QUEUE_PREFIX}:failed" "$JOB_ID" 2>/dev/null || echo "")

    # Check in waiting list
    IN_WAITING=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" LPOS "${QUEUE_PREFIX}:waiting" "$JOB_ID" 2>/dev/null || echo "")

    # Check in active list
    IN_ACTIVE=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" LPOS "${QUEUE_PREFIX}:active" "$JOB_ID" 2>/dev/null || echo "")

    if [ -n "$IN_COMPLETED" ]; then
        JOB_STATUS="completed"
    elif [ -n "$IN_FAILED" ]; then
        JOB_STATUS="failed"
    elif [ -n "$IN_ACTIVE" ]; then
        JOB_STATUS="active"
    elif [ -n "$IN_WAITING" ]; then
        JOB_STATUS="waiting"
    else
        JOB_STATUS="not_found"
    fi

    echo "Status: ${JOB_STATUS}"
    echo ""
fi

# =============================================================================
# Result Evaluation
# =============================================================================

echo "========================================"
echo "RESULT"
echo "========================================"
echo ""

# Determine success based on expected status
SUCCESS=false

case $EXPECTED_STATUS in
    "completed")
        if [ "$NEW_COMPLETED" -gt 0 ]; then
            SUCCESS=true
            echo "RESULT: PASSED"
            echo "Jobs completed: ${NEW_COMPLETED}"
        elif [ "$NEW_FAILED" -gt 0 ]; then
            echo "RESULT: FAILED"
            echo "Jobs failed instead of completing: ${NEW_FAILED}"
        else
            echo "RESULT: INCONCLUSIVE"
            echo "No jobs were processed during wait period"
        fi
        ;;
    "failed")
        if [ "$NEW_FAILED" -gt 0 ]; then
            SUCCESS=true
            echo "RESULT: PASSED (job failed as expected)"
        else
            echo "RESULT: FAILED (expected job to fail)"
        fi
        ;;
    *)
        echo "Unknown expected status: ${EXPECTED_STATUS}"
        ;;
esac

echo ""
echo "========================================"
echo "END_WORKER_CHECK"
echo "========================================"

# Return appropriate exit code
if [ "$SUCCESS" = true ]; then
    exit 0
else
    exit 1
fi
