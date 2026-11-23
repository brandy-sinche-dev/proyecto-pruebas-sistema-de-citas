import { expect, type Page } from '@playwright/test';

export const PATIENT_USERNAME = process.env.E2E_PATIENT_USERNAME ?? 'paciente';
export const DEMO_PASSWORD = process.env.E2E_DEMO_PASSWORD ?? 'ClinicaAngry1';

export async function loginAsPatient(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Usuario').fill(PATIENT_USERNAME);
  await page.getByLabel('Contraseña', { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: /ingresar|iniciar sesión/i }).click();
  await expect(page).toHaveURL(/paciente/);
}

export async function selectSpecialtyAndDoctor(page: Page): Promise<void> {
  const specialty = page.getByLabel('Especialidad');
  const doctor = page.getByLabel('Médico');

  await expect(specialty).toBeVisible();
  await expect.poll(() => specialty.locator('option').count()).toBeGreaterThan(1);
  await specialty.selectOption({ index: 1 });

  await expect.poll(() => doctor.locator('option').count()).toBeGreaterThan(1);
  await doctor.selectOption({ index: 1 });
}

export async function findAvailableSlot(page: Page): Promise<boolean> {
  const fechaInput = page.getByLabel('Fecha');
  const hora = page.getByLabel('Hora disponible');
  const sinHorarios = page.getByText(/no hay horarios publicados/i);
  const hoy = new Date();

  for (let offset = 0; offset <= 8; offset++) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + offset);
    const fechaTexto = [
      fecha.getFullYear(),
      String(fecha.getMonth() + 1).padStart(2, '0'),
      String(fecha.getDate()).padStart(2, '0'),
    ].join('-');

    await fechaInput.fill(fechaTexto);

    await expect.poll(async () => {
      const conHorarios = (await hora.locator('option').count()) > 1;
      return conHorarios || (await sinHorarios.isVisible());
    }).toBe(true);

    if ((await hora.locator('option').count()) <= 1) continue;

    const primeraHora = await hora.locator('option').nth(1).getAttribute('value');
    if (!primeraHora) continue;

    await hora.selectOption(primeraHora);
    await expect(hora).toHaveValue(primeraHora);
    return true;
  }

  return false;
}
