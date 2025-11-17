import { Generated, ColumnType } from 'kysely';

export interface ThreadTable {
  id: Generated<string>;
  account_id: string;
  project_id: string;
  sender_id: string;
  sender_name: string | null;
  sender_phone: string | null;
  channel: string;
  provider: string;
  implementation: string | null;
  external_id: string | null;
  status: string;
  metadata: ColumnType<Record<string, unknown> | null, string | null, string | null>;
  last_message_at: Date | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}
