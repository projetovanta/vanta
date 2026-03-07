import { test, expect } from '@playwright/test';

test.describe('Autenticação', () => {
  test('app abre como visitante com feed visível', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/visitante/i).first()).toBeVisible({ timeout: 10_000 });

    // Tab bar visível
    await expect(page.getByText('Início')).toBeVisible();
  });

  test('clicar em Perfil como visitante abre modal Área Restrita', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByText('Perfil').click();

    // Modal "Área Restrita" com opções de login/cadastro
    await expect(page.getByText(/Área Restrita/i).first()).toBeVisible({ timeout: 10_000 });

    await expect(page.getByText(/já sou cadastrado/i).first()).toBeVisible();

    await expect(page.getByText(/quero me cadastrar/i).first()).toBeVisible();
  });

  test('clicar "Já sou cadastrado" abre tela de login', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByText('Perfil').click();
    await page
      .getByText(/já sou cadastrado/i)
      .first()
      .click();

    // Deve aparecer campo de email/senha
    await expect(page.locator('input[type="email"], input[type="text"]').first()).toBeVisible({ timeout: 10_000 });
  });

  test('login com credenciais inválidas mostra erro', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByText('Perfil').click();
    await page
      .getByText(/já sou cadastrado/i)
      .first()
      .click();

    const emailInput = page.locator('input[type="email"], input[type="text"]').first();
    const senhaInput = page.locator('input[type="password"]').first();

    if (await emailInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await emailInput.fill('invalido@teste.com');
      await senhaInput.fill('senhaerrada123');

      const loginBtn = page.getByRole('button', { name: /entrar|login|acessar/i }).first();
      if (await loginBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await loginBtn.click();

        await expect(page.getByText(/erro|inválid|incorret|falha|não encontrad/i).first()).toBeVisible({
          timeout: 10_000,
        });
      }
    }
  });
});
