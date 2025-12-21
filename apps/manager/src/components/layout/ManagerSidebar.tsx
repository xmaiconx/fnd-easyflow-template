import { Users, BarChart3, Settings, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useSidebar } from './sidebar-context'
import { SidebarItem } from './sidebar-item'
import { SidebarToggle } from './sidebar-toggle'

interface ManagerSidebarProps {
  onClose?: () => void
}

const navigationGroups = [
  {
    items: [
      { label: 'Users', href: '/users', icon: Users },
      { label: 'Metrics', href: '/metrics', icon: BarChart3 },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
]

export function ManagerSidebar({ onClose }: ManagerSidebarProps) {
  const { isCollapsed } = useSidebar()

  return (
    <div className="flex h-full flex-col transition-all duration-200">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            FND
          </div>
          {!isCollapsed && <span className="font-semibold">Manager</span>}
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar menu</span>
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {navigationGroups.map((group, groupIndex) => (
          <div key={groupIndex} className={cn(groupIndex > 0 && 'mt-6')}>
            {group.title && !isCollapsed && (
              <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.title}
              </h3>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.href}>
                  <SidebarItem
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    onClose={onClose}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Toggle Button - Desktop only */}
      <div className="border-t p-4 hidden lg:block">
        <SidebarToggle />
      </div>
    </div>
  )
}
