import { MessageDirection } from '../enums/MessageDirection';
import { MessageStatus } from '../enums/MessageStatus';
import { MessageType } from '../enums/MessageType';
import {
  AudioContent,
  ContactContent,
  DocumentContent,
  ImageContent,
  InteractiveContent,
  LocationContent,
  MessageContent,
  ReactionContent,
  StickerContent,
  SystemContent,
  TemplateContent,
  TextContent,
  VideoContent,
} from './MessageContents';
import { MessageMetadata } from './MessageMetadata';

/**
 * Internal Message Protocol
 *
 * This is the core message structure used throughout the system.
 * All messages, regardless of provider, are normalized to this format.
 *
 * Based on industry standards:
 * - WhatsApp Business API
 * - Chatwoot Message Format
 * - Common messaging patterns
 */

/**
 * Base Message structure (envelope)
 *
 * All messages share this common structure with type-specific content
 */
export interface Message<T extends MessageContent = MessageContent> {
  /** Unique message identifier (UUID) */
  id: string;

  /** Type of message (determines content structure) */
  type: MessageType;

  /** Direction of message flow */
  direction: MessageDirection;

  /** Message creation timestamp */
  timestamp: Date;

  /** Message content (type-specific payload) */
  content: T;

  /** Message metadata (sender, receiver, context, provider info) */
  metadata: MessageMetadata;

  /** Message delivery status (optional) */
  status?: MessageStatus;

  /** Message last updated timestamp (for status changes) */
  updatedAt?: Date;
}

// ==================== Type-Safe Message Variants ====================

/**
 * Type-safe message variants for each MessageType
 * Ensures content matches the declared type
 */

export type TextMessage = Message<TextContent> & { type: MessageType.TEXT };
export type AudioMessage = Message<AudioContent> & { type: MessageType.AUDIO };
export type VideoMessage = Message<VideoContent> & { type: MessageType.VIDEO };
export type ImageMessage = Message<ImageContent> & { type: MessageType.IMAGE };
export type DocumentMessage = Message<DocumentContent> & { type: MessageType.DOCUMENT };
export type StickerMessage = Message<StickerContent> & { type: MessageType.STICKER };
export type ContactMessage = Message<ContactContent> & { type: MessageType.CONTACT };
export type LocationMessage = Message<LocationContent> & { type: MessageType.LOCATION };
export type InteractiveMessage = Message<InteractiveContent> & { type: MessageType.INTERACTIVE };
export type TemplateMessage = Message<TemplateContent> & { type: MessageType.TEMPLATE };
export type ReactionMessage = Message<ReactionContent> & { type: MessageType.REACTION };
export type SystemMessage = Message<SystemContent> & { type: MessageType.SYSTEM };

/**
 * Union type of all type-safe message variants
 */
export type TypedMessage =
  | TextMessage
  | AudioMessage
  | VideoMessage
  | ImageMessage
  | DocumentMessage
  | StickerMessage
  | ContactMessage
  | LocationMessage
  | InteractiveMessage
  | TemplateMessage
  | ReactionMessage
  | SystemMessage;

// ==================== Helper Types ====================

/**
 * Message creation payload (without system-generated fields)
 */
export type CreateMessagePayload<T extends MessageContent = MessageContent> = Omit<
  Message<T>,
  'id' | 'timestamp' | 'updatedAt'
>;

/**
 * Message update payload (only updatable fields)
 */
export interface UpdateMessagePayload {
  status?: MessageStatus;
  metadata?: Partial<MessageMetadata>;
}
