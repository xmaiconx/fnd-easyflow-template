import { Workspace } from '@agentics/domain';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from '@agentics/api-contracts';

export interface IWorkspaceRepository {
  create(dto: CreateWorkspaceDto): Promise<Workspace>;
  findById(id: string): Promise<Workspace | null>;
  findByAccountId(accountId: string): Promise<Workspace[]>;
  update(id: string, dto: UpdateWorkspaceDto): Promise<Workspace>;
  archive(id: string, reason?: string): Promise<Workspace>;
  restore(id: string): Promise<Workspace>;
  delete(id: string): Promise<void>;
}
