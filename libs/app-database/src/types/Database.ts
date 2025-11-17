import { AccountTable } from './AccountTable';
import { WorkspaceTable } from './WorkspaceTable';
import { WorkspaceUserTable } from './WorkspaceUserTable';
import { UserTable } from './UserTable';
import { AuditLogTable } from './AuditLogTable';
import { WebhookEventTable } from './WebhookEventTable';
import { ThreadTable } from './ThreadTable';
import { MessageTable } from './MessageTable';
import { ProjectTable } from './ProjectTable';

export interface Database {
  accounts: AccountTable;
  workspaces: WorkspaceTable;
  workspace_users: WorkspaceUserTable;
  users: UserTable;
  audit_logs: AuditLogTable;
  webhook_events: WebhookEventTable;
  threads: ThreadTable;
  messages: MessageTable;
  projects: ProjectTable;
}
