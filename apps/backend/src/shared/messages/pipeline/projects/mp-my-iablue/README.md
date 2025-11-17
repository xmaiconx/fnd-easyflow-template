# MP My IABlue - Custom Pipeline Steps

Pipeline customizado de processamento de mensagens para o projeto **mp-my-iablue**.

## 📋 Visão Geral

O pipeline do mp-my-iablue combina steps genéricos (reutilizáveis) com steps altamente customizados para atender às necessidades específicas do sistema IABlue.

## 🎯 Pipeline Completo

```
1. save-message (generic)
   └─ Persiste mensagem no banco de dados

2. verify-project-active (generic)
   └─ Verifica se o projeto está ativo

3. mp-my-iablue:verify-authorized-sender (CUSTOM) ✨
   └─ Valida autorização via API IABlue
   └─ Verifica whitelist de telefones
   └─ Adiciona metadata de autorização

4. mp-my-iablue:check-command (CUSTOM) ✨
   └─ Detecta comandos específicos do IABlue
   └─ Valida comandos permitidos
   └─ Gera respostas de erro customizadas

5. buffer-messages (generic)
   └─ Acumula histórico de mensagens da conversa

6. convert-media-to-text (generic)
   └─ Transcreve áudio, vídeo e imagens

7. mp-my-iablue:generate-ai-response (CUSTOM) ✨
   └─ Gera resposta com agente IABlue
   └─ Processa comandos customizados
   └─ System prompt específico do IABlue

8. send-response (generic)
   └─ Envia resposta de volta ao usuário
```

## 🔧 Steps Customizados

### 1. MpMyIablueVerifyAuthorizedSenderStep

**Nome:** `mp-my-iablue:verify-authorized-sender`

**Responsabilidade:**
Verifica se o sender está autorizado a enviar mensagens no sistema IABlue.

**Lógica:**
1. Verifica se autorização está habilitada
2. Valida whitelist de telefones (fast path)
3. Consulta API externa do IABlue
4. Adiciona metadata de autorização ao context

**Para Pipeline Se:**
- Telefone não disponível
- Não está na whitelist E não autorizado pela API
- Erro ao consultar API (fail-safe)

**Metadata Adicionado:**
```typescript
context.metadata.iablueAuthorization = {
  authorized: true,
  source: 'iablue_api' | 'whitelist',
  clientId: 'iablue-client-123',
  plan: 'premium' | 'free' | 'enterprise',
  companyName: 'Nome da Empresa',
};
```

**Configuração (Project.settings):**
```typescript
{
  authorization: {
    enabled: true,
    externalAuthUrl: 'https://api.iablue.com/auth/verify',
    apiKey: 'sua-api-key',
    whitelist: ['+5511999999999', '+5511888888888'],
  }
}
```

**TODO:**
- [ ] Implementar `IIABlueApiClient` service
- [ ] Configurar retry e timeout para API externa
- [ ] Implementar cache de autorização

---

### 2. MpMyIablueCheckCommandStep

**Nome:** `mp-my-iablue:check-command`

**Responsabilidade:**
Detecta e valida comandos customizados do IABlue.

**Comandos Disponíveis:**
- `/status` - Verifica status do sistema
- `/report [tipo]` - Gera relatório
- `/config` - Acessa configurações
- `/help` - Ajuda com comandos
- `/start` - Inicia conversa

**Comportamento:**
1. Verifica se mensagem é TEXT
2. Detecta prefix de comando (default: "/")
3. Valida comando contra whitelist
4. Gera resposta de erro para comandos inválidos

**Metadata Adicionado:**
```typescript
// Comando válido
context.metadata.isCommand = true;
context.metadata.command = {
  name: 'status',
  args: [],
  valid: true,
};

// Comando inválido
context.metadata.isCommand = true;
context.metadata.command = {
  name: 'invalid',
  args: [],
  valid: false,
  error: 'Command not recognized',
};
context.metadata.commandResponse = {
  text: 'Mensagem de erro customizada...',
};
```

**Configuração (Project.settings):**
```typescript
{
  commands: {
    enabled: true,
    prefix: '/',
    allowedCommands: ['status', 'report', 'config', 'help', 'start'],
  }
}
```

---

### 3. MpMyIablueGenerateAIResponseStep

**Nome:** `mp-my-iablue:generate-ai-response`

**Responsabilidade:**
Gera resposta com agente AI customizado do IABlue.

**Features:**
- System prompt específico do IABlue
- Context injection com dados do cliente
- Processamento de comandos customizados
- Configuração AI personalizada

**Comandos Implementados:**

#### `/status`
Exibe status do sistema IABlue e da conta do cliente.

**Exemplo de resposta:**
```
✅ Status do Sistema IABlue

🟢 Sistema: Online e operacional
🟢 API: Funcionando normalmente
🟢 Banco de Dados: Conectado

📊 Sua Conta
- Cliente: Empresa XYZ
- Plano: premium
- Status: Ativo
```

#### `/report [tipo]`
Solicita geração de relatório.

**Tipos disponíveis:**
- `geral` (default)
- `mensal`
- `custom`

**Exemplo:**
```
/report mensal
```

**Resposta:**
```
📊 Geração de Relatório IABlue

Tipo: mensal
🔄 Processando...
✅ Relatório será enviado para seu email
```

#### `/config`
Fornece link e orientações para configurações.

**Resposta:**
```
⚙️ Configurações da Conta IABlue

🔗 Acesse: https://iablue.com/config

📱 App mobile disponível
💡 Configure notificações, integrações, etc.
```

#### `/help`
Exibe ajuda completa com todos os comandos.

#### `/start`
Boas-vindas e introdução ao bot.

**System Prompt Customizado:**
```
Você é o assistente virtual inteligente do sistema IABlue.

Contexto do Cliente:
- Cliente ID: {clientId}
- Empresa: {companyName}
- Plano: {plan}

Diretrizes:
1. Seja profissional e prestativo
2. Seja claro e objetivo
3. Antecipe necessidades
4. Sugira recursos do IABlue
```

**Configuração AI (Project.settings):**
```typescript
{
  ai: {
    provider: 'openai',
    model: 'gpt-4-turbo',
    temperature: 0.8,
    maxTokens: 2000,
    systemPrompt: 'Override system prompt (opcional)',
  }
}
```

**TODO:**
- [ ] Implementar `IMpMyIablueAIService`
- [ ] Integrar com OpenAI/Anthropic
- [ ] Implementar geração real de relatórios
- [ ] Adicionar mais comandos conforme necessidade

## 📊 Metadata Flow

### Input (do step anterior)
```typescript
{
  message: TypedMessage,
  accountId: string,
  projectId: string,
  conversationId: string,
  metadata: {
    project: { ... },
  }
}
```

### Output (após steps customizados)
```typescript
{
  // ... input
  metadata: {
    // ... existing

    // De VerifyAuthorizedSenderStep
    iablueAuthorization: {
      authorized: true,
      clientId: 'iablue-123',
      plan: 'premium',
      companyName: 'Empresa XYZ',
    },

    // De CheckCommandStep
    isCommand: true,
    command: {
      name: 'status',
      args: [],
      valid: true,
    },

    // De GenerateAIResponseStep
    aiResponse: {
      text: 'Resposta gerada...',
      provider: 'openai',
      model: 'gpt-4-turbo',
      tokensUsed: 150,
    },
  }
}
```

## 🔧 Configuração do Projeto

### Exemplo Completo

```typescript
// Project.settings para mp-my-iablue
{
  // Autorização customizada
  authorization: {
    enabled: true,
    externalAuthUrl: 'https://api.iablue.com/auth/verify',
    apiKey: process.env.IABLUE_API_KEY,
    whitelist: [
      '+5511999999999',  // Telefone de teste
      '+5511888888888',  // Telefone admin
    ],
  },

  // Comandos customizados
  commands: {
    enabled: true,
    prefix: '/',
    allowedCommands: ['status', 'report', 'config', 'help', 'start'],
  },

  // Configuração AI
  ai: {
    provider: 'openai',
    model: 'gpt-4-turbo',
    temperature: 0.8,
    maxTokens: 2000,
  },

  // Buffer de mensagens
  buffer: {
    enabled: true,
    maxMessages: 10,
  },

  // Media processing
  media: {
    transcriptionEnabled: true,
    transcriptionService: 'whisper',
  },
}
```

## 🚀 Como Usar

### 1. Criar Projeto no Banco

```sql
INSERT INTO projects (
  id,
  account_id,
  name,
  project_type,
  status,
  settings
) VALUES (
  'project-mp-my-iablue-123',
  'account-456',
  'MP My IABlue Bot',
  'mp-my-iablue',
  'active',
  '{ ... settings JSON ... }'
);
```

### 2. Pipeline é Criado Automaticamente

O `MessagePipelineFactory` detecta `projectType: 'mp-my-iablue'` e cria o pipeline customizado automaticamente.

### 3. Testar Comandos

Envie mensagens de teste via webhook:

```
/status
/report mensal
/config
/help
/start
```

## 📝 Logs e Observabilidade

Todos os steps customizados logam automaticamente:

```json
{
  "operation": "pipeline.step.mp_my_iablue.verify_authorized",
  "module": "MpMyIablueVerifyAuthorizedSenderStep",
  "senderId": "5511999999999",
  "clientId": "iablue-123",
  "plan": "premium",
  "durationMs": 45
}
```

```json
{
  "operation": "pipeline.step.mp_my_iablue.check_command",
  "commandName": "status",
  "commandValid": true,
  "durationMs": 12
}
```

```json
{
  "operation": "pipeline.step.mp_my_iablue.generate_ai",
  "isCommand": true,
  "commandName": "status",
  "provider": "openai",
  "model": "gpt-4-turbo",
  "tokensUsed": 150,
  "durationMs": 1200
}
```

## 🧪 Testing

### Unit Tests

Cada step pode ser testado isoladamente:

```typescript
describe('MpMyIablueVerifyAuthorizedSenderStep', () => {
  it('should authorize sender in whitelist', async () => {
    const context = createMockContext({
      message: createMockMessage({ phone: '+5511999999999' }),
      project: {
        settings: {
          authorization: {
            enabled: true,
            whitelist: ['+5511999999999'],
          },
        },
      },
    });

    const result = await step.execute(context);

    expect(result.shouldContinue).toBe(true);
    expect(context.metadata.iablueAuthorization.authorized).toBe(true);
  });
});
```

### Integration Tests

Testar pipeline completo:

```typescript
describe('MP My IABlue Pipeline', () => {
  it('should process command /status successfully', async () => {
    const message = createTextMessage('/status');
    const context = createContext(message, 'mp-my-iablue');

    const pipeline = factory.createPipeline('mp-my-iablue');
    const result = await pipeline.execute(context);

    expect(result.shouldContinue).toBe(true);
    expect(result.context.metadata.aiResponse.text).toContain('Status do Sistema');
  });
});
```

## 📚 Referências

- [Message Pipeline Docs](../../../../docs/funcionalidades/message-pipeline.md)
- [Pipeline Steps](../../steps/)
- [MessagePipelineFactory](../../MessagePipelineFactory.ts)
- [Project Entity](../../../../../../libs/domain/src/entities/Project.ts)

## 🔄 Versionamento

**Versão Atual:** `v1.0.0`

### Changelog

#### v1.0.0 (2024-10-27)
- ✨ Implementação inicial dos 3 steps customizados
- ✨ Comandos: /status, /report, /config, /help, /start
- ✨ Autorização via API IABlue + whitelist
- ✨ System prompt customizado
- 📝 Documentação completa

## 🚧 Roadmap

### Curto Prazo
- [ ] Implementar `IIABlueApiClient` para autorização real
- [ ] Implementar `IMpMyIablueAIService` para respostas AI reais
- [ ] Adicionar cache de autorização (Redis)
- [ ] Implementar geração real de relatórios

### Médio Prazo
- [ ] Adicionar mais comandos (/analytics, /export, /integrations)
- [ ] Implementar webhook callbacks para relatórios assíncronos
- [ ] Adicionar suporte a templates de mensagem
- [ ] Implementar rate limiting específico do IABlue

### Longo Prazo
- [ ] Dashboard admin para gerenciar comandos
- [ ] Analytics de uso de comandos
- [ ] A/B testing de system prompts
- [ ] Multi-idioma (i18n)
