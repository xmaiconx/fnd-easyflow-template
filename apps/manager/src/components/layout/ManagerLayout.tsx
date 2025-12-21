import { useState } from 'react'
import { ManagerSidebar } from './ManagerSidebar'
import { ManagerHeader } from './ManagerHeader'
import { Sheet, SheetContent } from '@/components/ui/sheet'

interface ManagerLayoutProps {
  children: React.ReactNode
}

export function ManagerLayout({ children }: ManagerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r bg-background lg:block">
        <ManagerSidebar />
      </aside>

      {/* Mobile Sidebar - Sheet overlay */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <ManagerSidebar onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content area */}
      <div className="lg:pl-64">
        <ManagerHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  )
}
