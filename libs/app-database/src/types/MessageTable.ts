import { Generated, ColumnType } from 'kysely';

export interface MessageTable {
  id: Generated<string>;
  account_id: string;
  project_id: string;
  thread_id: string;
  webhook_event_id: string | null;

  // Message protocol fields
  type: string;
  direction: string;
  role: string | null;
  status: string | null;

  // Sender information
  sender_id: string;
  sender_name: string | null;
  sender_phone: string | null;

  // Receiver information
  receiver_id: string | null;
  receiver_name: string | null;

  // Message content (JSONB)
  content: ColumnType<unknown, string, string>;

  // Rich metadata (JSONB)
  metadata: ColumnType<Record<string, unknown> | null, string | null, string | null>;

  // External references
  external_id: string | null;
  channel: string;
  provider: string;
  implementation: string | null;

  // Timestamps
  message_timestamp: Date;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}
