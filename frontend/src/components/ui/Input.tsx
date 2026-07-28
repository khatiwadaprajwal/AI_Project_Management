import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/cn'

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-slate-950 shadow-sm transition-all',
        'placeholder:text-ink-muted',
        'hover:border-slate-400',
        'focus-visible:outline-none focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/15',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export { Input }