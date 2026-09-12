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
import { useAppointments, useConsultationNotes, useDoctors, useMutations, usePatients } from '@/hooks/queries'
import { useAuth } from '@/hooks/useAuth'
import { formatDateTime } from '@/lib/utils'

const noteSchema = z.object({
  appointmentId: z.coerce.number().int().positive('Selecciona una cita'),
  diagnosis: z.string().min(3, 'El diagnóstico es obligatorio'),
  treatment: z.string().min(3, 'Indica el tratamiento'),
  notes: z.string().optional().default(''),
})

type NoteFormValues = z.infer<typeof noteSchema>
type NoteFormInput = z.input<typeof noteSchema>

export function DoctorClinicalRecordsPage() {
  const { data: notes, isLoading: loadingNotes, isError, error, refetch } = useConsultationNotes()
  const { data: patients } = usePatients()
  const { data: doctors } = useDoctors()
  const { data: appointments } = useAppointments()
  const { user } = useAuth()
  const { createConsultationNote } = useMutations()
  const [modalOpen, setModalOpen] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NoteFormInput, unknown, NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: { appointmentId: undefined, diagnosis: '', treatment: '', notes: '' },
  })

  const doctorId = (doctors ?? []).find((doctor) => doctor.email === user?.email)?.id
  const mine = doctorId ? (notes ?? []).filter((note) => note.doctorId === doctorId) : (notes ?? [])

  const submitError =
    createConsultationNote.isError && createConsultationNote.error
      ? createConsultationNote.error instanceof Error
        ? createConsultationNote.error.message
        : 'No se pudo guardar la nota'
      : undefined

  const onSubmit = handleSubmit((values) => {
    createConsultationNote.mutate(values, {
      onSuccess: () => {
        setModalOpen(false)
        reset({ appointmentId: undefined, diagnosis: '', treatment: '', notes: '' })
      },
    })
  })

  return (
    <>
      <PageHeader
        eyebrow="Portal médico asistencial"
        title="Ficha clínica"
        description="Historial de consultas atendidas y notas de evolución"
        actions={
          <Button variant="health" onClick={() => setModalOpen(true)}>
            <span className="material-symbols-outlined text-base">add</span>
            Nueva nota
          </Button>
        }
      />

      {loadingNotes && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} onRetry={refetch} />}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Notas de evolución" subtitle="Registra diagnóstico, tratamiento y seguimiento" icon={<span className="material-symbols-outlined text-lg">ecg</span>} />
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva nota de evolución">
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
          <Input label="Diagnóstico" placeholder="Ej.: Hipertensión arterial" error={errors.diagnosis?.message} {...register('diagnosis')} />
          <Textarea label="Tratamiento" placeholder="Indicaciones médicas..." error={errors.treatment?.message} {...register('treatment')} />
          <Textarea label="Notas (opcional)" placeholder="Comentarios adicionales..." error={errors.notes?.message} {...register('notes')} />
          {submitError && (
            <p className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">{submitError}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="health" disabled={createConsultationNote.isPending}>
              {createConsultationNote.isPending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
              Guardar nota
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}