export type Role = 'admin' | 'receptionist' | 'doctor' | 'patient'

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'

export type AvailabilityStatus = 'ACTIVE' | 'BLOCKED' | 'PAST'

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
  createdAt: string
}

export interface AppointmentCreatePayload {
  patientId: number
  doctorId: number
  specialtyId: number
  date: string
  startTime: string
  reason?: string
}

export interface DashboardSummary {
  totalAppointments: number
  attendanceRate: number
  occupancyRate: number
  noShowRate: number
  pendingCount: number
  confirmedCount: number
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