# Message Processing Pipeline

## Descrição
Sistema plug-and-play de processamento de mensagens com pipelines configuráveis por projeto. Suporta Dual Pipeline Pattern (PRE_BUFFER/POST_BUFFER) para acumular mensagens rápidas e processar em lote. Cada step retorna `shouldContinue: boolean`, parando o fluxo quando necessário. Context propagado entre steps. Buffer usa Redis + BullMQ com timeout dinâmico.

---

## Estratégia de Execução

### Pipeline Pattern
Cada mensagem passa por uma sequência de steps:
- **Steps Genéricos** (reutilizáveis entre projetos)
- **Steps Customizados** (específicos por projeto)
- **Registry Pattern** (steps registrados dinamicamente)
- **Factory Pattern** (pipeline criado baseado em `projectType`)

### Fluxo de Execução
```
Webhook → ProcessWebhookCommand → ProcessIncomingMessageCommand
  → MessagePipelineFactory.createPipeline(projectType)
  → MessagePipeline.execute(context)
  → Step1 → Step2 → ... → StepN
```

### Context Propagation
```typescript
MessageContext {
  message: TypedMessage,        // Mensagem normalizada
  accountId: string,            // Multi-tenancy
  projectId: string,            // Qual projeto/bot
  conversationId: string,       // Thread
  metadata: Record<any>,        // Dados compartilhados entre steps
  executionHistory: Step[]      // Histórico de execução
}
```

---

## Pipelines Configurados

Total: **3 pipelines** (default, mercado-phone, law-office, mp-my-iablue)

| Pipeline | Modo | Steps | Descrição |
|----------|------|-------|-----------|
| **Default** | FULL | 4 steps | Mínimo: save → verify → ai → send |
| **Mercado Phone** | FULL | 8 steps | + verify-authorized-sender |
| **Law Office** | FULL | 8 steps | + verify-tester (testing mode) |
| **MP My IABlue** | PRE_BUFFER | 5 steps | Valida + salva + buffer (comando bypass) |
| **MP My IABlue** | POST_BUFFER | 5 steps | Carrega buffer → AI → envia → limpa |

**Dual Pipeline Pattern:** Projetos podem usar `useDualPipeline: true` para dividir processamento em PRE_BUFFER (rápido) e POST_BUFFER (AI batch).

### Pipeline Default
```typescript
'save-message'              // Persiste mensagem
'verify-project-active'     // Verifica projeto ativo
'generate-ai-response'      // Gera resposta AI
'send-response'             // Envia ao usuário
```

### Pipeline Mercado Phone
```typescript
'save-message'
'verify-project-active'
'verify-authorized-sender'  // ← Específico: valida API externa
'check-command'
'buffer-messages'
'convert-media-to-text'
'generate-ai-response'
'send-response'
```

### Pipeline MP My IABlue (Dual Mode)

**Modo PRE_BUFFER** (execução imediata ao receber mensagem):
```typescript
'save-message'                                // Persiste no banco
'verify-project-active'                       // Valida projeto ativo
'mp-my-iablue:verify-authorized-sender'       // Custom: API IABlue + whitelist
'mp-my-iablue:check-command'                  // Custom: /status (bypass buffer se comando)
'add-to-buffer'                               // Adiciona ao Redis, agenda job, PARA pipeline
```

**Modo POST_BUFFER** (execução após timeout, via worker):
```typescript
'load-buffered-messages'                      // Carrega histórico do Redis
'convert-media-to-text'                       // Transcreve áudios/vídeos
'mp-my-iablue:generate-ai-response'           // Custom: Agent IABlue (batch context)
'send-response'                               // Envia resposta ao usuário
'clear-buffer'                                // Limpa Redis após sucesso
```

---

## Steps Disponíveis

### Steps Genéricos (Reutilizáveis)

| Step | Nome | Para Pipeline? | Uso |
|------|------|----------------|-----|
| SaveMessageStep | `save-message` | Não | Todos pipelines |
| VerifyProjectActiveStep | `verify-project-active` | Sim (se inativo) | Todos pipelines |
| CheckCommandStep | `check-command` | Sim (se comando) | Pipelines com comandos |
| ConvertMediaToTextStep | `convert-media-to-text` | Não | Pipelines com AI |
| GenerateAIResponseStep | `generate-ai-response` | Não | Pipelines com AI |
| SendResponseStep | `send-response` | Sim (se erro) | Todos pipelines |
| **AddToBufferStep** | `add-to-buffer` | Sim (buffer) | PRE_BUFFER mode |
| **LoadBufferedMessagesStep** | `load-buffered-messages` | Não | POST_BUFFER mode |
| **ClearBufferStep** | `clear-buffer` | Não | POST_BUFFER mode |

### Steps Específicos por Projeto

| Step | Nome | Projeto | Para Pipeline? |
|------|------|---------|----------------|
| VerifyAuthorizedSenderStep | `verify-authorized-sender` | Mercado Phone | Sim (se não autorizado) |
| VerifyTesterStep | `verify-tester` | Law Office | Sim (se não é tester) |
| MpMyIablue*Step | `mp-my-iablue:*` | MP My IABlue | Sim (condições específicas) |

**Localização Steps:**
- Genéricos: `pipeline/steps/`
- Customizados: `pipeline/projects/{project-name}/`

---

## Customização de Pipeline

### Opção 1: Via Factory (hardcoded)
```typescript
// MessagePipelineFactory.ts
private createMyProjectPipeline(): IMessagePipeline {
  const stepNames = [
    'save-message',
    'verify-project-active',
    'my-custom-step',  // Step específico do projeto
    'send-response',
  ];

  return this.createCustomPipeline('my-project-v1', stepNames);
}

// Adicionar case no switch
case 'my-project':
  return this.createMyProjectPipeline();
```

### Opção 2: Steps Customizados por Projeto
```typescript
// Criar step em pipeline/projects/my-project/MyCustomStep.ts
@Injectable()
export class MyCustomStep implements IMessagePipelineStep {
  readonly name = 'my-project:custom-step';

  async execute(context: MessageContext): Promise<PipelineResult> {
    // Lógica customizada

    return {
      shouldContinue: true,  // ou false para parar
      context,
      reason: 'Motivo de parada (opcional)'
    };
  }
}

// Registrar em messages.module.ts
registry.register(myCustomStep.name, myCustomStep);
```

### Opção 3: Dynamic (futuro - banco de dados)
```typescript
// ProjectPipelineConfig (domain)
interface ProjectPipelineConfig {
  projectId: string;
  pipelineName: string;
  steps: Array<{
    name: string;
    order: number;
    enabled: boolean;
    config?: Record<string, any>;
  }>;
}
```

---

## Registry de Steps

### Como Funciona
```typescript
// PipelineStepRegistry
registry.register('save-message', saveMessageStep);
registry.register('my-custom-step', myCustomStep);

// Buscar step
const step = registry.get('save-message');

// Listar registrados
const allSteps = registry.getRegisteredSteps();
// ['save-message', 'verify-project-active', 'my-custom-step', ...]
```

### Auto-registro (messages.module.ts)
```typescript
{
  provide: 'PIPELINE_STEP_INITIALIZER',
  useFactory: (registry, ...steps) => {
    // Registra todos os steps automaticamente
    registry.register(step1.name, step1);
    registry.register(step2.name, step2);
    // ...
    return registry;
  },
  inject: [PipelineStepRegistry, Step1, Step2, ...]
}
```

---

## Dual Pipeline Pattern: Como Funciona

### Fluxo PRE_BUFFER (Pipeline A)
1. Mensagem chega → Webhook → ProcessIncomingMessageCommand
2. Pipeline PRE_BUFFER executa: save → verify → auth → check-command
3. Se for comando: continua pipeline FULL (bypass buffer)
4. Se não for comando: AddToBufferStep adiciona ao Redis
5. AddToBufferStep agenda delayed job (30s default) via BullMQ
6. Pipeline PARA (shouldContinue: false, reason: 'message-buffered')

### Fluxo POST_BUFFER (Pipeline B - Worker)
1. Delayed job fires após timeout (sem novas mensagens por 30s)
2. MessageBufferProcessor carrega todas mensagens do Redis
3. Cria MessageContext com conversationHistory pré-carregada
4. Pipeline POST_BUFFER executa: load → convert → ai → send → clear
5. ClearBufferStep limpa Redis
6. Sistema pronto para próximo batch

### Timeout Dinâmico (Reset)
- Usuário envia msg1 (t=0s) → job agendado para t=30s
- Usuário envia msg2 (t=5s) → job reagendado para t=35s
- Usuário envia msg3 (t=15s) → job reagendado para t=45s
- Silêncio por 30s → job fires, processa [msg1, msg2, msg3]

**Vantagem:** Reduz chamadas de AI agrupando mensagens rápidas em um único contexto.

---

## Arquivos com Regras de Negócio Importantes

### Domain Layer (Entities & Types)
- `libs/domain/src/entities/Project.ts`
  → Configuração buffer por projeto (enabled, timeoutMs, useDualPipeline)

### Backend Interfaces (Contratos)
- `libs/backend/src/messaging/IMessageBufferService.ts`
  → Interface serviço buffer (addMessage, schedule, clear, getMessages)

### Pipeline Core (Orquestração)
- `apps/backend/src/shared/messages/pipeline/MessagePipelineFactory.ts`
  → Factory com suporte a modos (PRE_BUFFER, POST_BUFFER, FULL)

- `apps/backend/src/shared/messages/pipeline/PipelineStepRegistry.ts`
  → Registry pattern para registro dinâmico de steps

### Steps Genéricos - Buffer (Novos)
- `apps/backend/src/shared/messages/pipeline/steps/AddToBufferStep.ts`
  → Adiciona mensagem ao Redis, agenda delayed job, para pipeline

- `apps/backend/src/shared/messages/pipeline/steps/LoadBufferedMessagesStep.ts`
  → Carrega conversationHistory do buffer Redis para context

- `apps/backend/src/shared/messages/pipeline/steps/ClearBufferStep.ts`
  → Limpa buffer Redis após processamento bem-sucedido

### Steps Genéricos - Core
- `apps/backend/src/shared/messages/pipeline/steps/CheckCommandStep.ts`
  → Detecta comandos (/status, /help), bypass buffer se detectado

- `apps/backend/src/shared/messages/pipeline/steps/VerifyProjectActiveStep.ts`
  → Valida projeto ativo antes de processar mensagem

- `apps/backend/src/shared/messages/pipeline/steps/GenerateAIResponseStep.ts`
  → Gera resposta AI usando context com conversationHistory

### Steps Específicos - MP My IABlue
- `apps/backend/src/shared/messages/pipeline/projects/mp-my-iablue/MpMyIablueCheckCommandStep.ts`
  → Comandos customizados IABlue (/status, /report, /config)

- `apps/backend/src/shared/messages/pipeline/projects/mp-my-iablue/MpMyIablueGenerateAIResponseStep.ts`
  → Agent IABlue com contexto específico do projeto

### Workers (Processamento Assíncrono)
- `apps/backend/src/workers/message-buffer.processor.ts`
  → Worker BullMQ que processa POST_BUFFER após timeout

### Services (Infraestrutura)
- `apps/backend/src/shared/services/redis-message-buffer.service.ts`
  → Implementação buffer usando Redis Hash e BullMQ delayed jobs

### Module (DI & Registry)
- `apps/backend/src/shared/messages/messages.module.ts`
  → Registra todos steps (genéricos + específicos) no registry
