import { TypedMessage } from './MessageProtocol';

/**
 * Message Processing Context
 *
 * Shared context object that flows through the entire pipeline.
 * Each step can read from and write to this context to share state.
 *
 * Based on middleware patterns from:
 * - Express.js (req/res context)
 * - ASP.NET Core (HttpContext)
 * - NestJS (ExecutionContext)
 */
export interface MessageContext {
  /**
   * The normalized message being processed
   */
  message: TypedMessage;

  /**
   * Account ID for multi-tenancy
   */
  accountId: string;

  /**
   * Project/Workspace ID (optional, for project-specific processing)
   */
  projectId?: string;

  /**
   * Conversation/Thread ID (for message buffering)
   */
  threadId?: string;

  /**
   * Metadata bag for storing arbitrary data between steps
   *
   * Examples:
   * - conversationHistory: Message[]
   * - senderAuthorization: { authorized: boolean, companyId: string }
   * - command: { isCommand: boolean, commandName: string, args: string[] }
   * - bufferedMessages: Message[]
   * - transcriptions: { messageId: string, text: string }[]
   * - aiResponse: { text: string, metadata: any }
   */
  metadata: Record<string, any>;

  /**
   * Original webhook event ID (for tracing)
   */
  webhookEventId?: string;

  /**
   * Timestamp when processing started
   */
  startedAt: Date;

  /**
   * Step execution history (for debugging and observability)
   */
  executionHistory: StepExecution[];
}

/**
 * Record of a step execution
 */
export interface StepExecution {
  /** Step name/identifier */
  stepName: string;

  /** When the step started */
  startedAt: Date;

  /** When the step completed */
  completedAt: Date;

  /** Duration in milliseconds */
  durationMs: number;

  /** Whether the step decided to continue */
  continued: boolean;

  /** Optional reason for stopping */
  stopReason?: string;

  /** Any errors that occurred */
  error?: string;
}
