import { create } from 'zustand';
import type { ListUsersDto } from '../types/manager.types';

interface ManagerState {
  filters: ListUsersDto;
  selectedUserId: string | null;

  setFilters: (filters: ListUsersDto) => void;
  setSelectedUser: (userId: string | null) => void;
}

export const useManagerStore = create<ManagerState>((set) => ({
  filters: { page: 1, limit: 20 },
  selectedUserId: null,

  setFilters: (filters) => set({ filters }),
  setSelectedUser: (userId) => set({ selectedUserId: userId }),
}));
