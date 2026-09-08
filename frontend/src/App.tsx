import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { AppLayout } from '@/features/layout/AppLayout'
import { ProtectedRoute, RoleRoute } from '@/features/layout/routeGuards'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { PasswordRecoveryPage } from '@/features/auth/PasswordRecoveryPage'
import { AdminDashboardPage } from '@/features/admin/AdminDashboardPage'
import { AdminAppointmentsPage } from '@/features/admin/AdminAppointmentsPage'
import { AdminPatientsPage } from '@/features/admin/AdminPatientsPage'
import { AdminDoctorsPage } from '@/features/admin/AdminDoctorsPage'
import { AdminSpecialtiesPage } from '@/features/admin/AdminSpecialtiesPage'
import { AdminSchedulesPage } from '@/features/admin/AdminSchedulesPage'
import { AdminConsultoriosPage } from '@/features/admin/AdminConsultoriosPage'
import { AdminAuditPage } from '@/features/admin/AdminAuditPage'
import { ReceptionDashboardPage } from '@/features/reception/ReceptionDashboardPage'
import { ReceptionAppointmentsPage } from '@/features/reception/ReceptionAppointmentsPage'
import { ReceptionPatientsPage } from '@/features/reception/ReceptionPatientsPage'
import { ReceptionDoctorsPage } from '@/features/reception/ReceptionDoctorsPage'
import { DoctorAgendaPage } from '@/features/doctor/DoctorAgendaPage'
import { DoctorBoxPatientsPage } from '@/features/doctor/DoctorBoxPatientsPage'
import { DoctorAvailabilityPage } from '@/features/doctor/DoctorAvailabilityPage'
import { DoctorClinicalRecordsPage } from '@/features/doctor/DoctorClinicalRecordsPage'
import { DoctorPrescriptionsPage } from '@/features/doctor/DoctorPrescriptionsPage'
import { PatientDashboardPage } from '@/features/patient/PatientDashboardPage'
import { PatientAppointmentsPage } from '@/features/patient/PatientAppointmentsPage'
import { PatientBookAppointmentPage } from '@/features/patient/PatientBookAppointmentPage'
import { PatientSpecialtiesPage } from '@/features/patient/PatientSpecialtiesPage'
import { PatientDoctorsPage } from '@/features/patient/PatientDoctorsPage'
import { PatientHistoryPage } from '@/features/patient/PatientHistoryPage'
import { PatientProfilePage } from '@/features/patient/PatientProfilePage'
import type { Role } from '@/types'

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-4 text-center">
      <p className="material-symbols-outlined text-6xl text-primary">medical_information</p>
      <h1 className="font-display text-3xl font-bold text-primary">Página no encontrada</h1>
      <p className="max-w-md text-sm text-on-surface-variant">
        La ruta que intentas abrir no existe o tu rol no tiene acceso a ella.
      </p>
      <Link to="/" className="btn-primary inline-flex items-center gap-2">
        <span className="material-symbols-outlined text-base">home</span>
        Volver al inicio
      </Link>
    </div>
  )
}

function SegmentLayout({ role }: { role: Role }) {
  return (
    <RoleRoute roles={[role]}>
      <AppLayout />
    </RoleRoute>
  )
}

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/registro', element: <RegisterPage /> },
  {
    path: '/recuperar',
    element: <ProtectedRoute><PasswordRecoveryPage /></ProtectedRoute>,
  },
  { path: '/', element: <Navigate to="/login" replace /> },

  {
    path: '/admin',
    element: <SegmentLayout role="admin" />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'citas', element: <AdminAppointmentsPage /> },
      { path: 'pacientes', element: <AdminPatientsPage /> },
      { path: 'medicos', element: <AdminDoctorsPage /> },
      { path: 'especialidades', element: <AdminSpecialtiesPage /> },
      { path: 'horarios', element: <AdminSchedulesPage /> },
      { path: 'consultorios', element: <AdminConsultoriosPage /> },
      { path: 'auditoria', element: <AdminAuditPage /> },
    ],
  },

  {
    path: '/recepcion',
    element: <SegmentLayout role="receptionist" />,
    children: [
      { index: true, element: <ReceptionDashboardPage /> },
      { path: 'citas', element: <ReceptionAppointmentsPage /> },
      { path: 'pacientes', element: <ReceptionPatientsPage /> },
      { path: 'medicos', element: <ReceptionDoctorsPage /> },
    ],
  },

  {
    path: '/medico',
    element: <SegmentLayout role="doctor" />,
    children: [
      { index: true, element: <DoctorAgendaPage /> },
      { path: 'citas', element: <DoctorBoxPatientsPage /> },
      { path: 'disponibilidad', element: <DoctorAvailabilityPage /> },
      { path: 'consultas', element: <DoctorClinicalRecordsPage /> },
      { path: 'recetas', element: <DoctorPrescriptionsPage /> },
    ],
  },

  {
    path: '/paciente',
    element: <SegmentLayout role="patient" />,
    children: [
      { index: true, element: <PatientDashboardPage /> },
      { path: 'citas', element: <PatientAppointmentsPage /> },
      { path: 'agendar', element: <PatientBookAppointmentPage /> },
      { path: 'especialidades', element: <PatientSpecialtiesPage /> },
      { path: 'medicos', element: <PatientDoctorsPage /> },
      { path: 'historial', element: <PatientHistoryPage /> },
      { path: 'perfil', element: <PatientProfilePage /> },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
])

function App() {
  return <RouterProvider router={router} />
}

export default App