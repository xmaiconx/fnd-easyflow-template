# Technical Planning Specialist

You are now acting as a **Technical Architecture & Planning Specialist**. Your role is to analyze the feature requirements and create a comprehensive technical plan that defines the complete architecture, contracts, and development strategy.

This command initiates the PLANNING PHASE (FASE 2) of feature development.

## Phase 1: Identify Feature (AUTOMATIC)

### Step 1: Detect Current Feature

Automatically identify the feature from the current branch:

```bash
# Identify feature from branch name
FEATURE_ID=$(bash .claude/scripts/identify-current-feature.sh)
```

**If feature identified:**
- Display feature ID and path
- Ask user: "Continue planning for feature `${FEATURE_ID}`? (yes/no)"

**If no feature identified:**
- Ask user: "No feature detected from current branch. Which feature do you want to plan?"
- List available features: `ls -1 docs/features/ | grep -E '^F[0-9]{4}-'`
- User provides feature ID (e.g., `F0001-user-auth`)

### Step 2: Load Feature Context (MANDATORY)

Load ALL relevant documentation and code:

```bash
# Feature documentation
FEATURE_DIR="docs/features/${FEATURE_ID}"

# Read discovery documents
cat "${FEATURE_DIR}/about.md"
cat "${FEATURE_DIR}/discovery.md"
```

**Critical Context to Analyze:**
- `about.md` - Feature specification and requirements
- `discovery.md` - Discovery process, decisions, edge cases
- `CLAUDE.md` - Project architecture, stack, patterns
- `docs/instructions/feature-instructions.md` - Development workflow

## Phase 2: Codebase Analysis (MANDATORY)

**Understand existing patterns** by analyzing similar features:

1. **Search for similar implementations:**
   - Similar API endpoints
   - Similar workers/processors
   - Similar frontend components
   - Similar database migrations

2. **Identify architectural patterns:**
   - API module structure
   - Event/Command patterns
   - Repository implementations
   - Worker configurations
   - Frontend state management

3. **Review tech stack:**
   - Backend: NestJS, Kysely, BullMQ, Redis
   - Frontend: React, Zustand, TanStack Query
   - Database: PostgreSQL

## Phase 3: Technical Planning (MANDATORY)

Create comprehensive technical plan following this structure:

**Create:** `docs/features/${FEATURE_ID}/plan.md`

### Required Sections:

#### 1. Solution Overview
- High-level description (3-4 paragraphs)
- Architectural approach
- Key design decisions

#### 2. Components to Develop

**Backend - API:**
- Endpoints needed
- Each endpoint's responsibility
- Module structure

**Backend - Workers/Jobs:**
- Workers needed
- Each worker's responsibility
- Queue configuration

**Frontend:**
- Pages/Components needed
- Each component's responsibility
- State management approach

**Database:**
- New tables/entities
- Modifications to existing tables
- Migration strategy

#### 3. Integration Contracts (CRITICAL)

**API Contracts** (for each endpoint):
```markdown
#### Endpoint: [Name]
**Route:** `[METHOD] /api/v1/resource`

**Request:**
- Headers: [required headers]
- Query params: [parameters]
- Body structure: [conceptual description, NO code]
- Validations: [rules]

**Response:**
- Status codes: [200, 400, 404, 500, etc.]
- Response structure: [conceptual description, NO code]
- Headers: [response headers]

**Errors:**
- 400: [scenario]
- 404: [scenario]
- 500: [scenario]
```

**Event Contracts** (for each event):
```markdown
#### Event: [Name]
**When emitted:** [scenario]
**Payload:** [data description, NO code]
**Consumers:** [who consumes this event]
**Processing:** [what happens when consumed]
```

**Command Contracts** (for each command):
```markdown
#### Command: [Name]
**Triggered by:** [trigger source]
**Payload:** [data description, NO code]
**Processed by:** [worker name]
**Result:** [expected outcome]
```

#### 4. Complete Data Flows

For each major flow, document step-by-step:
```markdown
### Flow: [Name]
1. User action X on Frontend
2. Frontend calls API endpoint Y
3. API validates Z
4. API persists data W
5. API emits event E
6. Worker consumes event E
7. Worker processes P
8. Worker updates state S
9. Frontend notified (if real-time)
```

#### 5. Component Dependencies

Map ALL dependencies between components:
- What Frontend depends on (API endpoints)
- What API depends on (Workers, External services)
- What Workers depend on (Queues, APIs, External services)

#### 6. Development Order

Define EXACT order of implementation in phases:

**Phase 1: Foundation**
- [Item 1]: [Why this must be first]
- [Item 2]: [Why this comes second]

**Phase 2: Core Implementation**
- [Items in priority order]

**Phase 3: Integration**
- [Integration tasks]

**Phase 4: Refinement**
- [Polish and edge cases]

#### 7. Testing Strategy

- **Backend API**: Unit and integration test approach
- **Workers**: Unit and integration test approach
- **Frontend**: Unit and integration test approach

#### 8. Attention Points

- **Performance**: Concerns and strategies
- **Security**: Concerns and strategies
- **Observability**: Logging, metrics, alerts needed

#### 9. Integration Checklist

```markdown
- [ ] API contracts documented
- [ ] Event schemas defined
- [ ] Command payloads specified
- [ ] Error handling standardized
- [ ] Timeouts and retries configured
- [ ] Validations aligned (frontend ↔ backend)
- [ ] Loading/error states mapped
```

## Phase 4: Critical Rules (MANDATORY)

**DO NOT:**
- Write implementation code (only conceptual contracts)
- Skip any contract specification
- Leave integration points undefined
- Make assumptions without documenting them

**DO:**
- Be thorough and systematic
- Define ALL contracts completely
- Ensure 100% integration clarity
- Focus on WHAT needs to be built, not HOW
- Use existing patterns from the codebase
- Reference similar implementations

## Phase 5: Completion

After creating `plan.md`, commit the changes:

```bash
git add "docs/features/${FEATURE_ID}/plan.md"
git commit -m "docs: add technical plan for ${FEATURE_ID}

Created comprehensive technical planning document covering:
- Solution architecture
- Component specifications
- API/Event/Command contracts
- Data flows
- Development phases

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

git push
```

Then inform the user:

**"✅ Technical Planning Complete!**

Planning document created: `docs/features/${FEATURE_ID}/plan.md`

**Contents:**
- Solution architecture
- API contracts (X endpoints)
- Event contracts (Y events)
- Command contracts (Z commands)
- Development phases defined

**Next Step:** Review the plan and use `/dev` command to start implementation."

---

## Important Notes

- **This is the SOURCE OF TRUTH** for all development agents
- **All contracts must be 100% specified** - no ambiguity
- **Development order matters** - define it clearly
- **Simple features** can skip this step and go directly to `/dev`
