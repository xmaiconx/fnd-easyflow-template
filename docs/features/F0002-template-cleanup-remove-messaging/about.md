# Feature F0002: Template Cleanup - Remover Código de Mensageria

**Status:** Planejado
**Prioridade:** Alta
**Estimativa:** 2-3 horas
**Depende de:** F0001 (Billing + Workspace Infrastructure)

---

## 📋 Objetivo

Transformar o template FND EasyFlow de um sistema de chatbot específico em um **template SaaS genérico**, removendo todo código relacionado a:

- Sistema de mensageria (threads, messages)
- Processamento de webhooks de canais (Whaticket, Waha, Notificamehub)
- Pipelines de processamento de mensagens
- Integrações específicas de chatbot
- Projetos e configurações de bots

---

## 🎯 Contexto

O template atual foi originalmente desenvolvido como uma plataforma de chatbots com IA. Com a implementação do sistema de billing por workspace (F0001), o objetivo agora é torná-lo um **template genérico** que alunos da FND possam usar como base para qualquer tipo de SaaS.

### Arquitetura Atual (A Remover)
```
Sistema de Mensageria:
├── Threads (conversas)
├── Messages (mensagens individuais)
├── Projects (configurações de bots)
├── WebhookEvents (eventos de canais externos)
├── Pipeline de processamento
│   ├── BufferMessagesStep
│   ├── ConvertMediaToTextStep
│   ├── GenerateAIResponseStep
│   └── SendResponseStep
└── Integrações
    ├── Whaticket
    ├── Waha
    └── Notificamehub
```

### Arquitetura Desejada (Pós-Cleanup)
```
Template SaaS Genérico:
├── Auth (signup, signin, email verification)
├── Multi-tenancy (Account → Workspaces → Users)
├── Billing (Stripe integration por workspace)
├── Audit Logs
└── Base limpa para desenvolvimento
```

---

## 📂 Arquivos a Remover

### 1. Database Layer (libs/app-database/)

#### Migrations
- `migrations/20241030001_create_threads_table.js`
- `migrations/20241030002_create_messages_table.js`
- `migrations/20241030003_create_projects_table.js`
- `migrations/20241030004_alter_webhook_events_add_normalized_message.js`
- `migrations/20241027001_create_webhook_events_table.js`

#### Types (Kysely)
- `src/types/ThreadTable.ts`
- `src/types/MessageTable.ts`
- `src/types/ProjectTable.ts`
- `src/types/WebhookEventTable.ts`

#### Repositories
- `src/repositories/ThreadRepository.ts`
- `src/repositories/MessageRepository.ts`
- `src/repositories/ProjectRepository.ts`
- `src/repositories/WebhookEventRepository.ts`

#### Interfaces
- `src/interfaces/IThreadRepository.ts`
- `src/interfaces/IMessageRepository.ts`
- `src/interfaces/IProjectRepository.ts`
- `src/interfaces/IWebhookEventRepository.ts`

**Total: ~17 arquivos**

---

### 2. Domain Layer (libs/domain/)

#### Entities
- `src/entities/Thread.ts`
- `src/entities/Message.ts`
- `src/entities/Project.ts`
- `src/entities/WebhookEvent.ts`

#### Enums
- `src/enums/MessageType.ts`
- `src/enums/MessageStatus.ts`
- `src/enums/MessageDirection.ts`
- `src/enums/InteractiveType.ts`
- `src/enums/ChatChannel.ts`
- `src/enums/ChatProvider.ts`
- `src/enums/ChatImplementation.ts`
- `src/enums/WebhookStatus.ts`
- `src/enums/WebhookType.ts`
- `src/enums/ProjectStatus.ts`

#### Types
- `src/types/MessageProtocol.ts`
- `src/types/MessageContents.ts`
- `src/types/MessageMetadata.ts`
- `src/types/MessageContext.ts`
- `src/types/MediaObject.ts`
- `src/types/PipelineResult.ts`
- `src/types/WebhookMetadata.ts`
- `src/types/WebhookGatewayConfig.ts`
- `src/types/ProjectPipelineConfig.ts`

**Total: ~23 arquivos**

---

### 3. Backend Services Layer (libs/backend/)

#### Interfaces
- `src/pipelines/IMessagePipeline.ts`
- `src/pipelines/IMessagePipelineStep.ts`
- `src/webhooks/IWebhookParser.ts`
- `src/webhooks/IMessageParser.ts`
- `src/messaging/IMessageBufferService.ts`

**Total: ~5 arquivos**

---

### 4. Backend App (apps/backend/)

#### API Modules
**Webhooks Module** (pasta completa):
- `src/api/modules/webhooks/` (todos os arquivos)
  - `webhooks.controller.ts`
  - `webhooks.service.ts`
  - `webhooks.module.ts`
  - `dtos/`

#### Workers/Processors
- `src/workers/webhooks/` (pasta completa)
  - `BaseWebhookProcessor.ts`
  - `WhaticketWebhookProcessor.ts`
  - `WahaWebhookProcessor.ts`
  - `NotificamehubWebhookProcessor.ts`
- `src/workers/messages/MessagePipelineProcessor.ts`
- `src/workers/messages/MessageBufferProcessor.ts`

#### Shared Services
**Pipeline** (pasta completa):
- `src/shared/messages/pipeline/` (todos os arquivos)
  - `MessagePipeline.ts`
  - `MessagePipelineFactory.ts`
  - `PipelineStepRegistry.ts`
  - `steps/` (pasta completa com todos os steps)
    - `AddToBufferStep.ts`
    - `BufferMessagesStep.ts`
    - `CheckCommandStep.ts`
    - `ClearBufferStep.ts`
    - `ConvertMediaToTextStep.ts`
    - `GenerateAIResponseStep.ts`
    - `LoadBufferedMessagesStep.ts`
    - `SaveMessageStep.ts`
    - `SendResponseStep.ts`
    - `VerifyAuthorizedSenderStep.ts`
  - `projects/` (pasta completa - steps customizados)

**Factories**:
- `src/shared/webhooks/WebhookParserFactory.ts`
- `src/shared/webhooks/MessageParserFactory.ts`

**Services**:
- `src/shared/services/message-buffer.service.ts`

**Total: ~25+ arquivos**

---

## 🔧 Passos de Execução

### Pré-requisitos
1. ✅ F0001 deve estar completo e funcionando
2. ✅ Build deve estar passando 100%
3. ✅ Criar backup da branch atual
4. ✅ Criar nova branch para F0002

### Etapa 1: Preparação
```bash
# Criar backup
git checkout main
git pull origin main
git checkout -b backup/before-messaging-cleanup

# Criar branch da feature
git checkout -b feature/F0002-remove-messaging-code
```

### Etapa 2: Remover Database Layer

```bash
# Remover migrations (NÃO rodar rollback - apenas deletar arquivos)
rm libs/app-database/migrations/20241030001_create_threads_table.js
rm libs/app-database/migrations/20241030002_create_messages_table.js
rm libs/app-database/migrations/20241030003_create_projects_table.js
rm libs/app-database/migrations/20241030004_alter_webhook_events_add_normalized_message.js
rm libs/app-database/migrations/20241027001_create_webhook_events_table.js

# Remover types
rm libs/app-database/src/types/ThreadTable.ts
rm libs/app-database/src/types/MessageTable.ts
rm libs/app-database/src/types/ProjectTable.ts
rm libs/app-database/src/types/WebhookEventTable.ts

# Remover repositories
rm libs/app-database/src/repositories/ThreadRepository.ts
rm libs/app-database/src/repositories/MessageRepository.ts
rm libs/app-database/src/repositories/ProjectRepository.ts
rm libs/app-database/src/repositories/WebhookEventRepository.ts

# Remover interfaces
rm libs/app-database/src/interfaces/IThreadRepository.ts
rm libs/app-database/src/interfaces/IMessageRepository.ts
rm libs/app-database/src/interfaces/IProjectRepository.ts
rm libs/app-database/src/interfaces/IWebhookEventRepository.ts
```

**Atualizar barrel exports**:
- [ ] `libs/app-database/src/types/index.ts` - remover exports
- [ ] `libs/app-database/src/types/Database.ts` - remover tabelas do schema
- [ ] `libs/app-database/src/repositories/index.ts` - remover exports
- [ ] `libs/app-database/src/interfaces/index.ts` - remover exports

### Etapa 3: Remover Domain Layer

```bash
# Remover entities
rm libs/domain/src/entities/Thread.ts
rm libs/domain/src/entities/Message.ts
rm libs/domain/src/entities/Project.ts
rm libs/domain/src/entities/WebhookEvent.ts

# Remover enums
rm libs/domain/src/enums/MessageType.ts
rm libs/domain/src/enums/MessageStatus.ts
rm libs/domain/src/enums/MessageDirection.ts
rm libs/domain/src/enums/InteractiveType.ts
rm libs/domain/src/enums/ChatChannel.ts
rm libs/domain/src/enums/ChatProvider.ts
rm libs/domain/src/enums/ChatImplementation.ts
rm libs/domain/src/enums/WebhookStatus.ts
rm libs/domain/src/enums/WebhookType.ts
rm libs/domain/src/enums/ProjectStatus.ts

# Remover types
rm libs/domain/src/types/MessageProtocol.ts
rm libs/domain/src/types/MessageContents.ts
rm libs/domain/src/types/MessageMetadata.ts
rm libs/domain/src/types/MessageContext.ts
rm libs/domain/src/types/MediaObject.ts
rm libs/domain/src/types/PipelineResult.ts
rm libs/domain/src/types/WebhookMetadata.ts
rm libs/domain/src/types/WebhookGatewayConfig.ts
rm libs/domain/src/types/ProjectPipelineConfig.ts
```

**Atualizar barrel exports**:
- [ ] `libs/domain/src/entities/index.ts` - remover exports
- [ ] `libs/domain/src/enums/index.ts` - remover exports
- [ ] `libs/domain/src/types/index.ts` - remover exports

### Etapa 4: Remover Backend Services Layer

```bash
# Remover interfaces
rm -rf libs/backend/src/pipelines/
rm -rf libs/backend/src/webhooks/
rm libs/backend/src/messaging/IMessageBufferService.ts
```

**Atualizar barrel exports**:
- [ ] `libs/backend/src/index.ts` - remover exports de pipelines, webhooks, messaging

### Etapa 5: Remover Backend App

```bash
# Remover módulos completos
rm -rf apps/backend/src/api/modules/webhooks/

# Remover workers
rm -rf apps/backend/src/workers/webhooks/
rm -rf apps/backend/src/workers/messages/

# Remover shared services
rm -rf apps/backend/src/shared/messages/
rm -rf apps/backend/src/shared/webhooks/
rm apps/backend/src/shared/services/message-buffer.service.ts
```

**Atualizar módulos**:
- [ ] `apps/backend/src/api/app.module.ts` - remover `WebhooksModule`
- [ ] `apps/backend/src/workers/worker.module.ts` - remover processors de mensageria
- [ ] `apps/backend/src/shared/shared.module.ts` - remover providers relacionados:
  - `IMessageBufferService`
  - Repositories: Thread, Message, Project, WebhookEvent
  - Qualquer factory de webhook/pipeline

### Etapa 6: Atualizar Documentação

**Atualizar CLAUDE.md**:
- [ ] Remover seção "Backend API Modules" → webhooks
- [ ] Remover seção "Pipeline Pattern"
- [ ] Remover seção "Factory Pattern" (WebhookParserFactory, MessageParserFactory, MessagePipelineFactory)
- [ ] Remover referências a Message Buffer Service
- [ ] Atualizar "Database Schema" - remover tabelas: threads, messages, projects, webhook_events
- [ ] Atualizar "Domain Layer Organization" - remover entities, enums, types relacionados

**Criar implementation.md para F0002**:
- [ ] Documentar todos os arquivos removidos
- [ ] Documentar mudanças em barrel exports
- [ ] Documentar mudanças em módulos NestJS

---

## ✅ Checklist de Validação

### Build & TypeScript
- [ ] `npm run build` - passa sem erros
- [ ] Nenhum import órfão para código removido
- [ ] Database types compilando corretamente

### Runtime
- [ ] Backend API inicia sem erros
- [ ] Workers iniciam sem erros (se aplicável)
- [ ] Nenhum erro de DI (providers faltando)

### Funcionalidades Core
- [ ] ✅ Auth: Signup funciona
- [ ] ✅ Auth: Signin funciona
- [ ] ✅ Auth: Email verification funciona
- [ ] ✅ Workspaces: Criação funciona
- [ ] ✅ Workspaces: Listagem funciona
- [ ] ✅ Billing: GET /billing/plans funciona
- [ ] ✅ Audit: Logs sendo criados corretamente

### Database
- [ ] Migrations antigas de mensageria não interferem
- [ ] Schema limpo sem tabelas órfãs
- [ ] Seeds funcionando (se existirem)

### Documentação
- [ ] CLAUDE.md atualizado
- [ ] README.md atualizado (se necessário)
- [ ] implementation.md criado para F0002

---

## ⚠️ Riscos e Mitigações

### Risco 1: Código dependente não identificado
**Mitigação**:
- Usar ferramenta de busca global antes de deletar
- Verificar imports com `grep -r "MessagePipeline" apps/ libs/`
- Validar build após cada etapa

### Risco 2: Migrations já aplicadas em produção
**Mitigação**:
- **NÃO rodar rollback** das migrations
- Apenas deletar os arquivos de migration
- Em produção, tabelas órfãs podem ser removidas manualmente depois
- Alternativamente: criar migration de DROP TABLE se necessário

### Risco 3: Frontend com referências órfãs
**Mitigação**:
- Verificar `apps/frontend/src/types/` para DTOs relacionados a mensageria
- Remover types não utilizados
- Validar build do frontend

---

## 📊 Estimativa de Impacto

### Arquivos Deletados: ~70 arquivos
- Database layer: 17 arquivos
- Domain layer: 23 arquivos
- Backend services: 5 arquivos
- Backend app: 25+ arquivos

### Linhas de Código Removidas: ~3.000-4.000 LOC

### Redução de Complexidade:
- ✅ Menos módulos NestJS
- ✅ Menos dependências injetadas
- ✅ Menos workers rodando
- ✅ Menos tabelas no banco
- ✅ Template mais focado e genérico

---

## 🚀 Execução Sugerida

### Abordagem Recomendada: **Incremental com Commits**

```bash
# Commit 1: Database layer
git add libs/app-database/
git commit -m "refactor(F0002): remove messaging database layer"

# Commit 2: Domain layer
git add libs/domain/
git commit -m "refactor(F0002): remove messaging domain entities"

# Commit 3: Backend services layer
git add libs/backend/
git commit -m "refactor(F0002): remove messaging service interfaces"

# Commit 4: Backend app
git add apps/backend/
git commit -m "refactor(F0002): remove messaging modules and workers"

# Commit 5: Documentation
git add docs/ CLAUDE.md
git commit -m "docs(F0002): update documentation after messaging cleanup"

# Build final
npm run build

# Commit 6: Final adjustments (se houver)
git add .
git commit -m "refactor(F0002): final cleanup and build fixes"
```

### Tempo Estimado por Etapa:
- Preparação: 15 min
- Database layer: 20 min
- Domain layer: 20 min
- Backend services: 15 min
- Backend app: 30 min
- Validação e testes: 30 min
- Documentação: 20 min
- **Total: 2h30min**

---

## 📝 Notas Importantes

1. **Não rodar rollback de migrations**: As migrations antigas podem já ter sido aplicadas em ambientes. Apenas deletar os arquivos é seguro.

2. **Manter AuditLog**: O sistema de audit logs NÃO deve ser removido, pois é parte da infraestrutura core do SaaS.

3. **Backup obrigatório**: Sempre criar branch de backup antes de iniciar.

4. **Validação incremental**: Rodar `npm run build` após cada etapa principal.

5. **Pull Request separado**: Criar PR dedicado para F0002, não misturar com F0001.

---

## 📌 Próximos Passos Após F0002

Após completar esta limpeza, o template estará pronto para:

1. **Onboarding de novos projetos**: Alunos FND podem clonar e começar a desenvolver
2. **Features customizadas**: Base limpa para adicionar funcionalidades específicas
3. **Documentação de exemplo**: Criar tutoriais de "como começar um SaaS do zero"
4. **Testes E2E**: Implementar testes para fluxos principais (auth, billing, workspaces)

---

**Autor:** Claude Code
**Data:** 2025-12-02
**Versão:** 1.0
