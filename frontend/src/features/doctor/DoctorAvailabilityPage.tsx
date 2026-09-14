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
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { AlertBanner, ErrorState, Spinner } from '@/components/ui/Feedback'
import { useAppointments, useAvailability, useDoctors, useMutations } from '@/hooks/queries'
import { useAuth } from '@/hooks/useAuth'
import { availabilitySchema } from '@/schemas'
import { formatDate, toLocalDateKey } from '@/lib/utils'
import type { Appointment, AvailabilitySlot } from '@/types'

type AvailabilityFormValues = z.infer<typeof availabilitySchema>

function countInRange(
  appointments: Appointment[] | undefined,
  doctorId: number,
  date: string,
  startTime: string,
  endTime: string,
): number {
  if (!appointments) return 0
  return appointments.filter(
    (a) =>
      a.doctorId === doctorId &&
      a.date === date &&
      (a.status === 'PENDING' || a.status === 'CONFIRMED') &&
      a.startTime < endTime &&
      a.endTime > startTime,
  ).length
}

export function DoctorAvailabilityPage() {
  const { data: slots, isLoading, isError, error, refetch } = useAvailability()
  const { data: appointments } = useAppointments()
  const { data: doctors } = useDoctors()
  const { user } = useAuth()
  const { createAvailability, updateAvailability, deleteAvailability } = useMutations()
  const [saved, setSaved] = useState(false)
  const [todayWarning, setTodayWarning] = useState(false)

  const todayKey = toLocalDateKey(new Date())

  const isEditableSlot = (slot: AvailabilitySlot) => slot.date > todayKey

  const [editing, setEditing] = useState<AvailabilitySlot | null>(null)
  const [deleting, setDeleting] = useState<AvailabilitySlot | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [editPending, setEditPending] = useState<AvailabilityFormValues | null>(null)
  const [editPendingCount, setEditPendingCount] = useState(0)
  const [notice, setNotice] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: { date: '', startTime: '08:00', endTime: '14:00' },
  })

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    setValue: setEditValue,
    formState: { errors: editErrors },
  } = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilitySchema),
  })

  const doctorId = (doctors ?? []).find((doctor) => doctor.email === user?.email)?.id

  const mine = doctorId ? (slots ?? []).filter((slot) => slot.doctorId === doctorId) : (slots ?? [])

  const deletingCount = deleting
    ? countInRange(appointments, deleting.doctorId, deleting.date, deleting.startTime, deleting.endTime)
    : 0

  const submitError =
    createAvailability.isError && createAvailability.error
      ? createAvailability.error instanceof Error
        ? createAvailability.error.message
        : 'No se pudo publicar la disponibilidad'
      : undefined

  const onSubmit = handleSubmit((values) => {
    if (values.date === todayKey) {
      setTodayWarning(true)
      return
    }
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

  const openEdit = (slot: AvailabilitySlot) => {
    setEditing(slot)
    setEditError(null)
    setEditValue('date', slot.date)
    setEditValue('startTime', slot.startTime)
    setEditValue('endTime', slot.endTime)
  }

  const onEditSubmit = handleSubmitEdit((values) => {
    if (!editing) return
    if (values.date === todayKey) {
      setTodayWarning(true)
      return
    }
    const affected = countInRange(appointments, editing.doctorId, values.date, values.startTime, values.endTime)
    if (affected > 0) {
      setEditPendingCount(affected)
      setEditPending(values)
      return
    }
    runEdit(values)
  })

  const runEdit = (values: AvailabilityFormValues) => {
    if (!editing) return
    setEditPending(null)
    updateAvailability.mutate(
      { id: editing.id, payload: { date: values.date, startTime: values.startTime, endTime: values.endTime } },
      {
        onSuccess: (result) => {
          setEditing(null)
          setEditError(null)
          if (result.cancelledCount > 0) {
            setNotice(`${result.cancelledCount} cita(s) programada(s) en la franja fue(ron) cancelada(s) al guardar los cambios.`)
          }
        },
        onError: (err) => {
          setEditError(err instanceof Error ? err.message : 'No se pudo actualizar la disponibilidad')
          setEditPending(null)
        },
      },
    )
  }

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
    {
      key: 'actions',
      header: 'Acciones',
      render: (row) =>
        isEditableSlot(row) ? (
          <div className="flex gap-1">
            <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>Editar</Button>
            <Button size="sm" variant="destructive" onClick={() => setDeleting(row)}>Eliminar</Button>
          </div>
        ) : (
          <span className="text-xs text-on-surface-variant">No editable</span>
        ),
    },
  ]

  return (
    <>
      <PageHeader eyebrow="Portal médico asistencial" title="Mi disponibilidad" description="Publica y modifica tu disponibilidad solo para fechas futuras. La disponibilidad del día de hoy no es editable." />

      {isLoading && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} onRetry={refetch} />}

      {notice && (
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="flex-1">
            <AlertBanner variant="info">{notice}</AlertBanner>
          </div>
          <button
            type="button"
            aria-label="Cerrar aviso"
            onClick={() => setNotice(null)}
            className="text-sm font-medium text-on-surface-variant hover:text-on-surface"
          >
            Cerrar
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Publicar nueva disponibilidad" />
          <CardBody>
            <form className="flex flex-col gap-4" noValidate onSubmit={onSubmit}>
              <Input label="Fecha" type="date" min={todayKey} error={errors.date?.message} {...register('date')} />
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

      <Modal open={todayWarning} onClose={() => setTodayWarning(false)} title="No puedes cambiar la fecha de hoy" size="sm">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-on-surface">
            La disponibilidad de hoy ya está en curso y no puede modificarse. Solo puedes publicar o editar horarios para fechas futuras (a partir de mañana).
          </p>
          <div className="flex justify-end">
            <Button variant="primary" onClick={() => setTodayWarning(false)}>Entendido</Button>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Editar disponibilidad" size="sm">
        <form className="flex flex-col gap-4" noValidate onSubmit={onEditSubmit}>
          <Input label="Fecha" type="date" min={toLocalDateKey(new Date())} error={editErrors.date?.message} {...registerEdit('date')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Inicio" type="time" error={editErrors.startTime?.message} {...registerEdit('startTime')} />
            <Input label="Fin" type="time" error={editErrors.endTime?.message} {...registerEdit('endTime')} />
          </div>
          {editError && (
            <p className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">{editError}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button type="submit" variant="health" disabled={updateAvailability.isPending}>
              {updateAvailability.isPending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
              Guardar cambios
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(editPending)}
        title="Se cancelarán citas programadas"
        message={editPending ? `${editPendingCount} cita(s) programada(s) en esta franja será(n) cancelada(s). ¿Desea continuar?` : ''}
        confirmLabel="Sí, guardar y cancelar citas"
        variant="destructive"
        loading={updateAvailability.isPending}
        onConfirm={() => {
          if (editPending) runEdit(editPending)
        }}
        onCancel={() => setEditPending(null)}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar disponibilidad"
        message={
          deleting
            ? `¿Eliminar el bloque del ${formatDate(`${deleting.date}T00:00:00`)} (${deleting.startTime} – ${deleting.endTime})?${
                deletingCount > 0 ? ` ${deletingCount} cita(s) programada(s) en esta franja será(n) cancelada(s).` : ''
              }`
            : ''
        }
        confirmLabel="Sí, eliminar"
        variant="destructive"
        loading={deleteAvailability.isPending}
        onConfirm={() => {
          if (!deleting) return
          deleteAvailability.mutate(deleting.id, {
            onSuccess: (result) => {
              setDeleting(null)
              if (result.cancelledCount > 0) {
                setNotice(`${result.cancelledCount} cita(s) programada(s) fue(ron) cancelada(s) al eliminar el bloque.`)
              }
            },
          })
        }}
        onCancel={() => setDeleting(null)}
      />
    </>
  )
}