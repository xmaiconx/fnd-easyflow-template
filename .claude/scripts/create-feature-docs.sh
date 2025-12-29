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

[2-3 parágrafos explicando O QUE esta feature faz e POR QUE existe. Foco no valor entregue ao usuário.]

---

## Business Context

**Why:** [Necessidade de negócio ou oportunidade]

**Problem:** [Problema específico ou dor do usuário]

**Stakeholders:** [Usuários finais, times internos, parceiros externos]

---

## Scope

### Included
- [Funcionalidade 1]
- [Funcionalidade 2]

### Not Included (out of scope)
- [Funcionalidade explicitamente excluída + motivo breve]
- [Feature adiada para futuras iterações]

---

## Business Rules

### Validations
1. **[Nome]**: [Descrição da regra]
2. **[Nome]**: [Descrição da regra]

### Flows

#### Main Flow (Happy Path)
1. [Ação usuário/sistema]
2. [Resposta do sistema]
3. [Próxima ação]
4. [Resultado final]

#### Alternative Flows

**Scenario A: [Nome]**
[Descrição + comportamento esperado]

**Scenario B: [Nome]**
[Descrição + comportamento esperado]

#### Error Flows

**Error: [Nome]**
- Trigger: [O que causa]
- Handling: [Como tratar]
- User feedback: [O que usuário vê]

---

## Strategic Questionnaire

### Scope & Objective

**Q:** Objetivo principal?
**A:** [Resposta]

**Q:** Usuários/sistemas que interagem?
**A:** [Resposta]

**Q:** Problema sendo resolvido?
**A:** [Resposta]

### Business Rules

**Q:** Validações específicas?
**A:** [Resposta]

**Q:** Tratamento de erros?
**A:** [Resposta]

**Q:** Dependências de outras funcionalidades?
**A:** [Resposta]

**Q:** Limites/quotas?
**A:** [Resposta]

### Data & Integration

**Q:** Dados a persistir?
**A:** [Resposta]

**Q:** Integrações externas?
**A:** [Resposta]

**Q:** Processamento assíncrono necessário?
**A:** [Resposta]

### Edge Cases & Failures

**Q:** Cenários de falha?
**A:** [Resposta]

**Q:** Dados legados/migração?
**A:** [Resposta]

**Q:** Considerações de performance?
**A:** [Resposta]

**Q:** Segurança?
**A:** [Resposta]

### UI/UX (if applicable)

**Q:** Tipo de interface?
**A:** [Resposta]

**Q:** Estados de loading/erro?
**A:** [Resposta]

---

## Decisions

### Decision 1: [Tópico]
**Context:** [Por que surgiu]
**Decision:** [O que foi decidido]
**Rationale:** [Por que faz sentido]

### Decision 2: [Tópico]
**Context:** [Por que surgiu]
**Decision:** [O que foi decidido]
**Rationale:** [Por que faz sentido]

---

## Edge Cases

1. **[Nome]**: [Descrição] → [Estratégia de tratamento]
2. **[Nome]**: [Descrição] → [Estratégia de tratamento]

---

## Acceptance Criteria

1. [ ] [Critério mensurável e testável]
2. [ ] [Critério mensurável e testável]
3. [ ] [Critério mensurável e testável]

---

## Spec (Token-Efficient)

### Architecture
{"component":"[nome]","pattern":"[padrão]","dependencies":["dep1","dep2"]}

### Data Model
{"entities":["Entity1","Entity2"],"newFields":{"Entity":"field:type"}}

### API (if applicable)
{"endpoints":[{"method":"POST","path":"/api/v1/...","auth":"JWT"}]}

---

## Next Steps

[Orientação para o Planning Agent sobre o que precisa ser projetado/implementado]
EOF

# Create discovery.md template
cat > "${FEATURE_PATH}/discovery.md" << 'EOF'
# Discovery: [Task Name]

**Branch:** BRANCH_NAME
**Date:** CURRENT_DATE

Análise técnica do codebase para identificar o que já existe e pode ser reutilizado.

---

## Codebase Analysis

### Commit History

```
[git log --oneline -10]
```

**Observations:** [Padrões recentes, contexto do desenvolvimento]

### Related Files

| Arquivo | Relevância |
|---------|------------|
| [path/to/file.ts] | [Por que é relevante] |
| [path/to/file.ts] | [Por que é relevante] |

### Similar Features

| Feature | Localização | Padrão Utilizado |
|---------|-------------|------------------|
| [Nome] | [path/] | [Padrão identificado] |
| [Nome] | [path/] | [Padrão identificado] |

### Patterns Identified

- **[Padrão 1]**: [Como é implementado no codebase]
- **[Padrão 2]**: [Como é implementado no codebase]

---

## Technical Context

### Infrastructure Available

| Recurso | Status | Localização |
|---------|--------|-------------|
| Redis | [Configurado/Não] | [path/to/provider.ts] |
| Queue (BullMQ) | [Configurado/Não] | [path/to/adapter.ts] |
| [Outro] | [Status] | [path/] |

### Dependencies

**Already installed:**
- [package@version] - [uso atual]

**To install:**
- [package@version] - [motivo]

### Integration Points

| Componente | Arquivo | Tipo de Integração |
|------------|---------|-------------------|
| [Componente] | [path/to/file.ts:line] | [Como conectar] |
| [Componente] | [path/to/file.ts:line] | [Como conectar] |

---

## Files Mapping

### To Create

| Arquivo | Propósito |
|---------|-----------|
| [path/to/new-file.ts] | [O que faz] |
| [path/to/new-file.ts] | [O que faz] |

### To Modify

| Arquivo | Modificação |
|---------|-------------|
| [path/to/existing.ts:line] | [O que mudar] |
| [path/to/existing.ts:line] | [O que mudar] |

---

## Technical Assumptions

1. **[Premissa]**: [Descrição]
   - Impact if wrong: [Consequência]

2. **[Premissa]**: [Descrição]
   - Impact if wrong: [Consequência]

---

## References

### Files Consulted

| Arquivo | Insight |
|---------|---------|
| [path/to/file.ts] | [O que aprendemos] |
| [path/to/file.ts] | [O que aprendemos] |

### Documentation

- [doc/path.md] - [Insight relevante]
- [CLAUDE.md section] - [Insight relevante]

### Related Features

- [F000X-feature-name] - [Relevância]

---

## Summary for Planning

**Executive Summary:**
[2-3 parágrafos resumindo o que foi descoberto no codebase, padrões a seguir, e pontos de integração]

**Key Technical Decisions:**
- [Decisão 1 baseada na análise do código]
- [Decisão 2 baseada na análise do código]

**Critical Files:**
- [Arquivo mais importante a modificar]
- [Arquivo mais importante a criar]

**Next Phase Focus:**
[O que o Planning Agent deve priorizar com base nesta análise]
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
