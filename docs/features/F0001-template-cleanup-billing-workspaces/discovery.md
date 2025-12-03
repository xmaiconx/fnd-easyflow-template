# Discovery: Limpeza do Template + Billing por Workspace com Stripe

**Branch:** refactor/F0001-template-cleanup-billing-workspaces
**Date:** 2025-12-02

## Initial Analysis

### Commit History

**Recent commits analyzed:**
```
8bb02ef feat: add Stripe integration documentation and database migration for billing tables
3b5b49a .
259e7a6 feat: add comprehensive help and PRD discovery scripts in Brazilian Portuguese
4e440af fix: update placeholder replacement in create-feature-docs.sh to use alternative delimiter
4600446 refactor: automate branch type and feature name inference in feature discovery
b662f93 feat: add language rule for user interaction and documentation in Brazilian Portuguese
ba24774 refactor: /done auto-generates commit messages without asking
56a9100 refactor: /hotfix leaves commit/push to /done command
0a271a7 feat: add /hotfix command for rapid critical bug fixes
e45deb0 refactor: simplify /done command with automatic squash merge and /fix integration
f9dc95e feat: add /done command for feature completion and merge to main
```

**Key observations:**
- Commit `8bb02ef` já adicionou migration de billing tables e documentação Stripe
- Template está em evolução ativa com foco em workflows de desenvolvimento
- Já existe infraestrutura base de billing (plans, plan_prices, subscriptions, payment_history)

### Modified Files

**Files already modified in this branch:**
```
(Branch criada a partir da main, sem modificações ainda além dos docs de discovery)
```

### Related Functionalities

**Estrutura de Billing existente:**
- Migration: `libs/app-database/migrations/20251202001_create_billing_tables.js`
- Interface: `libs/backend/src/payment/IPaymentGateway.ts`
- Types: `libs/backend/src/payment/types.ts`
- Enum: `libs/domain/src/enums/PaymentProvider.ts`

**Código de Mensageria a remover (95 arquivos identificados):**
- `apps/backend/src/shared/messages/` - Pipeline completo
- `apps/backend/src/workers/webhooks/` - Processors de chat
- `apps/backend/src/workers/messages/` - Message pipeline processor
- `libs/app-database/src/repositories/ThreadRepository.ts`
- `libs/app-database/src/repositories/MessageRepository.ts`
- `libs/domain/src/entities/Thread.ts` (implícito)
- `libs/domain/src/types/Message*.ts` - Vários types

**Patterns identificados:**
- Multi-tenancy via `account_id` em todas as queries
- CQRS para operações de escrita
- Event-driven com BullMQ
- Repository pattern com Kysely

## Strategic Questionnaire

### Category 1: Scope & Objective

**Q:** Qual é o objetivo principal dessa funcionalidade?
**A:** Preparar o template FND EasyFlow para uso pelos alunos, removendo código de mensageria e implementando billing completo com Stripe onde cada workspace tem sua própria subscription.

**Q:** Quem são os usuários/sistemas que interagem?
**A:** Alunos do FND que vão usar o template para construir seus SaaS. O idealizador (Maicon) define requisitos.

**Q:** Qual problema específico estamos resolvendo?
**A:** Template atual tem muito código específico de chatbots que não é relevante para SaaS genérico. Alunos precisam de ponto de partida limpo com billing funcional.

### Category 2: Business Rules

**Q:** Existem validações ou restrições específicas?
**A:**
- Limite de workspaces por account (definido pelo plano)
- Limite de usuários por workspace (definido pelo plano)
- Workspace pode existir sem subscription (plano FREE)

**Q:** Como tratar casos de erro?
**A:** Retornar mensagens amigáveis ao usuário. Usar Stripe Customer Portal para gerenciamento.

**Q:** Existem dependências de outras funcionalidades?
**A:** Auth (signup), Workspaces, Accounts. Todas já existem no template.

**Q:** Existem limites, quotas ou throttling?
**A:** Sem limite de workspaces no nível de sistema - limite definido pelo plano (paga por workspace).

### Category 3: Data & Integration

**Q:** Quais dados precisam ser persistidos?
**A:**
- `stripe_customer_id` em accounts
- `workspace_id` em subscriptions (alteração)
- Campo `features` (JSONB) em plans

**Q:** Existem integrações externas?
**A:** Stripe API para customers, subscriptions, checkout e portal.

**Q:** Processamento assíncrono é necessário?
**A:** Sim, webhooks da Stripe são processados via endpoint dedicado.

### Category 4: Edge Cases & Failure Scenarios

**Q:** O que acontece em cenários de falha?
**A:**
- Falha no pagamento: webhook notifica, subscription fica inativa
- Webhook duplicado: usar idempotency via stripe_subscription_id

**Q:** Como lidar com dados legados ou migrações?
**A:** Não aplicável - template é para novos projetos.

**Q:** Existem preocupações de performance ou escalabilidade?
**A:** Não para MVP. Volume baixo esperado.

**Q:** Existem considerações de segurança específicas?
**A:**
- Validar assinatura de webhooks Stripe
- API keys em variáveis de ambiente
- Apenas owner do Account pode ver/gerenciar billing

### Category 5: UI/UX (if applicable)

**Q:** Como deve ser a experiência do usuário?
**A:** Simples - botão de upgrade, redirecionamento para Stripe Checkout/Portal.

**Q:** Existem estados de loading/erro específicos?
**A:** Padrão do sistema (skeleton + toast).

## Decisions and Clarifications

### Decision 1: Customer Stripe no Primeiro Checkout
**Context:** Quando criar o Customer na Stripe? No signup ou no primeiro checkout?
**Decision:** No primeiro checkout (opção B)
**Impact:** Simplifica signup, evita customers órfãos na Stripe
**Rationale:** Muitos usuários podem fazer signup e nunca pagar. Criar customer só quando necessário.

### Decision 2: Limite de Workspaces
**Context:** Como limitar workspaces por account?
**Decision:** Sem limite no sistema - definido pelo plano (opção A: paga por workspace)
**Impact:** Cada workspace precisa de subscription própria
**Rationale:** Modelo mais flexível e alinhado com SaaS modernos.

### Decision 3: Workspace sem Subscription
**Context:** Workspace pode existir sem subscription ativa?
**Decision:** Sim, com plano FREE
**Impact:** Precisa criar 3 planos: free, starter, professional
**Rationale:** Permite trial/freemium, reduz fricção de entrada.

### Decision 4: Workspace FREE no Signup
**Context:** Como funciona o primeiro workspace?
**Decision:** Criar workspace com plano FREE automaticamente no signup (opção A)
**Impact:** Todo signup resulta em Account + User + Workspace (FREE)
**Rationale:** Usuário já pode usar o sistema imediatamente.

### Decision 5: Estrutura de Features
**Context:** Como armazenar features/limites por plano?
**Decision:** Campo JSONB `features` na tabela `plans` com estrutura `{limits, flags}`
**Impact:** Flexível, sem necessidade de tabelas extras
**Rationale:** Simples para MVP, fácil de estender, evita over-engineering.

### Decision 6: Features de Exemplo
**Context:** Quais features implementar como exemplo?
**Decision:** Apenas `limits.workspaces` e `limits.usersPerWorkspace`
**Impact:** Template demonstra o pattern, alunos adicionam suas features
**Rationale:** Didático sem ser complexo demais.

### Decision 7: Upgrade/Downgrade
**Context:** Como gerenciar mudanças de plano?
**Decision:** Via Stripe Customer Portal
**Impact:** Menos código, Stripe gerencia complexidade
**Rationale:** Evita reinventar a roda, Stripe já resolve bem.

## Assumptions & Premises

1. **Template para novos projetos**: Não há dados existentes para migrar
   - Impact if wrong: Seria necessário criar scripts de migração

2. **Moeda única (BRL)**: Apenas Real brasileiro
   - Impact if wrong: Precisaria de lógica de múltiplas moedas

3. **Stripe como único gateway**: Não haverá outros provedores de pagamento
   - Impact if wrong: Interface IPaymentGateway permite extensão futura

4. **Alunos têm conta Stripe**: Cada aluno configura sua própria conta Stripe
   - Impact if wrong: Precisaria de documentação de setup

## Edge Cases Identified

1. **Workspace deletado com subscription ativa**:
   - Description: Usuário tenta deletar workspace que tem subscription paga
   - Likelihood: Medium
   - Handling Strategy: Cancelar subscription na Stripe antes de deletar

2. **Downgrade com recursos acima do limite**:
   - Description: Account tem 5 workspaces, faz downgrade para plano que permite 3
   - Likelihood: Medium
   - Handling Strategy: Permitir uso existente, bloquear criação de novos

3. **Webhook duplicado**:
   - Description: Stripe envia mesmo evento múltiplas vezes
   - Likelihood: High (comportamento normal da Stripe)
   - Handling Strategy: Idempotência via stripe_subscription_id

4. **Customer sem subscriptions tenta acessar portal**:
   - Description: Usuário nunca fez checkout mas clica em "Gerenciar Assinatura"
   - Likelihood: Low
   - Handling Strategy: Verificar se tem subscriptions antes, mostrar mensagem apropriada

## Out of Scope Items

1. **Usage-based billing** - Cobrança por uso é complexa demais para MVP
2. **Múltiplas moedas** - Apenas BRL para simplificar
3. **Cupons e descontos** - Usar Stripe diretamente quando necessário
4. **Testes automatizados** - Alunos implementam conforme necessidade
5. **Invoices customizadas** - Stripe já fornece invoices
6. **Notificações de billing** - Stripe envia emails automaticamente

## References

### Codebase Files Consulted
- `libs/app-database/migrations/20251202001_create_billing_tables.js`: Schema de billing existente
- `libs/backend/src/payment/IPaymentGateway.ts`: Interface de pagamento
- `libs/backend/src/payment/types.ts`: Types de pagamento
- `libs/domain/src/entities/Project.ts`: Entidade a ser removida
- `libs/app-database/migrations/20240926001_create_core_tables.js`: Schema de accounts/workspaces
- `.claude/skills/stripe/SKILL.md`: Skill de Stripe existente

### Documentation Consulted
- CLAUDE.md: Arquitetura e padrões do projeto
- Skill Stripe: Patterns de integração

### Related Functionalities
- Auth module: Signup que precisará criar workspace FREE
- Workspace module: Já existe, precisará de integração com billing
- Accounts: Precisará de campo stripe_customer_id

## Summary for Planning

**Executive Summary:**
Este refactor transforma o template FND EasyFlow de um sistema de chatbots em um template SaaS genérico com billing. O trabalho envolve duas frentes principais: (1) remoção massiva de código de mensageria (~95 arquivos) e (2) implementação de billing por workspace com Stripe.

A arquitetura de billing foi definida: Account é o Customer Stripe, cada Workspace tem sua própria Subscription, e features são validadas via JSONB na tabela plans. O modelo permite plano FREE sem subscription na Stripe, facilitando freemium/trial.

O foco é simplicidade e didática - o template deve ser fácil de entender e modificar pelos alunos, evitando over-engineering típico de projetos enterprise.

**Critical Requirements:**
- Remover código de mensageria sem quebrar o sistema
- Subscription vinculada a workspace (não account)
- Plano FREE automático no signup
- Features via JSONB com pattern de validação claro
- Skill Stripe atualizada com patterns de features

**Technical Constraints:**
- Manter compatibilidade com estrutura NestJS existente
- Usar patterns já estabelecidos (Repository, CQRS, Event-driven)
- Migrations devem ser reversíveis
- Não quebrar auth/workspace existentes

**Next Phase Focus:**
O Planning Agent deve priorizar:
1. Mapear dependências para remoção segura de código
2. Definir ordem das migrations
3. Estruturar módulo de billing (controller, service, DTOs)
4. Definir interface do PlanService
5. Planejar integração com signup existente
