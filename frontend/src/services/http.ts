import axios, { type AxiosInstance } from 'axios'
import type {
  Appointment,
  AppointmentCreatePayload,
  AuthUser,
  AuthTokens,
  AvailabilitySlot,
  ConsultationNote,
  DashboardSummary,
  Doctor,
  LoginCredentials,
  Patient,
  Prescription,
  RegisterPayload,
  Specialty,
} from '@/types'

const ACCESS_KEY = 'clinic-angry.auth.access'
const REFRESH_KEY = 'clinic-angry.auth.refresh'

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_KEY)
  if (token) {
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

  async getDoctors(): Promise<Doctor[]> {
    const { data } = await http.get('/doctors/')
    return data
  },

  async getSpecialties(): Promise<Specialty[]> {
    const { data } = await http.get('/specialties/')
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
    }
    const { data } = await http.post(`/appointments/${id}/${actionMap[status]}/`)
    return data
  },

  async getAvailability(): Promise<AvailabilitySlot[]> {
    const { data } = await http.get('/availability/')
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

  async getPrescriptions(): Promise<Prescription[]> {
    const { data } = await http.get('/prescriptions/')
    return data
  },
}

export function toDisplayError(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado'
}