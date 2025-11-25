#!/bin/bash

# Script to create hotfix documentation structure (simplified for urgent fixes)
# Usage: ./create-hotfix-docs.sh [hotfix-name]
#
# hotfix-name: descriptive name for the fix (required)
#
# Examples:
#   ./create-hotfix-docs.sh login-validation-error
#   ./create-hotfix-docs.sh payment-timeout

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if hotfix name was provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Hotfix name is required${NC}"
    echo -e "${YELLOW}Usage: ./create-hotfix-docs.sh [hotfix-name]${NC}"
    echo -e "${YELLOW}Example: ./create-hotfix-docs.sh login-validation-error${NC}"
    exit 1
fi

HOTFIX_NAME="$1"

# Features directory
FEATURES_DIR="docs/features"

# Find the last feature number
LAST_FEATURE=$(ls -1 "$FEATURES_DIR" 2>/dev/null | grep -E '^F[0-9]{4}-' | sort -r | head -1 || echo "")

if [ -z "$LAST_FEATURE" ]; then
    NEXT_NUMBER="0001"
    echo -e "${YELLOW}No existing features found. Starting with F0001${NC}"
else
    LAST_NUMBER=$(echo "$LAST_FEATURE" | grep -oE 'F[0-9]{4}' | grep -oE '[0-9]{4}')
    NEXT_NUMBER=$(printf "%04d" $((10#$LAST_NUMBER + 1)))
    echo -e "${GREEN}Last feature: ${LAST_FEATURE}${NC}"
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

# Create identifiers
HOTFIX_DIR="F${NEXT_NUMBER}-${HOTFIX_NAME}"
NEW_BRANCH_NAME="fix/F${NEXT_NUMBER}-${HOTFIX_NAME}"
HOTFIX_PATH="${FEATURES_DIR}/${HOTFIX_DIR}"

echo ""
echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${RED}🔥 HOTFIX: ${HOTFIX_DIR}${NC}"
echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Create branch if on main/master
if [[ "$CURRENT_BRANCH" == "main" ]] || [[ "$CURRENT_BRANCH" == "master" ]]; then
    echo -e "${YELLOW}Creating hotfix branch: ${NEW_BRANCH_NAME}${NC}"
    git checkout -b "$NEW_BRANCH_NAME"
    echo -e "${GREEN}✓ Branch created and checked out${NC}"
else
    echo -e "${YELLOW}Already on branch: ${CURRENT_BRANCH}${NC}"
    echo -e "${YELLOW}Warning: Not on main/master. Creating hotfix from current branch.${NC}"
    git checkout -b "$NEW_BRANCH_NAME"
    echo -e "${GREEN}✓ Branch created from ${CURRENT_BRANCH}${NC}"
fi

# Create directory
mkdir -p "$HOTFIX_PATH"

# Get current date and time
CURRENT_DATETIME=$(date +"%Y-%m-%d %H:%M")

# Create simplified about.md for hotfix
cat > "${HOTFIX_PATH}/about.md" << EOF
# 🔥 Hotfix: [Bug Title]

**Branch:** ${NEW_BRANCH_NAME}
**Created:** ${CURRENT_DATETIME}
**Priority:** 🔴 High (Hotfix)

---

## Problem Description

**What is happening:**
[Describe the bug/issue in 2-3 sentences]

**Expected behavior:**
[What should happen instead]

**Impact:**
- [ ] Production affected
- [ ] Users blocked
- [ ] Data integrity risk
- [ ] Performance degradation
- [ ] Security concern

**Affected area:**
- [ ] Frontend
- [ ] Backend API
- [ ] Workers/Jobs
- [ ] Database
- [ ] External Integration

---

## Investigation

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Bug occurs]

### Error Messages / Logs
\`\`\`
[Paste relevant error messages or logs here]
\`\`\`

### Root Cause Analysis
[To be filled during investigation - explain WHY the bug occurs]

---

## Solution

### Approach
[Brief description of how to fix - 2-3 sentences]

### Files to Modify
- \`[file path]\` - [what needs to change]
- \`[file path]\` - [what needs to change]

### Changes Made
[To be filled after implementation]

---

## Verification

### Testing Checklist
- [ ] Bug no longer reproduces
- [ ] Related functionality still works
- [ ] No new errors in logs
- [ ] Build passes

### Regression Check
- [ ] [Related feature 1] still works
- [ ] [Related feature 2] still works

---

## Notes

[Any additional notes, workarounds, or follow-up items]
EOF

# Replace placeholder
sed -i "s/BRANCH_NAME/${NEW_BRANCH_NAME}/g" "${HOTFIX_PATH}/about.md"

echo -e "${GREEN}✓ Created directory: ${HOTFIX_PATH}${NC}"
echo -e "${GREEN}✓ Created file: ${HOTFIX_PATH}/about.md${NC}"

# Commit the initial structure
echo ""
echo -e "${BLUE}Creating initial commit...${NC}"
git add "${HOTFIX_PATH}/"
git commit -m "fix: initialize hotfix ${HOTFIX_DIR}

🔥 Hotfix for: ${HOTFIX_NAME}

📁 Structure:
- docs/features/${HOTFIX_DIR}/about.md - Hotfix documentation

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

echo -e "${GREEN}✓ Initial commit created${NC}"

# Push to origin
echo ""
echo -e "${BLUE}Pushing branch to origin...${NC}"
PUSH_OUTPUT=$(git push -u origin "$NEW_BRANCH_NAME" 2>&1)
echo "$PUSH_OUTPUT"

echo ""
echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Hotfix structure created!${NC}"
echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📁 Hotfix Directory: ${HOTFIX_PATH}/${NC}"
echo -e "${BLUE}🌿 Branch: ${NEW_BRANCH_NAME}${NC}"
echo ""
echo -e "${YELLOW}Next: Investigate the issue and implement the fix${NC}"
echo ""
