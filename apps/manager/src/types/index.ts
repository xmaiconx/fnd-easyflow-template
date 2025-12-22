// Mirror backend DTOs
// Date -> string (JSON serialization)
// Enum -> union type (no backend import)

export type EntityStatus = 'active' | 'inactive' | 'deleted'
export type UserRole = 'owner' | 'admin' | 'member'

// Auth DTOs
export interface LoginDto {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface User {
  id: string
  email: string
  fullName: string
  accountId: string
  emailVerified: boolean
}

// Manager DTOs
export interface UserListItem {
  id: string
  email: string
  name: string
  status: EntityStatus
  emailVerified: boolean
  createdAt: string
  lastLoginAt: string | null
}

export interface Workspace {
  id: string
  name: string
  role: string
}

export interface UserDetails {
  id: string
  email: string
  name: string
  status: EntityStatus
  emailVerified: boolean
  createdAt: string
  accountId: string
  workspaces: Workspace[]
  activeSessions: number
}

export interface Metrics {
  totalUsers: number
  activeUsers: number
  lockedAccounts: number
  recentSignups: number
  recentLogins: number
}

export interface ImpersonateRequest {
  targetUserId: string
  reason: string
}

export interface ImpersonateResponse {
  accessToken: string
  sessionId: string
  expiresAt: string
  targetUser: {
    id: string
    email: string
    name: string
  }
}

export interface UpdateUserStatusRequest {
  status: EntityStatus
}
