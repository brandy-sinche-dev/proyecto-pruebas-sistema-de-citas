import { describe, expect, it, afterEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import { ProtectedRoute, RoleRoute } from '@/features/layout/routeGuards'
import type { AuthUser } from '@/types'

const STORAGE_KEY = 'clinic-angry.auth.user'

function protectedApp() {
  return (
    <AuthProvider>
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/login" element={<div>Página de login</div>} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <div>Área protegida</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  )
}

function roleApp() {
  return (
    <AuthProvider>
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <RoleRoute roles={['admin']}>
                <div>Solo administradores</div>
              </RoleRoute>
            }
          />
          <Route path="/paciente" element={<div>Portal del paciente</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  )
}

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('routeGuards', () => {
  it('redirige a /login cuando no hay sesión', () => {
    render(protectedApp())
    expect(screen.getByText('Página de login')).toBeInTheDocument()
    expect(screen.queryByText('Área protegida')).not.toBeInTheDocument()
  })

  it('permite el acceso cuando hay sesión', () => {
    const admin: AuthUser = {
      id: 1,
      username: 'admin',
      email: 'admin@clinicangry.com',
      firstName: 'Claudia',
      lastName: 'Director',
      role: 'admin',
      isActive: true,
      fullName: 'Claudia Director',
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(admin))
    render(protectedApp())
    expect(screen.getByText('Área protegida')).toBeInTheDocument()
  })

  it('rechaza un rol incorrecto y lo envía a su portal', () => {
    const patient: AuthUser = {
      id: 4,
      username: 'paciente',
      email: 'maria.gomez@example.com',
      firstName: 'María',
      lastName: 'Gómez',
      role: 'patient',
      isActive: true,
      fullName: 'María Gómez',
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patient))
    render(roleApp())
    expect(screen.getByText('Portal del paciente')).toBeInTheDocument()
    expect(screen.queryByText('Solo administradores')).not.toBeInTheDocument()
  })
})