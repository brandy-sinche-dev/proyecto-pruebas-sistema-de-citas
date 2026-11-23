
import { test, expect } from '@playwright/test';

test('CP03 - Validar inicio de sesión con campos vacíos @regresion', async ({ page }) => {
  await page.goto('/login');

  await page.getByRole('button', { name: 'Ingresar' }).click();

  await expect(page.getByText('El usuario es obligatorio')).toBeVisible();
  await expect(
    page.getByText('La contraseña debe tener al menos 6 caracteres')
  ).toBeVisible();
});

test('CP02 - Rechazar contraseña incorrecta @regresion', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Usuario').fill('admin');
  await page.getByLabel('Contraseña').fill('Incorrecta123');

  await page.getByRole('button', { name: 'Ingresar' }).click();

  await expect(page.getByRole('status')).toContainText(/incorrect|inválid|credenciales|error/i);
  await expect(page).toHaveURL(/\/login$/);



});


test('CP01 - Iniciar sesión correctamente @smoke @regresion', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Usuario').fill('admin');
  await page.getByLabel('Contraseña').fill('ClinicaAngry1');

  await page.getByRole('button', { name: 'Ingresar' }).click();

  await expect(page).not.toHaveURL(/\/login$/);
});

