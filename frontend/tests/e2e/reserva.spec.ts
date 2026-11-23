import { test, expect } from '@playwright/test';
import { DEMO_PASSWORD, loginAsPatient, selectSpecialtyAndDoctor } from './helpers';

const E2E_API_URL = process.env.E2E_API_URL ?? 'http://127.0.0.1:8000/api/v1';
const SLOT_BASE_OFFSET = 400 + (Math.floor(Date.now() / 60000) % 1000) * 5;

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


test('CP21 - Permitir dejar vacío el motivo de consulta @smoke @regresion', async ({ page, request }, testInfo) => {
  await selectSpecialtyAndDoctor(page);
  const doctorId = Number(await page.getByLabel('Médico').inputValue());

  const login = await request.post(`${E2E_API_URL}/auth/login/`, {
    data: { username: 'admin', password: DEMO_PASSWORD },
  });
  expect(login.status(), await login.text()).toBe(200);
  const { access } = await login.json();
  const headers = { Authorization: `Bearer ${access}` };

  const citasResponse = await request.get(`${E2E_API_URL}/appointments/`, { headers });
  expect(citasResponse.status(), await citasResponse.text()).toBe(200);
  const citas = await citasResponse.json();

  const fecha = new Date();
  fecha.setDate(fecha.getDate() + SLOT_BASE_OFFSET + testInfo.repeatEachIndex * 2 + testInfo.parallelIndex);
  const formatearFecha = () => [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, '0'),
    String(fecha.getDate()).padStart(2, '0'),
  ].join('-');
  let fechaTexto = formatearFecha();
  while (citas.some((cita: { doctorId: number; date: string; startTime: string }) =>
    cita.doctorId === doctorId && cita.date === fechaTexto && cita.startTime === '10:00')) {
    fecha.setDate(fecha.getDate() + 1);
    fechaTexto = formatearFecha();
  }

  const disponibilidad = await request.post(`${E2E_API_URL}/availability/`, {
    headers,
    data: {
      doctorId,
      date: fechaTexto,
      startTime: '10:00',
      endTime: '11:00',
      status: 'ACTIVE',
      box: 'Box 104',
    },
  });
  expect(disponibilidad.status(), await disponibilidad.text()).toBe(201);

  await page.reload();
  await selectSpecialtyAndDoctor(page);

  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByLabel('Fecha')).toBeVisible();
  await page.getByLabel('Fecha').fill(fechaTexto);

  const hora = page.getByLabel('Hora disponible');
  await expect.poll(() => hora.locator('option').count()).toBeGreaterThan(1);
  await hora.selectOption('10:00');
  await expect(hora).toHaveValue('10:00');

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
