import { MessageContext } from './MessageContext';

/**
 * Pipeline Step Result
 *
 * Returned by each step to control pipeline flow.
 *
 * Based on middleware patterns from:
 * - Express.js (next() vs response termination)
 * - Chain of Responsibility (pass or handle)
 * - ASP.NET Core Pipeline (next() or short-circuit)
 */
export interface PipelineResult {
  /**
   * Whether the pipeline should continue to the next step
   *
   * - true: Continue to next step
   * - false: Stop pipeline execution (short-circuit)
   */
  shouldContinue: boolean;

  /**
   * Updated context (enriched or modified by the step)
   *
   * The context is propagated through the pipeline.
   * Each step can add data to context.metadata for downstream steps.
   */
  context: MessageContext;

  /**
   * Optional reason for stopping the pipeline
   *
   * Examples:
   * - "Project is not active"
   * - "Sender not authorized"
   * - "Message is a duplicate"
   * - "Rate limit exceeded"
   */
  reason?: string;

  /**
   * Optional metadata about the step execution
   *
   * Can include performance metrics, warnings, etc.
   */
  stepMetadata?: Record<string, any>;
}

/**
 * Helper type for steps that always continue
 */
export type ContinuePipelineResult = PipelineResult & { shouldContinue: true };

/**
 * Helper type for steps that stop the pipeline
 */
export type StopPipelineResult = PipelineResult & {
  shouldContinue: false;
  reason: string;
};
