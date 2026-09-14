import { useRef, useState } from 'react'
import type { UseMutationResult } from '@tanstack/react-query'
import type { Appointment } from '@/types'

type StatusVariables = { id: number; status: Appointment['status'] }
type StatusMutation = UseMutationResult<Appointment, Error, StatusVariables>

export type TransitionPending = StatusVariables & { patientName: string; code: string }

function apiErrorMessage(err: unknown): string {
  const data = (err as { response?: { data?: { detail?: string } } })?.response?.data
  if (data?.detail) return data.detail
  return err instanceof Error ? err.message : 'No se pudo actualizar la cita'
}

export function useTransitionConfirm(updateStatus: StatusMutation) {
  const [pending, setPending] = useState<TransitionPending | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inflight = useRef(false)

  function ask(variables: StatusVariables, appointment: Appointment) {
    setError(null)
    setPending({ ...variables, patientName: appointment.patientName, code: appointment.code })
  }

  function close() {
    if (!updateStatus.isPending) setPending(null)
  }

  function confirm() {
    if (!pending || inflight.current) return
    inflight.current = true
    setError(null)
    const { id, status } = pending
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => {
          inflight.current = false
          setPending(null)
        },
        onError: (err) => {
          inflight.current = false
          setError(apiErrorMessage(err))
        },
      },
    )
  }

  return { pending, error, ask, close, confirm }
}

const COPY: Record<Appointment['status'], { title: string; label: string; variant: 'primary' | 'health' | 'destructive' }> = {
  PENDING: { title: 'Confirmar cita', label: 'Sí, confirmar', variant: 'health' },
  CONFIRMED: { title: 'Confirmar cita', label: 'Sí, confirmar', variant: 'health' },
  CHECKED_IN: { title: 'Registrar check-in', label: 'Sí, registrar llegada', variant: 'health' },
  COMPLETED: { title: 'Marcar como atendida', label: 'Sí, marcar atendida', variant: 'health' },
  CANCELLED: { title: 'Cancelar cita', label: 'Sí, cancelar', variant: 'destructive' },
  NO_SHOW: { title: 'No asistió', label: 'Sí, registrar', variant: 'primary' },
}

export function transitionCopy(pending: TransitionPending | null) {
  if (!pending) return null
  const copy = COPY[pending.status]
  let message = `¿Estás seguro de cambiar el estado de la cita ${pending.code} de ${pending.patientName}?`
  if (pending.status === 'COMPLETED') {
    message = `¿Estás seguro de marcar como atendida la cita ${pending.code} de ${pending.patientName}?`
  } else if (pending.status === 'CANCELLED') {
    message = `¿Estás seguro de cancelar la cita ${pending.code} de ${pending.patientName}?`
  } else if (pending.status === 'NO_SHOW') {
    message = `¿Registrar la cita ${pending.code} de ${pending.patientName} como no asistida?`
  } else if (pending.status === 'CHECKED_IN') {
    message = `¿Registrar el check-in de ${pending.patientName} en la cita ${pending.code}? Se notificará al médico.`
  } else if (pending.status === 'CONFIRMED') {
    message = `¿Confirmar la cita ${pending.code} de ${pending.patientName}?`
  }
  return { title: copy.title, label: copy.label, variant: copy.variant, message }
}