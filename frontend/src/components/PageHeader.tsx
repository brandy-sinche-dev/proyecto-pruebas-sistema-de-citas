import type { ReactNode } from 'react'

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <section className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-surface-container-lowest p-4 shadow-tier1 lg:flex-row lg:items-center">
      <div className="flex flex-col gap-1">
        {eyebrow && (
          <div className="flex items-center gap-2 text-sm font-medium text-secondary">
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              clinical_notes
            </span>
            <span className="font-display text-xs font-semibold uppercase tracking-wider">
              {eyebrow}
            </span>
          </div>
        )}
        <h1 className="font-display text-2xl font-bold tracking-tight text-primary">{title}</h1>
        {description && <p className="text-sm text-on-surface-variant">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </section>
  )
}