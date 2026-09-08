import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services'
import type {
  Appointment,
  AppointmentCreatePayload,
  AvailabilitySlot,
} from '@/types'

export const queryKeys = {
  appointments: ['appointments'] as const,
  dashboard: ['dashboard-summary'] as const,
  doctors: ['doctors'] as const,
  patients: ['patients'] as const,
  specialties: ['specialties'] as const,
  availability: ['availability'] as const,
  consultations: ['consultations'] as const,
  prescriptions: ['prescriptions'] as const,
}

export function useAppointments() {
  return useQuery({ queryKey: queryKeys.appointments, queryFn: () => api.getAppointments() })
}

export function useDashboard() {
  return useQuery({ queryKey: queryKeys.dashboard, queryFn: () => api.getDashboard() })
}

export function useDoctors() {
  return useQuery({ queryKey: queryKeys.doctors, queryFn: () => api.getDoctors() })
}

export function usePatients() {
  return useQuery({ queryKey: queryKeys.patients, queryFn: () => api.getPatients() })
}

export function useSpecialties() {
  return useQuery({ queryKey: queryKeys.specialties, queryFn: () => api.getSpecialties() })
}

export function useAvailability() {
  return useQuery({ queryKey: queryKeys.availability, queryFn: () => api.getAvailability() })
}

export function useConsultationNotes() {
  return useQuery({ queryKey: queryKeys.consultations, queryFn: () => api.getConsultationNotes() })
}

export function usePrescriptions() {
  return useQuery({ queryKey: queryKeys.prescriptions, queryFn: () => api.getPrescriptions() })
}

export function useAppointmentsToday() {
  const { data: appointments, ...rest } = useAppointments()
  const today = new Date().toISOString().split('T')[0]
  const todayAppointments = appointments?.filter((a) => a.date === today) ?? []
  return { data: todayAppointments, ...rest }
}

export function useMutations() {
  const queryClient = useQueryClient()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.appointments })
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
  }

  const createAppointment = useMutation({
    mutationFn: (payload: AppointmentCreatePayload) => api.createAppointment(payload),
    onSuccess: invalidate,
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Appointment['status'] }) =>
      api.updateAppointmentStatus(id, status),
    onSuccess: invalidate,
  })

  return { createAppointment, updateStatus, invalidate }
}

export type { AvailabilitySlot }