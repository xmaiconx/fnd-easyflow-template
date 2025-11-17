import { InteractiveType } from '../enums/InteractiveType';
import {
  AudioMediaObject,
  DocumentMediaObject,
  ImageMediaObject,
  MediaObject,
  StickerMediaObject,
  VideoMediaObject,
} from './MediaObject';

/**
 * Message Content Types
 *
 * Each MessageType has its own specific content structure.
 * These interfaces define the payload for each message type.
 */

// ==================== TEXT ====================

/**
 * Simple text message content
 */
export interface TextContent {
  /** The text message content */
  text: string;

  /** Enable URL preview (WhatsApp) */
  previewUrls?: boolean;
}

// ==================== AUDIO ====================

/**
 * Audio message content (voice note, audio file)
 */
export type AudioContent = AudioMediaObject;

// ==================== VIDEO ====================

/**
 * Video message content
 */
export type VideoContent = VideoMediaObject;

// ==================== IMAGE ====================

/**
 * Image message content
 */
export type ImageContent = ImageMediaObject;

// ==================== DOCUMENT ====================

/**
 * Document/File message content
 */
export type DocumentContent = DocumentMediaObject;

// ==================== STICKER ====================

/**
 * Sticker message content
 */
export type StickerContent = StickerMediaObject;

// ==================== CONTACT ====================

/**
 * Contact card (vCard) content
 */
export interface ContactContent {
  /** Array of contacts (can contain multiple contacts) */
  contacts: Contact[];
}

/**
 * Individual contact information (vCard format)
 */
export interface Contact {
  /** Contact name */
  name: {
    /** Formatted full name */
    formatted: string;
    /** First name */
    first?: string;
    /** Last name */
    last?: string;
    /** Middle name */
    middle?: string;
    /** Name suffix */
    suffix?: string;
    /** Name prefix */
    prefix?: string;
  };

  /** Phone numbers */
  phones?: Array<{
    /** Phone number */
    phone: string;
    /** Phone type (CELL, HOME, WORK, etc.) */
    type?: string;
    /** WhatsApp ID (if available) */
    wa_id?: string;
  }>;

  /** Email addresses */
  emails?: Array<{
    /** Email address */
    email: string;
    /** Email type (HOME, WORK, etc.) */
    type?: string;
  }>;

  /** Organization info */
  org?: {
    /** Company name */
    company?: string;
    /** Department */
    department?: string;
    /** Job title */
    title?: string;
  };

  /** URLs */
  urls?: Array<{
    /** URL */
    url: string;
    /** URL type (HOME, WORK, etc.) */
    type?: string;
  }>;

  /** Addresses */
  addresses?: Array<{
    /** Street address */
    street?: string;
    /** City */
    city?: string;
    /** State/Province */
    state?: string;
    /** ZIP/Postal code */
    zip?: string;
    /** Country */
    country?: string;
    /** Country code */
    country_code?: string;
    /** Address type (HOME, WORK, etc.) */
    type?: string;
  }>;

  /** Birthday (ISO date string) */
  birthday?: string;
}

// ==================== LOCATION ====================

/**
 * Geographic location content
 */
export interface LocationContent {
  /** Latitude coordinate */
  latitude: number;

  /** Longitude coordinate */
  longitude: number;

  /** Location name (e.g., "Eiffel Tower") */
  name?: string;

  /** Formatted address */
  address?: string;

  /** URL to location (e.g., Google Maps link) */
  url?: string;
}

// ==================== INTERACTIVE ====================

/**
 * Interactive message content (WhatsApp buttons/lists)
 */
export interface InteractiveContent {
  /** Type of interactive message */
  interactiveType: InteractiveType;

  /** Message body */
  body: {
    text: string;
  };

  /** Optional header */
  header?: {
    type: 'text' | 'image' | 'video' | 'document';
    text?: string;
    media?: MediaObject;
  };

  /** Optional footer */
  footer?: {
    text: string;
  };

  /** Action (buttons or list) */
  action: ButtonAction | ListAction;
}

/**
 * Button action (up to 3 buttons)
 */
export interface ButtonAction {
  type: 'button';
  buttons: Array<{
    type: 'reply';
    reply: {
      id: string;
      title: string;
    };
  }>;
}

/**
 * List action (up to 10 items)
 */
export interface ListAction {
  type: 'list';
  button: string;
  sections: Array<{
    title?: string;
    rows: Array<{
      id: string;
      title: string;
      description?: string;
    }>;
  }>;
}

// ==================== TEMPLATE ====================

/**
 * WhatsApp Business template message content
 */
export interface TemplateContent {
  /** Template name (registered in WhatsApp Business Manager) */
  name: string;

  /** Template language code (e.g., 'en_US', 'pt_BR') */
  language: {
    code: string;
  };

  /** Template components (header, body, buttons) */
  components?: Array<{
    type: 'header' | 'body' | 'button';
    parameters?: Array<{
      type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video';
      text?: string;
      currency?: {
        fallback_value: string;
        code: string;
        amount_1000: number;
      };
      date_time?: {
        fallback_value: string;
      };
      image?: MediaObject;
      document?: MediaObject;
      video?: MediaObject;
    }>;
    sub_type?: 'quick_reply' | 'url';
    index?: number;
  }>;
}

// ==================== REACTION ====================

/**
 * Reaction to another message
 */
export interface ReactionContent {
  /** ID of the message being reacted to */
  messageId: string;

  /** Emoji reaction (e.g., '👍', '❤️', '') */
  emoji: string;
}

// ==================== SYSTEM ====================

/**
 * System message content (notifications, events)
 */
export interface SystemContent {
  /** Type of system message */
  systemType:
    | 'user_joined'
    | 'user_left'
    | 'group_created'
    | 'group_name_changed'
    | 'group_icon_changed'
    | 'conversation_assigned'
    | 'conversation_resolved'
    | 'conversation_reopened'
    | string;

  /** Message text */
  text: string;

  /** Additional data (system-specific) */
  data?: Record<string, any>;
}

// ==================== UNION TYPE ====================

/**
 * Union of all message content types
 * Used in the base Message interface
 */
export type MessageContent =
  | TextContent
  | AudioContent
  | VideoContent
  | ImageContent
  | DocumentContent
  | StickerContent
  | ContactContent
  | LocationContent
  | InteractiveContent
  | TemplateContent
  | ReactionContent
  | SystemContent;
