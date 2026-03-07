import { test, expect, devices } from '@playwright/test';

test.describe('Responsividade', () => {
  test('iPhone SE (375px) — sem scroll horizontal', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone SE'],
    });
    const page = await context.newPage();
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const hasHScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHScroll).toBe(false);

    await expect(page.getByText('Início')).toBeVisible();

    await context.close();
  });

  test('iPhone 14 (390px) — layout correto', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 14'],
    });
    const page = await context.newPage();
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const hasHScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHScroll).toBe(false);

    await expect(page.getByText(/visitante/i).first()).toBeVisible();

    await context.close();
  });

  test('iPad (768px) — layout tablet funcional', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPad (gen 7)'],
    });
    const page = await context.newPage();
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const hasHScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHScroll).toBe(false);

    await context.close();
  });

  test('Desktop (1280px) — app centralizado com max-width', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const appWidth = await page.evaluate(() => {
      const container = document.querySelector('[class*="max-w"]');
      if (!container) return 1280;
      return container.getBoundingClientRect().width;
    });

    expect(appWidth).toBeLessThan(1280);

    await context.close();
  });
});
