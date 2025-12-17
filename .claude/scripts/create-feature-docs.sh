#!/bin/bash

# Script to create feature documentation structure, branch, and PR
# Usage: ./create-feature-docs.sh [branch-type] [feature-name] [--worktree]
#
# branch-type: feature, fix, refactor, docs (default: feature)
# feature-name: descriptive name (default: uses current branch)
# --worktree: create in isolated worktree instead of switching branches
#
# Examples:
#   ./create-feature-docs.sh feature user-authentication
#   ./create-feature-docs.sh feature user-authentication --worktree
#   ./create-feature-docs.sh fix
#   ./create-feature-docs.sh

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check for --worktree flag in any position
USE_WORKTREE=false
ARGS=()
for arg in "$@"; do
    if [[ "$arg" == "--worktree" ]] || [[ "$arg" == "-w" ]]; then
        USE_WORKTREE=true
    else
        ARGS+=("$arg")
    fi
done

# Get branch type (default: feature)
BRANCH_TYPE="${ARGS[0]:-feature}"

# Validate branch type
if [[ ! "$BRANCH_TYPE" =~ ^(feature|fix|refactor|docs)$ ]]; then
    echo -e "${RED}Error: Invalid branch type '$BRANCH_TYPE'${NC}"
    echo -e "${YELLOW}Valid types: feature, fix, refactor, docs${NC}"
    exit 1
fi

# Features directory
FEATURES_DIR="docs/features"

# Find the last feature number
LAST_FEATURE=$(ls -1 "$FEATURES_DIR" 2>/dev/null | grep -E '^F[0-9]{4}-' | sort -r | head -1 || echo "")

if [ -z "$LAST_FEATURE" ]; then
    # No features exist yet, start with F0001
    NEXT_NUMBER="0001"
    echo -e "${YELLOW}No existing features found. Starting with F0001${NC}"
else
    # Extract number from last feature (e.g., F0003 -> 0003)
    LAST_NUMBER=$(echo "$LAST_FEATURE" | grep -oE 'F[0-9]{4}' | grep -oE '[0-9]{4}')
    # Increment and format with leading zeros
    NEXT_NUMBER=$(printf "%04d" $((10#$LAST_NUMBER + 1)))
    echo -e "${GREEN}Last feature: ${LAST_FEATURE}${NC}"
fi

# Get current branch to check if we're on main
CURRENT_BRANCH=$(git branch --show-current)

# Get feature name
if [ -z "${ARGS[1]}" ]; then
    # No feature name provided
    if [[ "$CURRENT_BRANCH" == "main" ]] || [[ "$CURRENT_BRANCH" == "master" ]]; then
        echo -e "${RED}Error: You're on ${CURRENT_BRANCH} and no feature name was provided${NC}"
        echo -e "${YELLOW}Usage: ./create-feature-docs.sh [branch-type] [feature-name]${NC}"
        echo -e "${YELLOW}Example: ./create-feature-docs.sh feature user-authentication${NC}"
        exit 1
    else
        # Use current branch name (remove prefix if exists)
        FEATURE_NAME=$(echo "$CURRENT_BRANCH" | sed -E 's/^(feature|fix|refactor|docs)\///')
        echo -e "${BLUE}Using current branch name: ${FEATURE_NAME}${NC}"
    fi
else
    FEATURE_NAME="${ARGS[1]}"
    echo -e "${BLUE}Using provided feature name: ${FEATURE_NAME}${NC}"
fi

# Create feature directory name (F000X-feature-name)
FEATURE_DIR="F${NEXT_NUMBER}-${FEATURE_NAME}"
NEW_BRANCH_NAME="${BRANCH_TYPE}/F${NEXT_NUMBER}-${FEATURE_NAME}"
FEATURE_PATH="${FEATURES_DIR}/${FEATURE_DIR}"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Creating Feature: ${FEATURE_DIR}${NC}"
echo -e "${BLUE}Branch: ${NEW_BRANCH_NAME}${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Worktree directory
WORKTREE_DIR=".worktrees/${FEATURE_DIR}"
WORKTREE_PATH=""

# Create branch - either in worktree or regular checkout
if [[ "$USE_WORKTREE" == true ]]; then
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Creating ISOLATED WORKTREE${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    # Ensure .worktrees directory exists and is in .gitignore
    mkdir -p .worktrees
    if ! grep -q "^\.worktrees/" .gitignore 2>/dev/null; then
        echo ".worktrees/" >> .gitignore
        git add .gitignore
        git commit -m "chore: add .worktrees/ to gitignore" || true
    fi

    # Create worktree with new branch
    echo -e "${YELLOW}Creating worktree: ${WORKTREE_DIR}${NC}"
    git worktree add "$WORKTREE_DIR" -b "$NEW_BRANCH_NAME"
    WORKTREE_PATH="$(pwd)/${WORKTREE_DIR}"
    echo -e "${GREEN}✓ Worktree created at ${WORKTREE_PATH}${NC}"

    # Change to worktree directory for remaining operations
    cd "$WORKTREE_DIR"

elif [[ "$CURRENT_BRANCH" == "main" ]] || [[ "$CURRENT_BRANCH" == "master" ]]; then
    echo -e "${YELLOW}Creating new branch: ${NEW_BRANCH_NAME}${NC}"
    git checkout -b "$NEW_BRANCH_NAME"
    echo -e "${GREEN}✓ Branch created and checked out${NC}"
else
    echo -e "${YELLOW}Already on branch: ${CURRENT_BRANCH}${NC}"
    echo -e "${YELLOW}Warning: Branch name doesn't match pattern ${NEW_BRANCH_NAME}${NC}"
    echo -e "${YELLOW}Consider renaming: git branch -m ${NEW_BRANCH_NAME}${NC}"
fi

# Create directory
mkdir -p "$FEATURE_PATH"

# Get current date
CURRENT_DATE=$(date +%Y-%m-%d)

# Create about.md template
cat > "${FEATURE_PATH}/about.md" << 'EOF'
# Task: [Task Name]

**Branch:** BRANCH_NAME
**Date:** CURRENT_DATE

## Objective

[Clear description of main objective - 2-3 paragraphs explaining what this feature does and why it exists]

## Business Context

**Why this functionality is needed:**
[Explain the business need or opportunity]

**What problem it solves:**
[Describe the specific problem or pain point]

**Who are the stakeholders:**
[List stakeholders: end users, internal teams, external partners, etc.]

## Scope

### What IS included
- [Item 1: Specific functionality that will be implemented]
- [Item 2: Another included feature]
- [Item 3: etc.]

### What is NOT included (out of scope)
- [Item 1: Functionality explicitly excluded]
- [Item 2: Features postponed to future iterations]
- [Item 3: etc.]

## Business Rules

### Validations
1. **[Validation Name]**: [Detailed description of validation rule]
2. **[Validation Name]**: [Detailed description of validation rule]

### Flows

#### 1. Main Flow (Happy Path)
- Step 1: [User/System action]
- Step 2: [System response]
- Step 3: [Next action]
- Step 4: [Final outcome]

#### 2. Alternative Flows

**Scenario A: [Name]**
- [Description of alternative scenario]
- [How system should behave]

**Scenario B: [Name]**
- [Description of alternative scenario]
- [How system should behave]

#### 3. Error Flows

**Error Type 1: [Name]**
- Trigger: [What causes this error]
- Handling: [How to handle it]
- User feedback: [What user sees]

**Error Type 2: [Name]**
- Trigger: [What causes this error]
- Handling: [How to handle it]
- User feedback: [What user sees]

## Integrations

### External APIs
- **[API Name]**:
  - Purpose: [Why we need this API]
  - Endpoints: [Relevant endpoints]
  - Authentication: [How we authenticate]

### Internal Services
- **[Service Name]**:
  - Purpose: [How this service will be used]
  - Dependencies: [What this service depends on]

## Edge Cases Identified

1. **[Edge Case Name]**:
   - Description: [What is the edge case]
   - Handling: [How we handle it]

2. **[Edge Case Name]**:
   - Description: [What is the edge case]
   - Handling: [How we handle it]

## Acceptance Criteria

1. [ ] [Criterion 1 - must be measurable and testable]
2. [ ] [Criterion 2 - must be measurable and testable]
3. [ ] [Criterion 3 - must be measurable and testable]

## Next Steps

[Provide guidance for the Planning Agent about what needs to be designed/implemented]
EOF

# Create discovery.md template
cat > "${FEATURE_PATH}/discovery.md" << 'EOF'
# Discovery: [Task Name]

**Branch:** BRANCH_NAME
**Date:** CURRENT_DATE

## Initial Analysis

### Commit History

**Recent commits analyzed:**
```
[Paste git log output here]
```

**Key observations:**
- [Observation 1 about recent work]
- [Observation 2 about patterns in commits]

### Modified Files

**Files already modified in this branch:**
```
[Paste git diff --name-only output here]
```

**Analysis:**
- [File 1]: [What was changed and why]
- [File 2]: [What was changed and why]

### Related Functionalities

**Similar features in codebase:**
- [Feature 1]: [Location and how it's similar]
- [Feature 2]: [Location and how it's similar]

**Patterns identified:**
- [Pattern 1: How similar features are implemented]
- [Pattern 2: Common architectural approach]

## Strategic Questionnaire

### Category 1: Scope & Objective

**Q:** What is the main goal of this functionality?
**A:** [User response]

**Q:** Who are the users/systems that will interact with it?
**A:** [User response]

**Q:** What specific problem are we solving?
**A:** [User response]

### Category 2: Business Rules

**Q:** Are there specific validations or restrictions?
**A:** [User response]

**Q:** How should error cases be handled?
**A:** [User response]

**Q:** Are there dependencies on other functionalities?
**A:** [User response]

**Q:** Are there limits, quotas, or throttling to consider?
**A:** [User response]

### Category 3: Data & Integration

**Q:** What data needs to be persisted?
**A:** [User response]

**Q:** Are there external integrations (APIs, services)?
**A:** [User response]

**Q:** Are asynchronous processes necessary?
**A:** [User response]

### Category 4: Edge Cases & Failure Scenarios

**Q:** What happens in failure scenarios?
**A:** [User response]

**Q:** How to handle legacy data or migrations?
**A:** [User response]

**Q:** Are there performance or scalability concerns?
**A:** [User response]

**Q:** Are there specific security considerations?
**A:** [User response]

### Category 5: UI/UX (if applicable)

**Q:** How should the user experience be?
**A:** [User response]

**Q:** Are there specific loading/error states?
**A:** [User response]

**Q:** Are there responsiveness requirements?
**A:** [User response]

## Decisions and Clarifications

### Decision 1: [Topic]
**Context:** [Why this question/doubt arose during discovery]
**Decision:** [What was decided and by whom]
**Impact:** [Which areas/components are affected by this decision]
**Rationale:** [Why this decision makes sense]

### Decision 2: [Topic]
**Context:** [Why this question/doubt arose]
**Decision:** [What was decided]
**Impact:** [Affected areas]
**Rationale:** [Why this decision makes sense]

## Assumptions & Premises

1. **[Assumption 1]**: [Description and justification]
   - Impact if wrong: [What happens if this assumption is incorrect]

2. **[Assumption 2]**: [Description and justification]
   - Impact if wrong: [What happens if this assumption is incorrect]

## Edge Cases Identified

1. **[Edge Case Name]**:
   - Description: [Detailed description of the edge case]
   - Likelihood: [High/Medium/Low]
   - Handling Strategy: [How we plan to handle it]

2. **[Edge Case Name]**:
   - Description: [Detailed description]
   - Likelihood: [High/Medium/Low]
   - Handling Strategy: [How we plan to handle it]

## Out of Scope Items

1. **[Item Name]** - [Detailed explanation of why it's out of scope]
2. **[Item Name]** - [Detailed explanation of why it's out of scope]

## References

### Codebase Files Consulted
- [File path 1]: [What was learned from it]
- [File path 2]: [What was learned from it]

### Documentation Consulted
- [Document name/path]: [Key insights]
- [Document name/path]: [Key insights]

### Related Functionalities
- [Feature name]: [Location and relevance]
- [Feature name]: [Location and relevance]

## Summary for Planning

**Executive Summary:**
[2-3 paragraphs summarizing the entire discovery process, key decisions, and what the Planning Agent needs to focus on]

**Critical Requirements:**
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

**Technical Constraints:**
- [Constraint 1]
- [Constraint 2]

**Next Phase Focus:**
[What the Planning Agent should prioritize in the technical design]
EOF

# Replace placeholders with actual values (using | as delimiter to avoid conflicts with / in branch names)
sed -i "s|BRANCH_NAME|${NEW_BRANCH_NAME}|g" "${FEATURE_PATH}/about.md"
sed -i "s|CURRENT_DATE|${CURRENT_DATE}|g" "${FEATURE_PATH}/about.md"
sed -i "s|BRANCH_NAME|${NEW_BRANCH_NAME}|g" "${FEATURE_PATH}/discovery.md"
sed -i "s|CURRENT_DATE|${CURRENT_DATE}|g" "${FEATURE_PATH}/discovery.md"

echo -e "${GREEN}✓ Created directory: ${FEATURE_PATH}${NC}"
echo -e "${GREEN}✓ Created file: ${FEATURE_PATH}/about.md${NC}"
echo -e "${GREEN}✓ Created file: ${FEATURE_PATH}/discovery.md${NC}"

# Commit the initial structure
echo ""
echo -e "${BLUE}Creating initial commit...${NC}"
git add "${FEATURE_PATH}/"
git commit -m "feat: initialize ${FEATURE_DIR} - discovery phase

Created feature documentation structure for ${FEATURE_NAME}.

📁 Structure:
- docs/features/${FEATURE_DIR}/about.md - Feature specification template
- docs/features/${FEATURE_DIR}/discovery.md - Discovery process template

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

echo -e "${GREEN}✓ Initial commit created${NC}"

# Push to origin
echo ""
echo -e "${BLUE}Pushing branch to origin...${NC}"
PUSH_OUTPUT=$(git push -u origin "$NEW_BRANCH_NAME" 2>&1)
echo "$PUSH_OUTPUT"

# Extract PR/MR URL from push output
PR_URL=""

# GitHub pattern
if echo "$PUSH_OUTPUT" | grep -q "github.com"; then
    PR_URL=$(echo "$PUSH_OUTPUT" | grep -oP 'https://github\.com/[^\s]+' | head -1)
fi

# GitLab pattern
if echo "$PUSH_OUTPUT" | grep -q "gitlab.com"; then
    PR_URL=$(echo "$PUSH_OUTPUT" | grep -oP 'https://gitlab\.com/[^\s]+' | head -1)
fi

# Create git-pr.md with PR/MR link
if [ -n "$PR_URL" ]; then
    cat > "${FEATURE_PATH}/git-pr.md" << EOF
# Pull Request / Merge Request

**Branch:** \`${NEW_BRANCH_NAME}\`
**Feature:** ${FEATURE_DIR}
**Created:** ${CURRENT_DATE}

## PR/MR Link

${PR_URL}

## Status

- [ ] Draft
- [ ] Ready for Review
- [ ] Approved
- [ ] Merged

## Notes

[Add any relevant notes about the PR/MR here]
EOF

    echo -e "${GREEN}✓ Created ${FEATURE_PATH}/git-pr.md${NC}"
    echo -e "${BLUE}PR/MR URL: ${PR_URL}${NC}"

    # Commit git-pr.md
    git add "${FEATURE_PATH}/git-pr.md"
    git commit -m "docs: add PR/MR link to ${FEATURE_DIR}

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
    git push
else
    echo -e "${YELLOW}⚠ Could not extract PR/MR URL from push output${NC}"
    echo -e "${YELLOW}You can manually create the PR/MR and add the link to git-pr.md${NC}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Feature structure created successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📁 Feature Directory: ${FEATURE_PATH}/${NC}"
echo -e "${BLUE}🌿 Branch: ${NEW_BRANCH_NAME}${NC}"
if [ -n "$PR_URL" ]; then
    echo -e "${BLUE}🔗 PR/MR: ${PR_URL}${NC}"
fi

# Worktree-specific output and VSCode launch
if [[ "$USE_WORKTREE" == true ]] && [ -n "$WORKTREE_PATH" ]; then
    # Go back to original directory to get absolute path
    cd - > /dev/null
    ABSOLUTE_WORKTREE_PATH="$(cd "$WORKTREE_DIR" && pwd)"

    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🌿 WORKTREE ISOLADA CRIADA${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📁 Worktree: ${ABSOLUTE_WORKTREE_PATH}${NC}"
    echo ""
    echo -e "${YELLOW}Abrindo VSCode no diretório da worktree...${NC}"
    code "$ABSOLUTE_WORKTREE_PATH"
    echo -e "${GREEN}✓ VSCode aberto!${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
    echo -e "  Continue o desenvolvimento no NOVO VSCode que acabou de abrir!"
    echo -e "  Este VSCode (atual) permanece no workspace principal."
    echo ""
    echo -e "${YELLOW}No novo VSCode, execute:${NC}"
    echo -e "  /plan     - Para planejamento técnico"
    echo -e "  /dev      - Para implementação acompanhada"
    echo -e "  /autopilot - Para implementação autônoma"
    echo -e "  /done     - Para finalizar e fazer merge"
else
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "  1. Use /feature command to complete discovery process"
    echo -e "  2. Fill in about.md and discovery.md templates"
    echo -e "  3. Use /plan command to create technical plan"
    echo -e "  4. Use /dev command to start development"
fi
echo ""

# === STRUCTURED OUTPUT FOR AGENT ===
echo "========================================"
echo "RESULT"
echo "========================================"
echo "STATUS: SUCCESS"
echo "FEATURE_ID: F${NEXT_NUMBER}-${FEATURE_NAME}"
echo "BRANCH_NAME: ${NEW_BRANCH_NAME}"
echo "BRANCH_TYPE: ${BRANCH_TYPE}"
echo "FEATURE_PATH: ${FEATURE_PATH}"
echo ""
echo "FILES_CREATED:"
echo "  - ${FEATURE_PATH}/about.md"
echo "  - ${FEATURE_PATH}/discovery.md"
if [ -n "$PR_URL" ]; then
    echo "  - ${FEATURE_PATH}/git-pr.md"
    echo "PR_URL: ${PR_URL}"
fi
echo ""
# Worktree-specific structured output
if [[ "$USE_WORKTREE" == true ]]; then
    echo "WORKTREE_CREATED: true"
    echo "WORKTREE_PATH: ${ABSOLUTE_WORKTREE_PATH:-$WORKTREE_PATH}"
    echo "VSCODE_OPENED: true"
    echo ""
    echo "NEXT_STEPS:"
    echo "  1. Continue no VSCode que foi aberto na worktree"
    echo "  2. Execute /plan, /dev ou /autopilot no novo VSCode"
    echo "  3. Use /done para finalizar e fazer merge"
    echo ""
    echo "IMPORTANT: Development continues in the NEW VSCode window!"
else
    echo "WORKTREE_CREATED: false"
fi
echo ""
echo "DOCUMENTS_TO_FILL:"
echo "  - about.md: Objective, Scope, Business Rules, Acceptance Criteria"
echo "  - discovery.md: Analysis, Questionnaire, Decisions, Assumptions"
echo ""
echo "FEATURE_PHASE: DISCOVERY"
if [[ "$USE_WORKTREE" == true ]]; then
    echo "NEXT_ACTION: Continue in the new VSCode window"
else
    echo "NEXT_COMMAND: /feature"
fi
echo "========================================"
