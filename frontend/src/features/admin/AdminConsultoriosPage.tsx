import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { Input, Select } from '@/components/ui/Input'
import { AlertBanner, ErrorState, Spinner } from '@/components/ui/Feedback'
import { useAppointments, useBoxes, useDoctors, useMutations } from '@/hooks/queries'
import type { Box, BoxStatus } from '@/types'

const statusLabel: Record<BoxStatus, string> = {
  IN_USE: 'En uso',
  FREE: 'Disponible',
  MAINTENANCE: 'Mantenimiento',
  DISINFECTION: 'Desinfección',
}

const statusClass: Record<BoxStatus, string> = {
  IN_USE: 'border-scheduled-200 bg-scheduled-50 text-scheduled-700',
  FREE: 'border-success-200 bg-success-50 text-success-700',
  MAINTENANCE: 'border-danger-200 bg-danger-50 text-danger-700',
  DISINFECTION: 'border-warning-200 bg-warning-50 text-warning-700',
}

const boxFormSchema = z.object({
  code: z.string().min(1, 'El código es obligatorio'),
  name: z.string().min(1, 'El nombre es obligatorio'),
  area: z.string().optional(),
  floor: z.string().optional(),
  status: z.enum(['FREE', 'IN_USE', 'MAINTENANCE', 'DISINFECTION']),
  doctorId: z.string().optional(),
})

type BoxFormValues = z.infer<typeof boxFormSchema>

export function AdminConsultoriosPage() {
  const { data: boxes, isLoading, isError, error, refetch } = useBoxes()
  const { data: doctors } = useDoctors()
  const { data: appointments } = useAppointments()
  const { createBox, updateBox } = useMutations()
  const [showCreate, setShowCreate] = useState(false)
  const [selected, setSelected] = useState<Box | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [reassign, setReassign] = useState(false)
  const [newDoctorId, setNewDoctorId] = useState('')
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<BoxFormValues>({ resolver: zodResolver(boxFormSchema) })

  const status = watch('status')

  const doctorFor = (id?: number | null) => (doctors ?? []).find((d) => d.id === id)
  const patientInBox = (doctorId?: number | null) =>
    (appointments ?? []).find(
      (a) =>
        a.doctorId === doctorId &&
        (a.status === 'CHECKED_IN' || a.status === 'CONFIRMED' || a.status === 'PENDING'),
    )

  function onSubmit(values: BoxFormValues) {
    setErrorMsg(null)
    const payload = {
      code: values.code,
      name: values.name,
      area: values.area ?? '',
      floor: values.floor ?? '',
      status: values.status,
      doctorId: values.status === 'IN_USE' && values.doctorId ? Number(values.doctorId) : null,
    }
    createBox.mutate(payload, {
      onSuccess: () => {
        setShowCreate(false)
        reset()
      },
      onError: (err) => setErrorMsg(err.message),
    })
  }

  function onChangeStatus(next: BoxStatus) {
    setErrorMsg(null)
    updateBox.mutate(
      { id: selected!.id, payload: { status: next } },
      {
        onSuccess: () => setSelected(null),
        onError: (err) => setErrorMsg(err.message),
      },
    )
  }

  function openReassign() {
    setErrorMsg(null)
    setNewDoctorId(String(selected?.doctorId ?? ''))
    setReassign(true)
  }

  function saveReassign() {
    if (!selected) return
    const doctorId = newDoctorId ? Number(newDoctorId) : null
    setErrorMsg(null)
    updateBox.mutate(
      { id: selected.id, payload: { status: 'IN_USE', doctorId } },
      {
        onSuccess: () => {
          setSelected(null)
          setReassign(false)
          setNewDoctorId('')
        },
        onError: (err) => setErrorMsg(err.message),
      },
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="Infraestructura"
        title="Consultorios y boxes clínicos"
        description="Monitoreo en tiempo real de los módulos de atención de la sede"
        actions={
          <Button variant="health" onClick={() => setShowCreate(true)}>
            <span className="material-symbols-outlined text-base">add</span> Registrar box
          </Button>
        }
      />

      {isLoading && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} onRetry={refetch} />}

      {!isLoading && !isError && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(boxes ?? []).map((box) => {
            const doctor = doctorFor(box.doctorId)
            const patient = patientInBox(box.doctorId)
            return (
              <Card
                key={box.id}
                className="relative cursor-pointer overflow-hidden p-4 transition-shadow hover:shadow-tier2"
                onClick={() => { setSelected(box); setReassign(false) }}
              >
                <span className={`absolute top-3 right-3 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusClass[box.status]}`}>
                  {statusLabel[box.status]}
                </span>
                <span className="material-symbols-outlined rounded-lg bg-primary-fixed p-2 text-2xl text-primary">meeting_room</span>
                <h3 className="mt-3 font-display text-lg font-semibold text-primary">{box.name}</h3>
                <p className="text-sm text-on-surface-variant">{box.area || box.floor || '—'}</p>
                {doctor && (
                  <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
                    <Avatar name={`${doctor.firstName} ${doctor.lastName}`} className="h-8 w-8" />
                    <div>
                      <p className="text-sm font-medium text-on-surface">{doctor.firstName} {doctor.lastName}</p>
                      {patient && <p className="text-xs text-on-surface-variant">Atendiendo: {patient.patientName}</p>}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </section>
      )}

      <Modal open={Boolean(selected)} onClose={() => { setSelected(null); setReassign(false); setNewDoctorId('') }} title={selected ? `Detalle de ${selected.name}` : ''}>
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">Estado</span>
              <Badge className={statusClass[selected.status]}>{statusLabel[selected.status]}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">Área</span>
              <span className="text-sm text-on-surface">{selected.area || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">Piso</span>
              <span className="text-sm text-on-surface">{selected.floor || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">Médico asignado</span>
              <span className="text-sm text-on-surface">
                {doctorFor(selected.doctorId) ? `${doctorFor(selected.doctorId)?.firstName} ${doctorFor(selected.doctorId)?.lastName}` : 'Sin asignar'}
              </span>
            </div>
            {errorMsg && <AlertBanner variant="error">{errorMsg}</AlertBanner>}
            <div className="border-t border-slate-100 pt-3">
              <p className="mb-2 text-sm font-medium text-on-surface-variant">Cambiar estado</p>
              <div className="flex flex-wrap gap-2">
                {(['FREE', 'IN_USE', 'MAINTENANCE', 'DISINFECTION'] as BoxStatus[]).map((s) => (
                  <Button
                    key={s}
                    variant={s === selected.status ? 'health' : 'secondary'}
                    disabled={updateBox.isPending}
                    onClick={() => (s === 'IN_USE' ? openReassign() : onChangeStatus(s))}
                  >
                    {statusLabel[s]}
                  </Button>
                ))}
              </div>
              {(reassign || selected.status === 'IN_USE') && (
                <div className="mt-3 flex flex-col gap-2 rounded-lg border border-slate-200 bg-surface-bright p-3">
                  <Select
                    label={selected.status === 'IN_USE' ? 'Reasignar médico' : 'Médico a asignar'}
                    value={newDoctorId}
                    onChange={(e) => setNewDoctorId(e.target.value)}
                  >
                    <option value="">Sin médico (libre)</option>
                    {(doctors ?? []).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.firstName} {d.lastName} — {d.specialtyName}
                      </option>
                    ))}
                  </Select>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setReassign(false)}>
                      Cancelar
                    </Button>
                    <Button size="sm" variant="health" disabled={updateBox.isPending} onClick={saveReassign}>
                      {updateBox.isPending ? 'Guardando…' : 'Guardar asignación'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Registrar box">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          {errorMsg && <AlertBanner variant="error">{errorMsg}</AlertBanner>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Código" placeholder="B203" error={errors.code?.message} {...register('code')} />
            <Input label="Nombre" placeholder="Box 203" error={errors.name?.message} {...register('name')} />
          </div>
          <Input label="Área / Servicio" placeholder="Cardiología" error={errors.area?.message} {...register('area')} />
          <Input label="Piso" placeholder="Piso 2" error={errors.floor?.message} {...register('floor')} />
          <Select label="Estado" error={errors.status?.message} {...register('status')}>
            <option value="FREE">Disponible</option>
            <option value="IN_USE">En uso</option>
            <option value="MAINTENANCE">Mantenimiento</option>
            <option value="DISINFECTION">Desinfección</option>
          </Select>
          {status === 'IN_USE' && (
            <Select label="Médico asignado" error={errors.doctorId?.message} {...register('doctorId')}>
              <option value="">Seleccionar médico</option>
              {(doctors ?? []).map((d) => (
                <option key={d.id} value={d.id}>{d.firstName} {d.lastName} — {d.specialtyName}</option>
              ))}
            </Select>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button type="submit" disabled={createBox.isPending}>
              {createBox.isPending ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}