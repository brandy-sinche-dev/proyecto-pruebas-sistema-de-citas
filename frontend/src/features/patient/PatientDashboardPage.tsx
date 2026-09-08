import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Feedback'
import { useAppointments, useSpecialties } from '@/hooks/queries'

const DEMO_PATIENT_ID = 1

export function PatientDashboardPage() {
  const { data: appointments, isLoading } = useAppointments()
  const { data: specialties } = useSpecialties()

  const mine = (appointments ?? []).filter((a) => a.patientId === DEMO_PATIENT_ID)
  const next = mine.find((a) => a.status === 'CONFIRMED' || a.status === 'PENDING')

  return (
    <>
      <PageHeader
        eyebrow="Portal sanitario"
        title="Hola, María · Bienvenida a tu portal"
        description="Gestiona tus citas médicas, historial clínico y teleconsultas en un solo lugar"
        actions={
          <Link to="/paciente/agendar">
            <Button variant="health">
              <span className="material-symbols-outlined text-base">add_circle</span>
              Agendar nueva cita
            </Button>
          </Link>
        }
      />

      {isLoading && <Spinner />}

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-primary">Próxima cita</h2>
            <StatusBadge status={next?.status ?? 'PENDING'} />
          </div>
          {next ? (
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-xl font-bold text-primary">{next.specialtyName}</p>
                <p className="text-sm text-on-surface-variant">con {next.doctorName}</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-on-surface">
                  <span className="material-symbols-outlined text-base text-secondary">calendar_month</span>
                  <span className="tabular">{new Date(`${next.date}T00:00:00`).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                  <span className="tabular">· {next.startTime} h</span>
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-base text-secondary">meeting_room</span>
                  {next.box ?? 'Box por confirmar'}
                </p>
              </div>
              <span className="material-symbols-outlined rounded-xl bg-primary-fixed p-4 text-4xl text-primary">medical_services</span>
            </div>
          ) : (
            <p className="mt-4 text-sm text-on-surface-variant">No tienes citas programadas. Agenda una nueva cita con tus especialistas de confianza.</p>
          )}
          <div className="mt-5 flex gap-2">
            <Link to="/paciente/citas">
              <Button variant="secondary" size="sm">Ver mis citas</Button>
            </Link>
            <Link to="/paciente/historial">
              <Button variant="ghost" size="sm">Ver historial</Button>
            </Link>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-lg font-semibold text-primary">Resumen</h2>
          <dl className="mt-3 flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-lg bg-surface-bright p-3">
              <dt className="text-sm text-on-surface-variant">Citas totales</dt>
              <dd className="font-display text-lg font-bold tabular text-primary">{mine.length}</dd>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-surface-bright p-3">
              <dt className="text-sm text-on-surface-variant">Atendidas</dt>
              <dd className="font-display text-lg font-bold tabular text-primary">{mine.filter((a) => a.status === 'COMPLETED').length}</dd>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-surface-bright p-3">
              <dt className="text-sm text-on-surface-variant">Pendientes</dt>
              <dd className="font-display text-lg font-bold tabular text-primary">{mine.filter((a) => a.status === 'PENDING').length}</dd>
            </div>
          </dl>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold text-primary">Especialidades en la clínica</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {(specialties ?? []).map((s) => (
            <Link key={s.id} to="/paciente/agendar" className="card flex flex-col items-center gap-2 p-4 text-center transition-shadow hover:shadow-tier2">
              <span className="material-symbols-outlined rounded-lg p-2 text-2xl text-on-primary" style={{ backgroundColor: s.color ?? '#0F2942' }}>
                {s.icon ?? 'local_hospital'}
              </span>
              <span className="text-sm font-semibold text-primary">{s.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}