import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/theme-context'

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

const themeLabels = {
  light: 'Tema claro',
  dark: 'Tema escuro',
  system: 'Tema do sistema',
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const Icon = themeIcons[theme]

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      title={themeLabels[theme]}
      aria-label={`Alternar tema. Tema atual: ${themeLabels[theme]}`}
    >
      <Icon className="h-4 w-4" />
    </Button>
  )
}
