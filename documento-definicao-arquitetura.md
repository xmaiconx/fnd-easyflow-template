# DOCUMENTO DE DEFINIÇÃO - ARQUITETURA SaaS MULTI-TENANT DE ASSISTENTES IA

## **VISÃO GERAL DO SISTEMA**

Sistema SaaS multi-tenant para criação e gestão de assistentes de IA com integração a múltiplos canais de comunicação (WhatsApp, Instagram, Web Widget).

### **Objetivos Principais**
- Permitir que clientes criem e gerenciem assistentes de IA personalizados
- Integrar assistentes com diferentes canais de comunicação
- Fornecer interface CRM completa para gestão de leads e conversas
- Implementar processamento assíncrono robusto para operações pesadas
- Garantir isolamento completo entre tenants
- Escalar horizontalmente conforme demanda

### **Paradigmas Arquiteturais**
- **Event-Driven Architecture**: Para comunicação entre contextos e notificações
- **Command Pattern**: Para processamento assíncrono de operações pesadas
- **CQRS**: Separação entre comandos (escrita) e consultas (leitura)
- **Microservices**: 4 serviços independentes e especializados
- **Multi-tenant**: Isolamento de dados por tenant com schema compartilhado

---

## **ARQUITETURA DE SERVIÇOS**

### **1. GATEWAY SERVICE**
**Responsabilidades:**
- Receber webhooks de todos os canais externos
- Identificar e validar tenant + workspace + canal
- Implementar rate limiting por tenant
- Persistir eventos recebidos com status tracking
- Emitir eventos para processamento assíncrono
- Servir webhooks de saída para notificações

**Características Técnicas:**
- Framework: NestJS + TypeScript
- Padrão: Event-driven com persistência obrigatória
- Validação: Multi-layer (tenant ativo, canal válido, signature)
- Status Tracking: queued → accepted/rejected
- Rate Limiting: Configurável por tenant e plano

**Entidades Principais:**
- WebhookEvent (auditoria completa de eventos)
- Tenant validation cache
- Rate limiting counters

### **2. MESSAGE PROCESSOR SERVICE**
**Responsabilidades:**
- Processar mensagens recebidas via eventos
- Implementar buffer inteligente de mensagens (timeout configurável)
- Converter payloads externos para protocolo interno padronizado
- Executar comandos assíncronos para processamento pesado
- Integrar com provedores de IA (OpenAI, Anthropic, etc.)
- Gerenciar contexto de conversas e conhecimento

**Características Técnicas:**
- Framework: NestJS + CQRS
- Padrão: Command + Event driven
- Buffer: Timeout configurável por assistente (default 3s)
- IA Integration: Multiple providers com fallback
- Vector Search: Para consulta de base de conhecimento
- WebSocket: Para livechat em tempo real

**Funcionalidades Especiais:**
- Message buffering com timeout inteligente
- Processamento em batch de mensagens coletadas
- Context management para conversas longas
- Knowledge base querying com embeddings

### **3. WEB APP SERVICE**
**Responsabilidades:**
- Interface CRM completa para clientes
- Área administrativa para operações internas
- BFF (Backend for Frontend) para agregação de dados
- Real-time updates via WebSocket
- Gestão de métricas e dashboards
- Configuração de assistentes e campanhas

**Características Técnicas:**
- Backend: NestJS + TypeScript
- Frontend: Next.js integrado (hybrid approach)
- Real-time: WebSocket para atualizações instantâneas
- State Management: React Query + Zustand
- Auth: Multi-layer (JWT + tenant isolation)

**Modules Principais:**
- Tenant Management (criação, configuração)
- Assistant Management (configuração, knowledge base)
- Conversation Management (livechat, histórico)
- Analytics (métricas, relatórios)
- Campaign Management (disparos automatizados)

### **4. PUBLIC API SERVICE**
**Responsabilidades:**
- APIs públicas versionadas para integrações externas
- Webhook outbound (notificação de eventos para clientes)
- Processamento assíncrono via commands
- Rate limiting e autenticação externa (API Keys)
- Documentação OpenAPI automática

**Características Técnicas:**
- Framework: NestJS + OpenAPI
- Versionamento: URI-based (/v1/, /v2/)
- Auth: JWT + API Keys + tenant isolation
- Queue: Background jobs para webhooks e processamento
- Docs: Swagger automático por versão

**APIs Principais:**
- Tenant APIs (gestão de conta)
- Assistant APIs (CRUD + configuração)
- Conversation APIs (envio/recebimento de mensagens)  
- Webhook APIs (subscription management)

---

## **EVENT-DRIVEN vs COMMAND PATTERN**

### **Estratégia de Uso**

**EVENTS (Domain Events):**
- **Propósito**: Comunicação entre bounded contexts e notificações
- **Características**: Imutáveis, múltiplos handlers, eventual consistency
- **Uso**: Tenant criado, assistente configurado, mensagem processada
- **Padrão**: Algo que já aconteceu (passado)

**COMMANDS (Actions):**
- **Propósito**: Processamento assíncrono pesado com retry logic
- **Características**: Imperativos, single handler, retry automático
- **Uso**: Processar mensagem, gerar resposta IA, indexar conhecimento
- **Padrão**: Ação que deve ser executada (imperativo)

**Fluxo Híbrido:**
1. Webhook recebido → EVENT (notificação rápida)
2. Event handler → COMMAND (processamento pesado)
3. Command processado → EVENT (notificação de conclusão)
4. Múltiplos handlers → Diversos COMMANDS (ações paralelas)

---

## **FUNCIONALIDADES CRÍTICAS**

### **1. MESSAGE BUFFERING**
**Objetivo**: Coletar múltiplas mensagens do usuário antes de processar com IA

**Comportamento:**
- Usuário envia mensagem → inicia buffer com timeout
- Novas mensagens → reseta timeout, acumula no buffer
- Timeout expira → flush buffer, processa todas as mensagens juntas
- Timeout configurável por assistente (default 3 segundos)
- Buffer armazenado em Redis com TTL de segurança

**Benefícios:**
- Reduz custos de IA (menos chamadas)
- Melhora contexto (processa conversa completa)
- Evita respostas fragmentadas para múltiplas mensagens rápidas

### **2. API VERSIONING**
**Estratégia**: Versionamento URI obrigatório em todos os endpoints

**Implementação:**
- Padrão: `/v1/`, `/v2/`, etc.
- Controllers separados por versão
- Documentação Swagger independente por versão
- Breaking changes isolados entre versões
- Deprecation policy definida

**Benefícios:**
- Evolução sem quebrar integrações existentes
- Migração gradual de clientes
- Suporte paralelo a múltiplas versões

### **3. GATEWAY EVENT PERSISTENCE**
**Objetivo**: Auditoria completa e rastreamento de todos os webhooks recebidos

**Fluxo:**
1. Webhook recebido → persiste imediatamente (status: queued)
2. Validações aplicadas (tenant, canal, signature, rate limit)
3. Se válido → envia para processamento + atualiza (status: accepted)
4. Se inválido → rejeita + atualiza (status: rejected + reason)
5. Correlation ID para rastreamento end-to-end

**Campos de Auditoria:**
- ID único, tenant_id, workspace_id, channel_id
- Source (whatsapp, instagram, web), payload completo
- Signature recebida, timestamp de recebimento/processamento
- Status tracking, reason para rejeições
- Correlation ID para linking com processamento downstream

### **4. IOC/DEPENDENCY INJECTION**
**Objetivo**: Padronização de DI em todos os serviços

**Estrutura:**
- SharedDIModule global para configurações comuns
- Factory providers para Database, Redis, etc.
- Proper injection em todos os serviços
- Type-safe com TypeScript tokens
- Configuração centralizada de lifetime scopes

---

## **PROTOCOL INTERNO DE MENSAGENS**

### **Estrutura Padronizada**
Todas as mensagens internas seguem protocolo único independente da origem:

**Campos Obrigatórios:**
- ID único, tenant_id, workspace_id, channel_id
- Channel type (whatsapp, instagram, web)
- Conversation ID, from/to identifiers
- Message type, content estruturado, metadata
- Timestamp, context (assistant_id, previous_messages)

**Content por Tipo:**
- **text**: { "text": "mensagem" }
- **audio**: { "url": "", "base64": "", "text": "transcrição" }
- **image**: { "url": "", "caption": "", "text": "interpretação da imagem" }
- **video**: { "url": "", "caption": "", "text": "interpretação do vídeo" }
- **document**: { "url": "", "filename": "", "mimetype": "" }
- **location**: { "latitude": -23.55, "longitude": -46.63, "address": "" }

---

## **INFRAESTRUTURA DE DADOS**

### **PostgreSQL - Schema Multi-Tenant**
**Estratégia**: Schema compartilhado com tenant_id em todas as tabelas

**Stack de Banco de Dados:**
- **PostgreSQL 15+**: Database principal com extensões (uuid-ossp, pgcrypto)
- **Knex.js**: Migrations e seeds de desenvolvimento
- **Kysely**: Query builder type-safe para repositórios
- **Connection Pool**: pg-pool para gerenciamento de conexões

**Tabelas Principais:**
- **tenants**: Gestão de tenants (planos, status, configurações)
- **workspaces**: Múltiplos workspaces por tenant
- **users**: Usuários com roles por tenant
- **assistants**: Configuração de assistentes por workspace
- **channels**: Canais conectados (WhatsApp, Instagram, etc.)
- **conversations**: Conversas com status e metadados
- **messages**: Mensagens com protocolo interno
- **contacts**: Base de contatos por workspace
- **knowledge_bases**: Documentos e embeddings por assistente
- **webhook_events**: Auditoria completa de webhooks

**Gerenciamento de Schema:**
- **Knex Migrations**: Controle de versão do schema com rollback
- **Knex Seeds**: População de dados iniciais e ambiente de desenvolvimento
- **Kysely Repositories**: Camada de acesso com type safety completa
- **Generated Types**: Tipos TypeScript gerados automaticamente do schema

**Isolamento Multi-tenant:**
- RLS (Row Level Security) por tenant_id
- Indexes compostos (tenant_id + campos específicos)
- Queries sempre filtradas por tenant via Kysely
- Transaction isolation por tenant context

**Estrutura de Repositórios:**
- Interface repository pattern com Kysely
- Type-safe queries com autocompletion
- Tenant context automático em todas as queries
- Connection pooling otimizado por workload

### **Redis - Estratégia de Cache**
**Uso Principal:**
- Cache de configurações de tenant/assistente
- Buffer de mensagens com timeout
- Filas para commands assíncronos
- Rate limiting counters
- Session management

**Padrões de Keys:**
- tenant:{id}:config (TTL: 1h)
- assistant:{id}:knowledge (TTL: 24h)
- buffer:{conversation_id} (TTL: 5min)
- rate_limit:{tenant_id} (TTL: configurable)

**Invalidação:**
- Cache invalidation automática em updates
- Pattern-based invalidation para relacionamentos
- Background cleanup jobs

### **Vector Database**
**Propósito**: Armazenamento de embeddings para knowledge base

**Opções:**
- Pinecone (cloud-native, escalável)
- pgvector (integrado ao PostgreSQL)
- Weaviate (self-hosted, features avançadas)

**Estrutura:**
- Embeddings por assistant + documento
- Metadata filtering por tenant
- Similarity search com threshold configurável

---

## **ESTRUTURA DE DIRETÓRIOS - NESTJS + CQRS + VERSIONAMENTO**

### **Visão Geral do Monorepo**
```
root/
├── apps/                    # Aplicações independentes
│   ├── gateway/            # Webhook receiver service
│   ├── message-processor/  # Worker para processamento
│   ├── web-app/           # CRM + BFF aplicação
│   └── public-api/        # APIs públicas versionadas
├── libs/                   # Bibliotecas compartilhadas
│   ├── shared/            # DTOs, types, interfaces
│   ├── database/          # Migrations, seeds, repositories
│   ├── events/            # Event definitions
│   └── common/            # Guards, interceptors
├── package.json           # Workspace root
└── nx.json               # Nx configuration
```

### **1. GATEWAY SERVICE - Estrutura**
```
apps/gateway/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── webhook/
│   │   ├── webhook.module.ts
│   │   ├── v1/                    # API V1
│   │   │   ├── webhook-v1.controller.ts
│   │   │   └── dto/
│   │   │       ├── whatsapp-webhook-v1.dto.ts
│   │   │       ├── instagram-webhook-v1.dto.ts
│   │   │       └── web-webhook-v1.dto.ts
│   │   ├── v2/                    # API V2 (futura)
│   │   │   └── webhook-v2.controller.ts
│   │   ├── commands/              # CQRS Commands
│   │   │   ├── persist-webhook-event.command.ts
│   │   │   ├── validate-webhook.command.ts
│   │   │   └── handlers/
│   │   │       ├── persist-webhook-event.handler.ts
│   │   │       └── validate-webhook.handler.ts
│   │   ├── events/                # Domain Events
│   │   │   ├── webhook-received.event.ts
│   │   │   ├── webhook-validated.event.ts
│   │   │   └── handlers/
│   │   │       ├── webhook-received.handler.ts
│   │   │       └── webhook-validated.handler.ts
│   │   └── services/
│   │       ├── webhook-persistence.service.ts
│   │       ├── webhook-validation.service.ts
│   │       └── rate-limiting.service.ts
│   ├── common/
│   │   ├── guards/
│   │   │   ├── tenant-validation.guard.ts
│   │   │   └── rate-limit.guard.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   └── tenant-context.interceptor.ts
│   │   └── decorators/
│   │       └── tenant-context.decorator.ts
│   └── health/
│       └── health.controller.ts
├── package.json
└── nest-cli.json
```

### **2. MESSAGE PROCESSOR - Estrutura Worker**
```
apps/message-processor/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── message/                   # Context: Message Processing
│   │   ├── message.module.ts
│   │   ├── commands/              # Heavy processing commands
│   │   │   ├── process-message.command.ts
│   │   │   ├── generate-ai-response.command.ts
│   │   │   ├── buffer-message.command.ts
│   │   │   ├── process-buffered-messages.command.ts
│   │   │   └── handlers/
│   │   │       ├── process-message.handler.ts
│   │   │       ├── generate-ai-response.handler.ts
│   │   │       ├── buffer-message.handler.ts
│   │   │       └── process-buffered-messages.handler.ts
│   │   ├── queries/               # Read operations
│   │   │   ├── get-conversation-context.query.ts
│   │   │   ├── get-assistant-config.query.ts
│   │   │   └── handlers/
│   │   │       ├── get-conversation-context.handler.ts
│   │   │       └── get-assistant-config.handler.ts
│   │   ├── events/                # Domain events
│   │   │   ├── message-buffered.event.ts
│   │   │   ├── message-processed.event.ts
│   │   │   ├── ai-response-generated.event.ts
│   │   │   └── handlers/
│   │   │       ├── message-buffered.handler.ts
│   │   │       ├── message-processed.handler.ts
│   │   │       └── ai-response-generated.handler.ts
│   │   ├── consumers/             # Queue consumers
│   │   │   ├── message-processing.consumer.ts
│   │   │   ├── ai-generation.consumer.ts
│   │   │   └── message-buffer.consumer.ts
│   │   └── services/
│   │       ├── message-buffer.service.ts
│   │       ├── protocol-converter.service.ts
│   │       └── conversation-context.service.ts
│   ├── assistant/                 # Context: Assistant Management
│   │   ├── assistant.module.ts
│   │   ├── commands/
│   │   │   ├── configure-assistant.command.ts
│   │   │   ├── index-knowledge.command.ts
│   │   │   ├── update-knowledge.command.ts
│   │   │   └── handlers/
│   │   │       ├── configure-assistant.handler.ts
│   │   │       ├── index-knowledge.handler.ts
│   │   │       └── update-knowledge.handler.ts
│   │   ├── queries/
│   │   │   ├── get-knowledge-base.query.ts
│   │   │   └── handlers/
│   │   │       └── get-knowledge-base.handler.ts
│   │   ├── events/
│   │   │   ├── assistant-configured.event.ts
│   │   │   ├── knowledge-indexed.event.ts
│   │   │   └── handlers/
│   │   │       ├── assistant-configured.handler.ts
│   │   │       └── knowledge-indexed.handler.ts
│   │   ├── consumers/
│   │   │   ├── knowledge-processing.consumer.ts
│   │   │   └── assistant-config.consumer.ts
│   │   └── services/
│   │       ├── knowledge-base.service.ts
│   │       ├── vector-search.service.ts
│   │       └── embedding.service.ts
│   ├── webhook/                   # Context: Webhook Outbound
│   │   ├── webhook.module.ts
│   │   ├── commands/
│   │   │   ├── send-webhook.command.ts
│   │   │   ├── retry-webhook.command.ts
│   │   │   └── handlers/
│   │   │       ├── send-webhook.handler.ts
│   │   │       └── retry-webhook.handler.ts
│   │   ├── events/
│   │   │   ├── webhook-sent.event.ts
│   │   │   ├── webhook-failed.event.ts
│   │   │   └── handlers/
│   │   │       ├── webhook-sent.handler.ts
│   │   │       └── webhook-failed.handler.ts
│   │   ├── consumers/
│   │   │   ├── webhook-delivery.consumer.ts
│   │   │   └── webhook-retry.consumer.ts
│   │   └── services/
│   │       ├── webhook-delivery.service.ts
│   │       └── webhook-signature.service.ts
│   ├── shared/
│   │   ├── ai-providers/
│   │   │   ├── ai-provider.interface.ts
│   │   │   ├── openai.service.ts
│   │   │   ├── anthropic.service.ts
│   │   │   └── ai-factory.service.ts
│   │   ├── channels/
│   │   │   ├── channel.interface.ts
│   │   │   ├── whatsapp.service.ts
│   │   │   ├── instagram.service.ts
│   │   │   └── web.service.ts
│   │   └── protocol/
│   │       └── internal-message.service.ts
│   └── controllers/               # Microservice entry points
│       ├── message.controller.ts  # Recebe do Gateway
│       ├── assistant.controller.ts # Recebe do Web App
│       └── health.controller.ts
├── package.json
└── nest-cli.json
```

### **3. PUBLIC API - Estrutura Versionada**
```
apps/public-api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── v1/                        # Versão 1 da API
│   │   ├── v1.module.ts
│   │   ├── assistants/
│   │   │   ├── assistants-v1.controller.ts
│   │   │   ├── assistants-v1.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-assistant-v1.dto.ts
│   │   │   │   ├── update-assistant-v1.dto.ts
│   │   │   │   └── assistant-response-v1.dto.ts
│   │   │   └── assistants-v1.module.ts
│   │   ├── conversations/
│   │   │   ├── conversations-v1.controller.ts
│   │   │   ├── dto/
│   │   │   │   ├── send-message-v1.dto.ts
│   │   │   │   └── conversation-response-v1.dto.ts
│   │   │   └── conversations-v1.module.ts
│   │   ├── tenants/
│   │   │   ├── tenants-v1.controller.ts
│   │   │   ├── dto/
│   │   │   │   └── tenant-response-v1.dto.ts
│   │   │   └── tenants-v1.module.ts
│   │   └── webhooks/
│   │       ├── webhooks-v1.controller.ts
│   │       ├── dto/
│   │       │   └── webhook-subscription-v1.dto.ts
│   │       └── webhooks-v1.module.ts
│   ├── v2/                        # Versão 2 da API (breaking changes)
│   │   ├── v2.module.ts
│   │   ├── assistants/
│   │   │   ├── assistants-v2.controller.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-assistant-v2.dto.ts  # Campos diferentes
│   │   │   │   └── assistant-response-v2.dto.ts # Estrutura expandida
│   │   │   └── assistants-v2.module.ts
│   │   └── conversations/
│   │       ├── conversations-v2.controller.ts
│   │       ├── dto/
│   │       │   └── conversation-response-v2.dto.ts # Nova estrutura
│   │       └── conversations-v2.module.ts
│   ├── shared/                    # Compartilhado entre versões
│   │   ├── commands/              # CQRS Commands
│   │   │   ├── assistant/
│   │   │   │   ├── create-assistant.command.ts
│   │   │   │   ├── update-assistant.command.ts
│   │   │   │   └── delete-assistant.command.ts
│   │   │   ├── conversation/
│   │   │   │   ├── send-message.command.ts
│   │   │   │   └── create-conversation.command.ts
│   │   │   ├── webhook/
│   │   │   │   ├── subscribe-webhook.command.ts
│   │   │   │   └── unsubscribe-webhook.command.ts
│   │   │   └── handlers/
│   │   │       ├── assistant/
│   │   │       │   ├── create-assistant.handler.ts
│   │   │       │   ├── update-assistant.handler.ts
│   │   │       │   └── delete-assistant.handler.ts
│   │   │       ├── conversation/
│   │   │       │   ├── send-message.handler.ts
│   │   │       │   └── create-conversation.handler.ts
│   │   │       └── webhook/
│   │   │           ├── subscribe-webhook.handler.ts
│   │   │           └── unsubscribe-webhook.handler.ts
│   │   ├── queries/               # CQRS Queries
│   │   │   ├── assistant/
│   │   │   │   ├── get-assistants.query.ts
│   │   │   │   ├── get-assistant-by-id.query.ts
│   │   │   │   └── get-assistant-knowledge.query.ts
│   │   │   ├── conversation/
│   │   │   │   ├── get-conversations.query.ts
│   │   │   │   ├── get-conversation-messages.query.ts
│   │   │   │   └── get-conversation-analytics.query.ts
│   │   │   ├── tenant/
│   │   │   │   ├── get-tenant-info.query.ts
│   │   │   │   └── get-tenant-usage.query.ts
│   │   │   └── handlers/
│   │   │       ├── assistant/
│   │   │       │   ├── get-assistants.handler.ts
│   │   │       │   ├── get-assistant-by-id.handler.ts
│   │   │       │   └── get-assistant-knowledge.handler.ts
│   │   │       ├── conversation/
│   │   │       │   ├── get-conversations.handler.ts
│   │   │       │   ├── get-conversation-messages.handler.ts
│   │   │       │   └── get-conversation-analytics.handler.ts
│   │   │       └── tenant/
│   │   │           ├── get-tenant-info.handler.ts
│   │   │           └── get-tenant-usage.handler.ts
│   │   ├── events/                # Domain Events
│   │   │   ├── assistant-created.event.ts
│   │   │   ├── message-sent.event.ts
│   │   │   ├── webhook-subscribed.event.ts
│   │   │   └── handlers/
│   │   │       ├── assistant-created.handler.ts
│   │   │       ├── message-sent.handler.ts
│   │   │       └── webhook-subscribed.handler.ts
│   │   ├── services/              # Business logic
│   │   │   ├── assistant.service.ts
│   │   │   ├── conversation.service.ts
│   │   │   ├── tenant.service.ts
│   │   │   └── webhook.service.ts
│   │   └── consumers/             # Queue consumers
│   │       ├── webhook-delivery.consumer.ts
│   │       └── background-tasks.consumer.ts
│   ├── common/
│   │   ├── guards/
│   │   │   ├── api-key.guard.ts
│   │   │   ├── jwt.guard.ts
│   │   │   └── tenant-isolation.guard.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   ├── rate-limit.interceptor.ts
│   │   │   └── response-transform.interceptor.ts
│   │   ├── decorators/
│   │   │   ├── api-version.decorator.ts
│   │   │   └── tenant-context.decorator.ts
│   │   └── filters/
│   │       └── http-exception.filter.ts
│   └── config/
│       ├── swagger-v1.config.ts
│       ├── swagger-v2.config.ts
│       └── versioning.config.ts
├── package.json
└── nest-cli.json
```

### **4. WEB APP - Estrutura Híbrida**
```
apps/web-app/
├── src/                           # NestJS Backend
│   ├── main.ts
│   ├── app.module.ts
│   ├── tenant/                    # Context: Tenant Management
│   │   ├── tenant.module.ts
│   │   ├── commands/
│   │   │   ├── create-tenant.command.ts
│   │   │   └── handlers/
│   │   │       └── create-tenant.handler.ts
│   │   ├── queries/
│   │   │   ├── get-tenant-dashboard.query.ts
│   │   │   └── handlers/
│   │   │       └── get-tenant-dashboard.handler.ts
│   │   ├── events/
│   │   │   ├── tenant-created.event.ts
│   │   │   └── handlers/
│   │   │       └── tenant-created.handler.ts
│   │   └── controllers/
│   │       └── tenant.controller.ts
│   ├── assistant/                 # Context: Assistant Configuration
│   │   ├── assistant.module.ts
│   │   ├── commands/
│   │   │   ├── configure-assistant.command.ts
│   │   │   ├── upload-knowledge.command.ts
│   │   │   └── handlers/
│   │   ├── queries/
│   │   │   ├── get-assistant-config.query.ts
│   │   │   └── handlers/
│   │   ├── events/
│   │   │   └── handlers/
│   │   └── controllers/
│   │       └── assistant.controller.ts
│   ├── conversation/              # Context: Conversation Management
│   │   ├── conversation.module.ts
│   │   ├── queries/
│   │   │   ├── get-conversations.query.ts
│   │   │   ├── get-conversation-history.query.ts
│   │   │   └── handlers/
│   │   ├── gateways/              # WebSocket
│   │   │   └── conversation.gateway.ts
│   │   └── controllers/
│   │       └── conversation.controller.ts
│   ├── analytics/                 # Context: Analytics & Reporting
│   │   ├── analytics.module.ts
│   │   ├── queries/
│   │   │   ├── get-tenant-metrics.query.ts
│   │   │   ├── get-conversation-analytics.query.ts
│   │   │   └── handlers/
│   │   ├── commands/
│   │   │   ├── generate-report.command.ts
│   │   │   └── handlers/
│   │   └── controllers/
│   │       └── analytics.controller.ts
│   └── auth/                      # Context: Authentication
│       ├── auth.module.ts
│       ├── guards/
│       │   ├── jwt.guard.ts
│       │   └── tenant-access.guard.ts
│       ├── strategies/
│       │   └── jwt.strategy.ts
│       └── controllers/
│           └── auth.controller.ts
├── client/                        # Next.js Frontend
│   ├── app/
│   │   ├── (dashboard)/          # Dashboard routes
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   ├── contacts/
│   │   │   │   └── page.tsx
│   │   │   ├── conversations/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── assistants/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── (admin)/              # Admin routes
│   │   │   ├── tenants/
│   │   │   │   └── page.tsx
│   │   │   ├── workspaces/
│   │   │   │   └── page.tsx
│   │   │   └── system/
│   │   │       └── page.tsx
│   │   ├── auth/
│   │   │   ├── signin/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                   # Shadcn components
│   │   ├── dashboard/            # Dashboard específicos
│   │   ├── admin/                # Admin específicos
│   │   └── shared/               # Compartilhados
│   ├── lib/
│   │   ├── api.ts               # API client
│   │   ├── auth.ts              # NextAuth config
│   │   ├── socket.ts            # Socket.io client
│   │   └── utils.ts
│   └── hooks/
│       ├── use-conversations.ts
│       ├── use-assistants.ts
│       └── use-analytics.ts
├── package.json
└── nest-cli.json
```

### **Padrões de Organização CQRS**

**Por Contexto de Negócio:**
- Cada contexto (tenant, assistant, message, etc.) tem sua pasta
- Dentro de cada contexto: commands/, queries/, events/, handlers/
- Services para lógica de negócio complexa
- Controllers como entry points

**Separação de Responsabilidades:**
- **Commands**: Alterações de estado (create, update, delete)
- **Queries**: Leituras otimizadas (get, list, search)
- **Events**: Notificações de mudanças (created, updated, processed)
- **Handlers**: Implementação específica de cada operação

**Versionamento de API:**
- Controllers separados por versão (v1/, v2/)
- DTOs específicos por versão
- Commands/Queries/Events compartilhados entre versões
- Swagger documentation independente

**Comunicação entre Serviços:**
- Events para notificações cross-service
- Microservice patterns para chamadas diretas
- Queue consumers para processamento assíncrono
- WebSocket gateways para real-time updates

---

## **PACKAGES COMPARTILHADOS (Monorepo)**

### **Estrutura de Libs**

#### **@saas-assistants/database**
**Responsabilidade**: Gerenciamento completo de banco de dados
- **Migrations (Knex.js)**: Controle de versão do schema
- **Seeds (Knex.js)**: População inicial de dados
- **Repositories (Kysely)**: Camada de acesso type-safe
- **Generated Types**: Tipos gerados automaticamente
- **Connection Management**: Pool de conexões otimizado

**Estrutura Interna:**
```
libs/database/
├── migrations/           # Knex migrations
│   ├── 001_create_tenants.ts
│   ├── 002_create_workspaces.ts
│   ├── 003_create_assistants.ts
│   └── 004_create_conversations.ts
├── seeds/               # Knex seeds
│   ├── 001_default_tenants.ts
│   └── 002_sample_data.ts
├── repositories/        # Kysely repositories
│   ├── tenant.repository.ts
│   ├── assistant.repository.ts
│   ├── conversation.repository.ts
│   └── base.repository.ts
├── types/              # Generated database types
│   └── database.types.ts
└── connection/         # Database connection
    ├── knex.config.ts
    ├── kysely.config.ts
    └── pool.config.ts
```

#### **@saas-assistants/shared-types**
**Responsabilidade**: DTOs, interfaces e types compartilhados
- Protocol interno de mensagens
- Event payloads e command DTOs
- API response/request types
- Domain entities interfaces

#### **@saas-assistants/events**
**Responsabilidade**: Definições de eventos e payloads
- Event types padronizados
- Event payload schemas
- Event emitter configurations
- Cross-service event contracts

#### **@saas-assistants/cache-service**
**Responsabilidade**: Abstração Redis com patterns
- Tenant-specific caching
- Cache invalidation strategies
- Message buffering utilities
- Rate limiting implementations

#### **@saas-assistants/logger**
**Responsabilidade**: Logging estruturado
- Tenant context logging
- Correlation ID tracking
- Structured JSON formatting
- Multiple transport support

#### **@saas-assistants/scheduler**
**Responsabilidade**: Agendamentos e follow-ups
- Follow-up scheduling
- Recurring task management
- Cron job abstractions
- Task queue integration

#### **@saas-assistants/api-middlewares**
**Responsabilidade**: Middlewares compartilhados
- Authentication guards
- Tenant isolation middleware
- Rate limiting interceptors
- Validation pipes

#### **@saas-assistants/validators**
**Responsabilidade**: Schemas de validação
- Message content validation
- API request validation
- Webhook payload validation
- Multi-version schema support

### **Benefícios do Monorepo**
- Zero duplicação de código entre serviços
- Tipagem consistente com TypeScript
- Padrões unificados de logging, cache e validação
- Manutenção centralizada de funcionalidades comuns
- Versionamento independente de packages

---

## **DEPLOYMENT & OBSERVABILIDADE**

### **Estratégia de Deploy**
**Development:**
- Docker Compose com todos os serviços
- Hot reload para desenvolvimento rápido
- Databases locais (PostgreSQL + Redis)

**Production:**
- Kubernetes com deployments independentes
- HPA (Horizontal Pod Autoscaling) por serviço
- Load balancers com SSL termination
- Shared databases com connection pooling

### **Monitoramento**
**Metrics (Prometheus):**
- Request rate e latência por serviço
- Message processing time e queue size
- Database connection pool usage
- Cache hit/miss ratio
- Business metrics (mensagens processadas, assistentes ativos)

**Logs (Structured JSON):**
- Tenant context em todos os logs
- Correlation IDs para tracing cross-services
- Error tracking com stack traces
- Audit logs para compliance

**Health Checks:**
- Liveness e readiness probes
- Database connectivity
- Redis connectivity
- External API availability

---

## **CONSIDERAÇÕES DE SEGURANÇA**

### **Multi-tenant Isolation**
- Row Level Security (RLS) no PostgreSQL
- API isolation via middleware tenant validation
- Cache segregation por tenant
- Rate limiting individual por tenant

### **Authentication & Authorization**
- JWT tokens com tenant context
- API Keys para integração externa
- Role-based access control (RBAC)
- Session management seguro

### **Data Protection**
- Encryção em repouso (database)
- Encryção em trânsito (HTTPS/TLS)
- Webhook signature validation
- PII sanitization nos logs

### **Compliance**
- LGPD compliance para dados brasileiros
- Audit trail completo
- Data retention policies
- Right to deletion implementation

---

## **ROADMAP DE IMPLEMENTAÇÃO**

### **Fase 1: Core Infrastructure (4 semanas)**
- Setup do monorepo com packages compartilhados
- Configuração de databases (PostgreSQL + Redis)
- Implementação do Gateway Service básico
- Message Processor com protocol interno

### **Fase 2: Processing & AI (6 semanas)**
- Message buffering com timeout
- Integração com provedores de IA
- Knowledge base com vector search
- Command/Event pattern completo

### **Fase 3: Web Application (8 semanas)**
- Interface CRM completa
- Real-time updates via WebSocket
- Analytics e dashboards
- Admin panel para operações

### **Fase 4: Public APIs & Integration (4 semanas)**
- APIs públicas versionadas
- Webhook outbound system
- Documentação OpenAPI
- SDKs para integrações

### **Fase 5: Production Ready (6 semanas)**
- Kubernetes deployment
- Monitoring e observabilidade
- Performance optimization
- Security hardening

**Total Estimado**: 28 semanas (~7 meses)

Esta arquitetura fornece base sólida para um SaaS multi-tenant escalável, mantendo simplicidade operacional enquanto atende todos os requisitos funcionais e não-funcionais do sistema.