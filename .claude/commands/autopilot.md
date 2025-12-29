# Autopilot - Autonomous Feature Coordinator

> **LANGUAGE RULE:** All interaction with the user (questions, responses, summaries, error messages) and generated documentation (markdown files) MUST be in Brazilian Portuguese (PT-BR). Keep git patterns (commit messages, branch names), code, and technical terms in English.

> **REGRA CRÍTICA - EXECUÇÃO 100% AUTÔNOMA:** Este comando executa planejamento, desenvolvimento e review de forma COMPLETAMENTE AUTÔNOMA. NUNCA pare para perguntar ao usuário. NUNCA peça confirmação. Execute TODO o fluxo até a feature estar 100% implementada e compilando.

You are the **Autopilot Coordinator** - a master orchestrator that coordinates specialized subagents to deliver a complete feature from discovery to implementation, without any human intervention.

**DIFERENCIAL:** Você NÃO delega discovery aos subagents. Você PROCESSA o contexto e ENTREGA digerido.

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
│                    AUTOPILOT COORDINATOR v2                     │
├─────────────────────────────────────────────────────────────────┤
│  Phase 1: Context Loading + Digest Generation                   │
│     ↓    (coordinator reads, processes, creates digest)         │
│  Phase 2: Skill Composition + Reference Discovery               │
│     ↓    (coordinator identifies skills + finds references)     │
│  Phase 3: Planning Subagent (receives processed context)        │
│     ↓    (subagent receives digest, not file paths)             │
│  Phase 4: Development Subagents (parallel when possible)        │
│     ↓    (each receives accumulated decisions + context)        │
│  Phase 5: Review Subagent (receives full decision log)          │
│     ↓                                                           │
│  Phase 6: Documentation + Final Verification                    │
│     ↓                                                           │
│  DONE: Feature ready for commit                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## PROMPT BUILDER STRUCTURE

**CRITICAL:** All subagent prompts MUST follow this modular structure.

```
┌─────────────────────────────────────────────────────────────────┐
│                    SUBAGENT PROMPT TEMPLATE                     │
├─────────────────────────────────────────────────────────────────┤
│  ## ROLE                                                        │
│  You are the [AREA] [agent type] for feature [ID].              │
│                                                                 │
│  ## CONTEXT DIGEST (pre-processed by coordinator)               │
│  [Compact summary - NO file reading needed]                     │
│                                                                 │
│  ## SKILLS (composed by coordinator)                            │
│  MANDATORY: [list]                                              │
│  ADDITIONAL: [detected from context]                            │
│                                                                 │
│  ## REFERENCE FILES (pre-identified)                            │
│  [Table with exact paths and lines]                             │
│                                                                 │
│  ## COORDINATOR NOTES (intelligent guidance)                    │
│  [Decisions, warnings, patterns to follow/avoid]                │
│                                                                 │
│  ## DECISION LOG (from previous phases)                         │
│  [Accumulated decisions from earlier subagents]                 │
│                                                                 │
│  ## TASK                                                        │
│  [Specific deliverables for this subagent]                      │
│                                                                 │
│  ## RULES                                                       │
│  [Autopilot rules - no questions, no commits, etc.]             │
│                                                                 │
│  ## REPORT FORMAT                                               │
│  [What to return to coordinator]                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Context Loading + Digest Generation

### Step 1: Run Context Mapper

```bash
bash .claude/scripts/identify-current-feature.sh
```

**Parse the output to get:**
- `FEATURE_ID`, `CURRENT_PHASE`
- `HAS_DESIGN`, `HAS_PLAN`
- `HAS_FOUNDATIONS`

### Step 2: Load ALL Feature Documents

**Read these files IN SEQUENCE:**
```bash
cat "docs/features/${FEATURE_ID}/about.md"
cat "docs/features/${FEATURE_ID}/discovery.md"
cat "docs/features/${FEATURE_ID}/design.md" 2>/dev/null  # if exists
cat "docs/features/${FEATURE_ID}/plan.md" 2>/dev/null   # if exists
cat "CLAUDE.md"  # architecture reference
```

### Step 3: Generate Context Digest

**YOU (the coordinator) must create a DIGEST from the loaded documents.**

**Context Digest Template:**

```markdown
### CONTEXT DIGEST: ${FEATURE_ID}

#### 1. Feature Goal (from about.md)
[2-3 sentences - what the feature does, who benefits]

#### 2. Scope Identification
- Database: [yes/no] - [brief reason]
- Backend API: [yes/no] - [endpoints needed]
- Workers: [yes/no] - [async processing needed]
- Frontend: [yes/no] - [pages/components needed]
- Manager: [yes/no] - [admin panel changes]

#### 3. Key Decisions (from discovery.md)
- [Decision 1]: [rationale]
- [Decision 2]: [rationale]
- [Decision 3]: [rationale]

#### 4. Technical Constraints
- [Constraint 1 from discovery]
- [Constraint 2 from architecture]

#### 5. Design Highlights (if design.md exists)
- Primary layout: [description]
- Key components: [list]
- States to handle: [list]

#### 6. Out of Scope (IMPORTANT)
- [Item 1 - explicitly excluded]
- [Item 2 - deferred to future]
```

**Store this digest in memory - you will pass it to ALL subagents.**

---

## Phase 2: Skill Composition + Reference Discovery

### Step 1: Analyze Context for Skill Detection

**Read the context digest and detect keywords/patterns:**

| Detection Pattern | Additional Skill |
|-------------------|------------------|
| "stripe", "billing", "payment", "checkout" | `.claude/skills/stripe/SKILL.md` |
| "plan", "tier", "feature flag", "subscription limit" | `.claude/skills/plan-based-features/SKILL.md` |
| "security", "authentication", "authorization", "RBAC" | `.claude/skills/security-audit/SKILL.md` |
| "webhook", "event", "async", "queue", "worker" | (included in backend-development) |
| "chart", "graph", "metrics", "dashboard" | `.claude/skills/ux-design/recharts-docs.md` |
| "table", "data grid", "pagination" | `.claude/skills/ux-design/tanstack-table-docs.md` |

### Step 2: Build Skill Composition

**Create a skill map for each area:**

```markdown
### SKILL COMPOSITION

#### Database Subagent
MANDATORY:
- .claude/skills/database-development/SKILL.md

#### Backend Subagent
MANDATORY:
- .claude/skills/backend-development/SKILL.md
ADDITIONAL (detected):
- [skill if detected]

#### Frontend Subagent
MANDATORY:
- .claude/skills/frontend-development/SKILL.md
- .claude/skills/ux-design/SKILL.md
ADDITIONAL (detected):
- [skill if detected]
```

### Step 3: Discover Reference Files

**Search the codebase for similar patterns:**

```bash
# Find similar entities
ls libs/domain/src/entities/ | head -5

# Find similar controllers
ls apps/backend/src/api/modules/ | head -5

# Find similar frontend pages
ls apps/frontend/src/pages/ | head -5

# Search for specific patterns mentioned in discovery
grep -r "[keyword from discovery]" apps/ libs/ --include="*.ts" -l | head -3
```

**Build Reference Table:**

```markdown
### REFERENCE FILES (pre-identified by coordinator)

| Pattern | Reference Path | Notes |
|---------|----------------|-------|
| Entity example | libs/domain/src/entities/User.ts | Standard entity structure |
| Repository example | libs/app-database/src/repositories/UserRepository.ts | Multi-tenant pattern |
| Controller example | apps/backend/src/api/modules/workspace/workspace.controller.ts | CRUD pattern |
| Frontend hook | apps/frontend/src/hooks/use-workspaces.ts | TanStack Query pattern |
| Frontend page | apps/frontend/src/pages/workspaces.tsx | Page layout pattern |
```

---

## Phase 3: Planning Subagent

### Initialize Decision Log

```markdown
### DECISION LOG
<!-- Coordinator initializes, subagents append -->

#### Pre-Planning (Coordinator)
- Scope: [areas identified]
- Skills: [composed skills]
- References: [identified files]
```

### Dispatch Planning Subagent

**Use Task tool with `subagent_type: "general-purpose"`**

```
description: "Plan feature ${FEATURE_ID}"
prompt: |
  ## ROLE
  You are the PLANNING agent for feature ${FEATURE_ID}.
  Your job is to create a technical plan based on the context I'm providing.

  ## CONTEXT DIGEST (pre-processed - DO NOT re-read files)
  ${CONTEXT_DIGEST}

  ## SKILLS (composed by coordinator)
  MANDATORY - Read these skills for patterns:
  ${MANDATORY_SKILLS_LIST}

  ADDITIONAL - Also read if relevant to your area:
  ${ADDITIONAL_SKILLS_LIST}

  ## REFERENCE FILES (pre-identified)
  ${REFERENCE_TABLE}

  Use these as templates - don't search for others.

  ## COORDINATOR NOTES
  ${COORDINATOR_NOTES}

  Examples of coordinator notes:
  - "Discovery mentions email digest but this is OUT OF SCOPE for this feature"
  - "Similar feature F0012 had issues with X approach - prefer Y"
  - "JSONB is preferred over new table based on discovery decision"

  ## TASK
  Create: docs/features/${FEATURE_ID}/plan.md

  Follow the structure from .claude/commands/plan.md BUT:
  - You already have the context - focus on technical decisions
  - Use the reference files I provided
  - Keep plan under 150 lines

  ## RULES
  - NO questions - use KISS/YAGNI for decisions
  - NO commits - just create plan.md
  - Use reference files, don't search for others
  - Be concise - tables over prose

  ## REPORT FORMAT
  Return:
  1. Plan file location
  2. Key technical decisions made (bulleted list)
  3. Components per area (counts)
  4. Any assumptions made
```

### Process Planning Output

**After subagent returns:**

1. Read the created plan.md
2. Extract key decisions
3. Update Decision Log:

```markdown
#### Planning Phase (from Planning Subagent)
- Database: [decisions from plan]
- Backend: [endpoints, commands, events]
- Frontend: [pages, components]
- Implementation order: [sequence]
```

---

## Phase 4: Development Subagents

### Update Decision Log with Plan

```markdown
#### Development Phase Start
- Plan location: docs/features/${FEATURE_ID}/plan.md
- Dependencies: Database → Backend → [parallel: Workers, Frontend]
```

### Database Subagent (if needed)

```
description: "Develop Database for ${FEATURE_ID}"
prompt: |
  ## ROLE
  You are the DATABASE developer for feature ${FEATURE_ID}.

  ## CONTEXT DIGEST
  ${CONTEXT_DIGEST}

  ## DECISION LOG (from planning)
  ${DECISION_LOG}

  Key database decisions from planning:
  - Entities: [list from plan]
  - Tables: [list from plan]
  - Relationships: [from plan]

  ## SKILLS
  MANDATORY:
  - Read: .claude/skills/database-development/SKILL.md
  - Follow: Entities, Kysely Types, Migrations, Repository patterns
  - Verify against: Checklist at end of skill

  ## REFERENCE FILES
  ${DATABASE_REFERENCES}

  ## COORDINATOR NOTES
  ${COORDINATOR_NOTES}

  Examples:
  - "Plan specifies JSONB for preferences - see UserRepository.ts:45 for pattern"
  - "Use CASCADE delete for account_id FK"
  - "Enum values must match: 'pending' | 'completed' | 'failed'"

  ## TASK
  Implement database layer exactly as specified in plan.md:
  1. Entity in libs/domain/src/entities/
  2. Enum in libs/domain/src/enums/ (if needed)
  3. Kysely type in libs/app-database/src/types/
  4. Migration in libs/app-database/migrations/
  5. Repository interface + implementation
  6. Update all index.ts barrel exports

  ## RULES
  - 100% of plan.md database specs
  - NO deferrals - implement everything
  - Build MUST pass: npm run build -w @fnd/database -w @fnd/domain

  ## REPORT FORMAT
  Return:
  1. FILES_CREATED: [list with paths]
  2. FILES_MODIFIED: [list with paths]
  3. MIGRATION_NAME: [filename]
  4. BUILD_STATUS: [pass/fail]
  5. DECISIONS_MADE: [any decisions during implementation]
```

### Backend Subagent

```
description: "Develop Backend for ${FEATURE_ID}"
prompt: |
  ## ROLE
  You are the BACKEND developer for feature ${FEATURE_ID}.

  ## CONTEXT DIGEST
  ${CONTEXT_DIGEST}

  ## DECISION LOG (accumulated)
  ${DECISION_LOG}

  Key backend decisions from planning:
  - Module: [name]
  - Endpoints: [list from plan]
  - Commands: [list from plan]
  - Events: [list from plan]

  Database layer status (from previous subagent):
  - Entities available: [list]
  - Repository methods: [list]
  - Migration: [name]

  ## SKILLS
  MANDATORY:
  - Read: .claude/skills/backend-development/SKILL.md
  - Follow: Clean Arch, RESTful, IoC/DI, DTOs, CQRS patterns

  ADDITIONAL:
  ${ADDITIONAL_BACKEND_SKILLS}

  ## REFERENCE FILES
  ${BACKEND_REFERENCES}

  ## COORDINATOR NOTES
  ${COORDINATOR_NOTES}

  Examples:
  - "Database subagent created UserPreferencesRepository with findByUserId() method"
  - "Use @HttpCode(201) for POST endpoints"
  - "This feature requires plan validation - check plan-based-features skill"

  ## TASK
  Implement backend API exactly as specified in plan.md:
  1. Module structure in apps/backend/src/api/modules/${feature}/
  2. DTOs with validation decorators
  3. Commands and handlers
  4. Events and handlers (if needed)
  5. Controller with proper HTTP codes
  6. Service layer
  7. Register module in app.module.ts

  ## RULES
  - 100% of plan.md backend specs
  - NO deferrals
  - Build MUST pass: npm run build -w @fnd/api

  ## REPORT FORMAT
  Return:
  1. FILES_CREATED: [list with paths]
  2. FILES_MODIFIED: [list with paths]
  3. ENDPOINTS: [list with method + path]
  4. BUILD_STATUS: [pass/fail]
  5. DECISIONS_MADE: [any decisions]
  6. DTO_CONTRACTS: [list DTOs for frontend to mirror]
```

### Frontend Subagent

```
description: "Develop Frontend for ${FEATURE_ID}"
prompt: |
  ## ROLE
  You are the FRONTEND developer for feature ${FEATURE_ID}.

  ## CONTEXT DIGEST
  ${CONTEXT_DIGEST}

  ## DECISION LOG (accumulated)
  ${DECISION_LOG}

  Key frontend decisions from planning:
  - Pages: [list from plan]
  - Components: [list from plan]
  - Hooks: [list from plan]

  Backend API contracts (from backend subagent):
  - Endpoints: [list with methods]
  - DTOs to mirror: [list]

  Design specifications (if design.md exists):
  - Layout: [from design.md]
  - Components: [from design.md]
  - States: [from design.md]

  ## SKILLS
  MANDATORY:
  - Read: .claude/skills/frontend-development/SKILL.md
  - Read: .claude/skills/ux-design/SKILL.md

  ADDITIONAL:
  ${ADDITIONAL_FRONTEND_SKILLS}

  For specific components, search these docs:
  - shadcn: .claude/skills/ux-design/shadcn-docs.md
  - Tailwind: .claude/skills/ux-design/tailwind-v3-docs.md
  - Motion: .claude/skills/ux-design/motion-dev-docs.md
  - Charts: .claude/skills/ux-design/recharts-docs.md
  - Tables: .claude/skills/ux-design/tanstack-table-docs.md

  ## REFERENCE FILES
  ${FRONTEND_REFERENCES}

  ## COORDINATOR NOTES
  ${COORDINATOR_NOTES}

  Examples:
  - "Backend created PreferencesResponseDto - mirror in types/preferences.ts"
  - "Use mobile-first approach from ux-design skill"
  - "design.md specifies toast notifications for save success"

  ## TASK
  Implement frontend exactly as specified in plan.md + design.md:
  1. Types mirroring backend DTOs in apps/frontend/src/types/
  2. Hooks for API calls in apps/frontend/src/hooks/
  3. Store (if local state needed) in apps/frontend/src/stores/
  4. Components in apps/frontend/src/components/features/${feature}/
  5. Pages in apps/frontend/src/pages/
  6. Update routes if needed

  ## RULES
  - 100% of design.md components (if exists)
  - 100% of plan.md frontend specs
  - NO deferrals
  - Build MUST pass: npm run build -w @fnd/frontend

  ## REPORT FORMAT
  Return:
  1. FILES_CREATED: [list with paths]
  2. FILES_MODIFIED: [list with paths]
  3. ROUTES_ADDED: [list with paths]
  4. BUILD_STATUS: [pass/fail]
  5. DECISIONS_MADE: [any decisions]
```

### Parallel Execution Strategy

**CRITICAL:** When dispatching development subagents:

```
1. Database FIRST (others depend on it)
   → Wait for completion
   → Update Decision Log with database outputs

2. Backend + Frontend in PARALLEL (if both needed)
   → Send BOTH Task calls in SINGLE message
   → Wait for both to complete

3. Update Decision Log with all outputs
```

### Build Verification After Development

```bash
npm run build
```

**If fails:** Dispatch fix subagent with error output and decision log.

---

## Phase 5: Review Subagent

### Compile Full Decision Log

```markdown
#### Review Phase Start
Decision log contains:
- Pre-planning context
- Planning decisions
- Database implementation details
- Backend implementation details
- Frontend implementation details
- All files created/modified
```

### Dispatch Review Subagent

```
description: "Review feature ${FEATURE_ID}"
prompt: |
  ## ROLE
  You are the CODE REVIEWER for feature ${FEATURE_ID}.
  Your job is to validate and fix the implementation.

  ## CONTEXT DIGEST
  ${CONTEXT_DIGEST}

  ## FULL DECISION LOG
  ${COMPLETE_DECISION_LOG}

  This log contains ALL decisions made during planning and development.
  Use it to verify implementation matches decisions.

  ## FILES TO REVIEW
  From Decision Log - FILES_CREATED and FILES_MODIFIED from all subagents:
  ${ALL_FILES_LIST}

  ## SKILLS
  MANDATORY:
  - Read: .claude/skills/code-review/SKILL.md

  REFERENCE:
  - Backend patterns: .claude/skills/backend-development/SKILL.md
  - Database patterns: .claude/skills/database-development/SKILL.md
  - Frontend patterns: .claude/skills/frontend-development/SKILL.md
  - Security: .claude/skills/security-audit/SKILL.md

  ## COORDINATOR NOTES
  ${COORDINATOR_NOTES}

  Examples:
  - "Verify all DTOs from backend are mirrored in frontend types"
  - "Check multi-tenancy: all queries must filter by account_id"
  - "Planning specified 3 endpoints - verify all are implemented"

  ## VERIFICATION CHECKLIST (from plan.md)
  ${PLAN_CHECKLIST}

  Create a checklist from plan.md:
  - [ ] Each endpoint specified → implemented
  - [ ] Each entity specified → created
  - [ ] Each component specified → created

  ## TASK
  1. Read ALL files from FILES_CREATED/FILES_MODIFIED
  2. Validate against plan.md and decision log
  3. Check skill patterns (IoC, RESTful, etc.)
  4. AUTO-FIX all violations found
  5. Verify build passes
  6. Create: docs/features/${FEATURE_ID}/review.md

  ## RULES
  - NO questions - fix issues automatically
  - Missing components from plan = CRITICAL
  - Build MUST pass after fixes

  ## REPORT FORMAT
  Return:
  1. FILES_REVIEWED: [count]
  2. ISSUES_FOUND: [list with severity]
  3. ISSUES_FIXED: [list]
  4. BUILD_STATUS: [pass/fail]
  5. SCORE: [X/10]
  6. VERIFICATION_CHECKLIST: [✅/❌ per item]
```

---

## Phase 6: Documentation + Final Verification

### Documentation Subagent

```
description: "Document feature ${FEATURE_ID}"
prompt: |
  ## ROLE
  You are the DOCUMENTATION agent for feature ${FEATURE_ID}.

  ## FULL DECISION LOG
  ${COMPLETE_DECISION_LOG}

  This contains everything that happened during development.

  ## SKILL
  Read: .claude/skills/documentation-style/SKILL.md
  Apply hybrid format (human-readable + token-efficient)

  ## TASK
  Create: docs/features/${FEATURE_ID}/implementation.md

  Use the decision log to document:
  - Files created (with ~20 word descriptions)
  - Files modified
  - Key decisions made
  - Build status

  ## FORMAT
  # Implementation: [Feature Name]
  **Date:** [date] | **Developer:** Claude Code Autopilot

  ## Summary
  [2-3 sentences from context digest]

  ## Files Created
  - `[path]` - [~20 words]

  ## Files Modified
  - `[path]` - [~20 words]

  ## Key Decisions
  - [Decision 1 from log]
  - [Decision 2 from log]

  ## Build Status
  - [x] All packages compile

  ## RULES
  - ~20 words MAX per file
  - NO code snippets
  - Use decision log as source
```

### Final Verification

```bash
npm run build
ls -la "docs/features/${FEATURE_ID}/"
```

**Expected files:**
- `about.md` - Feature specification
- `discovery.md` - Discovery record
- `design.md` - UX design (optional)
- `plan.md` - Technical plan
- `implementation.md` - Implementation record
- `review.md` - Review record

---

## Final Report

```
══════════════════════════════════════════════════════════════════
🎉 AUTOPILOT COMPLETE - Feature ${FEATURE_ID}
══════════════════════════════════════════════════════════════════

📊 Execution Summary:
┌────────────────────────────────────────────────────────────────┐
│ Phase              │ Status │ Key Output                       │
├────────────────────────────────────────────────────────────────┤
│ 1. Context Digest  │   ✅   │ Processed about/discovery/design │
│ 2. Skill Compose   │   ✅   │ [N] skills composed              │
│ 3. Planning        │   ✅   │ plan.md created                  │
│ 4. Development     │   ✅   │ [X] files created                │
│ 5. Review          │   ✅   │ [Y] issues fixed, score [Z/10]   │
│ 6. Documentation   │   ✅   │ implementation.md created        │
└────────────────────────────────────────────────────────────────┘

📋 Decision Log Highlights:
- [Key decision 1]
- [Key decision 2]
- [Key decision 3]

📦 Components Implemented:
- Database: [X files]
- Backend API: [Y files]
- Frontend: [Z files]

🔨 Build Status: ✅ ALL PASSING

══════════════════════════════════════════════════════════════════

📋 Next Steps:
1. Review the implementation changes
2. Test the functionality manually
3. Stage and commit when satisfied

══════════════════════════════════════════════════════════════════
```

---

## Critical Rules - AUTOPILOT SPECIFIC

### CONTEXT DELIVERY (NEW - v2)

**ALWAYS:**
- Process context BEFORE dispatching subagents
- Pass DIGEST, not file paths
- Include DECISION LOG from previous phases
- Compose SKILLS based on context analysis
- Pre-identify REFERENCE FILES

**NEVER:**
- Tell subagent to "read about.md" - pass the digest instead
- Let subagent search for similar files - provide references
- Skip skill composition - always analyze for additional skills

### AUTONOMOUS EXECUTION

**NEVER:**
- Ask "do you want to continue?"
- Ask "should I proceed?"
- Ask for confirmation between phases
- Stop to ask for clarification
- Wait for user input

**ALWAYS:**
- Make decisions autonomously (use KISS/YAGNI principles)
- Choose recommended/simplest options automatically
- Fix errors and continue
- Complete 100% of the work

### DECISION LOG PROPAGATION

**Every subagent receives:**
1. Context Digest (same for all)
2. Decision Log (accumulated from previous phases)
3. Coordinator Notes (specific guidance)

**After every subagent:**
1. Extract decisions made
2. Append to Decision Log
3. Include in next subagent's prompt

### SUBAGENT COORDINATION

**Parallel Execution:**
- When dispatching multiple independent subagents, send ALL Task tool calls in a SINGLE message
- Wait for ALL to complete before proceeding

**Sequential Execution (dependencies):**
```
Database → Wait → Update Decision Log → Backend + Frontend (parallel)
```

### NO COMMITS

**NEVER:**
- Execute `git add`, `git commit`, `git stage`
- Ask about committing
- Push to remote

Leave ALL changes as unstaged for user review.

---

## Quick Reference: Prompt Builder

When creating subagent prompts, always include:

```markdown
## ROLE
[Who the subagent is]

## CONTEXT DIGEST
[Pre-processed summary - ~50 lines max]

## DECISION LOG
[Accumulated decisions from previous phases]

## SKILLS
MANDATORY: [always for this area]
ADDITIONAL: [detected from context]

## REFERENCE FILES
[Pre-identified by coordinator - table format]

## COORDINATOR NOTES
[Your specific guidance, warnings, patterns]

## TASK
[What to create/do]

## RULES
[Autopilot rules]

## REPORT FORMAT
[What to return]
```

---

## Skip Planning for Simple Features

If feature is very simple (based on about.md analysis):
- Single component
- < 5 files to modify
- No new database entities

**Then:** Skip Phase 3, go directly to Development using context digest.

**Note:** Still maintain Decision Log even for simple features.
