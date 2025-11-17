/**
 * Configuração para seleção de parser de webhook
 * Usada para resolver qual parser específico usar baseado em:
 * - Provider (ex: WHATICKET, WAHA, NOTIFICAMEHUB)
 * - Channel (ex: WHATSAPP, INSTAGRAM, MERCADOLIVRE)
 * - Implementation (ex: BAILEYS, WHATSMEOW, GOWS, OFFICIAL)
 */
export interface ParserConfig {
  /**
   * Provider do webhook (obrigatório)
   * Ex: WHATICKET, WAHA, NOTIFICAMEHUB
   */
  provider: string;

  /**
   * Canal de comunicação (opcional)
   * Ex: WHATSAPP, INSTAGRAM, MERCADOLIVRE
   */
  channel?: string;

  /**
   * Implementação técnica (opcional)
   * Ex: BAILEYS, WHATSMEOW, GOWS, OFFICIAL
   */
  implementation?: string;
}
