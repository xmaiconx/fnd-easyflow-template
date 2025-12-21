import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { api } from '@/lib/api'
import type { User, LoginDto, SignupDto, AuthResponse, Workspace } from '@/types'
import { toast } from 'sonner'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  currentWorkspace: Workspace | null
  workspaceList: Workspace[]
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  login: (data: LoginDto) => Promise<void>
  signup: (data: SignupDto) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  setToken: (accessToken: string, refreshToken: string) => void
  setCurrentWorkspace: (workspace: Workspace) => void
  switchWorkspace: (workspace: Workspace) => void
  setWorkspaceList: (workspaces: Workspace[]) => void
  addWorkspace: (workspace: Workspace) => void
  updateWorkspace: (id: string, workspace: Workspace) => void
  removeWorkspace: (id: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      currentWorkspace: null,
      workspaceList: [],

      setAuth: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          currentWorkspace: null,
          workspaceList: [],
        }),

      login: async (data: LoginDto) => {
        try {
          const response = await api.post<AuthResponse>('/auth/signin', data)
          const { user, accessToken, refreshToken } = response.data

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
          })

          // Toast é mostrado pelo componente (login-form.tsx)
        } catch (error: any) {
          console.error('Login error:', error)

          // Check if it's an email not verified error
          if (error.errorCode === 'EMAIL_NOT_VERIFIED') {
            throw error
          }

          const message = error.response?.data?.message || error.message || 'Erro ao fazer login'
          toast.error(message)
          throw error
        }
      },

      signup: async (data: SignupDto) => {
        try {
          // Backend retorna apenas { message, user } sem tokens
          // Usuário deve verificar email antes de fazer login
          await api.post('/auth/signup', data)

          // NÃO autenticar automaticamente - usuário precisa verificar email primeiro
          // SignupForm vai mostrar toast e redirecionar para /email-not-verified
        } catch (error: any) {
          console.error('Signup error:', error)
          const message = error.response?.data?.message || error.message || 'Erro ao criar conta'
          toast.error(message)
          throw error
        }
      },

      logout: () => {
        // Call logout endpoint (optional - backend might track sessions)
        try {
          api.post('/auth/logout').catch(console.error)
        } catch (error) {
          console.error('Logout error:', error)
        }

        // Clear state
        get().clearAuth()
        toast.success('Logout realizado com sucesso!')
      },

      setUser: (user) =>
        set({
          user,
        }),

      setToken: (accessToken, refreshToken) =>
        set({
          accessToken,
          refreshToken,
        }),

      setCurrentWorkspace: (workspace) =>
        set({
          currentWorkspace: workspace,
        }),

      switchWorkspace: (workspace) => {
        const current = get().currentWorkspace
        if (workspace.id !== current?.id) {
          set({ currentWorkspace: workspace })
          toast.success(`Alterado para ${workspace.name}`)
        }
      },

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
      name: 'fnd-metatemplate-auth-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        currentWorkspace: state.currentWorkspace,
        workspaceList: state.workspaceList,
      }),
    }
  )
)
