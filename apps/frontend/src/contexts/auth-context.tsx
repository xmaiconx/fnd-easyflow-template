import { createContext, useContext, useEffect } from 'react'
import { useAuthStore, type User } from '@/stores/auth-store'
import { useMe } from '@/hooks/use-auth'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, token, clearAuth } = useAuthStore()
  const { data: meData, isLoading, error } = useMe()

  // Update user data when /me query succeeds
  useEffect(() => {
    if (meData && token) {
      const refreshToken = useAuthStore.getState().refreshToken
      if (refreshToken) {
        useAuthStore.getState().setAuth(meData, token, refreshToken)
      }
    }
  }, [meData, token])

  // Clear auth if /me query fails with auth error
  useEffect(() => {
    if (error && token) {
      clearAuth()
    }
  }, [error, token, clearAuth])

  const signOut = () => {
    clearAuth()
    // Redirect to login
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading: isLoading && !!token,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}