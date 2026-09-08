import type {
  Appointment,
  AppointmentCreatePayload,
  AvailabilitySlot,
  Doctor,
  Patient,
  Specialty,
  DashboardSummary,
  User,
  LoginCredentials,
  AuthTokens,
  AuthUser,
  ConsultationNote,
  Prescription,
  RegisterPayload,
} from '../../types'

const now = Date.now()
const day = 24 * 60 * 60 * 1000

const todayISO = new Date().toISOString().split('T')[0]
const tomorrowISO = new Date(Date.now() + day).toISOString().split('T')[0]
const nextWeekISO = new Date(Date.now() + 7 * day).toISOString().split('T')[0]

export const specialties: Specialty[] = [
  { id: 1, name: 'Cardiología', color: '#0D9488', icon: 'cardiology' },
  { id: 2, name: 'Pediatría', color: '#0284C7', icon: 'pediatrics' },
  { id: 3, name: 'Dermatología', color: '#7C3AED', icon: 'dermatology' },
  { id: 4, name: 'Ginecología', color: '#DB2777', icon: 'gynecology' },
  { id: 5, name: 'Traumatología', color: '#EA580C', icon: 'orthopedics' },
  { id: 6, name: 'Medicina General', color: '#64748B', icon: 'stethoscope' },
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

const users: User[] = [
  { id: 1, username: 'admin', email: 'admin@clinicangry.com', firstName: 'Claudia', lastName: 'Director', role: 'admin', isActive: true },
  { id: 2, username: 'recepcion', email: 'recepcion@clinicangry.com', firstName: 'Sandra', lastName: 'Paredes', role: 'receptionist', isActive: true },
  { id: 3, username: 'dra.ramos', email: 'elena.ramos@clinicangry.com', firstName: 'Elena', lastName: 'Ramos', role: 'doctor', isActive: true },
  { id: 4, username: 'paciente', email: 'maria.gomez@mail.com', firstName: 'María', lastName: 'Gómez', role: 'patient', isActive: true },
]

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

function nextId(items: Array<{ id: number }>) {
  return Math.max(0, ...items.map((item) => item.id)) + 1
}

function publicify(user: User): AuthUser {
  return { ...user, fullName: `${user.firstName} ${user.lastName}` }
}

export const mockApi = {
  async login(credentials: LoginCredentials): Promise<{ tokens: AuthTokens; user: AuthUser }> {
    await delay()
    const user = users.find((u) => u.username === credentials.username)
    if (!user || !credentials.password) {
      throw new Error('Credenciales inválidas')
    }
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

  async getDoctors(): Promise<Doctor[]> {
    await delay()
    return [...doctors]
  },

  async getSpecialties(): Promise<Specialty[]> {
    await delay(150)
    return [...specialties]
  },

  async getAppointments(): Promise<Appointment[]> {
    await delay()
    return [...baseAppointments]
  },

  async createAppointment(payload: AppointmentCreatePayload): Promise<Appointment> {
    await delay()
    const patient = patients.find((p) => p.id === payload.patientId)
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
      inConsultationCount: 6,
      revenue: 186200,
      nextAppointments: baseAppointments.slice(0, 3),
      recentAppointments: baseAppointments.slice(0, 5),
      appointmentsToday: today,
    }
  },

  async getConsultationNotes(): Promise<ConsultationNote[]> {
    await delay(150)
    return [...consultationNotes]
  },

  async getPrescriptions(): Promise<Prescription[]> {
    await delay(150)
    return [...prescriptions]
  },
}