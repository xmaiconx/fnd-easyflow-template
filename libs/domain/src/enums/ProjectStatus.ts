/**
 * Project Status
 *
 * Represents the lifecycle state of a project/bot configuration.
 */
export enum ProjectStatus {
  /**
   * Project is active and processing messages
   */
  ACTIVE = 'active',

  /**
   * Project is in testing mode (may have restricted access)
   */
  TESTING = 'testing',

  /**
   * Project is inactive (paused, not processing messages)
   */
  INACTIVE = 'inactive',

  /**
   * Project is archived (soft deleted, can be restored)
   */
  ARCHIVED = 'archived',
}
