import { Generated } from 'kysely';

export interface UserTable {
  id: Generated<string>;
  account_id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: string;
  email_verified: boolean;
  email_verification_token: string | null;
  email_verification_token_expiry: Date | null;
  status: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}