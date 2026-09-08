import { useQuery } from '@tanstack/react-query'
import { api } from '@/services'
import { PageHeader } from '@/components/PageHeader'
import { KpiCard } from '@/components/ui/KpiCard'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Avatar } from '@/components/ui/Avatar'
import { Spinner, ErrorState } from '@/components/ui/Feedback'
import type { Appointment } from '@/types'

const appointmentColumns: Array<Column<Appointment>> = [
  {
    key: 'patient',
    header: 'Paciente',
    render: (row) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.patientName} />
        <div>
          <p className="font-medium text-on-surface">{row.patientName}</p>
          <p className="text-xs text-on-surface-variant">{row.code}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'specialty',
    header: 'Especialidad',
    render: (row) => <span>{row.specialtyName}</span>,
  },
  {
    key: 'doctor',
    header: 'Médico',
    render: (row) => <span>{row.doctorName}</span>,
  },
  {
    key: 'time',
    header: 'Hora',
    align: 'left',
    render: (row) => (
      <span className="tabular">
        {row.startTime} – {row.endTime}
      </span>
    ),
  },
  {
    key: 'box',
    header: 'Box',
    render: (row) => <span className="text-on-surface-variant">{row.box ?? '—'}</span>,
  },
  {
    key: 'status',
    header: 'Estado',
    render: (row) => <StatusBadge status={row.status} />,
  },
]

export function AdminDashboardPage() {
  const { data: dashboard, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => api.getDashboard(),
  })

  return (
    <>
      <PageHeader
        eyebrow="Supervisión hospitalaria y rendimiento"
        title="Panel de Control Administrativo y Analítica Clínica"
        description="Sede San Isidro · Monitoreo en tiempo real de capacidad médica, flujo ambulatorio e ingresos"
      />

      {isLoading && <Spinner label="Cargando métricas…" />}
      {isError && <ErrorState message={(error as Error).message} onRetry={() => refetch()} />}

      {dashboard && (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores clave">
            <KpiCard
              label="Citas totales (mes)"
              value={dashboard.totalAppointments.toLocaleString('es')}
              sub="vs. mes previo"
              trend="+12.4%"
              icon={<span className="material-symbols-outlined text-lg">event_available</span>}
              accentClass="bg-primary-fixed text-primary"
            />
            <KpiCard
              label="Ocupación de boxes"
              value={`${dashboard.occupancyRate.toFixed(1)}%`}
              sub="Capacidad óptima: 80%"
              trend="+3.1%"
              icon={<span className="material-symbols-outlined text-lg">meeting_room</span>}
              accentClass="bg-secondary-fixed text-on-secondary"
            >
              <div className="mt-3">
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
                  <div
                    className="h-full rounded-full bg-secondary transition-all duration-700"
                    style={{ width: `${dashboard.occupancyRate}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-xs text-on-surface-variant">
                  <span>Target 80%</span>
                  <span className="tabular">
                    {dashboard.confirmedCount}/{dashboard.confirmedCount + dashboard.pendingCount} módulos
                  </span>
                </div>
              </div>
            </KpiCard>
            <KpiCard
              label="Tasa de ausentismo"
              value={`${dashboard.noShowRate.toFixed(1)}%`}
              sub="Pacientes que no asistieron"
              trend="-1.8%"
              trendDown
              icon={<span className="material-symbols-outlined text-lg">person_cancel</span>}
              accentClass="bg-surface-container-highest text-primary"
            />
            <KpiCard
              label="Ingresos (S/.)"
              value={`S/ ${dashboard.revenue.toLocaleString('es')}`}
              sub="Recaudación del mes"
              trend="+8.2%"
              icon={<span className="material-symbols-outlined text-lg">payments</span>}
              accentClass="bg-success-50 text-success-700"
            />
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader
                title="Citas de hoy"
                subtitle="Flujo ambulatorio del turno actual"
                action={<span className="badge-pill border border-scheduled-200 bg-scheduled-50 text-scheduled-700">En vivo</span>}
              />
              <CardBody className="p-0">
                <DataTable columns={appointmentColumns} rows={dashboard.appointmentsToday} empty="No hay citas para hoy" />
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Estado clínico" subtitle="Resumen de atención" />
              <CardBody className="flex flex-col gap-3">
                {[
                  { label: 'Confirmadas', value: dashboard.confirmedCount, color: 'bg-emerald-600' },
                  { label: 'En espera', value: dashboard.pendingCount, color: 'bg-amber-500' },
                  { label: 'En consulta', value: dashboard.inConsultationCount, color: 'bg-sky-600' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-lg border border-slate-200 bg-surface-bright p-3">
                    <span className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <span className={`h-2 w-2 rounded-full ${item.color}`} aria-hidden="true" />
                      {item.label}
                    </span>
                    <span className="font-display text-lg font-bold tabular text-primary">{item.value}</span>
                  </div>
                ))}
                <p className="mt-2 text-xs text-on-surface-variant">
                  Métricas actualizadas desde la cola de recepción en tiempo real.
                </p>
              </CardBody>
            </Card>
          </section>
        </>
      )}
    </>
  )
}