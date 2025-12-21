import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1',
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('managerAccessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || '';
      const requestUrl = error.config?.url || '';

      // Don't redirect for login/signin errors (let component handle it)
      const isAuthEndpoint = requestUrl.includes('/auth/signin') || requestUrl.includes('/auth/signup');

      // Don't redirect for unverified email errors
      const isUnverifiedEmailError =
        errorMessage.toLowerCase().includes('email não verificado') ||
        errorMessage.toLowerCase().includes('verificado') ||
        errorMessage.toLowerCase().includes('unverified');

      if (!isAuthEndpoint && !isUnverifiedEmailError) {
        // Only redirect for actual session expiration
        localStorage.removeItem('managerAccessToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
