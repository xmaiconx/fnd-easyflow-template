# API Testing Skill

> **Trigger:** Use this skill after `/dev` completes to generate httpyac test files for the implemented API endpoints. Also use when user asks to create API tests, generate test files, or test backend endpoints.

## Purpose

Generate comprehensive [httpyac](https://httpyac.github.io/) test files (`.http`) for API endpoints based on the feature implementation. This skill analyzes the implemented code and creates executable test scripts.

**Why httpyac?**
- npm-based (`npm install httpyac`) - auto-installable
- Uses `.http` format (VS Code REST Client compatible)
- JavaScript assertions (familiar to devs)
- VS Code extension for debugging

---

## Phase 0: Ensure httpyac is installed

### Step 1: Check/Install httpyac

```bash
# Check if httpyac exists in devDependencies
grep -q '"httpyac"' package.json || npm install httpyac --save-dev
```

### Step 2: Add npm script (if not exists)

Check `package.json` and add if missing:

```json
{
  "scripts": {
    "test:api": "httpyac send docs/features/*/tests/api/*.http --all -e local"
  }
}
```

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

### Step 2: Generate Environment File

Create `tests/api/http-client.env.json`:

```json
{
  "local": {
    "API_URL": "http://localhost:3001/api/v1",
    "TEST_EMAIL": "test@example.com",
    "TEST_PASSWORD": "TestPassword123!"
  },
  "staging": {
    "API_URL": "https://staging-api.example.com/api/v1",
    "TEST_EMAIL": "test@example.com",
    "TEST_PASSWORD": "TestPassword123!"
  }
}
```

### Step 3: Generate httpyac Test Files

Read `.claude/skills/api-testing/httpyac-patterns.md` for patterns.

**File naming convention:** `[NN]-[endpoint-group].http`
- `00-setup.http` - Authentication and setup
- `01-[module]-crud.http` - CRUD operations
- `02-[module]-validation.http` - Validation tests
- `03-[module]-edge-cases.http` - Edge cases

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
2. Add delay and verification steps using `{{$sleep 3000}}`
3. Include Redis queue checks if admin endpoint exists

---

## Phase 4: Validation

### Checklist Before Completion

- [ ] httpyac installed as devDependency
- [ ] npm script `test:api` added
- [ ] All endpoints from implementation.md have tests
- [ ] Authentication flow is tested first (00-setup.http)
- [ ] Environment file has all required variables
- [ ] Test plan documents all scenarios
- [ ] Edge cases are covered
- [ ] Worker jobs have verification (if applicable)

---

## Output Structure

```
docs/features/FXXXX-feature/tests/
├── api/
│   ├── http-client.env.json    # Environment variables
│   ├── 00-setup.http           # Auth + setup
│   ├── 01-[module]-crud.http   # Main CRUD tests
│   ├── 02-[module]-edge.http   # Edge cases
│   └── test-plan.md            # Test documentation
└── test-report.md              # Generated after execution
```

---

## Integration with /dev

When called from `/dev` or `/autopilot`:

1. Ensure httpyac is installed (`npm install httpyac -D`)
2. Add npm script if not exists
3. Automatically detect implemented endpoints
4. Generate all test files
5. Report: "Testes httpyac gerados em `docs/features/FXXXX/tests/api/`"
6. Suggest: "Execute `npm run test:api` ou `/test-api` para rodar os testes"

---

## Critical Rules

**DO:**
- Ensure httpyac is installed before generating tests
- Generate tests based on ACTUAL implementation (read the code)
- Include both success and error scenarios
- Use meaningful assertions (status codes, response structure)
- Document what each test validates
- Use `.http` extension (VS Code compatible)

**DO NOT:**
- Generate tests for endpoints that don't exist
- Skip authentication in protected endpoints
- Hardcode sensitive data (use environment variables)
- Forget to test validation rules from about.md
- Use `.hurl` extension (we use httpyac, not Hurl)
