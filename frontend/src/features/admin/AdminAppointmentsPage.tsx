import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ErrorState, Spinner } from '@/components/ui/Feedback'
import { useAppointments, useMutations } from '@/hooks/queries'
import { formatDateTime } from '@/lib/utils'
import type { Appointment } from '@/types'

function AppointmentDetail({ appointment }: { appointment: Appointment }) {
  return (
    <dl className="grid grid-cols-2 gap-4">
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wider text-outline">Código</dt>
        <dd className="mt-1 tabular text-on-surface">{appointment.code}</dd>
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wider text-outline">Estado</dt>
        <dd className="mt-1"><StatusBadge status={appointment.status} /></dd>
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wider text-outline">Paciente</dt>
        <dd className="mt-1 text-on-surface">{appointment.patientName}</dd>
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wider text-outline">Médico</dt>
        <dd className="mt-1 text-on-surface">{appointment.doctorName}</dd>
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wider text-outline">Especialidad</dt>
        <dd className="mt-1 text-on-surface">{appointment.specialtyName}</dd>
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wider text-outline">Box</dt>
        <dd className="mt-1 text-on-surface">{appointment.box ?? '—'}</dd>
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wider text-outline">Fecha y hora</dt>
        <dd className="mt-1 tabular text-on-surface">
          {formatDateTime(`${appointment.date}T00:00:00`)} · {appointment.startTime}–{appointment.endTime}
        </dd>
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wider text-outline">Motivo</dt>
        <dd className="mt-1 text-on-surface">{appointment.reason ?? '—'}</dd>
      </div>
    </dl>
  )
}

export function AdminAppointmentsPage() {
  const { data: appointments, isLoading, isError, error, refetch } = useAppointments()
  const { updateStatus } = useMutations()
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [filter, setFilter] = useState<Appointment['status'] | 'ALL'>('ALL')

  const visible = filter === 'ALL' ? appointments ?? [] : (appointments ?? []).filter((a) => a.status === filter)

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
      key: 'datetime',
      header: 'Fecha y hora',
      render: (row) => (
        <span className="tabular">
          {formatDateTime(`${row.date}T00:00:00`)}<br />
          <span className="text-xs text-on-surface-variant">{row.startTime} – {row.endTime}</span>
        </span>
      ),
    },
    { key: 'box', header: 'Box', render: (row) => <span className="tabular text-on-surface-variant">{row.box ?? '—'}</span> },
    { key: 'status', header: 'Estado', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: 'Acciones',
      render: (row) => (
        <div className="flex flex-wrap items-center gap-1">
          <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setSelected(row) }}>
            Ver
          </Button>
          {row.status === 'PENDING' && (
            <Button
              size="sm"
              variant="health"
              onClick={(e) => {
                e.stopPropagation()
                updateStatus.mutate({ id: row.id, status: 'CONFIRMED' })
              }}
            >
              Confirmar
            </Button>
          )}
          {row.status === 'CONFIRMED' && (
            <>
              <Button
                size="sm"
                variant="health"
                onClick={(e) => {
                  e.stopPropagation()
                  updateStatus.mutate({ id: row.id, status: 'COMPLETED' })
                }}
              >
                Atendida
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation()
                  updateStatus.mutate({ id: row.id, status: 'CANCELLED' })
                }}
              >
                Cancelar
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Gestión de agenda"
        title="Control de citas"
        description="Crea, confirma, atiende y cancela citas de la clínica"
        actions={
          <div className="flex items-center gap-2">
            {(['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  filter === s ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {s === 'ALL' ? 'Todas' : { PENDING: 'Pendientes', CONFIRMED: 'Confirmadas', COMPLETED: 'Atendidas', CANCELLED: 'Canceladas' }[s]}
              </button>
            ))}
          </div>
        }
      />

      {isLoading && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} onRetry={refetch} />}

      <Card>
        <CardHeader title={`Listado de citas (${visible.length})`} subtitle="Reglas de negocio validadas en el backend de la clínica" />
        <CardBody className="p-0">
          <DataTable columns={columns} rows={visible} onRowClick={setSelected} empty="No hay citas que coincidan con el filtro" />
        </CardBody>
      </Card>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={`Detalle: ${selected?.code ?? ''}`} size="lg">
        {selected && <AppointmentDetail appointment={selected} />}
      </Modal>
    </>
  )
}