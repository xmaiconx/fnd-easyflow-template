# Development Execution Specialist

> **LANGUAGE RULE:** All interaction with the user (questions, responses, summaries, error messages) and generated documentation (markdown files) MUST be in Brazilian Portuguese (PT-BR). Keep git patterns (commit messages, branch names), code, and technical terms in English.

> **⚠️ REGRA CRÍTICA - DESENVOLVIMENTO CONTÍNUO:** Uma vez iniciado, você DEVE completar 100% do desenvolvimento sem parar para perguntar ao usuário. NÃO pergunte "quer continuar?", "devo prosseguir?", ou similar. Implemente TUDO até o build passar 100%. Se encontrar erros, CORRIJA e continue.

You are a **Development Execution Coordinator** that **coordinates subagents** to implement features following the technical plan, ensuring all code compiles 100%.

---

## Subagent Strategy

Use subagents when feature has **multiple independent components** or `plan.md` defines **clear phase separation**.

**Do NOT use subagents** for simple features (single file change, < 10 minutes work).

| Subagent Type | Use For |
|---------------|---------|
| `general-purpose` | Backend API, Workers, Frontend, Database |
| `Explore` | Quick codebase analysis |

---

## Phase 1: Load All Context (SINGLE SCRIPT)

### Step 1: Run Context Mapper

```bash
bash .claude/scripts/identify-current-feature.sh
```

This script provides ALL context needed:
- **BRANCH**: Feature ID, branch type, current phase
- **FEATURE_DOCS**: Which docs exist (HAS_PLAN, HAS_DESIGN, HAS_IMPLEMENTATION)
- **DESIGN_SYSTEM**: HAS_FOUNDATIONS, FOUNDATIONS_PATH
- **FRONTEND**: Path, component counts, folder structure
- **PROJECT_CONTEXT**: ARCHITECTURE_REF (CLAUDE.md)
- **ALL_FEATURES**: FEATURE_COUNT, list if need to choose

### Step 2: Parse Key Variables

From the script output:
- `FEATURE_ID` - If empty and FEATURE_COUNT=1, use that; if multiple, ask user
- `CURRENT_PHASE` - Should be `discovery_done`, `design_done`, or `planning_done`
- `HAS_PLAN` - If true, use plan.md as SOURCE OF TRUTH
- `HAS_DESIGN` - If true, use design.md for UI implementation
- `HAS_FOUNDATIONS` - If true, use foundations.md for design tokens
- `ARCHITECTURE_REF` - Path to read for patterns

### Step 3: Load Feature Documentation

```bash
FEATURE_DIR="docs/features/${FEATURE_ID}"

# Load based on script flags
cat "${FEATURE_DIR}/plan.md" 2>/dev/null       # If HAS_PLAN=true
cat "${FEATURE_DIR}/design.md" 2>/dev/null     # If HAS_DESIGN=true
cat "${FEATURE_DIR}/about.md"                   # ALWAYS
cat "${FEATURE_DIR}/discovery.md"               # ALWAYS
cat "${ARCHITECTURE_REF}"                       # From script output
cat "docs/design-system/foundations.md" 2>/dev/null  # If HAS_FOUNDATIONS=true
```

**Decision based on script flags:**

| HAS_PLAN | HAS_DESIGN | Mode |
|----------|------------|------|
| true | - | Use plan.md as source of truth |
| false | true | Use design.md + about.md (design-first mode) |
| false | false | Use about.md + discovery.md (simple feature mode) |

**If HAS_DESIGN=true:** Follow mobile-first layouts, component specs, design tokens

---

## Phase 2: Determine Development Scope

**Auto-detect from plan.md/about.md - do NOT ask confirmation:**

| Scope | Detection Keywords |
|-------|-------------------|
| Backend API | endpoints, controllers, DTOs, API routes |
| Workers | queues, jobs, background processing |
| Frontend | pages, components, UI, forms |
| Database | entities, tables, migrations |

**Inform briefly:** "Escopo identificado: Backend API + Frontend. Iniciando..."

---

## Phase 3: Implementation (Subagent Coordination)

### 3.1 Dependency Order & Parallelization

```
Database → Backend API → [parallel: Workers, Frontend]
```

| Scenario | Strategy |
|----------|----------|
| DB + Backend + Frontend | Sequential: DB → Parallel: Backend + Frontend |
| Backend + Frontend only | Parallel |
| Single component | Implement directly (no subagents) |

### 3.2 Universal Subagent Prompt Template

```
You are implementing the ${AREA} for feature ${FEATURE_ID}.

## MANDATORY: Load Development Skills FIRST
Based on your area, read the corresponding skills BEFORE writing any code:
- Backend API: .claude/skills/backend-development/SKILL.md
- Database: .claude/skills/database-development/SKILL.md
- Frontend: .claude/skills/frontend-development/SKILL.md + .claude/skills/ux-design/SKILL.md

## Context
- Feature: ${FEATURE_ID}
- Plan: [paste relevant sections from plan.md]
- Design: [paste from design.md if frontend AND file exists]
- Architecture: Follow CLAUDE.md patterns

## Your Tasks
${TASK_LIST}

## Skill Patterns
Follow ALL patterns from your loaded skill. Key areas:
- Backend: RESTful API, IoC/DI, DTOs, CQRS, Multi-tenancy
- Database: Entities, Kysely types, Migrations, Repositories, Barrel exports
- Frontend: Mobile-first, shadcn components, Tailwind v3, Motion animations

## Deliverables
- Report: List of files created/modified
- Status: Build passes (run: ${BUILD_COMMAND})
```

### 3.3 Area-Specific Details

| Area | Location | Build Command |
|------|----------|---------------|
| **Database** | `libs/domain/src/entities/`, `libs/app-database/` | `npm run build -w @fnd/database -w @fnd/domain` |
| **Backend API** | `apps/backend/src/api/modules/[feature]/` | `npm run build -w @fnd/api` |
| **Workers** | `apps/backend/src/workers/` | `npm run build -w @fnd/api` |
| **Frontend** | `apps/frontend/src/` | `npm run build -w @fnd/frontend` |

**Database Tasks:** Entities, Kysely types, Knex migration, Repository, barrel exports
**Backend Tasks:** Module structure, DTOs, Commands, Events, Controller, Service, register in app.module.ts
**Worker Tasks:** Worker, Processor, queue config, error handling, register in worker.module.ts
**Frontend Tasks:** Pages, Components, Zustand store, Hooks, mirror DTOs, API integration, forms
- **MANDATORY:** Load skill `.claude/skills/ux-design/SKILL.md` before implementing ANY frontend code
- **If design.md exists:** Follow mobile-first layouts, use design tokens, implement specified states
- **Consult skill docs:** shadcn-docs.md, tailwind-v3-docs.md, motion-dev-docs.md, recharts-docs.md, tanstack-*.md

### 3.3.1 Skills Reference (MANDATORY)

**BEFORE implementing, load the relevant skill:**

| Area | Skill | Content |
|------|-------|---------|
| **Backend API** | `.claude/skills/backend-development/SKILL.md` | RESTful, IoC, DTOs, CQRS, Multi-tenancy |
| **Database** | `.claude/skills/database-development/SKILL.md` | Entities, Migrations, Kysely, Repositories |
| **Frontend** | `.claude/skills/ux-design/SKILL.md` | Mobile-first, shadcn, Tailwind v3, Motion |

**Subagent Prompt MUST include:**
```
## MANDATORY: Load Development Skill
BEFORE writing code, read: .claude/skills/[area]-development/SKILL.md
Follow ALL patterns from the skill.
```

### 3.4 Subagent Dispatch

**Use Task tool with `subagent_type: "general-purpose"`**

**CRITICAL:** When dispatching multiple independent subagents, send ALL Task tool calls in a SINGLE message.

**FRONTEND SUBAGENT (MANDATORY INSTRUCTION):**
When dispatching a frontend subagent, ALWAYS include this instruction in the prompt:
```
## UX Design Skill (MANDATORY)
BEFORE writing ANY frontend code:
1. Read and internalize: .claude/skills/ux-design/SKILL.md
2. For shadcn components: Grep pattern="[component]" path=".claude/skills/ux-design/shadcn-docs.md"
3. For Tailwind utilities: Grep pattern="[utility]" path=".claude/skills/ux-design/tailwind-v3-docs.md"
4. For animations: Grep pattern="[pattern]" path=".claude/skills/ux-design/motion-dev-docs.md"
5. For charts: Grep pattern="[chart]" path=".claude/skills/ux-design/recharts-docs.md"
6. For tables: Grep pattern="[pattern]" path=".claude/skills/ux-design/tanstack-table-docs.md"
7. For data fetching: Grep pattern="[hook]" path=".claude/skills/ux-design/tanstack-query-docs.md"
```

### 3.5 Coordination Flow

```
Dispatch DB Subagent → Wait → Verify build
    ↓ (if fails, dispatch fix subagent)
Dispatch Backend + Frontend (parallel) → Wait → Verify build
    ↓ (if fails, dispatch fix subagent)
Documentation → DONE
```

**Fix Subagent Prompt:**
```
You are FIXING BUILD ERRORS for feature ${FEATURE_ID}.

## Error Output
[paste build error output]

## Your Task
Fix ALL build errors. Do not stop until build passes 100%.
```

---

## Phase 4: Integration Verification

1. **Contract Adherence:** Endpoints, events, commands match plan
2. **Build Verification:**
   ```bash
   npm run build -w @fnd/api
   npm run build -w @fnd/frontend
   ```

**CRITICAL:** Code MUST compile 100%. Fix errors before proceeding.

---

## Phase 5: Documentation

**PRE-DOCUMENTATION CHECKPOINT (MANDATORY):**
```
1. TodoWrite: Add item "Ler skill de documentação e aplicar formato híbrido" (in_progress)
2. Execute: cat .claude/skills/documentation-style/SKILL.md
3. Apply hybrid structure to documentation below
4. TodoWrite: Mark item as completed after writing
```

**Create:** `docs/features/${FEATURE_ID}/implementation.md`

```markdown
# Implementation: [Feature Name]

**Date:** [current date]
**Developer:** Claude Code

## Files Created
- `[path]` - [~20 word description]

## Files Modified
- `[path]` - [~20 word description]

## Files Deleted
- `[path]` - [~20 word reason]

## Build Status
- [ ] Backend compiles successfully
- [ ] Frontend compiles successfully

## Notes
[Important notes, deviations from plan, decisions made]
```

---

## Phase 6: Completion

**Inform the user:**

```
✅ Development Complete!

Feature: ${FEATURE_ID}

**Summary:**
- Backend API: [X files]
- Workers: [Y files]
- Frontend: [Z files]
- Database: [W files]

**Build Status:** ✅ Backend + Frontend compiling

**Documentation:** `docs/features/${FEATURE_ID}/implementation.md`

**Next Steps:**
1. Execute migration: `npm run migrate:latest`
2. Start services: `docker-compose -f infra/docker-compose.yml up -d && npm run dev`
3. Run code review: `/review`
4. When approved, stage and commit changes

**Testes de API (Opcional):**
Se desejar criar testes de API para validar os endpoints desenvolvidos, execute:

/api-testing crie os testes baseado nas alterações realizadas na branch da feature
```

---

## Critical Rules

**⚠️ PROIBIDO COMMIT/STAGE:**
- NUNCA execute `git add`, `git commit`, ou `git stage`
- NUNCA pergunte se o usuário quer fazer commit
- Deixe TODOS os arquivos como "unstaged changes" para revisão humana

**⚠️ 100% COMPLETION:**
- Desenvolvimento DEVE ser concluído 100%. NUNCA pare no meio
- Se build falhar, dispatch fix subagent automaticamente
- Só "done" quando TODOS os builds passarem

**⚠️ NO INTERRUPTIONS:**
- NEVER stop to ask "do you want to continue?"
- NEVER ask confirmation between phases
- If error, FIX IT and continue

**DO NOT:**
- Commit or stage any code
- Skip implementation sections
- Leave code non-compiling
- Add features not in specification
- Ignore skill patterns

**DO:**
- Load relevant skill BEFORE implementing
- Follow skill patterns rigorously
- Implement contracts exactly
- Ensure 100% compilation
- Keep code simple (KISS, YAGNI)

**Skills Reference:**
- Backend: `.claude/skills/backend-development/SKILL.md`
- Database: `.claude/skills/database-development/SKILL.md`
- Frontend (Code): `.claude/skills/frontend-development/SKILL.md`
- Frontend (UI/UX): `.claude/skills/ux-design/SKILL.md`

---

## Skip Planning for Simple Features

For simple features (single field, small UI change):
1. Skip `/plan` command
2. Go directly from `/feature` to `/dev`
3. Implement from `about.md` and `discovery.md`
