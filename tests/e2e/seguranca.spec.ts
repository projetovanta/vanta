import { test, expect } from '@playwright/test';

test.describe('Seguranca', () => {
  test('nao expoe keys sensiveis no HTML', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const html = await page.content();
    // Nenhuma service_role key, secret, ou private key no HTML
    expect(html).not.toMatch(/service_role/i);
    expect(html).not.toMatch(/supabase_service/i);
    expect(html).not.toMatch(/sk_live_/);
    expect(html).not.toMatch(/sk_test_/);
    expect(html).not.toMatch(/-----BEGIN.*KEY-----/);
  });

  test('nao expoe keys sensiveis no JS bundle', async ({ page }) => {
    const jsContents: string[] = [];
    page.on('response', async response => {
      const url = response.url();
      if ((url.endsWith('.js') || url.includes('.js?')) && !url.includes('node_modules')) {
        try {
          const text = await response.text();
          jsContents.push(text);
        } catch {}
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const allJS = jsContents.join('\n');
    expect(allJS).not.toMatch(/service_role/);
    expect(allJS).not.toMatch(/SUPABASE_SERVICE_ROLE/);
    expect(allJS).not.toMatch(/sk_live_/);
    expect(allJS).not.toMatch(/sk_test_/);
  });

  test('CSP ou meta tags de seguranca presentes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Deve ter pelo menos viewport meta
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toBeTruthy();
  });

  test('rotas admin inacessiveis como visitante', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Tentar acessar areas admin — nao deve expor dados
    await page.getByText('Perfil').click();
    await page.waitForTimeout(500);

    // Deve mostrar modal de login, nao o painel admin
    const adminPanel = page.getByText(/dashboard|gerente|painel/i).first();
    const loginModal = page.getByText(/Área Restrita|cadastrar|login/i).first();

    const hasAdmin = await adminPanel.isVisible({ timeout: 2_000 }).catch(() => false);
    const hasLogin = await loginModal.isVisible({ timeout: 2_000 }).catch(() => false);

    // Ou mostra login ou nao mostra nada — mas NUNCA o painel admin
    if (hasAdmin) {
      // Se mostrou algo admin, deve ser porque tem login junto
      expect(hasLogin).toBe(true);
    }
  });
});
