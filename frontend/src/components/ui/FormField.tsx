import type { ReactNode } from 'react'
import type { FieldError } from 'react-hook-form'
import { Label } from './Label'

interface FormFieldProps {
  label: string
  htmlFor: string
  error?: FieldError
  children: ReactNode
}

export function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
        {label}
      </Label>
      {children}
      {error && (
        <p className="text-[0.8rem] font-medium text-danger-500 animate-in fade-in slide-in-from-top-1">
          {error.message}
        </p>
      )}
    </div>
  )
}