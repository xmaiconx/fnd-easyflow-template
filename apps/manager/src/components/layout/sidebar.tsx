import { NavLink } from 'react-router-dom'
import { Users, BarChart3, ChevronLeft, ChevronRight, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui-store'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const navItems = [
  {
    label: 'Usuários',
    href: '/users',
    icon: Users,
  },
  {
    label: 'Métricas',
    href: '/metrics',
    icon: BarChart3,
  },
]

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  return (
    <aside
      className={cn(
        'hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 border-r bg-card transition-all duration-300',
        sidebarCollapsed ? 'lg:w-[80px]' : 'lg:w-[280px]'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          {!sidebarCollapsed && <span className="font-display text-lg font-bold">Manager</span>}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        <TooltipProvider delayDuration={0}>
          {navItems.map((item) => {
            const Icon = item.icon
            const link = (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                    sidebarCollapsed && 'justify-center'
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            )

            if (sidebarCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            }

            return link
          })}
        </TooltipProvider>
      </nav>

      {/* Toggle Button */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn('w-full', !sidebarCollapsed && 'justify-start')}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="text-sm">Recolher</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}
