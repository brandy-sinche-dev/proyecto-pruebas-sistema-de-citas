import { describe, expect, it } from 'vitest'
import { loginSchema, appointmentSchema } from '@/schemas'

describe('loginSchema', () => {
  it('es obligatorio el usuario', () => {
    const result = loginSchema.safeParse({ username: '', password: 'demo123' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'username')).toBe(true)
    }
  })

  it('rechaza contraseña menor a 6 caracteres', () => {
    const result = loginSchema.safeParse({ username: 'admin', password: '12345' })
    expect(result.success).toBe(false)
  })

  it('acepta credenciales válidas', () => {
    expect(loginSchema.safeParse({ username: 'admin', password: 'demo123' }).success).toBe(true)
  })
})

describe('appointmentSchema', () => {
  it('rechaza una cita en el pasado', () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const date = past.toISOString().split('T')[0]
    const result = appointmentSchema.safeParse({
      specialtyId: 1,
      doctorId: 1,
      date,
      startTime: '09:00',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'startTime')).toBe(true)
    }
  })

  it('convierte ids string en números (coerce)', () => {
    const future = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    const date = future.toISOString().split('T')[0]
    const result = appointmentSchema.safeParse({
      specialtyId: '1',
      doctorId: '2',
      date,
      startTime: '10:00',
    })
    expect(result.success).toBe(true)
  })
})