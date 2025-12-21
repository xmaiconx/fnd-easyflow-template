import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Workspace } from '@/types/domain/entities'
import type { ImpersonateData } from '@/types/api/auth.types'

export interface User {
  id: string
  email: string
  fullName: string
  accountId: string
  emailVerified?: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  impersonateData: ImpersonateData | null
  isAuthenticated: boolean
  currentWorkspace: Workspace | null
  workspaceList: Workspace[]
  setAuth: (user: User, token: string, refreshToken: string) => void
  setImpersonate: (data: ImpersonateData | null) => void
  clearAuth: () => void
  setCurrentWorkspace: (workspace: Workspace) => void
  setWorkspaceList: (workspaces: Workspace[]) => void
  addWorkspace: (workspace: Workspace) => void
  updateWorkspace: (id: string, workspace: Workspace) => void
  removeWorkspace: (id: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      impersonateData: null,
      isAuthenticated: false,
      currentWorkspace: null,
      workspaceList: [],
      setAuth: (user, token, refreshToken) =>
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
        }),
      setImpersonate: (data) =>
        set({
          impersonateData: data,
        }),
      clearAuth: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          impersonateData: null,
          isAuthenticated: false,
          currentWorkspace: null,
          workspaceList: [],
        }),
      setCurrentWorkspace: (workspace) =>
        set({
          currentWorkspace: workspace,
        }),
      setWorkspaceList: (workspaces) =>
        set({
          workspaceList: workspaces,
        }),
      addWorkspace: (workspace) =>
        set((state) => ({
          workspaceList: [...state.workspaceList, workspace],
        })),
      updateWorkspace: (id, workspace) =>
        set((state) => ({
          workspaceList: state.workspaceList.map((w) => (w.id === id ? workspace : w)),
          currentWorkspace: state.currentWorkspace?.id === id ? workspace : state.currentWorkspace,
        })),
      removeWorkspace: (id) =>
        set((state) => ({
          workspaceList: state.workspaceList.filter((w) => w.id !== id),
          currentWorkspace: state.currentWorkspace?.id === id ? null : state.currentWorkspace,
        })),
    }),
    {
      name: 'fnd-easyflow-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        impersonateData: state.impersonateData,
        isAuthenticated: state.isAuthenticated,
        currentWorkspace: state.currentWorkspace,
        workspaceList: state.workspaceList,
      }),
    }
  )
)