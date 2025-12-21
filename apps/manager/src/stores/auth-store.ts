import { create } from 'zustand';
import type { AuthUser } from '../types/manager.types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem('managerAccessToken'),
  isAuthenticated: !!localStorage.getItem('managerAccessToken'),

  setAuth: (user, token) => {
    localStorage.setItem('managerAccessToken', token);
    set({ user, accessToken: token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('managerAccessToken');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));
