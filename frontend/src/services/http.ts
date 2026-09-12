import axios, { type AxiosInstance } from 'axios'
import type {
  Appointment,
  AppointmentCreatePayload,
  AuditLog,
  AuthUser,
  AuthTokens,
  AvailabilityCreatePayload,
  AvailabilitySlot,
  Billing,
  BillingCreatePayload,
  Box,
  BoxCreatePayload,
  ClinicalExam,
  ClinicalExamPayload,
  ConsultationNote,
  ConsultationNotePayload,
  DashboardSummary,
  Doctor,
  DoctorCreatePayload,
  Insurance,
  InsuranceCreatePayload,
  LoginCredentials,
  Patient,
  PatientCreatePayload,
  Prescription,
  PrescriptionPayload,
  ProfileUpdatePayload,
  RegisterPayload,
  Specialty,
  SpecialtyCreatePayload,
} from '@/types'

const ACCESS_KEY = 'clinic-angry.auth.access'
const REFRESH_KEY = 'clinic-angry.auth.refresh'

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

const PUBLIC_PATHS = ['/auth/login/', '/auth/register/', '/auth/refresh/', '/health/']

http.interceptors.request.use((config) => {
  const isPublic = PUBLIC_PATHS.some((p) => config.url?.includes(p))
  const token = localStorage.getItem(ACCESS_KEY)
  if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const refresh = localStorage.getItem(REFRESH_KEY)
    if (error.response?.status === 401 && refresh && !original._retry) {
      original._retry = true
      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh/`, { refresh })
        localStorage.setItem(ACCESS_KEY, data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return http(original)
      } catch {
        localStorage.removeItem(ACCESS_KEY)
        localStorage.removeItem(REFRESH_KEY)
      }
    }
    return Promise.reject(error)
  },
)

export const realApi = {
  async login(credentials: LoginCredentials): Promise<{ tokens: AuthTokens; user: AuthUser }> {
    const { data } = await http.post('/auth/login/', credentials)
    localStorage.setItem(ACCESS_KEY, data.access)
    localStorage.setItem(REFRESH_KEY, data.refresh)
    return { tokens: { access: data.access, refresh: data.refresh }, user: data.user }
  },

  async register(payload: RegisterPayload): Promise<AuthUser> {
    const { data } = await http.post('/auth/register/', payload)
    return data
  },

  async getPatients(): Promise<Patient[]> {
    const { data } = await http.get('/patients/')
    return data
  },

  async createPatient(payload: PatientCreatePayload): Promise<Patient> {
    const { data } = await http.post('/patients/', payload)
    return data
  },

  async getPatientProfile(): Promise<Patient> {
    const { data } = await http.get('/patients/me/')
    return data
  },

  async getDoctors(): Promise<Doctor[]> {
    const { data } = await http.get('/doctors/')
    return data
  },

  async createDoctor(payload: DoctorCreatePayload): Promise<Doctor> {
    const { data } = await http.post('/doctors/', payload)
    return data
  },

  async getSpecialties(): Promise<Specialty[]> {
    const { data } = await http.get('/specialties/')
    return data
  },

  async createSpecialty(payload: SpecialtyCreatePayload): Promise<Specialty> {
    const { data } = await http.post('/specialties/', payload)
    return data
  },

  async getAudit(module?: string): Promise<AuditLog[]> {
    const { data } = await http.get('/audit/', { params: module ? { module } : undefined })
    return data
  },

  async getProfile(): Promise<AuthUser> {
    const { data } = await http.get('/users/me/')
    return data
  },

  async updateProfile(payload: ProfileUpdatePayload): Promise<AuthUser> {
    const { data } = await http.patch('/users/me/', payload)
    return data
  },

  async getAppointments(): Promise<Appointment[]> {
    const { data } = await http.get('/appointments/')
    return data
  },

  async createAppointment(payload: AppointmentCreatePayload): Promise<Appointment> {
    const { data } = await http.post('/appointments/', payload)
    return data
  },

  async updateAppointmentStatus(id: number, status: Appointment['status']): Promise<Appointment> {
    const actionMap: Record<Appointment['status'], string> = {
      CONFIRMED: 'confirm',
      CANCELLED: 'cancel',
      COMPLETED: 'complete',
      NO_SHOW: 'no_show',
      PENDING: 'confirm',
      CHECKED_IN: 'check_in',
    }
    const { data } = await http.post(`/appointments/${id}/${actionMap[status]}/`)
    return data
  },

  async getAvailability(): Promise<AvailabilitySlot[]> {
    const { data } = await http.get('/availability/')
    return data
  },

  async createAvailability(payload: AvailabilityCreatePayload): Promise<AvailabilitySlot> {
    const { data } = await http.post('/availability/', payload)
    return data
  },

  async getDashboard(): Promise<DashboardSummary> {
    const { data } = await http.get('/dashboard/summary/')
    return data
  },

  async getConsultationNotes(): Promise<ConsultationNote[]> {
    const { data } = await http.get('/consultation-notes/')
    return data
  },

  async createConsultationNote(payload: ConsultationNotePayload): Promise<ConsultationNote> {
    const { data } = await http.post('/consultation-notes/', payload)
    return data
  },

  async getPrescriptions(): Promise<Prescription[]> {
    const { data } = await http.get('/prescriptions/')
    return data
  },

  async createPrescription(payload: PrescriptionPayload): Promise<Prescription> {
    const { data } = await http.post('/prescriptions/', payload)
    return data
  },

  async getBoxes(): Promise<Box[]> {
    const { data } = await http.get('/boxes/')
    return data
  },

  async createBox(payload: BoxCreatePayload): Promise<Box> {
    const { data } = await http.post('/boxes/', payload)
    return data
  },

  async updateBox(id: number, payload: Partial<BoxCreatePayload>): Promise<Box> {
    const { data } = await http.patch(`/boxes/${id}/`, payload)
    return data
  },

  async deleteBox(id: number): Promise<void> {
    await http.delete(`/boxes/${id}/`)
  },

  async getExams(): Promise<ClinicalExam[]> {
    const { data } = await http.get('/exams/')
    return data
  },

  async createExam(payload: ClinicalExamPayload): Promise<ClinicalExam> {
    const { data } = await http.post('/exams/', payload)
    return data
  },

  async getInsurances(): Promise<Insurance[]> {
    const { data } = await http.get('/insurance/')
    return data
  },

  async createInsurance(payload: InsuranceCreatePayload): Promise<Insurance> {
    const { data } = await http.post('/insurance/', payload)
    return data
  },

  async getBillings(): Promise<Billing[]> {
    const { data } = await http.get('/billing/')
    return data
  },

  async createBilling(payload: BillingCreatePayload): Promise<Billing> {
    const { data } = await http.post('/billing/', payload)
    return data
  },

  async updateBilling(id: number, payload: Partial<BillingCreatePayload>): Promise<Billing> {
    const { data } = await http.patch(`/billing/${id}/`, payload)
    return data
  },
}

export function toDisplayError(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado'
}