import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ErrorState, Spinner } from '@/components/ui/Feedback'
import { useDoctors } from '@/hooks/queries'
import type { Doctor } from '@/types'

export function AdminDoctorsPage() {
  const { data: doctors, isLoading, isError, error, refetch } = useDoctors()
  const [selected, setSelected] = useState<Doctor | null>(null)

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
    { key: 'email', header: 'Correo', render: (row) => <span className="text-on-surface-variant">{row.email}</span> },
    {
      key: 'status',
      header: 'Disponibilidad',
      render: (row) =>
        row.available ? (
          <span className="badge-pill border border-success-200 bg-success-50 text-success-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> Disponible
          </span>
        ) : (
          <span className="badge-pill border border-danger-200 bg-danger-50 text-danger-700">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600" /> No disponible
          </span>
        ),
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Gestión de personal"
        title="Médicos y turnos"
        description="Gestión de especialistas, boxes asignados y disponibilidad"
        actions={<Button variant="health"><span className="material-symbols-outlined text-base">person_add</span> Nuevo médico</Button>}
      />

      {isLoading && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} onRetry={refetch} />}

      <Card>
        <CardHeader title="Staff médico" subtitle="Médicos registrados en la sede San Isidro" />
        <CardBody className="p-0">
          <DataTable columns={columns} rows={doctors ?? []} onRowClick={setSelected} empty="No hay médicos registrados" />
        </CardBody>
      </Card>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={`Ficha: ${selected ? `${selected.firstName} ${selected.lastName}` : ''}`}>
        {selected && (
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-outline">Colegiatura</dt>
              <dd className="mt-1 tabular text-on-surface">{selected.licenseNumber}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-outline">Especialidad</dt>
              <dd className="mt-1 text-on-surface">{selected.specialtyName}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-outline">Box</dt>
              <dd className="mt-1 tabular text-on-surface">{selected.box ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-outline">Teléfono</dt>
              <dd className="mt-1 tabular text-on-surface">{selected.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-outline">Correo</dt>
              <dd className="mt-1 text-on-surface">{selected.email}</dd>
            </div>
            {selected.availabilitySlots && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-outline">Turnos activos</dt>
                <dd className="mt-1 tabular text-on-surface">{selected.availabilitySlots.length}</dd>
              </div>
            )}
          </dl>
        )}
      </Modal>
    </>
  )
}