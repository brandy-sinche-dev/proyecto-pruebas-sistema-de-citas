import { test, expect } from '@playwright/test';

test('CP00 - Verificar que el sistema de citas carga correctamente @regresion', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('body')).toBeVisible();

  await page.screenshot({
    path: 'evidencias/capturas/CP00-inicio.png',
    fullPage: true
  });
});
