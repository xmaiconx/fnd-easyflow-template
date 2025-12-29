#!/bin/bash

# =============================================================================
# Feature Context Mapper
# Identifies current feature and maps all relevant files/resources
# Used by: /design, /plan, /dev, /review, /fix, /question, /test-api, etc.
# =============================================================================

set -e

# =============================================================================
# BRANCH INFO
# =============================================================================

CURRENT_BRANCH=$(git branch --show-current)
MAIN_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main")

# Extract feature ID from branch (patterns: feature/F0001-name, fix/F0002-name, etc.)
FEATURE_ID=$(echo "$CURRENT_BRANCH" | grep -oP '(?<=/)F[0-9]{4}-[^/]+$' || echo "")

# Extract branch type
BRANCH_TYPE=$(echo "$CURRENT_BRANCH" | grep -oP '^[^/]+(?=/)' || echo "unknown")

echo "========================================"
echo "BRANCH"
echo "========================================"
echo "CURRENT_BRANCH=$CURRENT_BRANCH"
echo "MAIN_BRANCH=$MAIN_BRANCH"
echo "BRANCH_TYPE=$BRANCH_TYPE"
echo "FEATURE_ID=$FEATURE_ID"

# =============================================================================
# FEATURE DOCUMENTS
# =============================================================================

echo ""
echo "========================================"
echo "FEATURE_DOCS"
echo "========================================"

FEATURE_DIR="docs/features/${FEATURE_ID}"

if [ -n "$FEATURE_ID" ] && [ -d "$FEATURE_DIR" ]; then
    echo "FEATURE_DIR=$FEATURE_DIR"
    echo "EXISTS=true"

    # Core documents (order matters - represents workflow stages)
    echo ""
    echo "# Core Documents"
    [ -f "$FEATURE_DIR/about.md" ] && echo "HAS_ABOUT=true" || echo "HAS_ABOUT=false"
    [ -f "$FEATURE_DIR/discovery.md" ] && echo "HAS_DISCOVERY=true" || echo "HAS_DISCOVERY=false"
    [ -f "$FEATURE_DIR/design.md" ] && echo "HAS_DESIGN=true" || echo "HAS_DESIGN=false"
    [ -f "$FEATURE_DIR/plan.md" ] && echo "HAS_PLAN=true" || echo "HAS_PLAN=false"
    [ -f "$FEATURE_DIR/implementation.md" ] && echo "HAS_IMPLEMENTATION=true" || echo "HAS_IMPLEMENTATION=false"
    [ -f "$FEATURE_DIR/review.md" ] && echo "HAS_REVIEW=true" || echo "HAS_REVIEW=false"

    # Support documents
    echo ""
    echo "# Support Documents"
    [ -f "$FEATURE_DIR/fixes.md" ] && echo "HAS_FIXES=true" || echo "HAS_FIXES=false"
    [ -f "$FEATURE_DIR/git-pr.md" ] && echo "HAS_PR=true" || echo "HAS_PR=false"

    # Determine current phase
    echo ""
    echo "# Phase Detection"
    if [ -f "$FEATURE_DIR/implementation.md" ]; then
        PHASE="development_done"
    elif [ -f "$FEATURE_DIR/plan.md" ]; then
        PHASE="planning_done"
    elif [ -f "$FEATURE_DIR/design.md" ]; then
        PHASE="design_done"
    elif [ -f "$FEATURE_DIR/discovery.md" ]; then
        PHASE="discovery_done"
    elif [ -f "$FEATURE_DIR/about.md" ]; then
        PHASE="discovery_started"
    else
        PHASE="created"
    fi
    echo "CURRENT_PHASE=$PHASE"

    # All files in feature directory (recursive)
    echo ""
    echo "# All Files"
    echo "FILES=["
    find "$FEATURE_DIR" -type f 2>/dev/null | sort | while read -r file; do
        # Get relative path from feature dir
        relative="${file#$FEATURE_DIR/}"
        echo "  \"$relative\""
    done
    echo "]"

    # Test files specifically
    echo ""
    echo "# Tests"
    if [ -d "$FEATURE_DIR/tests" ]; then
        echo "HAS_TESTS_DIR=true"
        echo "TEST_FILES=["
        find "$FEATURE_DIR/tests" -type f -name "*.http" -o -name "*.hurl" 2>/dev/null | sort | while read -r file; do
            relative="${file#$FEATURE_DIR/}"
            echo "  \"$relative\""
        done
        echo "]"
        # Count test results
        RESULT_COUNT=$(find "$FEATURE_DIR/tests" -type f -name "*result*.md" -o -name "*result*.txt" 2>/dev/null | wc -l)
        echo "TEST_RESULT_COUNT=$RESULT_COUNT"
    else
        echo "HAS_TESTS_DIR=false"
    fi
else
    echo "FEATURE_DIR=$FEATURE_DIR"
    echo "EXISTS=false"
    echo "CURRENT_PHASE=none"
fi

# =============================================================================
# DESIGN SYSTEM
# =============================================================================

echo ""
echo "========================================"
echo "DESIGN_SYSTEM"
echo "========================================"

if [ -f "docs/design-system/foundations.md" ]; then
    echo "HAS_FOUNDATIONS=true"
    echo "FOUNDATIONS_PATH=docs/design-system/foundations.md"
elif [ -f "docs/design-system.md" ]; then
    echo "HAS_FOUNDATIONS=true"
    echo "FOUNDATIONS_PATH=docs/design-system.md"
else
    echo "HAS_FOUNDATIONS=false"
fi

# List all design system files
if [ -d "docs/design-system" ]; then
    echo "DESIGN_SYSTEM_FILES=["
    find "docs/design-system" -type f 2>/dev/null | sort | while read -r file; do
        echo "  \"$file\""
    done
    echo "]"
fi

# =============================================================================
# PROJECT CONTEXT
# =============================================================================

echo ""
echo "========================================"
echo "PROJECT_CONTEXT"
echo "========================================"

# Founder profile
[ -f "docs/founder_profile.md" ] && echo "HAS_FOUNDER_PROFILE=true" || echo "HAS_FOUNDER_PROFILE=false"

# Product blueprint
[ -f "docs/product.md" ] && echo "HAS_PRODUCT=true" || echo "HAS_PRODUCT=false"

# Architecture reference
if [ -f "CLAUDE.md" ]; then
    echo "ARCHITECTURE_REF=CLAUDE.md"
else
    echo "ARCHITECTURE_REF=none"
fi

# =============================================================================
# FRONTEND CONTEXT (for /design)
# =============================================================================

echo ""
echo "========================================"
echo "FRONTEND"
echo "========================================"

# Detect frontend location
if [ -d "apps/frontend/src" ]; then
    FRONTEND_PATH="apps/frontend/src"
elif [ -d "frontend/src" ]; then
    FRONTEND_PATH="frontend/src"
elif [ -d "src/components" ]; then
    FRONTEND_PATH="src"
else
    FRONTEND_PATH=""
fi

if [ -n "$FRONTEND_PATH" ]; then
    echo "EXISTS=true"
    echo "PATH=$FRONTEND_PATH"

    # Count components
    UI_COUNT=$(find "$FRONTEND_PATH/components/ui" -type f -name "*.tsx" 2>/dev/null | wc -l)
    FEATURE_COMP_COUNT=$(find "$FRONTEND_PATH/components" -type f -name "*.tsx" 2>/dev/null | wc -l)
    PAGE_COUNT=$(find "$FRONTEND_PATH/pages" -type f -name "*.tsx" 2>/dev/null | wc -l)
    HOOK_COUNT=$(find "$FRONTEND_PATH/hooks" -type f -name "*.ts" 2>/dev/null | wc -l)
    STORE_COUNT=$(find "$FRONTEND_PATH/stores" -type f -name "*.ts" 2>/dev/null | wc -l)

    echo "UI_COMPONENTS=$UI_COUNT"
    echo "FEATURE_COMPONENTS=$FEATURE_COMP_COUNT"
    echo "PAGES=$PAGE_COUNT"
    echo "HOOKS=$HOOK_COUNT"
    echo "STORES=$STORE_COUNT"

    # Component folders
    echo "COMPONENT_FOLDERS=["
    find "$FRONTEND_PATH/components" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | sort | while read -r dir; do
        dirname=$(basename "$dir")
        count=$(find "$dir" -type f -name "*.tsx" 2>/dev/null | wc -l)
        echo "  {\"name\":\"$dirname\",\"files\":$count}"
    done
    echo "]"
else
    echo "EXISTS=false"
fi

# =============================================================================
# GIT STATUS
# =============================================================================

echo ""
echo "========================================"
echo "GIT_STATUS"
echo "========================================"

# Modified (unstaged)
MODIFIED_COUNT=$(git diff --name-only 2>/dev/null | wc -l)
echo "MODIFIED_COUNT=$MODIFIED_COUNT"

# Staged
STAGED_COUNT=$(git diff --cached --name-only 2>/dev/null | wc -l)
echo "STAGED_COUNT=$STAGED_COUNT"

# Committed vs main
if [ "$CURRENT_BRANCH" != "$MAIN_BRANCH" ] && git rev-parse --verify "$MAIN_BRANCH" >/dev/null 2>&1; then
    COMMITTED_COUNT=$(git diff --name-only "$MAIN_BRANCH"..."$CURRENT_BRANCH" 2>/dev/null | wc -l)
else
    COMMITTED_COUNT=0
fi
echo "COMMITTED_COUNT=$COMMITTED_COUNT"

# Total
TOTAL=$((MODIFIED_COUNT + STAGED_COUNT + COMMITTED_COUNT))
echo "TOTAL_CHANGES=$TOTAL"

# Has uncommitted changes?
[ "$MODIFIED_COUNT" -gt 0 ] || [ "$STAGED_COUNT" -gt 0 ] && echo "HAS_UNCOMMITTED=true" || echo "HAS_UNCOMMITTED=false"

# =============================================================================
# ALL FEATURES (for context)
# =============================================================================

echo ""
echo "========================================"
echo "ALL_FEATURES"
echo "========================================"

if [ -d "docs/features" ]; then
    echo "FEATURES=["
    find "docs/features" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | sort | while read -r dir; do
        feature_name=$(basename "$dir")
        # Determine phase for each feature
        if [ -f "$dir/implementation.md" ]; then
            phase="done"
        elif [ -f "$dir/plan.md" ]; then
            phase="planned"
        elif [ -f "$dir/design.md" ]; then
            phase="designed"
        elif [ -f "$dir/discovery.md" ]; then
            phase="discovered"
        else
            phase="started"
        fi
        echo "  {\"id\":\"$feature_name\",\"phase\":\"$phase\"}"
    done
    echo "]"

    # Count
    FEATURE_COUNT=$(find "docs/features" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l)
    echo "FEATURE_COUNT=$FEATURE_COUNT"

    # Next feature number
    LAST_NUM=$(find "docs/features" -mindepth 1 -maxdepth 1 -type d -name "F*" 2>/dev/null | \
               sed 's/.*F\([0-9]*\).*/\1/' | sort -n | tail -1)
    if [ -n "$LAST_NUM" ]; then
        NEXT_NUM=$((10#$LAST_NUM + 1))
    else
        NEXT_NUM=1
    fi
    printf "NEXT_FEATURE_NUMBER=F%04d\n" "$NEXT_NUM"
else
    echo "FEATURES=[]"
    echo "FEATURE_COUNT=0"
    echo "NEXT_FEATURE_NUMBER=F0001"
fi

echo ""
echo "========================================"

# Exit code based on feature detection
if [ -n "$FEATURE_ID" ] && [ -d "$FEATURE_DIR" ]; then
    exit 0
else
    exit 1
fi
