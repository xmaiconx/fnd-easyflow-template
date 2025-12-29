#!/bin/bash
# Script: detect-project-structure.sh
# Purpose: Detect project structure dynamically for agent consumption
# Usage: bash .claude/scripts/detect-project-structure.sh
# Consumer: /fnd-builder agent

set -e

echo "=== PROJECT_STRUCTURE ==="

# Project root
PROJECT_ROOT="$(pwd)"
command -v git >/dev/null 2>&1 && git rev-parse --show-toplevel >/dev/null 2>&1 && PROJECT_ROOT=$(git rev-parse --show-toplevel)
echo "ROOT:$PROJECT_ROOT"

# Project name
PROJECT_NAME=$(basename "$PROJECT_ROOT")
[ -f "$PROJECT_ROOT/package.json" ] && PROJECT_NAME=$(grep -o '"name"[[:space:]]*:[[:space:]]*"[^"]*"' "$PROJECT_ROOT/package.json" 2>/dev/null | head -1 | sed 's/"name"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/' || echo "$PROJECT_NAME")
echo "NAME:$PROJECT_NAME"

# Git
echo "GIT:$(git rev-parse --git-dir >/dev/null 2>&1 && echo "YES" || echo "NO")"

# Monorepo detection
MONOREPO="NO"
MONOREPO_TOOL="none"
[ -f "$PROJECT_ROOT/lerna.json" ] && MONOREPO="YES" && MONOREPO_TOOL="lerna"
[ -f "$PROJECT_ROOT/pnpm-workspace.yaml" ] && MONOREPO="YES" && MONOREPO_TOOL="pnpm"
[ -f "$PROJECT_ROOT/turbo.json" ] && MONOREPO="YES" && MONOREPO_TOOL="turbo"
[ -f "$PROJECT_ROOT/nx.json" ] && MONOREPO="YES" && MONOREPO_TOOL="nx"
[ -f "$PROJECT_ROOT/package.json" ] && grep -q '"workspaces"' "$PROJECT_ROOT/package.json" 2>/dev/null && MONOREPO="YES" && [ "$MONOREPO_TOOL" = "none" ] && MONOREPO_TOOL="npm-workspaces"
echo "MONOREPO:$MONOREPO"
echo "MONOREPO_TOOL:$MONOREPO_TOOL"

# Stack detection
STACK="unknown"
[ -f "$PROJECT_ROOT/package.json" ] && STACK="nodejs"
[ -f "$PROJECT_ROOT/requirements.txt" ] || [ -f "$PROJECT_ROOT/pyproject.toml" ] && STACK="python"
[ -f "$PROJECT_ROOT/Cargo.toml" ] && STACK="rust"
[ -f "$PROJECT_ROOT/go.mod" ] && STACK="go"
[ -f "$PROJECT_ROOT/pom.xml" ] || [ -f "$PROJECT_ROOT/build.gradle" ] && STACK="java"
[ -f "$PROJECT_ROOT/Gemfile" ] && STACK="ruby"
[ -f "$PROJECT_ROOT/composer.json" ] && STACK="php"
echo "STACK:$STACK"

# Framework detection (Node.js)
BACKEND="unknown"
FRONTEND="unknown"
if [ -f "$PROJECT_ROOT/package.json" ]; then
    PKG=$(cat "$PROJECT_ROOT/package.json" 2>/dev/null)
    echo "$PKG" | grep -q '"@nestjs/core"' && BACKEND="nestjs"
    echo "$PKG" | grep -q '"express"' && [ "$BACKEND" = "unknown" ] && BACKEND="express"
    echo "$PKG" | grep -q '"fastify"' && [ "$BACKEND" = "unknown" ] && BACKEND="fastify"
    echo "$PKG" | grep -q '"hono"' && [ "$BACKEND" = "unknown" ] && BACKEND="hono"
    echo "$PKG" | grep -q '"next"' && FRONTEND="nextjs"
    echo "$PKG" | grep -q '"nuxt"' && FRONTEND="nuxtjs"
    echo "$PKG" | grep -q '"react"' && [ "$FRONTEND" = "unknown" ] && FRONTEND="react"
    echo "$PKG" | grep -q '"vue"' && [ "$FRONTEND" = "unknown" ] && FRONTEND="vue"
    echo "$PKG" | grep -q '"svelte"' && [ "$FRONTEND" = "unknown" ] && FRONTEND="svelte"
    echo "$PKG" | grep -q '"@angular/core"' && [ "$FRONTEND" = "unknown" ] && FRONTEND="angular"
fi
echo "BACKEND:$BACKEND"
echo "FRONTEND:$FRONTEND"

# Database/ORM detection
DB="unknown"
ORM="unknown"
if [ -f "$PROJECT_ROOT/package.json" ]; then
    PKG=$(cat "$PROJECT_ROOT/package.json" 2>/dev/null)
    echo "$PKG" | grep -q '"prisma"' && ORM="prisma"
    echo "$PKG" | grep -q '"typeorm"' && ORM="typeorm"
    echo "$PKG" | grep -q '"kysely"' && ORM="kysely"
    echo "$PKG" | grep -q '"drizzle-orm"' && ORM="drizzle"
    echo "$PKG" | grep -q '"sequelize"' && ORM="sequelize"
    echo "$PKG" | grep -q '"pg"' && DB="postgresql"
    echo "$PKG" | grep -q '"mysql2"' && DB="mysql"
    echo "$PKG" | grep -q '"mongodb"' && DB="mongodb"
fi
echo "DATABASE:$DB"
echo "ORM:$ORM"

# Key directories
echo "=== DIRECTORIES ==="
for dir in src lib app apps packages modules test tests docs config infra .claude; do
    [ -d "$PROJECT_ROOT/$dir" ] && echo "DIR:$dir"
done

# Monorepo packages
if [ "$MONOREPO" = "YES" ]; then
    echo "=== PACKAGES ==="
    for pkg_dir in apps packages libs modules services; do
        [ -d "$PROJECT_ROOT/$pkg_dir" ] && ls -1 "$PROJECT_ROOT/$pkg_dir" 2>/dev/null | while read pkg; do
            [ -d "$PROJECT_ROOT/$pkg_dir/$pkg" ] && echo "PKG:$pkg_dir/$pkg"
        done
    done
fi

# FND ecosystem
echo "=== FND ==="
echo "HAS_CLAUDE:$([ -d "$PROJECT_ROOT/.claude" ] && echo "YES" || echo "NO")"
echo "HAS_CLAUDE_MD:$([ -f "$PROJECT_ROOT/CLAUDE.md" ] && echo "YES" || echo "NO")"
echo "HAS_PRODUCT:$([ -f "$PROJECT_ROOT/docs/product.md" ] && echo "YES" || echo "NO")"
echo "HAS_FEATURES:$([ -d "$PROJECT_ROOT/docs/features" ] && echo "YES" || echo "NO")"
[ -d "$PROJECT_ROOT/docs/features" ] && echo "FEATURE_COUNT:$(ls -1 "$PROJECT_ROOT/docs/features" 2>/dev/null | grep -cE '^F[0-9]{4}-' || echo "0")"

echo "=== END ==="
