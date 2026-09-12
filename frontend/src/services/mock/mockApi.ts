import type {
  Appointment,
  AppointmentCreatePayload,
  AuditLog,
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
  Doctor,
  DoctorCreatePayload,
  Insurance,
  InsuranceCreatePayload,
  Patient,
  PatientCreatePayload,
  Specialty,
  SpecialtyCreatePayload,
  DashboardSummary,
  User,
  LoginCredentials,
  AuthTokens,
  AuthUser,
  Prescription,
  PrescriptionPayload,
  ProfileUpdatePayload,
  RegisterPayload,
} from '../../types'

const now = Date.now()
const day = 24 * 60 * 60 * 1000

const todayISO = new Date().toISOString().split('T')[0]
const tomorrowISO = new Date(Date.now() + day).toISOString().split('T')[0]
const nextWeekISO = new Date(Date.now() + 7 * day).toISOString().split('T')[0]

export const specialties: Specialty[] = [
  { id: 1, name: 'Cardiología', color: '#0D9488', icon: 'cardiology', fee: 180 },
  { id: 2, name: 'Pediatría', color: '#0284C7', icon: 'pediatrics', fee: 140 },
  { id: 3, name: 'Dermatología', color: '#7C3AED', icon: 'dermatology', fee: 165 },
  { id: 4, name: 'Ginecología', color: '#DB2777', icon: 'gynecology', fee: 165 },
  { id: 5, name: 'Traumatología', color: '#EA580C', icon: 'orthopedics', fee: 190 },
  { id: 6, name: 'Medicina General', color: '#64748B', icon: 'stethoscope', fee: 110 },
]

export const doctors: Doctor[] = [
  {
    id: 1,
    firstName: 'Elena',
    lastName: 'Ramos',
    email: 'elena.ramos@clinicangry.com',
    phone: '+51 987 654 321',
    licenseNumber: 'CMP-1001',
    specialtyId: 1,
    specialtyName: 'Cardiología',
    box: 'Box 104',
    available: true,
  },
  {
    id: 2,
    firstName: 'Jorge',
    lastName: 'Mendoza',
    email: 'jorge.mendoza@clinicangry.com',
    phone: '+51 987 654 322',
    licenseNumber: 'CMP-1002',
    specialtyId: 5,
    specialtyName: 'Traumatología',
    box: 'Box 208',
    available: true,
  },
  {
    id: 3,
    firstName: 'Lucía',
    lastName: 'Fernández',
    email: 'lucia.fernandez@clinicangry.com',
    phone: '+51 987 654 323',
    licenseNumber: 'CMP-1003',
    specialtyId: 2,
    specialtyName: 'Pediatría',
    box: 'Box 305',
    available: true,
  },
  {
    id: 4,
    firstName: 'Carlos',
    lastName: 'Rivas',
    email: 'carlos.rivas@clinicangry.com',
    phone: '+51 987 654 324',
    licenseNumber: 'CMP-1004',
    specialtyId: 3,
    specialtyName: 'Dermatología',
    box: 'Box 401',
    available: false,
  },
  {
    id: 5,
    firstName: 'Ana',
    lastName: 'Torres',
    email: 'ana.torres@clinicangry.com',
    phone: '+51 987 654 325',
    licenseNumber: 'CMP-1005',
    specialtyId: 6,
    specialtyName: 'Medicina General',
    box: 'Box 107',
    available: true,
  },
]

export const patients: Patient[] = [
  {
    id: 1,
    firstName: 'María',
    lastName: 'Gómez',
    email: 'maria.gomez@mail.com',
    phone: '+51 911 111 111',
    documentNumber: '70234561',
    birthDate: '1990-05-12',
    gender: 'F',
    bloodType: 'O+',
  },
  {
    id: 2,
    firstName: 'Pedro',
    lastName: 'López',
    email: 'pedro.lopez@mail.com',
    phone: '+51 922 222 222',
    documentNumber: '71345672',
    birthDate: '1985-08-23',
    gender: 'M',
    bloodType: 'A+',
  },
  {
    id: 3,
    firstName: 'Rosa',
    lastName: 'Quispe',
    email: 'rosa.quispe@mail.com',
    phone: '+51 933 333 333',
    documentNumber: '72456783',
    birthDate: '1998-02-01',
    gender: 'F',
    bloodType: 'B+',
  },
  {
    id: 4,
    firstName: 'Juan',
    lastName: 'Sánchez',
    email: 'juan.sanchez@mail.com',
    phone: '+51 944 444 444',
    documentNumber: '73567894',
    birthDate: '1978-11-17',
    gender: 'M',
    bloodType: 'O−',
  },
]

const baseAppointments: Appointment[] = [
  {
    id: 1,
    code: 'CIT-2025-0001',
    patientId: 1,
    patientName: 'María Gómez',
    doctorId: 1,
    doctorName: 'Dra. Elena Ramos',
    specialtyId: 1,
    specialtyName: 'Cardiología',
    date: todayISO,
    startTime: '09:00',
    endTime: '09:30',
    status: 'CONFIRMED',
    box: 'Box 104',
    reason: 'Control cardiológico',
    createdAt: new Date(now - 2 * day).toISOString(),
  },
  {
    id: 2,
    code: 'CIT-2025-0002',
    patientId: 2,
    patientName: 'Pedro López',
    doctorId: 1,
    doctorName: 'Dra. Elena Ramos',
    specialtyId: 1,
    specialtyName: 'Cardiología',
    date: todayISO,
    startTime: '09:30',
    endTime: '10:00',
    status: 'CONFIRMED',
    box: 'Box 104',
    reason: 'Dolor torácico',
    createdAt: new Date(now - day).toISOString(),
  },
  {
    id: 3,
    code: 'CIT-2025-0003',
    patientId: 3,
    patientName: 'Rosa Quispe',
    doctorId: 1,
    doctorName: 'Dra. Elena Ramos',
    specialtyId: 1,
    specialtyName: 'Cardiología',
    date: todayISO,
    startTime: '10:00',
    endTime: '10:30',
    status: 'PENDING',
    box: 'Box 104',
    reason: 'Chequeo general',
    createdAt: new Date(now - day).toISOString(),
  },
  {
    id: 4,
    code: 'CIT-2025-0004',
    patientId: 4,
    patientName: 'Juan Sánchez',
    doctorId: 2,
    doctorName: 'Dr. Jorge Mendoza',
    specialtyId: 5,
    specialtyName: 'Traumatología',
    date: todayISO,
    startTime: '11:00',
    endTime: '11:30',
    status: 'PENDING',
    box: 'Box 208',
    reason: 'Esguince de tobillo',
    createdAt: new Date(now - day).toISOString(),
  },
  {
    id: 5,
    code: 'CIT-2025-0005',
    patientId: 1,
    patientName: 'María Gómez',
    doctorId: 5,
    doctorName: 'Dra. Ana Torres',
    specialtyId: 6,
    specialtyName: 'Medicina General',
    date: tomorrowISO,
    startTime: '08:30',
    endTime: '09:00',
    status: 'CONFIRMED',
    box: 'Box 107',
    reason: 'Consulta general',
    createdAt: new Date(now - day).toISOString(),
  },
  {
    id: 6,
    code: 'CIT-2025-0006',
    patientId: 2,
    patientName: 'Pedro López',
    doctorId: 5,
    doctorName: 'Dra. Ana Torres',
    specialtyId: 6,
    specialtyName: 'Medicina General',
    date: tomorrowISO,
    startTime: '09:00',
    endTime: '09:30',
    status: 'PENDING',
    box: 'Box 107',
    reason: 'Vacunación influenza',
    createdAt: new Date(now).toISOString(),
  },
  {
    id: 7,
    code: 'CIT-2025-0007',
    patientId: 3,
    patientName: 'Rosa Quispe',
    doctorId: 3,
    doctorName: 'Dra. Lucía Fernández',
    specialtyId: 2,
    specialtyName: 'Pediatría',
    date: nextWeekISO,
    startTime: '10:00',
    endTime: '10:30',
    status: 'PENDING',
    box: 'Box 305',
    reason: 'Control de niño sano',
    createdAt: new Date(now).toISOString(),
  },
]

export const availability: AvailabilitySlot[] = [
  { id: 1, doctorId: 1, date: todayISO, startTime: '08:00', endTime: '14:00', status: 'ACTIVE', box: 'Box 104' },
  { id: 2, doctorId: 2, date: todayISO, startTime: '09:00', endTime: '13:00', status: 'ACTIVE', box: 'Box 208' },
  { id: 3, doctorId: 3, date: todayISO, startTime: '08:00', endTime: '12:00', status: 'ACTIVE', box: 'Box 305' },
  { id: 4, doctorId: 5, date: todayISO, startTime: '08:00', endTime: '15:00', status: 'ACTIVE', box: 'Box 107' },
  { id: 5, doctorId: 1, date: tomorrowISO, startTime: '08:00', endTime: '14:00', status: 'ACTIVE', box: 'Box 104' },
  { id: 6, doctorId: 5, date: tomorrowISO, startTime: '08:00', endTime: '14:00', status: 'ACTIVE', box: 'Box 107' },
  { id: 7, doctorId: 4, date: todayISO, startTime: '10:00', endTime: '14:00', status: 'BLOCKED', box: 'Box 401' },
]

export const consultationNotes: ConsultationNote[] = [
  {
    id: 1,
    appointmentId: 1,
    patientId: 1,
    doctorId: 1,
    diagnosis: 'Hipertensión arterial controlada',
    treatment: 'Continuar enalapril 10mg, dieta hiposódica',
    notes: 'Paciente refiere buen cumplimiento de tratamiento.',
    createdAt: new Date(now - 30 * day).toISOString(),
  },
]

export const prescriptions: Prescription[] = [
  {
    id: 1,
    code: 'RX-0001',
    appointmentId: 1,
    patientId: 1,
    doctorId: 1,
    date: new Date(now - 30 * day).toISOString().split('T')[0],
    medications: [{ id: 1, name: 'Enalapril', dosage: '10mg', frequency: 'Cada 24h', duration: '30 días' }],
    instructions: 'No suspender sin indicación médica.',
    notes: 'Control en 30 días.',
    createdAt: new Date(now - 30 * day).toISOString(),
  },
]

export const boxes: Box[] = [
  { id: 1, code: 'B101', name: 'Box 101', area: 'Consulta externa', floor: 'Piso 1', status: 'FREE', doctorId: null, doctorName: null, active: true, createdAt: new Date(now - 90 * day).toISOString() },
  { id: 2, code: 'B104', name: 'Box 104', area: 'Cardiología', floor: 'Piso 1', status: 'IN_USE', doctorId: 1, doctorName: 'Elena Ramos', active: true, createdAt: new Date(now - 90 * day).toISOString() },
  { id: 3, code: 'B107', name: 'Box 107', area: 'Medicina General', floor: 'Piso 1', status: 'IN_USE', doctorId: 5, doctorName: 'Ana Torres', active: true, createdAt: new Date(now - 90 * day).toISOString() },
  { id: 4, code: 'B208', name: 'Box 208', area: 'Traumatología', floor: 'Piso 2', status: 'IN_USE', doctorId: 2, doctorName: 'Jorge Mendoza', active: true, createdAt: new Date(now - 90 * day).toISOString() },
  { id: 5, code: 'B305', name: 'Box 305', area: 'Pediatría', floor: 'Piso 3', status: 'IN_USE', doctorId: 3, doctorName: 'Lucía Fernández', active: true, createdAt: new Date(now - 90 * day).toISOString() },
  { id: 6, code: 'B401', name: 'Box 401', area: 'Dermatología', floor: 'Piso 4', status: 'FREE', doctorId: null, doctorName: null, active: true, createdAt: new Date(now - 90 * day).toISOString() },
  { id: 7, code: 'B402', name: 'Box 402', area: 'Dermatología', floor: 'Piso 4', status: 'MAINTENANCE', doctorId: null, doctorName: null, active: true, createdAt: new Date(now - 60 * day).toISOString() },
]

export const insurances: Insurance[] = [
  { id: 1, code: 'RIM', name: 'Rímac', coveragePercent: 80, active: true },
  { id: 2, code: 'PAC', name: 'Pacífico', coveragePercent: 70, active: true },
  { id: 3, code: 'SAN', name: 'Sanitas EPS', coveragePercent: 65, active: true },
  { id: 4, code: 'MAP', name: 'Mapfre Salud', coveragePercent: 60, active: true },
]

export const clinicalExams: ClinicalExam[] = [
  {
    id: 1,
    appointmentId: 1,
    patientId: 1,
    doctorId: 1,
    category: 'LABORATORY',
    name: 'Perfil Lipídico Automatizado',
    result: 'LDL 138 mg/dL',
    referenceRange: '< 100 mg/dL',
    status: 'COMPLETED',
    performedAt: todayISO,
    notes: 'Levemente elevado.',
    createdAt: new Date(now - 3 * day).toISOString(),
  },
]

export const billings: Billing[] = [
  {
    id: 1,
    code: 'LIQ-2025-00001',
    appointmentId: 1,
    patientId: 1,
    patientName: 'María Gómez',
    doctorId: 1,
    doctorName: 'Elena Ramos',
    specialtyId: 1,
    specialtyName: 'Cardiología',
    insuranceId: 1,
    insuranceName: 'Rímac',
    grossAmount: '180.00',
    insuranceAmount: '144.00',
    copayAmount: '36.00',
    paymentMethod: 'WEB',
    status: 'PAID',
    createdAt: new Date(now - 2 * day).toISOString(),
  },
]

const users: User[] = [
  { id: 1, username: 'admin', email: 'admin@clinicangry.com', firstName: 'Claudia', lastName: 'Director', role: 'admin', isActive: true },
  { id: 2, username: 'recepcion', email: 'recepcion@clinicangry.com', firstName: 'Sandra', lastName: 'Paredes', role: 'receptionist', isActive: true },
  { id: 3, username: 'dra.ramos', email: 'elena.ramos@clinicangry.com', firstName: 'Elena', lastName: 'Ramos', role: 'doctor', isActive: true },
  { id: 4, username: 'paciente', email: 'maria.gomez@mail.com', firstName: 'María', lastName: 'Gómez', role: 'patient', isActive: true },
]

const auditLogs: AuditLog[] = [
  { id: 1, userId: 1, userName: 'Claudia Director', action: 'APPROVE_APPOINTMENT', module: 'appointments', method: 'POST', path: '/api/v1/appointments/9/confirm/', statusCode: 200, timestamp: new Date(now - 3600_000 * 3).toISOString(), metadata: { appointmentId: 9 } },
  { id: 2, userId: 3, userName: 'Elena Ramos', action: 'CREATE_PRESCRIPTION', module: 'prescriptions', method: 'POST', path: '/api/v1/prescriptions/', statusCode: 201, timestamp: new Date(now - 3600_000 * 4).toISOString(), metadata: { patientId: 1 } },
  { id: 3, userId: 2, userName: 'Sandra Paredes', action: 'CHECK_IN_PATIENT', module: 'reception', method: 'POST', path: '/api/v1/appointments/1/confirm/', statusCode: 200, timestamp: new Date(now - 3600_000 * 5).toISOString(), metadata: { patientId: 1 } },
  { id: 4, userId: 1, userName: 'Claudia Director', action: 'UPDATE_DOCTOR', module: 'doctors', method: 'PATCH', path: '/api/v1/doctors/4/', statusCode: 200, timestamp: new Date(now - 3600_000 * 6).toISOString(), metadata: { doctorId: 4 } },
  { id: 5, userId: 1, userName: 'Claudia Director', action: 'CREATE_SPECIALTY', module: 'specialties', method: 'POST', path: '/api/v1/specialties/', statusCode: 201, timestamp: new Date(now - 3600_000 * 8).toISOString(), metadata: { name: 'Oftalmología' } },
]

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

function nextId(items: Array<{ id: number }>) {
  return Math.max(0, ...items.map((item) => item.id)) + 1
}

function publicify(user: User): AuthUser {
  return { ...user, fullName: `${user.firstName} ${user.lastName}` }
}

let currentUser: User | null = null

function ownPatient() {
  if (!currentUser || currentUser.role !== 'patient') return null
  return patients.find((p) => p.email.toLowerCase() === currentUser?.email.toLowerCase()) ?? null
}

function ownDoctor() {
  if (!currentUser || currentUser.role !== 'doctor') return null
  return doctors.find((d) => d.email.toLowerCase() === currentUser?.email.toLowerCase()) ?? null
}

export const mockApi = {
  async login(credentials: LoginCredentials): Promise<{ tokens: AuthTokens; user: AuthUser }> {
    await delay()
    const user = users.find((u) => u.username === credentials.username)
    if (!user || !credentials.password) {
      throw new Error('Credenciales inválidas')
    }
    currentUser = user
    const tokens: AuthTokens = {
      access: `mock-access-${user.id}-${Date.now()}`,
      refresh: `mock-refresh-${user.id}-${Date.now()}`,
    }
    return { tokens, user: publicify(user) }
  },

  async register(payload: RegisterPayload): Promise<AuthUser> {
    await delay()
    const user: User = {
      id: nextId(users),
      username: payload.username,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: 'patient',
      isActive: true,
    }
    users.push(user)
    return publicify(user)
  },

  async getPatients(): Promise<Patient[]> {
    await delay()
    return [...patients]
  },

  async createPatient(payload: PatientCreatePayload): Promise<Patient> {
    await delay()
    const patient: Patient = {
      id: nextId(patients),
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone ?? '',
      documentNumber: payload.documentNumber ?? '',
      birthDate: payload.birthDate ?? '',
      gender: payload.gender ?? 'M',
      bloodType: payload.bloodType ?? '',
    }
    patients.push(patient)
    return patient
  },

  async getPatientProfile(): Promise<Patient> {
    await delay()
    return { ...patients[0] }
  },

  async getDoctors(): Promise<Doctor[]> {
    await delay()
    return [...doctors]
  },

  async createDoctor(payload: DoctorCreatePayload): Promise<Doctor> {
    await delay()
    const specialty = specialties.find((s) => s.id === payload.specialty)
    const doctor: Doctor = {
      id: nextId(doctors),
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      licenseNumber: payload.licenseNumber,
      specialtyId: payload.specialty,
      specialtyName: specialty?.name ?? '',
      box: payload.box ?? '',
      available: payload.available ?? true,
    }
    doctors.push(doctor)
    return doctor
  },

  async getSpecialties(): Promise<Specialty[]> {
    await delay(150)
    return [...specialties]
  },

  async createSpecialty(payload: SpecialtyCreatePayload): Promise<Specialty> {
    await delay()
    const specialty: Specialty = {
      id: nextId(specialties),
      name: payload.name,
      description: payload.description ?? '',
      color: payload.color ?? '#0F2942',
      icon: payload.icon ?? 'emergency',
    }
    specialties.push(specialty)
    return specialty
  },

  async getAudit(module?: string): Promise<AuditLog[]> {
    await delay(150)
    const logs = module ? auditLogs.filter((l) => l.module === module) : auditLogs
    return [...logs]
  },

  async getProfile(): Promise<AuthUser> {
    await delay(100)
    const user = users.find((u) => u.id === 4) ?? users[0]
    return publicify(user)
  },

  async updateProfile(payload: ProfileUpdatePayload): Promise<AuthUser> {
    await delay()
    const user = users.find((u) => u.id === 4) ?? users[0]
    user.firstName = payload.firstName
    user.lastName = payload.lastName
    user.email = payload.email
    user.phone = payload.phone ?? ''
    return publicify(user)
  },

  async getAppointments(): Promise<Appointment[]> {
    await delay()
    const patient = ownPatient()
    if (patient) return baseAppointments.filter((a) => a.patientId === patient.id)
    const doctor = ownDoctor()
    if (doctor) return baseAppointments.filter((a) => a.doctorId === doctor.id)
    return [...baseAppointments]
  },

  async createAppointment(payload: AppointmentCreatePayload): Promise<Appointment> {
    await delay()
    const patient = ownPatient() ?? patients.find((p) => p.id === payload.patientId)
    const doctor = doctors.find((d) => d.id === payload.doctorId)
    const specialty = specialties.find((s) => s.id === payload.specialtyId)
    if (!patient || !doctor) throw new Error('Paciente o médico no encontrado')

    const conflict = baseAppointments.some(
      (a) =>
        a.doctorId === doctor.id &&
        a.date === payload.date &&
        a.startTime === payload.startTime &&
        a.status !== 'CANCELLED',
    )
    if (conflict) throw new Error('El horario seleccionado no está disponible')

    const appointment: Appointment = {
      id: nextId(baseAppointments),
      code: `CIT-2025-${String(nextId(baseAppointments) + 1).padStart(4, '0')}`,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      doctorId: doctor.id,
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
      specialtyId: specialty?.id ?? 0,
      specialtyName: specialty?.name ?? '',
      date: payload.date,
      startTime: payload.startTime,
      endTime: payload.startTime,
      status: 'PENDING',
      box: doctor.box,
      reason: payload.reason,
      createdAt: new Date().toISOString(),
    }
    baseAppointments.push(appointment)
    return appointment
  },

  async updateAppointmentStatus(id: number, status: Appointment['status']): Promise<Appointment> {
    await delay()
    const appointment = baseAppointments.find((a) => a.id === id)
    if (!appointment) throw new Error('Cita no encontrada')
    appointment.status = status
    return appointment
  },

  async getAvailability(): Promise<AvailabilitySlot[]> {
    await delay()
    return [...availability]
  },

  async createAvailability(payload: AvailabilityCreatePayload): Promise<AvailabilitySlot> {
    await delay()
    const slot: AvailabilitySlot = {
      id: nextId(availability),
      doctorId: payload.doctorId ?? 1,
      date: payload.date,
      startTime: payload.startTime,
      endTime: payload.endTime,
      status: 'ACTIVE',
      box: payload.box ?? 'Box 104',
    }
    availability.push(slot)
    return slot
  },

  async getDashboard(): Promise<DashboardSummary> {
    await delay()
    const today = baseAppointments.filter((a) => a.date === todayISO)
    return {
      totalAppointments: 1420,
      attendanceRate: 88.5,
      occupancyRate: 88.5,
      noShowRate: 4.2,
      pendingCount: today.filter((a) => a.status === 'PENDING').length,
      confirmedCount: today.filter((a) => a.status === 'CONFIRMED').length,
      checkedInCount: today.filter((a) => a.status === 'CHECKED_IN').length,
      inConsultationCount: 6,
      revenue: 186200,
      nextAppointments: baseAppointments.slice(0, 3),
      recentAppointments: baseAppointments.slice(0, 5),
      appointmentsToday: today,
    }
  },

  async getConsultationNotes(): Promise<ConsultationNote[]> {
    await delay(150)
    const mine = ownPatient()
    return mine ? consultationNotes.filter((n) => n.patientId === mine.id) : [...consultationNotes]
  },

  async createConsultationNote(payload: ConsultationNotePayload): Promise<ConsultationNote> {
    await delay(150)
    const appointment = baseAppointments.find((a) => a.id === payload.appointmentId)
    if (!appointment) throw new Error('Cita no encontrada')
    const note: ConsultationNote = {
      id: nextId(consultationNotes),
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      diagnosis: payload.diagnosis,
      treatment: payload.treatment,
      notes: payload.notes ?? '',
      createdAt: new Date().toISOString(),
    }
    consultationNotes.push(note)
    return note
  },

  async getPrescriptions(): Promise<Prescription[]> {
    await delay(150)
    const mine = ownPatient()
    return mine ? prescriptions.filter((p) => p.patientId === mine.id) : [...prescriptions]
  },

  async createPrescription(payload: PrescriptionPayload): Promise<Prescription> {
    await delay(150)
    const appointment = baseAppointments.find((a) => a.id === payload.appointmentId)
    if (!appointment) throw new Error('Cita no encontrada')
    const prescription: Prescription = {
      id: nextId(prescriptions),
      code: `RX-${String(nextId(prescriptions) + 1).padStart(4, '0')}`,
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      date: appointment.date,
      medications: payload.medications.map((med, index) => ({ id: index + 1, ...med })),
      instructions: payload.instructions,
      notes: payload.notes,
      createdAt: new Date().toISOString(),
    }
    prescriptions.push(prescription)
    return prescription
  },

  async getBoxes(): Promise<Box[]> {
    await delay()
    return [...boxes]
  },

  async createBox(payload: BoxCreatePayload): Promise<Box> {
    await delay()
    if (boxes.some((b) => b.code === payload.code)) throw new Error('Ya existe un box con ese código')
    if (payload.status === 'IN_USE' && !payload.doctorId) throw new Error('Un box en uso debe tener un médico asignado')
    const box: Box = {
      id: nextId(boxes),
      code: payload.code,
      name: payload.name,
      area: payload.area ?? '',
      floor: payload.floor ?? '',
      status: payload.status ?? 'FREE',
      doctorId: payload.doctorId ?? null,
      doctorName: doctors.find((d) => d.id === payload.doctorId) ? `${doctors.find((d) => d.id === payload.doctorId)?.firstName} ${doctors.find((d) => d.id === payload.doctorId)?.lastName}` : null,
      active: payload.active ?? true,
      createdAt: new Date().toISOString(),
    }
    boxes.push(box)
    return box
  },

  async updateBox(id: number, payload: Partial<BoxCreatePayload>): Promise<Box> {
    await delay()
    const box = boxes.find((b) => b.id === id)
    if (!box) throw new Error('Box no encontrado')
    if (payload.status === 'IN_USE' && payload.doctorId === undefined && !box.doctorId) {
      throw new Error('Un box en uso debe tener un médico asignado')
    }
    Object.assign(box, payload)
    if (payload.doctorId !== undefined) {
      box.doctorId = payload.doctorId
      const doctor = doctors.find((d) => d.id === payload.doctorId)
      box.doctorName = doctor ? `${doctor.firstName} ${doctor.lastName}` : null
    }
    return box
  },

  async deleteBox(id: number): Promise<void> {
    await delay()
    const index = boxes.findIndex((b) => b.id === id)
    if (index === -1) throw new Error('Box no encontrado')
    boxes.splice(index, 1)
  },

  async getExams(): Promise<ClinicalExam[]> {
    await delay(150)
    const patient = ownPatient()
    if (patient) return clinicalExams.filter((e) => e.patientId === patient.id)
    const doctor = ownDoctor()
    if (doctor) return clinicalExams.filter((e) => e.doctorId === doctor.id)
    return [...clinicalExams]
  },

  async createExam(payload: ClinicalExamPayload): Promise<ClinicalExam> {
    await delay(150)
    const appointment = baseAppointments.find((a) => a.id === payload.appointmentId)
    if (!appointment) throw new Error('Cita no encontrada')
    const exam: ClinicalExam = {
      id: nextId(clinicalExams),
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      category: payload.category,
      name: payload.name,
      result: payload.result ?? '',
      referenceRange: payload.referenceRange ?? '',
      status: payload.status ?? 'PENDING',
      performedAt: payload.performedAt ?? null,
      notes: payload.notes ?? '',
      createdAt: new Date().toISOString(),
    }
    clinicalExams.push(exam)
    return exam
  },

  async getInsurances(): Promise<Insurance[]> {
    await delay(150)
    return [...insurances]
  },

  async createInsurance(payload: InsuranceCreatePayload): Promise<Insurance> {
    await delay()
    if (payload.coveragePercent < 0 || payload.coveragePercent > 100) {
      throw new Error('El porcentaje de cobertura debe estar entre 0 y 100')
    }
    const insurance: Insurance = {
      id: nextId(insurances),
      code: payload.code,
      name: payload.name,
      coveragePercent: payload.coveragePercent,
      active: payload.active ?? true,
    }
    insurances.push(insurance)
    return insurance
  },

  async getBillings(): Promise<Billing[]> {
    await delay(150)
    return [...billings]
  },

  async createBilling(payload: BillingCreatePayload): Promise<Billing> {
    await delay()
    const appointment = baseAppointments.find((a) => a.id === payload.appointmentId)
    if (!appointment) throw new Error('Cita no encontrada')
    if (billings.some((b) => b.appointmentId === appointment.id)) {
      throw new Error('La cita ya tiene una liquidación registrada')
    }
    const patient = patients.find((p) => p.id === appointment.patientId)
    const specialty = specialties.find((s) => s.id === appointment.specialtyId)
    const insurance = insurances.find((i) => i.code === patient?.email.split('@')[0]) ?? insurances[0]
    const gross = Number(specialty?.fee ?? 80)
    const insuranceAmount = Math.round(gross * (insurance?.coveragePercent ?? 0)) / 100
    const billing: Billing = {
      id: nextId(billings),
      code: `LIQ-2025-${String(nextId(billings)).padStart(5, '0')}`,
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctorName,
      specialtyId: appointment.specialtyId,
      specialtyName: appointment.specialtyName,
      insuranceId: insurance?.id ?? null,
      insuranceName: insurance?.name ?? null,
      grossAmount: gross.toFixed(2),
      insuranceAmount: insuranceAmount.toFixed(2),
      copayAmount: (gross - insuranceAmount).toFixed(2),
      paymentMethod: payload.paymentMethod ?? 'CASH',
      status: payload.status ?? 'PENDING',
      createdAt: new Date().toISOString(),
    }
    billings.push(billing)
    return billing
  },

  async updateBilling(id: number, payload: Partial<BillingCreatePayload>): Promise<Billing> {
    await delay()
    const billing = billings.find((b) => b.id === id)
    if (!billing) throw new Error('Liquidación no encontrada')
    Object.assign(billing, payload)
    return billing
  },
}