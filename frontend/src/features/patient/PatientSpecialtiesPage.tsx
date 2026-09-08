import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ErrorState, Spinner } from '@/components/ui/Feedback'
import { useDoctors, useSpecialties } from '@/hooks/queries'

export function PatientSpecialtiesPage() {
  const { data: specialties, isLoading, isError, error, refetch } = useSpecialties()
  const { data: doctors } = useDoctors()

  return (
    <>
      <PageHeader
        eyebrow="Portal del paciente"
        title="Especialidades"
        description="Conoce las especialidades médicas disponibles en Clínica Angry"
      />

      {isLoading && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} onRetry={refetch} />}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(specialties ?? []).map((s) => {
          const count = (doctors ?? []).filter((d) => d.specialtyId === s.id && d.available).length
          return (
            <Card key={s.id} className="p-5 transition-shadow hover:shadow-tier2">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined rounded-lg p-2 text-3xl text-on-primary" style={{ backgroundColor: s.color ?? '#0F2942' }}>
                  {s.icon ?? 'local_hospital'}
                </span>
                <h3 className="font-display text-lg font-semibold text-primary">{s.name}</h3>
              </div>
              <p className="mt-3 text-sm text-on-surface-variant">
                {s.description ?? 'Atención médica especializada con profesionales certificados.'}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className={`badge-pill border ${count > 0 ? 'border-success-200 bg-success-50 text-success-700' : 'border-slate-200 bg-surface-bright text-on-surface-variant'}`}>
                  {count > 0 ? `${count} médico${count === 1 ? '' : 's'} disponible${count === 1 ? '' : 's'}` : 'Sin disponibilidad'}
                </span>
                <Link to={`/paciente/agendar?especialidad=${s.id}`}>
                  <Button size="sm" variant={count > 0 ? 'health' : 'secondary'} disabled={count === 0}>
                    Agendar
                  </Button>
                </Link>
              </div>
            </Card>
          )
        })}
      </section>
    </>
  )
}