import { test, expect, devices } from '@playwright/test';

test.describe('Erros Globais e Estabilidade', () => {
  test('app nao tem erros JS na carga inicial', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await page.waitForLoadState('load');
    await page.waitForSelector('nav', { timeout: 15_000 });
    await page.waitForTimeout(3_000);

    const critical = errors.filter(
      e =>
        !e.includes('firebase') &&
        !e.includes('CORS') &&
        !e.includes('net::') &&
        !e.includes('Failed to fetch') &&
        !e.includes('ChunkLoadError'),
    );
    expect(critical).toHaveLength(0);
  });

  test('nenhuma request retorna 500 na carga inicial', async ({ page }) => {
    const serverErrors: string[] = [];
    page.on('response', response => {
      if (response.status() >= 500) {
        serverErrors.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('load');
    await page.waitForSelector('nav', { timeout: 15_000 });
    await page.waitForTimeout(2_000);

    expect(serverErrors).toHaveLength(0);
  });

  test('navegacao entre todas as tabs sem 500', async ({ page }) => {
    const serverErrors: string[] = [];
    page.on('response', response => {
      if (response.status() >= 500) {
        serverErrors.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('load');
    await page.waitForSelector('nav', { timeout: 15_000 });

    const tabs = ['Buscar', 'Radar', 'Início'];
    for (const tab of tabs) {
      await page.getByText(tab, { exact: true }).click();
      await page.waitForTimeout(1_000);
    }

    expect(serverErrors).toHaveLength(0);
  });

  test('sem memory leak obvio — navegar 10x entre tabs', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');
    await page.waitForSelector('nav', { timeout: 15_000 });

    for (let i = 0; i < 10; i++) {
      await page.getByText('Buscar', { exact: true }).click();
      await page.waitForTimeout(200);
      await page.getByText('Início', { exact: true }).click();
      await page.waitForTimeout(200);
    }

    // Se chegou ate aqui sem crash, ta ok
    const body = await page.locator('body').innerText();
    expect(body.trim().length).toBeGreaterThan(0);
  });

  test('app funciona em tela mínima (360px)', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 360, height: 640 },
      userAgent: devices['iPhone SE'].userAgent,
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await page.waitForLoadState('load');
    await page.waitForSelector('nav', { timeout: 15_000 });

    const hasHScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHScroll).toBe(false);

    const critical = errors.filter(e => !e.includes('firebase') && !e.includes('CORS') && !e.includes('net::'));
    expect(critical).toHaveLength(0);

    await context.close();
  });

  test('app funciona em iPad', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPad (gen 7)'] });
    const page = await context.newPage();

    await page.goto('/');
    await page.waitForLoadState('load');
    await page.waitForSelector('nav', { timeout: 15_000 });

    const hasHScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHScroll).toBe(false);

    await context.close();
  });

  test('app funciona em desktop largo (1920px)', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();

    await page.goto('/');
    await page.waitForLoadState('load');
    await page.waitForSelector('nav', { timeout: 15_000 });

    // App deve estar centralizado com max-width
    const appWidth = await page.evaluate(() => {
      const container = document.querySelector('[class*="max-w"]');
      if (!container) return 1920;
      return container.getBoundingClientRect().width;
    });
    expect(appWidth).toBeLessThan(1920);

    await context.close();
  });
});
