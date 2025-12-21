import { useAuthStore } from '../stores/auth-store';
import { api } from '../lib/api';
import type { SignInResponse } from '../types/manager.types';

export const useAuth = () => {
  const { setAuth, logout, user, isAuthenticated } = useAuthStore();

  const signin = async (email: string, password: string) => {
    const response = await api.post<SignInResponse>('/auth/signin', { email, password });
    setAuth(response.data.user, response.data.accessToken);
    return response.data;
  };

  const signout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore errors on logout
      console.error('Logout error:', error);
    } finally {
      logout();
    }
  };

  return { user, isAuthenticated, signin, signout };
};
