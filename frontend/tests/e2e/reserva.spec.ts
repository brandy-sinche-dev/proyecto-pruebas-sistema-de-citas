import { test, expect } from '@playwright/test';
import { findAvailableSlot, loginAsPatient, selectSpecialtyAndDoctor } from './helpers';

test.beforeEach(async ({ page }) => {
  await loginAsPatient(page);
  await page.goto('/paciente/agendar');
});

test('CP13 - No permite continuar sin elegir especialidad y médico @regresion', async ({ page }) => {
  await expect(page.getByLabel('Especialidad')).toBeVisible();
  await expect(page.getByLabel('Médico')).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();
});

test('CP14 - Permite avanzar al paso de fecha y hora al elegir especialidad y médico @smoke @regresion', async ({ page }) => {
  await selectSpecialtyAndDoctor(page);

  await page.getByRole('button', { name: 'Continuar' }).click();

  await expect(page.getByLabel('Fecha')).toBeVisible();
  await expect(page.getByText('2. Fecha y hora')).toBeVisible();
});


test('CP18 - No avanzar sin seleccionar fecha y hora @regresion', async ({ page }) => {
  await selectSpecialtyAndDoctor(page);

  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByLabel('Fecha')).toBeVisible();

  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByLabel('Fecha')).toBeVisible();
  await expect(page.getByText('2. Fecha y hora')).toBeVisible();
});

test('CP19 - Volver al paso de especialidad y médico @regresion', async ({ page }) => {
  await selectSpecialtyAndDoctor(page);

  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByLabel('Fecha')).toBeVisible();

  await page.getByRole('button', { name: 'Anterior' }).click();
  await expect(page.getByLabel('Especialidad')).toBeVisible();
  await expect(page.getByLabel('Médico')).toBeVisible();
});

test('CP20 - Mostrar aviso cuando no hay horarios disponibles @regresion', async ({ page }) => {
  await selectSpecialtyAndDoctor(page);

  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByLabel('Fecha')).toBeVisible();

  await page.getByLabel('Fecha').fill('2099-12-31');

  await expect(
    page.getByText(/no hay horarios publicados/i)
  ).toBeVisible();
});


test('CP21 - Permitir dejar vacío el motivo de consulta @smoke @regresion', async ({ page }) => {
  await selectSpecialtyAndDoctor(page);

  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByLabel('Fecha')).toBeVisible();

  const horarioEncontrado = await findAvailableSlot(page);
  expect(horarioEncontrado, 'Debe existir un horario disponible').toBeTruthy();

  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText('3. Confirmación')).toBeVisible();
  await expect(
    page.getByLabel('Motivo de la consulta (opcional)')
  ).toBeVisible();

  await expect(
    page.getByRole('button', { name: /confirmar reserva/i })
  ).toBeVisible();
  await page.getByRole('button', { name: /confirmar reserva/i }).click();
  await expect(page.getByText('¡Cita solicitada!')).toBeVisible();
});
