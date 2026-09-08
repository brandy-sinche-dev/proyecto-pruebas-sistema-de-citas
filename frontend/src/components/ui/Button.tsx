import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'health' | 'destructive' | 'ghost'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'default' | 'sm' | 'icon'
}

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-on-primary hover:bg-blue-950 active:bg-[#0A1C2E] focus-visible:outline-secondary',
  secondary:
    'bg-transparent text-primary border border-slate-300 hover:bg-surface-bright hover:border-slate-400',
  health:
    'bg-secondary text-on-secondary hover:bg-teal-700 focus-visible:outline-secondary',
  destructive:
    'bg-danger-50 text-danger-700 border border-danger-200 hover:bg-red-100',
  ghost: 'bg-transparent text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
}

const sizes = {
  default: 'h-10 px-4 text-sm',
  sm: 'h-8 px-3 text-xs',
  icon: 'h-10 w-10',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'default', type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded font-display font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
})