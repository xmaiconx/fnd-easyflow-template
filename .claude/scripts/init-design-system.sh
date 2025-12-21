#!/bin/bash

# =============================================================================
# Init Design System
# Creates a design system foundation template for NEW projects
# Follows hybrid documentation style (human-readable + token-efficient)
# =============================================================================

set -e

DESIGN_DIR="docs/design-system"
FOUNDATIONS_FILE="$DESIGN_DIR/foundations.md"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Design System Initializer ===${NC}"
echo ""

# Check if already exists
if [ -f "$FOUNDATIONS_FILE" ]; then
    echo -e "${YELLOW}⚠️  Design system already exists at $FOUNDATIONS_FILE${NC}"
    echo "Use /design command to update based on project analysis."
    exit 0
fi

# Detect frontend location
FRONTEND_PATH=""
if [ -d "apps/frontend/src" ]; then
    FRONTEND_PATH="apps/frontend"
elif [ -d "frontend/src" ]; then
    FRONTEND_PATH="frontend"
elif [ -d "src" ]; then
    FRONTEND_PATH="."
else
    echo -e "${YELLOW}⚠️  No frontend detected. Creating minimal template.${NC}"
fi

# Detect stack from package.json
FRAMEWORK="unknown"
UI_LIBRARY="unknown"
BUNDLER="unknown"

if [ -n "$FRONTEND_PATH" ] && [ -f "$FRONTEND_PATH/package.json" ]; then
    PKG_JSON="$FRONTEND_PATH/package.json"

    # Detect framework
    if grep -q '"react"' "$PKG_JSON"; then
        FRAMEWORK="React"
    elif grep -q '"vue"' "$PKG_JSON"; then
        FRAMEWORK="Vue"
    elif grep -q '"svelte"' "$PKG_JSON"; then
        FRAMEWORK="Svelte"
    fi

    # Detect UI library
    if grep -q '"tailwindcss"' "$PKG_JSON"; then
        UI_LIBRARY="Tailwind"
    elif grep -q '"@mui/material"' "$PKG_JSON"; then
        UI_LIBRARY="MUI"
    elif grep -q '"@chakra-ui"' "$PKG_JSON"; then
        UI_LIBRARY="Chakra"
    fi

    # Detect bundler
    if grep -q '"vite"' "$PKG_JSON"; then
        BUNDLER="Vite"
    elif grep -q '"next"' "$PKG_JSON"; then
        BUNDLER="Next.js"
    elif grep -q '"webpack"' "$PKG_JSON"; then
        BUNDLER="Webpack"
    fi
fi

echo -e "${GREEN}Detected:${NC}"
echo "  Framework: $FRAMEWORK"
echo "  UI Library: $UI_LIBRARY"
echo "  Bundler: $BUNDLER"
echo ""

# Create directory
mkdir -p "$DESIGN_DIR"

# Generate date
GENERATED_DATE=$(date +%Y-%m-%d)

# Generate foundations with hybrid structure
cat > "$FOUNDATIONS_FILE" << EOF
# Design System Foundations

Template inicial do design system. Mobile-first: design para 320px, escala para cima. Execute \`/design\` para enriquecer com dados reais do projeto.

**Stack:** $FRAMEWORK + $UI_LIBRARY + $BUNDLER

---

## Spec (Token-Efficient)

### Context
{"stack":"$FRAMEWORK","uiLibrary":"$UI_LIBRARY","bundler":"$BUNDLER","generated":"$GENERATED_DATE","status":"template"}

### Breakpoints
{"mobile":"320px-767px (DEFAULT)","tablet":"768px-1023px (md:)","desktop":"1024px+ (lg:)"}

### Spacing
{"scale":{"1":"0.25rem (4px)","2":"0.5rem (8px)","4":"1rem (16px)","6":"1.5rem (24px)","8":"2rem (32px)"}}

### Typography
{"fonts":{"sans":"[to be detected]","mono":"[to be detected]"},"scale":{"sm":"0.875rem","base":"1rem","lg":"1.125rem","xl":"1.25rem","2xl":"1.5rem"}}

### Colors
{"tokens":["--primary","--secondary","--destructive","--muted","--background","--foreground","--border"]}

### Components Inventory
{"ui":"[to be mapped by /design]","feature":"[to be mapped by /design]"}

### Conventions
{"naming":"[to be detected]","exports":"[to be detected]","propsStyle":"[to be detected]"}

### Mobile Checklist
["Touch targets 44px min","Input font 16px+","Focus visible (ring-2)","Contrast WCAG AA","Reduced motion support"]

---

## Notes

Este arquivo é um template inicial. O comando \`/design\` irá:
1. Analisar a estrutura real do frontend
2. Extrair tokens do CSS/Tailwind
3. Mapear componentes existentes
4. Atualizar este arquivo com dados reais
EOF

echo ""
echo -e "${GREEN}✅ Design system template created at $FOUNDATIONS_FILE${NC}"
echo ""
echo "Next steps:"
echo "  1. Run /design when working on a feature"
echo "  2. The analysis will enrich this template with real data"
