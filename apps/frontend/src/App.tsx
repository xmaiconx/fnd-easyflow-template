import { useEffect } from 'react'
import { useUIStore } from '@/stores/ui-store'
import { AppRoutes } from './routes'
import { Toaster } from 'sonner'

function App() {
  const theme = useUIStore((state) => state.theme)

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

  return (
    <>
      <AppRoutes />
      <Toaster richColors position="top-right" />
    </>
  )
}

export default App
