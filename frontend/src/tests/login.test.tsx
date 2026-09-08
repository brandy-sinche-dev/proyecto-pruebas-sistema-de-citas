import { describe, expect, it, afterEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import { LoginPage } from '@/features/auth/LoginPage'

const STORAGE_KEY = 'clinic-angry.auth.user'

function renderWithProviders(initialEntries: string[] = ['/login']) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<div>Panel de administración</div>} />
          <Route path="/paciente" element={<div>Portal del paciente</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('LoginPage', () => {
  it('muestra las cuentas de demostración', () => {
    renderWithProviders()
    expect(screen.getByText('Cuentas de demostración (API real)')).toBeInTheDocument()
    expect(screen.getByText('@admin')).toBeInTheDocument()
    expect(screen.getByText('@dra.ramos')).toBeInTheDocument()
    expect(screen.getByText('@paciente')).toBeInTheDocument()
  })

  it('exige usuario y contraseña', async () => {
    const user = userEvent.setup()
    renderWithProviders()

    await user.type(screen.getByLabelText('Contraseña'), '123')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByText('El usuario es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('La contraseña debe tener al menos 6 caracteres')).toBeInTheDocument()
  })

  it('resalta un error ante credenciales inválidas', async () => {
    const user = userEvent.setup()
    renderWithProviders()

    await user.type(screen.getByLabelText('Usuario'), 'usuario.invalido')
    await user.type(screen.getByLabelText('Contraseña'), 'demo123')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument()
  })

  it('navega al panel de administración con la cuenta admin', async () => {
    const user = userEvent.setup()
    renderWithProviders()

    await user.click(screen.getByText('@admin'))
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByText('Panel de administración')).toBeInTheDocument()
    expect(localStorage.getItem(STORAGE_KEY)).toContain('"username":"admin"')
  })
})