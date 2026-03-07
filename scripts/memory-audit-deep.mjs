#!/usr/bin/env node
/**
 * memory-audit-deep — validação profunda de memórias vs código real.
 *
 * Para cada memória:
 *   1. Extrai referências a arquivos (como memory-audit básico)
 *   2. Extrai menções a funções, exports, componentes, interfaces, tipos
 *   3. Verifica no código real se existem e com assinatura compatível
 *   4. Reporta divergências concretas
 *
 * Uso: npm run memory-audit-deep
 * Rodar 1x no início de cada sessão de trabalho.
 */
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { execSync } from 'child_process';

const MEMORY_DIR = resolve(
  process.env.HOME,
  '.claude/projects/-Users-vanta-Documents-prevanta/memory',
);
const PROJECT_DIR = resolve(process.cwd());

// ── Cores ──
const R = '\x1b[31m';
const G = '\x1b[32m';
const Y = '\x1b[33m';
const C = '\x1b[36m';
const D = '\x1b[90m';
const B = '\x1b[1m';
const X = '\x1b[0m';

// ── Cache de arquivos do projeto ──
let _allFiles = null;
function getAllFiles(dir, base = '') {
  if (_allFiles) return _allFiles;
  const results = [];
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') continue;
      const rel = base ? `${base}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        results.push(...getAllFiles(join(dir, entry.name), rel));
      } else {
        results.push(rel);
      }
    }
  } catch { /* ignore */ }
  if (!base) _allFiles = results;
  return results;
}

function resolveRef(ref) {
  const candidates = [
    join(PROJECT_DIR, ref),
    join(PROJECT_DIR, 'src', ref),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  const fileName = ref.split('/').pop();
  const allFiles = getAllFiles(PROJECT_DIR);
  const matches = allFiles.filter(f => f.endsWith('/' + fileName) || f === fileName);
  if (matches.length > 0) return join(PROJECT_DIR, matches[0]);
  return null;
}

// ── Extrair referências a arquivos ──
const FILE_PATTERNS = [
  /`([a-zA-Z0-9_/.-]+\.(?:tsx?|jsx?|mjs|sql|json|md))`/g,
  /\|\s*`([a-zA-Z0-9_/.-]+\.(?:tsx?|jsx?|mjs|sql|json))`\s*\|/g,
];

function extractFileRefs(content) {
  const refs = new Set();
  for (const pattern of FILE_PATTERNS) {
    let match;
    const re = new RegExp(pattern.source, pattern.flags);
    while ((match = re.exec(content)) !== null) {
      const ref = match[1];
      if (ref.startsWith('*.') || ref.includes('*')) continue;
      if (!ref.includes('/') && !ref.includes('.ts') && !ref.includes('.tsx')) continue;
      refs.add(ref);
    }
  }
  return [...refs];
}

// ── Extrair menções a symbols (funções, componentes, exports, interfaces) ──
const SYMBOL_PATTERNS = [
  // `functionName()` ou `functionName(args)`
  /`([a-zA-Z_]\w+)\([^)]*\)`/g,
  // `export function X` / `export const X`
  /`export\s+(?:function|const|class|interface|type)\s+([a-zA-Z_]\w+)`/g,
  // `ComponentName` em contexto de componente (PascalCase, >= 3 chars)
  /`([A-Z][a-zA-Z]{2,}(?:View|Page|Modal|Card|Tab|Badge|Button|Chart|List|Form|Service|Store|Hook)?)`/g,
  // `useHookName` (hooks React)
  /`(use[A-Z]\w+)`/g,
  // `interface IName` / `type TName`
  /`(?:interface|type)\s+([A-Z]\w+)`/g,
  // Tabelas markdown: | `symbolName` | descrição |
  /\|\s*`([a-zA-Z_]\w+)`\s*\|/g,
];

// Palavras a ignorar (não são symbols do código)
const IGNORE_SYMBOLS = new Set([
  'TODO', 'FIXME', 'NOTE', 'HACK', 'XXX', 'MEMORY', 'CLAUDE',
  'IndexedDB', 'Supabase', 'React', 'Vite', 'TypeScript', 'Tailwind',
  'Zustand', 'Firebase', 'Stripe', 'PWA', 'iOS', 'Android',
  'JSON', 'HTML', 'CSS', 'SQL', 'API', 'URL', 'RPC', 'JWT', 'QR',
  'REGRA', 'ZERO', 'NUNCA', 'SEMPRE', 'ANTES', 'OK', 'NOVO',
  'TRUE', 'FALSE', 'NULL', 'PENDENTE', 'COMPLETO', 'BLOQUEADO',
  'View', 'Page', 'Modal', 'Card', 'Tab', 'Badge', 'Button',
  'CRIAR', 'EDITAR', 'DELETAR', 'ATUALIZAR',
  'String', 'Number', 'Boolean', 'Date', 'Error', 'Promise', 'Record',
  'Set', 'Map', 'Array', 'Object', 'Function',
]);

function extractSymbolRefs(content) {
  const symbols = new Map(); // name → { sources: Set, contexts: [] }

  for (const pattern of SYMBOL_PATTERNS) {
    let match;
    const re = new RegExp(pattern.source, pattern.flags);
    while ((match = re.exec(content)) !== null) {
      const name = match[1];
      // Filtrar
      if (name.length < 3) continue;
      if (IGNORE_SYMBOLS.has(name)) continue;
      if (/^[A-Z_]+$/.test(name)) continue; // ALL_CAPS = constantes/labels
      if (/^\d/.test(name)) continue;

      // Skip symbols mentioned as eliminated/removed/deleted
      const lineStart2 = content.lastIndexOf('\n', match.index) + 1;
      const lineEnd2 = content.indexOf('\n', match.index);
      const lineCtx = content.substring(lineStart2, lineEnd2 === -1 ? content.length : lineEnd2);
      if (/✅.*(eliminad|removid|deletad|migrad|substituíd)/i.test(lineCtx)) continue;

      if (!symbols.has(name)) {
        symbols.set(name, { count: 0, lineContext: '' });
      }
      const entry = symbols.get(name);
      entry.count++;
      // Capturar contexto da linha
      const lineStart = content.lastIndexOf('\n', match.index) + 1;
      const lineEnd = content.indexOf('\n', match.index);
      const line = content.substring(lineStart, lineEnd === -1 ? content.length : lineEnd).trim();
      if (!entry.lineContext) entry.lineContext = line;
    }
  }

  return symbols;
}

// ── Verificar se symbol existe no código ──
const CODE_DIRS = ['features', 'modules', 'services', 'components', 'hooks', 'stores', 'types', 'utils.ts', 'src']
  .filter(d => existsSync(join(PROJECT_DIR, d)));

function grepSymbol(name) {
  if (CODE_DIRS.length === 0) return [];
  try {
    const dirs = CODE_DIRS.join(' ');
    const result = execSync(
      `grep -rl --include="*.ts" --include="*.tsx" -w "${name}" ${dirs} 2>/dev/null | head -5`,
      { cwd: PROJECT_DIR, encoding: 'utf-8', timeout: 5000 },
    ).trim();
    return result ? result.split('\n').filter(Boolean) : [];
  } catch {
    return [];
  }
}

// ── Verificar assinatura de função/componente ──
function getSignature(name, filePath) {
  try {
    const result = execSync(
      `grep -n -A 1 "\\(export\\s\\+\\)\\?\\(function\\|const\\|class\\|interface\\|type\\)\\s\\+${name}\\b" "${filePath}" 2>/dev/null | head -6`,
      { cwd: PROJECT_DIR, encoding: 'utf-8', timeout: 3000 },
    ).trim();
    return result || null;
  } catch {
    return null;
  }
}

// ── Main ──
const startTime = Date.now();
const memoryFiles = readdirSync(MEMORY_DIR).filter(f => f.endsWith('.md')).sort();
const skipFiles = new Set(['MEMORY.md', 'sessao_atual.md', 'regras_usuario.md']);

let totalMemories = 0;
let totalSymbols = 0;
let totalFileRefs = 0;
let totalMissingFiles = 0;
let totalMissingSymbols = 0;
let totalEmpty = 0;
const allIssues = [];

console.log(`\n${B}══ MEMORY AUDIT DEEP ══${X}\n`);
console.log(`${D}Memórias: ${MEMORY_DIR}${X}`);
console.log(`${D}Projeto: ${PROJECT_DIR}${X}`);
console.log(`${D}Arquivos: ${memoryFiles.length}${X}\n`);

for (const file of memoryFiles) {
  if (skipFiles.has(file)) continue;
  totalMemories++;

  const filePath = join(MEMORY_DIR, file);
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').length;

  // Skip vazios
  if (lines <= 3 || content.trim().length < 50) {
    totalEmpty++;
    continue;
  }

  // Skip mapas de domínio (são índices, não referências diretas)
  if (file.startsWith('mapa_')) continue;

  const memoryIssues = [];

  // 1. Verificar arquivos referenciados
  const fileRefs = extractFileRefs(content);
  for (const ref of fileRefs) {
    totalFileRefs++;
    if (ref.startsWith('memory/') || ref.includes('migration')) continue;
    const resolved = resolveRef(ref);
    if (!resolved) {
      totalMissingFiles++;
      memoryIssues.push({
        type: 'FILE_MISSING',
        symbol: ref,
        detail: 'Arquivo não encontrado no projeto',
      });
    }
  }

  // 2. Verificar symbols
  const symbols = extractSymbolRefs(content);
  for (const [name, info] of symbols) {
    totalSymbols++;

    // Tentar achar no código
    const foundIn = grepSymbol(name);
    if (foundIn.length === 0) {
      totalMissingSymbols++;
      memoryIssues.push({
        type: 'SYMBOL_MISSING',
        symbol: name,
        detail: `Mencionado na memória mas não encontrado no código`,
        context: info.lineContext,
      });
    }
  }

  if (memoryIssues.length > 0) {
    allIssues.push({ file, issues: memoryIssues });
  }
}

// ── Report ──
const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

if (allIssues.length === 0) {
  console.log(`${G}${B}✓ Todas as ${totalMemories} memórias estão sincronizadas com o código${X}`);
  console.log(`${D}  ${totalFileRefs} arquivos + ${totalSymbols} symbols verificados${X}`);
  console.log(`${D}  Tempo: ${elapsed}s${X}\n`);
  process.exit(0);
}

// Separar por severidade
const critical = []; // symbols que sumiram
const warnings = []; // arquivos que sumiram

for (const { file, issues } of allIssues) {
  for (const issue of issues) {
    if (issue.type === 'SYMBOL_MISSING') {
      critical.push({ file, ...issue });
    } else {
      warnings.push({ file, ...issue });
    }
  }
}

if (critical.length > 0) {
  console.log(`${R}${B}✗ DIVERGÊNCIAS MEMÓRIA vs CÓDIGO (${critical.length}):${X}\n`);
  // Agrupar por memória
  const byFile = {};
  for (const item of critical) {
    if (!byFile[item.file]) byFile[item.file] = [];
    byFile[item.file].push(item);
  }
  for (const [file, items] of Object.entries(byFile)) {
    console.log(`  ${Y}${file}${X}`);
    for (const item of items) {
      console.log(`    ${R}✗${X} ${B}${item.symbol}${X} — ${item.detail}`);
      if (item.context) {
        console.log(`      ${D}contexto: ${item.context.substring(0, 100)}${X}`);
      }
    }
    console.log();
  }
}

if (warnings.length > 0) {
  console.log(`${Y}${B}⚠ Arquivos referenciados ausentes (${warnings.length}):${X}\n`);
  const byFile = {};
  for (const item of warnings) {
    if (!byFile[item.file]) byFile[item.file] = [];
    byFile[item.file].push(item);
  }
  for (const [file, items] of Object.entries(byFile)) {
    console.log(`  ${Y}${file}${X}`);
    for (const item of items) {
      console.log(`    ${Y}⚠${X} ${D}${item.symbol}${X}`);
    }
  }
  console.log();
}

if (totalEmpty > 0) {
  console.log(`${D}ℹ ${totalEmpty} memória(s) vazias/esqueleto (preencher conforme trabalhar no módulo)${X}\n`);
}

console.log(`${B}Resumo:${X} ${totalMemories} memórias | ${totalFileRefs} arquivos + ${totalSymbols} symbols verificados`);
console.log(`  ${critical.length > 0 ? R : G}${critical.length} divergências${X} | ${warnings.length > 0 ? Y : G}${warnings.length} arquivos ausentes${X} | ${totalEmpty > 0 ? Y : G}${totalEmpty} vazias${X}`);
console.log(`${D}Tempo: ${elapsed}s${X}\n`);

if (critical.length > 0) {
  console.log(`${R}${B}⚠ AÇÃO NECESSÁRIA:${X} Revisar divergências acima com o usuário antes de codificar.`);
  console.log(`${D}  Divergência = memória desatualizada OU código mudou. Usuário decide qual é o correto.${X}\n`);
}

process.exit(critical.length > 0 ? 1 : 0);
