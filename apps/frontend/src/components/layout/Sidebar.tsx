import { ROUTES } from '@/lib/constants'
import {
  Home,
  User,
  Settings,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarItem } from './sidebar-item'
import { SidebarToggle } from './sidebar-toggle'
import { useSidebar } from './sidebar-context'
import { cn } from '@/lib/utils'

interface SidebarProps {
  onClose?: () => void
}

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

interface NavGroup {
  title?: string
  items: NavItem[]
}

const navigationGroups: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: Home }
    ]
  },
  {
    title: 'Configurações',
    items: [
      { label: 'Perfil', href: ROUTES.PROFILE, icon: User },
      { label: 'Workspaces', href: ROUTES.SETTINGS_WORKSPACES, icon: Settings },
    ]
  }
]

export function Sidebar({ onClose }: SidebarProps) {
  const { isCollapsed } = useSidebar()

  return (
    <div className="flex flex-col h-full bg-background border-r transition-all duration-200">
      {/* Header */}
      <div className={cn(
        "flex items-center p-4 border-b transition-all duration-200",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <h2 className="text-lg font-semibold bg-gradient-to-r from-brand-primary to-accent bg-clip-text text-transparent">
            Agentics
          </h2>
        )}
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {navigationGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            {group.title && !isCollapsed && (
              <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.title}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <SidebarItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  onClose={onClose}
                />
              ))}
            </div>
            {groupIndex < navigationGroups.length - 1 && (
              <Separator className="mt-6" />
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t space-y-2">
        <div className="hidden lg:block">
          <SidebarToggle />
        </div>
        {!isCollapsed && (
          <p className="text-xs text-muted-foreground text-center">
            Agentics v1.0.0
          </p>
        )}
      </div>
    </div>
  )
}