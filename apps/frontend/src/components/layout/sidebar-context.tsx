import { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface SidebarContextValue {
  isCollapsed: boolean
  isMobileOpen: boolean
  toggleCollapse: () => void
  openMobile: () => void
  closeMobile: () => void
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined)

const STORAGE_KEY = 'sidebar-collapsed'

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'true'
  })
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isCollapsed))
  }, [isCollapsed])

  const toggleCollapse = useCallback(() => setIsCollapsed(prev => !prev), [])
  const openMobile = useCallback(() => setIsMobileOpen(true), [])
  const closeMobile = useCallback(() => setIsMobileOpen(false), [])

  return (
    <SidebarContext.Provider value={{ isCollapsed, isMobileOpen, toggleCollapse, openMobile, closeMobile }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) throw new Error('useSidebar must be used within SidebarProvider')
  return context
}
