import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { AlertBanner, Spinner } from '@/components/ui/Feedback'
import { useDoctors, useMutations, useSpecialties, useAvailability } from '@/hooks/queries'
import { appointmentSchema, type AppointmentFormValues } from '@/schemas'
import { formatDateTime } from '@/lib/utils'
import { z } from 'zod'

const DEMO_PATIENT_ID = 1
const STEPS = ['Especialidad y médico', 'Fecha y hora', 'Confirmación']
type AppointmentFormInput = z.input<typeof appointmentSchema>

export function PatientBookAppointmentPage() {
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const { data: specialties, isLoading: loadingSpecialties } = useSpecialties()
  const { data: doctors, isLoading: loadingDoctors } = useDoctors()
  const { data: slots } = useAvailability()
  const { createAppointment } = useMutations()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AppointmentFormInput, unknown, AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: { specialtyId: undefined, doctorId: undefined, date: '', startTime: '' },
  })

  const specialtyId = watch('specialtyId')
  const doctorId = watch('doctorId')
  const date = watch('date')

  const specialtyDoctors = useMemo(
    () => (doctors ?? []).filter((d) => d.specialtyId === specialtyId && d.available),
    [doctors, specialtyId],
  )
  const selectedDoctor = (doctors ?? []).find((d) => d.id === doctorId)
  const selectedSpecialty = (specialties ?? []).find((s) => s.id === specialtyId)

  const availableTimes = useMemo(() => {
    if (!doctorId || !date) return []
    const window = (slots ?? []).find((s) => s.doctorId === doctorId && s.date === date && s.status === 'ACTIVE')
    if (!window) return []
    const [sh, sm] = window.startTime.split(':').map(Number)
    const [eh, em] = window.endTime.split(':').map(Number)
    const times: string[] = []
    for (let h = sh; h < eh; h++) {
      for (const m of sm === 0 ? [0, 30] : [sm]) {
        if (h === eh && m >= em) continue
        times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
      }
    }
    return times
  }, [doctorId, date, slots])

  function nextStep() {
    if (step === 0 && (!specialtyId || !doctorId)) return
    if (step === 1 && (!date || !watch('startTime'))) return
    setError(null)
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0))
  }

  async function confirm(values: AppointmentFormValues) {
    setError(null)
    createAppointment.mutate(
      {
        patientId: DEMO_PATIENT_ID,
        doctorId: values.doctorId,
        specialtyId: values.specialtyId,
        date: values.date,
        startTime: values.startTime,
        reason: values.reason,
      },
      {
        onSuccess: () => setStep(STEPS.length),
        onError: (err) => setError(err.message),
      },
    )
  }

  if (step === STEPS.length) {
    return (
      <>
        <PageHeader eyebrow="Portal del paciente" title="Agendar nueva cita" />
        <Card className="mx-auto flex max-w-lg flex-col items-center gap-3 p-8 text-center">
          <span className="material-symbols-outlined rounded-full bg-success-50 p-4 text-5xl text-success-700">check_circle</span>
          <h2 className="font-display text-xl font-bold text-primary">¡Cita solicitada!</h2>
          <p className="text-sm text-on-surface-variant">
            Tu cita quedó registrada como <strong className="text-on-surface">Pendiente de confirmación</strong>. Recibirás la confirmación del consultorio.
          </p>
          <div className="mt-2 flex gap-2">
            <Link to="/paciente/citas"><Button>Ver mis citas</Button></Link>
            <Link to="/paciente"><Button variant="secondary">Ir al portal</Button></Link>
          </div>
        </Card>
      </>
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="Portal del paciente"
        title="Agendar nueva cita"
        description="Paso a paso para reservar tu atención con un especialista"
      />

      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col gap-1">
            <div className={`h-1.5 rounded-full ${i <= step ? 'bg-secondary' : 'bg-slate-200'}`} />
            <span className={`text-xs font-medium ${i === step ? 'text-secondary' : 'text-on-surface-variant'}`}>
              {i + 1}. {label}
            </span>
          </div>
        ))}
      </div>

      {error && !step && <AlertBanner variant="error">{error}</AlertBanner>}

      <form onSubmit={handleSubmit(confirm)} className="flex flex-col gap-4" noValidate>
        {step === 0 && (
          <Card className="p-5">
            {loadingSpecialties || loadingDoctors ? (
              <Spinner />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <Select label="Especialidad" error={errors.specialtyId?.message} {...register('specialtyId', { valueAsNumber: true })}>
                  <option value="">Selecciona la especialidad…</option>
                  {(specialties ?? []).map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Select>
                <Select
                  label="Médico"
                  error={errors.doctorId?.message}
                  disabled={!specialtyId}
                  {...register('doctorId', { valueAsNumber: true })}
                  onChange={(e) => {
                    setValue('doctorId', Number(e.target.value))
                    setValue('startTime', '')
                  }}
                >
                  <option value="">{specialtyId ? 'Selecciona el médico…' : 'Primero escoge especialidad'}</option>
                  {specialtyDoctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.firstName} {d.lastName} · {d.box ?? 'Box por asignar'}
                    </option>
                  ))}
                </Select>
                {specialtyId != null && specialtyDoctors.length === 0 && (
                  <p className="sm:col-span-2 text-sm text-on-surface-variant">
                    No hay médicos disponibles para esta especialidad por el momento.
                  </p>
                )}
              </div>
            )}
          </Card>
        )}

        {step === 1 && selectedDoctor && (
          <Card className="p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Fecha" type="date" min={new Date().toISOString().split('T')[0]} error={errors.date?.message} {...register('date')} />
              <Select label="Hora disponible" error={errors.startTime?.message} disabled={!date} {...register('startTime')} onChange={(e) => setValue('startTime', e.target.value)}>
                <option value="">{date ? 'Elige una hora…' : 'Primero selecciona fecha'}</option>
                {availableTimes.map((t) => (
                  <option key={t} value={t}>{t} h</option>
                ))}
              </Select>
            </div>
            {availableTimes.length === 0 && date && (
              <p className="mt-3 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">
                No hay horarios publicados para {selectedDoctor.firstName} {selectedDoctor.lastName} en esa fecha. Fuera de la ventana de disponibilidad.
              </p>
            )}
          </Card>
        )}

        {step === 2 && (
          <Card className="p-5">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-outline">Especialidad</dt>
                <dd className="mt-1 text-on-surface">{selectedSpecialty?.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-outline">Médico</dt>
                <dd className="mt-1 text-on-surface">{selectedDoctor?.firstName} {selectedDoctor?.lastName}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-outline">Fecha y hora</dt>
                <dd className="mt-1 tabular text-on-surface">{date && formatDateTime(`${date}T00:00:00`)} · {watch('startTime')} h</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-outline">Box</dt>
                <dd className="mt-1 tabular text-on-surface">{selectedDoctor?.box ?? 'Por asignar'}</dd>
              </div>
            </dl>
            <div className="mt-4">
              <Textarea label="Motivo de la consulta (opcional)" placeholder="Describe brevemente tu motivo…" error={errors.reason?.message} {...register('reason')} />
            </div>
          </Card>
        )}

        <div className="flex justify-between gap-2">
          {step > 0 ? (
            <Button variant="secondary" type="button" onClick={back}>Anterior</Button>
          ) : (
            <span />
          )}
          {step < 2 ? (
            <Button type="button" onClick={nextStep} disabled={step === 0 && (!specialtyId || !doctorId)}>
              Continuar
            </Button>
          ) : (
            <Button type="submit" variant="health" disabled={createAppointment.isPending}>
              {createAppointment.isPending ? 'Reservando…' : 'Confirmar reserva'}
            </Button>
          )}
        </div>
      </form>
    </>
  )
}