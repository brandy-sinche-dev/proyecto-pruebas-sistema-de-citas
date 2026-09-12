import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ErrorState, Spinner } from '@/components/ui/Feedback'
import { useAppointments, useMutations } from '@/hooks/queries'
import { transitionCopy, useTransitionConfirm } from '@/hooks/useTransitionConfirm'

const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']

export function DoctorAgendaPage() {
  const { data: appointments, isLoading, isError, error, refetch } = useAppointments()
  const { updateStatus } = useMutations()
  const { pending, error: transitionError, ask, close, confirm } = useTransitionConfirm(updateStatus)
  const [dayOffset, setDayOffset] = useState(0)

  const today = new Date()
  today.setDate(today.getDate() + dayOffset)
  const dateKey = today.toISOString().split('T')[0]

  const dayAppointments = (appointments ?? [])
    .filter((a) => a.date === dateKey)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  const appointmentForHour = (hour: string) =>
    dayAppointments.find((a) => a.startTime.split(':')[0] === hour.split(':')[0])

  const copy = transitionCopy(pending)

  return (
    <>
      <PageHeader
        eyebrow="Portal médico asistencial"
        title={`Agenda diaria · ${today.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}`}
        description="Box 104 · Cardiología Adultos · En guardia activa"
        actions={
          <div className="flex items-center gap-1 rounded-lg bg-surface p-1">
            <Button variant="ghost" size="sm" onClick={() => setDayOffset((o) => o - 1)} aria-label="Día anterior">
              <span className="material-symbols-outlined text-base">chevron_left</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDayOffset(0)}>Hoy</Button>
            <Button variant="ghost" size="sm" onClick={() => setDayOffset((o) => o + 1)} aria-label="Día siguiente">
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </Button>
          </div>
        }
      />

      {isLoading && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} onRetry={refetch} />}

      <Card>
        <CardHeader title={`Turnos del día (${dayAppointments.length})`} subtitle="Haz clic en una acción para actualizar el estado del turno" />
        <CardBody className="flex flex-col gap-2">
          {dayAppointments.length === 0 && (
            <p className="py-6 text-center text-sm text-on-surface-variant">No tienes citas programadas para esta fecha.</p>
          )}
          {dayAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex flex-col gap-2 rounded-lg border border-slate-200 border-l-4 p-3 sm:flex-row sm:items-center sm:justify-between"
              style={{ borderLeftColor: appointment.status === 'CONFIRMED' ? '#0D9488' : appointment.status === 'PENDING' ? '#F59E0B' : '#334155' }}
            >
              <div className="flex items-center gap-3">
                <span className="font-display text-xl font-bold tabular text-primary">{appointment.startTime}</span>
                <div>
                  <p className="font-medium text-on-surface">{appointment.patientName}</p>
                  <p className="text-sm text-on-surface-variant">{appointment.reason ?? 'Consulta médica'}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={appointment.status} />
                {appointment.status === 'PENDING' && (
                  <>
                    <Button size="sm" variant="health" onClick={() => ask({ id: appointment.id, status: 'CONFIRMED' }, appointment)}>Confirmar</Button>
                    <Button size="sm" variant="destructive" onClick={() => ask({ id: appointment.id, status: 'CANCELLED' }, appointment)}>Rechazar</Button>
                  </>
                )}
                {appointment.status === 'CONFIRMED' && (
                  <>
                    <Button size="sm" variant="health" onClick={() => ask({ id: appointment.id, status: 'COMPLETED' }, appointment)}>
                      Iniciar consulta
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => ask({ id: appointment.id, status: 'NO_SHOW' }, appointment)}>
                      No asistió
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}

          {dayOffset === 0 && (
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {HOURS.map((hour) => {
                const appt = appointmentForHour(hour)
                return (
                  <div key={hour} className="rounded-lg border border-slate-200 bg-surface-bright p-2">
                    <p className="tabular text-xs font-semibold text-on-surface-variant">{hour} h</p>
                    {appt ? (
                      <p className="text-sm text-on-surface">{appt.patientName}</p>
                    ) : (
                      <p className="text-sm text-slate-300">Libre</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardBody>
      </Card>

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