import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { AlertBanner, ErrorState, Spinner } from '@/components/ui/Feedback'
import { useDoctors, useMutations, useSpecialties } from '@/hooks/queries'
import type { Doctor } from '@/types'

const doctorFormSchema = z.object({
  firstName: z.string().min(2, 'El nombre es obligatorio'),
  lastName: z.string().min(2, 'El apellido es obligatorio'),
  email: z.string().email('Correo no válido'),
  licenseNumber: z.string().min(5, 'N° de colegiatura inválido'),
  specialty: z.coerce.number().int().positive('Selecciona una especialidad'),
  box: z.string().optional(),
  available: z.boolean().default(true),
})

type DoctorFormInput = z.input<typeof doctorFormSchema>
type DoctorFormValues = z.infer<typeof doctorFormSchema>

export function AdminDoctorsPage() {
  const { data: doctors, isLoading, isError, error, refetch } = useDoctors()
  const { data: specialties } = useSpecialties()
  const { createDoctor } = useMutations()
  const [selected, setSelected] = useState<Doctor | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DoctorFormInput, unknown, DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: { available: true },
  })

  const columns: Array<Column<Doctor>> = [
    {
      key: 'name',
      header: 'Médico',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={`${row.firstName} ${row.lastName}`} />
          <div>
            <p className="font-medium text-on-surface">{row.firstName} {row.lastName}</p>
            <p className="text-xs tabular text-on-surface-variant">{row.licenseNumber}</p>
          </div>
        </div>
      ),
    },
    { key: 'specialty', header: 'Especialidad', render: (row) => <Badge className="border-primary-fixed bg-primary-fixed/40 text-primary">{row.specialtyName}</Badge> },
    { key: 'box', header: 'Box', render: (row) => <span className="tabular">{row.box ?? '—'}</span> },
    { key: 'email', header: 'Correo', render: (row) => <span className="text-on-surface-variant">{row.email}</span> },
    {
      key: 'status',
      header: 'Disponibilidad',
      render: (row) =>
        row.available ? (
          <span className="badge-pill border border-success-200 bg-success-50 text-success-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> Disponible
          </span>
        ) : (
          <span className="badge-pill border border-danger-200 bg-danger-50 text-danger-700">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600" /> No disponible
          </span>
        ),
    },
  ]

  function onSubmit(values: DoctorFormValues) {
    setErrorMsg(null)
    createDoctor.mutate(
      {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        licenseNumber: values.licenseNumber,
        specialty: values.specialty,
        box: values.box ?? '',
        available: values.available,
      },
      {
        onSuccess: () => {
          setShowModal(false)
          reset()
        },
        onError: (err) => setErrorMsg(err.message),
      },
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="Gestión de personal"
        title="Médicos y turnos"
        description="Gestión de especialistas, boxes asignados y disponibilidad"
        actions={
          <Button variant="health" onClick={() => setShowModal(true)}>
            <span className="material-symbols-outlined text-base">person_add</span>
            Nuevo médico
          </Button>
        }
      />

      {isLoading && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} onRetry={refetch} />}

      <Card>
        <CardHeader title="Staff médico" subtitle="Médicos registrados en la sede San Isidro" />
        <CardBody className="p-0">
          <DataTable columns={columns} rows={doctors ?? []} onRowClick={setSelected} empty="No hay médicos registrados" />
        </CardBody>
      </Card>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={`Ficha: ${selected ? `${selected.firstName} ${selected.lastName}` : ''}`}>
        {selected && (
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-outline">Colegiatura</dt>
              <dd className="mt-1 tabular text-on-surface">{selected.licenseNumber}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-outline">Especialidad</dt>
              <dd className="mt-1 text-on-surface">{selected.specialtyName}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-outline">Box</dt>
              <dd className="mt-1 tabular text-on-surface">{selected.box ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-outline">Teléfono</dt>
              <dd className="mt-1 tabular text-on-surface">{selected.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-outline">Correo</dt>
              <dd className="mt-1 text-on-surface">{selected.email}</dd>
            </div>
            {selected.availabilitySlots && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-outline">Turnos activos</dt>
                <dd className="mt-1 tabular text-on-surface">{selected.availabilitySlots.length}</dd>
              </div>
            )}
          </dl>
        )}
      </Modal>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Registrar médico">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          {errorMsg && <AlertBanner variant="error">{errorMsg}</AlertBanner>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nombres" placeholder="Elena" error={errors.firstName?.message} {...register('firstName')} />
            <Input label="Apellidos" placeholder="Ramos" error={errors.lastName?.message} {...register('lastName')} />
          </div>
          <Input label="Correo" type="email" placeholder="medico@clinicangry.com" error={errors.email?.message} {...register('email')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="N° de colegiatura" placeholder="CMP-0000" error={errors.licenseNumber?.message} {...register('licenseNumber')} />
            <Select label="Especialidad" error={errors.specialty?.message} {...register('specialty')}>
              <option value="">Selecciona…</option>
              {(specialties ?? []).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Box" placeholder="Box 104" error={errors.box?.message} {...register('box')} />
            <label className="flex items-center gap-3 rounded-lg bg-surface px-3 py-2">
              <input type="checkbox" className="accent-secondary" {...register('available')} />
              <span className="text-sm text-on-surface">Disponible para citas</span>
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={createDoctor.isPending}>
              {createDoctor.isPending ? 'Guardando…' : 'Guardar médico'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}