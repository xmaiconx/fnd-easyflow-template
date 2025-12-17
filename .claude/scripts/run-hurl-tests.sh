#!/bin/bash

# =============================================================================
# run-hurl-tests.sh - Execute Hurl API tests for a feature
# =============================================================================
# Usage: bash .claude/scripts/run-hurl-tests.sh [FEATURE_ID] [OPTIONS]
#
# Arguments:
#   FEATURE_ID  - Feature identifier (e.g., F0001-user-auth)
#                 If not provided, will auto-detect from current branch
#
# Options:
#   --verbose   - Show detailed request/response
#   --file FILE - Run only specific test file
#   --report    - Generate markdown report (default: yes)
#   --no-report - Skip report generation
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
GENERATE_REPORT=true

while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose)
            VERBOSE=true
            shift
            ;;
        --file)
            SINGLE_FILE="$2"
            shift 2
            ;;
        --no-report)
            GENERATE_REPORT=false
            shift
            ;;
        --report)
            GENERATE_REPORT=true
            shift
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
        echo "Usage: bash .claude/scripts/run-hurl-tests.sh [FEATURE_ID]"
        exit 1
    fi
fi

# =============================================================================
# Setup Paths
# =============================================================================

TESTS_DIR="docs/features/${FEATURE_ID}/tests/api"
VARIABLES_FILE="${TESTS_DIR}/variables.env"
VARIABLES_LOCAL="${TESTS_DIR}/variables.local.env"
REPORT_FILE="docs/features/${FEATURE_ID}/tests/test-report.md"

# =============================================================================
# Validation
# =============================================================================

echo "========================================"
echo "HURL TEST RUNNER"
echo "========================================"
echo ""
echo "Feature: ${FEATURE_ID}"
echo "Tests Dir: ${TESTS_DIR}"
echo ""

# Check Hurl installation
if ! command -v hurl &> /dev/null; then
    echo "ERROR: Hurl is not installed"
    echo ""
    echo "Install via:"
    echo "  Windows: winget install Orange.Hurl"
    echo "  macOS: brew install hurl"
    echo "  Linux: snap install hurl"
    echo ""
    echo "More info: https://hurl.dev/docs/installation.html"
    exit 1
fi

HURL_VERSION=$(hurl --version | head -1)
echo "Hurl Version: ${HURL_VERSION}"
echo ""

# Check test directory exists
if [ ! -d "$TESTS_DIR" ]; then
    echo "ERROR: Test directory not found: ${TESTS_DIR}"
    echo ""
    echo "Generate tests first using the api-testing skill."
    exit 1
fi

# Check for test files
HURL_FILES=$(find "$TESTS_DIR" -name "*.hurl" -type f 2>/dev/null | sort)

if [ -z "$HURL_FILES" ]; then
    echo "ERROR: No .hurl test files found in ${TESTS_DIR}"
    exit 1
fi

# =============================================================================
# Variables Setup
# =============================================================================

VARS_ARGS=""

if [ -f "$VARIABLES_LOCAL" ]; then
    echo "Using variables: ${VARIABLES_LOCAL}"
    VARS_ARGS="--variables-file ${VARIABLES_LOCAL}"
elif [ -f "$VARIABLES_FILE" ]; then
    echo "Using variables: ${VARIABLES_FILE}"
    VARS_ARGS="--variables-file ${VARIABLES_FILE}"
else
    echo "WARNING: No variables file found"
fi

echo ""

# =============================================================================
# Build Hurl Command Options
# =============================================================================

HURL_OPTS="--test"

if [ "$VERBOSE" = true ]; then
    HURL_OPTS="$HURL_OPTS --verbose"
fi

# Add color if terminal supports it
if [ -t 1 ]; then
    HURL_OPTS="$HURL_OPTS --color"
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
        HURL_FILES="${TESTS_DIR}/${SINGLE_FILE}"
    else
        echo "ERROR: Test file not found: ${SINGLE_FILE}"
        exit 1
    fi
fi

# Run each test file
for hurl_file in $HURL_FILES; do
    filename=$(basename "$hurl_file")
    TOTAL_FILES=$((TOTAL_FILES + 1))

    echo "--- Running: ${filename} ---"

    # Execute Hurl
    if hurl $HURL_OPTS $VARS_ARGS "$hurl_file"; then
        echo -e "${GREEN}PASSED${NC}"
        PASSED_FILES=$((PASSED_FILES + 1))
    else
        echo -e "${RED}FAILED${NC}"
        FAILED_FILES=$((FAILED_FILES + 1))
        FAILED_LIST+=("$filename")
    fi

    echo ""
done

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# =============================================================================
# Results Summary
# =============================================================================

echo "========================================"
echo "TEST RESULTS"
echo "========================================"
echo ""
echo "Total Files: ${TOTAL_FILES}"
echo -e "Passed: ${GREEN}${PASSED_FILES}${NC}"
echo -e "Failed: ${RED}${FAILED_FILES}${NC}"
echo "Duration: ${DURATION}s"
echo ""

if [ ${#FAILED_LIST[@]} -gt 0 ]; then
    echo "Failed Tests:"
    for failed in "${FAILED_LIST[@]}"; do
        echo "  - ${failed}"
    done
    echo ""
fi

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
**Result:** ${RESULT_EMOJI} ${RESULT_STATUS}

## Summary

| Metric | Value |
|--------|-------|
| Total Files | ${TOTAL_FILES} |
| Passed | ${PASSED_FILES} |
| Failed | ${FAILED_FILES} |
| Success Rate | $(( PASSED_FILES * 100 / TOTAL_FILES ))% |

EOF

    # Add failed tests section if any
    if [ ${#FAILED_LIST[@]} -gt 0 ]; then
        cat >> "$REPORT_FILE" << EOF
## Failed Tests

EOF
        for failed in "${FAILED_LIST[@]}"; do
            echo "- \`${failed}\`" >> "$REPORT_FILE"
        done
        echo "" >> "$REPORT_FILE"
    fi

    # Add test files list
    cat >> "$REPORT_FILE" << EOF
## Test Files Executed

EOF

    for hurl_file in $HURL_FILES; do
        filename=$(basename "$hurl_file")
        if [[ " ${FAILED_LIST[*]} " =~ " ${filename} " ]]; then
            echo "- [ ] \`${filename}\` - FAILED" >> "$REPORT_FILE"
        else
            echo "- [x] \`${filename}\` - PASSED" >> "$REPORT_FILE"
        fi
    done

    cat >> "$REPORT_FILE" << EOF

---

## Re-run Tests

\`\`\`bash
bash .claude/scripts/run-hurl-tests.sh ${FEATURE_ID}
\`\`\`

## Run Single Test

\`\`\`bash
bash .claude/scripts/run-hurl-tests.sh ${FEATURE_ID} --file [filename].hurl
\`\`\`
EOF

    echo "Report generated successfully"
fi

echo ""
echo "========================================"
echo "END_HURL_TESTS"
echo "========================================"

# Exit with appropriate code
if [ "$FAILED_FILES" -eq 0 ]; then
    exit 0
else
    exit 1
fi
