#!/usr/bin/env node
/**
 * deps.mjs — Grafo de dependências de um arquivo.
 *
 * Uso:
 *   npm run deps -- App.tsx                    # busca por nome
 *   npm run deps -- modules/home/HomeView.tsx  # caminho relativo
 *   npm run deps -- HomeView                   # busca fuzzy por componente
 *
 * Output:
 *   IMPORTS  → arquivos que este arquivo importa (internos)
 *   USED BY  → arquivos que importam este arquivo
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, dirname, basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[90m';
const BOLD = '\x1b[1m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

const query = process.argv[2];
if (!query) {
  console.error('Uso: npm run deps -- <arquivo-ou-nome>');
  console.error('  Ex: npm run deps -- App.tsx');
  console.error('  Ex: npm run deps -- HomeView');
  process.exit(1);
}

// ── Coletar todos os arquivos TS/TSX ────────────────────────────────────────
function walkDir(dir) {
  const results = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return results; }
  for (const entry of entries) {
    if (['node_modules', 'dist', '.git', 'PREVANTABACKUP'].includes(entry)) continue;
    const full = join(dir, entry);
    let stat;
    try { stat = statSync(full); } catch { continue; }
    if (stat.isDirectory()) {
      results.push(...walkDir(full));
    } else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith('.d.ts')) {
      results.push(full);
    }
  }
  return results;
}

const allFiles = walkDir(ROOT);
const allRels = allFiles.map(f => relative(ROOT, f));

// ── Resolver o arquivo alvo ─────────────────────────────────────────────────
let targetRel;

// Tenta caminho exato
if (allRels.includes(query)) {
  targetRel = query;
} else {
  // Tenta match pelo final do path
  const matches = allRels.filter(r => r.endsWith(query) || r.endsWith(query + '.ts') || r.endsWith(query + '.tsx'));
  if (matches.length === 1) {
    targetRel = matches[0];
  } else if (matches.length > 1) {
    console.log(`\nMúltiplos matches para "${query}":`);
    for (const m of matches) console.log(`  ${m}`);
    console.log('\nEspecifique o caminho completo.');
    process.exit(1);
  } else {
    // Fuzzy: busca por nome do componente no nome do arquivo
    const fuzzy = allRels.filter(r => {
      const base = basename(r, '.tsx').replace('.ts', '');
      return base.toLowerCase() === query.toLowerCase();
    });
    if (fuzzy.length === 1) {
      targetRel = fuzzy[0];
    } else if (fuzzy.length > 1) {
      console.log(`\nMúltiplos matches para "${query}":`);
      for (const m of fuzzy) console.log(`  ${m}`);
      process.exit(1);
    } else {
      console.error(`Arquivo não encontrado: ${query}`);
      process.exit(1);
    }
  }
}

const targetFull = join(ROOT, targetRel);

// ── Extrair imports internos de um arquivo ──────────────────────────────────
function getInternalImports(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const imports = [];
  const regex = /^import\s+.*from\s+['"](\.\.?\/.+?)['"]/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const importPath = match[1];
    const fileDir = dirname(filePath);
    let resolved = resolve(fileDir, importPath);

    // Resolver extensão
    for (const ext of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
      const candidate = resolved + ext;
      try {
        if (statSync(candidate).isFile()) {
          resolved = candidate;
          break;
        }
      } catch { /* next */ }
    }

    imports.push(relative(ROOT, resolved));
  }
  return imports;
}

// ── 1. O que este arquivo importa ───────────────────────────────────────────
const myImports = getInternalImports(targetFull);

// ── 2. Quem importa este arquivo ────────────────────────────────────────────
const usedBy = [];
const targetBase = targetRel.replace(/\.(ts|tsx)$/, '');
const targetBaseName = basename(targetRel, '.tsx').replace('.ts', '');

for (const file of allFiles) {
  if (relative(ROOT, file) === targetRel) continue;
  const content = readFileSync(file, 'utf-8');
  const regex = /^import\s+.*from\s+['"](\.\.?\/.+?)['"]/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const importPath = match[1];
    const fileDir = dirname(file);
    let resolved = resolve(fileDir, importPath);
    const resolvedRel = relative(ROOT, resolved);

    // Check se resolve pro nosso target
    if (
      resolvedRel === targetRel ||
      resolvedRel === targetBase ||
      resolvedRel + '.ts' === targetRel ||
      resolvedRel + '.tsx' === targetRel ||
      resolvedRel + '/index.ts' === targetRel ||
      resolvedRel + '/index.tsx' === targetRel
    ) {
      usedBy.push(relative(ROOT, file));
      break; // 1 match por arquivo basta
    }
  }
}

// ── Output ──────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}📦 ${targetRel}${RESET}\n`);

console.log(`${CYAN}IMPORTS (${myImports.length}):${RESET}`);
if (myImports.length === 0) {
  console.log(`  ${DIM}(nenhum import interno)${RESET}`);
} else {
  // Agrupar por tipo
  const stores = myImports.filter(i => i.includes('stores/'));
  const hooks = myImports.filter(i => i.includes('hooks/'));
  const services = myImports.filter(i => i.includes('services/') || i.includes('Service'));
  const components = myImports.filter(i => i.includes('components/') || i.includes('modules/'));
  const other = myImports.filter(i => !stores.includes(i) && !hooks.includes(i) && !services.includes(i) && !components.includes(i));

  if (stores.length) { console.log(`  ${YELLOW}stores:${RESET}`); stores.forEach(i => console.log(`    ${i}`)); }
  if (hooks.length) { console.log(`  ${YELLOW}hooks:${RESET}`); hooks.forEach(i => console.log(`    ${i}`)); }
  if (services.length) { console.log(`  ${YELLOW}services:${RESET}`); services.forEach(i => console.log(`    ${i}`)); }
  if (components.length) { console.log(`  ${YELLOW}components:${RESET}`); components.forEach(i => console.log(`    ${i}`)); }
  if (other.length) { console.log(`  ${YELLOW}other:${RESET}`); other.forEach(i => console.log(`    ${i}`)); }
}

console.log(`\n${GREEN}USED BY (${usedBy.length}):${RESET}`);
if (usedBy.length === 0) {
  console.log(`  ${DIM}(ninguém importa este arquivo)${RESET}`);
} else {
  usedBy.sort();
  for (const f of usedBy) {
    console.log(`  ${f}`);
  }
}

console.log('');
