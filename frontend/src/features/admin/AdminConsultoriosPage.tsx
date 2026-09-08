import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { ErrorState, Spinner } from '@/components/ui/Feedback'
import { useAppointments, useDoctors } from '@/hooks/queries'

type BoxStatus = 'IN_USE' | 'FREE' | 'MAINTENANCE'

interface Box {
  id: string
  name: string
  area: string
  status: BoxStatus
  doctorId?: number
}

const mockBoxes: Box[] = [
  { id: 'B104', name: 'Box 104', area: 'Cardiología', status: 'IN_USE', doctorId: 1 },
  { id: 'B107', name: 'Box 107', area: 'Medicina General', status: 'IN_USE', doctorId: 5 },
  { id: 'B208', name: 'Box 208', area: 'Traumatología', status: 'IN_USE', doctorId: 2 },
  { id: 'B305', name: 'Box 305', area: 'Pediatría', status: 'IN_USE', doctorId: 3 },
  { id: 'B401', name: 'Box 401', area: 'Dermatología', status: 'FREE' },
  { id: 'B402', name: 'Box 402', area: 'Dermatología', status: 'MAINTENANCE' },
  { id: 'B512', name: 'Box 512', area: 'Ginecología', status: 'FREE' },
  { id: 'B101', name: 'Box 101', area: 'Consulta externa', status: 'FREE' },
]

const statusLabel: Record<BoxStatus, string> = {
  IN_USE: 'En uso',
  FREE: 'Disponible',
  MAINTENANCE: 'Mantenimiento',
}

const statusClass: Record<BoxStatus, string> = {
  IN_USE: 'border-scheduled-200 bg-scheduled-50 text-scheduled-700',
  FREE: 'border-success-200 bg-success-50 text-success-700',
  MAINTENANCE: 'border-danger-200 bg-danger-50 text-danger-700',
}

export function AdminConsultoriosPage() {
  const { data: doctors, isLoading: loadingDoctors, isError, error, refetch } = useDoctors()
  const { data: appointments } = useAppointments()
  const [selected, setSelected] = useState<Box | null>(null)

  const doctorFor = (id?: number) => (doctors ?? []).find((d) => d.id === id)
  const patientInBox = (doctorId?: number) =>
    (appointments ?? []).find((a) => a.doctorId === doctorId && (a.status === 'CONFIRMED' || a.status === 'PENDING'))

  return (
    <>
      <PageHeader
        eyebrow="Infraestructura"
        title="Consultorios y boxes clínicos"
        description="Monitoreo en tiempo real de los módulos de atención de la sede"
        actions={<Button variant="secondary"><span className="material-symbols-outlined text-base">add</span> Registrar box</Button>}
      />

      {loadingDoctors && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} onRetry={refetch} />}

      {!loadingDoctors && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockBoxes.map((box) => {
            const doctor = doctorFor(box.doctorId)
            const patient = patientInBox(box.doctorId)
            return (
              <Card
                key={box.id}
                className="relative cursor-pointer overflow-hidden p-4 transition-shadow hover:shadow-tier2"
                onClick={() => setSelected(box)}
              >
                <span className={`absolute top-3 right-3 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusClass[box.status]}`}>
                  {statusLabel[box.status]}
                </span>
                <span className="material-symbols-outlined rounded-lg bg-primary-fixed p-2 text-2xl text-primary">meeting_room</span>
                <h3 className="mt-3 font-display text-lg font-semibold text-primary">{box.name}</h3>
                <p className="text-sm text-on-surface-variant">{box.area}</p>
                {doctor && (
                  <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
                    <Avatar name={`${doctor.firstName} ${doctor.lastName}`} className="h-8 w-8" />
                    <div>
                      <p className="text-sm font-medium text-on-surface">{doctor.firstName} {doctor.lastName}</p>
                      {patient && <p className="text-xs text-on-surface-variant">Atendiendo: {patient.patientName}</p>}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </section>
      )}

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected ? `Detalle de ${selected.name}` : ''}>
        {selected && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">Estado</span>
              <Badge className={statusClass[selected.status]}>{statusLabel[selected.status]}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">Área</span>
              <span className="text-sm text-on-surface">{selected.area}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">Médico asignado</span>
              <span className="text-sm text-on-surface">
                {doctorFor(selected.doctorId) ? `${doctorFor(selected.doctorId)?.firstName} ${doctorFor(selected.doctorId)?.lastName}` : 'Sin asignar'}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}