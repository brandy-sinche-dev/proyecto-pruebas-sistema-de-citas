import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ErrorState, Spinner } from '@/components/ui/Feedback'
import { useAppointments, useMutations } from '@/hooks/queries'
import { formatDateTime } from '@/lib/utils'
import type { Appointment } from '@/types'

export function ReceptionDashboardPage() {
  const { data: appointments, isLoading, isError, error, refetch } = useAppointments()
  const { updateStatus } = useMutations()
  const [query, setQuery] = useState('')

  const today = new Date().toISOString().split('T')[0]
  const todayAppointments = (appointments ?? [])
    .filter((a) => a.date === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  const checkedIn = todayAppointments.filter((a) => a.status === 'CONFIRMED').length
  const pending = todayAppointments.filter((a) => a.status === 'PENDING').length

  const visible = todayAppointments.filter((a) => {
    const q = query.toLowerCase()
    return !q || `${a.patientName} ${a.doctorName} ${a.code}`.toLowerCase().includes(q)
  })

  const columns: Array<Column<Appointment>> = [
    {
      key: 'patient',
      header: 'Paciente',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.patientName} />
          <div>
            <p className="font-medium text-on-surface">{row.patientName}</p>
            <p className="text-xs tabular text-on-surface-variant">{row.code}</p>
          </div>
        </div>
      ),
    },
    { key: 'specialty', header: 'Especialidad', render: (row) => <span>{row.specialtyName}</span> },
    { key: 'doctor', header: 'Médico', render: (row) => <span>{row.doctorName}</span> },
    {
      key: 'time',
      header: 'Hora',
      render: (row) => (
        <span className="tabular">
          {row.startTime} – {row.endTime}
        </span>
      ),
    },
    { key: 'box', header: 'Box', render: (row) => <span className="tabular">{row.box ?? '—'}</span> },
    { key: 'status', header: 'Estado', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: 'Check-in',
      render: (row) => (
        <div className="flex gap-1">
          {row.status === 'PENDING' && (
            <Button size="sm" variant="health" onClick={() => updateStatus.mutate({ id: row.id, status: 'CONFIRMED' })}>
              Registrar llegada
            </Button>
          )}
          {row.status === 'CONFIRMED' && (
            <Button size="sm" variant="secondary" onClick={() => updateStatus.mutate({ id: row.id, status: 'COMPLETED' })}>
              Marcar atendido
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Recepción y control"
        title="Control diario y check-in"
        description={formatDateTime(new Date().toISOString())}
        actions={
          <div className="flex items-center rounded-lg bg-surface px-3 py-2 shadow-tier1">
            <span className="material-symbols-outlined mr-2 text-lg text-on-surface-variant">search</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar paciente o código…"
              aria-label="Buscar en cola"
              className="w-56 bg-transparent text-sm text-on-surface placeholder:text-outline focus:outline-none"
            />
          </div>
        }
      />

      {isLoading && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} onRetry={refetch} />}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Indicadores de recepción">
        <KpiCard
          label="Citas programadas hoy"
          value={String(todayAppointments.length)}
          sub="Turno mañana 08:00 – 14:00"
          icon={<span className="material-symbols-outlined text-lg">event_note</span>}
          accentClass="bg-primary-fixed text-primary"
        />
        <KpiCard
          label="Check-in completados"
          value={String(checkedIn)}
          sub="Pacientes registrados en recepción"
          icon={<span className="material-symbols-outlined text-lg">how_to_reg</span>}
          accentClass="bg-secondary-fixed text-on-secondary"
        />
        <KpiCard
          label="En espera"
          value={String(pending)}
          sub="Listos para ser llamados a consulta"
          icon={<span className="material-symbols-outlined text-lg">hourglass_top</span>}
          accentClass="bg-warning-50 text-warning-800"
        />
      </section>

      <Card>
        <CardHeader
          title="Lista de citas del día"
          subtitle="Registrar llegada confirma la cita y libera el siguiente turno"
          action={<span className="badge-pill border border-success-200 bg-success-50 text-success-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" /> En línea</span>}
        />
        <CardBody className="p-0">
          <DataTable columns={columns} rows={visible} empty="No hay citas programadas para hoy" />
        </CardBody>
      </Card>
    </>
  )
}