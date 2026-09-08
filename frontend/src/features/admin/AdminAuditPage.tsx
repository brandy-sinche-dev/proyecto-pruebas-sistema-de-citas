import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Feedback'
import { useAuth } from '@/hooks/useAuth'
import type { AuditLog } from '@/types'

const mockLogs: AuditLog[] = [
  { id: 1, userId: 1, userName: 'Claudia Director', action: 'APPROVE_APPOINTMENT', module: 'appointments', timestamp: '2025-06-01T09:12:00', metadata: { appointmentId: 9 } },
  { id: 2, userId: 3, userName: 'Elena Ramos', action: 'CREATE_PRESCRIPTION', module: 'prescriptions', timestamp: '2025-06-01T09:20:00', metadata: { patientId: 1 } },
  { id: 3, userId: 2, userName: 'Sandra Paredes', action: 'CHECK_IN_PATIENT', module: 'reception', timestamp: '2025-06-01T09:31:00', metadata: { patientId: 1 } },
  { id: 4, userId: 1, userName: 'Claudia Director', action: 'UPDATE_DOCTOR', module: 'doctors', timestamp: '2025-06-01T09:45:00', metadata: { doctorId: 4 } },
  { id: 5, userId: 1, userName: 'Claudia Director', action: 'CREATE_SPECIALTY', module: 'specialties', timestamp: '2025-06-01T10:02:00', metadata: { name: 'Oftalmología' } },
]

export function AdminAuditPage() {
  const [logs] = useState<AuditLog[]>(mockLogs)
  const { user } = useAuth()

  const moduleLabel = (module: string): string => module.toUpperCase()

  const columns: Array<Column<AuditLog>> = [
    {
      key: 'user',
      header: 'Usuario',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.userName} />
          <div>
            <p className="font-medium text-on-surface">{row.userName}</p>
            <p className="text-xs text-on-surface-variant">ID {row.userId}</p>
          </div>
        </div>
      ),
    },
    { key: 'action', header: 'Acción', render: (row) => <span className="tabular font-medium text-on-surface">{row.action}</span> },
    { key: 'module', header: 'Módulo', render: (row) => <Badge>{moduleLabel(row.module)}</Badge> },
    {
      key: 'timestamp',
      header: 'Fecha',
      render: (row) => (
        <span className="tabular">{new Date(row.timestamp).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Seguridad y trazabilidad"
        title="Auditoría del sistema"
        description="Registro de acciones realizadas por el personal autorizado"
        actions={
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            className="btn-secondary"
          >
            <span className="material-symbols-outlined text-base">download</span>
            Exportar log
          </button>
        }
      />

      {!user ? <Spinner /> : null}

      <Card>
        <CardHeader title="Últimas acciones registradas" subtitle="Inmutables e inmediatas: todo cambio queda trazado para auditoría básica" />
        <CardBody className="p-0">
          <DataTable columns={columns} rows={logs} empty="No hay eventos de auditoría" />
        </CardBody>
      </Card>
    </>
  )
}