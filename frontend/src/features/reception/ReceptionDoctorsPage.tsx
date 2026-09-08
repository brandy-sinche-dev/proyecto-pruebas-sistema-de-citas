import { PageHeader } from '@/components/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { ErrorState, Spinner } from '@/components/ui/Feedback'
import { useDoctors } from '@/hooks/queries'
import type { Doctor } from '@/types'

export function ReceptionDoctorsPage() {
  const { data: doctors, isLoading, isError, error, refetch } = useDoctors()

  const columns: Array<Column<Doctor>> = [
    {
      key: 'name',
      header: 'Médico',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={`${row.firstName} ${row.lastName}`} />
          <div>
            <p className="font-medium text-on-surface">{row.firstName} {row.lastName}</p>
            <p className="text-xs tabular text-on-surface-variant">{row.licenseNumber}</p>
          </div>
        </div>
      ),
    },
    { key: 'specialty', header: 'Especialidad', render: (row) => <Badge className="border-primary-fixed bg-primary-fixed/40 text-primary">{row.specialtyName}</Badge> },
    { key: 'box', header: 'Box', render: (row) => <span className="tabular">{row.box ?? '—'}</span> },
    {
      key: 'status',
      header: 'Guardia',
      render: (row) =>
        row.available ? (
          <span className="badge-pill border border-success-200 bg-success-50 text-success-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" /> En guardia</span>
        ) : (
          <span className="badge-pill border border-danger-200 bg-danger-50 text-danger-700">Sin cupos</span>
        ),
    },
  ]

  return (
    <>
      <PageHeader eyebrow="Recepción y control" title="Médicos" description="Guardiás y boxes activos para derivar pacientes" />
      {isLoading && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} onRetry={refetch} />}
      <Card>
        <CardHeader title="Staff en turno" />
        <CardBody className="p-0">
          <DataTable columns={columns} rows={doctors ?? []} empty="No hay médicos registrados" />
        </CardBody>
      </Card>
    </>
  )
}