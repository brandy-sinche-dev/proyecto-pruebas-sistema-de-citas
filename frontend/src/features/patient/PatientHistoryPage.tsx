import { PageHeader } from '@/components/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ErrorState, Spinner } from '@/components/ui/Feedback'
import { useConsultationNotes, usePrescriptions } from '@/hooks/queries'
import { formatDateTime } from '@/lib/utils'

export function PatientHistoryPage() {
  const { data: notes, isLoading: loadingNotes, isError, error, refetch } = useConsultationNotes()
  const { data: prescriptions, isLoading: loadingRx } = usePrescriptions()

  const mineNotes = notes ?? []
  const mineRx = prescriptions ?? []

  return (
    <>
      <PageHeader
        eyebrow="Portal del paciente"
        title="Historial clínico"
        description="Consulta tus atenciones, diagnósticos y exámenes realizados"
      />

      {(loadingNotes || loadingRx) && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} onRetry={refetch} />}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Notas médicas" subtitle="Diagnósticos y tratamientos indicados" icon={<span className="material-symbols-outlined text-lg">ecg</span>} />
          <CardBody className="flex flex-col gap-3">
            {mineNotes.length === 0 && <p className="text-sm text-on-surface-variant">Aún no tienes notas médicas registradas.</p>}
            {mineNotes.map((note) => (
              <div key={note.id} className="rounded-lg border border-slate-200 bg-surface-bright p-3">
                <div className="flex items-center justify-between">
                  <Badge className="border-scheduled-200 bg-scheduled-50 text-scheduled-700">{note.diagnosis}</Badge>
                  <span className="text-xs tabular text-on-surface-variant">{formatDateTime(note.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm text-on-surface-variant">{note.treatment}</p>
                {note.notes && <p className="mt-1 text-xs text-on-surface-variant italic">{note.notes}</p>}
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Recetas electrónicas" subtitle="Medicamentos prescritos y órdenes" icon={<span className="material-symbols-outlined text-lg">medication</span>} />
          <CardBody className="flex flex-col gap-3">
            {mineRx.length === 0 && <p className="text-sm text-on-surface-variant">Aún no tienes recetas registradas.</p>}
            {mineRx.map((rx) => (
              <div key={rx.id} className="rounded-lg border border-slate-200 bg-surface-bright p-3">
                <span className="text-xs tabular text-on-surface-variant">{formatDateTime(rx.createdAt)}</span>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {rx.medications.map((med, i) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-on-surface">{med.name}</span>
                      <span className="tabular text-on-surface-variant">{med.dosage} · {med.frequency}</span>
                    </li>
                  ))}
                </ul>
                {rx.instructions && <p className="mt-2 text-xs text-on-surface-variant italic">{rx.instructions}</p>}
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </>
  )
}