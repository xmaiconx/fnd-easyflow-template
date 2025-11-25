# Bug Investigation & Fix Specialist

You are now acting as a **Bug Investigation & Fix Specialist**. Your role is to investigate bugs found during feature development, identify root causes, implement fixes, and document all changes with proper versioning.

This command is used DURING development when bugs are discovered in the feature being worked on.

## Phase 1: Identify Feature & Load Context (AUTOMATIC)

### Step 1: Detect Current Feature

Automatically identify the feature from the current branch:

```bash
# Identify feature from branch name
FEATURE_ID=$(bash .claude/scripts/identify-current-feature.sh)
```

**If feature identified:**
- Display feature ID and path
- Ask user: "Investigate and fix bug for feature `${FEATURE_ID}`? (yes/no)"

**If no feature identified:**
- Ask user: "No feature detected from current branch. Which feature has the bug?"
- List available features: `ls -1 docs/features/ | grep -E '^F[0-9]{4}-'`
- User provides feature ID (e.g., `F0001-user-auth`)

### Step 2: Load Feature Documentation (MANDATORY)

```bash
FEATURE_DIR="docs/features/${FEATURE_ID}"

# Load ALL documentation
cat "${FEATURE_DIR}/about.md"
cat "${FEATURE_DIR}/discovery.md"

# Load if exists
if [ -f "${FEATURE_DIR}/plan.md" ]; then
    cat "${FEATURE_DIR}/plan.md"
fi

# CRITICAL: Load implementation to understand what was developed
if [ -f "${FEATURE_DIR}/implementation.md" ]; then
    cat "${FEATURE_DIR}/implementation.md"
fi
```

**Critical Context to Understand:**
- `about.md` - Expected behavior and acceptance criteria
- `discovery.md` - Business rules and edge cases
- `plan.md` - Technical architecture and contracts (if exists)
- `implementation.md` - **FILES CREATED/MODIFIED** (essential for investigation)

## Phase 2: Bug Investigation (MANDATORY)

### Step 1: Gather Bug Information

Ask the user these questions systematically:

1. **Bug Description**: "Describe the bug you encountered. What happened vs. what was expected?"
   - Actual behavior
   - Expected behavior
   - Error messages (if any)

2. **Steps to Reproduce**: "What steps did you take to encounter this bug?"
   - Step-by-step actions
   - Input data used
   - Environment (frontend, backend, API call, etc.)

3. **Scope**: "Where did you observe the bug?"
   - Frontend UI behavior
   - API response
   - Worker processing
   - Database state
   - Console errors/logs

4. **Frequency**: "Does this happen consistently or intermittently?"
   - Always (100%)
   - Sometimes (describe conditions)
   - Once (hard to reproduce)

### Step 2: Analyze Implementation

Based on `implementation.md`, identify which files are likely involved:

**Example Analysis:**
```
Bug reported in: Login form validation
Files likely involved (from implementation.md):
- apps/frontend/src/pages/login.tsx - Login page component
- apps/frontend/src/components/auth/LoginForm.tsx - Form component
- apps/backend/src/api/modules/auth/auth.controller.ts - API endpoint
- apps/backend/src/api/modules/auth/dtos/SignInDto.ts - Validation rules
```

### Step 3: Investigate Root Cause

1. **Read relevant files** identified in Step 2
2. **Trace the flow** from user action to bug manifestation
3. **Compare with contracts** from plan.md (if exists)
4. **Check business rules** from about.md and discovery.md
5. **Identify the root cause** - be specific and precise

**Document your findings:**
```markdown
## Root Cause Analysis

**Bug:** [Brief description]

**Files Involved:**
- [file path] - [what's wrong]

**Root Cause:**
[Detailed explanation of WHY the bug occurs - 2-3 paragraphs]

**Evidence:**
[Code snippet or behavior that proves this is the cause]
```

## Phase 3: Fix Implementation (MANDATORY)

### Step 1: Plan the Fix

Before coding, explain:
- What needs to change
- Which files will be modified
- Why this fix resolves the root cause
- What side effects to watch for

### Step 2: Implement the Fix

Implement the fix following these principles:

**DO:**
- Fix the root cause, not the symptom
- Follow existing code patterns
- Add defensive checks if needed
- Ensure fix aligns with acceptance criteria
- Verify fix doesn't break other flows

**DO NOT:**
- Band-aid solutions
- Introduce new bugs
- Deviate from architecture
- Skip validation

### Step 3: Verify the Fix

**Compilation Check:**
```bash
# Backend
cd apps/backend && npm run build

# Frontend
cd apps/frontend && npm run build
```

**CRITICAL:** Code MUST compile 100%. Fix any build errors.

**Integration Check:**
- Does the fix resolve the reported bug?
- Does it maintain existing functionality?
- Does it follow the contracts (from plan.md)?

## Phase 4: Documentation (MANDATORY)

### Step 1: Create Fix Documentation

**Create/Update:** `docs/features/${FEATURE_ID}/fixes.md`

**If file doesn't exist, create with:**
```markdown
# Bug Fixes: [Feature Name]

This document tracks all bugs found and fixed during development of this feature.

---

## Fix 001 - [Short Bug Title]

**Date:** [YYYY-MM-DD HH:MM]
**Reported By:** [User/Developer name]
**Fixed By:** Claude Code

### Bug Description

[What was the bug - 2-3 sentences]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What was happening]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Bug manifests]

### Root Cause

[Detailed explanation of WHY the bug occurred - reference specific files and code]

### Fix Implementation

**Files Modified:**
- `[file path]` - [What was changed - ~30 words]
- `[file path]` - [What was changed - ~30 words]

**Changes Summary:**
[Detailed description of the fix - 50-100 words explaining what code was changed and why]

### Verification

- [x] Bug no longer reproduces
- [x] Existing functionality intact
- [x] Code compiles successfully
- [x] Acceptance criteria still met

### Side Effects

[Any side effects or additional changes needed - or "None" if none]

---
```

**If file exists, append new fix:**
```markdown
## Fix 002 - [Short Bug Title]

[Same structure as above]

---
```

### Step 2: Update Implementation Documentation

**Update:** `docs/features/${FEATURE_ID}/implementation.md`

Add versioning section at the top (before "Files Created"):

```markdown
# Implementation: [Feature Name]

**Date:** [original date]
**Developer:** Claude Code

## Revision History

### Revision 002 - [YYYY-MM-DD HH:MM]
**Type:** Bug Fix
**Summary:** [~50 words describing what was fixed and why]

**Modified Files:**
- `[file path]` - Fixed [issue]
- `[file path]` - Updated [behavior]

**Related Fix Documentation:** See `fixes.md` - Fix 002

---

### Revision 001 - [YYYY-MM-DD HH:MM]
**Type:** Bug Fix
**Summary:** [~50 words]

**Modified Files:**
- `[file path]` - Fixed [issue]

**Related Fix Documentation:** See `fixes.md` - Fix 001

---

## Files Created
[Original content remains unchanged]
```

**Important:**
- Each fix gets a new revision number (incremental)
- Summary must be ~50 words (not more)
- Always reference the fix documentation
- Newest revision at the top

## Phase 5: Completion

**DO NOT commit code** - it will be reviewed by human first.

Inform the user:

**"✅ Bug Fix Complete!**

Bug investigation and fix completed for feature `${FEATURE_ID}`.

**Bug:** [Short description]
**Root Cause:** [Brief explanation]

**Files Modified:**
- [File 1]
- [File 2]

**Build Status:**
- ✅ Backend: Compiling successfully
- ✅ Frontend: Compiling successfully

**Documentation Updated:**
- ✓ `fixes.md` - Fix [number] documented
- ✓ `implementation.md` - Revision [number] added

**Next Steps:**
1. Test the fix manually
2. Verify the bug is resolved
3. Check no regressions were introduced
4. When satisfied, stage and commit changes:
   ```
   git add [modified files]
   git commit -m \"fix(${FEATURE_ID}): [short description]

   [Longer description referencing fix number]

   Closes #[issue] (if applicable)

   🤖 Generated with Claude Code

   Co-Authored-By: Claude <noreply@anthropic.com>\"
   git push
   ```"

---

## Critical Rules

**DO NOT:**
- Commit or stage any code (human review comes first)
- Band-aid the symptom without fixing root cause
- Skip documentation
- Leave code in non-compiling state
- Introduce new bugs while fixing old ones

**DO:**
- Investigate thoroughly before coding
- Fix the root cause
- Document everything (fixes.md + implementation.md)
- Verify compilation 100%
- Test the fix resolves the bug
- Check for side effects
- Maintain revision history

---

## Example Usage

**User:** "I'm testing the login feature and getting a validation error even with correct credentials. /fix"

**Agent Response:**
1. Detects feature: F0001-user-authentication
2. Loads about.md, discovery.md, plan.md, implementation.md
3. Asks:
   - "Describe the bug you encountered. What happened vs. what was expected?"
   - "What steps did you take?"
   - "What error message did you see?"
4. Investigates files from implementation.md
5. Identifies root cause (e.g., validation rule mismatch)
6. Implements fix
7. Documents in fixes.md
8. Updates implementation.md with revision
9. Reports completion

---

## Versioning Rules

**Revision Numbers:**
- Sequential: 001, 002, 003, etc.
- One per bug fix
- Never reuse numbers

**Revision Summary:**
- Exactly ~50 words (45-55 range)
- Describe WHAT was fixed and WHY
- Reference root cause
- Be precise and technical

**Example Good Summary:**
```
Fixed validation mismatch between frontend and backend for email field. Backend was requiring email format validation but frontend only checked for empty field. Updated frontend validation schema to match backend DTOs, ensuring consistent email format validation across the stack. This resolves login failures with valid credentials.
```

**Example Bad Summary:**
```
Fixed bug  # Too vague, no details
```
