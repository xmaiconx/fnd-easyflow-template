import { useEffect } from 'react'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { AppRoutes } from './routes'
import { Toaster } from 'sonner'
import { api } from '@/lib/api'
import type { Workspace } from '@/types'

function App() {
  const theme = useUIStore((state) => state.theme)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const setWorkspaceList = useAuthStore((state) => state.setWorkspaceList)
  const currentWorkspace = useAuthStore((state) => state.currentWorkspace)
  const setCurrentWorkspace = useAuthStore((state) => state.setCurrentWorkspace)

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  // Load workspaces when user is authenticated
  useEffect(() => {
    if (!isAuthenticated) return

    const loadWorkspaces = async () => {
      try {
        const response = await api.get<Workspace[]>('/workspaces')
        const workspaces = response.data

        if (workspaces.length > 0) {
          setWorkspaceList(workspaces)

          // Set current workspace if not already set
          if (!currentWorkspace) {
            setCurrentWorkspace(workspaces[0])
          }
        }
      } catch (error) {
        console.error('Failed to load workspaces:', error)
      }
    }

    loadWorkspaces()
  }, [isAuthenticated, setWorkspaceList, currentWorkspace, setCurrentWorkspace])

  return (
    <>
      <AppRoutes />
      <Toaster richColors position="top-right" />
    </>
  )
}

export default App
