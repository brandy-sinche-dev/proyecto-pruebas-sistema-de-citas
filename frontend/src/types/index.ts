export type Role = 'admin' | 'receptionist' | 'doctor' | 'patient'

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'

export type AvailabilityStatus = 'ACTIVE' | 'BLOCKED' | 'PAST'

export type BoxStatus = 'FREE' | 'IN_USE' | 'MAINTENANCE' | 'DISINFECTION'

export type ExamCategory = 'LABORATORY' | 'IMAGING' | 'OTHER'

export type ExamStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED'

export type PaymentMethod = 'CASH' | 'WEB' | 'POS'

export type BillingStatus = 'PENDING' | 'PAID' | 'SETTLED' | 'GLOSA'

export interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  role: Role
  isActive: boolean
  phone?: string
}

export interface AuthUser extends User {
  avatarUrl?: string
  fullName: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  username: string
  password: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface PatientProfile {
  id: number
  user: User
  birthDate: string
  gender: 'M' | 'F'
  phone?: string
  bloodType?: string
  medicalHistory: string[]
}

export interface Specialty {
  id: number
  name: string
  description?: string
  color?: string
  icon?: string
  fee?: number | string
}

export interface DoctorProfile {
  id: number
  user: User
  specialtyId: number
  specialtyName?: string
  licenseNumber: string
  box?: string
  available: boolean
}

export interface AvailabilitySlot {
  id: number
  doctorId: number
  date: string
  startTime: string
  endTime: string
  status: AvailabilityStatus
  box?: string
}

export interface AvailabilityCreatePayload {
  doctorId?: number
  date: string
  startTime: string
  endTime: string
  box?: string
  status?: 'ACTIVE' | 'BLOCKED'
}

export interface PatientCreatePayload {
  firstName: string
  lastName: string
  email: string
  phone?: string
  documentNumber?: string
  birthDate?: string
  gender?: 'M' | 'F'
  bloodType?: string
  insuranceId?: number | null
  policyNumber?: string
}

export interface DoctorCreatePayload {
  firstName: string
  lastName: string
  email: string
  licenseNumber: string
  specialty: number
  box?: string
  available?: boolean
}

export interface SpecialtyCreatePayload {
  name: string
  description?: string
  color?: string
  icon?: string
  fee?: number | string
}

export interface Box {
  id: number
  code: string
  name: string
  area?: string
  floor?: string
  status: BoxStatus
  doctorId?: number | null
  doctorName?: string | null
  active: boolean
  createdAt?: string
}

export interface BoxCreatePayload {
  code: string
  name: string
  area?: string
  floor?: string
  status?: BoxStatus
  doctorId?: number | null
  active?: boolean
}

export interface Insurance {
  id: number
  code: string
  name: string
  coveragePercent: number
  active: boolean
}

export interface InsuranceCreatePayload {
  code: string
  name: string
  coveragePercent: number
  active?: boolean
}

export interface Billing {
  id: number
  code: string
  appointmentId: number
  patientId: number
  patientName: string
  doctorId: number
  doctorName: string
  specialtyId: number
  specialtyName: string
  insuranceId: number | null
  insuranceName: string | null
  grossAmount: string
  insuranceAmount: string
  copayAmount: string
  paymentMethod: PaymentMethod
  status: BillingStatus
  createdAt?: string
}

export interface BillingCreatePayload {
  appointmentId: number
  paymentMethod?: PaymentMethod
  status?: BillingStatus
}

export interface ClinicalExam {
  id: number
  appointmentId: number
  patientId: number
  doctorId: number
  category: ExamCategory
  name: string
  result: string
  referenceRange?: string
  status: ExamStatus
  performedAt?: string | null
  notes?: string
  createdAt?: string
}

export interface ClinicalExamPayload {
  appointmentId: number
  category: ExamCategory
  name: string
  result?: string
  referenceRange?: string
  status?: ExamStatus
  performedAt?: string | null
  notes?: string
}

export interface ProfileUpdatePayload {
  firstName: string
  lastName: string
  email: string
  phone?: string
}

export interface Appointment {
  id: number
  code: string
  patientId: number
  patientName: string
  doctorId: number
  doctorName: string
  specialtyId: number
  specialtyName: string
  date: string
  startTime: string
  endTime: string
  status: AppointmentStatus
  box?: string
  reason?: string
  notes?: string
  teleconsult?: boolean
  teleconsultLink?: string
  createdAt: string
}

export interface AppointmentCreatePayload {
  patientId: number
  doctorId: number
  specialtyId: number
  date: string
  startTime: string
  reason?: string
  teleconsult?: boolean
}

export interface DashboardSummary {
  totalAppointments: number
  attendanceRate: number
  occupancyRate: number
  noShowRate: number
  pendingCount: number
  confirmedCount: number
  checkedInCount: number
  inConsultationCount: number
  revenue: number
  nextAppointments: Appointment[]
  recentAppointments: Appointment[]
  appointmentsToday: Appointment[]
}

export interface Notification {
  id: number
  userId: number
  message: string
  read: boolean
  createdAt: string
}

export interface AuditLog {
  id: number
  userId: number
  userName: string
  action: string
  module: string
  method?: string
  path?: string
  statusCode?: number
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface Patient {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  documentNumber: string
  birthDate: string
  gender: 'M' | 'F'
  bloodType?: string
  insuranceId?: number | null
  insuranceName?: string | null
  policyNumber?: string
}

export interface Doctor {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  licenseNumber: string
  specialtyId: number
  specialtyName: string
  box?: string
  available: boolean
  availabilitySlots?: AvailabilitySlot[]
}

export interface ConsultationNote {
  id: number
  appointmentId: number
  patientId: number
  doctorId: number
  diagnosis: string
  treatment: string
  notes: string
  createdAt: string
}

export interface ConsultationNotePayload {
  appointmentId: number
  diagnosis: string
  treatment: string
  notes?: string
}

export interface MedicationInput {
  name: string
  dosage: string
  frequency: string
  duration: string
}

export interface Prescription {
  id: number
  code?: string
  appointmentId: number
  patientId: number
  doctorId: number
  date: string
  medications: Array<{ id: number; name: string; dosage: string; frequency: string; duration: string }>
  instructions?: string
  notes?: string
  createdAt: string
}

export interface PrescriptionPayload {
  appointmentId: number
  medications: MedicationInput[]
  instructions?: string
  notes?: string
}