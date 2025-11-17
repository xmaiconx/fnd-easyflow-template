import { CreateAuditLogDto } from '@agentics/api-contracts';

export class CreateAuditLogCommand {
  constructor(public readonly dto: CreateAuditLogDto) {}
}
