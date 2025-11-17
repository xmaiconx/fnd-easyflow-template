/**
 * Message types supported by the internal messaging protocol
 *
 * Based on industry standards:
 * - WhatsApp Business API
 * - Chatwoot Message Format
 * - Common messaging patterns
 */
export enum MessageType {
  /** Simple text message */
  TEXT = 'TEXT',

  /** Audio message (voice note, audio file) */
  AUDIO = 'AUDIO',

  /** Video message */
  VIDEO = 'VIDEO',

  /** Image message */
  IMAGE = 'IMAGE',

  /** Document/File message (PDF, DOC, XLS, etc.) */
  DOCUMENT = 'DOCUMENT',

  /** Contact card (vCard) */
  CONTACT = 'CONTACT',

  /** Geographic location */
  LOCATION = 'LOCATION',

  /** Sticker/Figurinha */
  STICKER = 'STICKER',

  /** Interactive message (buttons, lists) - WhatsApp */
  INTERACTIVE = 'INTERACTIVE',

  /** WhatsApp Business template message */
  TEMPLATE = 'TEMPLATE',

  /** Reaction to another message (emoji) */
  REACTION = 'REACTION',

  /** System message (notifications, events) */
  SYSTEM = 'SYSTEM',
}
