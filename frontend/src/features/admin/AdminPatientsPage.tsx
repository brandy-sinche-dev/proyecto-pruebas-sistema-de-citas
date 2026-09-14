import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { ErrorState, Spinner } from '@/components/ui/Feedback'
import { usePatients } from '@/hooks/queries'
import type { Patient } from '@/types'

export function AdminPatientsPage() {
  const { data: patients, isLoading, isError, error, refetch } = usePatients()
  const [query, setQuery] = useState('')

  const visible = (patients ?? []).filter((p) => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase()
    return !query || fullName.includes(query.toLowerCase()) || p.documentNumber.includes(query)
  })

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
    { key: 'gender', header: 'Sexo', render: (row) => <span>{row.gender}</span> },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Gestión de usuarios"
        title="Pacientes"
        description="Los pacientes se registran por cuenta propia. Aquí se consulta el directorio"
        actions={
          <div className="flex items-center rounded-lg bg-surface px-3 py-2 shadow-tier1">
            <span className="material-symbols-outlined mr-2 text-lg text-on-surface-variant">search</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o DNI…"
              aria-label="Buscar paciente"
              className="w-56 bg-transparent text-sm text-on-surface placeholder:text-outline focus:outline-none"
            />
          </div>
        }
      />

      {isLoading && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} onRetry={refetch} />}

      <Card>
        <CardHeader title={`Registro de pacientes (${visible.length})`} subtitle="Datos protegidos según política de confidencialidad" />
        <CardBody className="p-0">
          <DataTable columns={columns} rows={visible} empty="No se encontraron pacientes" />
        </CardBody>
      </Card>
    </>
  )
}