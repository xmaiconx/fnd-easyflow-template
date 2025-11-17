/**
 * Project Pipeline Configuration
 *
 * Defines the message processing pipeline for a specific project.
 * Each project can have a custom pipeline with different steps.
 */
export interface ProjectPipelineConfig {
  /**
   * Unique identifier for this pipeline configuration
   */
  id: string;

  /**
   * Project this configuration belongs to
   */
  projectId: string;

  /**
   * Pipeline name/identifier (e.g., "mercado-phone-v1", "law-office-default")
   */
  pipelineName: string;

  /**
   * Ordered list of steps to execute
   *
   * Steps are executed in array order.
   * Each step can be configured with custom parameters.
   */
  steps: PipelineStepConfig[];

  /**
   * Whether this pipeline is active
   */
  isActive: boolean;

  /**
   * Version of the pipeline (for migration tracking)
   */
  version: number;

  /**
   * Optional metadata/settings
   */
  metadata?: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Individual Pipeline Step Configuration
 */
export interface PipelineStepConfig {
  /**
   * Step name (must match registered step in PipelineStepRegistry)
   */
  name: string;

  /**
   * Execution order (lower = earlier)
   */
  order: number;

  /**
   * Whether this step is enabled
   */
  enabled: boolean;

  /**
   * Step-specific configuration
   *
   * Examples:
   * - { maxBufferTime: 5000 } for BufferMessagesStep
   * - { allowedCommands: ['/novo', '/help'] } for CheckCommandStep
   * - { transcriptionService: 'whisper' } for ConvertMediaToTextStep
   */
  config?: Record<string, any>;
}
