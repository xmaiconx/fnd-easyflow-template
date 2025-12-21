import axios from 'axios'
import { useAuthStore } from '@/stores/auth-store'

export const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors and token refresh
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      const errorCode = error.response?.data?.errorCode

      // Check if this is an unverified email error - don't redirect, let component handle it
      if (errorCode === 'EMAIL_NOT_VERIFIED') {
        // Attach errorCode to error for component handling
        error.errorCode = errorCode
        error.message = error.response?.data?.message || 'Email não verificado'
        return Promise.reject(error)
      }

      // Try to refresh token
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            return api(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = useAuthStore.getState().refreshToken

      if (!refreshToken) {
        // No refresh token, clear auth and redirect
        useAuthStore.getState().clearAuth()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const response = await api.post('/auth/refresh', { refreshToken })
        const { accessToken, refreshToken: newRefreshToken } = response.data

        // Update tokens in store
        const currentUser = useAuthStore.getState().user
        if (currentUser) {
          useAuthStore.getState().setAuth(currentUser, accessToken, newRefreshToken)
        }

        // Update authorization header
        originalRequest.headers.Authorization = `Bearer ${accessToken}`

        processQueue(null)
        isRefreshing = false

        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError as Error)
        isRefreshing = false

        // Refresh failed, clear auth and redirect
        useAuthStore.getState().clearAuth()
        window.location.href = '/login'

        return Promise.reject(refreshError)
      }
    }

    // Enhanced error handling for better user experience
    if (error.response?.data) {
      const errorData = error.response.data

      // Handle validation errors (400 with array of messages)
      if (error.response.status === 400 && Array.isArray(errorData.message)) {
        error.message = errorData.message.join(', ')
      }
      // Handle single error messages
      else if (errorData.message) {
        error.message = errorData.message
      }
    }

    return Promise.reject(error)
  }
)

export default api