
import { test, expect } from '@playwright/test';

test('CP11 - Validar registro con campos vacíos @regresion', async ({ page }) => {
  await page.goto('/registro');

  await page.getByRole('button', { name: 'Registrarme' }).click();

  await expect(page.getByText(/nombre/i).first()).toBeVisible();
  await expect(page.getByText(/apellido/i).first()).toBeVisible();
});

test('CP12 - Rechazar correo electrónico inválido @smoke @regresion', async ({ page }) => {
  await page.goto('/registro');

  await page.getByLabel('Nombre').fill('María');
  await page.getByLabel('Apellido').fill('Gómez');
  await page.getByLabel('Correo electrónico').fill('correo-invalido');
  await page.getByLabel('Usuario').fill('maria.test');
  await page.getByLabel('Contraseña', { exact: true }).fill('Clave123');
  await page.getByLabel('Confirmar contraseña').fill('Clave123');

  await page.getByRole('button', { name: 'Registrarme' }).click();

  await expect(page.getByText(/correo/i).first()).toBeVisible();
});
