import { PageHeader } from '@/components/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ErrorState, Spinner } from '@/components/ui/Feedback'
import { usePrescriptions, usePatients } from '@/hooks/queries'
import { formatDate } from '@/lib/utils'
import type { Prescription } from '@/types'

const DEMO_DOCTOR_ID = 1

export function DoctorPrescriptionsPage() {
  const { data: prescriptions, isLoading, isError, error, refetch } = usePrescriptions()
  const { data: patients } = usePatients()

  const mine = (prescriptions ?? []).filter((p) => p.doctorId === DEMO_DOCTOR_ID)

  const renderDoses = (prescription: Prescription) => (
    <ul className="mt-2 flex flex-col gap-1">
      {prescription.medications.map((med) => (
        <li key={med.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-surface-bright px-3 py-2 text-sm">
          <div>
            <p className="font-medium text-on-surface">{med.name}</p>
            <p className="text-xs text-on-surface-variant">{med.dosage} · cada {med.frequency}hs</p>
          </div>
          <Badge className="border-scheduled-200 bg-scheduled-50 text-scheduled-700">{med.duration}</Badge>
        </li>
      ))}
    </ul>
  )

  return (
    <>
      <PageHeader
        eyebrow="Portal médico asistencial"
        title="Recetas médicas"
        description="Prescripciones emitidas y estado de despacho en farmacia"
        actions={
          <Button variant="health">
            <span className="material-symbols-outlined text-base">add_circle</span>
            Nueva receta
          </Button>
        }
      />

      {isLoading && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} onRetry={refetch} />}

      <Card>
        <CardHeader title="Prescripciones emitidas" subtitle="Sincroniza el estado en la farmacia de la clínica" />
        <CardBody className="flex flex-col gap-4">
          {mine.length === 0 && <p className="text-sm text-on-surface-variant">No has emitido recetas todavía.</p>}
          {mine.map((prescription) => {
            const patient = (patients ?? []).find((p) => p.id === prescription.patientId)
            return (
              <div key={prescription.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar name={patient ? `${patient.firstName} ${patient.lastName}` : `Paciente ${prescription.patientId}`} className="h-9 w-9" />
                    <div>
                      <p className="font-medium text-on-surface">
                        {patient ? `${patient.firstName} ${patient.lastName}` : `Paciente #${prescription.patientId}`}
                      </p>
                      <p className="text-xs tabular text-on-surface-variant">Receta {prescription.code} · {formatDate(prescription.date)}</p>
                    </div>
                  </div>
                  <Badge className="border-success-200 bg-success-50 text-success-700">En farmacia</Badge>
                </div>
                {renderDoses(prescription)}
                {prescription.notes && <p className="mt-2 text-xs italic text-on-surface-variant">Nota: {prescription.notes}</p>}
              </div>
            )
          })}
        </CardBody>
      </Card>
    </>
  )
}