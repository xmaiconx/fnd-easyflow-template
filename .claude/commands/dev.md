# Development Execution Specialist

> **LANGUAGE RULE:** All interaction with the user (questions, responses, summaries, error messages) and generated documentation (markdown files) MUST be in Brazilian Portuguese (PT-BR). Keep git patterns (commit messages, branch names), code, and technical terms in English.

> **⚠️ REGRA CRÍTICA - DESENVOLVIMENTO CONTÍNUO:** Uma vez iniciado, você DEVE completar 100% do desenvolvimento sem parar para perguntar ao usuário. NÃO pergunte "quer continuar?", "devo prosseguir?", ou similar. Implemente TUDO até o build passar 100%. Se encontrar erros, CORRIJA e continue.

You are now acting as a **Development Execution Coordinator**. Your role is to implement the feature following the technical plan (or directly from requirements for simple features), ensuring all code compiles 100% and contracts are implemented exactly as specified.

This command initiates the DEVELOPMENT PHASE (FASE 3) of feature development.

## Phase 1: Identify Feature & Load Context (AUTOMATIC)

### Step 1: Detect Current Feature

Automatically identify the feature from the current branch:

```bash
# Identify feature from branch name
FEATURE_ID=$(bash .claude/scripts/identify-current-feature.sh)
```

**If feature identified:**
- Display feature ID and path
- **Proceed automatically** - do NOT ask for confirmation

**If no feature identified:**
- List available features: `ls -1 docs/features/ | grep -E '^F[0-9]{4}-'`
- If only ONE feature exists: use it automatically
- If MULTIPLE features exist: ask user which one (this is the ONLY acceptable interruption)

### Step 2: Load Feature Documentation (MANDATORY)

```bash
FEATURE_DIR="docs/features/${FEATURE_ID}"

# Check which documents exist
ls -la "${FEATURE_DIR}/"
```

**Load in priority order:**
1. **plan.md** (if exists) - Technical plan is SOURCE OF TRUTH
2. **about.md** (ALWAYS) - Feature requirements
3. **discovery.md** (ALWAYS) - Discovery insights

**If plan.md does NOT exist:**
- **Proceed automatically** with about.md and discovery.md only (simple feature mode)
- Do NOT ask for confirmation - just inform briefly: "Desenvolvendo sem plan.md (feature simples)"

### Step 3: Analyze Codebase Patterns (MANDATORY)

**Load existing patterns** for reference:

1. **Similar modules:**
   - Search for similar API modules
   - Search for similar workers
   - Search for similar frontend components

2. **Project architecture:**
   - Read `CLAUDE.md` - Complete architecture guide
   - Understand layer separation
   - Identify naming conventions

3. **Tech stack specifics:**
   - Backend: NestJS modules, CQRS, Repository pattern
   - Frontend: React components, Zustand stores, TanStack Query
   - Database: Kysely queries, Knex migrations

## Phase 2: Determine Development Scope (AUTOMATIC)

**DO NOT ask user to confirm scope.** Analyze plan.md (or about.md) and infer automatically:

**Scope Detection Rules:**
- **Backend API**: If plan mentions endpoints, controllers, DTOs, or API routes
- **Workers**: If plan mentions queues, jobs, background processing, or event handlers
- **Frontend**: If plan mentions pages, components, UI, forms, or user interface
- **Database**: If plan mentions entities, tables, migrations, or data models

**Briefly inform what was detected:**
> "Escopo identificado: Backend API + Frontend + Database. Iniciando implementação..."

**Then proceed immediately to implementation. Do NOT wait for confirmation.**

## Phase 3: Implementation (SPECIALIZED AGENTS)

### 3.1 Backend API Development

**When:** Scope detection identified Backend API is needed

**Context to Load:**
- `plan.md` - API contracts (endpoints, request/response)
- Existing controllers in `apps/backend/src/api/modules/`
- Module structure patterns
- Validation strategies
- Error handling patterns

**Responsibilities:**
1. Implement ALL endpoints per contract
2. Implement validations
3. Implement business rules
4. Emit events as specified
5. Handle errors per standards
6. Add appropriate logging

**Implementation Pattern:**
```
apps/backend/src/api/modules/[feature-name]/
├── dtos/
│   ├── Create[Entity]Dto.ts
│   ├── [Entity]ResponseDto.ts
│   └── index.ts
├── commands/
│   ├── Create[Entity]Command.ts
│   ├── handlers/
│   │   ├── Create[Entity]CommandHandler.ts
│   │   └── index.ts
│   └── index.ts
├── events/
│   ├── [Entity]CreatedEvent.ts
│   ├── handlers/
│   │   └── [Entity]CreatedEventHandler.ts
│   └── index.ts
├── [feature].controller.ts
├── [feature].service.ts
└── [feature].module.ts
```

**Deliverable:**
- Code compiling 100%
- Contracts implemented exactly as specified

### 3.2 Worker Development

**When:** Scope detection identified Workers are needed

**Context to Load:**
- `plan.md` - Event/Command contracts
- Existing workers in `apps/backend/src/workers/`
- Job processing patterns
- Queue configurations
- Retry strategies

**Responsibilities:**
1. Implement workers per specification
2. Consume events with correct payload
3. Process commands per contract
4. Implement retries and error handling
5. Emit result events
6. Add logging and metrics
7. Ensure idempotency when needed

**Implementation Pattern:**
```
apps/backend/src/workers/
├── [feature]-worker.ts
└── [feature]-processor.ts
```

**Deliverable:**
- Code compiling 100%
- Event/Command contracts implemented exactly

### 3.3 Frontend Development

**When:** Scope detection identified Frontend is needed

**Context to Load:**
- `plan.md` - API contracts, UI/UX requirements
- Existing components in `apps/frontend/src/`
- Component patterns
- State management (Zustand stores)
- API client patterns (TanStack Query)
- Form patterns (React Hook Form + Zod)

**Responsibilities:**
1. Implement pages/components per specification
2. Integrate with APIs using exact contracts
3. Implement client-side validations
4. Implement loading/error/success states
5. Ensure smooth UX
6. Add user-friendly error handling
7. Ensure responsiveness

**Implementation Pattern:**
```
apps/frontend/src/
├── pages/
│   └── [feature-page].tsx
├── components/
│   └── [feature]/
│       └── [Component].tsx
├── stores/
│   └── [feature]-store.ts
├── hooks/
│   └── use[Feature].ts
└── types/
    └── api/
        └── [feature]/
            └── [Feature]Dto.ts (mirrored from backend)
```

**Deliverable:**
- Code compiling 100%
- API integration working 100%
- UI/UX per specification

### 3.4 Database Development

**When:** Scope detection identified Database changes are needed

**Context to Load:**
- `plan.md` - Data architecture, entities, migrations
- Existing migrations in `libs/app-database/migrations/`
- Existing entities in `libs/domain/src/entities/`
- Existing repositories in `libs/app-database/src/repositories/`
- Kysely patterns
- Knex migration patterns

**Responsibilities:**
1. Create domain entities in `libs/domain/src/entities/`
2. Create Kysely table types in `libs/app-database/src/types/Database.ts`
3. Create Knex migration in `libs/app-database/migrations/`
4. Implement repository in `libs/app-database/src/repositories/`
5. Follow naming conventions (snake_case for DB, camelCase for entities)

**Deliverable:**
- Migrations run successfully
- Entities correctly defined
- Repositories working 100%

## Phase 4: Integration Verification (CRITICAL)

**After implementing all components, verify integration:**

1. **Contract Adherence:**
   - API endpoints match contracts
   - Event payloads match contracts
   - Command payloads match contracts

2. **Data Flow:**
   - Frontend → API works correctly
   - API → Workers works correctly
   - Events flow properly

3. **Error Handling:**
   - Consistent error responses
   - User-friendly error messages
   - Proper logging

4. **Build Verification:**
   ```bash
   # Backend
   cd apps/backend && npm run build

   # Frontend
   cd apps/frontend && npm run build
   ```

**CRITICAL:** Code MUST compile 100%. Fix any build errors before proceeding.

## Phase 5: Documentation (MANDATORY)

Create implementation documentation:

**Create:** `docs/features/${FEATURE_ID}/implementation.md`

**Structure:**
```markdown
# Implementation: [Feature Name]

**Date:** [current date]
**Developer:** Claude Code

## Files Created

### Backend API
- \`apps/backend/src/api/modules/[feature]/[file].ts\` - [~20 word description]
- \`apps/backend/src/api/modules/[feature]/[file].ts\` - [~20 word description]

### Workers
- \`apps/backend/src/workers/[file].ts\` - [~20 word description]

### Frontend
- \`apps/frontend/src/pages/[file].tsx\` - [~20 word description]
- \`apps/frontend/src/components/[file].tsx\` - [~20 word description]

### Database
- \`libs/domain/src/entities/[Entity].ts\` - [~20 word description]
- \`libs/app-database/migrations/[migration].js\` - [~20 word description]
- \`libs/app-database/src/repositories/[Repository].ts\` - [~20 word description]

## Files Modified

- \`[file path]\` - [~20 word description of changes]

## Files Deleted

- \`[file path]\` - [~20 word description of why deleted]

## Build Status

- [ ] Backend compiles successfully
- [ ] Frontend compiles successfully
- [ ] No TypeScript errors
- [ ] No linting errors

## Integration Status

- [ ] API contracts implemented
- [ ] Event contracts implemented
- [ ] Frontend integration working
- [ ] Database migrations tested

## Notes

[Any important notes about the implementation, deviations from plan, or decisions made during development]
```

## Phase 6: Completion

**DO NOT commit code** - it will be reviewed by human first.

Inform the user:

**"✅ Development Complete!**

Implementation finished for feature `${FEATURE_ID}`.

**Summary:**
- Backend API: [X files created]
- Workers: [Y files created]
- Frontend: [Z files created]
- Database: [W files created/modified]

**Build Status:**
- ✅ Backend: Compiling successfully
- ✅ Frontend: Compiling successfully

**Documentation:**
- ✓ Implementation details in `docs/features/${FEATURE_ID}/implementation.md`

**Next Steps:**
1. Review the implementation
2. Test the functionality
3. Run code review (manual or with Code Review Agent)
4. When approved, stage and commit changes
5. Update PR/MR status"

---

## Critical Rules

**⚠️ CONTINUOUS DEVELOPMENT - NO INTERRUPTIONS:**
- **NEVER stop mid-development to ask "do you want to continue?"**
- **NEVER ask for confirmation between phases** (Backend → Frontend → etc.)
- **NEVER summarize progress and wait** - keep implementing until 100% complete
- Once started, development runs to completion WITHOUT user interaction
- Only stop if there's a BLOCKING error that cannot be resolved
- If you hit an error, FIX IT and continue - don't ask permission

**DO NOT:**
- Commit or stage any code (human review comes first)
- Skip any section of the implementation
- Leave code in non-compiling state
- Deviate from contracts without documenting
- Add features not in specification
- **Stop to ask "want to continue?" or "should I proceed?"**
- **Pause between Backend/Frontend/Database phases**

**DO:**
- Follow existing patterns rigorously
- Implement contracts exactly as specified
- Ensure 100% compilation
- Add appropriate logging
- Handle errors properly
- Keep code simple (KISS, YAGNI)
- Document deviations if absolutely necessary
- **Complete ALL phases in a single continuous flow**
- **Run build verification and fix errors automatically**

---

## Skip Planning for Simple Features

For very simple features (e.g., adding a single field, small UI change), you can:

1. Skip `/plan` command
2. Go directly from `/feature` to `/dev`
3. Implement directly from `about.md` and `discovery.md`
4. Still follow all development best practices
