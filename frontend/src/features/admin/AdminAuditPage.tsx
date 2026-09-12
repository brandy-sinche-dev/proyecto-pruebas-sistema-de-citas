import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Input'
import { ErrorState, Spinner } from '@/components/ui/Feedback'
import { useAudit } from '@/hooks/queries'
import type { AuditLog } from '@/types'

const MODULES = [
  { value: '', label: 'Todos los módulos' },
  { value: 'auth', label: 'Autenticación' },
  { value: 'patients', label: 'Pacientes' },
  { value: 'doctors', label: 'Médicos' },
  { value: 'specialties', label: 'Especialidades' },
  { value: 'appointments', label: 'Citas' },
  { value: 'schedules', label: 'Horarios' },
  { value: 'prescriptions', label: 'Recetas' },
  { value: 'reception', label: 'Recepción' },
]

const statusBadge = (code?: number) => {
  if (!code) return null
  const ok = code < 400
  return (
    <Badge className={ok ? 'border-success-200 bg-success-50 text-success-700' : 'border-danger-200 bg-danger-50 text-danger-700'}>
      {code}
    </Badge>
  )
}

export function AdminAuditPage() {
  const [module, setModule] = useState('')
  const { data: logs, isLoading, isError, error, refetch } = useAudit(module || undefined)

  const moduleLabel = (m: string): string => m.toUpperCase()

  const exportCsv = () => {
    const rows = (logs ?? []).map((l) =>
      [
        l.id,
        new Date(l.timestamp).toLocaleString('es-ES'),
        l.userName,
        l.action,
        l.module,
        l.method ?? '',
        l.path ?? '',
        l.statusCode ?? '',
      ].join(';'),
    )
    const blob = new Blob([['ID;Fecha;Usuario;Accion;Modulo;Metodo;Ruta;Status', ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `auditoria-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

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
    { key: 'request', header: 'Request', render: (row) => <span className="tabular text-xs text-on-surface-variant">{row.method} {row.path}</span> },
    { key: 'status', header: 'Status', render: (row) => statusBadge(row.statusCode) },
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
            onClick={exportCsv}
            className="btn-secondary"
          >
            <span className="material-symbols-outlined text-base">download</span>
            Exportar log
          </button>
        }
      />

      <div className="mb-4 flex max-w-xs items-end gap-3">
        <Select label="Filtrar por módulo" value={module} onChange={(e) => setModule(e.target.value)}>
          {MODULES.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </Select>
      </div>

      {isLoading && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} onRetry={refetch} />}

      <Card>
        <CardHeader title="Últimas acciones registradas" subtitle="Inmutables e inmediatas: todo cambio queda trazado para auditoría básica" />
        <CardBody className="p-0">
          <DataTable columns={columns} rows={logs ?? []} empty={module ? 'No hay eventos en este módulo' : 'No hay eventos de auditoría'} />
        </CardBody>
      </Card>
    </>
  )
}