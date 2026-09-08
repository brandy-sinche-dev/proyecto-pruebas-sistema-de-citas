import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import type { Role } from '@/types'
import { cn } from '@/lib/utils'

export interface NavItem {
  to: string
  label: string
  icon: string
}

export const roleNav: Record<Role, NavItem[]> = {
  admin: [
    { to: '/admin', label: 'Dashboard & Métricas', icon: 'analytics' },
    { to: '/admin/citas', label: 'Control de citas', icon: 'event_available' },
    { to: '/admin/pacientes', label: 'Pacientes', icon: 'group' },
    { to: '/admin/medicos', label: 'Médicos y turnos', icon: 'badge' },
    { to: '/admin/especialidades', label: 'Especialidades', icon: 'emergency' },
    { to: '/admin/horarios', label: 'Horarios', icon: 'schedule' },
    { to: '/admin/consultorios', label: 'Consultorios y boxes', icon: 'meeting_room' },
    { to: '/admin/auditoria', label: 'Auditoría', icon: 'verified_user' },
  ],
  receptionist: [
    { to: '/recepcion', label: 'Control diario & check-in', icon: 'calendar_today' },
    { to: '/recepcion/citas', label: 'Citas del día', icon: 'event' },
    { to: '/recepcion/pacientes', label: 'Pacientes', icon: 'folder_shared' },
    { to: '/recepcion/medicos', label: 'Médicos', icon: 'badge' },
  ],
  doctor: [
    { to: '/medico', label: 'Agenda diaria', icon: 'calendar_month' },
    { to: '/medico/citas', label: 'Pacientes en box', icon: 'emergency_home' },
    { to: '/medico/disponibilidad', label: 'Mi disponibilidad', icon: 'schedule' },
    { to: '/medico/consultas', label: 'Ficha clínica', icon: 'ecg' },
    { to: '/medico/recetas', label: 'Recetas electrónicas', icon: 'medication' },
  ],
  patient: [
    { to: '/paciente', label: 'Portal del paciente', icon: 'home_health' },
    { to: '/paciente/citas', label: 'Mis citas', icon: 'event_note' },
    { to: '/paciente/agendar', label: 'Agendar nueva cita', icon: 'add_circle' },
    { to: '/paciente/especialidades', label: 'Especialidades', icon: 'emergency' },
    { to: '/paciente/medicos', label: 'Médicos', icon: 'stethoscope' },
    { to: '/paciente/historial', label: 'Historial clínico', icon: 'history' },
    { to: '/paciente/perfil', label: 'Mi perfil', icon: 'account_circle' },
  ],
}

export const roleHome: Record<Role, string> = {
  admin: '/admin',
  receptionist: '/recepcion',
  doctor: '/medico',
  patient: '/paciente',
}

export const roleLabels: Record<Role, string> = {
  admin: 'Administración',
  receptionist: 'Recepción',
  doctor: 'Médico',
  patient: 'Paciente',
}

export function SidebarNav({ items }: { items: NavItem[] }) {
  return (
    <nav aria-label="Navegación principal" className="flex flex-col gap-1">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to.split('/').filter(Boolean).length === 1}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface',
              isActive && 'bg-primary-container text-on-primary-container hover:bg-primary-container hover:text-on-primary-container',
            )
          }
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              <span>{item.label}</span>
              {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-secondary" aria-hidden="true" />}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

export function SidebarSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <p className="px-3 pb-2 font-display text-xs font-semibold uppercase tracking-wider text-outline">{title}</p>
      {children}
    </section>
  )
}