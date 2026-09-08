import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('card', className)} {...props} />
}

export function CardHeader({
  title,
  subtitle,
  action,
  icon,
  className,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  icon?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4 border-b border-slate-200 p-4', className)}>
      <div className="flex items-start gap-3">
        {icon && (
          <span className="flex items-center justify-center rounded-lg bg-primary-fixed/40 p-1.5 text-primary">
            {icon}
          </span>
        )}
        <div>
          <h3 className="font-display text-base font-semibold text-primary">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-on-surface-variant">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-4', className)} {...props} />
}