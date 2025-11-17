/**
 * Status of message delivery and acknowledgment
 *
 * Lifecycle: PENDING → SENT → DELIVERED → READ
 * Error state: FAILED
 */
export enum MessageStatus {
  /** Message is queued, not yet sent */
  PENDING = 'PENDING',

  /** Message was sent to the provider */
  SENT = 'SENT',

  /** Message was delivered to recipient's device */
  DELIVERED = 'DELIVERED',

  /** Message was read/seen by recipient */
  READ = 'READ',

  /** Message failed to send or deliver */
  FAILED = 'FAILED',
}
