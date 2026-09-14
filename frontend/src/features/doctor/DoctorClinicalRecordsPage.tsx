import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge, Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ErrorState, Spinner } from '@/components/ui/Feedback'
import { useAppointments, useConsultationNotes, useDoctors, useMutations, usePatients, usePrescriptions } from '@/hooks/queries'
import { useAuth } from '@/hooks/useAuth'
import { transitionCopy, useTransitionConfirm } from '@/hooks/useTransitionConfirm'
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
  const { data: prescriptions } = usePrescriptions()
  const { data: patients } = usePatients()
  const { data: doctors } = useDoctors()
  const { data: appointments } = useAppointments()
  const { user } = useAuth()
  const { createConsultationNote, updateStatus } = useMutations()
  const { pending, error: transitionError, ask, close, confirm } = useTransitionConfirm(updateStatus)
  const [modalOpen, setModalOpen] = useState(false)
  const [finishWarningOpen, setFinishWarningOpen] = useState(false)
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

  const activeAppointment = (appointments ?? [])
    .filter((a) => a.status === 'CHECKED_IN')
    .sort((a, b) => (a.date === b.date ? a.startTime.localeCompare(b.startTime) : a.date.localeCompare(b.date)))[0]

  const activePatient = activeAppointment ? (patients ?? []).find((p) => p.id === activeAppointment.patientId) : undefined

  const hasNote = activeAppointment ? (notes ?? []).some((n) => n.appointmentId === activeAppointment.id) : false
  const hasMedication = activeAppointment
    ? (prescriptions ?? []).some((p) => p.appointmentId === activeAppointment.id && p.medications.length > 0)
    : false

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

  const handleFinish = () => {
    if (!activeAppointment) return
    if (hasNote && hasMedication) {
      ask({ id: activeAppointment.id, status: 'COMPLETED' }, activeAppointment)
    } else {
      setFinishWarningOpen(true)
    }
  }

  const copy = transitionCopy(pending)

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
          <CardHeader title="Consulta activa" subtitle={activeAppointment ? 'Paciente en atención actual' : 'Sin paciente en consulta'} />
          <CardBody>
            {activeAppointment ? (
              <>
                <div className="flex flex-col items-center gap-3 rounded-lg border border-slate-200 bg-surface-bright p-4 text-center">
                  <Avatar name={activeAppointment?.patientName ?? 'Paciente'} className="h-14 w-14" />
                  <div>
                    <p className="font-display text-base font-semibold text-primary">{activeAppointment?.patientName}</p>
                    <p className="text-sm text-on-surface-variant">
                      {activePatient?.documentNumber ? `DNI ${activePatient.documentNumber} · ` : ''}
                      {activePatient?.bloodType ?? 'S/G'} · {activeAppointment?.code}
                    </p>
                  </div>
                  <StatusBadge status="CHECKED_IN" />
                </div>
                <div className="mt-3 flex flex-col gap-1 rounded-lg border border-slate-200 bg-surface-bright px-3 py-2 text-xs text-on-surface-variant">
                  <p>
                    <span className="material-symbols-outlined text-sm align-text-bottom">clinical_notes</span>{' '}
                    <strong>Nota de evolución:</strong> {hasNote ? 'Registrada' : 'Pendiente'}
                  </p>
                  <p>
                    <span className="material-symbols-outlined text-sm align-text-bottom">medication</span>{' '}
                    <strong>Medicamento recetado:</strong> {hasMedication ? 'Registrado' : 'Pendiente'}
                  </p>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <Button variant="destructive" size="sm" onClick={() => ask({ id: activeAppointment!.id, status: 'NO_SHOW' }, activeAppointment!)}>
                    <span className="material-symbols-outlined text-base">person_off</span>
                    Marcar no asistió
                  </Button>
                  <Button variant="health" size="sm" onClick={handleFinish}>
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    Finalizar atención
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-surface-bright p-6 text-center">
                <span className="material-symbols-outlined text-3xl text-slate-300">personal_off</span>
                <p className="text-sm text-on-surface-variant">No hay paciente en consulta activa.</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <Modal open={finishWarningOpen} onClose={() => setFinishWarningOpen(false)} title="Faltan registros para finalizar" size="sm">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-on-surface">
            {activeAppointment ? `El paciente ${activeAppointment.patientName} no tiene registrado:` : ''}
          </p>
          <ul className="flex flex-col gap-1">
            {!hasNote && <li className="text-sm text-on-surface-variant">• Nota de evolución (diagnóstico/tratamiento)</li>}
            {!hasMedication && <li className="text-sm text-on-surface-variant">• Un medicamento recetado</li>}
          </ul>
          <p className="text-sm text-on-surface">¿Desea finalizar la atención de todos modos?</p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setFinishWarningOpen(false)}>Cancelar</Button>
            <Button
              variant="health"
              onClick={() => {
                if (activeAppointment) ask({ id: activeAppointment.id, status: 'COMPLETED' }, activeAppointment)
                setFinishWarningOpen(false)
              }}
            >
              Sí, finalizar
            </Button>
          </div>
        </div>
      </Modal>

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

      <ConfirmDialog
        open={Boolean(pending)}
        title={copy?.title ?? ''}
        message={copy?.message ?? ''}
        confirmLabel={copy?.label ?? 'Confirmar'}
        variant={copy?.variant ?? 'primary'}
        loading={updateStatus.isPending}
        error={transitionError}
        onConfirm={confirm}
        onCancel={close}
      />
    </>
  )
}