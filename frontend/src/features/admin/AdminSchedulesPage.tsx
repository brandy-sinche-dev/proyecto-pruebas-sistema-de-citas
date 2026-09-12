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
import { useAvailability, useDoctors, useMutations } from '@/hooks/queries'
import { formatDate } from '@/lib/utils'
import type { AvailabilitySlot } from '@/types'

const slotFormSchema = z.object({
  doctorId: z.coerce.number().int().positive('Selecciona un médico'),
  date: z.string().min(1, 'La fecha es obligatoria'),
  startTime: z.string().min(1, 'La hora de inicio es obligatoria'),
  endTime: z.string().min(1, 'La hora de fin es obligatoria'),
  box: z.string().optional(),
  status: z.enum(['ACTIVE', 'BLOCKED']).default('ACTIVE'),
})

type SlotFormInput = z.input<typeof slotFormSchema>
type SlotFormValues = z.infer<typeof slotFormSchema>

export function AdminSchedulesPage() {
  const { data: slots, isLoading, isError, error, refetch } = useAvailability()
  const { data: doctors } = useDoctors()
  const { createAvailability } = useMutations()
  const [showModal, setShowModal] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SlotFormInput, unknown, SlotFormValues>({
    resolver: zodResolver(slotFormSchema),
    defaultValues: { status: 'ACTIVE' },
  })

  const doctorName = (id: number) => {
    const d = (doctors ?? []).find((x) => x.id === id)
    return d ? `${d.firstName} ${d.lastName}` : '—'
  }

  const columns: Array<Column<AvailabilitySlot>> = [
    {
      key: 'doctor',
      header: 'Médico',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={doctorName(row.doctorId)} />
          <span className="font-medium text-on-surface">{doctorName(row.doctorId)}</span>
        </div>
      ),
    },
    { key: 'date', header: 'Fecha', render: (row) => <span className="tabular">{formatDate(`${row.date}T00:00:00`)}</span> },
    {
      key: 'hours',
      header: 'Horario',
      render: (row) => (
        <span className="tabular">
          {row.startTime} – {row.endTime}
        </span>
      ),
    },
    { key: 'box', header: 'Box', render: (row) => <span className="tabular">{row.box ?? '—'}</span> },
    {
      key: 'status',
      header: 'Estado',
      render: (row) =>
        row.status === 'ACTIVE' ? (
          <Badge className="border-success-200 bg-success-50 text-success-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> Activo</Badge>
        ) : (
          <Badge className="border-danger-200 bg-danger-50 text-danger-700"><span className="h-1.5 w-1.5 rounded-full bg-red-600" /> Bloqueado</Badge>
        ),
    },
  ]

  function onSubmit(values: SlotFormValues) {
    setErrorMsg(null)
    createAvailability.mutate(
      {
        doctorId: values.doctorId,
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
        box: values.box ?? '',
        status: values.status,
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
        eyebrow="Disponibilidad"
        title="Horarios de atención"
        description="Ventanas de disponibilidad de cada médico"
        actions={
          <Button variant="health" onClick={() => setShowModal(true)}>
            <span className="material-symbols-outlined text-base">add</span>
            Nuevo horario
          </Button>
        }
      />

      {isLoading && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} onRetry={refetch} />}

      <Card>
        <CardHeader title="Disponibilidad semanal" subtitle="Regla: no se puede reservar fuera de estas ventanas" />
        <CardBody className="p-0">
          <DataTable columns={columns} rows={slots ?? []} empty="No hay horarios configurados" />
        </CardBody>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nuevo horario de atención">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          {errorMsg && <AlertBanner variant="error">{errorMsg}</AlertBanner>}
          <Select label="Médico" error={errors.doctorId?.message} {...register('doctorId')}>
            <option value="">Selecciona…</option>
            {(doctors ?? []).map((d) => (
              <option key={d.id} value={d.id}>
                {d.firstName} {d.lastName} — {d.specialtyName}
              </option>
            ))}
          </Select>
          <Input label="Fecha" type="date" error={errors.date?.message} {...register('date')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Desde" type="time" error={errors.startTime?.message} {...register('startTime')} />
            <Input label="Hasta" type="time" error={errors.endTime?.message} {...register('endTime')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Box" placeholder="Box 101" error={errors.box?.message} {...register('box')} />
            <Select label="Estado" error={errors.status?.message} {...register('status')}>
              <option value="ACTIVE">Activo</option>
              <option value="BLOCKED">Bloqueado</option>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={createAvailability.isPending}>
              {createAvailability.isPending ? 'Guardando…' : 'Guardar horario'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}