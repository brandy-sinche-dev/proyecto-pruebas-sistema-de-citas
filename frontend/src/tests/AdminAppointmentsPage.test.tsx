import { describe, expect, it, afterEach } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryProvider } from '@/lib/query'
import { AdminAppointmentsPage } from '@/features/admin/AdminAppointmentsPage'

function renderPage() {
  return render(
    <QueryProvider>
      <AdminAppointmentsPage />
    </QueryProvider>,
  )
}

afterEach(() => {
  cleanup()
})

describe('AdminAppointmentsPage — acciones de citas', () => {
  it('confirma una cita pendiente y luego la marca como atendida', async () => {
    const user = userEvent.setup()
    renderPage()

    const codeCell = await screen.findByText('CIT-2025-0003')
    const row = codeCell.closest('tr')
    expect(row).not.toBeNull()
    const rowEl = row!

    const confirmButton = within(rowEl).getByRole('button', { name: 'Confirmar' })
    await user.click(confirmButton)

    expect(await screen.findByText(/¿Confirmar la cita CIT-2025-0003/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Sí, confirmar' }))

    const atendida = await within(rowEl).findByRole('button', { name: 'Atendida' })
    expect(atendida).toBeInTheDocument()

    await user.click(atendida)
    expect(
      await screen.findByText(/¿Estás seguro de marcar como atendida la cita CIT-2025-0003/),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Sí, marcar atendida' }))

    await waitFor(() => {
      expect(within(rowEl).queryByRole('button', { name: 'Atendida' })).not.toBeInTheDocument()
      expect(within(rowEl).queryByRole('button', { name: 'Confirmar' })).not.toBeInTheDocument()
    })
  })

  it('no ofrece Cancelar fuera de la ventana de cancelación', async () => {
    renderPage()

    const codeCell = await screen.findByText('CIT-2025-0001')
    const row = codeCell.closest('tr')
    expect(row).not.toBeNull()
    const rowEl = row!

    expect(within(rowEl).queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument()
    expect(within(rowEl).getByRole('button', { name: 'Atendida' })).toBeInTheDocument()
  })

  it('confirma una cita futura y luego la cancela', async () => {
    const user = userEvent.setup()
    renderPage()

    const codeCell = await screen.findByText('CIT-2025-0007')
    const row = codeCell.closest('tr')
    expect(row).not.toBeNull()
    const rowEl = row!

    const confirmButton = within(rowEl).getByRole('button', { name: 'Confirmar' })
    await user.click(confirmButton)
    expect(await screen.findByText(/¿Confirmar la cita CIT-2025-0007/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Sí, confirmar' }))

    const cancelButton = await within(rowEl).findByRole('button', { name: 'Cancelar' })
    expect(cancelButton).toBeInTheDocument()

    await user.click(cancelButton)
    expect(
      await screen.findByText(/¿Estás seguro de cancelar la cita CIT-2025-0007/),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Sí, cancelar' }))

    await waitFor(() => {
      expect(within(rowEl).queryByRole('button', { name: 'Atendida' })).not.toBeInTheDocument()
      expect(within(rowEl).queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument()
    })
  })
})