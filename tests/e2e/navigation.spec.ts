import { test, expect } from '@playwright/test';

// Labels reais no DOM (CSS faz uppercase visual)
const TABS = ['Início', 'Radar', 'Buscar', 'Mensagens', 'Perfil'];

test.describe('Navegação principal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('tab bar renderiza todas as tabs', async ({ page }) => {
    for (const tab of TABS) {
      await expect(page.getByText(tab, { exact: true })).toBeVisible({ timeout: 5_000 });
    }
  });

  test('navegar entre tabs não causa tela em branco', async ({ page }) => {
    // Não navegar para Perfil/Mensagens (abrem modal de login como visitante)
    const navTabs = ['Buscar', 'Radar', 'Início'];

    for (const tab of navTabs) {
      await page.getByText(tab, { exact: true }).click();
      await page.waitForTimeout(500);

      const bodyText = await page.locator('body').innerText();
      expect(bodyText.trim().length).toBeGreaterThan(0);
    }
  });

  test('feed mostra saudação e seções', async ({ page }) => {
    await expect(page.getByText(/visitante/i).first()).toBeVisible();
    await expect(page.getByText(/carteira/i).first()).toBeVisible();
    await expect(page.getByText(/favoritos/i).first()).toBeVisible();
  });

  test('nenhum console.error crítico durante navegação', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    const navTabs = ['Buscar', 'Radar', 'Início'];
    for (const tab of navTabs) {
      await page.getByText(tab, { exact: true }).click();
      await page.waitForTimeout(500);
    }

    // Filtrar erros de rede/CORS/Firebase
    const appErrors = errors.filter(
      e =>
        !e.includes('net::') &&
        !e.includes('CORS') &&
        !e.includes('favicon') &&
        !e.includes('firebase') &&
        !e.includes('Failed to fetch') &&
        !e.includes('ERR_'),
    );
    expect(appErrors).toHaveLength(0);
  });
});
