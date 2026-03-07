#!/usr/bin/env node
/**
 * diff-check.mjs — Valida APENAS arquivos alterados (staged + unstaged).
 *
 * Uso:
 *   npm run diff-check          # arquivos alterados vs HEAD
 *   npm run diff-check -- staged # apenas staged
 *   npm run diff-check -- main   # diff contra branch main
 *
 * Roda: TSC (projeto inteiro — necessário), ESLint (só alterados), lint:layout (só alterados).
 * ~5-10x mais rápido que preflight em mudanças pontuais.
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[90m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

const arg = process.argv[2];

// ── Coletar arquivos alterados ──────────────────────────────────────────────
let diffCmd;
if (arg === 'staged') {
  diffCmd = 'git diff --cached --name-only --diff-filter=ACMR';
} else if (arg && arg !== 'staged') {
  diffCmd = `git diff ${arg}...HEAD --name-only --diff-filter=ACMR`;
} else {
  // staged + unstaged
  diffCmd = 'git diff --name-only --diff-filter=ACMR HEAD';
}

let allChanged;
try {
  allChanged = execSync(diffCmd, { cwd: ROOT, encoding: 'utf-8' })
    .trim()
    .split('\n')
    .filter(Boolean);
} catch {
  // fallback: unstaged only
  allChanged = execSync('git diff --name-only --diff-filter=ACMR', { cwd: ROOT, encoding: 'utf-8' })
    .trim()
    .split('\n')
    .filter(Boolean);
}

const tsFiles = allChanged
  .filter(f => /\.(ts|tsx)$/.test(f) && !f.includes('node_modules'))
  .filter(f => existsSync(join(ROOT, f)));

if (tsFiles.length === 0) {
  console.log(`\n${GREEN}${BOLD}✓ Nenhum arquivo .ts/.tsx alterado.${RESET}\n`);
  process.exit(0);
}

console.log(`\n${BOLD}⚡ diff-check${RESET} — ${tsFiles.length} arquivo(s) alterado(s)\n`);
for (const f of tsFiles) {
  console.log(`  ${DIM}${f}${RESET}`);
}
console.log('');

const startTime = Date.now();
let hasError = false;

// ── 1. TSC (projeto inteiro — type-check é global) ─────────────────────────
function run(label, cmd) {
  const t0 = Date.now();
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'pipe', timeout: 120_000 });
    const ms = Date.now() - t0;
    console.log(`  ${GREEN}✓${RESET} ${label} ${DIM}(${ms}ms)${RESET}`);
    return true;
  } catch (e) {
    const ms = Date.now() - t0;
    console.log(`  ${RED}✗${RESET} ${label} ${DIM}(${ms}ms)${RESET}`);
    const out = (e.stdout?.toString() || '') + (e.stderr?.toString() || '');
    if (out.trim()) {
      const lines = out.trim().split('\n').slice(0, 15);
      for (const l of lines) console.log(`    ${DIM}${l}${RESET}`);
      if (out.trim().split('\n').length > 15) console.log(`    ${DIM}... (truncado)${RESET}`);
    }
    return false;
  }
}

if (!run('TypeScript', 'NODE_OPTIONS="--max-old-space-size=4096" npx tsc --noEmit')) hasError = true;

// ── 2. ESLint (só arquivos alterados) ───────────────────────────────────────
const eslintFiles = tsFiles.filter(f => !f.startsWith('scripts/') && !f.endsWith('.d.ts'));
if (eslintFiles.length > 0) {
  const fileList = eslintFiles.map(f => `"${f}"`).join(' ');
  if (!run('ESLint', `npx eslint ${fileList} --quiet`)) hasError = true;
} else {
  console.log(`  ${DIM}– ESLint (nenhum arquivo elegível)${RESET}`);
}

// ── 3. lint:layout (só arquivos alterados com className) ────────────────────
const layoutFiles = tsFiles.filter(f => f.endsWith('.tsx'));
if (layoutFiles.length > 0) {
  if (!run('lint:layout', 'node scripts/lint-layout.mjs')) hasError = true;
} else {
  console.log(`  ${DIM}– lint:layout (nenhum .tsx alterado)${RESET}`);
}

// ── 4. memory-audit (informativo, não bloqueia) ──────────────────────────────
try {
  const { execSync } = await import('child_process');
  const out = execSync('node scripts/memory-audit.mjs 2>&1', { encoding: 'utf-8', timeout: 10000 });
  const missingMatch = out.match(/(\d+) ausentes/);
  const missingCount = missingMatch ? parseInt(missingMatch[1]) : 0;
  if (missingCount > 0) {
    console.log(`  \x1b[33m⚠\x1b[0m memory-audit: ${missingCount} ref(s) desatualizadas — rodar \x1b[1mnpm run memory-audit\x1b[0m para detalhes`);
  } else {
    console.log(`  ${GREEN}✓${RESET} memory-audit ${DIM}(memórias OK)${RESET}`);
  }
} catch { /* silencioso se falhar */ }

// ── Resumo ──────────────────────────────────────────────────────────────────
const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
console.log('');
if (hasError) {
  console.log(`${RED}${BOLD}✗ diff-check FALHOU${RESET} ${DIM}(${elapsed}s)${RESET}\n`);
  process.exit(1);
} else {
  console.log(`${GREEN}${BOLD}✓ diff-check OK${RESET} ${DIM}(${elapsed}s)${RESET}\n`);
  process.exit(0);
}
