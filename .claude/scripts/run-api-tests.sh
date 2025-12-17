#!/bin/bash

# =============================================================================
# run-api-tests.sh - Execute httpyac API tests for a feature
# =============================================================================
# Usage: bash .claude/scripts/run-api-tests.sh [FEATURE_ID] [OPTIONS]
#
# Arguments:
#   FEATURE_ID  - Feature identifier (e.g., F0001-user-auth)
#                 If not provided, will auto-detect from current branch
#
# Options:
#   --verbose   - Show detailed request/response
#   --file FILE - Run only specific test file
#   --bail      - Stop on first failure
#   --report    - Generate markdown report (default: yes)
#   --no-report - Skip report generation
#   --env ENV   - Environment to use (default: local)
#
# Returns:
#   Exit code 0 if all tests pass, 1+ if any fail
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# =============================================================================
# Parse Arguments
# =============================================================================

FEATURE_ID=""
VERBOSE=false
SINGLE_FILE=""
BAIL=false
GENERATE_REPORT=true
ENVIRONMENT="local"

while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --file)
            SINGLE_FILE="$2"
            shift 2
            ;;
        --bail)
            BAIL=true
            shift
            ;;
        --no-report)
            GENERATE_REPORT=false
            shift
            ;;
        --report)
            GENERATE_REPORT=true
            shift
            ;;
        --env|-e)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -*)
            echo "Unknown option: $1"
            exit 1
            ;;
        *)
            FEATURE_ID="$1"
            shift
            ;;
    esac
done

# =============================================================================
# Auto-detect Feature ID if not provided
# =============================================================================

if [ -z "$FEATURE_ID" ]; then
    if [ -f ".claude/scripts/identify-current-feature.sh" ]; then
        FEATURE_ID=$(bash .claude/scripts/identify-current-feature.sh 2>/dev/null || echo "")
    fi

    if [ -z "$FEATURE_ID" ]; then
        echo "ERROR: Could not detect feature ID"
        echo "Usage: bash .claude/scripts/run-api-tests.sh [FEATURE_ID]"
        exit 1
    fi
fi

# =============================================================================
# Setup Paths
# =============================================================================

TESTS_DIR="docs/features/${FEATURE_ID}/tests/api"
ENV_FILE="${TESTS_DIR}/http-client.env.json"
REPORT_FILE="docs/features/${FEATURE_ID}/tests/test-report.md"

# =============================================================================
# Validation
# =============================================================================

echo "========================================"
echo "HTTPYAC API TEST RUNNER"
echo "========================================"
echo ""
echo "Feature: ${FEATURE_ID}"
echo "Tests Dir: ${TESTS_DIR}"
echo "Environment: ${ENVIRONMENT}"
echo ""

# Check httpyac installation
if ! npm ls httpyac > /dev/null 2>&1; then
    echo "httpyac not found. Installing..."
    npm install httpyac --save-dev
    echo ""
fi

HTTPYAC_VERSION=$(npx httpyac --version 2>/dev/null || echo "unknown")
echo "httpyac Version: ${HTTPYAC_VERSION}"
echo ""

# Check test directory exists
if [ ! -d "$TESTS_DIR" ]; then
    echo "ERROR: Test directory not found: ${TESTS_DIR}"
    echo ""
    echo "Generate tests first using the api-testing skill."
    exit 1
fi

# Check for test files
HTTP_FILES=$(find "$TESTS_DIR" -name "*.http" -type f 2>/dev/null | sort)

if [ -z "$HTTP_FILES" ]; then
    echo "ERROR: No .http test files found in ${TESTS_DIR}"
    exit 1
fi

# =============================================================================
# Environment Setup
# =============================================================================

ENV_ARGS=""

if [ -f "$ENV_FILE" ]; then
    echo "Using environment file: ${ENV_FILE}"
    echo "Selected environment: ${ENVIRONMENT}"
else
    echo "WARNING: No environment file found (http-client.env.json)"
    echo "Using default environment variables"
fi

echo ""

# =============================================================================
# Build httpyac Command Options
# =============================================================================

HTTPYAC_OPTS="--all -e ${ENVIRONMENT}"

if [ "$VERBOSE" = true ]; then
    HTTPYAC_OPTS="$HTTPYAC_OPTS -v"
fi

if [ "$BAIL" = true ]; then
    HTTPYAC_OPTS="$HTTPYAC_OPTS --bail"
fi

# =============================================================================
# Execute Tests
# =============================================================================

echo "========================================"
echo "EXECUTING TESTS"
echo "========================================"
echo ""

TOTAL_FILES=0
PASSED_FILES=0
FAILED_FILES=0
FAILED_LIST=()
START_TIME=$(date +%s)

# Determine which files to run
if [ -n "$SINGLE_FILE" ]; then
    if [ -f "${TESTS_DIR}/${SINGLE_FILE}" ]; then
        HTTP_FILES="${TESTS_DIR}/${SINGLE_FILE}"
    else
        echo "ERROR: Test file not found: ${SINGLE_FILE}"
        exit 1
    fi
fi

# Count files
for http_file in $HTTP_FILES; do
    TOTAL_FILES=$((TOTAL_FILES + 1))
done

echo "Running $TOTAL_FILES test file(s)..."
echo ""

# Execute all tests together (httpyac handles ordering)
echo "--- Executing: All test files ---"

if npx httpyac send "${TESTS_DIR}/*.http" $HTTPYAC_OPTS; then
    echo -e "${GREEN}ALL TESTS PASSED${NC}"
    PASSED_FILES=$TOTAL_FILES
else
    echo -e "${RED}SOME TESTS FAILED${NC}"
    # httpyac doesn't easily tell us which files failed, so we mark as partial
    FAILED_FILES=1
    FAILED_LIST+=("See output above for details")
fi

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# =============================================================================
# Results Summary
# =============================================================================

echo ""
echo "========================================"
echo "TEST RESULTS"
echo "========================================"
echo ""
echo "Total Files: ${TOTAL_FILES}"
echo "Duration: ${DURATION}s"

if [ "$FAILED_FILES" -eq 0 ]; then
    echo -e "Status: ${GREEN}PASSED${NC}"
else
    echo -e "Status: ${RED}FAILED${NC}"
fi

echo ""

# =============================================================================
# Generate Report
# =============================================================================

if [ "$GENERATE_REPORT" = true ]; then
    echo "Generating report: ${REPORT_FILE}"

    # Determine result status
    if [ "$FAILED_FILES" -eq 0 ]; then
        RESULT_STATUS="PASSED"
        RESULT_EMOJI="✅"
    else
        RESULT_STATUS="FAILED"
        RESULT_EMOJI="❌"
    fi

    # Create report
    cat > "$REPORT_FILE" << EOF
# Test Report - ${FEATURE_ID}

**Executed:** $(date -Iseconds 2>/dev/null || date)
**Duration:** ${DURATION}s
**Environment:** ${ENVIRONMENT}
**Result:** ${RESULT_EMOJI} ${RESULT_STATUS}

## Summary

| Metric | Value |
|--------|-------|
| Total Files | ${TOTAL_FILES} |
| Status | ${RESULT_STATUS} |

EOF

    # Add failed tests section if any
    if [ ${#FAILED_LIST[@]} -gt 0 ]; then
        cat >> "$REPORT_FILE" << EOF
## Notes

Some tests failed. Check the console output for details.

EOF
    fi

    # Add test files list
    cat >> "$REPORT_FILE" << EOF
## Test Files

EOF

    for http_file in $HTTP_FILES; do
        filename=$(basename "$http_file")
        echo "- \`${filename}\`" >> "$REPORT_FILE"
    done

    cat >> "$REPORT_FILE" << EOF

---

## Re-run Tests

\`\`\`bash
# All tests
bash .claude/scripts/run-api-tests.sh ${FEATURE_ID}

# Or via npm
npx httpyac send "docs/features/${FEATURE_ID}/tests/api/*.http" --all -e local
\`\`\`

## Run Single Test

\`\`\`bash
bash .claude/scripts/run-api-tests.sh ${FEATURE_ID} --file 01-crud.http
\`\`\`

## Verbose Mode

\`\`\`bash
bash .claude/scripts/run-api-tests.sh ${FEATURE_ID} --verbose
\`\`\`
EOF

    echo "Report generated successfully"
fi

echo ""
echo "========================================"
echo "END_API_TESTS"
echo "========================================"

# Exit with appropriate code
if [ "$FAILED_FILES" -eq 0 ]; then
    exit 0
else
    exit 1
fi
