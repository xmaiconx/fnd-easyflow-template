# Brainstorm: Gerenciamento de Planos no Manager

**Data:** 2025-12-22
**Participantes:** Founder + Claude

---

## Problema ou Necessidade

O super-admin precisa gerenciar planos, preços e assinaturas diretamente pelo painel Manager, sem depender do dashboard da Stripe ou de deploys para alterar configurações visuais dos planos.

**Quem é afetado:** Super-admins que gerenciam o SaaS

**Situação atual:**
- Backend tem entities Plan, PlanPrice, Subscription com integração Stripe básica
- Frontend de billing tem planos hardcoded (não vem do banco)
- Não existe UI no Manager para gerenciar planos
- Validação de features usa strings mágicas (frágil)

---

## O que o Usuário Quer

### Cenário Ideal

1. Super-admin acessa Manager > Planos
2. Vê lista de planos com preços e assinaturas ativas
3. Pode criar/editar planos e associar com produtos Stripe via dropdown
4. Pode configurar badges ("Popular"), ordem de exibição, CTAs - tudo reflete no frontend automaticamente
5. Pode estender acesso, dar trial, fazer upgrade manual - com campo de motivo obrigatório
6. Todas ações ficam registradas em audit log

### Decisões Tomadas

| Decisão | Motivo |
|---------|--------|
| Abordagem híbrida Stripe | Flexibilidade: criar local primeiro, associar Stripe depois |
| Grandfathering de preços | Manter usuários antigos em preço original |
| Trials manuais | Admin pode dar trial de X dias para contas específicas |
| Sem pausa de assinatura | Cancelamento vale até fim do período; upgrade cobra diferença |
| Somente super-admins | Operação sensível, não delegar para account-admins |
| Campo reason obrigatório | Auditoria de ações administrativas |
| Sem notificação em extend | Admin estende acesso silenciosamente |
| Confirmação em ações | Modal com total de dias e data final antes de confirmar |
| Múltiplos preços por plano | Mensal + anual com toggle no frontend |

---

## Discovery Inicial

### O que já existe no sistema

| Arquivo | O que faz |
|---------|-----------|
| [Plan.ts](libs/domain/src/entities/Plan.ts) | Entity com stripeProductId, code, features JSON |
| [PlanPrice.ts](libs/domain/src/entities/PlanPrice.ts) | Entity com stripePriceId, amount, interval |
| [Subscription.ts](libs/domain/src/entities/Subscription.ts) | Entity com status, currentPeriodEnd |
| [plan.service.ts](apps/backend/src/api/modules/billing/plan.service.ts) | canUseFeature, checkLimit (strings mágicas) |
| [stripe.service.ts](apps/backend/src/api/modules/billing/stripe.service.ts) | Checkout, portal, webhook |
| [billing.tsx](apps/frontend/src/pages/billing.tsx) | Página com planos hardcoded (mockPlans) |

### O que precisa ser criado

**Backend:**
- Endpoints CRUD de planos no módulo Manager
- Endpoints de ações administrativas (extend, grant trial, upgrade manual)
- Enums type-safe para features e limits
- Decorator @RequireFeature para validação declarativa
- Feature Guard
- Cache de planos com invalidação

**Frontend:**
- Páginas do Manager para gerenciar planos
- Refatorar billing.tsx para consumir planos do backend
- Componentes para exibir badges, features dinâmicas

---

## Specs Técnicas

### Estrutura de PlanFeatures Expandida

```json
{"limits":{"workspaces":5,"usersPerWorkspace":20,"storageGb":10},"flags":{"analytics":true,"prioritySupport":true},"display":{"badge":"popular","displayOrder":2,"highlighted":true,"ctaText":"Assinar Pro","ctaVariant":"default","comparisonLabel":"Tudo do Free, mais:","displayFeatures":[{"text":"5 workspaces","icon":"folder"},{"text":"Suporte prioritário","icon":"headset","highlight":true}]}}
```

{"newTypes":[{"name":"PlanDisplayConfig","fields":"badge, displayOrder, highlighted, ctaText, ctaVariant, comparisonLabel, displayFeatures"},{"name":"DisplayFeature","fields":"text, icon?, tooltip?, highlight?"},{"name":"PlanFeatureFlag","type":"enum","values":"ANALYTICS, PRIORITY_SUPPORT, PREMIUM_INTEGRATIONS, API_ACCESS, CUSTOM_BRANDING, AUDIT_LOGS, SSO"},{"name":"PlanLimit","type":"enum","values":"WORKSPACES, USERS_PER_WORKSPACE, STORAGE_GB, API_CALLS_PER_MONTH"}]}

---

### Ações Administrativas

{"actions":[{"name":"ExtendAccess","desc":"Estender período sem cobrança","fields":"subscriptionId, days, reason"},{"name":"GrantTrial","desc":"Dar trial de plano pago","fields":"accountId, planId, days, reason"},{"name":"ManualUpgrade","desc":"Upgrade com cobrança proporcional","fields":"subscriptionId, newPlanPriceId, reason"},{"name":"ManualCancel","desc":"Cancelar ao fim do período","fields":"subscriptionId, reason"}]}

{"auditRequired":true,"reasonField":"obrigatório em todas ações"}

---

### Pattern de Validação de Features

**Fluxo:** Request → FeatureGuard → Reflector.get(REQUIRED_FEATURE_KEY) → PlanService.canUseFeature → Allow/Deny

{"decorator":"@RequireFeature(PlanFeatureFlag.ANALYTICS)","guard":"FeatureGuard","error":{"code":"FEATURE_NOT_AVAILABLE","feature":"analytics","message":"This feature requires an upgraded plan"}}

{"limitValidation":"Usar PlanService.validateX() antes de operações que consomem quota"}

---

### Estratégia de Cache

**Problema:** Consultar plano do workspace a cada request é custoso.

{"cacheStrategy":"Redis com TTL + invalidação por evento"}

**Cache Keys:**
```
plan:{planId} → Plan entity (TTL: 1h)
workspace:{workspaceId}:plan → Plan entity (TTL: 5min)
plans:active → Plan[] (TTL: 5min)
```

**Invalidação por Evento:**

| Evento | Cache Invalidado |
|--------|------------------|
| PlanUpdatedEvent | `plan:{planId}`, `plans:active` |
| PlanPriceUpdatedEvent | `plan:{planId}` |
| SubscriptionCreatedEvent | `workspace:{workspaceId}:plan` |
| SubscriptionUpdatedEvent | `workspace:{workspaceId}:plan` |
| SubscriptionCanceledEvent | `workspace:{workspaceId}:plan` |

{"implementation":"Event handlers chamam CacheService.invalidate(keys)"}

**Cache Service Interface:**

```typescript
interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  invalidate(keys: string | string[]): Promise<void>;
  invalidatePattern(pattern: string): Promise<void>;
}
```

{"cacheFallback":"Se cache miss, busca no DB e popula cache antes de retornar"}

---

### Endpoints do Manager para Planos

{"prefix":"/api/v1/manager/plans"}

| Método | Path | Descrição |
|--------|------|-----------|
| GET | / | Listar todos os planos |
| GET | /:id | Detalhes do plano com preços |
| POST | / | Criar plano |
| PATCH | /:id | Atualizar plano |
| PATCH | /:id/activate | Ativar plano |
| PATCH | /:id/deactivate | Desativar plano |
| POST | /:id/prices | Adicionar preço |
| PATCH | /:id/prices/:priceId | Atualizar preço |
| POST | /:id/link-stripe | Associar produto Stripe |

{"prefix":"/api/v1/manager/subscriptions"}

| Método | Path | Descrição |
|--------|------|-----------|
| GET | / | Listar assinaturas com filtros |
| GET | /:id | Detalhes da assinatura |
| POST | /:id/extend | Estender acesso |
| POST | /:id/upgrade | Upgrade manual |
| POST | /:id/cancel | Cancelar assinatura |
| POST | /grant-trial | Dar trial para account |

---

### Ajustes no Frontend

**billing.tsx - Remover hardcode:**

| Antes | Depois |
|-------|--------|
| `mockPlans` constante | `useQuery(['plans'], fetchPlans)` |
| `features: string[]` | `features: DisplayFeature[]` |
| `isRecommended={plan.code === "pro"}` | `isRecommended={plan.features.display.badge === 'popular'}` |

**Novo endpoint para frontend:**
```
GET /api/v1/billing/plans → retorna planos ativos com display metadata
```

{"frontendChanges":[{"file":"apps/frontend/src/pages/billing.tsx","change":"Consumir planos da API, toggle mensal/anual, display metadata"},{"file":"apps/frontend/src/components/features/billing/plan-card.tsx","change":"Renderizar badge, displayFeatures, ctaText, preço dinâmico por interval"},{"file":"apps/frontend/src/components/features/billing/billing-interval-toggle.tsx","change":"Novo componente toggle Mensal/Anual com estado"},{"file":"apps/frontend/src/types/billing.ts","change":"Adicionar interfaces PlanDisplayConfig, DisplayFeature, PlanPrice com interval"}]}

---

### Sincronização Stripe (Híbrida)

**Fluxo de Associação:**

1. Admin cria plano local (sem stripeProductId)
2. Admin clica "Associar Stripe"
3. UI busca produtos Stripe via `GET /manager/stripe/products`
4. Admin seleciona produto → sistema salva stripeProductId
5. Admin seleciona price → sistema salva stripePriceId

{"stripeEndpoints":[{"path":"GET /manager/stripe/products","desc":"Lista produtos da Stripe"},{"path":"GET /manager/stripe/products/:id/prices","desc":"Lista preços de um produto"}]}

{"syncRules":["Plano local pode existir sem Stripe (draft)","Stripe IDs são opcionais até publicar","Validar existência do ID na Stripe antes de ativar plano"]}

---

## Múltiplos Preços por Plano (Mensal/Anual)

### Estrutura de PlanPrice

{"priceFields":{"id":"uuid","planId":"uuid","stripePriceId":"string|null","amount":"number (centavos)","currency":"string (BRL)","interval":"monthly|yearly","intervalCount":"number (1 para mensal, 1 para anual)","isCurrent":"boolean","createdAt":"Date"}}

### Lógica do Frontend

**Toggle Mensal/Anual:**
- Frontend busca planos com todos os preços
- Agrupa preços por `interval`
- Se plano tem preço yearly, mostra toggle
- Toggle altera qual preço exibir no card

{"frontendLogic":"hasYearlyPrice = plan.prices.some(p => p.interval === 'yearly')"}

**Economia anual:**
- Calcular: `(monthlyPrice * 12) - yearlyPrice`
- Exibir: "Economize R$ X por ano" ou "2 meses grátis"

### Endpoint Atualizado

```
GET /api/v1/billing/plans
Response: Plan[] com prices: PlanPrice[] ordenados por interval
```

{"priceOrder":["monthly","yearly"],"displayDefault":"monthly"}

---

### UX de Confirmação em Ações Administrativas

**Fluxo ExtendAccess / GrantTrial:**

1. Admin seleciona ação e preenche dias + reason
2. Sistema calcula e exibe modal de confirmação:
   - "Extensão de X dias"
   - "Novo vencimento: DD/MM/YYYY"
   - Campo reason preenchido
3. Admin confirma → ação executada

{"confirmationModal":{"fields":["totalDays","currentEndDate","newEndDate","reason"],"buttons":["Cancelar","Confirmar Extensão"]}}

---

## Próximo Passo

**Para transformar isso em feature:**
Execute `/feature` e use este documento como base.

**Descrição sugerida para o `/feature`:**
> Implementar gerenciamento completo de planos no Manager com CRUD de planos/preços, ações administrativas (extend, trial, upgrade), associação com Stripe, validação type-safe de features e cache inteligente.

---

*Documento de brainstorm - use como input para `/feature`*
