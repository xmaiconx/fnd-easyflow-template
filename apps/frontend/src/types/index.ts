// Frontend-specific types
export interface AppRoute {
  path: string
  element: React.ComponentType
  protected?: boolean
}

export interface NavigationItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  external?: boolean
}

export interface ToastOptions {
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
}

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'textarea' | 'select'
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
}

// Re-export shared types from @agentics/domain
export type { User, Account } from '@agentics/domain'