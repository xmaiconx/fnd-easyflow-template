import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import type {
  SignInDto,
  SignUpDto,
  AuthResponse,
  SignUpResponse,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  ResendVerificationDto,
} from '@/types/api/auth.types'

interface MessageResponse {
  message: string
}

// Auth API functions
const authApi = {
  signIn: (data: SignInDto): Promise<AuthResponse> =>
    api.post('/auth/signin', data).then((res) => res.data),

  signUp: (data: SignUpDto): Promise<SignUpResponse> =>
    api.post('/auth/signup', data).then((res) => res.data),

  forgotPassword: (data: ForgotPasswordDto): Promise<MessageResponse> =>
    api.post('/auth/forgot-password', data).then((res) => res.data),

  resetPassword: (data: ResetPasswordDto): Promise<MessageResponse> =>
    api.post('/auth/reset-password', data).then((res) => res.data),

  verifyEmail: (data: VerifyEmailDto): Promise<MessageResponse> =>
    api.post('/auth/verify-email', data).then((res) => res.data),

  resendVerification: (data: ResendVerificationDto): Promise<MessageResponse> =>
    api.post('/auth/resend-verification', data).then((res) => res.data),

  logout: (): Promise<void> =>
    api.post('/auth/logout').then((res) => res.data),

  getMe: (): Promise<AuthResponse['user']> =>
    api.get('/auth/me').then((res) => res.data),
}

// Custom hooks
export const useSignIn = () => {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: authApi.signIn,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken)
    },
  })
}

export const useSignUp = () => {
  // SignUp does NOT authenticate the user
  // User must verify email before logging in
  return useMutation({
    mutationFn: authApi.signUp,
  })
}

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authApi.forgotPassword,
  })
}

export const useResetPassword = () => {
  return useMutation({
    mutationFn: authApi.resetPassword,
  })
}

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: authApi.verifyEmail,
  })
}

export const useResendVerification = () => {
  return useMutation({
    mutationFn: authApi.resendVerification,
  })
}

export const useMe = () => {
  const token = useAuthStore((state) => state.token)

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getMe,
    enabled: !!token,
    retry: false,
  })
}

export const useSignOut = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth)

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      // Clear auth state regardless of API response
      clearAuth()
      // Redirect to login
      window.location.href = '/login'
    },
  })
}