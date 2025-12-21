import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from './sidebar-context'
import { cn } from '@/lib/utils'

export function SidebarToggle() {
  const { isCollapsed, toggleCollapse } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleCollapse}
      className={cn('w-full justify-center', isCollapsed && 'px-2')}
      aria-label={isCollapsed ? 'Expandir sidebar' : 'Minimizar sidebar'}
    >
      {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
    </Button>
  )
}
