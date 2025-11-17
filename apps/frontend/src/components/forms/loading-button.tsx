import { forwardRef } from 'react'
import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean
  loadingText?: string
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ children, loading, loadingText = 'Carregando...', disabled, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || loading}
        className={cn(className)}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
        )}
        {loading ? loadingText : children}
      </Button>
    )
  }
)

LoadingButton.displayName = 'LoadingButton'