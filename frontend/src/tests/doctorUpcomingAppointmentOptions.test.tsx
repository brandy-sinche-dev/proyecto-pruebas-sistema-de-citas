import { describe, expect, it, afterEach, beforeEach, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryProvider } from '@/lib/query'
import { AuthProvider } from '@/hooks/useAuth'
import { DoctorClinicalRecordsPage } from '@/features/doctor/DoctorClinicalRecordsPage'
import { DoctorPrescriptionsPage } from '@/features/doctor/DoctorPrescriptionsPage'
import { toLocalDateKey } from '@/lib/utils'
import type { Appointment } from '@/types'

vi.mock('@/services', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/services')>()

  const dayKey = (offset: number) => {
    const now = new Date()
    return toLocalDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset))
  }

  const appointment = (id: number, offset: number): Appointment => ({
    id,
    code: `CIT-TEST-${id}`,
    patientId: 1,
    patientName: `Paciente ${id}`,
    doctorId: 1,
    doctorName: 'Dra. Demo',
    specialtyId: 1,
    specialtyName: 'Cardiología',
    date: dayKey(offset),
    startTime: '09:00',
    endTime: '09:30',
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
  })

  return {
    ...mod,
    api: {
      ...mod.api,
      getAppointments: async () => [appointment(1, -1), appointment(2, 0), appointment(3, 1)],
    },
  }
})

const STORAGE_KEY = 'clinic-angry.auth.user'

function dayKey(offset: number) {
  const now = new Date()
  return toLocalDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset))
}

function renderPage(ui: React.ReactElement) {
  return render(
    <QueryProvider>
      <AuthProvider>{ui}</AuthProvider>
    </QueryProvider>,
  )
}

beforeEach(() => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      id: 1,
      username: 'dra.demo',
      email: 'dra.demo@demo.local',
      firstName: 'Dra',
      lastName: 'Demo',
      role: 'doctor',
      isActive: true,
      fullName: 'Dra Demo',
    }),
  )
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('citas ofrecidas en formularios del médico', () => {
  it('"Nueva nota" lista solo citas de hoy en adelante', async () => {
    const user = userEvent.setup()
    renderPage(<DoctorClinicalRecordsPage />)

    await user.click(await screen.findByRole('button', { name: /Nueva nota/ }))

    expect(await screen.findByRole('option', { name: new RegExp(dayKey(0)) })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: new RegExp(dayKey(1)) })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: new RegExp(dayKey(-1)) })).not.toBeInTheDocument()
  })

  it('"Nueva receta" lista solo citas de hoy en adelante', async () => {
    const user = userEvent.setup()
    renderPage(<DoctorPrescriptionsPage />)

    await user.click(await screen.findByRole('button', { name: /Nueva receta/ }))

    expect(await screen.findByRole('option', { name: new RegExp(dayKey(0)) })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: new RegExp(dayKey(1)) })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: new RegExp(dayKey(-1)) })).not.toBeInTheDocument()
  })
})
