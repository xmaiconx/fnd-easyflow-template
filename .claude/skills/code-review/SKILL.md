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

## ⚠️ REGRA OBRIGATÓRIA: TodoWrite

**ANTES de iniciar qualquer revisão, você DEVE criar uma lista de todos usando TodoWrite.**

O agente de code-review DEVE criar todos para cada categoria de validação e para cada arquivo alterado. Isso garante:
1. Visibilidade do progresso para o usuário
2. Nenhuma validação esquecida
3. Rastreabilidade das correções

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

**A validação de IoC é a MAIS CRÍTICA. Código sem IoC correto NÃO funciona em runtime.**

#### Checklist por Tipo de Componente

| Componente | Decorator | providers[] | exports[] | controllers[] | index.ts |
|------------|-----------|-------------|-----------|---------------|----------|
| Service | @Injectable() | ✅ feature module | ❌ | ❌ | ❌ |
| Repository | @Injectable() | ✅ db module | ✅ db module | ❌ | ✅ libs/ |
| Handler | @Injectable() | ✅ feature module | ❌ | ❌ | ❌ (NUNCA) |
| Guard | @Injectable() | ✅ feature/global | ❌ | ❌ | ❌ |
| Controller | @Controller() | ❌ | ❌ | ✅ feature module | ❌ |

#### Validações Obrigatórias IoC

```json
{"iocChecks":[
  {"component":"Service","validations":[
    "tem @Injectable()",
    "registrado em providers[] do módulo",
    "módulo importado em AppModule.imports[]"
  ]},
  {"component":"Repository","validations":[
    "tem @Injectable()",
    "registrado em providers[] do módulo database",
    "registrado em exports[] do módulo database",
    "exportado no index.ts de libs/app-database/src/",
    "tipo adicionado em Database.ts se nova tabela"
  ]},
  {"component":"CommandHandler","validations":[
    "tem @Injectable()",
    "registrado em providers[] do módulo feature",
    "NÃO exportado em index.ts (implementation detail)",
    "Command exportado (contrato público)"
  ]},
  {"component":"EventHandler","validations":[
    "tem @Injectable()",
    "registrado em providers[] do módulo feature",
    "NÃO exportado em index.ts (implementation detail)",
    "Event exportado se cross-module"
  ]},
  {"component":"Controller","validations":[
    "tem @Controller('prefix')",
    "registrado em controllers[] do módulo",
    "guards aplicados (@UseGuards)",
    "módulo importado em AppModule.imports[]"
  ]},
  {"component":"Module","validations":[
    "importa módulos necessários (SharedModule, DatabaseModule)",
    "registra todos providers",
    "registra todos controllers",
    "importado em AppModule.imports[]"
  ]}
]}
```

#### Arquivos a Verificar para IoC

```json
{"iocFiles":[
  {"file":"apps/backend/src/app.module.ts","check":"imports[] contém módulo"},
  {"file":"[feature].module.ts","check":"providers[], controllers[], imports[]"},
  {"file":"libs/app-database/src/app-database.module.ts","check":"providers[], exports[] para repos"},
  {"file":"libs/app-database/src/index.ts","check":"exports de repos públicos"},
  {"file":"libs/app-database/src/types/Database.ts","check":"tipos de tabelas novas"},
  {"file":"libs/domain/src/index.ts","check":"exports de entities/enums novos"}
]}
```

#### Erros Comuns IoC

{"errors":[
  {"err":"Nest can't resolve dependencies of X","cause":"X não está em providers[] ou dependência de X não registrada","fix":"adicionar X e suas dependências em providers[]"},
  {"err":"X is not a provider","cause":"falta @Injectable() ou não registrado","fix":"adicionar decorator e registrar em providers[]"},
  {"err":"Module X not found","cause":"módulo não importado em AppModule","fix":"adicionar em AppModule.imports[]"},
  {"err":"Repository not found","cause":"repo não exportado em exports[] do db module","fix":"adicionar em exports[] de AppDatabaseModule"},
  {"err":"404 on endpoint","cause":"controller não registrado ou módulo não importado","fix":"verificar controllers[] e AppModule.imports[]"}
]}

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

### Phase 1: Load Context & Create Todos
1. `bash .claude/scripts/detect-project-state.sh --branch-changes`
2. Read reference skills (backend, database, frontend, security)
3. Read CLAUDE.md
4. Identify ALL changed files

**OBRIGATÓRIO: Criar TodoWrite com lista de validações:**
```
Exemplo de todos a criar:
- [ ] Carregar contexto e identificar arquivos alterados
- [ ] Validar IoC: verificar @Injectable em novos services
- [ ] Validar IoC: verificar providers[] nos módulos
- [ ] Validar IoC: verificar exports[] para repositórios
- [ ] Validar IoC: verificar imports[] em AppModule
- [ ] Validar IoC: verificar barrel exports (index.ts)
- [ ] Validar RESTful: métodos HTTP corretos
- [ ] Validar RESTful: status codes corretos
- [ ] Validar Contracts: tipos sincronizados frontend/backend
- [ ] Validar Security: multi-tenancy (account_id)
- [ ] Validar Security: guards aplicados
- [ ] Validar Architecture: dependências entre camadas
- [ ] Validar Quality: sem any, sem console.log
- [ ] Validar Database: migrations, tipos Kysely
- [ ] Corrigir issues encontrados
- [ ] Verificar build compila
- [ ] Gerar relatório de review
```

### Phase 2: Validate (com TodoWrite updates)
Para CADA arquivo alterado, validar na ordem:

1. **IoC Configuration** (mais crítico)
   - Marcar todo como `in_progress`
   - Para cada novo componente criado:
     - [ ] Verificar decorator (@Injectable, @Controller)
     - [ ] Verificar registro em providers[]/controllers[]
     - [ ] Verificar exports[] se compartilhado
     - [ ] Verificar index.ts se em libs/
     - [ ] Verificar AppModule.imports[]
   - Marcar todo como `completed`

2. **RESTful Compliance**
3. **Contract Validation**
4. **Security (OWASP)**
5. **Architecture & SOLID**
6. **Code Quality**
7. **Database**

### Phase 3: Fix (autopilot)
1. Para cada issue encontrado:
   - Criar todo específico: "Corrigir [issue] em [arquivo]"
   - Marcar como `in_progress`
   - Aplicar fix
   - Marcar como `completed`
2. Verificar build compila
3. Documentar before/after

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

{"do":[
  "CRIAR TodoWrite ANTES de iniciar review",
  "atualizar todos durante cada fase",
  "marcar todo como in_progress antes de começar validação",
  "marcar todo como completed após finalizar validação",
  "load skills BEFORE review",
  "run detect-project-state.sh FIRST",
  "auto-fix in autopilot",
  "verify build",
  "document before/after"
]}

{"dont":[
  "iniciar review SEM criar TodoWrite",
  "pular validação de IoC (mais crítica)",
  "report without fixing (autopilot)",
  "ignore skill patterns",
  "accept 'works' as justification",
  "leave non-compiling code",
  "skip IoC/RESTful checks",
  "esquecer de verificar AppModule.imports[]",
  "esquecer de verificar barrel exports em libs/"
]}

---

## IoC Quick Reference

**Novo Service criado? Verificar:**
1. `@Injectable()` no service
2. `providers: [NovoService]` no módulo
3. `imports: [FeatureModule]` no AppModule

**Novo Repository criado? Verificar:**
1. `@Injectable()` no repository
2. `providers: [NovoRepository]` no AppDatabaseModule
3. `exports: [NovoRepository]` no AppDatabaseModule
4. `export { NovoRepository }` no index.ts de libs/app-database/src/

**Novo Handler criado? Verificar:**
1. `@Injectable()` no handler
2. `providers: [NovoHandler]` no módulo da feature
3. **NÃO** exportar handler em index.ts (implementation detail)

**Novo Controller criado? Verificar:**
1. `@Controller('prefix')` no controller
2. `controllers: [NovoController]` no módulo
3. `@UseGuards(JwtAuthGuard)` aplicado
4. `imports: [FeatureModule]` no AppModule

**Nova Entity/Enum criado? Verificar:**
1. `export { NovaEntity }` no index.ts de libs/domain/src/

**Nova Tabela criada? Verificar:**
1. Migration criada em libs/app-database/migrations/
2. Tipo adicionado em libs/app-database/src/types/Database.ts
