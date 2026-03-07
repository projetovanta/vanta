#!/usr/bin/env node
/**
 * store-map.mjs — Mapa de stores Zustand → consumidores.
 *
 * Uso:
 *   npm run store-map              # todas as stores
 *   npm run store-map -- auth      # filtra por nome da store
 *
 * Output: para cada store, lista os arquivos que a importam
 *         e quais selectors/ações usam.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const STORES_DIR = join(ROOT, 'stores');

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[90m';
const BOLD = '\x1b[1m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

const filter = process.argv[2]?.toLowerCase();

// ── Descobrir stores ────────────────────────────────────────────────────────
let storeFiles;
try {
  storeFiles = readdirSync(STORES_DIR)
    .filter(f => f.endsWith('.ts'))
    .map(f => ({
      file: f,
      name: f.replace('.ts', ''),
      // Extrair nome do hook (ex: useAuthStore)
      hookName: '',
      stateKeys: [],
    }));
} catch {
  console.error('Diretório stores/ não encontrado');
  process.exit(1);
}

// Extrair hookName e stateKeys de cada store
for (const store of storeFiles) {
  const content = readFileSync(join(STORES_DIR, store.file), 'utf-8');

  // hookName: export const useAuthStore = create<...>
  const hookMatch = content.match(/export const (\w+)\s*=\s*create/);
  if (hookMatch) store.hookName = hookMatch[1];

  // stateKeys: chaves da interface (linhas com "nome: tipo")
  const interfaceMatch = content.match(/interface \w+State\s*\{([\s\S]*?)\n\}/);
  if (interfaceMatch) {
    const body = interfaceMatch[1];
    const keys = body.match(/^\s+(\w+)\s*[?:]?\s*:/gm);
    if (keys) {
      store.stateKeys = keys.map(k => k.trim().replace(/[?:].*/, '').trim());
    }
  }
}

// Filtrar se pediu
if (filter) {
  storeFiles = storeFiles.filter(s => s.name.includes(filter) || s.hookName.toLowerCase().includes(filter));
}

if (storeFiles.length === 0) {
  console.error(`Nenhuma store encontrada${filter ? ` para "${filter}"` : ''}`);
  process.exit(1);
}

// ── Coletar todos os arquivos do projeto ────────────────────────────────────
function walkDir(dir) {
  const results = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return results; }
  for (const entry of entries) {
    if (['node_modules', 'dist', '.git', 'PREVANTABACKUP', 'stores'].includes(entry)) continue;
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

// ── Scan consumers ──────────────────────────────────────────────────────────
console.log(`\n${BOLD}🏪 Store Map${RESET}${filter ? ` (filtro: ${filter})` : ''}\n`);

for (const store of storeFiles) {
  if (!store.hookName) continue;

  const consumers = [];

  for (const file of allFiles) {
    const content = readFileSync(file, 'utf-8');
    if (!content.includes(store.hookName)) continue;

    const rel = relative(ROOT, file);
    const selectors = [];

    // Pattern 1: useStore(s => s.key)
    const selectorRegex = new RegExp(`${store.hookName}\\(s\\s*=>\\s*s\\.([\\w.]+)`, 'g');
    let match;
    while ((match = selectorRegex.exec(content)) !== null) {
      const key = match[1].split('.')[0]; // pega primeira chave
      if (!selectors.includes(key)) selectors.push(key);
    }

    // Pattern 2: useStore.getState().key
    const getStateRegex = new RegExp(`${store.hookName}\\.getState\\(\\)\\.([\\w]+)`, 'g');
    while ((match = getStateRegex.exec(content)) !== null) {
      const key = match[1];
      if (!selectors.includes(key)) selectors.push(key);
    }

    // Pattern 3: useStore.setState
    if (new RegExp(`${store.hookName}\\.setState`).test(content)) {
      if (!selectors.includes('setState')) selectors.push('setState');
    }

    consumers.push({ file: rel, selectors });
  }

  // Output
  console.log(`${CYAN}${BOLD}${store.hookName}${RESET} ${DIM}(${store.file})${RESET}`);
  console.log(`  ${DIM}State: ${store.stateKeys.join(', ')}${RESET}`);
  console.log(`  ${GREEN}Consumers (${consumers.length}):${RESET}`);

  if (consumers.length === 0) {
    console.log(`    ${DIM}(nenhum consumidor)${RESET}`);
  } else {
    // Agrupar por diretório
    consumers.sort((a, b) => a.file.localeCompare(b.file));
    for (const c of consumers) {
      const selStr = c.selectors.length > 0 ? ` ${YELLOW}→ ${c.selectors.join(', ')}${RESET}` : '';
      console.log(`    ${c.file}${selStr}`);
    }
  }
  console.log('');
}
