import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { SidebarProvider, useSidebar } from './sidebar-context'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ImpersonateBanner } from '@/components/ImpersonateBanner'
import { cn } from '@/lib/utils'

function AppLayoutContent() {
  const { isCollapsed, isMobileOpen, openMobile, closeMobile } = useSidebar()

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={`
        fixed inset-0 z-50 lg:hidden
        ${isMobileOpen ? 'block' : 'hidden'}
      `}>
        <div className="fixed inset-0 bg-black/50" onClick={closeMobile} />
        <div className="fixed inset-y-0 left-0 w-64 bg-background border-r">
          <Sidebar onClose={closeMobile} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={cn(
        "hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-200",
        isCollapsed ? "lg:w-16" : "lg:w-64"
      )}>
        <Sidebar />
      </div>

      {/* Main content */}
      <div className={cn(
        "transition-all duration-200",
        isCollapsed ? "lg:pl-16" : "lg:pl-64"
      )}>
        <Header onMenuClick={openMobile} />
        <main className="p-4 md:p-6">
          <ImpersonateBanner />
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function AppLayout() {
  return (
    <SidebarProvider>
      <TooltipProvider>
        <AppLayoutContent />
      </TooltipProvider>
    </SidebarProvider>
  )
}