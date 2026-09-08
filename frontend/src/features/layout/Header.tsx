import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { roleLabels } from './navigation'
import { Avatar } from '@/components/ui/Avatar'

export type PortalKey = 'admin' | 'medico' | 'recepcion' | 'paciente'

function getPortalKey(portal: string): PortalKey {
  switch (portal) {
    case 'admin':
    case 'medico':
    case 'recepcion':
    case 'paciente':
      return portal
    default:
      return 'admin'
  }
}

const portalTitles: Record<PortalKey, string> = {
  admin: 'Portal Administrativo',
  medico: 'Portal Médico Asistencial',
  recepcion: 'Recepción y Control',
  paciente: 'Portal del Paciente',
}

export function Header({ portal }: { portal: string }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  if (!user) return null
  const key = getPortalKey(portal)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 shadow-header backdrop-blur-xl md:px-6">
      <div className="flex min-w-max items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-display text-lg font-bold text-on-primary">
            A
          </span>
          <div className="flex flex-col">
            <span className="font-display text-lg leading-tight font-bold tracking-tight text-primary">
              Clínica Angry
            </span>
            <span className="text-xs font-medium text-on-surface-variant">{portalTitles[key]}</span>
          </div>
        </div>
        <div className="pointer-events-none hidden h-6 w-px bg-slate-200 lg:block" />
        <button
          type="button"
          className="hidden items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 text-sm text-on-surface hover:bg-surface-container-high lg:flex"
        >
          <span className="material-symbols-outlined text-base text-secondary">location_on</span>
          <span>Sede Central – San Isidro</span>
          <span className="material-symbols-outlined text-sm text-on-surface-variant">expand_more</span>
        </button>
      </div>

      <div className="hidden max-w-md flex-1 md:block">
        <div className="flex items-center rounded-lg bg-surface px-3 py-2 shadow-tier1">
          <span className="material-symbols-outlined mr-2 text-lg text-on-surface-variant">search</span>
          <input
            type="search"
            placeholder="Buscar por DNI, historia clínica o paciente…"
            aria-label="Buscar"
            className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline focus:outline-none"
          />
        </div>
      </div>

      <div className="flex min-w-max items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full bg-danger-50 px-3 py-1 text-xs font-medium text-on-error-container sm:flex">
          <span className="material-symbols-outlined text-sm">emergency</span>
          SOS (01) 612-4000
        </span>
        <span className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container hover:text-on-surface" aria-label={`Perfil de ${roleLabels[user.role]}`}>
          <span className="badge-pill border border-slate-200 bg-surface-bright text-on-surface-variant">
            {roleLabels[user.role]}
          </span>
        </span>
        <button
          type="button"
          className="relative rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          aria-label="Notificaciones"
        >
          <span className="material-symbols-outlined text-xl">notifications</span>
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-error" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2 pl-1">
          <Avatar name={user.fullName} />
          <div className="hidden text-left xl:block">
            <span className="block text-sm leading-tight font-semibold text-on-surface">{user.fullName}</span>
            <span className="block text-xs leading-tight text-secondary">{roleLabels[user.role]}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-danger-50 hover:text-danger-700"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          <span className="hidden md:inline">Salir</span>
        </button>
      </div>
    </header>
  )
}