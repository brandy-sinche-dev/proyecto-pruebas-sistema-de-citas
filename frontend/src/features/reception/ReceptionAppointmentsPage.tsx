import { PageHeader } from '@/components/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/Badge'
import { ErrorState, Spinner } from '@/components/ui/Feedback'
import { useAppointments } from '@/hooks/queries'
import { formatDateTime } from '@/lib/utils'
import type { Appointment } from '@/types'

export function ReceptionAppointmentsPage() {
  const { data: appointments, isLoading, isError, error, refetch } = useAppointments()

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
          {formatDateTime(`${row.date}T00:00:00`)} · {row.startTime}
        </span>
      ),
    },
    { key: 'box', header: 'Box', render: (row) => <span className="tabular">{row.box ?? '—'}</span> },
    { key: 'status', header: 'Estado', render: (row) => <StatusBadge status={row.status} /> },
  ]

  return (
    <>
      <PageHeader eyebrow="Recepción y control" title="Citas del día" description="Todas las citas registradas en la clínica" />

      {isLoading && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} onRetry={refetch} />}

      <Card>
        <CardHeader title="Agenda general" subtitle={`${appointments?.length ?? 0} citas registradas`} />
        <CardBody className="p-0">
          <DataTable columns={columns} rows={appointments ?? []} empty="No hay citas registradas" />
        </CardBody>
      </Card>
    </>
  )
}