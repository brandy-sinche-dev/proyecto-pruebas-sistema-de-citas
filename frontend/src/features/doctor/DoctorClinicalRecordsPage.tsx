import { PageHeader } from '@/components/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ErrorState, Spinner } from '@/components/ui/Feedback'
import { useConsultationNotes, usePatients } from '@/hooks/queries'
import { formatDateTime } from '@/lib/utils'

const DEMO_DOCTOR_ID = 1

export function DoctorClinicalRecordsPage() {
  const { data: notes, isLoading: loadingNotes, isError, error, refetch } = useConsultationNotes()
  const { data: patients } = usePatients()

  const mine = (notes ?? []).filter((n) => n.doctorId === DEMO_DOCTOR_ID)

  return (
    <>
      <PageHeader
        eyebrow="Portal médico asistencial"
        title="Ficha clínica"
        description="Historial de consultas atendidas y notas de evolución"
        actions={
          <Button variant="health">
            <span className="material-symbols-outlined text-base">add</span>
            Nueva nota
          </Button>
        }
      />

      {loadingNotes && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} onRetry={refetch} />}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Notas de evolución" subtitle="Registra diagnóstico, tratamiento y seguimiento" icon={<span className="material-symbols-outlined text-lg">monitor_heart</span>} />
          <CardBody className="flex flex-col gap-3">
            {mine.length === 0 && <p className="text-sm text-on-surface-variant">Aún no hay notas clínicas registradas.</p>}
            {mine.map((note) => {
              const patient = (patients ?? []).find((p) => p.id === note.patientId)
              return (
                <div key={note.id} className="rounded-lg border border-slate-200 bg-surface-bright p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar name={patient ? `${patient.firstName} ${patient.lastName}` : `Paciente ${note.patientId}`} className="h-8 w-8" />
                      <span className="font-medium text-on-surface">
                        {patient ? `${patient.firstName} ${patient.lastName}` : `Paciente #${note.patientId}`}
                      </span>
                    </div>
                    <span className="tabular text-xs text-on-surface-variant">{formatDateTime(note.createdAt)}</span>
                  </div>
                  <Badge className="mt-2 border-scheduled-200 bg-scheduled-50 text-scheduled-700">{note.diagnosis}</Badge>
                  <p className="mt-2 text-sm text-on-surface-variant">{note.treatment}</p>
                  {note.notes && <p className="mt-1 text-xs text-on-surface-variant italic">{note.notes}</p>}
                </div>
              )
            })}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Consulta activa" subtitle="Paciente en atención actual" />
          <CardBody>
            <div className="flex flex-col items-center gap-3 rounded-lg border border-slate-200 bg-surface-bright p-4 text-center">
              <Avatar name="María Gómez" className="h-14 w-14" />
              <div>
                <p className="font-display text-base font-semibold text-primary">María Gómez</p>
                <p className="text-sm text-on-surface-variant">DNI 70234561 · O+</p>
              </div>
              <Badge className="border-secondary/30 bg-secondary/10 text-secondary">En consulta</Badge>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Button variant="destructive" size="sm">
                <span className="material-symbols-outlined text-base">person_off</span>
                Marcar no asistió
              </Button>
              <Button variant="health" size="sm">
                <span className="material-symbols-outlined text-base">check_circle</span>
                Finalizar atención
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  )
}