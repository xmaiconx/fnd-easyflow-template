/**
 * Webhook Parsers - Worker Layer
 *
 * Parsers transformam payload raw de webhooks em estrutura tipada (ParsedWebhookData).
 * Cada parser é específico para um provider/channel/implementation.
 */

export { WhaticketWhatsappBaileysParser } from './whaticket-whatsapp-baileys.parser';
export { WhaticketWhatsappWhatsMeowParser } from './whaticket-whatsapp-whatsmeow.parser';
export { WhaticketWhatsappOfficialParser } from './whaticket-whatsapp-official.parser';
export { WhaticketInstagramOfficialParser } from './whaticket-instagram-official.parser';
export { WahaWhatsappBaileysParser } from './waha-whatsapp-baileys.parser';
export { WahaWhatsappGowsParser } from './waha-whatsapp-gows.parser';
export { NotificamehubWhatsappBaileysParser } from './notificamehub-whatsapp-baileys.parser';
export { NotificamehubMercadolivreOfficialParser } from './notificamehub-mercadolivre-official.parser';
