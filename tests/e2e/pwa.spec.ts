import { test, expect } from '@playwright/test';

test.describe('PWA Requirements', () => {
  test('manifest.json é acessível e válido', async ({ page }) => {
    const response = await page.goto('/manifest.json');
    expect(response).toBeTruthy();
    expect(response!.status()).toBe(200);

    const text = await response!.text();
    const manifest = JSON.parse(text);
    expect(manifest.name).toBe('VANTA');
    expect(manifest.short_name).toBe('VANTA');
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('/');
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThanOrEqual(4);

    // Verificar ícones obrigatórios
    const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
    expect(sizes).toContain('48x48');
    expect(sizes).toContain('96x96');
  });

  test('ícones carregam corretamente', async ({ page }) => {
    const icons = ['/icon-48.png', '/icon-96.png', '/icon-192.png', '/icon-512.png', '/icon-1024.png'];

    for (const icon of icons) {
      const response = await page.goto(icon);
      expect(response?.status()).toBe(200);
      expect(response?.headers()['content-type']).toContain('image/png');
    }
  });

  test('service worker registrado após navegação', async ({ page }) => {
    await page.goto('/');
    // SW pode levar alguns segundos para registrar
    await page.waitForTimeout(5_000);

    const swRegistered = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      const registrations = await navigator.serviceWorker.getRegistrations();
      return registrations.length > 0;
    });

    // Em dev mode, SW pode não estar ativo (vite-plugin-pwa só registra em build)
    // Teste passa se SW existe OU se estamos em dev mode
    if (!swRegistered) {
      const isDev = await page.evaluate(() => {
        return window.location.port === '5173';
      });
      // Em dev, é esperado que SW não esteja registrado
      expect(isDev).toBe(true);
    }
  });

  test('apple-touch-icon existe', async ({ page }) => {
    const response = await page.goto('/apple-touch-icon.png');
    expect(response?.status()).toBe(200);
  });

  test('meta tags PWA estão presentes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // theme-color
    const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(themeColor).toBeTruthy();

    // apple-mobile-web-app-capable
    const capable = await page.locator('meta[name="apple-mobile-web-app-capable"]').getAttribute('content');
    expect(capable).toBe('yes');

    // viewport
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
  });
});
