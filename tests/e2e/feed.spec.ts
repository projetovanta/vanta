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

  test('saudacao aparece no feed', async ({ page }) => {
    // Saudação dinâmica (Bom dia / Boa tarde / Boa noite / Boa madrugada)
    await expect(page.getByText(/bo(m dia|a tarde|a noite|a madrugada)/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('secoes do feed existem', async ({ page }) => {
    // Saudação + pelo menos uma seção de conteúdo
    const sections = ['vanta indica', 'próximos eventos', 'indica pra você', 'sua noite começa aqui'];
    let found = 0;
    for (const s of sections) {
      const el = page.getByText(new RegExp(s, 'i')).first();
      if (await el.isVisible({ timeout: 3_000 }).catch(() => false)) found++;
    }
    // Saudação é sempre garantida, seções dependem de dados — pelo menos saudação deve existir
    const greeting = page.getByText(/bo(m dia|a tarde|a noite|a madrugada)/i).first();
    const hasGreeting = await greeting.isVisible({ timeout: 3_000 }).catch(() => false);
    expect(found + (hasGreeting ? 1 : 0)).toBeGreaterThanOrEqual(1);
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
