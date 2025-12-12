#!/bin/bash

# Script to identify current feature from branch name and show file status
# Usage: ./identify-current-feature.sh
# Returns: Feature info with branch name, file states, and feature directory contents

set -e

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

# Extract feature identifier from branch name
# Patterns: feature/F0001-name, fix/F0002-name, refactor/F0003-name, docs/F0004-name
FEATURE_ID=$(echo "$CURRENT_BRANCH" | grep -oP '(?<=/)F[0-9]{4}-[^/]+$' || echo "")

# Determine main branch (main or master)
MAIN_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main")

# Output header
echo "========================================"
echo "BRANCH INFO"
echo "========================================"
echo "Current Branch: $CURRENT_BRANCH"
echo "Main Branch: $MAIN_BRANCH"

if [ -n "$FEATURE_ID" ]; then
    echo "Feature ID: $FEATURE_ID"
else
    echo "Feature ID: (not detected - branch doesn't match pattern)"
fi

echo ""
echo "========================================"
echo "FILE STATUS"
echo "========================================"

# Function to count non-empty lines
count_lines() {
    local input="$1"
    if [ -z "$input" ]; then
        echo "0"
    else
        echo "$input" | wc -l | tr -d ' '
    fi
}

# Get modified files (unstaged)
MODIFIED_FILES=$(git diff --name-only 2>/dev/null | grep -v '^$' || true)
MODIFIED_COUNT=$(count_lines "$MODIFIED_FILES")

echo ""
echo "--- MODIFIED (unstaged): $MODIFIED_COUNT files ---"
if [ -n "$MODIFIED_FILES" ]; then
    echo "$MODIFIED_FILES" | sed 's/^/  /'
fi

# Get staged files
STAGED_FILES=$(git diff --cached --name-only 2>/dev/null | grep -v '^$' || true)
STAGED_COUNT=$(count_lines "$STAGED_FILES")

echo ""
echo "--- STAGED: $STAGED_COUNT files ---"
if [ -n "$STAGED_FILES" ]; then
    echo "$STAGED_FILES" | sed 's/^/  /'
fi

# Get committed files in this branch (compared to main)
if [ "$CURRENT_BRANCH" != "$MAIN_BRANCH" ] && git rev-parse --verify "$MAIN_BRANCH" >/dev/null 2>&1; then
    COMMITTED_FILES=$(git diff --name-only "$MAIN_BRANCH"..."$CURRENT_BRANCH" 2>/dev/null | grep -v '^$' || true)
    COMMITTED_COUNT=$(count_lines "$COMMITTED_FILES")
else
    COMMITTED_FILES=""
    COMMITTED_COUNT="0"
fi

echo ""
echo "--- COMMITTED (branch vs $MAIN_BRANCH): $COMMITTED_COUNT files ---"
if [ -n "$COMMITTED_FILES" ]; then
    echo "$COMMITTED_FILES" | sed 's/^/  /'
fi

# Calculate totals
TOTAL_CHANGED=$((MODIFIED_COUNT + STAGED_COUNT + COMMITTED_COUNT))
echo ""
echo "--- TOTAL: $TOTAL_CHANGED files affected ---"

# Feature directory contents
echo ""
echo "========================================"
echo "FEATURE DIRECTORY"
echo "========================================"

FEATURES_DIR="docs/features"
FEATURE_PATH="${FEATURES_DIR}/${FEATURE_ID}"

if [ -n "$FEATURE_ID" ] && [ -d "$FEATURE_PATH" ]; then
    echo "Path: $FEATURE_PATH"
    echo ""
    echo "Contents:"
    find "$FEATURE_PATH" -type f 2>/dev/null | sed "s|$FEATURE_PATH/||" | sed 's/^/  /' || echo "  (empty)"
else
    if [ -z "$FEATURE_ID" ]; then
        echo "Path: (feature not detected)"
    else
        echo "Path: $FEATURE_PATH"
        echo "Status: Directory does not exist"
    fi
fi

echo ""
echo "========================================"

# Exit with appropriate code
if [ -n "$FEATURE_ID" ] && [ -d "$FEATURE_PATH" ]; then
    exit 0
else
    exit 1
fi
