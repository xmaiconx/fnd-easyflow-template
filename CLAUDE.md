# FND MetaTemplate - Development Guide

## About

Template base para alunos do **Fábrica de Negócios Digitais (FND)** iniciarem a construção de seus SaaS utilizando IA. Monorepo com NestJS + React + PostgreSQL + Supabase Auth.

## Quick Start

```bash
npm install                    # Instalar dependências
docker-compose -f infra/docker-compose.yml up -d  # Subir PostgreSQL + Redis
npm run migrate:latest         # Rodar migrations
npm run dev                    # API + Frontend parallel
```

**Portas:** API :3001 | Frontend :3000 | PostgreSQL :5432 | Redis :6379 | PgAdmin :5050

---

## Technical Spec

> Seção otimizada para consumo por IA. Formato token-efficient.

**Generated:** 2025-12-16 | **Type:** Monorepo

### Stack
{"pkg":"npm","build":"turbo","ts":"5.0+ strict"}
{"backend":{"framework":"NestJS 10","db":"PostgreSQL 15","orm":"Kysely 0.27","migrations":"Knex 3.0","auth":"Supabase","queue":"BullMQ 5.0","cache":"Redis 7","email":"Resend 2.0","payments":"Stripe","logging":"Winston 3.10"}}
{"frontend":{"framework":"React 18.2","bundler":"Vite 4.4","ui":"Shadcn+Tailwind v3","state":"Zustand 4.4+TanStackQuery 4.35","forms":"RHF 7.45+Zod 3.22","routing":"ReactRouter 6.15","http":"Axios 1.5"}}

### Structure
{"paths":{"backend":"apps/backend","frontend":"apps/frontend","domain":"libs/domain","database":"libs/app-database","interfaces":"libs/backend","migrations":"libs/app-database/migrations","workers":"apps/backend/src/workers"}}

### Layers
domain → interfaces → database → api
- domain: Entities, Enums, Types (zero deps)
- interfaces: Service contracts (deps: domain)
- database: Repositories Kysely (deps: domain, interfaces)
- api: Controllers, Services, Handlers (deps: all)

### Patterns
{"identified":["CQRS","Repository","DI","EventDriven","CleanArchitecture","HybridExecution"]}
{"conventions":{"files":"kebab-case","classes":"PascalCase","interfaces":"I+PascalCase","dbColumns":"snake_case","variables":"camelCase","packages":"@fnd/[name]"}}
{"naming":{"dtos":"[Action][Entity]Dto","commands":"[Action][Subject]Command","events":"[Subject][PastAction]Event","handlers":"[Command|Event]Handler","tables":"[Entity]Table"}}
{"diTokens":{"ILoggerService":"WinstonLoggerService","IEmailService":"ResendEmailService","IConfigurationService":"ConfigurationService","ISupabaseService":"SupabaseService","IQueueService":"BullMQQueueAdapter","IEventPublisher":"BullMQEventPublisher","DATABASE":"Kysely","REDIS_CONNECTION":"IORedis"}}

### Domain
{"entitiesPath":"libs/domain/src/entities","entities":["Account","User","Workspace","WorkspaceUser","AuditLog","Plan","PlanPrice","Subscription","WebhookEvent"]}
{"enumsPath":"libs/domain/src/enums","enums":[{"name":"EntityStatus","values":"active|inactive|deleted"},{"name":"UserRole","values":"owner|admin|member"},{"name":"OnboardingStatus","values":"pending|completed"},{"name":"PlanCode","values":"free|pro|enterprise"},{"name":"SubscriptionStatus","values":"active|canceled|past_due"},{"name":"WebhookStatus","values":"pending|processed|failed"},{"name":"WebhookType","values":"stripe|supabase"},{"name":"PaymentProvider","values":"stripe"}]}
{"dtosPath":"apps/backend/src/api/modules/*/dtos","inputConvention":"[Action][Entity]Dto","responseConvention":"[Entity]ResponseDto"}

### Modules
{"apiModules":"apps/backend/src/api/modules","modules":[{"name":"auth","features":"signup,signin,JWT,password-recovery"},{"name":"audit","features":"read-only logs"},{"name":"workspace","features":"multi-workspace,user-workspace relations"},{"name":"billing","features":"Stripe subscriptions,payments"}]}

### Config
{"envAccess":"IConfigurationService (NUNCA process.env)","configFile":"apps/backend/src/shared/services/configuration.service.ts","envExample":".env.example"}
{"nodeModes":{"api":"HTTP only","workers":"BullMQ only","hybrid":"API+Workers (default)"}}

### Security
{"multiTenancy":{"enabled":true,"strategy":"account_id","rule":"SEMPRE filtrar queries por account_id"}}
{"auth":{"provider":"Supabase","strategy":"JWT com accountId claim","guards":"apps/backend/src/api/guards","superAdmin":"SUPER_ADMIN_EMAIL cross-tenant"}}

### Critical Files
{"backendCore":["apps/backend/src/main.ts - Dispatcher NODE_MODE","apps/backend/src/main.hybrid.ts - Default entrypoint","apps/backend/src/local.ts - Dev server","apps/backend/src/shared/shared.module.ts - DI central"]}
{"services":["apps/backend/src/shared/services/configuration.service.ts - Env access","apps/backend/src/shared/services/supabase.service.ts - Auth client","apps/backend/src/shared/services/resend-email.service.ts - Email","apps/backend/src/shared/services/email-queue.service.ts - Email queue"]}
{"workers":["apps/backend/src/workers/email.worker.ts - Email queue processor","apps/backend/src/workers/audit.worker.ts - Audit logs processor","apps/backend/src/workers/stripe-webhook.worker.ts - Stripe events"]}
{"adapters":["apps/backend/src/shared/adapters/bullmq-queue.adapter.ts - IQueueService","apps/backend/src/shared/adapters/bullmq-event-publisher.adapter.ts - IEventPublisher"]}
{"database":["libs/app-database/src/types/Database.ts - Kysely schema","libs/app-database/src/kysely.ts - DB connection","libs/app-database/knexfile.js - Migration config"]}
{"frontend":["apps/frontend/src/App.tsx - Root component","apps/frontend/src/stores/auth-store.ts - Zustand auth state","apps/frontend/src/lib/api.ts - Axios client"]}
{"monorepo":["package.json - workspaces","turbo.json - build pipeline","tsconfig.base.json - shared TS config"]}

### Repositories
{"path":"libs/app-database/src/repositories","list":["AccountRepository","UserRepository","WorkspaceRepository","WorkspaceUserRepository","AuditLogRepository","PlanRepository","PlanPriceRepository","SubscriptionRepository","WebhookEventRepository"]}
{"methods":["findById(id)","findAll(filters?)","findByAccountId(accountId)","create(data)","update(id,data)","delete(id)","exists(id)"]}

### Business Rules
- Multi-tenancy: SEMPRE filtrar queries por account_id
- JWT contém accountId claim injetado pelo Supabase
- Super Admin: SUPER_ADMIN_EMAIL tem acesso cross-tenant
- Repositories retornam domain entities, NUNCA DTOs
- Commands para escrita, Queries direto nos Repositories
- Event Handlers devem ser idempotentes
- Database layer NUNCA depende de DTOs (usar domain entities)
- NUNCA usar process.env direto (usar IConfigurationService)
- Handlers são implementation detail (NÃO exportar em index.ts)

---

## Best Practices

### Arquitetura
- Respeitar hierarquia Clean Architecture (domain → interfaces → database → api)
- Commands são feature-specific (vivem no módulo)
- Events são contratos (podem ser compartilhados cross-module)
- Um Command/Event por arquivo

### CQRS
- Operações de escrita: SEMPRE via Commands
- Queries: direto nos Repositories (sem QueryHandlers)
- Event Handlers devem ser idempotentes
- Commands retornam void ou ID, nunca objetos completos

### Multi-Tenancy
- SEMPRE filtrar por account_id em queries
- Validar account_id em todos os endpoints
- NUNCA confiar no account_id vindo do client

### Imports
- DTOs locais: relative path (`./dtos`)
- Entities/Enums: package reference (`@fnd/domain`)
- Repositories: package reference (`@fnd/database`)
- Shared services: relative path (`../../shared/services`)

### Frontend
- DTOs espelhados em `apps/frontend/src/types/` como interfaces puras
- Frontend 100% desacoplado do backend
- Enums espelhados com mesmos valores (não importar de domain)

---

## Features

Documentação de features em `/docs/features/`. Cada feature possui: about.md, discovery.md, implementation.md.

---

## Design Principles

- **KISS**: Keep It Simple, Stupid
- **YAGNI**: You Aren't Gonna Need It
- **Single Responsibility**: One class, one reason to change
- **Dependency Inversion**: Depend on abstractions, not concretions
- **Open/Closed**: Open for extension, closed for modification
- **Zero over-engineering**: Pragmatismo acima de tudo
