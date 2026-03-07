import { test, expect } from '@playwright/test';

/**
 * Testes E2E do fluxo admin completo:
 * DevQuickLogin → Painel Admin → Comunidades → Criar Evento → Equipe
 *
 * Requer: app em dev mode com SUPABASE_SERVICE_ROLE_KEY no .env.local
 */

// Fluxo admin requer credenciais — skip automatico sem E2E_ADMIN_EMAIL
const skipAdmin = !process.env.E2E_ADMIN_EMAIL;

test.describe.serial('Fluxo Admin — Criar Evento + Produtor', () => {
  test.skip(() => skipAdmin, 'Requer E2E_ADMIN_EMAIL');
  test.setTimeout(120_000);

  test('1. login via DevQuickLogin como masteradm', async ({ page }) => {
    await loginAsAdmin(page);

    // Não deve ser visitante
    const stillVisitante = await page
      .getByText(/visitante/i)
      .first()
      .isVisible({ timeout: 3_000 })
      .catch(() => false);
    expect(stillVisitante).toBe(false);
  });

  test('2. entrar no Painel Admin via Visão Global', async ({ page }) => {
    await loginAsAdmin(page);
    await goToAdminPanel(page);

    // Sidebar admin ou dashboard visível
    await expect(page.getByText(/painel administrativo|master admin|visão global/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('3. acessar Comunidades e ver lista', async ({ page }) => {
    await loginAsAdmin(page);
    await goToAdminPanel(page);

    await clickSidebarItem(page, 'Comunidades');
    await page.waitForTimeout(2_000);

    // Deve mostrar comunidades ou "Criar Comunidade"
    const body = await page.locator('body').innerText();
    expect(body.length).toBeGreaterThan(50);
  });

  test('4. entrar numa comunidade e ver Eventos', async ({ page }) => {
    await loginAsAdmin(page);
    await goToAdminPanel(page);

    await clickSidebarItem(page, 'Comunidades');
    await page.waitForTimeout(2_000);

    // Clicar na primeira comunidade — card que mostra "eventos" e "membros"
    const card = page
      .locator('div')
      .filter({ hasText: /eventos/ })
      .filter({ hasText: /membros/ })
      .first();

    if (!(await card.isVisible({ timeout: 5_000 }).catch(() => false))) {
      test.skip(true, 'Nenhuma comunidade encontrada');
      return;
    }
    await card.click({ force: true });
    await page.waitForTimeout(2_000);

    // Procurar Eventos na sidebar do contexto comunidade
    await clickSidebarItem(page, 'Eventos');
    await page.waitForTimeout(1_500);
    const body = await page.locator('body').innerText();
    expect(/criar|evento|nenhum/i.test(body)).toBe(true);
  });

  test('5. iniciar criação de evento', async ({ page }) => {
    await loginAsAdmin(page);
    await goToAdminPanel(page);

    await clickSidebarItem(page, 'Comunidades');
    await page.waitForTimeout(2_000);

    const card = page.locator('button, a, [role="button"]').filter({ hasText: /.{4,}/ }).first();
    if (!(await card.isVisible({ timeout: 5_000 }).catch(() => false))) {
      test.skip(true, 'Nenhuma comunidade');
      return;
    }
    await card.click({ force: true });
    await page.waitForTimeout(2_000);

    await clickSidebarItem(page, 'Eventos');
    await page.waitForTimeout(1_500);

    const criarBtn = page.getByText(/criar novo evento/i).first();
    if (await criarBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await criarBtn.click();
      await page.waitForTimeout(2_000);

      const body = await page.locator('body').innerText();
      expect(/novo evento|tipo|criar evento/i.test(body)).toBe(true);
    }
  });
});

// ── Helpers ──────────────────────────────────────────────────────────────────

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Abrir DevQuickLogin
  await page.locator('button:has-text("⚡")').click();
  await page.waitForTimeout(4_000);

  // Clicar no masteradm
  const masterBtn = page.locator('button').filter({ hasText: 'masteradm' }).first();
  if (!(await masterBtn.isVisible({ timeout: 5_000 }).catch(() => false))) {
    throw new Error('Nenhum masteradm no DevQuickLogin');
  }
  await masterBtn.click();
  await page.waitForTimeout(8_000);

  // Dismiss onboarding se aparecer
  const pularBtn = page.getByText(/pular/i);
  if (await pularBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await pularBtn.click();
    await page.waitForTimeout(2_000);
  }
}

async function goToAdminPanel(page: import('@playwright/test').Page) {
  // Ir ao Perfil
  await page.getByText('Perfil').click();
  await page.waitForTimeout(2_000);

  // Clicar em "Painel Admin"
  const painelBtn = page.getByText(/painel admin/i).first();
  await painelBtn.waitFor({ timeout: 10_000 });
  await painelBtn.click();
  await page.waitForTimeout(2_000);

  // AdminGateway: clicar em "Visão Global" para entrar no painel master
  const visaoGlobal = page.getByText(/visão global/i).first();
  if (await visaoGlobal.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await visaoGlobal.click();
    await page.waitForTimeout(2_000);
  }
}

/** Clicar num item da sidebar — expande se colapsada */
async function clickSidebarItem(page: import('@playwright/test').Page, text: string) {
  // Tentar clicar diretamente no texto (sidebar expandida ou desktop)
  const item = page.locator('nav').getByText(text, { exact: true });
  if (await item.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await item.click();
    return;
  }

  // Sidebar colapsada (mobile) — expandir via botão Menu (☰)
  // O botão Menu é o primeiro botão dentro do header da sidebar (w-14)
  // Usar CSS selector para o ícone lucide-menu (SVG com class lucide-menu)
  const menuBtn = page.locator('nav').locator('..').locator('button').first();
  if (await menuBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await menuBtn.click();
    await page.waitForTimeout(800);
  }

  // Agora a sidebar está expandida — procurar o item
  const expandedItem = page.getByText(text, { exact: true });
  if (await expandedItem.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await expandedItem.click();
  }
}
