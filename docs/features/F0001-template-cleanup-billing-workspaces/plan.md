# Technical Plan: Limpeza do Template + Billing por Workspace com Stripe

**Feature:** F0001-template-cleanup-billing-workspaces
**Branch:** refactor/F0001-template-cleanup-billing-workspaces
**Date:** 2025-12-02
**Status:** Planning Complete

---

## 1. Solution Overview

Este plano técnico detalha a transformação do template FND EasyFlow de um sistema de chatbots para um template SaaS genérico com billing por workspace. O trabalho é dividido em duas grandes frentes: implementação do sistema de billing com Stripe e remoção do código de mensageria.

A estratégia de execução prioriza a implementação do billing primeiro, garantindo que funcionalidade de valor seja entregue antes de fazer remoções massivas de código. Isso reduz riscos e permite validação incremental.

A arquitetura de billing segue o modelo: Account é o Customer Stripe (criado no primeiro checkout), cada Workspace possui sua própria Subscription, e features/limites são validados via campo JSONB na tabela plans. O modelo permite plano FREE sem subscription na Stripe, facilitando freemium/trial.

O foco é simplicidade e didática - o template deve ser fácil de entender e modificar pelos alunos do FND, evitando over-engineering.

---

## 2. Components to Develop

### 2.1 Backend - Database Migrations

| Migration | Descrição | Dependências |
|-----------|-----------|--------------|
| `20251203001_alter_accounts_add_stripe_customer_id.js` | Adiciona `stripe_customer_id` na tabela `accounts` | Nenhuma |
| `20251203002_alter_subscriptions_add_workspace_id.js` | Adiciona `workspace_id` na tabela `subscriptions`, remove obrigatoriedade de `account_id` | accounts, workspaces |
| `20251203003_alter_plans_add_features.js` | Adiciona campo JSONB `features` na tabela `plans` | plans |
| `20251203004_seed_default_plans.js` | Seed com 3 planos: FREE, STARTER, PROFESSIONAL | plans, plan_prices |

### 2.2 Backend - Domain Layer

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `libs/domain/src/entities/Plan.ts` | Entity | Entidade Plan com features |
| `libs/domain/src/entities/PlanPrice.ts` | Entity | Entidade PlanPrice |
| `libs/domain/src/entities/Subscription.ts` | Entity | Entidade Subscription |
| `libs/domain/src/types/PlanFeatures.ts` | Type | Estrutura `{limits, flags}` |
| `libs/domain/src/enums/SubscriptionStatus.ts` | Enum | Status da subscription |
| `libs/domain/src/enums/PlanCode.ts` | Enum | Códigos dos planos (FREE, STARTER, PROFESSIONAL) |

### 2.3 Backend - Database Layer

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `libs/app-database/src/types/PlanTable.ts` | Table Type | Kysely type para plans |
| `libs/app-database/src/types/PlanPriceTable.ts` | Table Type | Kysely type para plan_prices |
| `libs/app-database/src/types/SubscriptionTable.ts` | Table Type | Kysely type para subscriptions (com workspace_id) |
| `libs/app-database/src/interfaces/IPlanRepository.ts` | Interface | Interface do repositório |
| `libs/app-database/src/interfaces/ISubscriptionRepository.ts` | Interface | Interface do repositório |
| `libs/app-database/src/repositories/PlanRepository.ts` | Repository | Implementação Kysely |
| `libs/app-database/src/repositories/SubscriptionRepository.ts` | Repository | Implementação Kysely |

### 2.4 Backend - API Module (Billing)

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `apps/backend/src/api/modules/billing/billing.module.ts` | Module | Módulo NestJS |
| `apps/backend/src/api/modules/billing/billing.controller.ts` | Controller | Endpoints REST |
| `apps/backend/src/api/modules/billing/billing.service.ts` | Service | Orquestração |
| `apps/backend/src/api/modules/billing/stripe.service.ts` | Service | Wrapper Stripe API |
| `apps/backend/src/api/modules/billing/plan.service.ts` | Service | Validação de features |
| `apps/backend/src/api/modules/billing/stripe-webhook.service.ts` | Service | Processa webhooks Stripe |
| `apps/backend/src/api/modules/billing/dtos/` | DTOs | Request/Response DTOs |
| `apps/backend/src/api/modules/billing/guards/` | Guards | Guards de feature/plan |

### 2.5 Backend - Events

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `SubscriptionCreatedEvent.ts` | Event | Quando subscription é criada |
| `SubscriptionUpdatedEvent.ts` | Event | Quando subscription muda (upgrade/downgrade) |
| `SubscriptionCanceledEvent.ts` | Event | Quando subscription é cancelada |
| Event Handlers | Handlers | Handlers para os eventos acima |

### 2.6 Frontend

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `apps/frontend/src/pages/settings/billing.tsx` | Page | Página de billing |
| `apps/frontend/src/components/billing/PlanCard.tsx` | Component | Card de plano |
| `apps/frontend/src/components/billing/CurrentPlan.tsx` | Component | Plano atual |
| `apps/frontend/src/components/billing/UpgradeButton.tsx` | Component | Botão de upgrade |
| `apps/frontend/src/hooks/useBilling.ts` | Hook | Hook para billing API |
| `apps/frontend/src/types/api/billing.ts` | Types | DTOs espelhados |

---

## 3. Integration Contracts

### 3.1 API Contracts

#### Endpoint: Create Checkout Session
**Route:** `POST /api/billing/checkout`

**Request:**
- Headers: `Authorization: Bearer {jwt_token}`
- Body:
  - `workspaceId` (UUID, required): ID do workspace para upgrade
  - `planCode` (string, required): Código do plano (STARTER, PROFESSIONAL)

**Response:**
- Status 200:
  - `checkoutUrl` (string): URL do Stripe Checkout
  - `sessionId` (string): ID da sessão Stripe
- Status 400: Plano inválido ou workspace não encontrado
- Status 403: Usuário não é owner do workspace
- Status 409: Workspace já possui este plano

**Errors:**
- 400: `{ error: "INVALID_PLAN", message: "Plano não encontrado" }`
- 403: `{ error: "FORBIDDEN", message: "Apenas owners podem alterar o plano" }`
- 409: `{ error: "ALREADY_SUBSCRIBED", message: "Workspace já possui este plano" }`

---

#### Endpoint: Create Customer Portal Session
**Route:** `POST /api/billing/portal`

**Request:**
- Headers: `Authorization: Bearer {jwt_token}`
- Body:
  - `workspaceId` (UUID, required): ID do workspace

**Response:**
- Status 200:
  - `portalUrl` (string): URL do Stripe Customer Portal
- Status 400: Account não possui customer Stripe
- Status 403: Usuário não é owner do workspace

**Errors:**
- 400: `{ error: "NO_CUSTOMER", message: "Você ainda não possui assinaturas ativas" }`
- 403: `{ error: "FORBIDDEN", message: "Apenas owners podem gerenciar billing" }`

---

#### Endpoint: Get Workspace Billing Info
**Route:** `GET /api/billing/workspace/:workspaceId`

**Request:**
- Headers: `Authorization: Bearer {jwt_token}`
- Params: `workspaceId` (UUID)

**Response:**
- Status 200:
  - `plan` (object): Plano atual do workspace
    - `code` (string): FREE, STARTER, PROFESSIONAL
    - `name` (string): Nome do plano
    - `features` (object): Features e limites
  - `subscription` (object | null): Dados da subscription (null se FREE)
    - `status` (string): active, canceled, past_due
    - `currentPeriodEnd` (ISO date): Fim do período atual
    - `cancelAtPeriodEnd` (boolean): Se vai cancelar no fim do período
  - `usage` (object): Uso atual
    - `workspacesUsed` (number): Workspaces criados
    - `workspacesLimit` (number): Limite do plano
    - `usersInWorkspace` (number): Usuários neste workspace
    - `usersLimit` (number): Limite de usuários

**Errors:**
- 403: Usuário não tem acesso ao workspace
- 404: Workspace não encontrado

---

#### Endpoint: Get Available Plans
**Route:** `GET /api/billing/plans`

**Request:**
- Headers: `Authorization: Bearer {jwt_token}` (opcional)

**Response:**
- Status 200:
  - `plans` (array): Lista de planos disponíveis
    - `code` (string): Código do plano
    - `name` (string): Nome do plano
    - `description` (string): Descrição
    - `price` (object): Preço atual
      - `amount` (number): Valor em centavos
      - `currency` (string): BRL
      - `interval` (string): month
    - `features` (object): Features e limites

---

#### Endpoint: Stripe Webhook
**Route:** `POST /api/billing/webhook`

**Request:**
- Headers: `Stripe-Signature: {signature}`
- Body: Raw Stripe event payload

**Response:**
- Status 200: `{ received: true }`
- Status 400: Assinatura inválida

**Events Processados:**
- `checkout.session.completed`: Cria/atualiza subscription
- `customer.subscription.updated`: Atualiza status/plano
- `customer.subscription.deleted`: Marca como cancelada
- `invoice.payment_failed`: Marca como past_due

---

### 3.2 Event Contracts

#### Event: SubscriptionCreatedEvent
**When emitted:** Após webhook `checkout.session.completed` processar com sucesso
**Payload:**
- `subscriptionId` (UUID): ID interno da subscription
- `workspaceId` (UUID): Workspace que recebeu a subscription
- `accountId` (UUID): Account do workspace
- `planCode` (string): Código do plano
- `stripeSubscriptionId` (string): ID da subscription na Stripe
- `status` (string): Status inicial (active)
**Consumers:** AuditEventListener (logging)
**Processing:** Registra no audit log

---

#### Event: SubscriptionUpdatedEvent
**When emitted:** Após webhook `customer.subscription.updated`
**Payload:**
- `subscriptionId` (UUID): ID interno
- `workspaceId` (UUID): Workspace afetado
- `previousPlanCode` (string): Plano anterior
- `newPlanCode` (string): Novo plano
- `status` (string): Novo status
- `changeType` (string): upgrade, downgrade, status_change
**Consumers:** AuditEventListener, NotificationService (futuro)
**Processing:** Atualiza subscription local, registra auditoria

---

#### Event: SubscriptionCanceledEvent
**When emitted:** Após webhook `customer.subscription.deleted`
**Payload:**
- `subscriptionId` (UUID): ID interno
- `workspaceId` (UUID): Workspace afetado
- `accountId` (UUID): Account
- `canceledAt` (ISO date): Data do cancelamento
- `reason` (string, optional): Motivo se disponível
**Consumers:** AuditEventListener, WorkspaceService
**Processing:** Reverte workspace para plano FREE

---

### 3.3 PlanService Interface

```
IPlanService
├── canUseFeature(workspaceId, featureName): Promise<boolean>
├── checkLimit(workspaceId, limitName): Promise<{allowed: boolean, current: number, limit: number}>
├── getWorkspacePlan(workspaceId): Promise<Plan>
├── getAccountUsage(accountId): Promise<{workspacesUsed: number, workspacesLimit: number}>
└── validateWorkspaceCreation(accountId): Promise<{allowed: boolean, reason?: string}>
```

---

## 4. Complete Data Flows

### 4.1 Flow: Signup com Workspace FREE

```
1. Usuário submete formulário de signup no Frontend
2. Frontend chama POST /api/auth/signup
3. SignUpCommandHandler cria Account
4. SignUpCommandHandler cria Workspace (sem subscription)
5. SignUpCommandHandler cria User e associa ao Workspace
6. SignUpCommandHandler publica AccountCreatedEvent
7. AccountCreatedEventHandler envia email de confirmação
8. PlanService considera workspace como FREE (sem subscription = FREE)
9. Frontend redireciona para dashboard
10. Dashboard exibe plano FREE com opção de upgrade
```

### 4.2 Flow: Upgrade de Workspace

```
1. Usuário clica em "Upgrade" na página de billing
2. Frontend chama POST /api/billing/checkout com workspaceId e planCode
3. BillingController valida JWT e extrai userId
4. BillingService verifica se usuário é owner do workspace
5. BillingService verifica se Account já tem stripe_customer_id
   5a. Se NÃO: StripeService.createCustomer() e salva ID no Account
   5b. Se SIM: usa customer existente
6. StripeService.createCheckoutSession() com metadata {workspaceId}
7. Controller retorna checkoutUrl
8. Frontend redireciona para Stripe Checkout
9. Usuário completa pagamento
10. Stripe envia webhook checkout.session.completed
11. StripeWebhookService extrai workspaceId dos metadata
12. StripeWebhookService cria/atualiza Subscription no banco
13. StripeWebhookService publica SubscriptionCreatedEvent
14. Workspace agora tem acesso às features do novo plano
15. Usuário retorna à aplicação via success_url
```

### 4.3 Flow: Verificação de Feature

```
1. Controller recebe request para ação que requer feature
2. Guard @RequiresPlan('STARTER') intercepta
3. Guard extrai workspaceId do request (params ou body)
4. Guard chama PlanService.canUseFeature(workspaceId, featureName)
5. PlanService busca Subscription do workspace
   5a. Se não tem subscription: considera FREE
   5b. Se tem subscription: busca Plan associado
6. PlanService verifica features.flags[featureName] do Plan
7. Se permitido: request prossegue
8. Se não permitido: retorna 403 com mensagem de upgrade
```

### 4.4 Flow: Verificação de Limite

```
1. Usuário tenta criar novo workspace
2. WorkspaceController chama WorkspaceService.create()
3. WorkspaceService chama PlanService.validateWorkspaceCreation(accountId)
4. PlanService busca todos workspaces do Account
5. PlanService calcula limite total baseado nos planos dos workspaces
   (soma dos limits.workspaces de cada workspace com subscription)
6. Se workspacesUsed < limit: retorna {allowed: true}
7. Se workspacesUsed >= limit: retorna {allowed: false, reason: "..."}
8. WorkspaceService bloqueia ou permite criação
```

### 4.5 Flow: Gerenciamento via Portal Stripe

```
1. Usuário clica em "Gerenciar Assinatura"
2. Frontend chama POST /api/billing/portal
3. BillingService verifica se Account tem stripe_customer_id
   3a. Se NÃO: retorna 400 "Você ainda não possui assinaturas"
4. StripeService.createPortalSession(customerId)
5. Controller retorna portalUrl
6. Frontend redireciona para Stripe Customer Portal
7. Usuário faz alterações (upgrade, downgrade, cancelar, método pagamento)
8. Stripe envia webhook com alterações
9. StripeWebhookService processa e atualiza estado local
10. Usuário retorna à aplicação
```

### 4.6 Flow: Downgrade com Recursos Acima do Limite

```
1. Usuário faz downgrade via Stripe Portal
2. Stripe envia webhook customer.subscription.updated
3. StripeWebhookService atualiza subscription local com novo plano
4. Novo plano tem limite de 1 workspace, usuário tem 3
5. Sistema NÃO bloqueia uso dos workspaces existentes
6. Sistema apenas impede criação de novos workspaces
7. Ao tentar criar workspace, PlanService retorna:
   {allowed: false, reason: "Seu plano permite 1 workspace. Faça upgrade para criar mais."}
```

---

## 5. Component Dependencies

### 5.1 Frontend Dependencies

| Component | Depende de |
|-----------|------------|
| `billing.tsx` (page) | `useBilling` hook, `CurrentPlan`, `PlanCard` components |
| `useBilling` hook | API endpoints: `/billing/workspace/:id`, `/billing/plans`, `/billing/checkout` |
| `UpgradeButton` | `useBilling.createCheckout()` |

### 5.2 Backend API Dependencies

| Component | Depende de |
|-----------|------------|
| `BillingController` | `BillingService`, `PlanService`, Guards |
| `BillingService` | `StripeService`, `ISubscriptionRepository`, `IWorkspaceRepository`, `IAccountRepository` |
| `StripeService` | Stripe SDK, `IConfigurationService` (API keys) |
| `StripeWebhookService` | `ISubscriptionRepository`, `IPlanRepository`, `IEventBroker` |
| `PlanService` | `IPlanRepository`, `ISubscriptionRepository`, `IWorkspaceRepository` |

### 5.3 Worker Dependencies

| Component | Depende de |
|-----------|------------|
| `DomainEventsProcessor` | Event handlers para SubscriptionCreated/Updated/Canceled |
| Event Handlers | `ILoggerService`, Repositories conforme necessário |

### 5.4 External Dependencies

| Service | Propósito |
|---------|-----------|
| Stripe API | Customers, Subscriptions, Checkout, Portal |
| Redis | Event queue (BullMQ) |
| PostgreSQL | Persistência |

---

## 6. Development Order

### Phase 1: Foundation (Database + Domain)

**1.1 Migrations**
- [ ] `20251203001_alter_accounts_add_stripe_customer_id.js`
  - *Adiciona coluna nullable `stripe_customer_id VARCHAR(255)` em accounts*
- [ ] `20251203002_alter_subscriptions_add_workspace_id.js`
  - *Adiciona coluna `workspace_id UUID` com FK para workspaces*
  - *Torna `account_id` nullable (subscription pode ser por workspace)*
  - *Adiciona index em `workspace_id`*
- [ ] `20251203003_alter_plans_add_features.js`
  - *Adiciona coluna `features JSONB DEFAULT '{}'`*
- [ ] `20251203004_seed_default_plans.js`
  - *Seed com planos FREE, STARTER, PROFESSIONAL*
  - *UUIDs fixos para referência*

**1.2 Domain Entities**
- [ ] `Plan.ts` - Entidade com id, code, name, features, isActive
- [ ] `PlanPrice.ts` - Entidade com preços
- [ ] `Subscription.ts` - Entidade com workspaceId, status
- [ ] `PlanFeatures.ts` - Type para estrutura features
- [ ] `SubscriptionStatus.ts` - Enum de status
- [ ] `PlanCode.ts` - Enum FREE/STARTER/PROFESSIONAL

**1.3 Database Types & Repositories**
- [ ] `PlanTable.ts`, `SubscriptionTable.ts` - Kysely types
- [ ] `IPlanRepository.ts`, `ISubscriptionRepository.ts` - Interfaces
- [ ] `PlanRepository.ts`, `SubscriptionRepository.ts` - Implementações
- [ ] Atualizar `Database.ts` com novas tabelas
- [ ] Atualizar barrel exports

### Phase 2: Core Billing Services

**2.1 Services**
- [ ] `StripeService` - Wrapper para Stripe API
  - createCustomer, createCheckoutSession, createPortalSession
  - Injetar via DI token `IStripeService`
- [ ] `PlanService` - Validação de features
  - canUseFeature, checkLimit, getWorkspacePlan
  - Injetar via DI token `IPlanService`

**2.2 Configuration**
- [ ] Adicionar variáveis ao `.env.example`:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_SUCCESS_URL`
  - `STRIPE_CANCEL_URL`
- [ ] Atualizar `IConfigurationService` com métodos Stripe

### Phase 3: API Endpoints

**3.1 DTOs**
- [ ] `CreateCheckoutDto` - workspaceId, planCode
- [ ] `CreatePortalDto` - workspaceId
- [ ] `BillingInfoResponseDto` - plan, subscription, usage
- [ ] `PlanResponseDto` - code, name, price, features

**3.2 Controller & Module**
- [ ] `BillingController` com endpoints
- [ ] `BillingService` orquestrando operações
- [ ] `StripeWebhookService` processando webhooks
- [ ] `BillingModule` com providers e imports
- [ ] Registrar BillingModule no AppModule

**3.3 Guards**
- [ ] `@RequiresPlan(planCode)` decorator
- [ ] `PlanGuard` implementação

### Phase 4: Events & Integration

**4.1 Events**
- [ ] `SubscriptionCreatedEvent`
- [ ] `SubscriptionUpdatedEvent`
- [ ] `SubscriptionCanceledEvent`
- [ ] Event handlers

**4.2 Integration with Existing Code**
- [ ] Atualizar `SignUpCommandHandler` - workspace já é criado, apenas garantir que PlanService trata como FREE
- [ ] Atualizar `WorkspaceService.create()` - validar limite via PlanService
- [ ] Atualizar `WorkspaceService.addUserToWorkspace()` - validar limite de usuários

### Phase 5: Frontend

**5.1 Types**
- [ ] `apps/frontend/src/types/api/billing.ts` - DTOs espelhados

**5.2 Hooks & API**
- [ ] `useBilling` hook com React Query

**5.3 Components**
- [ ] `CurrentPlan` - exibe plano atual
- [ ] `PlanCard` - card de plano para comparação
- [ ] `UpgradeButton` - inicia checkout

**5.4 Pages**
- [ ] `billing.tsx` - página de billing nas settings

### Phase 6: Cleanup - Messaging Code Removal

**6.1 Application Code (Delete)**
- [ ] Delete `apps/backend/src/shared/messages/` (entire directory)
- [ ] Delete `apps/backend/src/workers/webhooks/` (entire directory)
- [ ] Delete `apps/backend/src/workers/messages/` (entire directory)
- [ ] Delete `apps/backend/src/workers/message-buffer.processor.ts`

**6.2 Module Updates**
- [ ] Update `worker.module.ts` - remove imports/providers
- [ ] Update `shared.module.ts` - remove messaging providers

**6.3 Database Layer (Delete)**
- [ ] Delete repositories: Thread, Message, Project
- [ ] Delete interfaces: IThread, IMessage, IProject
- [ ] Delete table types: ThreadTable, MessageTable, ProjectTable
- [ ] Update `Database.ts` - remove tables
- [ ] Update barrel exports

**6.4 Domain Layer (Delete)**
- [ ] Delete entities: Project
- [ ] Delete enums: ChatChannel, ChatProvider, ChatImplementation, MessageType, MessageStatus, MessageDirection, InteractiveType, ProjectStatus
- [ ] Delete types: MessageContext, MessageContents, MessageProtocol, MediaObject, PipelineResult, ProjectPipelineConfig
- [ ] Update barrel exports

**6.5 Migrations Cleanup**
- [ ] Create `20251204001_drop_messaging_tables.js`
  - Drop tables: projects, messages, threads
  - Alter webhook_events to remove messaging columns

**6.6 Documentation Update**
- [ ] Update `CLAUDE.md` - remove messaging references, add billing section
- [ ] Update Stripe skill with feature validation patterns

### Phase 7: Validation

- [ ] Run `npm run build` - verify no TypeScript errors
- [ ] Run `npm run lint` - verify no linting issues
- [ ] Run `npm run migrate:latest` - verify migrations work
- [ ] Start application - verify it runs
- [ ] Test signup flow - verify workspace FREE creation
- [ ] Test checkout flow - verify Stripe integration
- [ ] Test webhook flow - verify subscription creation

---

## 7. Testing Strategy

### Backend API Tests (Futuro)
- **Unit tests**: PlanService methods (canUseFeature, checkLimit)
- **Integration tests**: BillingController endpoints with mocked Stripe
- **E2E tests**: Full checkout flow with Stripe test mode

### Frontend Tests (Futuro)
- **Unit tests**: useBilling hook
- **Component tests**: PlanCard, UpgradeButton rendering

### Manual Testing Checklist
- [ ] Signup cria workspace com plano FREE
- [ ] GET /billing/plans retorna 3 planos
- [ ] GET /billing/workspace/:id retorna info correta
- [ ] POST /billing/checkout redireciona para Stripe
- [ ] Webhook atualiza subscription no banco
- [ ] PlanService bloqueia criação quando no limite
- [ ] Portal Stripe funciona para gerenciamento

---

## 8. Attention Points

### Performance
- **Concern**: Múltiplas queries para validar features em cada request
- **Strategy**: Cache de features por workspace (Redis, TTL 5min)
- **Priority**: Baixa para MVP

### Security
- **Concern**: Validação de webhooks Stripe
- **Strategy**: Verificar assinatura `stripe-signature` header com `STRIPE_WEBHOOK_SECRET`
- **Concern**: Acesso a billing de outros tenants
- **Strategy**: Guards verificam `account_id` do workspace vs JWT claims

### Observability
- **Logging**: Log estruturado para todas operações de billing
- **Metrics**: Contador de checkouts, upgrades, cancelamentos (futuro)
- **Alerts**: Falhas de webhook (futuro)

### Stripe Best Practices
- **Idempotency**: Usar `stripe_subscription_id` como idempotency key
- **Webhooks**: Sempre retornar 200, processar async se necessário
- **Test Mode**: Usar Stripe test keys em desenvolvimento

---

## 9. Integration Checklist

### API Contracts
- [x] Endpoints documentados com request/response
- [x] Error codes padronizados
- [x] Status codes definidos

### Event Schemas
- [x] Eventos documentados com payload
- [x] Consumers identificados
- [x] Processing descrito

### Database
- [x] Migrations planejadas em ordem
- [x] Relationships definidos (FK)
- [x] Indexes identificados

### Frontend-Backend Alignment
- [x] DTOs alinhados
- [x] Error handling consistente
- [x] Loading states mapeados

### External Integrations
- [x] Stripe API endpoints identificados
- [x] Webhooks documentados
- [x] Environment variables listadas

---

## 10. Planos Seed Data

### Plan: FREE
```json
{
  "id": "00000000-0000-0000-0000-000000000001",
  "code": "FREE",
  "name": "Gratuito",
  "description": "Plano gratuito com recursos básicos",
  "stripe_product_id": null,
  "is_active": true,
  "features": {
    "limits": {
      "workspaces": 1,
      "usersPerWorkspace": 1
    },
    "flags": {}
  }
}
```

### Plan: STARTER
```json
{
  "id": "00000000-0000-0000-0000-000000000002",
  "code": "STARTER",
  "name": "Starter",
  "description": "Para pequenos times e projetos iniciais",
  "stripe_product_id": "prod_xxx",
  "is_active": true,
  "features": {
    "limits": {
      "workspaces": 3,
      "usersPerWorkspace": 5
    },
    "flags": {}
  }
}
```
**Price:** R$ 49,00/mês (4900 centavos)

### Plan: PROFESSIONAL
```json
{
  "id": "00000000-0000-0000-0000-000000000003",
  "code": "PROFESSIONAL",
  "name": "Professional",
  "description": "Para times em crescimento",
  "stripe_product_id": "prod_yyy",
  "is_active": true,
  "features": {
    "limits": {
      "workspaces": 10,
      "usersPerWorkspace": 20
    },
    "flags": {}
  }
}
```
**Price:** R$ 99,00/mês (9900 centavos)

---

## 11. Environment Variables

```bash
# Stripe (obrigatórias para billing)
STRIPE_SECRET_KEY=sk_test_xxx           # API key secreta
STRIPE_WEBHOOK_SECRET=whsec_xxx         # Secret para validar webhooks
STRIPE_SUCCESS_URL=http://localhost:3000/settings/billing?success=true
STRIPE_CANCEL_URL=http://localhost:3000/settings/billing?canceled=true

# Planos Stripe (configurar após criar no Stripe Dashboard)
STRIPE_PRODUCT_STARTER=prod_xxx
STRIPE_PRODUCT_PROFESSIONAL=prod_yyy
STRIPE_PRICE_STARTER=price_xxx
STRIPE_PRICE_PROFESSIONAL=price_yyy
```

---

## 12. Files to Create Summary

### New Files (~35 files)

**Domain (6 files)**
- `libs/domain/src/entities/Plan.ts`
- `libs/domain/src/entities/PlanPrice.ts`
- `libs/domain/src/entities/Subscription.ts`
- `libs/domain/src/types/PlanFeatures.ts`
- `libs/domain/src/enums/SubscriptionStatus.ts`
- `libs/domain/src/enums/PlanCode.ts`

**Database (8 files)**
- `libs/app-database/migrations/20251203001_*.js` (4 migrations)
- `libs/app-database/src/types/PlanTable.ts`
- `libs/app-database/src/types/SubscriptionTable.ts`
- `libs/app-database/src/interfaces/IPlanRepository.ts`
- `libs/app-database/src/interfaces/ISubscriptionRepository.ts`
- `libs/app-database/src/repositories/PlanRepository.ts`
- `libs/app-database/src/repositories/SubscriptionRepository.ts`

**Backend API (12 files)**
- `apps/backend/src/api/modules/billing/billing.module.ts`
- `apps/backend/src/api/modules/billing/billing.controller.ts`
- `apps/backend/src/api/modules/billing/billing.service.ts`
- `apps/backend/src/api/modules/billing/stripe.service.ts`
- `apps/backend/src/api/modules/billing/plan.service.ts`
- `apps/backend/src/api/modules/billing/stripe-webhook.service.ts`
- `apps/backend/src/api/modules/billing/dtos/*.ts` (4 DTOs)
- `apps/backend/src/api/modules/billing/guards/plan.guard.ts`
- `apps/backend/src/api/modules/billing/events/*.ts` (3 events + handlers)

**Frontend (6 files)**
- `apps/frontend/src/pages/settings/billing.tsx`
- `apps/frontend/src/components/billing/PlanCard.tsx`
- `apps/frontend/src/components/billing/CurrentPlan.tsx`
- `apps/frontend/src/components/billing/UpgradeButton.tsx`
- `apps/frontend/src/hooks/useBilling.ts`
- `apps/frontend/src/types/api/billing.ts`

### Files to Modify (~15 files)

- `libs/app-database/src/types/Database.ts`
- `libs/app-database/src/types/index.ts`
- `libs/app-database/src/interfaces/index.ts`
- `libs/app-database/src/repositories/index.ts`
- `libs/domain/src/entities/index.ts`
- `libs/domain/src/enums/index.ts`
- `libs/domain/src/types/index.ts`
- `apps/backend/src/shared/shared.module.ts`
- `apps/backend/src/api/app.module.ts`
- `apps/backend/src/api/modules/workspace/workspace.service.ts`
- `.env.example`

### Files to Delete (~67+ files)

Ver Section 6 (Phase 6: Cleanup) para lista completa de arquivos de mensageria a remover.

---

## 13. Next Steps

1. **Review**: Revisar este plano e validar decisões
2. **Execute**: Usar comando `/dev` para iniciar implementação
3. **Phase by Phase**: Seguir ordem de desenvolvimento definida
4. **Validate**: Testar cada fase antes de prosseguir

---

*Plano criado em: 2025-12-02*
*Última atualização: 2025-12-02*
