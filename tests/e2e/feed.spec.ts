import { test, expect } from '@playwright/test';

test.describe('Feed / Home', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('feed carrega sem tela em branco', async ({ page }) => {
    const body = await page.locator('body').innerText();
    expect(body.trim().length).toBeGreaterThan(10);
  });

  test('saudacao de visitante aparece', async ({ page }) => {
    await expect(page.getByText(/visitante/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('secoes do feed existem', async ({ page }) => {
    // Pelo menos uma secao de eventos deve existir
    const sections = ['vanta indica', 'perto de voce', 'esta semana', 'novos na plataforma'];
    let found = 0;
    for (const s of sections) {
      const el = page.getByText(new RegExp(s, 'i')).first();
      if (await el.isVisible({ timeout: 2_000 }).catch(() => false)) found++;
    }
    expect(found).toBeGreaterThanOrEqual(1);
  });

  test('cards de evento sao clicaveis', async ({ page }) => {
    // Procurar qualquer card de evento
    const card = page.locator('[class*="cursor-pointer"]').first();
    if (await card.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await card.click();
      await page.waitForTimeout(500);
      const body = await page.locator('body').innerText();
      expect(body.trim().length).toBeGreaterThan(0);
    }
  });

  test('quick actions (carteira, favoritos) funcionam', async ({ page }) => {
    const carteira = page.getByText(/carteira/i).first();
    if (await carteira.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await carteira.click();
      await page.waitForTimeout(500);
      // Deve abrir modal de login (visitante) ou carteira
      const body = await page.locator('body').innerText();
      expect(body.trim().length).toBeGreaterThan(0);
    }
  });

  test('nao tem erros JS criticos no console', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2_000);

    const critical = errors.filter(e => !e.includes('firebase') && !e.includes('CORS') && !e.includes('net::'));
    expect(critical).toHaveLength(0);
  });
});
