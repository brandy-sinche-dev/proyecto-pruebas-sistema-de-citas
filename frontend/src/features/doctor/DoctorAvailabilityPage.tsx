import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ErrorState, Spinner } from '@/components/ui/Feedback'
import { useAvailability, useDoctors, useMutations } from '@/hooks/queries'
import { useAuth } from '@/hooks/useAuth'
import { availabilitySchema } from '@/schemas'
import { formatDate } from '@/lib/utils'
import type { AvailabilitySlot } from '@/types'

type AvailabilityFormValues = z.infer<typeof availabilitySchema>

export function DoctorAvailabilityPage() {
  const { data: slots, isLoading, isError, error, refetch } = useAvailability()
  const { data: doctors } = useDoctors()
  const { user } = useAuth()
  const { createAvailability } = useMutations()
  const [saved, setSaved] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: { date: '', startTime: '08:00', endTime: '14:00' },
  })

  const doctorId = (doctors ?? []).find((doctor) => doctor.email === user?.email)?.id

  const mine = doctorId ? (slots ?? []).filter((slot) => slot.doctorId === doctorId) : (slots ?? [])

  const submitError =
    createAvailability.isError && createAvailability.error
      ? createAvailability.error instanceof Error
        ? createAvailability.error.message
        : 'No se pudo publicar la disponibilidad'
      : undefined

  const onSubmit = handleSubmit((values) => {
    createAvailability.mutate(
      { date: values.date, startTime: values.startTime, endTime: values.endTime },
      {
        onSuccess: () => {
          setSaved(true)
          reset({ date: '', startTime: '08:00', endTime: '14:00' })
        },
      },
    )
  })

  const columns: Array<Column<AvailabilitySlot>> = [
    { key: 'date', header: 'Fecha', render: (row) => <span className="tabular">{formatDate(`${row.date}T00:00:00`)}</span> },
    {
      key: 'hours',
      header: 'Horario',
      render: (row) => <span className="tabular">{row.startTime} – {row.endTime}</span>,
    },
    { key: 'box', header: 'Box', render: (row) => <span className="tabular">{row.box ?? '—'}</span> },
    {
      key: 'status',
      header: 'Estado',
      render: (row) =>
        row.status === 'ACTIVE' ? (
          <Badge className="border-success-200 bg-success-50 text-success-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> Disponible</Badge>
        ) : (
          <Badge className="border-danger-200 bg-danger-50 text-danger-700">Bloqueado</Badge>
        ),
    },
  ]

  return (
    <>
      <PageHeader eyebrow="Portal médico asistencial" title="Mi disponibilidad" description="Publica tu ventana de atención. Regla: solo tú puedes modificar tu propia disponibilidad." />

      {isLoading && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} onRetry={refetch} />}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Publicar nueva disponibilidad" />
          <CardBody>
            <form className="flex flex-col gap-4" noValidate onSubmit={onSubmit}>
              <Input label="Fecha" type="date" min={new Date().toISOString().split('T')[0]} error={errors.date?.message} {...register('date')} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Inicio" type="time" error={errors.startTime?.message} {...register('startTime')} />
                <Input label="Fin" type="time" error={errors.endTime?.message} {...register('endTime')} />
              </div>
              {saved && (
                <p className="rounded-lg border border-success-200 bg-success-50 px-3 py-2 text-sm text-success-700">
                  Disponibilidad publicada. Los pacientes ya pueden reservar en esa ventana.
                </p>
              )}
              {submitError && (
                <p className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">
                  {submitError}
                </p>
              )}
              <Button type="submit" variant="health" disabled={createAvailability.isPending}>
                {createAvailability.isPending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
                <span className="material-symbols-outlined text-base">publish</span>
                Publicar bloque
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Bloques publicados" subtitle="Ventanas actuales de atención dentro del sistema" />
          <CardBody className="p-0">
            <DataTable columns={columns} rows={mine} empty="Aún no has publicado disponibilidad" />
          </CardBody>
        </Card>
      </div>
    </>
  )
}