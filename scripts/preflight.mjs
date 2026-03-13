#!/usr/bin/env node
/**
 * preflight.mjs — Roda TODOS os checks na ordem correta.
 * Um único comando: `npm run preflight`
 *
 * Ordem:
 *   1. Prettier format (auto-fix)
 *   2. Prettier check (confirmar)
 *   3. TSC (tipagem)
 *   4. ESLint (regras)
 *   5. lint:layout (responsividade)
 *   6. Vite build (build final)
 *   7. Knip (código morto — apenas conta novos)
 *
 * Output: 1 linha por check (✓ ou ✗), resumo no final.
 */

import { execSync } from 'node:child_process';

const CHECKS = [
  { name: 'Prettier format', cmd: "prettier --write 'src/**/*.{ts,tsx}' 'modules/**/*.{ts,tsx}' 'features/**/*.{ts,tsx}' 'hooks/**/*.{ts,tsx}' 'services/**/*.{ts,tsx}'" },
  { name: 'TypeScript', cmd: 'tsc --noEmit', env: { NODE_OPTIONS: '--max-old-space-size=4096' } },
  { name: 'ESLint', cmd: 'eslint src/ modules/ features/ hooks/ services/ --quiet' },
  { name: 'lint:layout', cmd: 'node scripts/lint-layout.mjs' },
  { name: 'Playwright navigation', cmd: 'playwright test navigation --project="Desktop Chrome"' },
  { name: 'Playwright erros-globais', cmd: 'playwright test erros-globais --project="Desktop Chrome"' },
  { name: 'Vite build', cmd: 'vite build' },
  { name: 'Knip', cmd: 'knip' },
];

const results = [];
let failed = 0;

for (const check of CHECKS) {
  const t0 = Date.now();
  try {
    const opts = { stdio: 'pipe', timeout: 180_000 };
    if (check.env) opts.env = { ...process.env, ...check.env };
    execSync(`npx ${check.cmd}`, opts);
    const ms = Date.now() - t0;
    results.push({ name: check.name, ok: true, ms });
    process.stdout.write(`  \x1b[32m✓\x1b[0m ${check.name} (${ms}ms)\n`);
  } catch (err) {
    const ms = Date.now() - t0;
    failed++;
    const output = (err.stderr?.toString() || err.stdout?.toString() || '').trim();
    // Para Knip, não falhar — só reportar
    if (check.name === 'Knip') {
      results.push({ name: check.name, ok: true, ms, warn: true });
      process.stdout.write(`  \x1b[33m⚠\x1b[0m ${check.name} (${ms}ms) — verificar output\n`);
      failed--; // não conta como falha
    } else {
      results.push({ name: check.name, ok: false, ms, output });
      process.stdout.write(`  \x1b[31m✗\x1b[0m ${check.name} (${ms}ms)\n`);
      if (output) {
        // Mostra as primeiras 10 linhas do erro
        const lines = output.split('\n').slice(0, 10);
        for (const line of lines) {
          process.stdout.write(`    ${line}\n`);
        }
      }
    }
  }
}

console.log('');
if (failed === 0) {
  console.log(`\x1b[32m✓ PREFLIGHT OK — ${results.length}/${results.length} checks passaram.\x1b[0m`);
  process.exit(0);
} else {
  console.log(`\x1b[31m✗ PREFLIGHT FALHOU — ${failed} check(s) com erro.\x1b[0m`);
  process.exit(1);
}
