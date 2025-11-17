/**
 * Types of interactive messages (WhatsApp)
 *
 * BUTTON: Up to 3 quick reply buttons
 * LIST: Up to 10 items in a list/menu
 */
export enum InteractiveType {
  /** Quick reply buttons (max 3) */
  BUTTON = 'BUTTON',

  /** List/Menu with multiple options (max 10) */
  LIST = 'LIST',
}
