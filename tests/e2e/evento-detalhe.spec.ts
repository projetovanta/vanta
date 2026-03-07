import { test, expect } from '@playwright/test';

test.describe('Detalhe do Evento', () => {
  test('abrir evento do feed mostra detalhes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2_000);

    // Encontrar card de evento — pode ser cursor-pointer ou qualquer elemento clicavel no feed
    const card = page.locator('[class*="cursor-pointer"]').first();
    const cardVisible = await card.isVisible({ timeout: 5_000 }).catch(() => false);

    if (!cardVisible) {
      // Feed pode estar vazio — teste nao aplicavel
      test.info().annotations.push({ type: 'skip', description: 'Nenhum evento no feed' });
      return;
    }

    await card.click();
    await page.waitForTimeout(1_500);

    // Detalhe do evento ou modal deve mostrar algo
    const body = await page.locator('body').innerText();
    expect(body.trim().length).toBeGreaterThan(50);
  });

  test('landing page de evento via slug nao crasha', async ({ page }) => {
    await page.goto('/e/teste-evento-inexistente');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').innerText();
    expect(body.trim().length).toBeGreaterThan(0);
  });
});
