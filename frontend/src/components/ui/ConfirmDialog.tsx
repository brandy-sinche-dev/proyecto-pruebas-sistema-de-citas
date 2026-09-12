import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { AlertBanner } from '@/components/ui/Feedback'

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancelar',
  variant = 'primary',
  loading = false,
  error,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  variant?: 'primary' | 'health' | 'destructive'
  loading?: boolean
  error?: string | null
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-on-surface">{message}</p>
        {error && <AlertBanner variant="error">{error}</AlertBanner>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={variant} disabled={loading} onClick={onConfirm}>
            {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}