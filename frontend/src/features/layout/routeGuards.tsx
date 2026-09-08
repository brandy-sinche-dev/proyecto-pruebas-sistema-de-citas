import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { roleHome } from '@/features/layout/navigation'
import type { Role } from '@/types'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return children
}

export function RoleRoute({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  if (!user || !roles.includes(user.role)) {
    return <Navigate to={roleHome[user?.role ?? 'patient']} replace />
  }
  return children
}