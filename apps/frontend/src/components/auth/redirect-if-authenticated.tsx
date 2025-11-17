import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'

interface RedirectIfAuthenticatedProps {
  children: React.ReactNode
  to?: string
}

export function RedirectIfAuthenticated({
  children,
  to = '/dashboard'
}: RedirectIfAuthenticatedProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={to} replace />
  }

  return <>{children}</>
}