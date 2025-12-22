---
name: code-review
description: |
  Code review: IoC, RESTful, Contracts, Security (OWASP), Clean Architecture, SOLID.
---

# Code Review

Skill para validação de código implementado contra padrões do projeto.

**Use para:** Validar código, identificar violações, auto-corrigir (autopilot)
**Não use para:** Implementar código, planejamento, discovery

**Referência:** Sempre consultar `CLAUDE.md` para padrões gerais do projeto.

---

## Skills de Referência

**Carregar ANTES de revisar:**
- Backend: `.claude/skills/backend-development/SKILL.md`
- Database: `.claude/skills/database-development/SKILL.md`
- Frontend (Code): `.claude/skills/frontend-development/SKILL.md`
- Frontend (UI): `.claude/skills/ux-design/SKILL.md`
- Security: `.claude/skills/security-audit/SKILL.md`

---

## Categorias de Validação

### 1. IoC Configuration (CRÍTICO)

{"check":["services in providers","handlers in providers","module in AppModule","repos exported","barrel exports in libs/"]}

{"errors":[{"err":"Can't resolve dependencies","fix":"add to providers"},{"err":"cross-module","fix":"add to exports"},{"err":"404","fix":"import in AppModule"}]}

---

### 2. RESTful Compliance (CRÍTICO)

{"check":[{"rule":"HTTP method","correct":"GET read, POST create, DELETE remove","wrong":"POST for read"},{"rule":"URL","correct":"/users (noun)","wrong":"/getUsers (verb)"},{"rule":"Status","correct":"201 POST, 204 DELETE","wrong":"200 for all"}]}

---

### 3. Contract Validation (CRÍTICO)

{"frontendBackend":[{"backend":"Date","frontend":"string"},{"backend":"Enum","frontend":"union type"},{"rule":"sync required/optional fields"}]}

{"jsonb":["NO double parse","NO double stringify","Kysely handles automatically"]}

---

### 4. Security (OWASP)

{"checks":[{"cat":"Injection","check":"parametrized queries"},{"cat":"Auth","check":"guards applied"},{"cat":"DataExposure","check":"no secrets in logs"},{"cat":"AccessControl","check":"filter by account_id"},{"cat":"XSS","check":"outputs sanitized"}]}

{"multiTenant":["EVERY query filters account_id","account_id from JWT not body"]}

---

### 5. Architecture & SOLID

{"checks":["domain never imports outer layers","SRP: one class one thing","DIP: depend on interfaces"]}

---

### 6. Code Quality

{"checks":["no any type","DTOs follow naming","no console.log (use logger)","no commented code","no unused imports","exception handling"]}

---

### 7. Database

{"checks":["migration created","has up and down","Kysely types updated","entity exported","repository exported"]}

---

### 8. Environment

{"checks":["new vars in .env.example","example values not real","use IConfigurationService not process.env"]}

---

## Score

{"weights":{"ioc":15,"restful":15,"contracts":15,"security":20,"architecture":15,"quality":10,"database":10}}

{"status":{"8-10":"APPROVED","6-7":"NEEDS ATTENTION","4-5":"NEEDS FIXES","0-3":"CRITICAL"}}

---

## Process

### Phase 1: Load Context
1. `bash .claude/scripts/detect-project-state.sh --branch-changes`
2. Read reference skills
3. Read CLAUDE.md
4. Identify ALL changed files

### Phase 2: Validate
For EACH file: IoC → RESTful → Contracts → Security → Quality

### Phase 3: Fix (autopilot)
1. Fix each violation
2. Verify build
3. Document before/after

### Phase 4: Report
Create `docs/features/${featureId}/review.md`

---

## Output Template

```markdown
# Code Review: [Feature]

**Date:** [date] | **Status:** ✅ APPROVED

## Score

| Category | Score | Status |
|----------|-------|--------|
| IoC | X/10 | ✅ |
| RESTful | X/10 | ✅ |
| Contracts | X/10 | ✅ |
| Security | X/10 | ✅ |
| Architecture | X/10 | ✅ |
| Quality | X/10 | ✅ |
| Database | X/10 | ✅ |
| **OVERALL** | **X/10** | **✅** |

## Issues Found & Fixed

### Issue #1: [Title]
**Category:** [cat] | **File:** `path:line` | **Severity:** 🔴 Critical

**Problem:** [code before]
**Fix:** [code after]
**Status:** ✅ FIXED

## Build Status
- [x] Backend compiles
- [x] Frontend compiles
```

---

## Rules

{"do":["load skills BEFORE review","run detect-project-state.sh FIRST","auto-fix in autopilot","verify build","document before/after"]}

{"dont":["report without fixing (autopilot)","ignore skill patterns","accept 'works' as justification","leave non-compiling code","skip IoC/RESTful checks"]}
