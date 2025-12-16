#!/bin/bash

# =============================================================================
# feature-init.sh - Unified Feature Discovery Initialization
# =============================================================================
# Combines all Phase 0 and Phase 1 analysis into a single execution
# Usage: bash .claude/scripts/feature-init.sh
#
# Returns structured output with:
#   - Founder profile & communication preferences
#   - Git context (branch, commits, diffs)
#   - Existing features & next available number
#   - Architecture reference location
#   - Codebase patterns for inference
# =============================================================================

set -e

# Colors (for human-readable sections)
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# =============================================================================
# SECTION 1: FOUNDER PROFILE
# =============================================================================

echo "========================================"
echo "FOUNDER_PROFILE"
echo "========================================"

PROFILE_FILE="docs/founder_profile.md"

if [ -f "$PROFILE_FILE" ]; then
    echo "STATUS: EXISTS"

    # Extract technical level
    TECH_LEVEL=$(grep -E "^##.*Nível Técnico|^\*\*Nível Técnico\*\*" "$PROFILE_FILE" -A 5 2>/dev/null | \
                 grep -oE "(Leigo|Básico|Intermediário|Técnico|Avançado)" | head -1 || echo "")

    if [ -z "$TECH_LEVEL" ]; then
        # Try alternative patterns
        TECH_LEVEL=$(grep -iE "(leigo|básico|intermediário|técnico|avançado)" "$PROFILE_FILE" 2>/dev/null | \
                     grep -oE "(Leigo|Básico|Intermediário|Técnico|Avançado)" | head -1 || echo "Balanceado")
    fi
    echo "TECH_LEVEL: ${TECH_LEVEL:-Balanceado}"

    # Extract communication style
    COMM_STYLE=$(grep -E "^##.*Preferências|^\*\*Preferências" "$PROFILE_FILE" -A 10 2>/dev/null | \
                 grep -oE "(Direto|Detalhado|Visual|Balanceado)" | head -1 || echo "Balanceado")
    echo "COMM_STYLE: ${COMM_STYLE:-Balanceado}"

    # Extract name if available
    FOUNDER_NAME=$(grep -E "^##.*Nome|^\*\*Nome\*\*|^Nome:" "$PROFILE_FILE" 2>/dev/null | \
                   sed 's/.*:\s*//' | head -1 || echo "")
    [ -n "$FOUNDER_NAME" ] && echo "FOUNDER_NAME: $FOUNDER_NAME"
else
    echo "STATUS: NOT_FOUND"
    echo "TECH_LEVEL: Balanceado"
    echo "COMM_STYLE: Balanceado"
fi

echo ""

# =============================================================================
# SECTION 2: GIT CONTEXT
# =============================================================================

echo "========================================"
echo "GIT_CONTEXT"
echo "========================================"

# Current branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo "CURRENT_BRANCH: $CURRENT_BRANCH"

# Main branch detection
MAIN_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main")
echo "MAIN_BRANCH: $MAIN_BRANCH"

# Branch type detection
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
else
    BRANCH_TYPE="other"
fi
echo "BRANCH_TYPE: $BRANCH_TYPE"

# Check for uncommitted changes
UNCOMMITTED_COUNT=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
echo "UNCOMMITTED_CHANGES: $UNCOMMITTED_COUNT"

echo ""
echo "--- RECENT_COMMITS (last 10) ---"
git log --oneline -10 2>/dev/null || echo "(no commits)"

echo ""
echo "--- MODIFIED_FILES (branch diff) ---"
if [ "$BRANCH_TYPE" != "main" ] && git rev-parse --verify "$MAIN_BRANCH" >/dev/null 2>&1; then
    git diff "$MAIN_BRANCH...HEAD" --name-only 2>/dev/null || echo "(no changes)"
else
    echo "(on main branch)"
fi

echo ""

# =============================================================================
# SECTION 3: FEATURES STATUS
# =============================================================================

echo "========================================"
echo "FEATURES_STATUS"
echo "========================================"

FEATURES_DIR="docs/features"

if [ -d "$FEATURES_DIR" ]; then
    # List existing features
    FEATURE_LIST=$(ls -1 "$FEATURES_DIR" 2>/dev/null | grep -E '^F[0-9]{4}-' | sort || true)
    FEATURE_COUNT=$(echo "$FEATURE_LIST" | grep -c . 2>/dev/null || echo "0")
    [ -z "$FEATURE_LIST" ] && FEATURE_COUNT=0

    echo "FEATURE_COUNT: $FEATURE_COUNT"

    # Find last feature number and calculate next
    LAST_FEATURE=$(echo "$FEATURE_LIST" | sort -r | head -1 || echo "")

    if [ -z "$LAST_FEATURE" ]; then
        NEXT_NUMBER="0001"
        echo "LAST_FEATURE: (none)"
    else
        LAST_NUMBER=$(echo "$LAST_FEATURE" | grep -oE 'F[0-9]{4}' | grep -oE '[0-9]{4}')
        NEXT_NUMBER=$(printf "%04d" $((10#$LAST_NUMBER + 1)))
        echo "LAST_FEATURE: $LAST_FEATURE"
    fi
    echo "NEXT_NUMBER: F$NEXT_NUMBER"

    # List recent features with their phases
    if [ "$FEATURE_COUNT" -gt 0 ]; then
        echo ""
        echo "--- EXISTING_FEATURES ---"
        echo "$FEATURE_LIST" | tail -5 | while read feature; do
            if [ -n "$feature" ]; then
                feature_path="$FEATURES_DIR/$feature"
                # Quick phase detection
                phase="INITIAL"
                [ -f "$feature_path/plan.md" ] && phase="PLANNED"
                [ -f "$feature_path/implementation.md" ] && phase="DEVELOPMENT"
                echo "  $feature [PHASE: $phase]"
            fi
        done
    fi
else
    echo "FEATURE_COUNT: 0"
    echo "NEXT_NUMBER: F0001"
    mkdir -p "$FEATURES_DIR"
    echo "ACTION: Created $FEATURES_DIR directory"
fi

# Current feature detection (if on feature branch)
if [ "$BRANCH_TYPE" != "main" ] && [ "$BRANCH_TYPE" != "other" ]; then
    CURRENT_FEATURE_ID=$(echo "$CURRENT_BRANCH" | grep -oP '(?<=/)F[0-9]{4}-[^/]+$' || echo "")
    if [ -n "$CURRENT_FEATURE_ID" ]; then
        echo ""
        echo "--- CURRENT_FEATURE ---"
        echo "FEATURE_ID: $CURRENT_FEATURE_ID"

        FEATURE_PATH="$FEATURES_DIR/$CURRENT_FEATURE_ID"
        if [ -d "$FEATURE_PATH" ]; then
            echo "FEATURE_PATH: $FEATURE_PATH"
            echo "DOCUMENTS:"
            [ -f "$FEATURE_PATH/about.md" ] && echo "  - about.md: EXISTS" || echo "  - about.md: MISSING"
            [ -f "$FEATURE_PATH/discovery.md" ] && echo "  - discovery.md: EXISTS" || echo "  - discovery.md: MISSING"
            [ -f "$FEATURE_PATH/plan.md" ] && echo "  - plan.md: EXISTS" || echo "  - plan.md: MISSING"
        else
            echo "FEATURE_PATH: (not created yet)"
        fi
    fi
fi

echo ""

# =============================================================================
# SECTION 4: ARCHITECTURE REFERENCE
# =============================================================================

echo "========================================"
echo "ARCHITECTURE_REFERENCE"
echo "========================================"

TECH_SPEC="docs/architecture/technical-spec.md"
CLAUDE_MD="CLAUDE.md"

if [ -f "$TECH_SPEC" ]; then
    echo "PRIMARY_SOURCE: $TECH_SPEC"
    echo "STATUS: EXISTS"
elif [ -f "$CLAUDE_MD" ]; then
    echo "PRIMARY_SOURCE: $CLAUDE_MD"
    echo "STATUS: EXISTS (fallback)"
else
    echo "PRIMARY_SOURCE: NONE"
    echo "STATUS: No architecture reference found"
fi

echo ""

# =============================================================================
# SECTION 5: CODEBASE PATTERNS (for inference)
# =============================================================================

echo "========================================"
echo "CODEBASE_PATTERNS"
echo "========================================"

# Detect stack from package.json
if [ -f "package.json" ]; then
    echo "--- DETECTED_STACK ---"

    # Backend
    grep -q "nestjs" package.json 2>/dev/null && echo "BACKEND: NestJS"
    grep -q "express" package.json 2>/dev/null && echo "BACKEND: Express"

    # Frontend
    grep -q '"react"' package.json 2>/dev/null && echo "FRONTEND: React"
    grep -q "vue" package.json 2>/dev/null && echo "FRONTEND: Vue"
    grep -q "angular" package.json 2>/dev/null && echo "FRONTEND: Angular"

    # Database
    grep -q "kysely" package.json 2>/dev/null && echo "ORM: Kysely"
    grep -q "prisma" package.json 2>/dev/null && echo "ORM: Prisma"
    grep -q "typeorm" package.json 2>/dev/null && echo "ORM: TypeORM"

    # Auth
    grep -q "supabase" package.json 2>/dev/null && echo "AUTH: Supabase"

    # Queue
    grep -q "bullmq" package.json 2>/dev/null && echo "QUEUE: BullMQ"
fi

# Check for common patterns
echo ""
echo "--- PROJECT_PATTERNS ---"

# Multi-tenancy
if grep -rq "account_id" apps/ libs/ 2>/dev/null; then
    echo "MULTI_TENANCY: YES (account_id pattern detected)"
else
    echo "MULTI_TENANCY: UNKNOWN"
fi

# CQRS
if [ -d "apps/backend/src" ]; then
    COMMANDS_COUNT=$(find apps/backend/src -name "*command*.ts" -o -name "*Command.ts" 2>/dev/null | wc -l | tr -d ' ')
    HANDLERS_COUNT=$(find apps/backend/src -name "*handler*.ts" -o -name "*Handler.ts" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$COMMANDS_COUNT" -gt 0 ] || [ "$HANDLERS_COUNT" -gt 0 ]; then
        echo "CQRS: YES (commands: $COMMANDS_COUNT, handlers: $HANDLERS_COUNT)"
    fi
fi

# API modules count
if [ -d "apps/backend/src/api/modules" ]; then
    MODULE_COUNT=$(ls -1 apps/backend/src/api/modules 2>/dev/null | wc -l | tr -d ' ')
    echo "API_MODULES: $MODULE_COUNT"
fi

echo ""

# =============================================================================
# SECTION 6: SIMILAR FEATURES SEARCH (quick scan)
# =============================================================================

echo "========================================"
echo "QUICK_SIMILARITY_SCAN"
echo "========================================"
echo "NOTE: Use this section to check for existing similar functionality"
echo "DIRECTORIES_TO_CHECK:"
echo "  - apps/backend/src/api/modules/ (backend modules)"
echo "  - apps/frontend/src/pages/ (frontend pages)"
echo "  - apps/frontend/src/components/ (frontend components)"
echo "  - libs/domain/src/entities/ (domain entities)"
echo ""

# List existing modules for quick reference
if [ -d "apps/backend/src/api/modules" ]; then
    echo "--- EXISTING_MODULES ---"
    ls -1 apps/backend/src/api/modules 2>/dev/null | sed 's/^/  - /' || echo "  (none)"
fi

echo ""

# =============================================================================
# SECTION 7: RECOMMENDATIONS
# =============================================================================

echo "========================================"
echo "RECOMMENDATIONS"
echo "========================================"

if [ "$BRANCH_TYPE" == "main" ]; then
    echo "ACTION: Create new feature branch"
    echo "SCRIPT: bash .claude/scripts/create-feature-docs.sh [type] [name]"
    echo "NEXT_NUMBER: F$NEXT_NUMBER"
else
    if [ -n "$CURRENT_FEATURE_ID" ] && [ -d "$FEATURES_DIR/$CURRENT_FEATURE_ID" ]; then
        echo "ACTION: Continue feature discovery"
        echo "FEATURE: $CURRENT_FEATURE_ID"
    else
        echo "ACTION: Branch exists but no feature docs"
        echo "SUGGESTION: Align branch name with feature pattern or create docs"
    fi
fi

echo ""
echo "========================================"
echo "END_FEATURE_INIT"
echo "========================================"
