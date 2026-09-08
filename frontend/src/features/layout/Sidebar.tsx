import { useQuery } from '@tanstack/react-query'
import type { Role } from '@/types'
import { api } from '@/services'
import { roleNav, SidebarNav, SidebarSection } from './navigation'

export function Sidebar({ role }: { role: Role }) {
  const { data: dashboard } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => api.getDashboard(),
    enabled: role !== 'patient',
  })

  return (
    <aside className="fixed top-16 bottom-0 left-0 z-40 hidden w-72 flex-col gap-6 overflow-y-auto bg-surface-container-low px-4 py-5 md:flex">
      <SidebarSection title="Módulos operativos">
        <SidebarNav items={roleNav[role]} />
      </SidebarSection>

      {role !== 'patient' && (
        <>
          <SidebarSection title="Estado clínico rápido">
            <div className="rounded-lg border border-slate-200 bg-surface-container-lowest p-2">
              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="flex items-center gap-1.5 text-sm text-on-surface-variant">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" aria-hidden="true" />
                  Confirmadas
                </span>
                <span className="text-sm font-semibold tabular text-on-surface">
                  {dashboard?.confirmedCount ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="flex items-center gap-1.5 text-sm text-on-surface-variant">
                  <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
                  En espera
                </span>
                <span className="text-sm font-semibold tabular text-on-surface">
                  {dashboard?.pendingCount ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="flex items-center gap-1.5 text-sm text-on-surface-variant">
                  <span className="h-2 w-2 rounded-full bg-sky-600" aria-hidden="true" />
                  En consulta
                </span>
                <span className="text-sm font-semibold tabular text-on-surface">
                  {dashboard?.inConsultationCount ?? 0}
                </span>
              </div>
            </div>
          </SidebarSection>

          <div className="mt-auto">
            <div className="rounded-lg bg-surface-container-high p-3">
              <p className="font-display text-sm font-bold text-primary">Turno activo</p>
              <p className="text-sm text-on-surface-variant">Mañana: 08:00 – 14:00</p>
            </div>
          </div>
        </>
      )}
    </aside>
  )
}