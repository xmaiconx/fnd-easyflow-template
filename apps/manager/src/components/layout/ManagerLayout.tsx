import { ManagerSidebar } from './ManagerSidebar'
import { ManagerHeader } from './ManagerHeader'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SidebarProvider, useSidebar } from './sidebar-context'
import { cn } from '@/lib/utils'

interface ManagerLayoutProps {
  children: React.ReactNode
}

function ManagerLayoutContent({ children }: ManagerLayoutProps) {
  const { isCollapsed, isMobileOpen, openMobile, closeMobile } = useSidebar()

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 hidden border-r bg-background lg:block transition-all duration-200',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <ManagerSidebar />
      </aside>

      {/* Mobile Sidebar - Sheet overlay */}
      <Sheet open={isMobileOpen} onOpenChange={closeMobile}>
        <SheetContent side="left" className="w-64 p-0">
          <ManagerSidebar onClose={closeMobile} />
        </SheetContent>
      </Sheet>

      {/* Main content area */}
      <div
        className={cn(
          'transition-all duration-200',
          isCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        )}
      >
        <ManagerHeader onMenuClick={openMobile} />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  )
}

export function ManagerLayout({ children }: ManagerLayoutProps) {
  return (
    <SidebarProvider>
      <TooltipProvider>
        <ManagerLayoutContent>{children}</ManagerLayoutContent>
      </TooltipProvider>
    </SidebarProvider>
  )
}
