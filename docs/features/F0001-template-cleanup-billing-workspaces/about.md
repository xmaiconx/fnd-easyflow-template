# Task: Limpeza do Template + Billing por Workspace com Stripe

**Branch:** refactor/F0001-template-cleanup-billing-workspaces
**Date:** 2025-12-02

## Objective

Preparar o template FND EasyFlow para uso pelos alunos do Fábrica de Negócios Digitais (FND), removendo toda a lógica de mensageria/chat que não é necessária para um SaaS genérico e implementando um sistema de billing completo com Stripe onde cada workspace possui sua própria subscription.

O template deve servir como ponto de partida limpo e educacional, demonstrando boas práticas de implementação de planos e validação de recursos (feature flags) de forma simples e extensível, sem over-engineering, adequado para projetos em fase de POC/MVP.

## Business Context

**Why this functionality is needed:**
O template atual foi construído para um caso de uso específico (chatbots/mensageria) e contém muito código que não é relevante para um SaaS genérico. Os alunos do FND precisam de um ponto de partida limpo que demonstre patterns essenciais de SaaS: multi-tenancy, billing, e feature flags por plano.

**What problem it solves:**
1. Remove complexidade desnecessária (código de mensageria, threads, pipelines)
2. Fornece implementação de billing pronta para uso com Stripe
3. Demonstra pattern de validação de features por plano de forma didática
4. Permite que alunos foquem no core do seu SaaS ao invés de infraestrutura de billing

**Who are the stakeholders:**
- **Alunos FND**: Usuários finais do template que vão construir seus SaaS
- **Idealizador FND (Maicon)**: Define requisitos e valida a qualidade do template
- **Clientes dos alunos**: Usuários finais dos SaaS construídos com o template

## Scope

### What IS included

**Remoção de código:**
- Tabelas: `threads`, `messages`, `projects`
- Entidades: Thread, Message, Project, ProjectSettings
- Repositórios: ThreadRepository, MessageRepository, ProjectRepository
- Enums: MessageType, MessageStatus, MessageDirection, ProjectStatus, InteractiveType
- Types: MessageContext, MessageMetadata, MessageContents, MessageProtocol, MediaObject, PipelineResult, ProjectPipelineConfig
- Pasta completa: `apps/backend/src/shared/messages/`
- Workers de webhooks de chat: whaticket, waha, notificamehub processors
- Parsers de mensagens e webhooks de chat
- Pipeline de processamento de mensagens

**Billing com Stripe:**
- Campo `stripe_customer_id` na tabela `accounts`
- Alteração da tabela `subscriptions` para vincular a `workspace_id`
- Seed com 3 planos: free, starter, professional (UUIDs fixos)
- Campo JSONB `features` na tabela `plans` com limits e flags
- Endpoint para criar Stripe Checkout Session
- Webhook handler para eventos da Stripe
- PlanService para validação de features
- Guards para proteção de rotas por feature
- Integração com Stripe Customer Portal para upgrade/downgrade

**Fluxo de signup:**
- Criar Account
- Criar Stripe Customer (no primeiro checkout, não no signup)
- Criar Workspace com plano FREE automaticamente

**Features de exemplo no template:**
- `limits.workspaces`: número máximo de workspaces por account
- `limits.usersPerWorkspace`: número máximo de usuários por workspace

### What is NOT included (out of scope)

- Implementação de features específicas de negócio (cada aluno define as suas)
- Usage-based billing (cobrança por uso)
- Múltiplas moedas (apenas BRL)
- Cupons e descontos (usar Stripe diretamente)
- Invoices customizadas (usar Stripe)
- Testes automatizados (deixar para os alunos implementarem)
- Migração de dados (template é para novos projetos)

## Business Rules

### Validations

1. **Limite de Workspaces**: Account não pode criar mais workspaces do que o permitido pelo plano do workspace principal (ou soma dos planos)
2. **Limite de Usuários**: Workspace não pode ter mais usuários do que o permitido pelo seu plano
3. **Workspace sem Subscription**: Workspace pode existir com plano FREE (sem subscription ativa na Stripe)
4. **Customer Stripe**: Criado apenas no primeiro checkout (não no signup)

### Flows

#### 1. Main Flow (Happy Path) - Signup + Primeiro Workspace

- Step 1: Usuário faz signup (cria Account + User)
- Step 2: Sistema cria Workspace automaticamente com plano FREE
- Step 3: Usuário usa o sistema com limitações do plano FREE
- Step 4: Usuário decide fazer upgrade

#### 2. Flow de Upgrade

- Step 1: Usuário clica em "Upgrade" no workspace
- Step 2: Sistema verifica se Account já tem `stripe_customer_id`
- Step 3a: Se não tem, cria Customer na Stripe e salva ID
- Step 3b: Se tem, usa Customer existente
- Step 4: Sistema cria Checkout Session com `workspace_id` nos metadata
- Step 5: Usuário completa pagamento no Stripe Checkout
- Step 6: Stripe envia webhook `checkout.session.completed`
- Step 7: Sistema cria/atualiza subscription vinculada ao workspace
- Step 8: Workspace passa a ter acesso às features do novo plano

#### 3. Flow de Gerenciamento de Billing

- Step 1: Usuário clica em "Gerenciar Assinatura"
- Step 2: Sistema cria Stripe Customer Portal Session
- Step 3: Usuário é redirecionado para portal da Stripe
- Step 4: Usuário faz alterações (upgrade, downgrade, cancelar)
- Step 5: Stripe envia webhooks com alterações
- Step 6: Sistema sincroniza estado local

#### 4. Error Flows

**Error Type 1: Limite de Workspaces Atingido**
- Trigger: Usuário tenta criar workspace além do limite
- Handling: Retornar erro 403 Forbidden
- User feedback: "Você atingiu o limite de workspaces do seu plano. Faça upgrade para criar mais."

**Error Type 2: Limite de Usuários Atingido**
- Trigger: Usuário tenta adicionar membro além do limite
- Handling: Retornar erro 403 Forbidden
- User feedback: "Este workspace atingiu o limite de usuários. Faça upgrade do plano."

**Error Type 3: Falha no Pagamento**
- Trigger: Stripe retorna erro no checkout
- Handling: Webhook `invoice.payment_failed`
- User feedback: "Houve um problema com seu pagamento. Por favor, atualize seus dados de pagamento."

## Integrations

### External APIs

- **Stripe API**:
  - Purpose: Gerenciar customers, subscriptions, checkout e portal
  - Endpoints:
    - `POST /v1/customers`
    - `POST /v1/checkout/sessions`
    - `POST /v1/billing_portal/sessions`
    - `GET /v1/subscriptions/:id`
  - Authentication: API Key via `STRIPE_SECRET_KEY`

### Internal Services

- **PlanService**:
  - Purpose: Validar features e limites por plano
  - Dependencies: SubscriptionRepository, PlanRepository

- **StripeService**:
  - Purpose: Wrapper para chamadas à API Stripe
  - Dependencies: ConfigurationService (para API keys)

- **StripeWebhookService**:
  - Purpose: Processar eventos recebidos da Stripe
  - Dependencies: SubscriptionRepository, AccountRepository, WorkspaceRepository

## Edge Cases Identified

1. **Workspace deletado com subscription ativa**:
   - Description: Usuário deleta workspace que tem subscription
   - Handling: Cancelar subscription na Stripe antes de deletar

2. **Downgrade com recursos acima do limite**:
   - Description: Usuário faz downgrade mas tem 5 workspaces quando novo plano permite 3
   - Handling: Não bloquear uso, mas impedir criação de novos até estar dentro do limite

3. **Webhook duplicado da Stripe**:
   - Description: Stripe pode enviar o mesmo evento múltiplas vezes
   - Handling: Usar `stripe_subscription_id` como idempotency key

4. **Account sem Customer Stripe tenta acessar portal**:
   - Description: Usuário nunca fez checkout mas quer gerenciar billing
   - Handling: Mostrar mensagem "Você ainda não possui assinaturas ativas"

## Acceptance Criteria

1. [ ] Código de mensageria completamente removido (threads, messages, pipeline, workers)
2. [ ] Código de projects completamente removido
3. [ ] Tabela `accounts` possui campo `stripe_customer_id`
4. [ ] Tabela `subscriptions` vinculada a `workspace_id` (não apenas `account_id`)
5. [ ] Seed cria 3 planos (free, starter, professional) com UUIDs fixos
6. [ ] Campo `features` (JSONB) na tabela `plans` com estrutura `{limits, flags}`
7. [ ] PlanService implementado com métodos `canUseFeature()` e `checkLimit()`
8. [ ] Guard `@RequiresPlan()` ou similar para proteção de rotas
9. [ ] Endpoint POST `/billing/checkout` cria Checkout Session
10. [ ] Endpoint POST `/billing/portal` cria Customer Portal Session
11. [ ] Webhook handler para eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
12. [ ] Signup cria workspace com plano FREE automaticamente
13. [ ] Skill `stripe` atualizada com patterns de validação de features
14. [ ] Build passa sem erros
15. [ ] Aplicação inicia corretamente

## Next Steps

O Planning Agent deve focar em:

1. **Ordem de remoção**: Definir sequência segura para remover código de mensageria sem quebrar dependências
2. **Alterações de schema**: Planejar migrations para alterações nas tabelas existentes
3. **Estrutura do PlanService**: Definir interface e implementação
4. **Módulo de Billing**: Estruturar controllers, services e DTOs
5. **Atualização do CLAUDE.md**: Remover referências a mensageria e adicionar seção de billing
