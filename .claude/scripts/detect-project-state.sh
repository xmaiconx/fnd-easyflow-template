#!/bin/bash

# Script para detectar o estado atual do projeto
# Uso: bash .claude/scripts/detect-project-state.sh
# Retorna informações completas sobre PRD, features, branch atual, recomendações

set -e

# Function to count non-empty lines
count_lines() {
    local input="$1"
    if [ -z "$input" ]; then
        echo "0"
    else
        echo "$input" | wc -l | tr -d ' '
    fi
}

# Function to detect feature phase based on existing documents
detect_feature_phase() {
    local feature_dir="$1"

    if [ ! -d "$feature_dir" ]; then
        echo "NONE"
        return
    fi

    local has_about=false
    local has_discovery=false
    local has_plan=false
    local has_implementation=false

    [ -f "$feature_dir/about.md" ] && has_about=true
    [ -f "$feature_dir/discovery.md" ] && has_discovery=true
    [ -f "$feature_dir/plan.md" ] && has_plan=true
    [ -f "$feature_dir/implementation.md" ] && has_implementation=true

    # Check if about.md is filled (not just template)
    local about_filled=false
    if [ -f "$feature_dir/about.md" ]; then
        if ! grep -q "\[Clear description of main objective\]" "$feature_dir/about.md" 2>/dev/null; then
            about_filled=true
        fi
    fi

    # Check if discovery.md is filled
    local discovery_filled=false
    if [ -f "$feature_dir/discovery.md" ]; then
        if ! grep -q "\[User response\]" "$feature_dir/discovery.md" 2>/dev/null || \
           grep -q "^## Summary for Planning" "$feature_dir/discovery.md" 2>/dev/null; then
            discovery_filled=true
        fi
    fi

    # Determine phase
    if [ "$has_implementation" = true ]; then
        echo "DEVELOPMENT"
    elif [ "$has_plan" = true ]; then
        echo "READY_TO_DEV"
    elif [ "$has_discovery" = true ] && [ "$discovery_filled" = true ]; then
        echo "READY_TO_PLAN"
    elif [ "$has_about" = true ] && [ "$about_filled" = true ]; then
        echo "DISCOVERY"
    elif [ "$has_about" = true ]; then
        echo "INITIAL"
    else
        echo "NONE"
    fi
}

# Function to check PRD completion
check_prd_completion() {
    local file="$1"
    if [ ! -f "$file" ]; then
        echo "NONE"
        return
    fi

    # Check for template placeholders
    if grep -q "\[Descrição clara e concisa do produto\]" "$file" 2>/dev/null; then
        echo "TEMPLATE"
    else
        echo "FILLED"
    fi
}

# Function to check founder profile
check_founder_profile() {
    local file="docs/founder_profile.md"
    if [ ! -f "$file" ]; then
        echo "NONE"
        return
    fi

    # Check if filled
    if grep -q "\[Nome do stakeholder\]" "$file" 2>/dev/null; then
        echo "TEMPLATE"
    else
        echo "FILLED"
    fi
}

echo "========================================"
echo "PROJECT STATE"
echo "========================================"

# 1. PRD Status
PRD_FILE="docs/prd.md"
PRD_STATUS=$(check_prd_completion "$PRD_FILE")
echo ""
echo "--- PRD ---"
echo "PRD_EXISTS: $([ -f "$PRD_FILE" ] && echo "YES" || echo "NO")"
echo "PRD_STATUS: $PRD_STATUS"
[ -f "$PRD_FILE" ] && echo "PRD_PATH: $PRD_FILE"

# 2. Founder Profile Status
PROFILE_STATUS=$(check_founder_profile)
echo ""
echo "--- FOUNDER PROFILE ---"
echo "PROFILE_EXISTS: $([ -f "docs/founder_profile.md" ] && echo "YES" || echo "NO")"
echo "PROFILE_STATUS: $PROFILE_STATUS"

# 3. Current Branch Info
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
MAIN_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main")

echo ""
echo "--- GIT STATUS ---"
echo "CURRENT_BRANCH: $CURRENT_BRANCH"
echo "MAIN_BRANCH: $MAIN_BRANCH"

# Detect branch type
BRANCH_TYPE="other"
if [[ "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "master" ]]; then
    BRANCH_TYPE="main"
elif [[ "$CURRENT_BRANCH" == feature/* ]]; then
    BRANCH_TYPE="feature"
elif [[ "$CURRENT_BRANCH" == fix/* ]]; then
    BRANCH_TYPE="fix"
elif [[ "$CURRENT_BRANCH" == refactor/* ]]; then
    BRANCH_TYPE="refactor"
elif [[ "$CURRENT_BRANCH" == docs/* ]]; then
    BRANCH_TYPE="docs"
fi
echo "BRANCH_TYPE: $BRANCH_TYPE"

# Git status counts
MODIFIED_COUNT=$(git diff --name-only 2>/dev/null | grep -v '^$' | wc -l | tr -d ' ' || echo "0")
STAGED_COUNT=$(git diff --cached --name-only 2>/dev/null | grep -v '^$' | wc -l | tr -d ' ' || echo "0")
UNTRACKED_COUNT=$(git ls-files --others --exclude-standard 2>/dev/null | wc -l | tr -d ' ' || echo "0")
TOTAL_UNCOMMITTED=$((MODIFIED_COUNT + STAGED_COUNT + UNTRACKED_COUNT))

echo "MODIFIED_FILES: $MODIFIED_COUNT"
echo "STAGED_FILES: $STAGED_COUNT"
echo "UNTRACKED_FILES: $UNTRACKED_COUNT"
echo "TOTAL_UNCOMMITTED: $TOTAL_UNCOMMITTED"

# Ahead/behind remote
if [ "$CURRENT_BRANCH" != "unknown" ]; then
    AHEAD=$(git rev-list --count "origin/$CURRENT_BRANCH..$CURRENT_BRANCH" 2>/dev/null || echo "0")
    BEHIND=$(git rev-list --count "$CURRENT_BRANCH..origin/$CURRENT_BRANCH" 2>/dev/null || echo "0")
    echo "COMMITS_AHEAD: $AHEAD"
    echo "COMMITS_BEHIND: $BEHIND"
fi

# 4. Features Overview
FEATURES_DIR="docs/features"
echo ""
echo "--- FEATURES ---"

if [ -d "$FEATURES_DIR" ]; then
    FEATURE_LIST=$(ls -1 "$FEATURES_DIR" 2>/dev/null | grep -E '^F[0-9]{4}-' || true)
    FEATURE_COUNT=$(echo "$FEATURE_LIST" | grep -c . 2>/dev/null || echo "0")
    [ -z "$FEATURE_LIST" ] && FEATURE_COUNT=0

    echo "FEATURE_COUNT: $FEATURE_COUNT"

    if [ "$FEATURE_COUNT" -gt 0 ]; then
        echo "FEATURES:"
        echo "$FEATURE_LIST" | while read feature; do
            if [ -n "$feature" ]; then
                feature_path="$FEATURES_DIR/$feature"
                phase=$(detect_feature_phase "$feature_path")
                echo "  - $feature [PHASE: $phase]"
            fi
        done
    fi
else
    echo "FEATURE_COUNT: 0"
fi

# 5. Current Feature Context (if on feature branch)
FEATURE_ID=""
if [[ "$BRANCH_TYPE" == "feature" || "$BRANCH_TYPE" == "fix" || "$BRANCH_TYPE" == "refactor" || "$BRANCH_TYPE" == "docs" ]]; then
    # Extract feature ID from branch name
    FEATURE_ID=$(echo "$CURRENT_BRANCH" | grep -oP '(?<=/)F[0-9]{4}-[^/]+$' || echo "")
fi

echo ""
echo "--- CURRENT FEATURE ---"

if [ -n "$FEATURE_ID" ]; then
    FEATURE_DIR="docs/features/$FEATURE_ID"
    FEATURE_PHASE=$(detect_feature_phase "$FEATURE_DIR")

    echo "FEATURE_ID: $FEATURE_ID"
    echo "FEATURE_PATH: $FEATURE_DIR"
    echo "FEATURE_PHASE: $FEATURE_PHASE"

    # Document status
    echo "DOCUMENTS:"
    [ -f "$FEATURE_DIR/about.md" ] && echo "  - about.md: EXISTS" || echo "  - about.md: MISSING"
    [ -f "$FEATURE_DIR/discovery.md" ] && echo "  - discovery.md: EXISTS" || echo "  - discovery.md: MISSING"
    [ -f "$FEATURE_DIR/plan.md" ] && echo "  - plan.md: EXISTS" || echo "  - plan.md: MISSING"
    [ -f "$FEATURE_DIR/implementation.md" ] && echo "  - implementation.md: EXISTS" || echo "  - implementation.md: MISSING"
    [ -f "$FEATURE_DIR/git-pr.md" ] && echo "  - git-pr.md: EXISTS" || echo "  - git-pr.md: MISSING"
else
    echo "FEATURE_ID: NONE"
    echo "FEATURE_PHASE: N/A"
fi

# 6. Recent Activity
echo ""
echo "--- RECENT ACTIVITY ---"
RECENT_COMMITS=$(git log --oneline -5 2>/dev/null || echo "")
if [ -n "$RECENT_COMMITS" ]; then
    echo "RECENT_COMMITS:"
    echo "$RECENT_COMMITS" | sed 's/^/  /'
fi

# 7. Recommendations based on state
echo ""
echo "========================================"
echo "RECOMMENDATIONS"
echo "========================================"

RECOMMENDATIONS=()

# PRD recommendations
if [ "$PRD_STATUS" == "NONE" ]; then
    RECOMMENDATIONS+=("CREATE_PRD: Run /prd to create Product Requirements Document")
elif [ "$PRD_STATUS" == "TEMPLATE" ]; then
    RECOMMENDATIONS+=("FILL_PRD: PRD exists but needs to be filled with product details")
fi

# Profile recommendations
if [ "$PROFILE_STATUS" == "NONE" ]; then
    RECOMMENDATIONS+=("CREATE_PROFILE: Run script to create founder profile for personalized communication")
elif [ "$PROFILE_STATUS" == "TEMPLATE" ]; then
    RECOMMENDATIONS+=("FILL_PROFILE: Founder profile exists but needs to be completed")
fi

# Branch/Feature recommendations
if [ "$BRANCH_TYPE" == "main" ]; then
    if [ "$FEATURE_COUNT" == "0" ] 2>/dev/null; then
        RECOMMENDATIONS+=("START_FEATURE: No features exist. Use /feature to start your first feature")
    else
        RECOMMENDATIONS+=("SELECT_FEATURE: You're on main. Create a new feature branch or checkout existing one")
    fi
else
    # On feature branch - recommend based on phase
    case "$FEATURE_PHASE" in
        "INITIAL")
            RECOMMENDATIONS+=("FILL_ABOUT: Fill about.md with feature objectives and scope")
            ;;
        "DISCOVERY")
            RECOMMENDATIONS+=("COMPLETE_DISCOVERY: Complete discovery.md with questionnaire and decisions")
            ;;
        "READY_TO_PLAN")
            RECOMMENDATIONS+=("CREATE_PLAN: Run /plan to create technical plan")
            ;;
        "READY_TO_DEV")
            RECOMMENDATIONS+=("START_DEV: Run /dev to start implementation")
            ;;
        "DEVELOPMENT")
            RECOMMENDATIONS+=("CONTINUE_DEV: Continue implementation or run tests")
            ;;
    esac
fi

# Git recommendations
if [ "$TOTAL_UNCOMMITTED" -gt 0 ]; then
    RECOMMENDATIONS+=("UNCOMMITTED_CHANGES: You have $TOTAL_UNCOMMITTED uncommitted changes")
fi

if [ "${BEHIND:-0}" -gt 0 ]; then
    RECOMMENDATIONS+=("PULL_CHANGES: Branch is $BEHIND commits behind remote. Consider pulling")
fi

# Output recommendations
if [ ${#RECOMMENDATIONS[@]} -eq 0 ]; then
    echo "No specific recommendations. Project is in good state."
else
    echo "ACTION_ITEMS:"
    for rec in "${RECOMMENDATIONS[@]}"; do
        echo "  - $rec"
    done
fi

# 8. Suggested next command
echo ""
echo "--- SUGGESTED COMMAND ---"

if [ "$PRD_STATUS" == "NONE" ]; then
    echo "NEXT_COMMAND: /prd"
    echo "REASON: No PRD found. Start by defining your product."
elif [ "$BRANCH_TYPE" == "main" ]; then
    echo "NEXT_COMMAND: /feature"
    echo "REASON: Create or select a feature to work on."
elif [ -n "$FEATURE_ID" ]; then
    case "$FEATURE_PHASE" in
        "INITIAL"|"DISCOVERY")
            echo "NEXT_COMMAND: /feature"
            echo "REASON: Complete feature discovery process."
            ;;
        "READY_TO_PLAN")
            echo "NEXT_COMMAND: /plan"
            echo "REASON: Feature discovery complete. Create technical plan."
            ;;
        "READY_TO_DEV"|"DEVELOPMENT")
            echo "NEXT_COMMAND: /dev"
            echo "REASON: Technical plan exists. Continue development."
            ;;
        *)
            echo "NEXT_COMMAND: /feature"
            echo "REASON: Review feature status."
            ;;
    esac
fi

echo ""
echo "========================================"
