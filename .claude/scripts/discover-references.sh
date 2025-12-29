#!/bin/bash

# =============================================================================
# Reference Discovery Script
# Finds similar files in the codebase for coordinator to pass to subagents
# Used by: /autopilot (Phase 2: Reference Discovery)
# =============================================================================

set -e

# =============================================================================
# PARSE ARGUMENTS
# =============================================================================

FEATURE_ID=""
SCOPE=""
KEYWORDS=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --feature)
            FEATURE_ID="$2"
            shift 2
            ;;
        --scope)
            SCOPE="$2"  # database,backend,frontend,workers
            shift 2
            ;;
        --keywords)
            KEYWORDS="$2"  # comma-separated keywords from discovery
            shift 2
            ;;
        *)
            shift
            ;;
    esac
done

echo "========================================"
echo "REFERENCE DISCOVERY"
echo "========================================"
echo "FEATURE_ID=$FEATURE_ID"
echo "SCOPE=$SCOPE"
echo "KEYWORDS=$KEYWORDS"
echo ""

# =============================================================================
# DATABASE REFERENCES
# =============================================================================

if [[ "$SCOPE" == *"database"* ]] || [[ -z "$SCOPE" ]]; then
    echo "========================================"
    echo "DATABASE_REFERENCES"
    echo "========================================"

    # Find entity examples
    echo ""
    echo "# Entities (libs/domain/src/entities/)"
    if [ -d "libs/domain/src/entities" ]; then
        find libs/domain/src/entities -maxdepth 1 -type f -name "*.ts" ! -name "index.ts" 2>/dev/null | head -5 | while read -r file; do
            lines=$(wc -l < "$file")
            echo "  PATH=$file LINES=$lines"
        done
    fi

    # Find enum examples
    echo ""
    echo "# Enums (libs/domain/src/enums/)"
    if [ -d "libs/domain/src/enums" ]; then
        find libs/domain/src/enums -maxdepth 1 -type f -name "*.ts" ! -name "index.ts" 2>/dev/null | head -3 | while read -r file; do
            echo "  PATH=$file"
        done
    fi

    # Find repository examples
    echo ""
    echo "# Repositories (libs/app-database/src/repositories/)"
    if [ -d "libs/app-database/src/repositories" ]; then
        find libs/app-database/src/repositories -maxdepth 1 -type f -name "*.ts" ! -name "index.ts" 2>/dev/null | head -3 | while read -r file; do
            lines=$(wc -l < "$file")
            echo "  PATH=$file LINES=$lines"
        done
    fi

    # Find interface examples
    echo ""
    echo "# Repository Interfaces (libs/app-database/src/interfaces/)"
    if [ -d "libs/app-database/src/interfaces" ]; then
        find libs/app-database/src/interfaces -maxdepth 1 -type f -name "I*.ts" 2>/dev/null | head -3 | while read -r file; do
            echo "  PATH=$file"
        done
    fi

    # Find Kysely type examples
    echo ""
    echo "# Kysely Types (libs/app-database/src/types/)"
    if [ -d "libs/app-database/src/types" ]; then
        find libs/app-database/src/types -maxdepth 1 -type f -name "*Table.ts" 2>/dev/null | head -3 | while read -r file; do
            echo "  PATH=$file"
        done
    fi

    # Find recent migration
    echo ""
    echo "# Recent Migrations"
    if [ -d "libs/app-database/migrations" ]; then
        find libs/app-database/migrations -maxdepth 1 -type f -name "*.js" 2>/dev/null | sort -r | head -3 | while read -r file; do
            echo "  PATH=$file"
        done
    fi
fi

# =============================================================================
# BACKEND REFERENCES
# =============================================================================

if [[ "$SCOPE" == *"backend"* ]] || [[ -z "$SCOPE" ]]; then
    echo ""
    echo "========================================"
    echo "BACKEND_REFERENCES"
    echo "========================================"

    # Find module examples
    echo ""
    echo "# Modules (apps/backend/src/api/modules/)"
    if [ -d "apps/backend/src/api/modules" ]; then
        for dir in apps/backend/src/api/modules/*/; do
            if [ -d "$dir" ]; then
                module_name=$(basename "$dir")
                file_count=$(find "$dir" -type f -name "*.ts" 2>/dev/null | wc -l)
                has_controller=$([ -f "$dir${module_name}.controller.ts" ] && echo "yes" || echo "no")
                has_service=$([ -f "$dir${module_name}.service.ts" ] && echo "yes" || echo "no")
                has_commands=$([ -d "${dir}commands" ] && echo "yes" || echo "no")
                echo "  MODULE=$module_name FILES=$file_count CONTROLLER=$has_controller SERVICE=$has_service COMMANDS=$has_commands"
            fi
        done | head -5
    fi

    # Find controller examples
    echo ""
    echo "# Controllers"
    if [ -d "apps/backend/src/api/modules" ]; then
        find apps/backend/src/api/modules -name "*.controller.ts" 2>/dev/null | head -3 | while read -r file; do
            lines=$(wc -l < "$file")
            endpoints=$(grep -c "@Get\|@Post\|@Put\|@Patch\|@Delete" "$file" 2>/dev/null || echo "0")
            echo "  PATH=$file LINES=$lines ENDPOINTS=$endpoints"
        done
    fi

    # Find DTO examples
    echo ""
    echo "# DTOs"
    if [ -d "apps/backend/src/api/modules" ]; then
        find apps/backend/src/api/modules -path "*/dtos/*.ts" 2>/dev/null | head -5 | while read -r file; do
            echo "  PATH=$file"
        done
    fi

    # Find command examples
    echo ""
    echo "# Commands"
    if [ -d "apps/backend/src/api/modules" ]; then
        find apps/backend/src/api/modules -path "*/commands/*Command.ts" 2>/dev/null | head -3 | while read -r file; do
            echo "  PATH=$file"
        done
    fi

    # Find event examples
    echo ""
    echo "# Events"
    if [ -d "apps/backend/src/api/modules" ]; then
        find apps/backend/src/api/modules -path "*/events/*Event.ts" 2>/dev/null | head -3 | while read -r file; do
            echo "  PATH=$file"
        done
    fi

    # App module location
    echo ""
    echo "# App Module"
    [ -f "apps/backend/src/api/app.module.ts" ] && echo "  PATH=apps/backend/src/api/app.module.ts"
fi

# =============================================================================
# FRONTEND REFERENCES
# =============================================================================

if [[ "$SCOPE" == *"frontend"* ]] || [[ -z "$SCOPE" ]]; then
    echo ""
    echo "========================================"
    echo "FRONTEND_REFERENCES"
    echo "========================================"

    # Find page examples
    echo ""
    echo "# Pages (apps/frontend/src/pages/)"
    if [ -d "apps/frontend/src/pages" ]; then
        find apps/frontend/src/pages -maxdepth 1 -type f -name "*.tsx" 2>/dev/null | head -5 | while read -r file; do
            lines=$(wc -l < "$file")
            echo "  PATH=$file LINES=$lines"
        done
    fi

    # Find hook examples
    echo ""
    echo "# Hooks (apps/frontend/src/hooks/)"
    if [ -d "apps/frontend/src/hooks" ]; then
        find apps/frontend/src/hooks -maxdepth 1 -type f -name "use-*.ts" 2>/dev/null | head -5 | while read -r file; do
            lines=$(wc -l < "$file")
            echo "  PATH=$file LINES=$lines"
        done
    fi

    # Find store examples
    echo ""
    echo "# Stores (apps/frontend/src/stores/)"
    if [ -d "apps/frontend/src/stores" ]; then
        find apps/frontend/src/stores -maxdepth 1 -type f -name "*-store.ts" 2>/dev/null | head -3 | while read -r file; do
            lines=$(wc -l < "$file")
            echo "  PATH=$file LINES=$lines"
        done
    fi

    # Find component examples
    echo ""
    echo "# Feature Components"
    if [ -d "apps/frontend/src/components/features" ]; then
        for dir in apps/frontend/src/components/features/*/; do
            if [ -d "$dir" ]; then
                feature_name=$(basename "$dir")
                file_count=$(find "$dir" -type f -name "*.tsx" 2>/dev/null | wc -l)
                echo "  FEATURE=$feature_name FILES=$file_count PATH=$dir"
            fi
        done | head -5
    fi

    # Find types examples
    echo ""
    echo "# Types (apps/frontend/src/types/)"
    if [ -d "apps/frontend/src/types" ]; then
        find apps/frontend/src/types -maxdepth 1 -type f -name "*.ts" 2>/dev/null | head -3 | while read -r file; do
            echo "  PATH=$file"
        done
    fi

    # Routes file
    echo ""
    echo "# Routes"
    [ -f "apps/frontend/src/routes.tsx" ] && echo "  PATH=apps/frontend/src/routes.tsx"
    [ -f "apps/frontend/src/App.tsx" ] && echo "  PATH=apps/frontend/src/App.tsx"
fi

# =============================================================================
# WORKERS REFERENCES
# =============================================================================

if [[ "$SCOPE" == *"workers"* ]] || [[ -z "$SCOPE" ]]; then
    echo ""
    echo "========================================"
    echo "WORKERS_REFERENCES"
    echo "========================================"

    # Find worker examples
    echo ""
    echo "# Workers (apps/backend/src/workers/)"
    if [ -d "apps/backend/src/workers" ]; then
        find apps/backend/src/workers -maxdepth 1 -type f -name "*.worker.ts" 2>/dev/null | head -3 | while read -r file; do
            lines=$(wc -l < "$file")
            echo "  PATH=$file LINES=$lines"
        done
    fi
fi

# =============================================================================
# KEYWORD-BASED SEARCH
# =============================================================================

if [ -n "$KEYWORDS" ]; then
    echo ""
    echo "========================================"
    echo "KEYWORD_MATCHES"
    echo "========================================"

    IFS=',' read -ra KEYWORD_ARRAY <<< "$KEYWORDS"
    for keyword in "${KEYWORD_ARRAY[@]}"; do
        keyword=$(echo "$keyword" | xargs)  # trim whitespace
        echo ""
        echo "# Keyword: $keyword"
        grep -rli "$keyword" apps/ libs/ --include="*.ts" --include="*.tsx" 2>/dev/null | head -5 | while read -r file; do
            match_count=$(grep -ci "$keyword" "$file" 2>/dev/null || echo "0")
            echo "  PATH=$file MATCHES=$match_count"
        done
    done
fi

# =============================================================================
# SKILL DETECTION
# =============================================================================

echo ""
echo "========================================"
echo "SKILL_DETECTION"
echo "========================================"

# Check for Stripe-related code
stripe_count=$(grep -rli "stripe" apps/ libs/ --include="*.ts" 2>/dev/null | wc -l)
if [ "$stripe_count" -gt 0 ]; then
    echo "STRIPE_DETECTED=true COUNT=$stripe_count"
    echo "  SKILL=.claude/skills/stripe/SKILL.md"
fi

# Check for plan-based features
plan_count=$(grep -rli "plan\|tier\|subscription" apps/ libs/ --include="*.ts" 2>/dev/null | wc -l)
if [ "$plan_count" -gt 5 ]; then
    echo "PLANS_DETECTED=true COUNT=$plan_count"
    echo "  SKILL=.claude/skills/plan-based-features/SKILL.md"
fi

# Check for chart usage
chart_count=$(grep -rli "recharts\|chart\|graph" apps/ --include="*.tsx" 2>/dev/null | wc -l)
if [ "$chart_count" -gt 0 ]; then
    echo "CHARTS_DETECTED=true COUNT=$chart_count"
    echo "  SKILL=.claude/skills/ux-design/recharts-docs.md"
fi

# Check for table usage
table_count=$(grep -rli "tanstack.*table\|DataTable\|useReactTable" apps/ --include="*.tsx" 2>/dev/null | wc -l)
if [ "$table_count" -gt 0 ]; then
    echo "TABLES_DETECTED=true COUNT=$table_count"
    echo "  SKILL=.claude/skills/ux-design/tanstack-table-docs.md"
fi

echo ""
echo "========================================"
echo "DISCOVERY COMPLETE"
echo "========================================"
