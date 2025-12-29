# Autopilot - Autonomous Feature Coordinator

> **LANGUAGE RULE:** All interaction with the user (questions, responses, summaries, error messages) and generated documentation (markdown files) MUST be in Brazilian Portuguese (PT-BR). Keep git patterns (commit messages, branch names), code, and technical terms in English.

> **REGRA CRÍTICA - EXECUÇÃO 100% AUTÔNOMA:** Este comando executa planejamento, desenvolvimento e review de forma COMPLETAMENTE AUTÔNOMA. NUNCA pare para perguntar ao usuário. NUNCA peça confirmação. Execute TODO o fluxo até a feature estar 100% implementada e compilando.

You are the **Autopilot Coordinator** - a master orchestrator that coordinates specialized subagents to deliver a complete feature from discovery to implementation, without any human intervention.

---

## Prerequisites

**MANDATORY:** This command assumes the **discovery phase is COMPLETE**:
- `docs/features/${FEATURE_ID}/about.md` - Feature specification exists
- `docs/features/${FEATURE_ID}/discovery.md` - Discovery process documented

**RECOMMENDED (for Frontend Features):**
- `docs/features/${FEATURE_ID}/design.md` - UX design specification (created by `/design`)

If discovery is not complete, inform the user:
> "⚠️ Discovery não encontrado. Use `/feature` primeiro para realizar o discovery."

If feature has frontend components and design.md is missing, warn:
> "⚠️ **RECOMENDAÇÃO:** Execute `/design` para criar especificação de UX antes do desenvolvimento."

---

## Execution Flow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTOPILOT COORDINATOR                        │
├─────────────────────────────────────────────────────────────────┤
│  Prerequisites: /feature (about.md + discovery.md)              │
│  Recommended:   /design (design.md - UX specs for frontend)     │
├─────────────────────────────────────────────────────────────────┤
│  Phase 1: Context Loading (automatic)                           │
│     ↓    (loads about.md, discovery.md, design.md if exists)    │
│  Phase 2: Planning Subagent → follows .claude/commands/plan.md  │
│     ↓    (uses design.md as UX source of truth)                 │
│  Phase 3: Development Subagents → follows .claude/commands/dev.md │
│     ↓    (frontend uses design.md for layouts/components)       │
│  Phase 4: Review Subagent → follows .claude/commands/review.md  │
│     ↓                                                           │
│  Phase 5: Documentation Subagent → implementation.md            │
│     ↓                                                           │
│  Phase 6: Final Verification (build 100%)                       │
│     ↓                                                           │
│  DONE: Feature ready for commit                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Context Loading (AUTOMATIC)

### Step 1: Detect Current Feature

```bash
FEATURE_ID=$(bash .claude/scripts/identify-current-feature.sh)
```

**If feature identified:** Display and proceed automatically
**If no feature:** If ONE exists in `docs/features/`, use it; if MULTIPLE, use the most recent

### Step 2: Verify Discovery Complete

```bash
ls -la "docs/features/${FEATURE_ID}/"
```

**Required files:**
- `about.md` - MUST exist
- `discovery.md` - MUST exist

**If missing:** STOP and inform user to run `/feature` first.

### Step 2.1: Check Design Specification

```bash
# Check if design.md exists
ls "docs/features/${FEATURE_ID}/design.md" 2>/dev/null
```

**Check if feature has frontend scope:**
```bash
# Analyze about.md for frontend mentions
grep -iE "(frontend|ui|tela|página|componente|interface)" "docs/features/${FEATURE_ID}/about.md"
```

**Decision logic:**
| Has Frontend Scope | design.md Exists | Action |
|--------------------|------------------|--------|
| Yes | Yes | ✅ Proceed with design specs |
| Yes | No | ⚠️ Warn user, recommend `/design` first, continue |
| No | - | ✅ Skip design check (backend-only feature) |

**If frontend feature without design.md:**
```
⚠️ Feature possui escopo frontend mas design.md não encontrado.
   → RECOMENDAÇÃO: Execute `/design` para criar especificação UX.
   → Continuando sem design specs (usando skill ux-design como fallback)...
```

### Step 3: Load Project Architecture Reference

**Architecture reference:** `CLAUDE.md` (source of truth for project patterns)

### Step 4: Load Feature Context

Read ALL feature context files in parallel:
1. `docs/features/${FEATURE_ID}/about.md`
2. `docs/features/${FEATURE_ID}/discovery.md`
3. `docs/features/${FEATURE_ID}/design.md` (se existir - UX specs)
4. `docs/features/${FEATURE_ID}/plan.md` (se existir)

**Output to user:**
```
🚀 Autopilot iniciado para feature: ${FEATURE_ID}

📂 Context carregado:
- about.md: ✅
- discovery.md: ✅
- design.md: ✅ OU ⚠️ (não encontrado - usando skill ux-design como fallback)
- Architecture ref: ✅ CLAUDE.md

Iniciando execução autônoma...
```

---

## Phase 2: Planning Subagent

### Dispatch Planning Subagent

**Use Task tool with `subagent_type: "general-purpose"`**

```
description: "Plan feature ${FEATURE_ID}"
prompt: |
  You are executing the PLANNING phase for feature ${FEATURE_ID}.

  ## MANDATORY: Check for Existing Planning Files FIRST
  Before starting, check if any planning files already exist:
  1. Execute: ls docs/features/${FEATURE_ID}/*.md
  2. If plan-database.md exists: Read it (database planning already done)
  3. If plan-backend.md exists: Read it (backend planning already done)
  4. If plan-frontend.md exists: Read it (frontend planning already done)

  **NOTE:** Planning files are named WITHOUT dot prefix: plan-database.md, plan-backend.md, plan-frontend.md

  ## Instructions
  Follow ALL instructions from: .claude/commands/plan.md

  ## PRE-DOCUMENTATION CHECKPOINT (MANDATORY)
  Execute BEFORE starting to write plan.md:
  1. TodoWrite: Add item "Ler skill de documentação e aplicar formato híbrido" (in_progress)
  2. Execute: cat .claude/skills/documentation-style/SKILL.md
  3. Apply hybrid structure (human-readable + token-efficient) to plan.md
  4. TodoWrite: Mark item as completed AFTER writing plan.md

  ## DESIGN SPECIFICATION (CRITICAL FOR FRONTEND)
  Check if design.md exists:
  ```bash
  ls "docs/features/${FEATURE_ID}/design.md" 2>/dev/null
  ```

  **If design.md EXISTS:**
  1. Read: docs/features/${FEATURE_ID}/design.md
  2. Use design specs as SOURCE OF TRUTH for:
     - Page/screen structure
     - Component specifications (new vs existing)
     - Mobile-first layout requirements
     - States (loading, empty, error)
  3. Reference design.md in plan.md for dev agents

  **If design.md DOES NOT EXIST (frontend features):**
  1. Load UX skill: .claude/skills/ux-design/SKILL.md
  2. Use skill patterns as fallback
  3. Note in plan: "Design specs: Using ux-design skill (no design.md)"

  ## AUTOPILOT OVERRIDES (CRITICAL)
  These rules OVERRIDE any conflicting instructions in plan.md:

  1. **NO QUESTIONS:** Skip Phase 2 (Clarification Questions) entirely
     - DO NOT present questions to the user
     - For ALL decisions, automatically choose the RECOMMENDED option (⭐)
     - Document your autonomous decisions in the plan

  2. **NO CONFIRMATIONS:** Do not ask "Continue planning for feature X?"
     - Just proceed automatically

  3. **NO COMMITS:** Skip Phase 6 commit steps
     - Do NOT run git add, git commit, git push
     - Just create the plan.md file

  4. **DECISION MAKING:** When you need to make a decision:
     - Always choose the simplest option (KISS)
     - Follow existing patterns in the codebase
     - Use recommended options marked with ⭐
     - Document your decision with brief justification

  ## Context
  - Feature ID: ${FEATURE_ID}
  - Feature docs: docs/features/${FEATURE_ID}/
  - Design specs: docs/features/${FEATURE_ID}/design.md (if exists)
  - Architecture: CLAUDE.md

  ## Output
  Create: docs/features/${FEATURE_ID}/plan.md
  Following the exact structure defined in .claude/commands/plan.md

  ## Report Back
  - Summary of the plan created
  - Key technical decisions made autonomously
  - Components identified for development
  - Development phases defined
  - Design reference used (design.md or ux-design skill)
```

### Wait and Verify

Wait for subagent completion, then verify:

```bash
cat "docs/features/${FEATURE_ID}/plan.md" | head -50
```

**If plan incomplete:** Dispatch fix subagent to complete it.

**Output to user:**
```
✅ Phase 2: Planejamento concluído

📄 Plano criado: docs/features/${FEATURE_ID}/plan.md

Iniciando desenvolvimento...
```

---

## Phase 3: Development Subagents

### Analyze Plan for Strategy

Read `plan.md` and extract:
1. Components to develop (Backend API, Workers, Frontend, Database)
2. Development phases and order
3. Dependencies between components

### Parallelization Strategy

```
Dependency Order:
Database → Backend API → [parallel: Workers, Frontend]
```

### Dispatch Development Subagents

**Use Task tool with `subagent_type: "general-purpose"`**

**CRITICAL:** When components are independent, dispatch ALL subagents in a SINGLE message (parallel execution).

```
description: "Develop ${AREA} for ${FEATURE_ID}"
prompt: |
  You are executing the DEVELOPMENT phase for feature ${FEATURE_ID}.
  Your scope: ${AREA}

  ## MANDATORY: Read Planning Documentation FIRST
  Before doing ANYTHING else, you MUST read these files:
  1. Execute: ls docs/features/${FEATURE_ID}/*.md
  2. Read docs/features/${FEATURE_ID}/plan.md (SOURCE OF TRUTH)
  3. Read docs/features/${FEATURE_ID}/about.md
  4. Read docs/features/${FEATURE_ID}/discovery.md
  5. If your area is Backend: Check if plan-database.md exists and read it
  6. If your area is Frontend: Check if plan-backend.md exists and read it for API contracts

  **DO NOT skip this step. These files contain ALL context needed for implementation.**

  ## Instructions
  Follow ALL instructions from: .claude/commands/dev.md
  (The command includes PRE-DOCUMENTATION CHECKPOINT - follow it)

  ## AUTOPILOT OVERRIDES (CRITICAL)
  These rules OVERRIDE any conflicting instructions in dev.md:

  1. **NO QUESTIONS:** Do not ask any questions
     - Proceed with implementation based on plan.md

  2. **NO CONFIRMATIONS:** Do not ask for scope confirmation
     - Your scope is: ${AREA}
     - Just implement it

  3. **FOCUS ON YOUR SCOPE ONLY:**
     - Only implement: ${AREA}
     - Do NOT implement other areas
     - Other subagents handle other areas

  4. **BUILD MUST PASS:**
     - Run the appropriate build command for your area
     - Fix ALL errors before reporting back

  ## UX Design Specification (FRONTEND ONLY - MANDATORY)
  If your area is Frontend:

  **STEP 1: Check for design.md (PRIMARY SOURCE)**
  ```bash
  ls "docs/features/${FEATURE_ID}/design.md" 2>/dev/null
  ```

  **If design.md EXISTS (PREFERRED):**
  1. Read: docs/features/${FEATURE_ID}/design.md
  2. Use design specs as SOURCE OF TRUTH for:
     - Page/screen layouts
     - Component structure (new vs existing)
     - Mobile-first breakpoints
     - States (loading, empty, error)
     - Component locations and naming
  3. Load skill for implementation details: .claude/skills/ux-design/SKILL.md

  **If design.md DOES NOT EXIST (FALLBACK):**
  1. FIRST, load the UX design skill: Read .claude/skills/ux-design/SKILL.md
  2. Follow ALL patterns from the skill (mobile-first, shadcn, Tailwind v3, Motion, etc.)
  3. Read: docs/design-system/foundations.md (if exists)

  **STEP 2: Consult skill documentation as needed:**
  - For shadcn components: Grep pattern="[component]" path=".claude/skills/ux-design/shadcn-docs.md"
  - For Tailwind utilities: Grep pattern="[utility]" path=".claude/skills/ux-design/tailwind-v3-docs.md"
  - For animations: Grep pattern="[pattern]" path=".claude/skills/ux-design/motion-dev-docs.md"
  - For charts: Grep pattern="[chart]" path=".claude/skills/ux-design/recharts-docs.md"
  - For tables: Grep pattern="[pattern]" path=".claude/skills/ux-design/tanstack-table-docs.md"

  ## MANDATORY: Load Development Skills
  Based on your area, read the corresponding skills BEFORE writing any code:

  | Area | Skill | Key Patterns |
  |------|-------|--------------|
  | Backend API | `.claude/skills/backend-development/SKILL.md` | RESTful, IoC/DI, DTOs, CQRS |
  | Database | `.claude/skills/database-development/SKILL.md` | Entities, Migrations, Kysely |
  | Frontend | `.claude/skills/frontend-development/SKILL.md` | Hooks, State, Types, Forms |
  | Frontend UI | `.claude/skills/ux-design/SKILL.md` | Mobile-first, shadcn, Tailwind v3 |

  **Skills contain ALL standards** - do not implement without reading them first.

  ## Context
  - Feature ID: ${FEATURE_ID}
  - Plan: docs/features/${FEATURE_ID}/plan.md (SOURCE OF TRUTH)
  - Design: docs/features/${FEATURE_ID}/design.md (if exists - UX specs)
  - Architecture: CLAUDE.md
  - Your area: ${AREA}

  ## Build Commands by Area
  - Database: npm run build -w @fnd/database -w @fnd/domain
  - Backend API: npm run build -w @fnd/api
  - Workers: npm run build -w @fnd/api
  - Frontend: npm run build -w @fnd/frontend

  ## Report Back
  - Files created/modified
  - Implementation summary
  - Build status (MUST be passing)
  - Skills used and patterns followed
```

### Wait for All Development Subagents

Wait for ALL subagents to complete. Collect their reports.

### Verify All Builds Pass

```bash
npm run build
```

**If any build fails:** Dispatch fix subagent:

```
description: "Fix build errors for ${FEATURE_ID}"
prompt: |
  You are FIXING BUILD ERRORS for feature ${FEATURE_ID}.

  ## Build Error Output
  ${ERROR_OUTPUT}

  ## Rules
  - DO NOT ask questions
  - Fix ALL errors
  - Run build again to verify
  - Repeat until 100% passing

  ## Report Back
  - What was fixed
  - Final build status
```

**Output to user:**
```
✅ Phase 3: Desenvolvimento concluído

📦 Componentes implementados:
- Backend API: [X arquivos]
- Frontend: [Y arquivos]
- Database: [Z arquivos]

🔨 Build Status: ✅ Passando

Iniciando code review...
```

---

## Phase 4: Review Subagent

### Dispatch Review Subagent

**Use Task tool with `subagent_type: "general-purpose"`**

```
description: "Review feature ${FEATURE_ID}"
prompt: |
  You are executing the REVIEW phase for feature ${FEATURE_ID}.

  ## STEP 1: IDENTIFY ALL CHANGED FILES (MANDATORY)

  **FIRST**, run the detection script to get ALL files modified in the branch:

  ```bash
  bash .claude/scripts/detect-project-state.sh --branch-changes
  ```

  This returns:
  - COMMITTED_FILES - Files already committed on the branch
  - STAGED_FILES - Files ready to commit
  - UNSTAGED_FILES - Modified but not staged
  - UNTRACKED_FILES - New files not tracked
  - FILES_TO_REVIEW - Consolidated list of ALL files to review
  - CHANGES_BY_AREA - Statistics by directory

  **CRITICAL:** Review ALL files in FILES_TO_REVIEW, not just implementation.md mentions.

  ## STEP 2: PRE-DOCUMENTATION CHECKPOINT (MANDATORY)
  Execute BEFORE running code-review:
  1. TodoWrite: Add item "Ler skill de documentação e aplicar formato híbrido" (in_progress)
  2. Execute: cat .claude/skills/documentation-style/SKILL.md
  3. Apply hybrid structure (human-readable + token-efficient) to review.md
  4. TodoWrite: Mark item as completed AFTER writing review.md

  ## STEP 3: Load Code Review Skill and Execute

  **MANDATORY:** Load skill BEFORE reviewing:
  ```bash
  cat .claude/skills/code-review/SKILL.md
  ```

  Then execute ALL phases from: .claude/commands/review.md

  The code-review skill references:
  - `.claude/skills/backend-development/SKILL.md` - RESTful, IoC, CQRS patterns
  - `.claude/skills/database-development/SKILL.md` - Kysely, Migrations patterns
  - `.claude/skills/security-audit/SKILL.md` - OWASP, Multi-tenancy patterns

  ## AUTOPILOT OVERRIDES (CRITICAL)

  1. **NO QUESTIONS:** Do not ask any questions
     - Proceed with review automatically

  2. **AUTO-FIX ALL ISSUES:**
     - Fix ALL violations automatically
     - Contract violations are CRITICAL
     - Runtime errors are CRITICAL

  3. **BUILD MUST PASS:**
     - After fixes, verify build passes
     - If not, fix remaining issues

  ## Context
  - Feature ID: ${FEATURE_ID}
  - Plan: docs/features/${FEATURE_ID}/plan.md
  - Architecture: CLAUDE.md
  - Files to Review: Output from detect-project-state.sh --branch-changes

  ## Output
  Create: docs/features/${FEATURE_ID}/review.md
  Following the exact structure from .claude/commands/review.md

  ## Report Back
  - Total files reviewed (from script output)
  - Issues found and fixed (count by category)
  - Skills validated (backend, database, frontend)
  - Final score
  - Build status (MUST be passing)
```

### Wait and Verify

Wait for subagent completion, then verify:

```bash
npm run build
```

**If build fails:** Dispatch fix subagent to resolve.

**Output to user:**
```
✅ Phase 4: Code Review concluído

🔍 Review Summary:
- Arquivos revisados: [N]
- Issues encontrados: [X]
- Issues corrigidos: [X]
- IoC Configuration issues: [W]
- Contract & Runtime issues: [Z]
- Score final: [Y/10]

Gerando documentação...
```

---

## Phase 5: Documentation Subagent

### Dispatch Documentation Subagent

**Use Task tool with `subagent_type: "general-purpose"`**

```
description: "Document feature ${FEATURE_ID}"
prompt: |
  You are a **Documentation Specialist** creating implementation documentation for feature ${FEATURE_ID}.

  ## PRE-DOCUMENTATION CHECKPOINT (MANDATORY)
  Execute BEFORE starting to write implementation.md:
  1. TodoWrite: Add item "Ler skill de documentação e aplicar formato híbrido" (in_progress)
  2. Execute: cat .claude/skills/documentation-style/SKILL.md
  3. Apply hybrid structure (human-readable + token-efficient) to implementation.md
  4. TodoWrite: Mark item as completed AFTER writing implementation.md

  ## Instructions
  Follow the documentation format from: .claude/commands/dev.md (Phase 5: Documentation section)

  ## CRITICAL: LEAN DOCUMENTATION
  Create CONCISE documentation. NO verbose descriptions.

  ## Context to Gather
  1. Read docs/features/${FEATURE_ID}/plan.md - What was planned
  2. Read docs/features/${FEATURE_ID}/review.md - What was reviewed/fixed
  3. Use git diff to identify ALL files created/modified/deleted

  ## Commands to Run
  ```bash
  # Get all changed files
  git status --porcelain

  # Get diff summary
  git diff --stat
  ```

  ## Output Format
  Create: docs/features/${FEATURE_ID}/implementation.md

  Follow this EXACT structure (from dev.md):

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
  - [x] Backend compiles successfully
  - [x] Frontend compiles successfully

  ## Notes
  [Important notes, deviations from plan, decisions made - keep brief]
  ```

  ## Rules
  - ~20 words MAX per file description
  - NO verbose explanations
  - NO code snippets
  - Focus on WHAT was done, not HOW
  - List ALL files changed (use git status)

  ## Report Back
  - implementation.md created
  - Total files: created/modified/deleted counts
```

### Verify Documentation Created

```bash
cat "docs/features/${FEATURE_ID}/implementation.md"
```

**Output to user:**
```
✅ Phase 5: Documentação concluída

📄 Implementation doc: docs/features/${FEATURE_ID}/implementation.md
- Files created: [X]
- Files modified: [Y]
- Files deleted: [Z]

Verificação final...
```

---

## Phase 6: Final Verification

### Full Build Check

```bash
npm run build
```

**MUST pass 100%.**

### Verify All Documentation

```bash
ls -la "docs/features/${FEATURE_ID}/"
```

**Expected files:**
- `about.md` - Feature specification
- `discovery.md` - Discovery record
- `design.md` - UX design specification (optional, recommended for frontend)
- `plan.md` - Technical plan
- `implementation.md` - Implementation record
- `review.md` - Review record

### Final Report

**Output to user:**

```
══════════════════════════════════════════════════════════════════
🎉 AUTOPILOT COMPLETE - Feature ${FEATURE_ID}
══════════════════════════════════════════════════════════════════

📊 Execution Summary:
┌────────────────────────────────────────────────────────────────┐
│ Phase           │ Status │ Subagents │                        │
├────────────────────────────────────────────────────────────────┤
│ 1. Context      │   ✅   │     -     │                        │
│ 2. Planning     │   ✅   │     1     │                        │
│ 3. Development  │   ✅   │     N     │                        │
│ 4. Review       │   ✅   │     1     │                        │
│ 5. Documentation│   ✅   │     1     │                        │
│ 6. Verification │   ✅   │     -     │                        │
└────────────────────────────────────────────────────────────────┘

📦 Components Implemented:
- Backend API: [X files]
- Workers: [Y files]
- Frontend: [Z files]
- Database: [W files]

📄 Documentation:
- docs/features/${FEATURE_ID}/about.md
- docs/features/${FEATURE_ID}/discovery.md
- docs/features/${FEATURE_ID}/design.md (if frontend)
- docs/features/${FEATURE_ID}/plan.md
- docs/features/${FEATURE_ID}/implementation.md
- docs/features/${FEATURE_ID}/review.md

🔨 Build Status: ✅ ALL PASSING

🔍 Review Score: [X/10]

══════════════════════════════════════════════════════════════════

📋 Next Steps:
1. Review the implementation changes
2. Test the functionality manually
3. Stage and commit when satisfied:
   git add .
   git commit -m "feat(${FEATURE_ID}): [description]"
4. Push and create PR

══════════════════════════════════════════════════════════════════
```

---

## Critical Rules - AUTOPILOT SPECIFIC

### AUTONOMOUS EXECUTION (OVERRIDES ALL OTHER COMMANDS)

**NEVER:**
- Ask "do you want to continue?"
- Ask "should I proceed?"
- Ask for confirmation between phases
- Stop to ask for clarification
- Wait for user input
- Present questions with options

**ALWAYS:**
- Make decisions autonomously (use KISS/YAGNI principles)
- Choose recommended/simplest options automatically
- Fix errors and continue
- Complete 100% of the work

### ERROR HANDLING

**If subagent fails:**
1. Analyze the failure
2. Dispatch fix subagent automatically
3. Continue after fix
4. Maximum 3 retry attempts before reporting blocker

### NO COMMITS

**NEVER:**
- Execute `git add`, `git commit`, `git stage`
- Ask about committing
- Push to remote

Leave ALL changes as unstaged for user review.

### SUBAGENT COORDINATION

**Parallel Execution:**
- When dispatching multiple independent subagents, send ALL Task tool calls in a SINGLE message
- Wait for ALL to complete before proceeding

**Sequential Execution (dependencies):**
```
Database → Wait → Backend API → Wait → [parallel: Workers, Frontend]
```

### QUALITY GATES

Each phase MUST complete successfully before next:
1. Planning → plan.md exists and is complete
2. Development → ALL builds pass
3. Review → ALL issues fixed, build passes
4. Documentation → implementation.md created (lean format)
5. Verification → Final build 100% passing

---

## Skip Planning for Simple Features

If feature is very simple (based on about.md analysis):
- Single component
- < 5 files to modify
- No new database entities

**Then:** Skip Phase 2, go directly to Development using about.md as source.

**Note:** Even for simple features, if design.md exists, use it as UX reference.
