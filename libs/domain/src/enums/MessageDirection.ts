/**
 * Direction of the message flow
 *
 * INCOMING: Messages received from end users
 * OUTGOING: Messages sent by agents/system
 */
export enum MessageDirection {
  /** Message received from end user */
  INCOMING = 'INCOMING',

  /** Message sent by agent or system */
  OUTGOING = 'OUTGOING',
}
