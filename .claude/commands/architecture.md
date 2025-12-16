# Architecture Discovery & Documentation

> **LANGUAGE:** Documentação em PT-BR. Termos técnicos e código em EN.
> **OUTPUT:** Seção `## Technical Spec` dentro do `CLAUDE.md`

Este comando analisa o codebase e atualiza a seção Technical Spec do CLAUDE.md com dados estruturados em formato token-efficient.

---

## Princípio Central

**Descobrir, não impor.** Documentar o que EXISTE no código, não o que "deveria" existir. CLAUDE.md é self-contained - toda informação em um único arquivo.

---

## Phase 1: Verificação Inicial

### Step 1: Check CLAUDE.md
```bash
ls CLAUDE.md 2>/dev/null
grep "## Technical Spec" CLAUDE.md 2>/dev/null
```

**Se CLAUDE.md não existir:** Criar arquivo completo.
**Se seção Technical Spec não existir:** Adicionar seção.
**Se existir:** Perguntar se deseja atualizar.

### Step 2: Identify Project Type
```bash
ls package.json apps/ libs/ src/ 2>/dev/null
```
**Classificar:** Monorepo | SingleApp | Custom

---

## Phase 2: Stack Detection

### 2.1 Package Manager & Build
```bash
ls package-lock.json yarn.lock pnpm-lock.yaml bun.lockb 2>/dev/null
cat package.json | grep -E '"workspaces"|"turbo"|"nx"'
```

### 2.2 Frameworks & Dependencies
```bash
# Backend
grep -r "@nestjs\|express\|fastify\|hono" package.json */package.json 2>/dev/null

# Frontend
grep -r '"react"\|"vue"\|"@angular/core"\|"next"' package.json */package.json 2>/dev/null

# Database
grep -r '"kysely"\|"typeorm"\|"drizzle-orm"\|"prisma"\|"knex"' package.json */package.json 2>/dev/null

# Auth
grep -r '"@supabase/supabase-js"\|"firebase"\|"passport"\|"next-auth"' package.json */package.json 2>/dev/null

# Infra
grep -r '"bullmq"\|"redis"\|"ioredis"\|"resend"\|"stripe"' package.json */package.json 2>/dev/null
```

---

## Phase 3: Pattern Detection

```bash
# CQRS
find . -type d \( -name "commands" -o -name "queries" \) 2>/dev/null | grep -v node_modules | head -5

# Repository
find . -type f -iname "*repository*" 2>/dev/null | grep -v node_modules | head -10

# Services
find . -type f -name "*.service.ts" 2>/dev/null | grep -v node_modules | head -10

# DI
grep -rh "^export interface I[A-Z]" --include="*.ts" . 2>/dev/null | grep -v node_modules | head -10
```

---

## Phase 4: Domain Analysis

```bash
# Entities
find . -type f \( -name "*.entity.ts" -o -path "*/entities/*.ts" \) 2>/dev/null | grep -v node_modules

# Enums
find . -type f -path "*/enums/*.ts" 2>/dev/null | grep -v node_modules

# DTOs
find . -type f \( -name "*.dto.ts" -o -path "*/dtos/*.ts" \) 2>/dev/null | grep -v node_modules | head -15
```

---

## Phase 5: Critical Files

```bash
# Entry points
find . -name "main.ts" -o -name "app.ts" 2>/dev/null | grep -v node_modules | head -10

# Modules
find . -name "*.module.ts" 2>/dev/null | grep -v node_modules | head -10

# Workers
find . -name "*.worker.ts" 2>/dev/null | grep -v node_modules
```

---

## Phase 6: Update CLAUDE.md

**PRE-DOCUMENTATION CHECKPOINT (MANDATORY):**
```
1. TodoWrite: Add item "Ler skill de documentação e aplicar formato híbrido" (in_progress)
2. Execute: cat .claude/skills/documentation-style/SKILL.md
3. Apply token-efficient format to Technical Spec section
4. TodoWrite: Mark item as completed after writing
```

### Localizar seção Technical Spec

Se existir `## Technical Spec`, substituir conteúdo até próximo `## `.
Se não existir, adicionar antes de `## Design Principles` ou no final.

### Formato da Seção Technical Spec

```markdown
## Technical Spec

> Seção otimizada para consumo por IA. Formato token-efficient.

**Generated:** YYYY-MM-DD | **Type:** [Monorepo|SingleApp]

### Stack
{"pkg":"npm","build":"turbo","ts":"5.0+"}
{"backend":{"framework":"NestJS 10","db":"PostgreSQL 15","orm":"Kysely 0.27","migrations":"Knex 3.0","auth":"Supabase","queue":"BullMQ 5.0","cache":"Redis 7","email":"Resend 2.0","payments":"Stripe"}}
{"frontend":{"framework":"React 18.2","bundler":"Vite 4.4","ui":"Shadcn+Tailwind","state":"Zustand 4.4","forms":"RHF+Zod","http":"Axios 1.5"}}

### Structure
{"paths":{"backend":"apps/backend","frontend":"apps/frontend","domain":"libs/domain","database":"libs/app-database","interfaces":"libs/backend","migrations":"libs/app-database/migrations","workers":"apps/backend/src/workers"}}

### Layers
domain → interfaces → database → api
- domain: Entities, Enums, Types (zero deps)
- interfaces: Service contracts (deps: domain)
- database: Repositories (deps: domain, interfaces)
- api: Controllers, Services, Handlers (deps: all)

### Patterns
{"identified":["CQRS","Repository","DI","EventDriven","CleanArchitecture"]}
{"conventions":{"files":"kebab-case","classes":"PascalCase","interfaces":"I+PascalCase","dbColumns":"snake_case","variables":"camelCase"}}
{"diTokens":{"ILoggerService":"WinstonLoggerService","IEmailService":"ResendEmailService","IConfigurationService":"ConfigurationService","IQueueService":"BullMQQueueAdapter","DATABASE":"Kysely"}}

### Domain
{"entitiesPath":"libs/domain/src/entities","entities":["Account","User","Workspace","WorkspaceUser","AuditLog","Plan","PlanPrice","Subscription","WebhookEvent"]}
{"enumsPath":"libs/domain/src/enums","enums":[{"name":"EntityStatus","values":"active|inactive|deleted"},{"name":"UserRole","values":"owner|admin|member"},{"name":"OnboardingStatus","values":"pending|completed"},{"name":"PlanCode","values":"free|pro|enterprise"},{"name":"SubscriptionStatus","values":"active|canceled|past_due"},{"name":"WebhookStatus","values":"pending|processed|failed"},{"name":"WebhookType","values":"stripe|supabase"}]}
{"dtosPath":"apps/backend/src/api/modules/*/dtos","conventions":{"input":"[Action][Entity]Dto","response":"[Entity]ResponseDto"}}

### Config
{"envAccess":"IConfigurationService","configFile":"apps/backend/src/shared/services/configuration.service.ts","envExample":".env.example"}

### Security
{"multiTenancy":{"enabled":true,"strategy":"account_id","filter":"ALWAYS filter by account_id"}}
{"auth":{"provider":"Supabase","strategy":"JWT","guards":"apps/backend/src/api/guards"}}

### Critical Files
{"backendCore":["apps/backend/src/main.ts - Dispatcher NODE_MODE","apps/backend/src/shared/shared.module.ts - DI central"]}
{"services":["apps/backend/src/shared/services/configuration.service.ts - Env access","apps/backend/src/shared/services/supabase.service.ts - Auth client"]}
{"workers":["apps/backend/src/workers/email.worker.ts - Email queue","apps/backend/src/workers/audit.worker.ts - Audit logs","apps/backend/src/workers/stripe-webhook.worker.ts - Stripe events"]}
{"database":["libs/app-database/src/types/Database.ts - Kysely schema","libs/app-database/src/kysely.ts - DB connection"]}
{"frontend":["apps/frontend/src/App.tsx - Root component","apps/frontend/src/stores/auth-store.ts - Auth state","apps/frontend/src/lib/api.ts - HTTP client"]}

### Business Rules
- Multi-tenancy: SEMPRE filtrar queries por account_id
- JWT contém accountId claim injetado pelo Supabase
- Super Admin: SUPER_ADMIN_EMAIL tem acesso cross-tenant
- Repositories retornam domain entities, NUNCA DTOs
- Commands para escrita, Queries direto nos Repositories
- Event Handlers devem ser idempotentes
```

---

## Phase 7: Completion

```markdown
✅ Architecture analysis complete!

**Updated:** CLAUDE.md → Section "Technical Spec"
**Format:** Token-efficient (AI consumption)

**Detected:**
- Type: [Monorepo|SingleApp]
- Backend: [framework]
- Frontend: [framework]
- Patterns: [list]

**Next:** Run `/review` to validate code against these patterns.
```

---

## Critical Rules

**DO:**
- ✅ Atualizar seção dentro do CLAUDE.md (não criar arquivo separado)
- ✅ JSON minificado em uma linha
- ✅ Máximo 10 palavras por descrição
- ✅ Documentar o que EXISTE

**DO NOT:**
- ❌ Criar technical-spec.md separado
- ❌ JSON formatado/indentado
- ❌ Blocos de código > 3 linhas
- ❌ Inventar padrões não encontrados

---

## Legacy Projects

Quando padrões são inconsistentes:

1. Documentar o que existe
2. Adicionar ao final da seção:
```markdown
### Inconsistencies
[{"area":"[area]","patternA":"[found]","patternB":"[found]","files":"[count]"}]
```
