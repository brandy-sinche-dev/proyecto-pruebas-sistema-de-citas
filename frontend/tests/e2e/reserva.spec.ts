import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Usuario').fill('paciente');
  await page.getByLabel('Contraseña', { exact: true }).fill('Clave123');
  await page.getByRole('button', { name: /ingresar|iniciar sesión/i }).click();
  await page.waitForURL(/paciente/);
  await page.goto('/paciente/agendar');
});

test('CP13 - No permite continuar sin elegir especialidad y médico @regresion', async ({ page }) => {
  await expect(page.getByLabel('Especialidad')).toBeVisible();
  await expect(page.getByLabel('Médico')).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();
});

test('CP14 - Permite avanzar al paso de fecha y hora al elegir especialidad y médico @smoke @regresion', async ({ page }) => {
  const specialty = page.getByLabel('Especialidad');
  await expect(specialty).toBeVisible();

  await expect.poll(async () => specialty.locator('option').count()).toBeGreaterThan(1);
  await specialty.selectOption({ index: 1 });

  const doctor = page.getByLabel('Médico');
  await expect.poll(async () => doctor.locator('option').count()).toBeGreaterThan(1);
  await doctor.selectOption({ index: 1 });

  await page.getByRole('button', { name: 'Continuar' }).click();

  await expect(page.getByLabel('Fecha')).toBeVisible();
  await expect(page.getByText('2. Fecha y hora')).toBeVisible();
});


test('CP18 - No avanzar sin seleccionar fecha y hora @regresion', async ({ page }) => {
  const specialty = page.getByLabel('Especialidad');
  await expect.poll(async () => specialty.locator('option').count()).toBeGreaterThan(1);
  await specialty.selectOption({ index: 1 });

  const doctor = page.getByLabel('Médico');
  await expect.poll(async () => doctor.locator('option').count()).toBeGreaterThan(1);
  await doctor.selectOption({ index: 1 });

  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByLabel('Fecha')).toBeVisible();

  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByLabel('Fecha')).toBeVisible();
  await expect(page.getByText('2. Fecha y hora')).toBeVisible();
});

test('CP19 - Volver al paso de especialidad y médico @regresion', async ({ page }) => {
  const specialty = page.getByLabel('Especialidad');
  await expect.poll(async () => specialty.locator('option').count()).toBeGreaterThan(1);
  await specialty.selectOption({ index: 1 });

  const doctor = page.getByLabel('Médico');
  await expect.poll(async () => doctor.locator('option').count()).toBeGreaterThan(1);
  await doctor.selectOption({ index: 1 });

  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByLabel('Fecha')).toBeVisible();

  await page.getByRole('button', { name: 'Anterior' }).click();
  await expect(page.getByLabel('Especialidad')).toBeVisible();
  await expect(page.getByLabel('Médico')).toBeVisible();
});

test('CP20 - Mostrar aviso cuando no hay horarios disponibles @regresion', async ({ page }) => {
  const specialty = page.getByLabel('Especialidad');
  await expect.poll(async () => specialty.locator('option').count()).toBeGreaterThan(1);
  await specialty.selectOption({ index: 1 });

  const doctor = page.getByLabel('Médico');
  await expect.poll(async () => doctor.locator('option').count()).toBeGreaterThan(1);
  await doctor.selectOption({ index: 1 });

  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByLabel('Fecha')).toBeVisible();

  await page.getByLabel('Fecha').fill('2099-12-31');

  await expect(
    page.getByText(/no hay horarios publicados/i)
  ).toBeVisible();
});


test('CP21 - Permitir dejar vacío el motivo de consulta @smoke @regresion', async ({ page }) => {
  const specialty = page.getByLabel('Especialidad');
  await expect.poll(() => specialty.locator('option').count()).toBeGreaterThan(1);
  await specialty.selectOption({ index: 1 });

  const doctor = page.getByLabel('Médico');
  await expect.poll(() => doctor.locator('option').count()).toBeGreaterThan(1);
  await doctor.selectOption({ index: 1 });

  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByLabel('Fecha')).toBeVisible();

  // Buscar una fecha disponible entre hoy y los próximos 7 días.
  const fechaInput = page.getByLabel('Fecha');
  const hora = page.getByLabel('Hora disponible');
  let horarioEncontrado = false;

  for (let dias = 0; dias <= 7; dias++) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    const fechaTexto = [
      fecha.getFullYear(),
      String(fecha.getMonth() + 1).padStart(2, '0'),
      String(fecha.getDate()).padStart(2, '0'),
    ].join('-');

    await fechaInput.fill(fechaTexto);

    try {
      await expect.poll(() => hora.locator('option').count(), {
        timeout: 1500,
      }).toBeGreaterThan(1);

      horarioEncontrado = true;
      break;
    } catch {
      // Probar el siguiente día.
    }
  }

  expect(horarioEncontrado, 'Debe existir un horario disponible').toBeTruthy();

  await hora.selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Continuar' }).click();

  await expect(
    page.getByLabel('Motivo de la consulta (opcional)')
  ).toBeVisible();

  await expect(
    page.getByRole('button', { name: /confirmar reserva/i })
  ).toBeVisible();
});