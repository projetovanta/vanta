#!/usr/bin/env node
/**
 * props.mjs — Extrai props de um componente React.
 *
 * Uso:
 *   npm run props -- HomeView         # busca pelo nome
 *   npm run props -- WalletView       # qualquer componente
 *   npm run props -- all              # lista TODOS os componentes + suas props
 *
 * Output: nome do componente, arquivo, interface de props com tipos.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
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
  console.error('Uso: npm run props -- <ComponentName>');
  console.error('  Ex: npm run props -- HomeView');
  console.error('  Ex: npm run props -- all');
  process.exit(1);
}

const showAll = query === 'all';

// ── Coletar arquivos ────────────────────────────────────────────────────────
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
    } else if (entry.endsWith('.tsx')) {
      results.push(full);
    }
  }
  return results;
}

const allFiles = walkDir(ROOT);

// ── Extrair props de um arquivo ─────────────────────────────────────────────
function extractProps(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const results = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Pattern 1: interface XxxProps { ... }
    const interfaceMatch = line.match(/^(?:export\s+)?interface\s+(\w+(?:Props|ViewProps))\s*\{/);
    if (interfaceMatch) {
      const name = interfaceMatch[1];
      const fields = [];
      for (let j = i + 1; j < lines.length && j < i + 50; j++) {
        if (/^\}/.test(lines[j])) break;
        const fieldMatch = lines[j].match(/^\s+(\w+)(\??):\s*(.+?);?\s*$/);
        if (fieldMatch) {
          fields.push({
            name: fieldMatch[1],
            optional: fieldMatch[2] === '?',
            type: fieldMatch[3].replace(/;$/, '').trim(),
          });
        }
      }
      results.push({ interfaceName: name, fields, line: i + 1 });
      continue;
    }

    // Pattern 2: React.FC<{ prop: type; ... }> inline
    const inlineMatch = line.match(/(?:export\s+)?const\s+(\w+).*React\.FC<\{/);
    if (inlineMatch) {
      const compName = inlineMatch[1];
      const fields = [];
      // Scan multiline inline props
      for (let j = i; j < lines.length && j < i + 40; j++) {
        const fieldMatch = lines[j].match(/^\s+(\w+)(\??):\s*(.+?);?\s*$/);
        if (fieldMatch) {
          fields.push({
            name: fieldMatch[1],
            optional: fieldMatch[2] === '?',
            type: fieldMatch[3].replace(/;$/, '').trim(),
          });
        }
        if (/}>\s*=/.test(lines[j]) && j > i) break;
      }
      if (fields.length > 0) {
        results.push({ interfaceName: `${compName} (inline)`, fields, line: i + 1 });
      }
    }
  }

  return results;
}

// ── Encontrar componente(s) ─────────────────────────────────────────────────
const found = [];

for (const file of allFiles) {
  const rel = relative(ROOT, file);
  const content = readFileSync(file, 'utf-8');

  if (showAll) {
    const props = extractProps(file);
    if (props.length > 0) {
      for (const p of props) {
        found.push({ file: rel, ...p });
      }
    }
  } else {
    // Checar se o componente está neste arquivo
    if (content.includes(query)) {
      const props = extractProps(file);
      if (props.length > 0) {
        for (const p of props) {
          // Match exato no nome ou interface contém o query
          if (p.interfaceName.includes(query) || rel.includes(query)) {
            found.push({ file: rel, ...p });
          }
        }
      }
    }
  }
}

if (found.length === 0) {
  console.error(`Nenhum componente com props encontrado para: ${query}`);
  process.exit(1);
}

// ── Output ──────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}🧩 Props${RESET}${showAll ? ` (${found.length} componentes)` : ''}\n`);

for (const entry of found) {
  console.log(`${CYAN}${BOLD}${entry.interfaceName}${RESET} ${DIM}${entry.file}:${entry.line}${RESET}`);

  if (entry.fields.length === 0) {
    console.log(`  ${DIM}(sem props)${RESET}`);
  } else {
    const required = entry.fields.filter(f => !f.optional);
    const optional = entry.fields.filter(f => f.optional);

    if (required.length > 0) {
      for (const f of required) {
        console.log(`  ${GREEN}${f.name}${RESET}: ${f.type}`);
      }
    }
    if (optional.length > 0) {
      for (const f of optional) {
        console.log(`  ${YELLOW}${f.name}?${RESET}: ${DIM}${f.type}${RESET}`);
      }
    }
  }
  console.log('');
}
