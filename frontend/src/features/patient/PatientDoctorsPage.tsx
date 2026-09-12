import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ErrorState, Spinner } from '@/components/ui/Feedback'
import { useDoctors, useAvailability } from '@/hooks/queries'

export function PatientDoctorsPage() {
  const { data: doctors, isLoading, isError, error, refetch } = useDoctors()
  const { data: slots } = useAvailability()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const goToBooking = (doctorId: number) => {
    navigate('/paciente/agendar', { state: { doctorId } })
  }

  const visible = useMemo(() => {
    const q = query.toLowerCase()
    return (doctors ?? []).filter((d) => {
      const name = `${d.firstName} ${d.lastName} ${d.specialtyName}`.toLowerCase()
      return name.includes(q)
    })
  }, [doctors, query])

  const nextSlot = (doctorId: number) =>
    (slots ?? [])
      .filter((s) => s.doctorId === doctorId && s.status === 'ACTIVE' && s.date >= new Date().toISOString().split('T')[0])
      .sort((a, b) => a.date.localeCompare(b.date))[0]

  return (
    <>
      <PageHeader
        eyebrow="Portal del paciente"
        title="Buscar médicos"
        description="Encuentra al especialista indicado y consulta su disponibilidad"
        actions={
          <div className="flex items-center rounded-lg bg-surface px-3 py-2 shadow-tier1">
            <span className="material-symbols-outlined mr-2 text-lg text-on-surface-variant">search</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o especialidad…"
              aria-label="Buscar médico"
              className="w-56 bg-transparent text-sm text-on-surface placeholder:text-outline focus:outline-none"
            />
          </div>
        }
      />

      {isLoading && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} onRetry={refetch} />}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((d) => {
          const slot = nextSlot(d.id)
          return (
            <Card key={d.id} className="p-5 transition-shadow hover:shadow-tier2">
              <div className="flex items-center gap-3">
                <Avatar name={`${d.firstName} ${d.lastName}`} className="h-12 w-12" />
                <div>
                  <p className="font-display text-base font-semibold text-primary">{d.firstName} {d.lastName}</p>
                  <p className="text-sm text-on-surface-variant">{d.specialtyName}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge>{d.box ?? 'Box por asignar'}</Badge>
                {d.available ? (
                  <Badge className="border-success-200 bg-success-50 text-success-700">Disponible</Badge>
                ) : (
                  <Badge className="border-danger-200 bg-danger-50 text-danger-700">Sin cupos</Badge>
                )}
              </div>
              <p className="mt-3 text-sm text-on-surface-variant">
                {slot ? (
                  <>
                    Próxima disponibilidad:{' '}
                    <strong className="tabular text-on-surface">
                      {new Date(`${slot.date}T00:00:00`).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </strong>{' '}
                    <span className="tabular">{slot.startTime}–{slot.endTime}</span>
                  </>
                ) : (
                  'Sin horarios publicados próximamente.'
                )}
              </p>
              <Button variant={d.available ? 'health' : 'secondary'} disabled={!d.available} className="mt-4 w-full" onClick={() => goToBooking(d.id)}>
                <span className="material-symbols-outlined text-base">calendar_add_on</span>
                Reservar cita
              </Button>
            </Card>
          )
        })}
      </section>
    </>
  )
}