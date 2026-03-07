import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('pagina carrega em menos de 10 segundos', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(10_000);
  });

  test('bundle JS total < 5MB', async ({ page }) => {
    let totalJS = 0;
    page.on('response', response => {
      const url = response.url();
      if (url.endsWith('.js') || url.includes('.js?')) {
        const size = Number(response.headers()['content-length'] ?? 0);
        totalJS += size;
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 5MB e generoso — ideal seria < 2MB
    expect(totalJS).toBeLessThan(5 * 1024 * 1024);
  });

  test('nenhum request demora mais de 15s', async ({ page }) => {
    const slowRequests: string[] = [];

    page.on('requestfinished', async request => {
      const timing = request.timing();
      if (timing.responseEnd > 15_000) {
        slowRequests.push(`${request.url()} (${timing.responseEnd}ms)`);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(slowRequests).toHaveLength(0);
  });

  test('nenhuma imagem > 2MB carregada', async ({ page }) => {
    const heavyImages: string[] = [];
    page.on('response', response => {
      const ct = response.headers()['content-type'] ?? '';
      const size = Number(response.headers()['content-length'] ?? 0);
      if (ct.includes('image/') && size > 2 * 1024 * 1024) {
        heavyImages.push(`${response.url()} (${(size / 1024 / 1024).toFixed(1)}MB)`);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(heavyImages).toHaveLength(0);
  });
});
