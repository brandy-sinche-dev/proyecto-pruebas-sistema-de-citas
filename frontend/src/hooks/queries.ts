import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services'
import type {
  Appointment,
  AppointmentCreatePayload,
  AvailabilityCreatePayload,
  AvailabilitySlot,
  BoxCreatePayload,
  ConsultationNotePayload,
  DoctorCreatePayload,
  PatientCreatePayload,
  PrescriptionPayload,
  ProfileUpdatePayload,
  SpecialtyCreatePayload,
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
  audit: ['audit'] as const,
  profile: ['profile'] as const,
  boxes: ['boxes'] as const,
  exams: ['exams'] as const,
  insurances: ['insurances'] as const,
  billings: ['billings'] as const,
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

export function usePatientProfile() {
  return useQuery({ queryKey: ['patient-profile'], queryFn: () => api.getPatientProfile() })
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

export function useAudit(module?: string) {
  return useQuery({ queryKey: [...queryKeys.audit, module], queryFn: () => api.getAudit(module) })
}

export function useProfile() {
  return useQuery({ queryKey: queryKeys.profile, queryFn: () => api.getProfile() })
}

export function useBoxes() {
  return useQuery({ queryKey: queryKeys.boxes, queryFn: () => api.getBoxes() })
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
    void queryClient.invalidateQueries({ queryKey: queryKeys.availability })
    void queryClient.invalidateQueries({ queryKey: queryKeys.consultations })
    void queryClient.invalidateQueries({ queryKey: queryKeys.prescriptions })
  }

  const createAppointment = useMutation({
    mutationFn: (payload: AppointmentCreatePayload) => api.createAppointment(payload),
    onSuccess: invalidate,
  })

  const createPatient = useMutation({
    mutationFn: (payload: PatientCreatePayload) => api.createPatient(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.patients })
    },
  })

  const createDoctor = useMutation({
    mutationFn: (payload: DoctorCreatePayload) => api.createDoctor(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.doctors })
      void queryClient.invalidateQueries({ queryKey: queryKeys.availability })
    },
  })

  const createSpecialty = useMutation({
    mutationFn: (payload: SpecialtyCreatePayload) => api.createSpecialty(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.specialties })
    },
  })

  const updateProfile = useMutation({
    mutationFn: (payload: ProfileUpdatePayload) => api.updateProfile(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile })
    },
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Appointment['status'] }) =>
      api.updateAppointmentStatus(id, status),
    onSuccess: invalidate,
  })

  const createAvailability = useMutation({
    mutationFn: (payload: AvailabilityCreatePayload) => api.createAvailability(payload),
    onSuccess: invalidate,
  })

  const invalidateBoxes = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.boxes })
  }

  const createBox = useMutation({
    mutationFn: (payload: BoxCreatePayload) => api.createBox(payload),
    onSuccess: invalidateBoxes,
  })

  const updateBox = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<BoxCreatePayload> }) =>
      api.updateBox(id, payload),
    onSuccess: invalidateBoxes,
  })

  const deleteBox = useMutation({
    mutationFn: (id: number) => api.deleteBox(id),
    onSuccess: invalidateBoxes,
  })

  const createConsultationNote = useMutation({
    mutationFn: (payload: ConsultationNotePayload) => api.createConsultationNote(payload),
    onSuccess: invalidate,
  })

  const createPrescription = useMutation({
    mutationFn: (payload: PrescriptionPayload) => api.createPrescription(payload),
    onSuccess: invalidate,
  })

  return {
    createAppointment,
    createPatient,
    createDoctor,
    createSpecialty,
    updateProfile,
    updateStatus,
    createAvailability,
    createConsultationNote,
    createPrescription,
    createBox,
    updateBox,
    deleteBox,
    invalidate,
  }
}

export type { AvailabilitySlot }