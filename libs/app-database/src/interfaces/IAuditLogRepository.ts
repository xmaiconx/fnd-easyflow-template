import { AuditLog } from '@agentics/domain';
import { CreateAuditLogDto, QueryAuditLogsDto } from '@agentics/api-contracts';

export interface IAuditLogRepository {
  create(dto: CreateAuditLogDto): Promise<AuditLog>;
  findById(id: string): Promise<AuditLog | null>;
  findByFilters(query: QueryAuditLogsDto): Promise<AuditLog[]>;
  countByFilters(query: QueryAuditLogsDto): Promise<number>;
}
