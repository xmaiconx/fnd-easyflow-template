import * as React from "react"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  helperText?: string
  children: React.ReactNode
  className?: string
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, required = false, helperText, children, className }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {children}
        {helperText && !error && (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        )}
        {error && (
          <p className="text-xs text-destructive font-medium">{error}</p>
        )}
      </div>
    )
  }
)
FormField.displayName = "FormField"

export { FormField }
