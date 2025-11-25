#!/bin/bash

# Script to identify current feature from branch name
# Usage: ./identify-current-feature.sh
# Returns: Feature directory name (e.g., F0001-user-auth) or empty if not on feature branch

set -e

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

# Extract feature identifier from branch name
# Patterns: feature/F0001-name, fix/F0002-name, refactor/F0003-name, docs/F0004-name
FEATURE_ID=$(echo "$CURRENT_BRANCH" | grep -oP '(?<=/)F[0-9]{4}-[^/]+$' || echo "")

if [ -z "$FEATURE_ID" ]; then
    echo ""
    exit 1
fi

# Check if feature directory exists
FEATURES_DIR="docs/features"
FEATURE_PATH="${FEATURES_DIR}/${FEATURE_ID}"

if [ ! -d "$FEATURE_PATH" ]; then
    echo ""
    exit 1
fi

# Return feature ID
echo "$FEATURE_ID"
exit 0
