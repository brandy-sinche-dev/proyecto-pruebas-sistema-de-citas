import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function KpiCard({
  label,
  value,
  sub,
  trend,
  trendDown = false,
  icon,
  accentClass = 'bg-primary-fixed text-primary',
  children,
  className,
}: {
  label: string
  value: string
  sub?: string
  trend?: string
  trendDown?: boolean
  icon?: ReactNode
  accentClass?: string
  children?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-surface-container-lowest p-4 shadow-tier1 transition-shadow hover:shadow-tier2',
        className,
      )}
    >
      <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-primary/5 transition-transform duration-300 group-hover:scale-125" />
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-xs font-semibold uppercase tracking-wider text-outline">
            {label}
          </span>
          {icon && (
            <span className={cn('flex items-center justify-center rounded-lg p-1.5', accentClass)}>
              {icon}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold tabular text-primary">{value}</span>
          {trend && (
            <span
              className={cn(
                'flex items-center gap-0.5 text-xs font-semibold',
                trendDown ? 'text-secondary' : 'text-secondary',
              )}
            >
              <span className="material-symbols-outlined text-xs">
                {trendDown ? 'arrow_downward' : 'arrow_upward'}
              </span>
              {trend}
            </span>
          )}
        </div>
        {sub && <p className="mt-1 text-xs text-on-surface-variant">{sub}</p>}
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  )
}