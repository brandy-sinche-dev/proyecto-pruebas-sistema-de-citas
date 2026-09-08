import type { ReactNode } from 'react'
import { Button } from './Button'

export function Spinner({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12" role="status" aria-live="polite">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-secondary" />
      <span className="text-sm text-on-surface-variant">{label}</span>
    </div>
  )
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <span className="material-symbols-outlined text-4xl text-slate-300">inbox</span>
      <p className="font-display text-sm font-semibold text-primary">{title}</p>
      {description && <p className="max-w-sm text-sm text-on-surface-variant">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12" role="alert">
      <span className="material-symbols-outlined text-4xl text-error">error</span>
      <p className="text-sm font-medium text-on-surface">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  )
}

export function AlertBanner({ variant, children }: { variant?: 'info' | 'error' | 'success'; children: ReactNode }) {
  const styles = {
    info: 'border-scheduled-200 bg-scheduled-50 text-scheduled-700',
    error: 'border-danger-200 bg-danger-50 text-danger-700',
    success: 'border-success-200 bg-success-50 text-success-700',
  }
  const variantStyle = styles[variant ?? 'info']
  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${variantStyle}`} role="status">
      <span className="material-symbols-outlined text-base" aria-hidden="true">
        {variant === 'error' ? 'error' : variant === 'success' ? 'check_circle' : 'info'}
      </span>
      <p>{children}</p>
    </div>
  )
}