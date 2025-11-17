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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || ''

      // Check if this is an unverified email error - don't redirect, let component handle it
      const isUnverifiedEmailError =
        errorMessage.toLowerCase().includes('email não verificado') ||
        errorMessage.toLowerCase().includes('verificado') ||
        errorMessage.toLowerCase().includes('unverified')

      if (!isUnverifiedEmailError) {
        // Clear auth state on unauthorized (invalid/expired token)
        useAuthStore.getState().clearAuth()
        // Redirect to login
        window.location.href = '/login'
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