
import { test, expect } from '@playwright/test';
import { loginAsPatient } from './helpers';

test.beforeEach(async ({ page }) => {
  await loginAsPatient(page);
  await page.goto('/paciente/citas');
});

test('CP15 - Mostrar la sección Mis citas @smoke @regresion', async ({ page }) => {
  await expect(
    page.getByRole('heading', { name: 'Mis citas', exact: true })
  ).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'Historial de mis citas' })
  ).toBeVisible();
});

test('CP16 - Ver las columnas del historial de citas @regresion', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Historial de mis citas' }))
    .toBeVisible();

  const tabla = page.getByRole('table');

  await expect(tabla).toBeVisible();
  await expect(tabla.getByRole('columnheader').first()).toBeVisible();
});


test('CP17 - Cerrar sesión del paciente @regresion', async ({ page }) => {
  await expect(
    page.getByRole('button', { name: 'Cerrar sesión' })
  ).toBeVisible();

  await page.getByRole('button', { name: 'Cerrar sesión' }).click();

  await expect(page).toHaveURL(/login/);
});
