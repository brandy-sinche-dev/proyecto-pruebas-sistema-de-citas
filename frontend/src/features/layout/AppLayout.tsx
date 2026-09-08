import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { Role } from '@/types'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

const ROLE_BY_SEGMENT: Record<string, Role> = {
  admin: 'admin',
  medico: 'doctor',
  recepcion: 'receptionist',
  paciente: 'patient',
}

export function AppLayout() {
  const { user } = useAuth()
  const { pathname } = useLocation()

  if (!user) return null

  const segment = pathname.split('/')[1] ?? ''
  const role: Role = ROLE_BY_SEGMENT[segment] ?? user.role

  return (
    <div className="flex min-h-screen flex-col">
      <Header portal={segment} />
      <Sidebar role={role} />
      <main className="w-full flex-1 bg-surface px-4 pt-20 pb-10 md:pl-72 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}