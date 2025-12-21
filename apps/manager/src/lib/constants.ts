export const APP_NAME = 'FND Manager'

export const STORAGE_KEYS = {
  AUTH: 'fnd-manager-auth',
  THEME: 'fnd-manager-theme',
} as const

export const ROUTES = {
  LOGIN: '/login',
  USERS: '/users',
  USER_DETAILS: (id: string) => `/users/${id}`,
  METRICS: '/metrics',
  SETTINGS: '/settings',
} as const
