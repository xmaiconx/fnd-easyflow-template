import { WorkspaceUser } from '@agentics/domain';
import { AddUserToWorkspaceDto, UpdateWorkspaceUserRoleDto } from '@agentics/api-contracts';

export interface IWorkspaceUserRepository {
  addUserToWorkspace(dto: AddUserToWorkspaceDto): Promise<WorkspaceUser>;
  findByWorkspaceId(workspaceId: string): Promise<WorkspaceUser[]>;
  findByUserId(userId: string): Promise<WorkspaceUser[]>;
  findByWorkspaceAndUser(workspaceId: string, userId: string): Promise<WorkspaceUser | null>;
  updateRole(workspaceId: string, userId: string, dto: UpdateWorkspaceUserRoleDto): Promise<WorkspaceUser>;
  removeUserFromWorkspace(workspaceId: string, userId: string): Promise<void>;
}
