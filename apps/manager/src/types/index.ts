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

// ===== Metrics DTOs =====

// Query DTO
export interface DateRangeQuery {
  startDate: string
  endDate: string
}

// Overview Metrics
export interface OverviewMetrics {
  kpis: {
    mrr: number
    totalAccounts: number
    activeSubs: number
    nrr: number
  }
  charts: {
    mrrTrend: Array<{ date: string; value: number }>
    planDistribution: Array<{ planName: string; count: number; percentage: number }>
  }
}

// MRR & ARR Metrics
export interface MrrArrMetrics {
  kpis: {
    currentMrr: number
    currentArr: number
    growthMoM: number
  }
  charts: {
    mrrArrTrend: Array<{ date: string; mrr: number; arr: number }>
    mrrBreakdown: Array<{
      category: 'new' | 'expansion' | 'contraction' | 'churn'
      value: number
    }>
  }
}

// Revenue Metrics
export interface RevenueMetrics {
  kpis: {
    totalRevenue: number
    averageRevenuePerAccount: number
    revenueGrowth: number
  }
  charts: {
    revenueByPlan: Array<{ planName: string; revenue: number; percentage: number }>
    revenueTrend: Array<{ date: string; revenue: number }>
  }
}

// Churn Metrics
export interface ChurnMetrics {
  kpis: {
    logoChurnRate: number
    revenueChurnRate: number
    nrr: number
  }
  charts: {
    churnComparison: Array<{ date: string; logoChurn: number; revenueChurn: number }>
    cancellationReasons: Array<{ reason: string; count: number; percentage: number }>
  }
}

// Growth Metrics
export interface GrowthMetrics {
  kpis: {
    netNewAccounts: number
    growthRate: number
    totalAccounts: number
  }
  charts: {
    growthTrend: Array<{ date: string; newAccounts: number; churnedAccounts: number; netGrowth: number }>
    acquisitionVsChurn: Array<{ date: string; acquired: number; churned: number }>
  }
}

// Retention Metrics
export interface RetentionMetrics {
  kpis: {
    retentionRate: number
    averageLtv: number
    churnedAccounts: number
  }
  charts: {
    retentionTrend: Array<{ date: string; retentionRate: number }>
    cohortRetention: Array<{
      cohort: string
      month0: number
      month1: number
      month2: number
      month3: number
      month6: number
      month12: number
    }>
  }
}

// At-Risk Account
export interface AtRiskAccount {
  accountId: string
  name: string
  riskType: 'past_due' | 'dormant'
  daysSince: number
  mrr: number
  lastLogin: string | null
}

// At-Risk Metrics
export interface AtRiskMetrics {
  summary: {
    total: number
    pastDue: number
    dormant: number
  }
  accounts: AtRiskAccount[]
}
