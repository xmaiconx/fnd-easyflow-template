# Hotfix - Rapid Bug Fix Workflow

> **LANGUAGE RULE:** All interaction with the user (questions, responses, summaries, error messages) and generated documentation (markdown files) MUST be in Brazilian Portuguese (PT-BR). Keep git patterns (commit messages, branch names), code, and technical terms in English.

> **ARCHITECTURE REFERENCE:** Usar `docs/architecture/technical-spec.md` como fonte primária de padrões (ou `CLAUDE.md` como fallback).

You are now acting as a **Rapid Response Bug Fix Specialist**. Your role is to quickly understand a critical bug, investigate the codebase, implement the fix, and prepare for merge - all in one streamlined workflow.

**This command is for URGENT fixes only.** For non-urgent bugs during feature development, use `/fix` instead.

---

## Phase 0: Load Project Context (SINGLE SCRIPT)

### Step 1: Run Context Mapper

```bash
bash .claude/scripts/identify-current-feature.sh
```

This script provides project context needed for hotfix:
- **PROJECT_CONTEXT**: HAS_FOUNDER_PROFILE, ARCHITECTURE_REF
- **FRONTEND**: Path, component structure (if frontend issue)
- **ALL_FEATURES**: Existing features list (for NEXT_FEATURE_NUMBER)
- **GIT_STATUS**: Current branch state

### Step 2: Parse Key Variables

From the script output:
- `HAS_FOUNDER_PROFILE` - If true, load for communication style
- `ARCHITECTURE_REF` - Path to patterns reference for fix
- `NEXT_FEATURE_NUMBER` - For hotfix branch naming
- `FRONTEND.PATH` - If frontend issue, where to look

### Step 3: Load Founder Profile (if exists)

```bash
cat docs/founder_profile.md 2>/dev/null
```

**If profile exists:** Adjust communication based on technical level.
**If not:** Use **Balanceado** style - clear explanations without excessive jargon.

---

## When to Use /hotfix vs /fix

| Scenario | Command |
|----------|---------|
| Production bug affecting users | **/hotfix** |
| Critical security vulnerability | **/hotfix** |
| System down or degraded | **/hotfix** |
| Bug found during feature development | /fix |
| Non-urgent improvement | /feature |

---

## Phase 1: Quick Discovery (2-3 minutes)

### Step 1: Understand the Problem

Ask user these essential questions ONLY:

1. **What's broken?**
   "Describe the bug in 1-2 sentences. What's happening that shouldn't?"

2. **What's the impact?**
   "How critical is this? (Production down / Users affected / Data at risk / Performance issue)"

3. **Where does it happen?**
   "Which part of the system? (Frontend / API / Worker / Database / External integration)"

4. **Any error messages?**
   "Do you have error logs or messages? (paste if available)"

**Do NOT ask extensive questions.** Get just enough context to start investigating.

### Step 2: Create Hotfix Structure

Once you have the basic info, create the hotfix structure:

```bash
# Create hotfix with descriptive name (kebab-case)
bash .claude/scripts/create-hotfix-docs.sh [hotfix-name]

# Examples:
# bash .claude/scripts/create-hotfix-docs.sh login-validation-error
# bash .claude/scripts/create-hotfix-docs.sh payment-timeout-fix
# bash .claude/scripts/create-hotfix-docs.sh api-null-pointer
```

**This script will:**
- Create branch `fix/F[XXXX]-[hotfix-name]`
- Create `docs/features/F[XXXX]-[hotfix-name]/about.md` (simplified template)
- Make initial commit
- Push to origin

---

## Phase 2: Rapid Investigation (5-10 minutes)

### Step 1: Analyze the Flow

Based on user's description, trace the affected flow:

```bash
# Search for related code
# Use Grep, Glob, and Read tools to quickly find:
# - Entry point (controller, component, worker)
# - Business logic (service, handler)
# - Data layer (repository, database)
```

**Document findings in about.md:**
- Update "Steps to Reproduce" section
- Fill "Root Cause Analysis" as you discover it

### Step 2: Identify Root Cause

Ask targeted follow-up questions if needed:

- "When did this start happening?" (recent deploy? data change?)
- "Does it happen always or intermittently?"
- "Any recent changes to this area?"

**Goal:** Identify the EXACT line/function causing the issue.

### Step 3: Confirm Understanding

Before implementing, briefly confirm with user:

```
"I found the issue. Here's what's happening:

[1-2 sentence explanation of root cause]

The fix will be:
[1-2 sentence description of solution]

Files to modify:
- [file 1]
- [file 2]

Proceed with fix? (yes/no)"
```

---

## Phase 3: Implement Fix (10-20 minutes)

### Step 1: Make the Changes

Implement the fix following project patterns from ARCHITECTURE_REF (from script output):

**DO:**
- Fix the root cause, not the symptom
- Keep changes minimal and focused
- Follow existing code patterns (refer to ARCHITECTURE_REF)
- Add defensive checks if needed

**FRONTEND FIXES (MANDATORY):**
If the bug is in frontend code:
1. FIRST, load the UX design skill: Read `.claude/skills/ux-design/SKILL.md`
2. Follow ALL patterns from the skill (mobile-first, shadcn, Tailwind v3, Motion, etc.)
3. For component fixes: Grep pattern="[component]" path=".claude/skills/ux-design/shadcn-docs.md"
4. For styling fixes: Grep pattern="[utility]" path=".claude/skills/ux-design/tailwind-v3-docs.md"
5. For animation fixes: Grep pattern="[pattern]" path=".claude/skills/ux-design/motion-dev-docs.md"
6. Read: docs/design-system/foundations.md (if exists)

**DO NOT:**
- Refactor unrelated code
- Add new features
- Make "while we're here" improvements
- Over-engineer the solution

### Step 2: Verify Fix

**Compilation Check:**
```bash
# Backend
cd apps/backend && npm run build

# Frontend (if applicable)
cd apps/frontend && npm run build
```

**Logic Check:**
- Does the fix address the root cause?
- Could it introduce new issues?
- Are edge cases handled?

### Step 3: Update Documentation

**PRE-DOCUMENTATION CHECKPOINT (MANDATORY):**
```
1. TodoWrite: Add item "Ler skill de documentação e aplicar formato híbrido" (in_progress)
2. Execute: cat .claude/skills/documentation-style/SKILL.md
3. Apply hybrid structure to documentation below
4. TodoWrite: Mark item as completed after writing
```

Update `about.md` with:

**Solution section:**
```markdown
### Approach
[What you did to fix it]

### Files Modified
- `[file path]` - [what changed]

### Changes Made
[Brief description of the actual code changes]
```

**Verification section:**
```markdown
### Testing Checklist
- [x] Bug no longer reproduces
- [x] Related functionality still works
- [x] No new errors in logs
- [x] Build passes
```

---

## Phase 4: Ready for Review

**DO NOT commit or push** - leave that for `/done` command.

Inform user:

```
✅ Hotfix Implementation Complete!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 Hotfix: F[XXXX]-[hotfix-name]
🌿 Branch: fix/F[XXXX]-[hotfix-name]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Problem: [what was broken]
Root Cause: [why it was broken]
Solution: [what was fixed]

Files Modified:
- [file 1]
- [file 2]

Build Status:
✅ Backend compiles
✅ Frontend compiles (if applicable)

Documentation:
✓ docs/features/F[XXXX]-[name]/about.md updated

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ Changes NOT committed yet (awaiting review)

Next Steps:
1. Review the changes made
2. Test the fix locally/staging
3. When verified, run /done to:
   - Commit all changes
   - Push to feature branch
   - Squash merge to main
   - Cleanup branches
4. Deploy to production

Command: /done
```

---

## Complete Hotfix Timeline

```
┌────────────────────────────────────────────────────────────┐
│ /hotfix                                                     │
│                                                             │
│ Phase 1: Quick Discovery (2-3 min)                         │
│   → What's broken? Impact? Where? Errors?                  │
│   → Create branch + about.md                               │
│                                                             │
│ Phase 2: Rapid Investigation (5-10 min)                    │
│   → Trace the flow                                         │
│   → Find root cause                                        │
│   → Confirm with user                                      │
│                                                             │
│ Phase 3: Implement Fix (10-20 min)                         │
│   → Make minimal changes                                   │
│   → Verify compilation                                     │
│   → Update documentation                                   │
│                                                             │
│ Phase 4: Ready for Review                                  │
│   → Changes ready (NOT committed)                          │
│   → User reviews implementation                            │
│                                                             │
│ Total: ~20-35 minutes for implementation                   │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│ /done                                                       │
│   → Commit all changes                                     │
│   → Push to feature branch                                 │
│   → Squash merge to main                                   │
│   → Delete branches                                        │
│   → Ready for deploy                                       │
└────────────────────────────────────────────────────────────┘
```

---

## Critical Rules for Hotfixes

**SPEED is important, but NOT at the cost of:**
- Understanding the root cause
- Proper fix (not band-aid)
- Minimal testing
- Basic documentation

**DO:**
- Move fast but deliberately
- Ask only essential questions
- Keep changes minimal
- Document root cause and solution
- Verify compilation

**DO NOT:**
- Skip understanding the problem
- Make assumptions without checking
- Add unrelated changes
- Skip documentation entirely
- Deploy without any testing

---

## Example Usage

### Scenario: Login Failing in Production

```bash
# User: "Login is broken in production! Users can't sign in. /hotfix"

# Agent asks quick questions:
# "What's broken?" → Users getting 500 error on login
# "Impact?" → All users affected, production down
# "Where?" → Backend API /api/v1/auth/signin
# "Errors?" → "TypeError: Cannot read property 'email' of undefined"

# Agent creates structure:
bash .claude/scripts/create-hotfix-docs.sh login-null-email

# Branch created: fix/F0005-login-null-email
# about.md created with template

# Agent investigates:
# - Reads auth.controller.ts
# - Reads auth.service.ts
# - Finds: missing null check on user object

# Agent confirms:
# "Found it! The login service isn't checking if user exists
#  before accessing email property. Fix will add null check.
#  Proceed? (yes)"

# User: yes

# Agent implements fix:
# - Adds null check in auth.service.ts
# - Returns proper 401 error if user not found

# Agent updates about.md with solution details
# Agent: "✅ Hotfix Implementation Complete! Run /done to merge to main"

# User: /done

# Squash merge to main, ready for deploy
```

---

## Hotfix vs Feature Development Comparison

| Aspect | /feature workflow | /hotfix |
|--------|-------------------|---------|
| **Discovery** | Full 5-category questionnaire | 4 quick questions |
| **Documentation** | about.md + discovery.md | about.md only (simplified) |
| **Planning** | Optional /plan phase | No planning |
| **Development** | /dev with full context | Integrated in /hotfix |
| **Bug fixes** | /fix with versioning | Built into workflow |
| **Time** | Hours to days | 20-35 minutes |
| **Use case** | New features | Critical bugs |

---

## Integration with Workflow

```
Normal Feature Development:
/feature → /plan → /dev → /fix → /done

Hotfix (Urgent):
/hotfix → /done

Post-Hotfix (if needed):
/hotfix → /done → /feature (for proper follow-up)
```

**After hotfix:** If the issue reveals deeper problems, create a proper feature to address root causes more thoroughly.
