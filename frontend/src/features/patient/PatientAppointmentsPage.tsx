import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { AlertBanner, ErrorState, Spinner } from '@/components/ui/Feedback'
import { useAppointments, useMutations } from '@/hooks/queries'
import { formatDateTime } from '@/lib/utils'
import type { Appointment } from '@/types'

export function PatientAppointmentsPage() {
  const { data: appointments, isLoading, isError, error, refetch } = useAppointments()
  const { updateStatus } = useMutations()
  const [confirmCancel, setConfirmCancel] = useState<Appointment | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const mine = (appointments ?? [])
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))

  const canCancel = (a: Appointment) => a.status === 'PENDING' || a.status === 'CONFIRMED'

  const columns: Array<Column<Appointment>> = [
    {
      key: 'specialty',
      header: 'Especialidad',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.specialtyName} className="bg-secondary" />
          <div>
            <p className="font-medium text-on-surface">{row.specialtyName}</p>
            <p className="text-xs tabular text-on-surface-variant">{row.code}</p>
          </div>
        </div>
      ),
    },
    { key: 'doctor', header: 'Médico', render: (row) => <span>{row.doctorName}</span> },
    {
      key: 'date',
      header: 'Fecha y hora',
      render: (row) => (
        <span className="tabular">
          {formatDateTime(`${row.date}T00:00:00`)}<br />
          <span className="text-xs text-on-surface-variant">{row.startTime} – {row.endTime} h</span>
        </span>
      ),
    },
    {
      key: 'box',
      header: 'Box / Modalidad',
      render: (row) => <span className="text-on-surface-variant">{row.box ?? 'Presencial'}</span>,
    },
    { key: 'status', header: 'Estado', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: 'Acciones',
      render: (row) => (
        <div className="flex gap-1">
          {canCancel(row) && (
            <Button size="sm" variant="destructive" onClick={() => setConfirmCancel(row)}>
              Cancelar cita
            </Button>
          )}
        </div>
      ),
    },
  ]

  function handleCancel() {
    if (!confirmCancel) return
    setErrorMsg(null)
    updateStatus.mutate(
      { id: confirmCancel.id, status: 'CANCELLED' },
      {
        onSuccess: () => setConfirmCancel(null),
        onError: (err) => setErrorMsg(err.message),
      },
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="Portal del paciente"
        title="Mis citas"
        description="Consulta, confirma y cancela tus citas médicas dentro de la ventana permitida (24 h antes)"
        actions={
          <Button variant="health" onClick={() => (window.location.href = '/paciente/agendar')}>
            <span className="material-symbols-outlined text-base">add_circle</span>
            Nueva cita
          </Button>
        }
      />

      {errorMsg && <AlertBanner variant="error">{errorMsg}</AlertBanner>}

      {isLoading && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} onRetry={refetch} />}

      <Card>
        <CardHeader title="Historial de mis citas" subtitle="Estado según máquina de estados: Pendiente → Confirmada → Atendida" />
        <CardBody className="p-0">
          <DataTable columns={columns} rows={mine} empty="Aún no tienes citas registradas" />
        </CardBody>
      </Card>

      <Modal open={Boolean(confirmCancel)} onClose={() => setConfirmCancel(null)} title="Cancelar cita">
        {confirmCancel && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-on-surface-variant">
              ¿Confirmas la cancelación de tu cita de <strong className="text-on-surface">{confirmCancel.specialtyName}</strong> el{' '}
              {formatDateTime(`${confirmCancel.date}T00:00:00`)} a las {confirmCancel.startTime} h con {confirmCancel.doctorName}?
            </p>
            <p className="text-xs text-on-surface-variant">Esta acción respeta la regla de ventana de cancelación configurable del sistema.</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmCancel(null)}>Mantener cita</Button>
              <Button variant="destructive" onClick={handleCancel}>Sí, cancelar</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}