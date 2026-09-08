import type { HTMLAttributes } from 'react'
import type { AppointmentStatus } from '@/types'
import { cn } from '@/lib/utils'

/** Estilos por estado clínico según DESIGN.md (triaje semántico). */
export const statusStyles: Record<AppointmentStatus, { label: string; className: string; dot: string }> = {
  CONFIRMED: {
    label: 'Confirmada',
    className: 'bg-success-50 text-success-700 border-success-200',
    dot: 'bg-emerald-600',
  },
  PENDING: {
    label: 'Pendiente',
    className: 'bg-warning-50 text-warning-800 border-warning-200',
    dot: 'bg-amber-500',
  },
  COMPLETED: {
    label: 'Atendida',
    className: 'bg-scheduled-50 text-scheduled-700 border-scheduled-200',
    dot: 'bg-sky-600',
  },
  CANCELLED: {
    label: 'Cancelada',
    className: 'bg-danger-50 text-danger-700 border-danger-200',
    dot: 'bg-red-600',
  },
  NO_SHOW: {
    label: 'No asistió',
    className: 'bg-slate-50 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  },
}

export function StatusBadge({ status, className }: { status: AppointmentStatus; className?: string }) {
  const style = statusStyles[status]
  return (
    <span
      className={cn('badge-pill border', style.className, className)}
      role="status"
      aria-label={style.label}
      data-status={status}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
      {style.label}
    </span>
  )
}

export function Badge({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn('badge-pill border border-slate-200 bg-surface-bright text-on-surface-variant', className)} {...props}>
      {children}
    </span>
  )
}