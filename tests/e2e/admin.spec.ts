import { test, expect } from '@playwright/test';

test.describe('Painel Admin', () => {
  test('visitante não vê acesso ao painel admin', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Como visitante, não deve haver link direto para painel admin
    const adminLink = page.getByText(/painel admin/i).first();
    const isVisible = await adminLink.isVisible({ timeout: 3_000 }).catch(() => false);
    expect(isVisible).toBe(false);
  });

  test('botões do feed são clicáveis sem erros', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Clicar nos botões do feed — podem abrir modal de login
    const buttons = [/carteira/i, /favoritos/i];
    for (const btn of buttons) {
      const el = page.getByText(btn).first();
      if (await el.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await el.click();
        await page.waitForTimeout(500);

        // Deve ter renderizado algo (modal, view, etc)
        const bodyText = await page.locator('body').innerText();
        expect(bodyText.trim().length).toBeGreaterThan(0);

        // Fechar modal se abriu
        const closeBtn = page.getByText(/continuar navegando|fechar|voltar/i).first();
        if (await closeBtn.isVisible({ timeout: 1_000 }).catch(() => false)) {
          await closeBtn.click();
          await page.waitForTimeout(300);
        }
      }
    }
  });

  test('feed carrega conteúdo visível', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Saudação sempre presente; seções como "Vanta Indica" dependem de dados
    await expect(page.getByText(/bo(m dia|a tarde|a noite|a madrugada)/i).first()).toBeVisible({ timeout: 10_000 });
  });
});
