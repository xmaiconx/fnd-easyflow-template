import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useSidebar } from './sidebar-context'

interface SidebarItemProps {
  href: string
  icon: React.ElementType
  label: string
  onClose?: () => void
}

export function SidebarItem({ href, icon: Icon, label, onClose }: SidebarItemProps) {
  const location = useLocation()
  const { isCollapsed, closeMobile } = useSidebar()
  const isActive = location.pathname === href || location.pathname.startsWith(href + '/')

  const handleClick = () => {
    onClose?.()
    closeMobile()
  }

  const content = (
    <Link
      to={href}
      onClick={handleClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px]',
        isCollapsed && 'justify-center px-2',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!isCollapsed && <span className="flex-1">{label}</span>}
    </Link>
  )

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
}
