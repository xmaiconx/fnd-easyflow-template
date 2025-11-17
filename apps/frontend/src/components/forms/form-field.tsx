import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface FormFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string
  label: string
  description?: string
}

export const FormField = ({ name, label, description, className, ...props }: FormFieldProps) => {
    const {
      register,
      formState: { errors },
    } = useFormContext()

    const error = errors[name]

    return (
      <div className="space-y-2">
        <Label htmlFor={name} className={error ? 'text-destructive' : ''}>
          {label}
        </Label>
        <Input
          id={name}
          className={cn(
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          {...register(name)}
          {...props}
          required={false}
        />
        {description && !error && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {error && (
          <p className="text-sm text-destructive">
            {error.message as string}
          </p>
        )}
      </div>
    )
}

FormField.displayName = 'FormField'