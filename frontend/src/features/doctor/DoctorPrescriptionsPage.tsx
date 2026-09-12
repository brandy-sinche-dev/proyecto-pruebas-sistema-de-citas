import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ErrorState, Spinner } from '@/components/ui/Feedback'
import { useAppointments, useDoctors, useMutations, usePatients, usePrescriptions } from '@/hooks/queries'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/lib/utils'
import type { MedicationInput, Prescription } from '@/types'

const prescriptionSchema = z.object({
  appointmentId: z.coerce.number().int().positive('Selecciona una cita'),
  instructions: z.string().optional().default(''),
  notes: z.string().optional().default(''),
})

type PrescriptionFormValues = z.infer<typeof prescriptionSchema>
type PrescriptionFormInput = z.input<typeof prescriptionSchema>

const emptyMedication = (): MedicationInput => ({ name: '', dosage: '', frequency: '', duration: '' })

export function DoctorPrescriptionsPage() {
  const { data: prescriptions, isLoading, isError, error, refetch } = usePrescriptions()
  const { data: patients } = usePatients()
  const { data: doctors } = useDoctors()
  const { data: appointments } = useAppointments()
  const { user } = useAuth()
  const { createPrescription } = useMutations()
  const [modalOpen, setModalOpen] = useState(false)
  const [medications, setMedications] = useState<MedicationInput[]>([emptyMedication()])
  const [medicationsError, setMedicationsError] = useState<string>()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PrescriptionFormInput, unknown, PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: { appointmentId: undefined, instructions: '', notes: '' },
  })

  const doctorId = (doctors ?? []).find((doctor) => doctor.email === user?.email)?.id
  const mine = doctorId ? (prescriptions ?? []).filter((p) => p.doctorId === doctorId) : (prescriptions ?? [])

  const submitError =
    createPrescription.isError && createPrescription.error
      ? createPrescription.error instanceof Error
        ? createPrescription.error.message
        : 'No se pudo emitir la receta'
      : undefined

  function updateMedication(index: number, field: keyof MedicationInput, value: string) {
    setMedications((prev) => prev.map((med, i) => (i === index ? { ...med, [field]: value } : med)))
    setMedicationsError(undefined)
  }

  function addMedication() {
    setMedications((prev) => [...prev, emptyMedication()])
  }

  function removeMedication(index: number) {
    setMedications((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))
  }

  const onSubmit = handleSubmit((values) => {
    const meds = medications.filter((med) => med.name.trim())
    if (meds.length === 0) {
      setMedicationsError('Agrega al menos un medicamento')
      return
    }
    createPrescription.mutate(
      {
        appointmentId: values.appointmentId,
        medications: meds,
        instructions: values.instructions,
        notes: values.notes,
      },
      {
        onSuccess: () => {
          setModalOpen(false)
          setMedications([emptyMedication()])
          reset({ appointmentId: undefined, instructions: '', notes: '' })
        },
      },
    )
  })

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
          <Button variant="health" onClick={() => setModalOpen(true)}>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva receta médica" size="lg">
        <form className="flex flex-col gap-4" noValidate onSubmit={onSubmit}>
          <Select label="Cita" error={errors.appointmentId?.message} {...register('appointmentId')}>
            <option value="">Selecciona la cita</option>
            {(appointments ?? []).map((appointment) => {
              const patient = (patients ?? []).find((p) => p.id === appointment.patientId)
              return (
                <option key={appointment.id} value={appointment.id}>
                  {appointment.date} {appointment.startTime} — {patient ? `${patient.firstName} ${patient.lastName}` : appointment.patientName}
                </option>
              )
            })}
          </Select>

          <div className="flex flex-col gap-2">
            <p className="label">Medicamentos</p>
            {medications.map((med, index) => (
              <div key={index} className="grid gap-2 rounded-lg border border-slate-200 bg-surface-bright p-3 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]">
                <Input label="Medicamento" placeholder="Ej.: Enalapril" value={med.name} onChange={(e) => updateMedication(index, 'name', e.target.value)} />
                <Input label="Dosis" placeholder="Ej.: 10mg" value={med.dosage} onChange={(e) => updateMedication(index, 'dosage', e.target.value)} />
                <Input label="Frecuencia" placeholder="Ej.: 24" value={med.frequency} onChange={(e) => updateMedication(index, 'frequency', e.target.value)} />
                <Input label="Duración" placeholder="Ej.: 30 días" value={med.duration} onChange={(e) => updateMedication(index, 'duration', e.target.value)} />
                <Button type="button" variant="ghost" size="sm" className="mt-6 text-red-600" onClick={() => removeMedication(index)}>
                  <span className="material-symbols-outlined text-base">delete</span>
                </Button>
              </div>
            ))}
            {medicationsError && <p className="text-sm text-red-600">{medicationsError}</p>}
            <Button type="button" variant="secondary" size="sm" className="self-start" onClick={addMedication}>
              <span className="material-symbols-outlined text-base">add</span>
              Agregar medicamento
            </Button>
          </div>

          <Textarea label="Instrucciones" placeholder="Ej.: Tomar después de las comidas..." error={errors.instructions?.message} {...register('instructions')} />
          <Textarea label="Notas (opcional)" placeholder="Comentarios adicionales..." error={errors.notes?.message} {...register('notes')} />
          {submitError && (
            <p className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">{submitError}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="health" disabled={createPrescription.isPending}>
              {createPrescription.isPending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
              Emitir receta
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}