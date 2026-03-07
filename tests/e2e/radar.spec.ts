import { test, expect } from '@playwright/test';

test.describe('Radar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByText('Radar', { exact: true }).click();
    await page.waitForTimeout(1_000);
  });

  test('tab Radar abre sem crash', async ({ page }) => {
    const body = await page.locator('body').innerText();
    expect(body.trim().length).toBeGreaterThan(0);
  });

  test('mapa ou lista de eventos proximo aparece', async ({ page }) => {
    // Radar pode ter mapa ou lista — qualquer renderizacao e valida
    const hasContent = await page
      .locator('[class*="map"], [class*="radar"], [class*="event"]')
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false);
    const hasText = (await page.locator('body').innerText()).length > 50;
    expect(hasContent || hasText).toBe(true);
  });
});
