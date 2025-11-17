export const APP_NAME = 'TinyCE'
export const APP_DESCRIPTION = 'Sistema de Gestão para Terapeutas Autônomos'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  CONFIRM_EMAIL: '/confirm-email',
  DASHBOARD: '/dashboard',
  PATIENTS: '/patients',
  APPOINTMENTS: '/appointments',
  FINANCES: '/finances',
  PROFILE: '/profile',
  SETTINGS_WORKSPACES: '/settings/workspaces',
  SETTINGS_WORKSPACE: (id: string) => `/settings/workspace/${id}`,
  ONBOARDING: '/onboarding',
} as const

export const API_ENDPOINTS = {
  AUTH: {
    SIGNIN: '/auth/signin',
    SIGNUP: '/auth/signup',
    CONFIRM_EMAIL: '/auth/confirm-email',
    ME: '/auth/me',
  },
  WORKSPACES: '/workspaces',
  PATIENTS: '/patients',
  APPOINTMENTS: '/appointments',
  PAYMENTS: '/payments',
} as const

export const STORAGE_KEYS = {
  AUTH: 'tinyce-auth',
  THEME: 'tinyce-theme',
} as const

export const QUERY_KEYS = {
  AUTH: ['auth'],
  ME: ['auth', 'me'],
  WORKSPACES: ['workspaces'],
  WORKSPACE: (id: string) => ['workspaces', id],
  ONBOARDING: (workspaceId: string) => ['onboarding', workspaceId],
  CONTENT: (workspaceId: string) => ['content', workspaceId],
  CALENDAR: (workspaceId: string) => ['calendar', workspaceId],
  PATIENTS: ['patients'],
  APPOINTMENTS: ['appointments'],
  PAYMENTS: ['payments'],
} as const