import { describe, expect, it } from 'vitest'
import { isUpcomingSlot, toLocalDateKey } from '@/lib/utils'
import type { AvailabilitySlot } from '@/types'

function dayOffset(offset: number) {
  const now = new Date()
  return toLocalDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset))
}

describe('isUpcomingSlot', () => {
  const todayKey = dayOffset(0)

  it('oculta los slots de días pasados', () => {
    expect(isUpcomingSlot(dayOffset(-1), todayKey)).toBe(false)
    expect(isUpcomingSlot(dayOffset(-30), todayKey)).toBe(false)
  })

  it('muestra el slot de hoy', () => {
    expect(isUpcomingSlot(todayKey, todayKey)).toBe(true)
  })

  it('muestra los slots de hoy en adelante', () => {
    expect(isUpcomingSlot(dayOffset(1), todayKey)).toBe(true)
    expect(isUpcomingSlot(dayOffset(45), todayKey)).toBe(true)
  })

  it('compara correctamente fechas cruzando fin de mes y fin de año', () => {
    expect(isUpcomingSlot('2026-09-30', '2026-10-01')).toBe(false)
    expect(isUpcomingSlot('2026-10-01', '2026-09-30')).toBe(true)
    expect(isUpcomingSlot('2025-12-31', '2026-01-01')).toBe(false)
    expect(isUpcomingSlot('2026-01-01', '2025-12-31')).toBe(true)
  })

  it('usa la fecha local por defecto', () => {
    expect(isUpcomingSlot(toLocalDateKey(new Date()))).toBe(true)
  })
})

describe('filtrado de disponibilidad propia desde hoy', () => {
  const todayKey = dayOffset(0)
  const slot = (date: string, doctorId: number): AvailabilitySlot => ({
    id: Number(date.replaceAll('-', '')),
    doctorId,
    date,
    startTime: '08:00',
    endTime: '12:00',
    status: 'ACTIVE',
    box: 'A1',
  })

  it('la tabla del médico muestra solo sus bloques de hoy en adelante', () => {
    const slots: AvailabilitySlot[] = [
      slot(dayOffset(-2), 7),
      slot(dayOffset(0), 7),
      slot(dayOffset(3), 7),
      slot(dayOffset(3), 9),
    ]

    const mine = slots.filter(
      (s) => s.doctorId === 7 && isUpcomingSlot(s.date, todayKey),
    )

    expect(mine).toHaveLength(2)
    expect(mine.every((s) => s.doctorId === 7)).toBe(true)
    expect(mine.some((s) => s.date < todayKey)).toBe(false)
  })
})
