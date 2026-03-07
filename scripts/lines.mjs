#!/usr/bin/env node
/**
 * lines.mjs — Contagem de linhas por módulo/diretório.
 *
 * Uso:
 *   npm run lines                  # todos os módulos
 *   npm run lines -- modules/home  # diretório específico
 *   npm run lines -- top20         # top 20 maiores arquivos
 *
 * Output: tabela ordenada por tamanho (maior primeiro).
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const DIM = '\x1b[90m';
const BOLD = '\x1b[1m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

const arg = process.argv[2];
const showTop20 = arg === 'top20';

// ── Coletar arquivos ────────────────────────────────────────────────────────
function walkDir(dir) {
  const results = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return results; }
  for (const entry of entries) {
    if (['node_modules', 'dist', '.git', 'PREVANTABACKUP', 'scripts'].includes(entry)) continue;
    const full = join(dir, entry);
    let stat;
    try { stat = statSync(full); } catch { continue; }
    if (stat.isDirectory()) {
      results.push(...walkDir(full));
    } else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith('.d.ts')) {
      const content = readFileSync(full, 'utf-8');
      const lineCount = content.split('\n').length;
      results.push({ path: relative(ROOT, full), lines: lineCount });
    }
  }
  return results;
}

const scanDir = (arg && !showTop20) ? join(ROOT, arg) : ROOT;
const allFiles = walkDir(scanDir);

if (allFiles.length === 0) {
  console.error(`Nenhum arquivo .ts/.tsx em: ${arg || '.'}`);
  process.exit(1);
}

// ── Top 20 maiores arquivos ─────────────────────────────────────────────────
if (showTop20) {
  allFiles.sort((a, b) => b.lines - a.lines);
  const top = allFiles.slice(0, 20);
  const total = allFiles.reduce((a, f) => a + f.lines, 0);

  console.log(`\n${BOLD}📊 Top 20 Maiores Arquivos${RESET}\n`);
  for (let i = 0; i < top.length; i++) {
    const f = top[i];
    const color = f.lines > 500 ? RED : f.lines > 200 ? YELLOW : DIM;
    const rank = String(i + 1).padStart(2);
    console.log(`  ${DIM}${rank}.${RESET} ${color}${String(f.lines).padStart(5)}${RESET} ${f.path}`);
  }
  console.log(`\n  ${DIM}Total: ${allFiles.length} arquivos, ${total.toLocaleString()} linhas${RESET}\n`);
  process.exit(0);
}

// ── Agrupar por diretório (1 nível) ────────────────────────────────────────
const groups = new Map();

for (const f of allFiles) {
  const parts = f.path.split('/');
  let group;
  if (parts.length === 1) {
    group = '(raiz)';
  } else if (['modules', 'features', 'components'].includes(parts[0]) && parts.length >= 2) {
    group = `${parts[0]}/${parts[1]}`;
  } else {
    group = parts[0];
  }

  if (!groups.has(group)) groups.set(group, { files: 0, lines: 0 });
  const g = groups.get(group);
  g.files++;
  g.lines += f.lines;
}

// Ordenar por linhas desc
const sorted = [...groups.entries()].sort((a, b) => b[1].lines - a[1].lines);
const totalLines = allFiles.reduce((a, f) => a + f.lines, 0);
const totalFiles = allFiles.length;

console.log(`\n${BOLD}📊 Linhas por Módulo${RESET}${arg ? ` (${arg})` : ''}\n`);
console.log(`  ${DIM}${'MÓDULO'.padEnd(40)} ARQUIVOS    LINHAS${RESET}`);
console.log(`  ${DIM}${'─'.repeat(60)}${RESET}`);

for (const [name, data] of sorted) {
  const color = data.lines > 2000 ? RED : data.lines > 1000 ? YELLOW : CYAN;
  const pct = ((data.lines / totalLines) * 100).toFixed(1);
  console.log(`  ${name.padEnd(40)} ${String(data.files).padStart(5)}    ${color}${String(data.lines).padStart(6)}${RESET} ${DIM}(${pct}%)${RESET}`);
}

console.log(`  ${DIM}${'─'.repeat(60)}${RESET}`);
console.log(`  ${'TOTAL'.padEnd(40)} ${String(totalFiles).padStart(5)}    ${BOLD}${String(totalLines).padStart(6)}${RESET}\n`);
