# Arquitetura do Sistema - SaaS Multi-Tenant de Assistentes IA

## **Visão Geral da Arquitetura**

Sistema SaaS multi-tenant para criação e gestão de assistentes de IA com integração a múltiplos canais de comunicação (WhatsApp, Instagram, Web Widget).

### **Componentes Principais**
- 4 serviços backend independentes
- Base de dados PostgreSQL única
- Cache Redis com invalidação inteligente
- Frontend moderno com Next.js

---

## **1. GATEWAY SERVICE (NestJS Microservice)**

### **Responsabilidades**
- Receber webhooks de canais externos
- Identificar tenant + workspace + canal
- Validação e rate limiting
- Emitir eventos para processamento
- Logs de auditoria
- Servir webhooks de saída

### **Stack Tecnológica**
- **Framework:** NestJS + TypeScript
- **Transport:** Redis Microservice + HTTP
- **Validação:** Class-validator + DTOs
- **Rate Limiting:** @nestjs/throttler
- **Events:** @nestjs/event-emitter
- **Monitoramento:** @nestjs/prometheus

### **Estrutura NestJS**
```
apps/gateway/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── webhook/
│   │   ├── webhook.module.ts
│   │   ├── webhook.controller.ts
│   │   ├── webhook.service.ts
│   │   └── dto/
│   │       ├── whatsapp-webhook.dto.ts
│   │       ├── instagram-webhook.dto.ts
│   │       └── web-webhook.dto.ts
│   ├── common/
│   │   ├── guards/
│   │   │   ├── tenant.guard.ts
│   │   │   └── rate-limit.guard.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   └── tenant-context.interceptor.ts
│   │   └── decorators/
│   │       └── tenant.decorator.ts
│   ├── events/
│   │   ├── webhook-received.event.ts
│   │   └── message-routing.event.ts
│   └── health/
│       └── health.controller.ts
├── package.json
├── nest-cli.json
└── Dockerfile
```

### **Event-Driven Implementation**
```typescript
// webhook.controller.ts
@Controller('webhook')
@UseGuards(TenantGuard)
@UseInterceptors(TenantContextInterceptor)
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post('whatsapp/:tenantId/:workspaceId/:channelId')
  @UseGuards(ThrottlerGuard)
  async handleWhatsApp(
    @Param() params: WebhookParamsDto,
    @Body() payload: WhatsAppWebhookDto,
    @TenantContext() tenant: TenantInfo,
  ) {
    // Emit event instead of direct processing
    await this.eventEmitter.emitAsync('webhook.received', {
      source: 'whatsapp',
      tenant,
      payload,
      timestamp: new Date(),
    });

    return { status: 'received' };
  }
}

// webhook.service.ts
@Injectable()
export class WebhookService {
  @OnEvent('webhook.received')
  async handleWebhookReceived(event: WebhookReceivedEvent) {
    // Route to message processor via microservice
    await this.messageClient.emit('message.process', {
      ...event,
      id: uuidv4(),
    });
  }
}
```

---

## **2. MESSAGE PROCESSOR SERVICE (NestJS Microservice)**

### **Responsabilidades**
- Processar mensagens via eventos
- Converter para protocolo interno
- Executar commands assíncronos
- Integração com assistente IA
- Gerar respostas contextuais
- Emitir eventos de processamento

### **Stack Tecnológica**
- **Framework:** NestJS + TypeScript
- **CQRS:** @nestjs/cqrs (Events + Commands)
- **Queue:** @nestjs/bull (Redis-based)
- **IA Integration:** OpenAI SDK, Anthropic SDK
- **Vector Search:** @pinecone-database/pinecone
- **WebSockets:** @nestjs/websockets

### **Estrutura NestJS (Event-Driven + CQRS)**
```
apps/message-processor/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── message/
│   │   ├── message.module.ts
│   │   ├── commands/
│   │   │   ├── process-message.command.ts
│   │   │   ├── generate-ai-response.command.ts
│   │   │   ├── send-to-channel.command.ts
│   │   │   └── handlers/
│   │   │       ├── process-message.handler.ts
│   │   │       ├── generate-ai-response.handler.ts
│   │   │       └── send-to-channel.handler.ts
│   │   ├── events/
│   │   │   ├── message-processed.event.ts
│   │   │   ├── ai-response-generated.event.ts
│   │   │   └── handlers/
│   │   │       ├── message-processed.handler.ts
│   │   │       └── ai-response-generated.handler.ts
│   │   ├── queries/
│   │   │   ├── get-conversation-context.query.ts
│   │   │   └── handlers/
│   │   │       └── get-conversation-context.handler.ts
│   │   └── message.controller.ts
│   ├── ai/
│   │   ├── ai.module.ts
│   │   ├── ai.service.ts
│   │   ├── providers/
│   │   │   ├── openai.provider.ts
│   │   │   └── anthropic.provider.ts
│   │   └── knowledge/
│   │       ├── knowledge.service.ts
│   │       └── vector-search.service.ts
│   ├── channels/
│   │   ├── channels.module.ts
│   │   ├── providers/
│   │   │   ├── whatsapp.provider.ts
│   │   │   ├── instagram.provider.ts
│   │   │   └── web.provider.ts
│   │   └── channel.service.ts
│   ├── conversation/
│   │   ├── conversation.module.ts
│   │   ├── conversation.service.ts
│   │   └── entities/
│   │       ├── conversation.entity.ts
│   │       └── message.entity.ts
│   └── livechat/
│       ├── livechat.module.ts
│       ├── livechat.gateway.ts
│       └── livechat.service.ts
├── package.json
└── nest-cli.json
```

### **Event-Driven + Command Implementation**
```typescript
// Message Controller (Event Listener)
@Controller()
export class MessageController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern('message.process')
  async processMessage(@Payload() data: MessageReceivedEvent) {
    // Convert event to command for async processing
    await this.commandBus.execute(
      new ProcessMessageCommand(
        data.tenant,
        data.payload,
        data.source,
      ),
    );
  }
}

// Commands (Async Processing)
export class ProcessMessageCommand {
  constructor(
    public readonly tenant: TenantInfo,
    public readonly payload: any,
    public readonly source: string,
  ) {}
}

@CommandHandler(ProcessMessageCommand)
export class ProcessMessageHandler implements ICommandHandler<ProcessMessageCommand> {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ProcessMessageCommand): Promise<void> {
    // 1. Convert to internal protocol
    const internalMessage = await this.conversationService
      .convertToInternalMessage(command.payload, command.source);
    
    // 2. Save conversation
    const conversation = await this.conversationService
      .saveMessage(internalMessage, command.tenant.id);
    
    // 3. Emit event for AI processing (Event-Driven)
    await this.eventBus.publish(
      new MessageProcessedEvent(
        command.tenant.id,
        internalMessage,
        conversation.id,
      ),
    );
  }
}

// Events (Domain Events)
export class MessageProcessedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly message: InternalMessage,
    public readonly conversationId: string,
  ) {}
}

@EventsHandler(MessageProcessedEvent)
export class MessageProcessedHandler implements IEventHandler<MessageProcessedEvent> {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: MessageProcessedEvent) {
    // Trigger AI response command (Async Processing)
    await this.commandBus.execute(
      new GenerateAIResponseCommand(
        event.tenantId,
        event.conversationId,
        event.message,
      ),
    );
  }
}

// AI Response Command (Heavy Processing)
@CommandHandler(GenerateAIResponseCommand)
export class GenerateAIResponseHandler implements ICommandHandler<GenerateAIResponseCommand> {
  constructor(
    private readonly aiService: AIService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: GenerateAIResponseCommand): Promise<void> {
    // 1. Get conversation context
    const context = await this.conversationService
      .getContext(command.conversationId);
    
    // 2. Generate AI response (heavy operation)
    const aiResponse = await this.aiService.generateResponse(
      command.message,
      context,
      command.tenantId,
    );
    
    // 3. Emit event for sending response
    await this.eventBus.publish(
      new AIResponseGeneratedEvent(
        command.tenantId,
        command.conversationId,
        aiResponse,
      ),
    );
  }
}
```

### **Queue Integration for Commands**
```typescript
// Queue-based commands for heavy processing
@Processor('ai-processing')
export class AIProcessingConsumer {
  constructor(private readonly commandBus: CommandBus) {}

  @Process('generate-response')
  async processAIResponse(job: Job<AIResponseJobData>) {
    await this.commandBus.execute(
      new GenerateAIResponseCommand(
        job.data.tenantId,
        job.data.conversationId,
        job.data.message,
      ),
    );
  }

  @Process('knowledge-indexing')
  async processKnowledgeIndexing(job: Job<KnowledgeIndexingData>) {
    await this.commandBus.execute(
      new IndexKnowledgeCommand(
        job.data.tenantId,
        job.data.assistantId,
        job.data.documents,
      ),
    );
  }
}
```

### **Protocol Interno de Mensagens**
```javascript
{
  "id": "uuid",
  "tenant_id": "string",
  "workspace_id": "string", 
  "channel_id": "string",
  "channel_type": "whatsapp|instagram|web",
  "conversation_id": "string",
  "from": "string",
  "to": "string",
  "message_type": "text|audio|image|video|document|location",
  "content": {
    // Para message_type: "text"
    "text": "texto da mensagem"
    
    // Para message_type: "audio"
    "url": "https://...",
    "base64": "data:audio/mp3;base64,...",
    
    // Para message_type: "image"
    "url": "https://...",
    "base64": "data:image/jpeg;base64,...",
    "caption": "legenda da imagem",
    "text": "interpretação da imagem"
    
    // Para message_type: "video" 
    "url": "https://...",
    "base64": "data:video/mp4;base64,...",
    "caption": "legenda do vídeo",
    "text": "interpretação do video"
    
    // Para message_type: "document"
    "url": "https://...",
    "base64": "data:application/pdf;base64,...",
    "filename": "documento.pdf",
    "mimetype": "application/pdf"
    
    // Para message_type: "location"
    "latitude": -23.5505,
    "longitude": -46.6333,
    "address": "São Paulo, SP, Brasil",
    "name": "Local específico"
  },
  "metadata": {},
  "timestamp": "ISO8601",
  "context": {
    "assistant_id": "string",
    "previous_messages": []
  }
}
```

---

## **3. WEB APP SERVICE (NestJS + Next.js Hybrid)**

### **Responsabilidades**
- Interface CRM para clientes
- Área administrativa (SSR)
- BFF APIs para agregação de dados
- Real-time updates via WebSocket
- Gestão de métricas e dashboards
- Configuração de assistentes

### **Stack Tecnológica**
- **Backend:** NestJS + TypeScript
- **Frontend:** Next.js 14+ (App Router) integrado
- **UI Library:** Tailwind CSS + Shadcn/ui
- **State Management:** React Query + Zustand
- **Real-time:** @nestjs/websockets
- **Auth:** @nestjs/passport + NextAuth.js

### **Estrutura NestJS Hybrid**
```
apps/web-app/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── tenant/
│   │   ├── tenant.module.ts
│   │   ├── tenant.controller.ts
│   │   ├── tenant.service.ts
│   │   ├── commands/
│   │   │   ├── create-tenant.command.ts
│   │   │   └── handlers/
│   │   │       └── create-tenant.handler.ts
│   │   └── events/
│   │       ├── tenant-created.event.ts
│   │       └── handlers/
│   │           └── tenant-created.handler.ts
│   ├── assistant/
│   │   ├── assistant.module.ts
│   │   ├── assistant.controller.ts
│   │   ├── assistant.service.ts
│   │   ├── commands/
│   │   │   ├── configure-assistant.command.ts
│   │   │   ├── upload-knowledge.command.ts
│   │   │   └── handlers/
│   │   └── events/
│   ├── analytics/
│   │   ├── analytics.module.ts
│   │   ├── analytics.controller.ts
│   │   ├── analytics.service.ts
│   │   └── queries/
│   │       ├── get-tenant-metrics.query.ts
│   │       └── handlers/
│   ├── conversation/
│   │   ├── conversation.module.ts
│   │   ├── conversation.controller.ts
│   │   ├── conversation.gateway.ts  # WebSocket
│   │   └── conversation.service.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── guards/
│   │   │   ├── jwt.guard.ts
│   │   │   └── tenant-access.guard.ts
│   │   └── strategies/
│   │       └── jwt.strategy.ts
│   └── common/
│       ├── guards/
│       ├── interceptors/
│       ├── decorators/
│       └── dto/
├── client/                    # Next.js Frontend
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── analytics/
│   │   │   ├── contacts/
│   │   │   ├── conversations/
│   │   │   ├── assistants/
│   │   │   └── settings/
│   │   ├── (admin)/
│   │   │   ├── tenants/
│   │   │   ├── workspaces/
│   │   │   └── system/
│   │   ├── auth/
│   │   └── layout.tsx
│   ├── components/
│   ├── lib/
│   └── hooks/
├── package.json
└── nest-cli.json
```

### **Event-Driven + Command Pattern**
```typescript
// Assistant Configuration (Command)
@CommandHandler(ConfigureAssistantCommand)
export class ConfigureAssistantHandler implements ICommandHandler<ConfigureAssistantCommand> {
  constructor(
    private readonly assistantService: AssistantService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ConfigureAssistantCommand): Promise<void> {
    // 1. Update assistant configuration
    const assistant = await this.assistantService.configure(
      command.tenantId,
      command.assistantId,
      command.config,
    );

    // 2. Emit event for other services
    await this.eventBus.publish(
      new AssistantConfiguredEvent(
        command.tenantId,
        assistant.id,
        assistant.config,
      ),
    );

    // 3. Queue knowledge base reindexing if needed
    if (command.config.knowledgeBase) {
      await this.queueService.add('reindex-knowledge', {
        tenantId: command.tenantId,
        assistantId: assistant.id,
        documents: command.config.knowledgeBase.documents,
      });
    }
  }
}

// Real-time Updates (WebSocket)
@WebSocketGateway({ cors: true, namespace: 'tenant' })
export class ConversationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @UseGuards(WsJwtGuard, WsTenantGuard)
  handleConnection(client: Socket) {
    const tenantId = client.handshake.auth.tenantId;
    client.join(`tenant:${tenantId}`);
  }

  @SubscribeMessage('join-conversation')
  @UseGuards(WsJwtGuard)
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.join(`conversation:${data.conversationId}`);
  }

  // Event listener for broadcasting updates
  @OnEvent('message.received')
  async handleMessageReceived(event: MessageReceivedEvent) {
    this.server.to(`conversation:${event.conversationId}`).emit('message', {
      id: event.message.id,
      content: event.message.content,
      timestamp: event.timestamp,
      from: event.message.from,
    });
  }
}

// Background Jobs (Commands via Queue)
@Processor('assistant-processing')
export class AssistantProcessingConsumer {
  @Process('knowledge-upload')
  async handleKnowledgeUpload(job: Job<KnowledgeUploadData>) {
    await this.commandBus.execute(
      new ProcessKnowledgeUploadCommand(
        job.data.tenantId,
        job.data.assistantId,
        job.data.files,
      ),
    );
  }

  @Process('generate-analytics')
  async handleAnalyticsGeneration(job: Job<AnalyticsData>) {
    await this.commandBus.execute(
      new GenerateAnalyticsCommand(
        job.data.tenantId,
        job.data.dateRange,
      ),
    );
  }
}
```

### **BFF API Controllers**
```typescript
@Controller('api/tenants/:tenantId')
@UseGuards(JwtGuard, TenantAccessGuard)
export class TenantAPIController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('metrics')
  async getMetrics(@Param('tenantId') tenantId: string) {
    return this.queryBus.execute(
      new GetTenantMetricsQuery(tenantId),
    );
  }

  @Get('conversations')
  async getConversations(
    @Param('tenantId') tenantId: string,
    @Query() query: ConversationQueryDto,
  ) {
    return this.queryBus.execute(
      new GetConversationsQuery(tenantId, query),
    );
  }

  @Post('assistants')
  async createAssistant(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreateAssistantDto,
  ) {
    return this.commandBus.execute(
      new CreateAssistantCommand(tenantId, dto),
    );
  }

  @Put('assistants/:assistantId')
  async updateAssistant(
    @Param('tenantId') tenantId: string,
    @Param('assistantId') assistantId: string,
    @Body() dto: UpdateAssistantDto,
  ) {
    return this.commandBus.execute(
      new ConfigureAssistantCommand(tenantId, assistantId, dto),
    );
  }
}
```

---

## **4. PUBLIC API SERVICE (NestJS)**

### **Responsabilidades**
- APIs públicas para integrações externas
- Webhook outbound (notificações de eventos)
- Processamento assíncrono via commands
- Rate limiting e autenticação externa
- Documentação OpenAPI

### **Stack Tecnológica**
- **Framework:** NestJS + TypeScript
- **Auth:** @nestjs/passport + JWT + API Keys
- **CQRS:** @nestjs/cqrs (Commands + Events)
- **Rate Limiting:** @nestjs/throttler
- **Docs:** @nestjs/swagger
- **Queue:** @nestjs/bull

### **Estrutura NestJS**
```
apps/public-api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── guards/
│   │   │   ├── api-key.guard.ts
│   │   │   └── jwt.guard.ts
│   │   └── strategies/
│   │       └── api-key.strategy.ts
│   ├── tenant/
│   │   ├── tenant.module.ts
│   │   ├── tenant.controller.ts
│   │   └── tenant.service.ts
│   ├── assistant/
│   │   ├── assistant.module.ts
│   │   ├── assistant.controller.ts
│   │   ├── commands/
│   │   │   ├── create-assistant.command.ts
│   │   │   └── handlers/
│   │   └── queries/
│   ├── conversation/
│   │   ├── conversation.module.ts
│   │   ├── conversation.controller.ts
│   │   ├── commands/
│   │   │   ├── send-message.command.ts
│   │   │   └── handlers/
│   │   └── queries/
│   ├── webhook/
│   │   ├── webhook.module.ts
│   │   ├── webhook.controller.ts
│   │   ├── webhook.service.ts
│   │   ├── commands/
│   │   │   ├── send-webhook.command.ts
│   │   │   ├── retry-webhook.command.ts
│   │   │   └── handlers/
│   │   └── events/
│   │       └── handlers/
│   │           └── webhook-event.handler.ts
│   └── common/
│       ├── guards/
│       ├── interceptors/
│       └── dto/
├── package.json
└── nest-cli.json
```

### **Public APIs with Event-Driven**
```typescript
@ApiTags('assistants')
@Controller('v1/assistants')
@UseGuards(ApiKeyGuard)
export class AssistantController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  @ApiResponse({ type: [AssistantDto] })
  async getAssistants(@Req() req: AuthenticatedRequest) {
    return this.queryBus.execute(
      new GetAssistantsQuery(req.tenant.id),
    );
  }

  @Post()
  @ApiResponse({ type: AssistantDto })
  async createAssistant(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateAssistantDto,
  ) {
    // Command for async processing
    return this.commandBus.execute(
      new CreateAssistantCommand(req.tenant.id, dto),
    );
  }

  @Put(':id/knowledge')
  async uploadKnowledge(
    @Param('id') assistantId: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: UploadKnowledgeDto,
  ) {
    // Command for heavy processing
    await this.commandBus.execute(
      new UploadKnowledgeCommand(
        req.tenant.id,
        assistantId,
        dto.documents,
      ),
    );

    return { status: 'processing', message: 'Knowledge upload started' };
  }
}

// Webhook Management
@Controller('v1/webhooks')
@UseGuards(ApiKeyGuard)
export class WebhookController {
  @Post('subscribe')
  async subscribeWebhook(
    @Req() req: AuthenticatedRequest,
    @Body() dto: WebhookSubscriptionDto,
  ) {
    return this.commandBus.execute(
      new SubscribeWebhookCommand(
        req.tenant.id,
        dto.url,
        dto.events,
        dto.secret,
      ),
    );
  }
}
```

### **Webhook Commands (Async Processing)**
```typescript
@CommandHandler(SendWebhookCommand)
export class SendWebhookHandler implements ICommandHandler<SendWebhookCommand> {
  constructor(private readonly httpService: HttpService) {}

  async execute(command: SendWebhookCommand): Promise<void> {
    try {
      const signature = this.generateSignature(
        command.payload,
        command.secret,
      );

      await this.httpService.post(command.url, command.payload, {
        headers: {
          'X-Webhook-Signature': signature,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }).toPromise();

    } catch (error) {
      // Queue retry command
      await this.commandBus.execute(
        new RetryWebhookCommand(
          command.webhookId,
          command.attempt + 1,
        ),
      );
    }
  }
}

// Event Handler for outbound webhooks
@EventsHandler(ConversationCompletedEvent)
export class ConversationCompletedWebhookHandler implements IEventHandler<ConversationCompletedEvent> {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: ConversationCompletedEvent) {
    // Find subscribed webhooks for this event
    const webhooks = await this.webhookService.findByTenantAndEvent(
      event.tenantId,
      'conversation.completed',
    );

    // Send webhook for each subscription (async)
    for (const webhook of webhooks) {
      await this.commandBus.execute(
        new SendWebhookCommand(
          webhook.id,
          webhook.url,
          webhook.secret,
          {
            event: 'conversation.completed',
            tenantId: event.tenantId,
            conversationId: event.conversationId,
            data: event.data,
            timestamp: new Date().toISOString(),
          },
          1, // attempt
        ),
      );
    }
  }
}
```

### **Queue-based Background Jobs**
```typescript
@Processor('webhook-delivery')
export class WebhookDeliveryConsumer {
  @Process('send-webhook')
  async handleWebhookDelivery(job: Job<WebhookDeliveryData>) {
    await this.commandBus.execute(
      new SendWebhookCommand(
        job.data.webhookId,
        job.data.url,
        job.data.secret,
        job.data.payload,
        job.data.attempt,
      ),
    );
  }

  @Process('cleanup-old-webhooks')
  async handleWebhookCleanup(job: Job) {
    await this.commandBus.execute(
      new CleanupOldWebhooksCommand(),
    );
  }
}
```

---

## **EVENT-DRIVEN vs COMMAND PATTERN - ESTRATÉGIA DE IMPLEMENTAÇÃO**

### **Quando Usar Events vs Commands**

#### **🔔 EVENTS (Domain Events)**
**Use para:** Comunicação entre bounded contexts, notificações e side effects

```typescript
// ✅ EVENTOS - O que aconteceu (passado)
export class TenantCreatedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly tenantData: TenantData,
    public readonly timestamp: Date,
  ) {}
}

export class AssistantConfiguredEvent {
  constructor(
    public readonly tenantId: string,
    public readonly assistantId: string,
    public readonly config: AssistantConfig,
  ) {}
}

export class MessageReceivedEvent {
  constructor(
    public readonly conversationId: string,
    public readonly message: InternalMessage,
    public readonly tenantId: string,
  ) {}
}

export class ConversationCompletedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly conversationId: string,
    public readonly summary: ConversationSummary,
  ) {}
}
```

**Características dos Events:**
- **Imutáveis:** Representam algo que já aconteceu
- **Múltiplos Handlers:** Vários serviços podem reagir ao mesmo evento
- **Eventual Consistency:** Pode haver delay entre evento e reação
- **Side Effects:** Envio de emails, webhooks, analytics

#### **⚡ COMMANDS (Actions)**
**Use para:** Processamento assíncrono pesado, operações que podem falhar

```typescript
// ✅ COMMANDS - O que deve ser feito (imperativo)
export class ProcessMessageCommand {
  constructor(
    public readonly tenantId: string,
    public readonly messageData: MessageData,
    public readonly priority: 'low' | 'normal' | 'high',
  ) {}
}

export class GenerateAIResponseCommand {
  constructor(
    public readonly tenantId: string,
    public readonly conversationId: string,
    public readonly context: ConversationContext,
  ) {}
}

export class IndexKnowledgeBaseCommand {
  constructor(
    public readonly tenantId: string,
    public readonly assistantId: string,
    public readonly documents: Document[],
  ) {}
}

export class SendWebhookCommand {
  constructor(
    public readonly webhookId: string,
    public readonly url: string,
    public readonly payload: any,
    public readonly attempt: number,
  ) {}
}
```

**Características dos Commands:**
- **Imperativos:** Descrevem ação a ser executada
- **Single Handler:** Apenas um handler por command
- **Retry Logic:** Podem ser reprocessados em caso de falha
- **Heavy Processing:** Operações custosas como IA, uploads, etc.

### **Fluxo Híbrido Exemplo**

```typescript
// 1. WEBHOOK RECEBIDO (HTTP Request)
@Post('webhook/whatsapp/:tenantId/:channelId')
async handleWhatsApp(@Param() params, @Body() payload) {
  // 🔔 Emite EVENTO que algo aconteceu
  await this.eventEmitter.emitAsync('webhook.received', {
    source: 'whatsapp',
    tenantId: params.tenantId,
    channelId: params.channelId,
    payload,
    timestamp: new Date(),
  });
  
  return { status: 'received' };
}

// 2. EVENT HANDLER converte para COMMAND
@OnEvent('webhook.received')
async handleWebhookReceived(event: WebhookReceivedEvent) {
  // ⚡ Executa COMMAND para processamento pesado
  await this.commandBus.execute(
    new ProcessMessageCommand(
      event.tenantId,
      event.payload,
      'normal'
    )
  );
}

// 3. COMMAND HANDLER processa e emite novos EVENTOS  
@CommandHandler(ProcessMessageCommand)
export class ProcessMessageHandler {
  async execute(command: ProcessMessageCommand): Promise<void> {
    // Processamento pesado
    const internalMessage = await this.convertMessage(command.messageData);
    const conversation = await this.saveMessage(internalMessage);
    
    // 🔔 Emite EVENTO que processamento terminou
    await this.eventBus.publish(
      new MessageProcessedEvent(
        command.tenantId,
        internalMessage,
        conversation.id,
      )
    );
  }
}

// 4. MÚLTIPLOS EVENT HANDLERS reagem
@EventsHandler(MessageProcessedEvent)
export class TriggerAIHandler {
  async handle(event: MessageProcessedEvent) {
    // ⚡ Novo COMMAND para IA
    await this.commandBus.execute(
      new GenerateAIResponseCommand(event.tenantId, event.conversationId)
    );
  }
}

@EventsHandler(MessageProcessedEvent) 
export class AnalyticsHandler {
  async handle(event: MessageProcessedEvent) {
    // Update metrics (fast operation)
    await this.metricsService.incrementMessageCount(event.tenantId);
  }
}

@EventsHandler(MessageProcessedEvent)
export class WebhookNotificationHandler {
  async handle(event: MessageProcessedEvent) {
    // ⚡ COMMAND para envio de webhook
    await this.commandBus.execute(
      new SendWebhookCommand(event.tenantId, 'message.processed', event.data)
    );
  }
}
```

### **Padrões de Uso**

#### **Events para:**
- ✅ Notificar que algo aconteceu
- ✅ Integrar bounded contexts diferentes
- ✅ Analytics e métricas em tempo real
- ✅ Trigger de outros processos
- ✅ Auditoria e logging

#### **Commands para:**
- ✅ Processamento de IA (geração de respostas)
- ✅ Upload e processamento de arquivos
- ✅ Envio de emails/webhooks
- ✅ Operações de cleanup
- ✅ Indexação de base de conhecimento
- ✅ Geração de relatórios
- ✅ Qualquer operação que pode falhar e precisa retry

### **Implementação no NestJS**

```typescript
// app.module.ts
@Module({
  imports: [
    CqrsModule,              // Commands + Events
    EventEmitterModule.forRoot(),  // Local events
    BullModule.forRoot({     // Queue for Commands
      redis: { host: 'localhost', port: 6379 }
    })
  ]
})
export class AppModule {}

// Configuração completa
export class SomeService {
  constructor(
    private readonly eventEmitter: EventEmitter2,  // Local events
    private readonly eventBus: EventBus,           // Domain events  
    private readonly commandBus: CommandBus,       // Commands
    private readonly queryBus: QueryBus,           // Queries
  ) {}
  
  async doSomething() {
    // Local event (fast)
    this.eventEmitter.emit('something.happened', data);
    
    // Domain event (eventual consistency)
    await this.eventBus.publish(new SomethingHappenedEvent(data));
    
    // Async command (heavy processing)
    await this.commandBus.execute(new ProcessSomethingCommand(data));
    
    // Query (read)
    return this.queryBus.execute(new GetSomethingQuery(id));
  }
}
```

Esta abordagem híbrida dá o melhor dos dois mundos: **Events para comunicação/notificação** e **Commands para processamento assíncrono pesado**.

---

## **FUNCIONALIDADES CRÍTICAS DO SISTEMA**

### **1. MESSAGE BUFFERING (Timeout Strategy)**

O sistema deve implementar buffer de mensagens para coletar múltiplas mensagens do usuário antes de processar:

```typescript
// libs/shared/src/message-buffer.service.ts
@Injectable()
export class MessageBufferService {
  private buffers = new Map<string, MessageBuffer>();
  
  constructor(
    @Inject('REDIS') private readonly redis: Redis,
    private readonly eventBus: EventBus,
  ) {}

  async addMessage(conversationId: string, message: InternalMessage): Promise<void> {
    const bufferKey = `buffer:${conversationId}`;
    
    // Add message to buffer
    await this.redis.lpush(bufferKey, JSON.stringify(message));
    await this.redis.expire(bufferKey, 300); // 5 min TTL
    
    // Cancel existing timeout
    const existingTimeout = this.buffers.get(conversationId);
    if (existingTimeout?.timeoutId) {
      clearTimeout(existingTimeout.timeoutId);
    }
    
    // Set new timeout for X seconds (configurable per assistant)
    const assistant = await this.getAssistantConfig(message.tenant_id, conversationId);
    const timeoutSeconds = assistant.config.messageBufferTimeout || 3; // default 3s
    
    const timeoutId = setTimeout(async () => {
      await this.flushBuffer(conversationId);
    }, timeoutSeconds * 1000);
    
    this.buffers.set(conversationId, {
      timeoutId,
      messageCount: await this.redis.llen(bufferKey),
    });
  }

  private async flushBuffer(conversationId: string): Promise<void> {
    const bufferKey = `buffer:${conversationId}`;
    
    // Get all buffered messages
    const messagesStr = await this.redis.lrange(bufferKey, 0, -1);
    const messages = messagesStr.map(str => JSON.parse(str));
    
    if (messages.length === 0) return;
    
    // Clear buffer
    await this.redis.del(bufferKey);
    this.buffers.delete(conversationId);
    
    // Emit event with all buffered messages
    await this.eventBus.publish(
      new MessagesBufferedEvent(
        conversationId,
        messages.reverse(), // Reverse to get chronological order
        messages[0].tenant_id,
      ),
    );
  }
}

// Event for buffered messages
export class MessagesBufferedEvent {
  constructor(
    public readonly conversationId: string,
    public readonly messages: InternalMessage[],
    public readonly tenantId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

// Handler for buffered messages
@EventsHandler(MessagesBufferedEvent)
export class BufferedMessagesHandler implements IEventHandler<MessagesBufferedEvent> {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: MessagesBufferedEvent) {
    // Process all messages as a batch
    await this.commandBus.execute(
      new ProcessBufferedMessagesCommand(
        event.tenantId,
        event.conversationId,
        event.messages,
      ),
    );
  }
}
```

### **2. API VERSIONING STRATEGY**

Todos os serviços devem implementar versionamento consistente:

```typescript
// Gateway Service
@Controller({ version: '1', path: 'webhook' })
export class WebhookV1Controller {
  @Post('whatsapp/:tenantId/:workspaceId/:channelId')
  @Version('1')
  async handleWhatsAppV1(@Param() params, @Body() payload) {
    // V1 implementation
  }
}

// Public API Service  
@Controller({ version: '1', path: 'assistants' })
@ApiTags('assistants-v1')
export class AssistantV1Controller {
  @Get()
  @Version('1')
  @ApiOperation({ summary: 'List assistants v1' })
  async getAssistants() {
    // V1 implementation
  }
}

@Controller({ version: '2', path: 'assistants' })  
@ApiTags('assistants-v2')
export class AssistantV2Controller {
  @Get()
  @Version('2')
  @ApiOperation({ summary: 'List assistants v2 with extended data' })
  async getAssistants() {
    // V2 implementation with breaking changes
  }
}

// main.ts - Enable versioning
async function bootstrap() {
  const app = await NestJSFactory.create(AppModule);
  
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
  });
  
  // Swagger per version
  const configV1 = new DocumentBuilder()
    .setTitle('SaaS Assistants API v1')
    .setVersion('1.0')
    .build();
  const documentV1 = SwaggerModule.createDocument(app, configV1, {
    include: [AssistantV1Controller], // Only V1 controllers
  });
  SwaggerModule.setup('docs/v1', app, documentV1);
  
  const configV2 = new DocumentBuilder()
    .setTitle('SaaS Assistants API v2')
    .setVersion('2.0')
    .build();
  const documentV2 = SwaggerModule.createDocument(app, configV2, {
    include: [AssistantV2Controller], // Only V2 controllers
  });
  SwaggerModule.setup('docs/v2', app, documentV2);
}
```

### **3. GATEWAY EVENT PERSISTENCE & STATUS TRACKING**

O Gateway deve persistir todos os eventos recebidos com tracking de status:

```typescript
// Entity para tracking de webhooks
@Entity('webhook_events')
export class WebhookEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenant_id: string;

  @Column()
  workspace_id: string;

  @Column()
  channel_id: string;

  @Column()
  source: string; // 'whatsapp', 'instagram', 'web'

  @Column('jsonb')
  payload: any;

  @Column()
  signature: string; // Para validação de integridade

  @Column({
    type: 'enum',
    enum: ['queued', 'accepted', 'rejected'],
    default: 'queued'
  })
  status: 'queued' | 'accepted' | 'rejected';

  @Column({ nullable: true })
  rejection_reason: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  received_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  processed_at: Date;

  @Column({ nullable: true })
  correlation_id: string; // Link com processamento downstream
}

// Gateway Webhook Controller atualizado
@Controller({ version: '1', path: 'webhook' })
export class WebhookV1Controller {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post('whatsapp/:tenantId/:workspaceId/:channelId')
  async handleWhatsApp(
    @Param() params: WebhookParamsDto,
    @Body() payload: WhatsAppWebhookDto,
    @Headers('x-signature') signature: string,
  ) {
    // 1. SEMPRE persiste primeiro
    const webhookEvent = await this.webhookService.persistEvent({
      tenant_id: params.tenantId,
      workspace_id: params.workspaceId,
      channel_id: params.channelId,
      source: 'whatsapp',
      payload,
      signature,
      status: 'queued',
    });

    try {
      // 2. Validação básica
      await this.webhookService.validateWebhook(
        params.tenantId,
        params.channelId,
        payload,
        signature,
      );

      // 3. Emit event para processamento
      await this.eventEmitter.emitAsync('webhook.received', {
        eventId: webhookEvent.id,
        source: 'whatsapp',
        tenant: { id: params.tenantId, workspaceId: params.workspaceId },
        channelId: params.channelId,
        payload,
        timestamp: new Date(),
      });

      return { status: 'received', eventId: webhookEvent.id };

    } catch (error) {
      // 4. Marca como rejeitado em caso de erro
      await this.webhookService.updateEventStatus(
        webhookEvent.id,
        'rejected',
        error.message,
      );
      
      throw new BadRequestException(`Webhook rejected: ${error.message}`);
    }
  }
}

// Service para gerenciar webhook events
@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(WebhookEvent)
    private readonly webhookEventRepo: Repository<WebhookEvent>,
    private readonly tenantService: TenantService,
  ) {}

  async persistEvent(data: Partial<WebhookEvent>): Promise<WebhookEvent> {
    const event = this.webhookEventRepo.create({
      ...data,
      correlation_id: uuidv4(),
    });
    
    return this.webhookEventRepo.save(event);
  }

  async updateEventStatus(
    eventId: string,
    status: 'accepted' | 'rejected',
    reason?: string,
  ): Promise<void> {
    await this.webhookEventRepo.update(eventId, {
      status,
      rejection_reason: reason,
      processed_at: new Date(),
    });
  }

  async validateWebhook(
    tenantId: string,
    channelId: string,
    payload: any,
    signature: string,
  ): Promise<void> {
    // 1. Validar tenant existe e ativo
    const tenant = await this.tenantService.findById(tenantId);
    if (!tenant || tenant.status !== 'active') {
      throw new Error('Tenant not found or inactive');
    }

    // 2. Validar canal existe e está ativo
    const channel = await this.tenantService.getChannel(tenantId, channelId);
    if (!channel || channel.status !== 'active') {
      throw new Error('Channel not found or inactive');
    }

    // 3. Validar signature se configurada
    if (channel.webhook_secret && signature) {
      const expectedSignature = this.generateSignature(payload, channel.webhook_secret);
      if (signature !== expectedSignature) {
        throw new Error('Invalid webhook signature');
      }
    }

    // 4. Rate limiting por tenant
    const isAllowed = await this.checkRateLimit(tenantId);
    if (!isAllowed) {
      throw new Error('Rate limit exceeded');
    }
  }
}

// Event Handler atualizado
@OnEvent('webhook.received')
export class WebhookReceivedHandler {
  constructor(
    private readonly messageClient: ClientProxy,
    private readonly webhookService: WebhookService,
  ) {}

  async handleWebhookReceived(event: WebhookReceivedEvent) {
    try {
      // Envia para message processor
      await this.messageClient.emit('message.process', {
        ...event,
        correlationId: event.eventId, // Link com webhook event
      });

      // Marca como aceito
      await this.webhookService.updateEventStatus(event.eventId, 'accepted');

    } catch (error) {
      // Marca como rejeitado se falhar
      await this.webhookService.updateEventStatus(
        event.eventId,
        'rejected',
        error.message,
      );
    }
  }
}
```

### **4. IOC CONTAINER CONFIGURATION**

Configuração centralizada de DI para todos os serviços:

```typescript
// libs/shared/src/di.module.ts
@Global()
@Module({
  providers: [
    // Database
    {
      provide: 'DATABASE',
      useFactory: (configService: ConfigService) => {
        return new DataSource({
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USER'),
          password: configService.get('DB_PASS'),
          database: configService.get('DB_NAME'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: false,
        });
      },
      inject: [ConfigService],
    },
    
    // Redis
    {
      provide: 'REDIS',
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
        });
      },
      inject: [ConfigService],
    },
    
    // Services with proper DI
    MessageBufferService,
    CacheService,
    LoggerService,
    EventPublisher,
  ],
  exports: [
    'DATABASE',
    'REDIS', 
    MessageBufferService,
    CacheService,
    LoggerService,
    EventPublisher,
  ],
})
export class SharedDIModule {}

// Uso nos app modules
@Module({
  imports: [
    SharedDIModule,
    CqrsModule,
    // ... outros módulos
  ],
})
export class AppModule {}
```

Essas implementações garantem:

✅ **Buffer de mensagens** com timeout configurável por assistente  
✅ **Versionamento consistente** em todas as APIs  
✅ **Persistência de eventos** no Gateway com status tracking  
✅ **IOC/DI** padronizado em todos os serviços  
✅ **Observabilidade** completa do fluxo de webhooks  
✅ **Validação robusta** antes do processamento

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"content": "Implementar buffer de mensagens com timeout", "status": "completed", "activeForm": "Implementando buffer de mensagens"}, {"content": "Adicionar versionamento de APIs em todos os servi\u00e7os", "status": "completed", "activeForm": "Adicionando versionamento de APIs"}, {"content": "Implementar persist\u00eancia de eventos no Gateway com status tracking", "status": "completed", "activeForm": "Implementando persist\u00eancia de eventos"}]

## **INFRAESTRUTURA DE DADOS**

### **PostgreSQL - Schema Multi-Tenant**
```sql
-- Core tables
tenants (id, name, subdomain, plan, created_at, updated_at)
workspaces (id, tenant_id, name, settings, created_at)
users (id, tenant_id, email, role, created_at)

-- Assistants & Channels  
assistants (id, workspace_id, name, personality, config, created_at)
channels (id, workspace_id, type, status, config, created_at)
assistant_channels (assistant_id, channel_id)

-- Conversations
conversations (id, workspace_id, channel_id, contact_id, status, created_at)
messages (id, conversation_id, from_type, content, metadata, created_at)
contacts (id, workspace_id, phone, email, name, tags, created_at)

-- Knowledge Base
knowledge_bases (id, assistant_id, name, type, content, embeddings)
actions (id, assistant_id, name, function_schema, created_at)
```

### **Redis - Estratégia de Cache**
```javascript
// Cache Keys Structure
tenant:{tenant_id}:config                    // TTL: 1h
workspace:{workspace_id}:assistants          // TTL: 30min  
assistant:{assistant_id}:knowledge           // TTL: 24h
conversation:{conv_id}:context               // TTL: 6h
channel:{channel_id}:status                  // TTL: 15min

// Queues
queue:messages:priority                      // Alta prioridade
queue:messages:normal                        // Prioridade normal
queue:ai:responses                          // Respostas IA
queue:webhooks:outbound                     // Webhooks saída
```

---

## **COMUNICAÇÃO ENTRE SERVIÇOS**

### **Fluxo Principal**
```
1. Canal → Gateway (webhook)
2. Gateway → Message Processor (HTTP + Queue)
3. Message Processor → IA → Database
4. Message Processor → Canal (resposta)
5. Frontend ← Database (métricas em tempo real)
```

### **Event-Driven Architecture**
```javascript
// Redis Pub/Sub Events
events:message:received
events:message:processed  
events:conversation:updated
events:assistant:configured
events:channel:status:changed
```

---

## **DEPLOYMENT & SCALING**

### **Docker Compose (Dev)**
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: saas_assistants
  
  redis:
    image: redis:7-alpine
  
  gateway:
    build: ./gateway-service
    ports: ["3001:3001"]
  
  message-processor:
    build: ./message-processor  
    ports: ["3002:3002"]
  
  frontend:
    build: ./frontend-service
    ports: ["3000:3000"]
    
  public-api:
    build: ./public-api
    ports: ["3003:3003"]
```

### **Kubernetes (Prod)**
- HPA baseado em CPU/Memory
- Separate deployments por serviço
- Shared PostgreSQL e Redis clusters
- Load balancer com SSL termination

---

## **MONITORAMENTO & OBSERVABILIDADE**

### **Metrics (Prometheus)**
- Request rate por serviço
- Message processing latency  
- Cache hit/miss ratio
- Database connection pool

### **Logs (Structured JSON)**
- Correlation ID cross-services
- Tenant context em todos logs
- Error tracking com stack traces

### **Health Checks**
```javascript
GET /health
{
  "status": "healthy",
  "database": "connected", 
  "redis": "connected",
  "version": "1.0.0"
}
```

---

## **PACKAGES COMPARTILHADOS (Monorepo)**

### **Estrutura do Monorepo**
```
packages/
├── shared-types/          # DTOs e interfaces TypeScript
├── events/               # Definições de eventos e payloads
├── database/             # Migrations, seeds e models
├── cache-service/        # Serviço de cache Redis
├── logger/               # Logging estruturado
├── scheduler/            # Agendamentos e follow-ups
├── api-middlewares/      # Middlewares compartilhados
└── validators/           # Schemas de validação
```

---

### **1. @saas-assistants/shared-types**

**Propósito:** DTOs, interfaces e types compartilhados entre todos os serviços

```typescript
// packages/shared-types/src/index.ts
export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  plan: 'free' | 'pro' | 'enterprise';
  created_at: Date;
  updated_at: Date;
}

export interface Assistant {
  id: string;
  workspace_id: string;
  name: string;
  personality: string;
  config: AssistantConfig;
  status: 'active' | 'inactive';
}

export interface InternalMessage {
  id: string;
  tenant_id: string;
  workspace_id: string;
  channel_id: string;
  channel_type: ChannelType;
  conversation_id: string;
  from: string;
  to: string;
  message_type: MessageType;
  content: string;
  metadata: Record<string, any>;
  timestamp: string;
  context: MessageContext;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: PaginationMeta;
}

export type ChannelType = 'whatsapp' | 'instagram' | 'web';
export type MessageType = 'text' | 'audio' | 'image' | 'video' | 'document' | 'location';
export type ChannelStatus = 'active' | 'inactive' | 'test';
```

**package.json:**
```json
{
  "name": "@saas-assistants/shared-types",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  }
}
```

---

### **2. @saas-assistants/events**

**Propósito:** Definições padronizadas de eventos e payloads para pub/sub

```typescript
// packages/events/src/index.ts
export enum EventType {
  MESSAGE_RECEIVED = 'message.received',
  MESSAGE_PROCESSED = 'message.processed',
  CONVERSATION_UPDATED = 'conversation.updated',
  ASSISTANT_CONFIGURED = 'assistant.configured',
  CHANNEL_STATUS_CHANGED = 'channel.status.changed',
  FOLLOW_UP_SCHEDULED = 'followup.scheduled',
  LEAD_CONVERTED = 'lead.converted'
}

export interface BaseEvent {
  id: string;
  type: EventType;
  tenant_id: string;
  workspace_id?: string;
  timestamp: string;
  correlation_id?: string;
}

export interface MessageReceivedEvent extends BaseEvent {
  type: EventType.MESSAGE_RECEIVED;
  payload: {
    conversation_id: string;
    channel_id: string;
    message: InternalMessage;
  };
}

export interface FollowUpScheduledEvent extends BaseEvent {
  type: EventType.FOLLOW_UP_SCHEDULED;
  payload: {
    contact_id: string;
    conversation_id: string;
    scheduled_at: string;
    message_template: string;
    priority: 'low' | 'medium' | 'high';
  };
}

// Event Publisher
export class EventPublisher {
  constructor(private redis: Redis) {}
  
  async publish<T extends BaseEvent>(event: T): Promise<void> {
    await this.redis.publish(`events:${event.type}`, JSON.stringify(event));
  }
}
```

---

### **3. @saas-assistants/database**

**Propósito:** Migrations, seeds, models e queries compartilhadas

```javascript
// packages/database/src/migrations/
├── 001_create_tenants.sql
├── 002_create_workspaces.sql
├── 003_create_assistants.sql
└── 004_create_conversations.sql

// packages/database/src/seeds/
├── dev-tenants.sql
└── sample-assistants.sql

// packages/database/src/models/
├── tenant.model.js
├── assistant.model.js
└── conversation.model.js
```

```javascript
// packages/database/src/index.js
const { Pool } = require('pg');

class Database {
  constructor(config) {
    this.pool = new Pool(config);
  }

  async query(text, params) {
    const start = Date.now();
    const res = await this.pool.query(text, params);
    const duration = Date.now() - start;
    
    console.log('executed query', { text, duration, rows: res.rowCount });
    return res;
  }

  async getClient() {
    return this.pool.connect();
  }

  // Multi-tenant helper
  async withTenant(tenantId, callback) {
    const client = await this.getClient();
    try {
      await client.query('SET app.current_tenant = $1', [tenantId]);
      return await callback(client);
    } finally {
      client.release();
    }
  }
}

module.exports = { Database };
```

---

### **4. @saas-assistants/cache-service**

**Propósito:** Abstração do Redis com padrões de cache e invalidação

```javascript
// packages/cache-service/src/index.js
const Redis = require('ioredis');

class CacheService {
  constructor(config) {
    this.redis = new Redis(config);
    this.defaultTTL = 3600; // 1 hour
  }

  // Tenant-specific cache
  async getTenantCache(tenantId, key) {
    return this.get(`tenant:${tenantId}:${key}`);
  }

  async setTenantCache(tenantId, key, value, ttl = this.defaultTTL) {
    return this.set(`tenant:${tenantId}:${key}`, value, ttl);
  }

  async invalidateTenantCache(tenantId, pattern = '*') {
    const keys = await this.redis.keys(`tenant:${tenantId}:${pattern}`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  // Assistant knowledge cache
  async getAssistantKnowledge(assistantId) {
    return this.get(`assistant:${assistantId}:knowledge`);
  }

  async setAssistantKnowledge(assistantId, knowledge) {
    return this.set(`assistant:${assistantId}:knowledge`, knowledge, 86400); // 24h
  }

  // Generic methods
  async get(key) {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key, value, ttl = this.defaultTTL) {
    return this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async del(key) {
    return this.redis.del(key);
  }
}

module.exports = { CacheService };
```

---

### **5. @saas-assistants/logger**

**Propósito:** Logging estruturado com contexto de tenant e correlation ID

```javascript
// packages/logger/src/index.js
const winston = require('winston');

class Logger {
  constructor(service, options = {}) {
    this.service = service;
    this.logger = winston.createLogger({
      level: options.level || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service },
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
      ]
    });
  }

  withContext(context) {
    return {
      info: (message, meta = {}) => this.logger.info(message, { ...context, ...meta }),
      warn: (message, meta = {}) => this.logger.warn(message, { ...context, ...meta }),
      error: (message, meta = {}) => this.logger.error(message, { ...context, ...meta }),
      debug: (message, meta = {}) => this.logger.debug(message, { ...context, ...meta })
    };
  }

  tenant(tenantId, correlationId = null) {
    return this.withContext({ tenant_id: tenantId, correlation_id: correlationId });
  }
}

module.exports = { Logger };
```

---

### **6. @saas-assistants/scheduler**

**Propósito:** Agendamento de follow-ups e tarefas recorrentes

```javascript
// packages/scheduler/src/index.js
const cron = require('node-cron');
const { EventPublisher } = require('@saas-assistants/events');

class Scheduler {
  constructor(redis, eventPublisher) {
    this.redis = redis;
    this.eventPublisher = eventPublisher;
    this.jobs = new Map();
  }

  async scheduleFollowUp(contactId, conversationId, tenantId, delayMinutes = 60) {
    const jobId = `followup:${conversationId}:${Date.now()}`;
    const executeAt = Date.now() + (delayMinutes * 60 * 1000);
    
    const job = {
      id: jobId,
      type: 'followup',
      execute_at: executeAt,
      payload: {
        contact_id: contactId,
        conversation_id: conversationId,
        tenant_id: tenantId
      }
    };

    await this.redis.zadd('scheduled_jobs', executeAt, JSON.stringify(job));
    return jobId;
  }

  async cancelFollowUp(jobId) {
    const jobs = await this.redis.zrange('scheduled_jobs', 0, -1);
    for (const jobStr of jobs) {
      const job = JSON.parse(jobStr);
      if (job.id === jobId) {
        await this.redis.zrem('scheduled_jobs', jobStr);
        return true;
      }
    }
    return false;
  }

  startProcessor() {
    cron.schedule('* * * * *', async () => {
      await this.processPendingJobs();
    });
  }

  async processPendingJobs() {
    const now = Date.now();
    const jobs = await this.redis.zrangebyscore('scheduled_jobs', 0, now);
    
    for (const jobStr of jobs) {
      const job = JSON.parse(jobStr);
      await this.executeJob(job);
      await this.redis.zrem('scheduled_jobs', jobStr);
    }
  }

  async executeJob(job) {
    if (job.type === 'followup') {
      await this.eventPublisher.publish({
        id: `event_${Date.now()}`,
        type: EventType.FOLLOW_UP_SCHEDULED,
        tenant_id: job.payload.tenant_id,
        timestamp: new Date().toISOString(),
        payload: job.payload
      });
    }
  }
}

module.exports = { Scheduler };
```

---

### **7. @saas-assistants/api-middlewares**

**Propósito:** Middlewares reutilizáveis para autenticação, validação e rate limiting

```javascript
// packages/api-middlewares/src/index.js
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Tenant context middleware
const tenantContext = async (req, res, next) => {
  const tenantId = req.headers['x-tenant-id'] || req.user?.tenant_id;
  
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID required' });
  }

  req.tenant_id = tenantId;
  next();
};

// Rate limiting by tenant
const createTenantRateLimit = (maxRequests = 100, windowMs = 60000) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    keyGenerator: (req) => `${req.tenant_id}:${req.ip}`,
    message: { error: 'Too many requests from this tenant' }
  });
};

// Validation middleware
const validateSchema = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details.map(d => d.message) 
      });
    }
    next();
  };
};

// Error handler
const errorHandler = (err, req, res, next) => {
  console.error(err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  res.status(500).json({ error: 'Internal server error' });
};

module.exports = {
  authenticateToken,
  tenantContext,
  createTenantRateLimit,
  validateSchema,
  errorHandler
};
```

---

### **8. @saas-assistants/validators**

**Propósito:** Schemas de validação Joi reutilizáveis

```javascript
// packages/validators/src/index.js
const Joi = require('joi');

const tenantSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  subdomain: Joi.string().alphanum().min(3).max(30).required(),
  plan: Joi.string().valid('free', 'pro', 'enterprise').default('free')
});

const assistantSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  personality: Joi.string().max(1000).required(),
  config: Joi.object({
    temperature: Joi.number().min(0).max(1).default(0.7),
    max_tokens: Joi.number().min(1).max(4000).default(1000),
    system_prompt: Joi.string().max(2000)
  }).required()
});

const messageSchema = Joi.object({
  message_type: Joi.string().valid('text', 'audio', 'image', 'video', 'document', 'location').required(),
  content: Joi.alternatives().conditional('message_type', {
    switch: [
      {
        is: 'text',
        then: Joi.object({
          text: Joi.string().min(1).max(4000).required()
        })
      },
      {
        is: 'audio', 
        then: Joi.object({
          url: Joi.string().uri().optional(),
          base64: Joi.string().optional(),
          text: Joi.string().optional(), // transcrição
          duration: Joi.number().positive().optional()
        }).or('url', 'base64')
      },
      {
        is: 'image',
        then: Joi.object({
          url: Joi.string().uri().optional(),
          base64: Joi.string().optional(),
          caption: Joi.string().max(1000).optional(),
          width: Joi.number().positive().optional(),
          height: Joi.number().positive().optional()
        }).or('url', 'base64')
      },
      {
        is: 'video',
        then: Joi.object({
          url: Joi.string().uri().optional(),
          base64: Joi.string().optional(),
          caption: Joi.string().max(1000).optional(),
          duration: Joi.number().positive().optional(),
          thumbnail: Joi.string().optional()
        }).or('url', 'base64')
      },
      {
        is: 'document',
        then: Joi.object({
          url: Joi.string().uri().optional(),
          base64: Joi.string().optional(),
          filename: Joi.string().required(),
          mimetype: Joi.string().required(),
          size: Joi.number().positive().optional()
        }).or('url', 'base64')
      },
      {
        is: 'location',
        then: Joi.object({
          latitude: Joi.number().min(-90).max(90).required(),
          longitude: Joi.number().min(-180).max(180).required(),
          address: Joi.string().optional(),
          name: Joi.string().optional()
        })
      }
    ]
  }),
  metadata: Joi.object().default({})
});

const webhookSchema = Joi.object({
  url: Joi.string().uri().required(),
  events: Joi.array().items(Joi.string()).min(1).required(),
  secret: Joi.string().min(8).required()
});

module.exports = {
  tenantSchema,
  assistantSchema,
  messageSchema,
  webhookSchema
};
```

---

### **Configuração do Monorepo**

**package.json (root):**
```json
{
  "name": "saas-assistants-monorepo",
  "private": true,
  "workspaces": [
    "packages/*",
    "services/*"
  ],
  "scripts": {
    "build": "lerna run build",
    "test": "lerna run test",
    "dev": "lerna run dev --parallel"
  },
  "devDependencies": {
    "lerna": "^6.0.0",
    "typescript": "^5.0.0"
  }
}
```

**lerna.json:**
```json
{
  "version": "independent",
  "npmClient": "npm",
  "command": {
    "publish": {
      "conventionalCommits": true
    }
  }
}
```

Esta arquitetura equilibra simplicidade operacional com capacidade de escala, mantendo baixa complexidade enquanto atende todos os requisitos do SaaS multi-tenant.