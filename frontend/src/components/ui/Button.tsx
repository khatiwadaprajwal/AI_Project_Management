import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer shadow-sm',
  {
    variants: {
      variant: {
        // Premium Dark Button (Vercel/Linear style)
        default: 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md border border-slate-950',
        // If you ever specifically want the blue button, you can use variant="accent" later
        accent: 'bg-accent text-white hover:bg-blue-700 border border-transparent',
        destructive: 'bg-danger-600 text-white hover:bg-danger-700',
        outline: 'border border-border bg-surface text-slate-700 hover:bg-slate-50 hover:text-slate-900',
        secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-transparent',
        ghost: 'shadow-none text-slate-700 hover:bg-slate-100 hover:text-slate-900',
        link: 'shadow-none text-accent underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default', // Defaults to the premium dark button
      size: 'md',
    },
  },
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }