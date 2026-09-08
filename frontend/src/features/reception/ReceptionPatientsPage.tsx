import { PageHeader } from '@/components/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { ErrorState, Spinner } from '@/components/ui/Feedback'
import { usePatients } from '@/hooks/queries'
import type { Patient } from '@/types'

export function ReceptionPatientsPage() {
  const { data: patients, isLoading, isError, error, refetch } = usePatients()

  const columns: Array<Column<Patient>> = [
    {
      key: 'name',
      header: 'Paciente',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={`${row.firstName} ${row.lastName}`} />
          <div>
            <p className="font-medium text-on-surface">{row.firstName} {row.lastName}</p>
            <p className="text-xs tabular text-on-surface-variant">DNI {row.documentNumber}</p>
          </div>
        </div>
      ),
    },
    { key: 'email', header: 'Correo', render: (row) => <span>{row.email}</span> },
    { key: 'phone', header: 'Teléfono', render: (row) => <span className="tabular text-on-surface-variant">{row.phone ?? '—'}</span> },
    { key: 'blood', header: 'Grupo', render: (row) => <Badge>{row.bloodType ?? '—'}</Badge> },
  ]

  return (
    <>
      <PageHeader eyebrow="Recepción y control" title="Pacientes" description="Directorio de pacientes para registro de visitas" />
      {isLoading && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} onRetry={refetch} />}
      <Card>
        <CardHeader title="Directorio de pacientes" />
        <CardBody className="p-0">
          <DataTable columns={columns} rows={patients ?? []} empty="No hay pacientes registrados" />
        </CardBody>
      </Card>
    </>
  )
}