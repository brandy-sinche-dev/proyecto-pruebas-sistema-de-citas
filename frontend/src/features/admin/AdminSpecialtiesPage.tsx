import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ErrorState, Spinner } from '@/components/ui/Feedback'
import { useDoctors, useSpecialties } from '@/hooks/queries'

export function AdminSpecialtiesPage() {
  const { data: specialties, isLoading, isError, error, refetch } = useSpecialties()
  const { data: doctors } = useDoctors()
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')

  return (
    <>
      <PageHeader
        eyebrow="Catálogo clínico"
        title="Especialidades"
        description="Especialidades médicas atendidas en la clínica"
        actions={<Button variant="health" onClick={() => setShowModal(true)}><span className="material-symbols-outlined text-base">add</span> Nueva especialidad</Button>}
      />

      {isLoading && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} onRetry={refetch} />}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(specialties ?? []).map((s) => {
          const doctorCount = (doctors ?? []).filter((d) => d.specialtyId === s.id).length
          return (
            <Card key={s.id} className="p-4 transition-shadow hover:shadow-tier2">
              <div className="flex items-start justify-between">
                <span
                  className="material-symbols-outlined rounded-lg p-2 text-2xl text-on-primary"
                  style={{ backgroundColor: s.color ?? '#0F2942' }}
                  aria-hidden="true"
                >
                  {s.icon ?? 'local_hospital'}
                </span>
                <span className="badge-pill border border-slate-200 bg-surface-bright text-on-surface-variant">
                  {doctorCount} médico{doctorCount === 1 ? '' : 's'}
                </span>
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold text-primary">{s.name}</h3>
              <p className="mt-1 text-sm text-on-surface-variant">{s.description ?? 'Atención especializada en la sede San Isidro.'}</p>
            </Card>
          )
        })}
      </section>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nueva especialidad">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setShowModal(false)
            setName('')
          }}
          className="flex flex-col gap-4"
        >
          <Input label="Nombre de la especialidad" placeholder="Oftalmología" value={name} onChange={(e) => setName(e.target.value)} required />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}