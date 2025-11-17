import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { SignInInput, SignUpInput, ConfirmEmailInput, ResendConfirmationInput } from '@/lib/validations'

interface AuthResponse {
  accessToken: string
  user: {
    id: string
    email: string
    name: string
    accountId: string
  }
}

interface SignUpResponse {
  message: string
  userId: string
}

interface ConfirmEmailResponse {
  message: string
}

interface ResendConfirmationResponse {
  message: string
}

// Auth API functions
const authApi = {
  signIn: (data: SignInInput): Promise<AuthResponse> =>
    api.post('/auth/signin', data).then(res => res.data),

  signUp: (data: SignUpInput): Promise<SignUpResponse> => {
    // Remove confirmPassword before sending to backend
    const { confirmPassword, ...signUpData } = data
    return api.post('/auth/signup', signUpData).then(res => res.data)
  },

  confirmEmail: (data: ConfirmEmailInput): Promise<ConfirmEmailResponse> =>
    api.post('/auth/confirm-email', data).then(res => res.data),

  resendConfirmation: (data: ResendConfirmationInput): Promise<ResendConfirmationResponse> =>
    api.post('/auth/resend-confirmation', data).then(res => res.data),

  getMe: (): Promise<{ user: AuthResponse['user'] }> =>
    api.get('/auth/me').then(res => res.data),
}

// Custom hooks
export const useSignIn = () => {
  const setAuth = useAuthStore(state => state.setAuth)

  return useMutation({
    mutationFn: authApi.signIn,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken)
    },
  })
}

export const useSignUp = () => {
  return useMutation({
    mutationFn: authApi.signUp,
  })
}

export const useConfirmEmail = () => {
  return useMutation({
    mutationFn: authApi.confirmEmail,
  })
}

export const useResendConfirmation = () => {
  return useMutation({
    mutationFn: authApi.resendConfirmation,
  })
}

export const useMe = () => {
  const token = useAuthStore(state => state.token)

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getMe,
    enabled: !!token,
    retry: false,
  })
}

export const useSignOut = () => {
  const clearAuth = useAuthStore(state => state.clearAuth)

  return () => {
    clearAuth()
    // Could also call a sign out endpoint if needed
    // api.post('/auth/signout')
  }
}