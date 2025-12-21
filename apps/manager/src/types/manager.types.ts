// Manager Types - Mirrored from Backend DTOs

export interface UserListItem {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'inactive';
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserDetails extends UserListItem {
  accountId: string;
  workspaces: Array<{ id: string; name: string }>;
  activeSessions: Array<{
    id: string;
    deviceName?: string;
    ipAddress: string;
    lastActivityAt: string;
  }>;
}

export interface ListUsersDto {
  search?: string;
  status?: 'active' | 'inactive';
  page?: number;
  limit?: number;
}

export interface UpdateUserStatusDto {
  status: 'active' | 'inactive';
}

export interface ImpersonateDto {
  targetUserId: string;
  reason: string;
}

export interface ImpersonateResponse {
  accessToken: string;
  expiresAt: string;
  targetUser: {
    id: string;
    email: string;
    name: string;
  };
}

export interface Metrics {
  totalUsers: number;
  activeUsers: number;
  lockedAccounts: number;
  recentSignups: number;
  recentLogins: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface SignInResponse {
  user: AuthUser;
  accessToken: string;
}
