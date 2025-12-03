import { AuditLog } from '@agentics/domain';

export class CreateAuditLogCommand {
  constructor(public readonly data: Omit<AuditLog, 'id' | 'createdAt'>) {}
}
