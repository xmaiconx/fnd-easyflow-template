// Auth types
export interface User {
  id: string
  email: string
  fullName: string
  accountId: string
  emailVerified: boolean
}

export interface LoginDto {
  email: string
  password: string
}

export interface SignupDto {
  fullName: string
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface ForgotPasswordDto {
  email: string
}

export interface ResetPasswordDto {
  token: string
  password: string
}

export interface VerifyEmailDto {
  token: string
}

export interface ResendVerificationDto {
  email: string
}

// Workspace types
export interface Workspace {
  id: string
  name: string
  accountId: string
  role: 'owner' | 'admin' | 'member'
  createdAt: string
  updatedAt: string
}

export interface CreateWorkspaceDto {
  name: string
}

export interface UpdateWorkspaceDto {
  name: string
}

export interface InviteUserDto {
  email: string
  role: 'admin' | 'member'
}

export interface WorkspaceMember {
  id: string
  workspaceId: string
  userId: string
  role: 'owner' | 'admin' | 'member'
  createdAt: string
  user: {
    id: string
    fullName: string
    email: string
  }
}

export interface UpdateMemberRoleDto {
  role: 'admin' | 'member'
}

// Plan types
export interface Plan {
  id: string
  code: 'free' | 'pro' | 'enterprise'
  name: string
  description: string
  price: number
  interval: 'month' | 'year'
  features: string[]
}

export interface PlanPrice {
  id: string
  planId: string
  amount: number
  currency: string
  interval: 'month' | 'year'
  stripeId: string
}

// Subscription types
export interface Subscription {
  id: string
  accountId: string
  planId: string
  status: 'active' | 'canceled' | 'past_due'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  plan?: Plan
}

export interface CreateCheckoutSessionDto {
  planId: string
  interval: 'month' | 'year'
}

export interface CheckoutSessionResponse {
  url: string
}

// Session types (browser sessions)
export interface Session {
  id: string
  userId: string
  device: string
  browser: string
  location: string
  ipAddress: string
  lastActive: string
  isCurrent: boolean
  createdAt: string
}

export interface RevokeSessionDto {
  sessionId: string
}

// Audit log types
export interface AuditLog {
  id: string
  accountId: string
  userId: string
  action: string
  entityType: string
  entityId: string
  metadata: Record<string, unknown>
  ipAddress: string
  createdAt: string
  user?: {
    id: string
    fullName: string
    email: string
  }
}

export interface AuditLogFilters {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
  action?: string
  entityType?: string
  userId?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// API Error types
export interface ApiError {
  message: string
  errorCode?: string
  statusCode?: number
}

// Account Admin types
export type UserRole = 'owner' | 'admin' | 'member'
export type UserStatus = 'active' | 'inactive'
export type InviteStatus = 'pending' | 'accepted' | 'canceled' | 'expired'

export interface AccountUser {
  id: string
  fullName: string
  email: string
  role: UserRole
  status: UserStatus
  lastLoginAt: string | null
  createdAt: string
  workspaces: {
    id: string
    name: string
    role: UserRole
  }[]
}

export interface AccountUserDetails extends AccountUser {
  sessions: Session[]
  recentActivities: AuditLog[]
}

export interface AccountInvite {
  id: string
  email: string
  role: UserRole
  status: InviteStatus
  expiresAt: string
  createdAt: string
  workspaces: {
    id: string
    name: string
  }[]
}

export interface CreateInviteDto {
  email: string
  role: UserRole
  workspaceIds: string[]
}

export interface CreateInviteResponse {
  id: string
  email: string
  expiresAt: string
  inviteUrl: string
}

export interface UpdateUserRoleDto {
  role: UserRole
}

export interface UpdateUserStatusDto {
  status: UserStatus
}

export interface ListUsersFilters {
  role?: UserRole
  status?: UserStatus
  search?: string
}

export interface ListInvitesFilters {
  status?: InviteStatus
}
