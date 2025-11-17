# Sistema de Mensagens

Parsing e processamento otimizado de mensagens com Strategy Pattern e batch processing. Thread criada uma vez por batch com BatchContext agregado.

## Arquivos Principais

**Parsers & Strategy**: `libs/backend/src/webhooks/IMessageParser.ts`, `ParseResult.ts` (BatchContext), `apps/backend/src/workers/webhooks/parsers/messages/base/base-message-parser.ts`

**Factory**: `apps/backend/src/workers/webhooks/parsers/messages/message-parser-factory.service.ts`

**Implementações**: `apps/backend/src/workers/webhooks/parsers/messages/protocols/whaticket-whatsapp-official-message.parser.ts`

**Pipeline Processor**: `apps/backend/src/workers/messages/message-pipeline.processor.ts` (batch optimized)

**Domain**: `libs/domain/src/types/MessageProtocol.ts`, `MessageContext.ts`, `MessageContents.ts`, `MessageMetadata.ts`

**Repository**: `libs/app-database/src/repositories/ThreadRepository.ts` (findOrCreate com external_id)

## Fluxo Otimizado

1. Webhook → WebhookParser → ParsedWebhookData
2. MessageParser (Strategy) → ParseResult com BatchContext (provider, channel, senderId, threadIdentifier)
3. MessagePipelineProcessor → Thread criada UMA VEZ, loop interno processa MessageContext[]

## Tipos Suportados

12 tipos de mensagem: TEXT, AUDIO, VIDEO, IMAGE, DOCUMENT, CONTACT, LOCATION, STICKER, INTERACTIVE, TEMPLATE, REACTION, SYSTEM

## Otimizações

- BatchContext: sender/thread extraído uma vez
- Thread lookup por external_id (ticket UUID)
- Project/pipeline criados uma vez por batch
- Um payload = uma thread = um sender
