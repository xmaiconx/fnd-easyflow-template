import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { api } from '@/lib/api'

/**
 * Decode JWT payload without verification (client-side)
 */
const decodeJwtPayload = (token: string): { userId?: string; exp?: number } | null => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(window.atob(base64))
    return payload
  } catch {
    return null
  }
}

/**
 * ImpersonateHandler
 *
 * Processes impersonateToken from URL query params.
 * When admin starts impersonation, Manager app opens:
 *   http://localhost:3000?impersonateToken=XXX
 *
 * This component:
 * 1. Detects impersonateToken in URL
 * 2. Sets it as access token in auth store
 * 3. Fetches user profile via /auth/me
 * 4. Clears URL params
 * 5. Redirects to dashboard
 */
export const ImpersonateHandler = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const setImpersonate = useAuthStore((state) => state.setImpersonate)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const impersonateToken = searchParams.get('impersonateToken')

    if (impersonateToken && !isProcessing) {
      setIsProcessing(true)

      const processImpersonation = async () => {
        try {
          // Decode JWT to get expiration time
          const jwtPayload = decodeJwtPayload(impersonateToken)
          const expiresAt = jwtPayload?.exp
            ? new Date(jwtPayload.exp * 1000).toISOString()
            : new Date(Date.now() + 30 * 60 * 1000).toISOString() // Default 30 min

          // Fetch user profile using the impersonate token
          const response = await api.get('/auth/me', {
            headers: {
              Authorization: `Bearer ${impersonateToken}`,
            },
          })

          const userData = response.data.user || response.data

          // Set auth state with impersonation data
          setAuth(
            {
              id: userData.id,
              email: userData.email,
              fullName: userData.fullName || userData.name,
              accountId: userData.accountId,
              emailVerified: userData.emailVerified,
            },
            impersonateToken,
            '' // No refresh token for impersonation
          )

          // Mark as impersonation session with proper data format
          setImpersonate({
            adminUserId: 'admin', // We don't have admin's ID here
            targetUserId: userData.id,
            expiresAt,
          })

          // Clear URL params
          setSearchParams({})

          // Navigate to dashboard
          navigate('/dashboard', { replace: true })
        } catch (error) {
          console.error('Failed to process impersonation token:', error)
          // Clear URL params even on error
          setSearchParams({})
          // Redirect to login on failure
          navigate('/login', { replace: true })
        } finally {
          setIsProcessing(false)
        }
      }

      processImpersonation()
    }
  }, [searchParams, setSearchParams, navigate, setAuth, setImpersonate, isProcessing])

  // Show loading while processing impersonation
  if (isProcessing) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Iniciando sessão de impersonation...</p>
        </div>
      </div>
    )
  }

  return null
}
