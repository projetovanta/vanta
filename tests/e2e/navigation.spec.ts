import { test, expect } from '@playwright/test';

// Labels reais no DOM (CSS faz uppercase visual)
const TABS = ['Início', 'Radar', 'Buscar', 'Mensagens', 'Perfil'];

test.describe('Navegação principal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');
    await page.waitForSelector('nav', { timeout: 15_000 });
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
      await page.waitForTimeout(800);

      // Radar é um mapa (canvas) e pode não ter innerText — verificar DOM childElementCount
      const hasContent = await page.evaluate(() => {
        const main = document.querySelector('main') || document.querySelector('[role="main"]');
        if (main && main.childElementCount > 0) return true;
        return document.body.innerText.trim().length > 0;
      });
      expect(hasContent).toBe(true);
    }
  });

  test('feed mostra conteúdo na Home', async ({ page }) => {
    // Saudação sempre presente, seções dependem de dados do Supabase
    await expect(page.getByText(/bo(m dia|a tarde|a noite|a madrugada)/i).first()).toBeVisible({ timeout: 10_000 });
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

    // Filtrar erros de rede/CORS/Firebase/Supabase
    const appErrors = errors.filter(
      e =>
        !e.includes('net::') &&
        !e.includes('CORS') &&
        !e.includes('favicon') &&
        !e.includes('firebase') &&
        !e.includes('Failed to fetch') &&
        !e.includes('ERR_') &&
        !e.includes('supabase') &&
        !e.includes('WebSocket') &&
        !e.includes('401') &&
        !e.includes('AbortError') &&
        !e.includes('NetworkError') &&
        !e.includes('adminService') &&
        !e.includes('refreshIndicaCards') &&
        !e.includes('[ERRO]'),
    );
    expect(appErrors).toHaveLength(0);
  });
});
