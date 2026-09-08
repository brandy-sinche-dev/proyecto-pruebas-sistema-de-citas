import { PageHeader } from '@/components/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ErrorState, Spinner } from '@/components/ui/Feedback'
import { useAvailability, useDoctors } from '@/hooks/queries'
import { formatDate } from '@/lib/utils'
import type { AvailabilitySlot } from '@/types'

export function AdminSchedulesPage() {
  const { data: slots, isLoading, isError, error, refetch } = useAvailability()
  const { data: doctors } = useDoctors()

  const doctorName = (id: number) => {
    const d = (doctors ?? []).find((x) => x.id === id)
    return d ? `${d.firstName} ${d.lastName}` : '—'
  }

  const columns: Array<Column<AvailabilitySlot>> = [
    {
      key: 'doctor',
      header: 'Médico',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={doctorName(row.doctorId)} />
          <span className="font-medium text-on-surface">{doctorName(row.doctorId)}</span>
        </div>
      ),
    },
    { key: 'date', header: 'Fecha', render: (row) => <span className="tabular">{formatDate(`${row.date}T00:00:00`)}</span> },
    {
      key: 'hours',
      header: 'Horario',
      render: (row) => (
        <span className="tabular">
          {row.startTime} – {row.endTime}
        </span>
      ),
    },
    { key: 'box', header: 'Box', render: (row) => <span className="tabular">{row.box ?? '—'}</span> },
    {
      key: 'status',
      header: 'Estado',
      render: (row) =>
        row.status === 'ACTIVE' ? (
          <Badge className="border-success-200 bg-success-50 text-success-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> Activo</Badge>
        ) : (
          <Badge className="border-danger-200 bg-danger-50 text-danger-700"><span className="h-1.5 w-1.5 rounded-full bg-red-600" /> Bloqueado</Badge>
        ),
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Disponibilidad"
        title="Horarios de atención"
        description="Ventanas de disponibilidad de cada médico"
        actions={<Button variant="health"><span className="material-symbols-outlined text-base">add</span> Nuevo horario</Button>}
      />

      {isLoading && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} onRetry={refetch} />}

      <Card>
        <CardHeader title="Disponibilidad semanal" subtitle="Regla: no se puede reservar fuera de estas ventanas" />
        <CardBody className="p-0">
          <DataTable columns={columns} rows={slots ?? []} empty="No hay horarios configurados" />
        </CardBody>
      </Card>
    </>
  )
}