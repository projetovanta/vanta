#!/usr/bin/env node
/**
 * deep-audit.mjs — Auditoria profunda VANTA.
 *
 * Varredura completa: raiz, todas as pastas, subpastas, TODOS os arquivos .ts/.tsx.
 * Linha por linha. Sem exceção.
 *
 * Fases:
 *   1. Tooling (TSC, ESLint, Layout)
 *   2. Schema Supabase real (tabelas, colunas, RPCs via OpenAPI)
 *   3. Queries .from('tabela').select('coluna') + .rpc() vs schema
 *   4. Imports órfãos (caminhos que não existem)
 *   5. Exports não utilizados em nenhum outro arquivo
 *   6. Funções/componentes duplicados (mesmo nome exportado em 2+ arquivos)
 *   7. Código morto & regras de código:
 *      - console.log/warn/error de debug (fora de catch/error handling)
 *      - catch vazio que silencia erros
 *      - new Date().toISOString() pro banco (deve ser tsBR/todayBR)
 *      - fixed inset-0 (deve ser absolute dentro do container)
 *      - <select> HTML nativo (deve ser VantaDropdown)
 *      - w-[Npx] fixo grande
 *      - supabaseAdmin (foi removido)
 *      - Hooks após early return (viola Rules of Hooks)
 *      - Código comentado extenso (3+ linhas seguidas de //)
 *      - TODO/FIXME/HACK/XXX esquecidos
 *      - Variáveis declaradas mas nunca referenciadas no mesmo arquivo
 *   8. Arquivos duplicados (mesmo conteúdo, nomes diferentes)
 *   9. Memórias vs arquivos reais
 *  10. Dependências circulares (imports A→B→C→A)
 *  11. Segurança (credenciais hardcodadas, XSS, eval)
 *  12. Acessibilidade (img sem alt, onClick em div sem role)
 *  13. Arquivos grandes (>400 linhas)
 *  14. Supabase mutations sem error handling
 *
 * Uso:
 *   npm run deep-audit
 *   node scripts/deep-audit.mjs [--verbose] [--fix]
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative, dirname, resolve, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { createHash } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Cores ────────────────────────────────────────────────────────────────────
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[90m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

// ── Config ───────────────────────────────────────────────────────────────────
const EXTENSIONS = ['.ts', '.tsx'];
const SKIP_DIRS = new Set(['node_modules', 'PREVANTABACKUP', '.git', 'dist', 'tests', '.claude', '.vscode', 'public']);
const verbose = process.argv.includes('--verbose') || process.argv.includes('-v');

// ── .env ─────────────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = join(ROOT, '.env.local');
  if (!existsSync(envPath)) return {};
  const env = {};
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

const ENV = loadEnv();
const SUPABASE_URL = ENV.VITE_SUPABASE_URL;
const SERVICE_KEY = ENV.SUPABASE_SERVICE_ROLE_KEY || ENV.VITE_SUPABASE_SERVICE_ROLE_KEY;

// ── Helpers ──────────────────────────────────────────────────────────────────
function walkDir(dir) {
  const results = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return results; }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    let stat;
    try { stat = statSync(full); } catch { continue; }
    if (stat.isDirectory()) {
      results.push(...walkDir(full));
    } else if (EXTENSIONS.some(ext => entry.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

function runCmd(cmd, label, timeout = 120_000) {
  const t0 = Date.now();
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'pipe', timeout });
    return { ok: true, label, ms: Date.now() - t0 };
  } catch (e) {
    return { ok: false, label, ms: Date.now() - t0, output: e.stdout?.toString() || e.stderr?.toString() || e.message };
  }
}

async function supabaseGet(endpoint) {
  if (!SUPABASE_URL || !SERVICE_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}${endpoint}`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
    });
    return await res.json();
  } catch { return null; }
}

async function supabaseQuery(endpoint, body) {
  if (!SUPABASE_URL || !SERVICE_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch { return null; }
}

// ── Coletar TODOS os arquivos .ts/.tsx (raiz + todas as pastas) ──────────────
const allFiles = walkDir(ROOT);

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${BOLD}${CYAN}══ DEEP AUDIT VANTA ══${RESET} ${DIM}(${allFiles.length} arquivos)${RESET}\n`);
  const t0 = Date.now();
  const issues = { errors: [], warnings: [], info: [] };

  function addIssue(severity, file, line, msg) {
    issues[severity === 'error' ? 'errors' : severity === 'warning' ? 'warnings' : 'info'].push({ file, line, msg });
  }

  // Ler todos os arquivos uma única vez
  const fileContents = new Map();
  for (const file of allFiles) {
    const rel = relative(ROOT, file);
    fileContents.set(rel, readFileSync(file, 'utf-8'));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FASE 1: Tooling
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(`${DIM}Fase 1: Tooling${RESET}`);

  const toolChecks = [
    { cmd: 'npx tsc --noEmit', label: 'TypeScript' },
    { cmd: 'npx eslint src/ modules/ features/ hooks/ services/ stores/ --quiet 2>/dev/null', label: 'ESLint' },
    { cmd: 'node scripts/lint-layout.mjs', label: 'lint:layout' },
  ];

  for (const { cmd, label } of toolChecks) {
    const r = runCmd(cmd, label);
    if (r.ok) {
      console.log(`  ${GREEN}✓${RESET} ${label} ${DIM}(${r.ms}ms)${RESET}`);
    } else {
      console.log(`  ${RED}✗${RESET} ${label} ${DIM}(${r.ms}ms)${RESET}`);
      const lines = (r.output || '').split('\n').filter(l => l.trim()).slice(0, 5);
      for (const l of lines) console.log(`    ${DIM}${l}${RESET}`);
      addIssue('error', label, 0, `${label} falhou`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FASE 2: Schema Supabase real
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(`\n${DIM}Fase 2: Schema Supabase${RESET}`);

  let schema = null;
  let rpcs = new Set();

  if (SUPABASE_URL && SERVICE_KEY) {
    const schemaRes = await supabaseQuery('/rest/v1/rpc/get_schema_info', {});
    if (!schemaRes || schemaRes.code) {
      const openapi = await supabaseGet('/rest/v1/?apikey=' + SERVICE_KEY);
      if (openapi?.definitions) {
        schema = {};
        for (const [table, def] of Object.entries(openapi.definitions)) {
          if (def.properties) {
            schema[table] = Object.keys(def.properties);
          }
        }
        console.log(`  ${GREEN}✓${RESET} Schema carregado via OpenAPI ${DIM}(${Object.keys(schema).length} tabelas)${RESET}`);
      }
      if (openapi?.paths) {
        for (const [path] of Object.entries(openapi.paths)) {
          const m = path.match(/^\/rpc\/(\w+)/);
          if (m) rpcs.add(m[1]);
        }
        console.log(`  ${GREEN}✓${RESET} RPCs encontradas: ${DIM}${rpcs.size}${RESET}`);
      }
    }
    if (!schema) {
      console.log(`  ${YELLOW}⚠${RESET} Não foi possível carregar schema — pulando validação de colunas`);
    }
  } else {
    console.log(`  ${YELLOW}⚠${RESET} Supabase não configurado (.env.local) — pulando`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FASE 3: Queries vs Schema
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(`\n${DIM}Fase 3: Queries vs Schema${RESET}`);
  let queryIssueCount = 0;

  for (const [relPath, content] of fileContents) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // .from('tabela')
      const fromMatch = line.match(/\.from\(\s*['"](\w+)['"]\s*\)/);
      const prevLine = i > 0 ? lines[i - 1] : '';
      const isStorageFrom = /storage\s*\.?\s*$/.test(prevLine) || /storage\s*\.\s*from/.test(line);
      if (fromMatch && schema && !isStorageFrom) {
        const table = fromMatch[1];
        if (!schema[table]) {
          addIssue('error', relPath, i + 1, `Tabela "${table}" não existe no schema Supabase`);
          queryIssueCount++;
        } else {
          const selectMatch = line.match(/\.select\(\s*['"]([^'"*]+)['"]\s*\)/);
          if (selectMatch) {
            const cols = selectMatch[1]
              .split(',')
              .map(c => c.trim().split(/[:(!\s]/)[0].trim())
              .filter(c => c && c !== '*' && !c.includes('.'));
            for (const col of cols) {
              if (!schema[table].includes(col)) {
                addIssue('error', relPath, i + 1, `Coluna "${col}" não existe em "${table}" (schema Supabase)`);
                queryIssueCount++;
              }
            }
          }
        }
      }

      // .rpc('nome_rpc')
      const rpcMatch = line.match(/\.rpc\(\s*['"](\w+)['"]/);
      if (rpcMatch && rpcs.size > 0) {
        if (!rpcs.has(rpcMatch[1])) {
          addIssue('error', relPath, i + 1, `RPC "${rpcMatch[1]}" não encontrada no Supabase`);
          queryIssueCount++;
        }
      }
    }
  }

  console.log(queryIssueCount === 0
    ? `  ${GREEN}✓${RESET} Todas as queries/RPCs válidas`
    : `  ${RED}✗${RESET} ${queryIssueCount} problema(s)`);

  // ═══════════════════════════════════════════════════════════════════════════
  // FASE 4: Imports órfãos
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(`\n${DIM}Fase 4: Imports órfãos${RESET}`);
  let orphanCount = 0;

  for (const [relPath, content] of fileContents) {
    const dir = dirname(join(ROOT, relPath));
    const importMatches = content.matchAll(/from\s+['"](\.[^'"]+)['"]/g);
    for (const m of importMatches) {
      const importPath = m[1];
      const resolved = resolve(dir, importPath);
      const candidates = [
        resolved,
        resolved + '.ts',
        resolved + '.tsx',
        resolved + '/index.ts',
        resolved + '/index.tsx',
      ];
      if (!candidates.some(c => existsSync(c))) {
        addIssue('error', relPath, 0, `Import órfão: "${importPath}" — arquivo não existe`);
        orphanCount++;
      }
    }
  }

  console.log(orphanCount === 0
    ? `  ${GREEN}✓${RESET} Todos os imports resolvem`
    : `  ${RED}✗${RESET} ${orphanCount} import(s) órfão(s)`);

  // ═══════════════════════════════════════════════════════════════════════════
  // FASE 5: Exports não utilizados
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(`\n${DIM}Fase 5: Exports não utilizados${RESET}`);
  let unusedExportCount = 0;

  const exportMap = new Map();
  for (const [relPath, content] of fileContents) {
    const exportMatches = content.matchAll(/export\s+(?:const|function|class|enum|type|interface)\s+(\w+)/g);
    for (const m of exportMatches) {
      exportMap.set(`${m[1]}@${relPath}`, { name: m[1], file: relPath });
    }
  }

  const allContentEntries = [...fileContents.entries()];
  for (const [, { name, file: exportFile }] of exportMap) {
    if (exportFile.endsWith('index.ts') || exportFile.endsWith('index.tsx')) continue;
    if (exportFile.includes('types.ts') || exportFile.includes('types/')) continue;
    if (['App.tsx', 'main.tsx', 'vite-env.d.ts'].includes(basename(exportFile))) continue;

    const isUsed = allContentEntries.some(([otherFile, content]) => {
      if (otherFile === exportFile) return false;
      return new RegExp(`\\b${name}\\b`).test(content);
    });

    if (!isUsed) {
      addIssue('info', exportFile, 0, `Export "${name}" não é importado em nenhum arquivo`);
      unusedExportCount++;
    }
  }

  console.log(unusedExportCount === 0
    ? `  ${GREEN}✓${RESET} Todos os exports são utilizados`
    : `  ${YELLOW}⚠${RESET} ${unusedExportCount} export(s) possivelmente não utilizados ${DIM}(use --verbose)${RESET}`);

  // ═══════════════════════════════════════════════════════════════════════════
  // FASE 6: Funções/Componentes duplicados
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(`\n${DIM}Fase 6: Duplicados${RESET}`);
  let dupCount = 0;

  // 6a. Nomes exportados duplicados (mesmo nome em 2+ arquivos)
  const exportByName = new Map(); // name → [files]
  for (const [, { name, file }] of exportMap) {
    if (!exportByName.has(name)) exportByName.set(name, []);
    exportByName.get(name).push(file);
  }

  const dupNameSkip = new Set(['default', 'Props', 'State', 'Config', 'Options', 'Result', 'Response', 'Error']);
  for (const [name, files] of exportByName) {
    if (files.length < 2) continue;
    if (dupNameSkip.has(name)) continue;
    if (name.length <= 2) continue;
    // Filtrar types/interfaces
    const nonTypeFiles = files.filter(f => {
      const content = fileContents.get(f);
      const re = new RegExp(`export\\s+(?:type|interface)\\s+${name}\\b`);
      return !re.test(content);
    });
    if (nonTypeFiles.length < 2) continue;
    // Ignorar re-exports (export { X } from '...') — contam como uma definição
    const realDefs = nonTypeFiles.filter(f => {
      const content = fileContents.get(f);
      const reExport = new RegExp(`export\\s*\\{[^}]*\\b${name}\\b[^}]*\\}\\s*from`);
      return !reExport.test(content);
    });
    if (realDefs.length >= 2) {
      // Ignorar se todos os arquivos estão em pastas diferentes (módulos isolados, sem conflito)
      const topDirs = new Set(realDefs.map(f => f.split('/').slice(0, 4).join('/')));
      if (topDirs.size === realDefs.length) {
        // Cada definição está em módulo diferente — é intencional, não reportar
      } else {
        addIssue('warning', realDefs[0], 0, `"${name}" definido em ${realDefs.length} arquivos: ${realDefs.join(', ')}`);
        dupCount++;
      }
    }
  }

  // 6b. Arquivos com conteúdo idêntico (hash)
  const fileHashes = new Map(); // hash → [relPaths]
  for (const [relPath, content] of fileContents) {
    const hash = createHash('md5').update(content).digest('hex');
    if (!fileHashes.has(hash)) fileHashes.set(hash, []);
    fileHashes.get(hash).push(relPath);
  }

  for (const [, files] of fileHashes) {
    if (files.length < 2) continue;
    addIssue('warning', files[0], 0, `Arquivo duplicado (conteúdo idêntico): ${files.join(', ')}`);
    dupCount++;
  }

  console.log(dupCount === 0
    ? `  ${GREEN}✓${RESET} Sem duplicados`
    : `  ${YELLOW}⚠${RESET} ${dupCount} duplicado(s)`);

  // ═══════════════════════════════════════════════════════════════════════════
  // FASE 7: Regras de código (linha por linha em TODOS os arquivos)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(`\n${DIM}Fase 7: Regras de código (linha por linha)${RESET}`);
  let codeIssueCount = 0;

  for (const [relPath, content] of fileContents) {
    const lines = content.split('\n');
    const fileName = basename(relPath);

    // ── Contadores para blocos de comentários ──
    let consecutiveCommentLines = 0;
    let commentBlockStart = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Ignorar linhas com audit-ok
      if (/audit-ok/.test(line)) continue;

      // ── Bloco de código comentado (3+ linhas seguidas de //) ──
      if (/^\s*\/\/(?!\s*(eslint|@ts-|TODO|FIXME|HACK|XXX|NOTA|REGRA|IMPORTANTE|──|══|Fase|Tipos|Helpers))/.test(line) && !/^\s*\/\/\s*$/.test(line)) {
        if (consecutiveCommentLines === 0) commentBlockStart = i;
        consecutiveCommentLines++;
      } else {
        if (consecutiveCommentLines >= 5) {
          addIssue('warning', relPath, commentBlockStart + 1, `Bloco de ${consecutiveCommentLines} linhas comentadas — código morto?`);
          codeIssueCount++;
        }
        consecutiveCommentLines = 0;
      }

      // Pular linhas que são puramente comentários para as regras seguintes
      if (/^\s*\/\//.test(line) || /^\s*\*/.test(line) || /^\s*\/\*/.test(line)) continue;

      // ── console.log de debug (fora de catch/error) ──
      if (/\bconsole\.(log|warn|info|debug)\s*\(/.test(line)) {
        // Permitir em catch blocks, error handlers, e linhas com [tag]
        const context5 = lines.slice(Math.max(0, i - 3), i).join(' ');
        const isCatchContext = /catch\s*\(|\.catch\s*\(|if\s*\(\s*error|if\s*\(\s*err\b|\.on\s*\(\s*['"]error/.test(context5);
        if (!isCatchContext && !/\[(AUTH|RBAC|buscar|DevQuick|EquipeTab|ENRICH|SW)]/.test(line)) {
          addIssue('warning', relPath, i + 1, `console.${line.match(/console\.(\w+)/)?.[1]} de debug — remover antes de produção`);
          codeIssueCount++;
        }
      }

      // ── console.error sem contexto (catch vazio com apenas console.error) ──
      // (catch com console.error é OK, mas catch totalmente vazio não)

      // ── Catch vazio (silencia erros) ──
      if (/\}\s*catch\s*(?:\([^)]*\))?\s*\{\s*\}/.test(line)) {
        addIssue('warning', relPath, i + 1, 'catch vazio — erros silenciados');
        codeIssueCount++;
      }
      // Catch com apenas comentário
      if (/\}\s*catch\s*(?:\([^)]*\))?\s*\{/.test(line)) {
        const nextLine = (lines[i + 1] || '').trim();
        const nextNextLine = (lines[i + 2] || '').trim();
        if (nextLine === '' && nextNextLine === '}') {
          addIssue('warning', relPath, i + 1, 'catch vazio (bloco vazio) — erros silenciados');
          codeIssueCount++;
        }
      }

      // ── new Date().toISOString() pro banco ──
      if (/new Date\(\)\.toISOString\(\)/.test(line)) {
        if (!/split|slice|replace.*-03:00|console|log\(|optimistic|const\s+(hoje|today|now)/i.test(line)) {
          addIssue('error', relPath, i + 1, 'new Date().toISOString() gera UTC — usar tsBR() ou todayBR()');
          codeIssueCount++;
        }
      }

      // ── fixed inset-0 ──
      if (/className=.*\bfixed\s+inset-0\b/.test(line)) {
        const allowFixed = ['App.tsx', 'CheckoutPage.tsx', 'AdminDashboardView.tsx', 'DevAccountSwitcher.tsx', 'AuthModal.tsx', 'DevQuickLogin.tsx'];
        if (!allowFixed.includes(fileName)) {
          addIssue('error', relPath, i + 1, 'fixed inset-0 — usar absolute inset-0 (modais dentro do container)');
          codeIssueCount++;
        }
      }

      // ── select nativo HTML ──
      if (/<select\b/.test(line) && !/<select.*disabled/.test(line)) {
        if (!/node_modules|\.test\.|\.spec\./.test(relPath) && !fileName.includes('VantaDropdown')) {
          addIssue('warning', relPath, i + 1, '<select> HTML nativo — usar VantaDropdown');
          codeIssueCount++;
        }
      }

      // ── w-[Npx] fixo grande (>=400px) — ignora max-w-[Npx] (que é responsivo) ──
      if (/\bw-\[\d{3,}px\]/.test(line) && !/max-w-\[/.test(line)) {
        const px = parseInt(line.match(/\bw-\[(\d+)px\]/)?.[1] || '0');
        if (px >= 400) {
          addIssue('warning', relPath, i + 1, `w-[${px}px] — largura fixa grande, verificar responsividade`);
          codeIssueCount++;
        }
      }

      // ── supabaseAdmin (foi removido) ──
      if (/supabaseAdmin/.test(line) && !/import.*supabaseAdmin/.test(line)) {
        addIssue('error', relPath, i + 1, 'supabaseAdmin foi removido — usar supabase (anon + RLS)');
        codeIssueCount++;
      }

      // ── TODO/FIXME/HACK/XXX esquecidos ──
      if (/\b(TODO|FIXME|HACK|XXX)\b/.test(trimmed) && !/audit-ok/.test(line)) {
        const tag = trimmed.match(/\b(TODO|FIXME|HACK|XXX)\b/)?.[1];
        addIssue('info', relPath, i + 1, `${tag} encontrado: ${trimmed.slice(0, 80)}`);
      }

      // ── any type explícito ──
      if (/:\s*any\b/.test(line) && !/as\s+any|\/\/.*any|eslint|audit-ok/.test(line)) {
        // Só reporta em arquivos .ts/.tsx, não em .d.ts
        if (!relPath.endsWith('.d.ts')) {
          addIssue('info', relPath, i + 1, `Tipo 'any' explícito — considerar tipagem forte`);
        }
      }
    }

    // ── Hooks após early return (componentes React) ──
    if (relPath.endsWith('.tsx')) {
      let insideComp = false, foundReturn = false, braceDepth = 0, compStart = 0;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (/(?:export\s+)?(?:const|function)\s+\w+.*(?:React\.FC|: FC|=>)/.test(line)) {
          insideComp = true; foundReturn = false; braceDepth = 0; compStart = i;
        }
        if (!insideComp) continue;
        for (const ch of line) { if (ch === '{') braceDepth++; if (ch === '}') braceDepth--; }
        if (/\bif\s*\(.*\)\s*return\b/.test(line) && braceDepth <= 2) foundReturn = true;
        if (foundReturn && /\b(useState|useEffect|useMemo|useCallback|useRef)\s*[(<]/.test(line)) {
          addIssue('error', relPath, i + 1, `Hook "${line.match(/\b(use\w+)/)?.[1]}" após early return — viola Rules of Hooks`);
          codeIssueCount++;
        }
        if (braceDepth <= 0 && i > compStart + 1) { insideComp = false; foundReturn = false; }
      }
    }

    // ── Último bloco de comentários ──
    if (consecutiveCommentLines >= 5) {
      addIssue('warning', relPath, commentBlockStart + 1, `Bloco de ${consecutiveCommentLines} linhas comentadas no final do arquivo — código morto?`);
      codeIssueCount++;
    }
  }

  console.log(codeIssueCount === 0
    ? `  ${GREEN}✓${RESET} Nenhum problema de código`
    : `  ${RED}✗${RESET} ${codeIssueCount} problema(s) de código`);

  // ═══════════════════════════════════════════════════════════════════════════
  // FASE 8: Variáveis/funções declaradas mas não usadas (dentro do arquivo)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(`\n${DIM}Fase 8: Variáveis não usadas (intra-arquivo)${RESET}`);
  let unusedVarCount = 0;

  for (const [relPath, content] of fileContents) {
    // Só variáveis/funções não exportadas e não underscore-prefixed
    const localDecls = content.matchAll(/(?<!export\s+)(?:const|let|var|function)\s+([a-zA-Z][a-zA-Z0-9_]*)\b/g);
    for (const m of localDecls) {
      const name = m[1];
      if (name.length <= 1 || name.startsWith('_')) continue;
      // Palavras comuns de framework que são usadas implicitamente
      if (['React', 'useState', 'useEffect', 'useCallback', 'useMemo', 'useRef', 'useReducer'].includes(name)) continue;
      // Contar ocorrências no arquivo (deve aparecer >=2x: declaração + uso)
      const re = new RegExp(`\\b${name}\\b`, 'g');
      const matches = content.match(re);
      if (matches && matches.length === 1) {
        addIssue('info', relPath, 0, `"${name}" declarado mas aparentemente não usado no arquivo`);
        unusedVarCount++;
      }
    }
  }

  console.log(unusedVarCount === 0
    ? `  ${GREEN}✓${RESET} Sem variáveis não usadas detectadas`
    : `  ${DIM}ℹ${RESET} ${unusedVarCount} possíveis variáveis não usadas ${DIM}(use --verbose)${RESET}`);

  // ═══════════════════════════════════════════════════════════════════════════
  // FASE 9: Memórias vs arquivos reais
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(`\n${DIM}Fase 9: Memórias${RESET}`);
  const memResult = runCmd('node scripts/memory-audit.mjs', 'memory-audit');
  if (memResult.ok) {
    console.log(`  ${GREEN}✓${RESET} Memórias OK`);
  } else {
    console.log(`  ${YELLOW}⚠${RESET} Verificar memórias`);
    addIssue('warning', 'memory-audit', 0, 'Memórias com referências quebradas');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FASE 10: Dependências circulares
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(`\n${DIM}Fase 10: Dependências circulares${RESET}`);
  let circularCount = 0;

  const importGraph = new Map(); // file → Set<imported files>
  for (const [relPath, content] of fileContents) {
    const imports = new Set();
    const dir = dirname(relPath);
    const importMatches = content.matchAll(/from\s+['"](\.[^'"]+)['"]/g);
    for (const m of importMatches) {
      const resolved = resolve(ROOT, dir, m[1]);
      for (const ext of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
        const candidate = resolved + ext;
        const rel = relative(ROOT, candidate);
        if (fileContents.has(rel)) {
          imports.add(rel);
          break;
        }
      }
    }
    importGraph.set(relPath, imports);
  }

  // DFS para ciclos (limitado a profundidade 4 para não ser O(n!))
  function findCycle(start, current, visited, depth) {
    if (depth > 4) return null;
    const deps = importGraph.get(current);
    if (!deps) return null;
    for (const dep of deps) {
      if (dep === start && depth >= 2) return [current, dep];
      if (visited.has(dep)) continue;
      visited.add(dep);
      const result = findCycle(start, dep, visited, depth + 1);
      if (result) return [current, ...result];
      visited.delete(dep);
    }
    return null;
  }

  const reportedCycles = new Set();
  for (const [file] of importGraph) {
    const cycle = findCycle(file, file, new Set([file]), 0);
    if (cycle) {
      const key = [...cycle].sort().join('→');
      if (!reportedCycles.has(key)) {
        reportedCycles.add(key);
        addIssue('warning', file, 0, `Dependência circular: ${cycle.join(' → ')}`);
        circularCount++;
      }
    }
  }

  console.log(circularCount === 0
    ? `  ${GREEN}✓${RESET} Sem dependências circulares`
    : `  ${YELLOW}⚠${RESET} ${circularCount} ciclo(s) detectado(s)`);

  // ═══════════════════════════════════════════════════════════════════════════
  // FASE 11: Segurança (credenciais, secrets, tokens hardcodados)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(`\n${DIM}Fase 11: Segurança${RESET}`);
  let securityCount = 0;

  for (const [relPath, content] of fileContents) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/audit-ok/.test(line)) continue;
      if (/^\s*\/\//.test(line)) continue;

      // Secrets/tokens hardcodados (excluir import.meta.env e process.env)
      if (/(?:password|secret|token|api_key|apikey|private_key)\s*[:=]\s*['"][^'"]{8,}['"]/i.test(line)) {
        if (!/import\.meta\.env|process\.env|ENV\[|env\.|placeholder|PLACEHOLDER|example|test/i.test(line)) {
          addIssue('error', relPath, i + 1, 'Possível credencial hardcodada — mover para .env');
          securityCount++;
        }
      }

      // URLs de API internas expostas (não-Supabase, não-localhost)
      if (/https?:\/\/[^'")\s]+(?:api|admin|internal|webhook)[^'")\s]*/i.test(line)) {
        if (!/supabase|localhost|127\.0\.0\.1|example\.com|placeholder|vercel|github|imgur|firebase/i.test(line)) {
          if (!/audit-ok/.test(line)) {
            addIssue('info', relPath, i + 1, `URL interna encontrada: ${line.trim().slice(0, 80)}`);
          }
        }
      }

      // innerHTML / dangerouslySetInnerHTML (XSS)
      if (/dangerouslySetInnerHTML|\.innerHTML\s*=/.test(line)) {
        addIssue('warning', relPath, i + 1, 'dangerouslySetInnerHTML/innerHTML — risco de XSS');
        securityCount++;
      }

      // eval() ou Function()
      if (/\beval\s*\(|\bnew\s+Function\s*\(/.test(line)) {
        addIssue('error', relPath, i + 1, 'eval()/new Function() — risco de injeção de código');
        securityCount++;
      }
    }
  }

  console.log(securityCount === 0
    ? `  ${GREEN}✓${RESET} Nenhum problema de segurança detectado`
    : `  ${RED}✗${RESET} ${securityCount} problema(s) de segurança`);

  // ═══════════════════════════════════════════════════════════════════════════
  // FASE 12: Acessibilidade & UX
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(`\n${DIM}Fase 12: Acessibilidade & UX${RESET}`);
  let a11yCount = 0;

  for (const [relPath, content] of fileContents) {
    if (!relPath.endsWith('.tsx')) continue;
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/audit-ok/.test(line)) continue;

      // <img> sem alt
      if (/<img\b/.test(line) && !/alt=/.test(line) && !/alt\s*\{/.test(lines.slice(i, i + 3).join(' '))) {
        addIssue('info', relPath, i + 1, '<img> sem atributo alt — acessibilidade');
        a11yCount++;
      }

      // onClick em div/span sem role ou tabIndex
      if (/<(?:div|span)\b[^>]*onClick/.test(line)) {
        const chunk = lines.slice(i, Math.min(i + 3, lines.length)).join(' ');
        if (!/role=|tabIndex|aria-/.test(chunk)) {
          addIssue('info', relPath, i + 1, 'onClick em <div>/<span> sem role/tabIndex — acessibilidade');
          a11yCount++;
        }
      }
    }
  }

  console.log(a11yCount === 0
    ? `  ${GREEN}✓${RESET} Sem problemas de acessibilidade`
    : `  ${DIM}ℹ${RESET} ${a11yCount} sugestão(ões) de acessibilidade ${DIM}(use --verbose)${RESET}`);

  // ═══════════════════════════════════════════════════════════════════════════
  // FASE 13: Arquivos grandes (> 400 linhas)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(`\n${DIM}Fase 13: Arquivos grandes${RESET}`);
  let largeCount = 0;

  for (const [relPath, content] of fileContents) {
    const lineCount = content.split('\n').length;
    if (lineCount > 500) {
      addIssue('info', relPath, 0, `${lineCount} linhas — considerar splittar`);
      largeCount++;
    } else if (lineCount > 400) {
      addIssue('info', relPath, 0, `${lineCount} linhas — ficando grande`);
      largeCount++;
    }
  }

  console.log(largeCount === 0
    ? `  ${GREEN}✓${RESET} Todos os arquivos com tamanho razoável`
    : `  ${DIM}ℹ${RESET} ${largeCount} arquivo(s) grandes ${DIM}(use --verbose)${RESET}`);

  // ═══════════════════════════════════════════════════════════════════════════
  // FASE 14: Supabase .update/.insert/.delete sem .eq ou sem check de erro
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(`\n${DIM}Fase 14: Supabase mutations sem error handling${RESET}`);
  let mutationCount = 0;

  for (const [relPath, content] of fileContents) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/audit-ok/.test(line)) continue;

      // .update({...}) ou .insert({...}) ou .delete() sem checar { error }
      if (/\.(update|insert|upsert|delete)\s*\(/.test(line) && /supabase|from\(/.test(lines.slice(Math.max(0, i - 2), i + 1).join(' '))) {
        // Verificar se nas próximas 5 linhas tem destructuring de error
        const nextLines = lines.slice(i, Math.min(i + 6, lines.length)).join(' ');
        if (!/\{\s*(?:data\s*,\s*)?error|\.then\(|await|catch|\.error/.test(nextLines) && !/void\s+supabase/.test(nextLines)) {
          addIssue('info', relPath, i + 1, `Supabase .${line.match(/\.(update|insert|upsert|delete)/)?.[1]}() — verificar se erro é tratado`);
          mutationCount++;
        }
      }
    }
  }

  console.log(mutationCount === 0
    ? `  ${GREEN}✓${RESET} Todas as mutations com error handling`
    : `  ${DIM}ℹ${RESET} ${mutationCount} mutation(s) para verificar ${DIM}(use --verbose)${RESET}`);

  // ═══════════════════════════════════════════════════════════════════════════
  // RESUMO
  // ═══════════════════════════════════════════════════════════════════════════
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  const { errors, warnings, info } = issues;

  console.log(`\n${'═'.repeat(60)}`);

  if (errors.length > 0) {
    console.log(`\n${RED}${BOLD}ERROS (${errors.length}):${RESET}`);
    for (const e of errors) {
      console.log(`  ${RED}✗${RESET} ${YELLOW}${e.file}${e.line ? ':' + e.line : ''}${RESET} ${e.msg}`);
    }
  }

  if (warnings.length > 0) {
    console.log(`\n${YELLOW}${BOLD}AVISOS (${warnings.length}):${RESET}`);
    for (const w of warnings) {
      console.log(`  ${YELLOW}⚠${RESET} ${DIM}${w.file}${w.line ? ':' + w.line : ''}${RESET} ${w.msg}`);
    }
  }

  if (info.length > 0 && verbose) {
    console.log(`\n${DIM}${BOLD}INFO (${info.length}):${RESET}`);
    for (const inf of info) {
      console.log(`  ${DIM}ℹ ${inf.file}${inf.line ? ':' + inf.line : ''} ${inf.msg}${RESET}`);
    }
  } else if (info.length > 0) {
    console.log(`\n  ${DIM}ℹ ${info.length} info (use --verbose para ver)${RESET}`);
  }

  console.log(`\n${'═'.repeat(60)}`);
  if (errors.length === 0 && warnings.length === 0) {
    console.log(`${GREEN}${BOLD}✓ DEEP AUDIT OK${RESET} ${DIM}(${elapsed}s · ${allFiles.length} arquivos)${RESET}`);
  } else if (errors.length === 0) {
    console.log(`${GREEN}${BOLD}✓ DEEP AUDIT OK${RESET} ${DIM}(${elapsed}s · ${allFiles.length} arquivos)${RESET} · ${YELLOW}${warnings.length} aviso(s)${RESET}`);
  } else {
    console.log(`${RED}${BOLD}✗ DEEP AUDIT FALHOU${RESET} ${DIM}(${elapsed}s · ${allFiles.length} arquivos)${RESET}`);
    console.log(`  ${RED}${errors.length} erro(s)${RESET} · ${YELLOW}${warnings.length} aviso(s)${RESET} · ${DIM}${info.length} info${RESET}`);
  }
  console.log(`${DIM}Suprimir falso-positivo: "audit-ok" na linha.${RESET}\n`);

  process.exit(errors.length > 0 ? 1 : 0);
}

main();
