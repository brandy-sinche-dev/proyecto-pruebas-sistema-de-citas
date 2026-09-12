import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { AlertBanner, ErrorState, Spinner } from '@/components/ui/Feedback'
import { useMutations, usePatients } from '@/hooks/queries'
import type { Patient } from '@/types'

const patientFormSchema = z.object({
  firstName: z.string().min(2, 'El nombre es obligatorio'),
  lastName: z.string().min(2, 'El apellido es obligatorio'),
  email: z.string().email('Correo no válido'),
  documentNumber: z.string().min(8, 'DNI inválido'),
  phone: z.string().optional(),
  gender: z.enum(['M', 'F']).optional(),
  birthDate: z.string().optional(),
  bloodType: z.string().optional(),
})

type PatientFormValues = z.infer<typeof patientFormSchema>

export function AdminPatientsPage() {
  const { data: patients, isLoading, isError, error, refetch } = usePatients()
  const { createPatient } = useMutations()
  const [query, setQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientFormValues>({ resolver: zodResolver(patientFormSchema) })

  const visible = (patients ?? []).filter((p) => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase()
    return !query || fullName.includes(query.toLowerCase()) || p.documentNumber.includes(query)
  })

  const columns: Array<Column<Patient>> = [
    {
      key: 'name',
      header: 'Paciente',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={`${row.firstName} ${row.lastName}`} />
          <div>
            <p className="font-medium text-on-surface">{row.firstName} {row.lastName}</p>
            <p className="text-xs tabular text-on-surface-variant">DNI {row.documentNumber}</p>
          </div>
        </div>
      ),
    },
    { key: 'email', header: 'Correo', render: (row) => <span>{row.email}</span> },
    { key: 'phone', header: 'Teléfono', render: (row) => <span className="tabular text-on-surface-variant">{row.phone ?? '—'}</span> },
    { key: 'blood', header: 'Grupo', render: (row) => <Badge>{row.bloodType ?? '—'}</Badge> },
    { key: 'gender', header: 'Sexo', render: (row) => <span>{row.gender}</span> },
  ]

  function onSubmit(values: PatientFormValues) {
    setErrorMsg(null)
    createPatient.mutate(
      {
        ...values,
        birthDate: values.birthDate || undefined,
        gender: values.gender,
        bloodType: values.bloodType || undefined,
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
        eyebrow="Gestión de usuarios"
        title="Pacientes"
        description="Registro de pacientes con historia clínica y datos de contacto"
        actions={
          <>
            <div className="flex items-center rounded-lg bg-surface px-3 py-2 shadow-tier1">
              <span className="material-symbols-outlined mr-2 text-lg text-on-surface-variant">search</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre o DNI…"
                aria-label="Buscar paciente"
                className="w-56 bg-transparent text-sm text-on-surface placeholder:text-outline focus:outline-none"
              />
            </div>
            <Button variant="health" onClick={() => setShowModal(true)}>
              <span className="material-symbols-outlined text-base">person_add</span>
              Nuevo paciente
            </Button>
          </>
        }
      />

      {isLoading && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} onRetry={refetch} />}

      <Card>
        <CardHeader title={`Registro de pacientes (${visible.length})`} subtitle="Datos protegidos según política de confidencialidad" />
        <CardBody className="p-0">
          <DataTable columns={columns} rows={visible} empty="No se encontraron pacientes" />
        </CardBody>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Registrar paciente">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          {errorMsg && <AlertBanner variant="error">{errorMsg}</AlertBanner>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nombres" placeholder="María" error={errors.firstName?.message} {...register('firstName')} />
            <Input label="Apellidos" placeholder="Gómez" error={errors.lastName?.message} {...register('lastName')} />
          </div>
          <Input label="Correo" type="email" placeholder="maria@mail.com" error={errors.email?.message} {...register('email')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="DNI" placeholder="12345678" error={errors.documentNumber?.message} {...register('documentNumber')} />
            <Input label="Teléfono" placeholder="+51 999 999 999" error={errors.phone?.message} {...register('phone')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Fecha de nacimiento" type="date" error={errors.birthDate?.message} {...register('birthDate')} />
            <Select label="Sexo" error={errors.gender?.message} {...register('gender')}>
              <option value="">Selecciona…</option>
              <option value="F">Femenino</option>
              <option value="M">Masculino</option>
            </Select>
          </div>
          <Input label="Grupo sanguíneo" placeholder="O+ (opcional)" error={errors.bloodType?.message} {...register('bloodType')} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={createPatient.isPending}>
              {createPatient.isPending ? 'Guardando…' : 'Guardar paciente'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}