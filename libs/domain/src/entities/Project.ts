import { ProjectStatus } from '../enums/ProjectStatus';

/**
 * Project Entity
 *
 * Represents a bot/agent project configuration.
 * Each project has its own message processing pipeline and settings.
 *
 * Examples:
 * - "Mercado Phone" project
 * - "Law Office Bot" project
 * - "Customer Support Agent" project
 */
export interface Project {
  /** Unique identifier */
  id: string;

  /** Account this project belongs to (multi-tenant) */
  accountId: string;

  /** Workspace this project belongs to (optional) */
  workspaceId?: string;

  /** Project name */
  name: string;

  /** Project description */
  description?: string;

  /** Project status (active, testing, inactive, archived) */
  status: ProjectStatus;

  /**
   * Project type/template identifier
   *
   * Used to determine default pipeline configuration.
   * Examples: "mercado-phone", "law-office", "customer-support"
   */
  projectType?: string;

  /**
   * Pipeline configuration name
   *
   * References which pipeline to use for this project.
   * If null, uses default pipeline for projectType.
   */
  pipelineName?: string;

  /**
   * Project-specific settings
   *
   * Can include:
   * - AI model configuration (model, temperature, system prompt)
   * - Authorization rules (allowed senders, rate limits)
   * - Testing configuration (test mode, tester phone numbers)
   * - Command configuration (allowed commands, command prefix)
   * - Buffer configuration (max buffer time, max messages)
   * - Media processing (transcription service, image analysis)
   */
  settings?: ProjectSettings;

  /** When project was created */
  createdAt: Date;

  /** When project was last updated */
  updatedAt: Date;

  /** When project was last used (last message processed) */
  lastUsedAt?: Date;
}

/**
 * Project Settings
 *
 * Configuration specific to each project type
 */
export interface ProjectSettings {
  /** AI configuration */
  ai?: {
    provider?: string; // "openai", "anthropic", "custom"
    model?: string; // "gpt-4", "claude-3-opus", etc.
    temperature?: number;
    systemPrompt?: string;
    maxTokens?: number;
  };

  /** Testing mode configuration */
  testing?: {
    enabled?: boolean;
    allowedTesters?: string[]; // phone numbers or user IDs
    testModeMessage?: string; // message shown to non-testers
  };

  /** Authorization rules */
  authorization?: {
    enabled?: boolean;
    allowedSenders?: string[]; // whitelist
    blockedSenders?: string[]; // blacklist
    requireVerification?: boolean;
    externalAuthUrl?: string; // URL to check authorization (Mercado Phone case)
  };

  /** Command configuration */
  commands?: {
    enabled?: boolean;
    prefix?: string; // default: "/"
    allowedCommands?: string[]; // ["/novo", "/help", "/cancel"]
  };

  /** Message buffer configuration */
  buffer?: {
    enabled?: boolean;
    timeoutMs?: number; // Timeout in ms to wait for more messages (0 = immediate, 30000 = 30s default)
    maxMessages?: number; // Max messages to buffer (safety limit)
    useDualPipeline?: boolean; // Use separate PRE_BUFFER and POST_BUFFER pipelines (default: true)
  };

  /** Media processing */
  media?: {
    transcriptionEnabled?: boolean;
    transcriptionService?: string; // "whisper", "google-speech", etc.
    imageAnalysisEnabled?: boolean;
    videoAnalysisEnabled?: boolean;
  };

  /** Rate limiting */
  rateLimit?: {
    enabled?: boolean;
    maxMessagesPerMinute?: number;
    maxMessagesPerHour?: number;
  };

  /** Arbitrary custom settings */
  [key: string]: any;
}
