import { PageHeader } from '@/components/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ErrorState, Spinner } from '@/components/ui/Feedback'
import { useAppointments, useMutations } from '@/hooks/queries'
import type { Appointment } from '@/types'

const DEMO_DOCTOR_ID = 1

export function DoctorBoxPatientsPage() {
  const { data: appointments, isLoading, isError, error, refetch } = useAppointments()
  const { updateStatus } = useMutations()

  const mine = (appointments ?? []).filter((a) => a.doctorId === DEMO_DOCTOR_ID)

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
    {
      key: 'datetime',
      header: 'Fecha y hora',
      render: (row) => (
        <span className="tabular">
          {new Date(`${row.date}T00:00:00`).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} · {row.startTime}
        </span>
      ),
    },
    { key: 'reason', header: 'Motivo', render: (row) => <span className="text-on-surface-variant">{row.reason ?? '—'}</span> },
    { key: 'box', header: 'Box', render: (row) => <span className="tabular">{row.box ?? '—'}</span> },
    { key: 'status', header: 'Estado', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: 'Acciones',
      render: (row) => (
        <div className="flex gap-1">
          {row.status === 'PENDING' && (
            <Button size="sm" variant="health" onClick={() => updateStatus.mutate({ id: row.id, status: 'CONFIRMED' })}>Confirmar</Button>
          )}
          {row.status === 'CONFIRMED' && (
            <Button size="sm" variant="health" onClick={() => updateStatus.mutate({ id: row.id, status: 'COMPLETED' })}>Marcar atendida</Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader eyebrow="Portal médico asistencial" title="Pacientes en box" description="Turnos asignados a tu consultorio (Box 104 — Cardiología)" />

      {isLoading && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} onRetry={refetch} />}

      <Card>
        <CardHeader title="Turnos asignados" subtitle="Confirma, atiende y registra la evolución de cada paciente" />
        <CardBody className="p-0">
          <DataTable columns={columns} rows={mine} empty="No tienes pacientes asignados todavía" />
        </CardBody>
      </Card>
    </>
  )
}