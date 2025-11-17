import { ChatChannel } from '../enums/ChatChannel';
import { ChatImplementation } from '../enums/ChatImplementation';
import { ChatProvider } from '../enums/ChatProvider';

/**
 * Message Metadata
 *
 * Contains all contextual information about the message:
 * - Sender and receiver information
 * - Multi-tenancy (accountId)
 * - Conversation context
 * - Provider and channel information
 * - External IDs for traceability
 * - Additional metadata (labels, privacy, errors)
 */
export interface MessageMetadata {
  // ==================== Sender & Receiver ====================

  /** Message sender information */
  from: MessageParticipant;

  /** Message receiver information */
  to: MessageParticipant;

  // ==================== Context ====================

  /** Account ID for multi-tenancy isolation */
  accountId: string;

  /** Associated conversation ID (if part of a conversation) */
  conversationId?: string;

  /** ID of the message being replied to (for threaded messages) */
  replyTo?: string;

  /** ID of the message being forwarded from */
  forwardedFrom?: string;

  // ==================== Provider Info ====================

  /** Communication channel */
  channel: ChatChannel;

  /** Chat provider (Chatwoot, WAHA, etc.) */
  provider: ChatProvider;

  /** Provider implementation (Baileys, WhatsApp Cloud, etc.) */
  implementation?: ChatImplementation;

  // ==================== External IDs ====================

  /** External ID from the provider (for traceability) */
  externalId?: string;

  /** WhatsApp Message ID (wamid) */
  wamid?: string;

  /** Ticket ID (for helpdesk integration) */
  ticketId?: string;

  /** Contact ID (for CRM integration) */
  contactId?: string;

  // ==================== Additional ====================

  /** Message labels/tags for categorization */
  labels?: string[];

  /** Private message (only visible to agents, not end user) */
  private?: boolean;

  /** Error details (if message failed) */
  error?: MessageError;

  /** Custom metadata (provider-specific or app-specific) */
  custom?: Record<string, any>;
}

/**
 * Message participant (sender or receiver)
 */
export interface MessageParticipant {
  /** Unique identifier */
  id: string;

  /** Display name */
  name?: string;

  /** Phone number (for WhatsApp, SMS) */
  phone?: string;

  /** Email address */
  email?: string;

  /** Avatar URL */
  avatarUrl?: string;

  /** Additional attributes */
  attributes?: Record<string, any>;
}

/**
 * Error information for failed messages
 */
export interface MessageError {
  /** Error code (provider-specific or internal) */
  code: string;

  /** Human-readable error message */
  message: string;

  /** Detailed error information */
  details?: Record<string, any>;

  /** Timestamp when error occurred */
  timestamp?: Date;
}
