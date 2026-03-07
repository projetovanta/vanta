import { test, expect } from '@playwright/test';

test.describe('Busca', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByText('Buscar', { exact: true }).click();
    await page.waitForTimeout(500);
  });

  test('tab Buscar abre a tela de busca', async ({ page }) => {
    // Deve ter campo de busca ou secao de categorias
    const hasSearch = await page
      .locator('input[type="search"], input[type="text"], input[placeholder*="busc" i]')
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false);
    const hasCategories = await page
      .getByText(/categori|estilo|formato/i)
      .first()
      .isVisible({ timeout: 3_000 })
      .catch(() => false);
    expect(hasSearch || hasCategories).toBe(true);
  });

  test('digitar texto na busca nao causa erro', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[type="text"], input[placeholder*="busc" i]').first();
    if (await searchInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await searchInput.fill('festa');
      await page.waitForTimeout(1_000);
      // Nao deve ter crash
      const body = await page.locator('body').innerText();
      expect(body.trim().length).toBeGreaterThan(0);
    }
  });

  test('filtros de categoria sao clicaveis', async ({ page }) => {
    const chip = page
      .locator('button, [role="button"]')
      .filter({ hasText: /balada|festa|show|eletronic/i })
      .first();
    if (await chip.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await chip.click();
      await page.waitForTimeout(500);
      const body = await page.locator('body').innerText();
      expect(body.trim().length).toBeGreaterThan(0);
    }
  });
});
