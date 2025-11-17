# Gateway de Webhooks

## Descrição
Sistema de recepção de webhooks via UUID codificado. Processa eventos de chat e pagamento de forma assíncrona com persistência e filas.

**Seleção de Parsers:** Utiliza composite key (`provider-channel-implementation`) com fallback hierárquico. Parsers não encontrados não quebram o sistema (warning log apenas).

---

## Estratégia de Parser Selection

### Composite Key
Cada webhook é processado por um parser específico baseado na combinação:
- **Provider** (ex: WHATICKET, WAHA, NOTIFICAMEHUB)
- **Channel** (ex: WHATSAPP, INSTAGRAM, MERCADOLIVRE)
- **Implementation** (ex: BAILEYS, WHATSMEOW, GOWS, OFFICIAL)

### Hierarquia de Resolução
1. **Específico**: `${provider}-${channel}-${implementation}` (ex: `whaticket-whatsapp-baileys`)
2. **Fallback**: `${provider}` (ex: `WHATICKET`)
3. **Não encontrado**: `null` + warning log (continua processamento)

### Combinações Suportadas

**Whaticket:**
- `whatsapp-baileys`
- `whatsapp-whatsmeow`
- `whatsapp-official`
- `instagram-official`

**Waha:**
- `whatsapp-baileys`
- `whatsapp-gows`

**NotificameHub:**
- `whatsapp-baileys`
- `mercadolivre-official`

---

## Parsers Registrados

Total: **13 parsers** (10 específicos + 3 fallbacks)

| Chave | Parser | Tipo |
|-------|--------|------|
| `whaticket-whatsapp-baileys` | WhaticketWhatsappBaileysParser | Específico |
| `whaticket-whatsapp-whatsmeow` | WhaticketWhatsappWhatsMeowParser | Específico |
| `whaticket-whatsapp-official` | WhaticketWhatsappOfficialParser | Específico |
| `whaticket-instagram-official` | WhaticketInstagramOfficialParser | Específico |
| `WHATICKET` | WhaticketWhatsappBaileysParser | Fallback |
| `waha-whatsapp-baileys` | WahaWhatsappBaileysParser | Específico |
| `waha-whatsapp-gows` | WahaWhatsappGowsParser | Específico |
| `WAHA` | WahaWhatsappBaileysParser | Fallback |
| `notificamehub-whatsapp-baileys` | NotificamehubWhatsappBaileysParser | Específico |
| `notificamehub-mercadolivre-official` | NotificamehubMercadolivreOfficialParser | Específico |
| `NOTIFICAMEHUB` | NotificamehubWhatsappBaileysParser | Fallback |

---

## Exemplos de Uso

### Exemplo 1: Parser Específico Encontrado
```json
UUID decodificado: {
  "provider": "WHATICKET",
  "channel": "WHATSAPP",
  "implementation": "BAILEYS"
}

Resolução:
1. ✅ Tenta: "whaticket-whatsapp-baileys" → ENCONTRADO!

Resultado: WhaticketWhatsappBaileysParser executado
```

### Exemplo 2: Parser Não Encontrado (Usa Fallback)
```json
UUID decodificado: {
  "provider": "WHATICKET",
  "channel": "WHATSAPP",
  "implementation": "NOVA_IMPL"
}

Resolução:
1. ❌ Tenta: "whaticket-whatsapp-nova_impl" → NÃO encontrado
2. ✅ Tenta: "WHATICKET" → ENCONTRADO (fallback)

Resultado: WhaticketWhatsappBaileysParser executado (fallback)
```

### Exemplo 3: Nenhum Parser (Warning Log)
```json
UUID decodificado: {
  "provider": "CUSTOM_PROVIDER",
  "channel": "SMS",
  "implementation": "TWILIO"
}

Resolução:
1. ❌ Tenta: "custom_provider-sms-twilio" → NÃO encontrado
2. ❌ Tenta: "CUSTOM_PROVIDER" → NÃO encontrado

Resultado:
⚠️ Warning: "No parser found for webhook config, proceeding without parsing"
✅ Continua processamento (eventName=null, queueName=null, metadata=null)
```

---

## Arquivos Principais

### Types
- `apps/backend/src/api/modules/webhooks/types/ParserConfig.ts`

### Commands
- `apps/backend/src/api/modules/webhooks/commands/ProcessWebhookCommand.ts`

### Handlers
- `apps/backend/src/api/modules/webhooks/commands/handlers/ProcessWebhookCommandHandler.ts`
- `apps/backend/src/api/modules/webhooks/events/handlers/WebhookReceivedEventHandler.ts`

### Services
- `apps/backend/src/api/modules/webhooks/webhooks.service.ts`
- `apps/backend/src/api/modules/webhooks/services/webhook-gateway.service.ts`
- `apps/backend/src/api/modules/webhooks/services/webhook-parser-factory.service.ts`

### Parsers
- `apps/backend/src/api/modules/webhooks/parsers/base/base-webhook-parser.ts`
- `apps/backend/src/api/modules/webhooks/parsers/protocols/whaticket-whatsapp-baileys.parser.ts`
- `apps/backend/src/api/modules/webhooks/parsers/protocols/whaticket-whatsapp-whatsmeow.parser.ts`
- `apps/backend/src/api/modules/webhooks/parsers/protocols/whaticket-whatsapp-official.parser.ts`
- `apps/backend/src/api/modules/webhooks/parsers/protocols/whaticket-instagram-official.parser.ts`
- `apps/backend/src/api/modules/webhooks/parsers/protocols/waha-whatsapp-baileys.parser.ts`
- `apps/backend/src/api/modules/webhooks/parsers/protocols/waha-whatsapp-gows.parser.ts`
- `apps/backend/src/api/modules/webhooks/parsers/protocols/notificamehub-whatsapp-baileys.parser.ts`
- `apps/backend/src/api/modules/webhooks/parsers/protocols/notificamehub-mercadolivre-official.parser.ts`

### Events
- `apps/backend/src/api/modules/webhooks/events/WebhookReceivedEvent.ts`

### Endpoints
- `POST /api/v1/gateway/:uuid` → `apps/backend/src/api/modules/webhooks/webhooks.controller.ts`

### Repository
- `libs/app-database/src/repositories/WebhookEventRepository.ts`
- `libs/app-database/src/interfaces/IWebhookEventRepository.ts`

### Domain
- `libs/domain/src/entities/WebhookEvent.ts`
- `libs/domain/src/enums/WebhookType.ts`
- `libs/domain/src/enums/WebhookStatus.ts`
- `libs/domain/src/enums/ChatChannel.ts`
- `libs/domain/src/enums/ChatProvider.ts`
- `libs/domain/src/enums/ChatImplementation.ts`
- `libs/domain/src/enums/PaymentProvider.ts`

### Database
- `libs/app-database/migrations/20241027001_create_webhook_events_table.js`
