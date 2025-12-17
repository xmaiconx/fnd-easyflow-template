# API Testing Skill

> **Trigger:** Use this skill after `/dev` completes to generate Hurl test files for the implemented API endpoints. Also use when user asks to create API tests, generate test files, or test backend endpoints.

## Purpose

Generate comprehensive [Hurl](https://hurl.dev/) test files for API endpoints based on the feature implementation. This skill analyzes the implemented code and creates executable test scripts.

---

## Phase 1: Context Gathering

### Step 1: Identify Feature

```bash
FEATURE_ID=$(bash .claude/scripts/identify-current-feature.sh)
```

### Step 2: Load Implementation Details

Read the following files in order:

1. `docs/features/${FEATURE_ID}/implementation.md` - Files created/modified
2. `docs/features/${FEATURE_ID}/about.md` - Business rules and acceptance criteria
3. Controllers in `apps/backend/src/api/modules/*/` - Actual endpoints

### Step 3: Extract Endpoint Information

For each controller, extract:
- HTTP method (GET, POST, PUT, DELETE, PATCH)
- Route path
- Required authentication (look for `@UseGuards`)
- Request body DTOs
- Response structure

---

## Phase 2: Test Generation

### Step 1: Create Test Directory Structure

```bash
mkdir -p "docs/features/${FEATURE_ID}/tests/api"
```

### Step 2: Generate Variables File

Create `tests/api/variables.env`:

```env
# API Testing Variables
# Copy to variables.local.env and fill with real values

API_URL=http://localhost:3001/api/v1
TEST_EMAIL=test@example.com
TEST_PASSWORD=TestPassword123!
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=AdminPassword123!

# Tokens (captured during test execution)
# TOKEN will be captured from auth endpoint
```

### Step 3: Generate Hurl Test Files

Read `.claude/skills/api-testing/hurl-patterns.md` for patterns.

**File naming convention:** `[NN]-[endpoint-group].hurl`
- `00-setup.hurl` - Authentication and setup
- `01-[module]-crud.hurl` - CRUD operations
- `02-[module]-validation.hurl` - Validation tests
- `03-[module]-edge-cases.hurl` - Edge cases

### Step 4: Generate Test Plan

Create `tests/api/test-plan.md`:

```markdown
# API Test Plan - [Feature Name]

## Endpoints Covered

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/v1/... | JWT | ... |

## Test Scenarios

### Happy Path
- [ ] Scenario 1
- [ ] Scenario 2

### Validation
- [ ] Required fields
- [ ] Invalid data types

### Edge Cases
- [ ] Empty results
- [ ] Large payloads

### Workers (if applicable)
- [ ] Job enqueued
- [ ] Job processed
```

---

## Phase 3: Worker Testing (If Applicable)

If the feature includes workers, read `.claude/skills/api-testing/worker-testing-guide.md` and:

1. Identify which endpoints trigger worker jobs
2. Add delay and verification steps
3. Include Redis queue checks if admin endpoint exists

---

## Phase 4: Validation

### Checklist Before Completion

- [ ] All endpoints from implementation.md have tests
- [ ] Authentication flow is tested first (00-setup.hurl)
- [ ] Variables file has all required placeholders
- [ ] Test plan documents all scenarios
- [ ] Edge cases are covered
- [ ] Worker jobs have verification (if applicable)

---

## Output Structure

```
docs/features/FXXXX-feature/tests/
├── api/
│   ├── variables.env           # Template variables
│   ├── 00-setup.hurl           # Auth + setup
│   ├── 01-[module]-crud.hurl   # Main CRUD tests
│   ├── 02-[module]-edge.hurl   # Edge cases
│   └── test-plan.md            # Test documentation
└── test-report.md              # Generated after execution
```

---

## Integration with /dev

When called from `/dev` or `/autopilot`:

1. Automatically detect implemented endpoints
2. Generate all test files
3. Report: "Testes Hurl gerados em `docs/features/FXXXX/tests/api/`"
4. Suggest: "Execute `/test-api` para rodar os testes"

---

## Critical Rules

**DO:**
- Generate tests based on ACTUAL implementation (read the code)
- Include both success and error scenarios
- Use meaningful assertions (status codes, response structure)
- Document what each test validates

**DO NOT:**
- Generate tests for endpoints that don't exist
- Skip authentication in protected endpoints
- Hardcode sensitive data (use variables)
- Forget to test validation rules from about.md
