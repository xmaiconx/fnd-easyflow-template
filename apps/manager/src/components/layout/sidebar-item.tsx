import { NavLink } from 'react-router-dom'
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
  const { isCollapsed, closeMobile } = useSidebar()

  const handleClick = () => {
    onClose?.()
    closeMobile()
  }

  const linkContent = (
    <NavLink
      to={href}
      onClick={handleClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          'min-h-[44px]',
          isCollapsed && 'justify-center px-2',
          isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
        )
      }
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && label}
    </NavLink>
  )

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return linkContent
}
