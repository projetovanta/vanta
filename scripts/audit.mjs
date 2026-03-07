#!/usr/bin/env node
/**
 * audit.mjs — Auditoria automatizada VANTA.
 *
 * Substitui a auditoria manual por agents. Roda em ~5 segundos.
 * Cobre: TSC, ESLint, lint:layout, build, + regras customizadas de código.
 *
 * Uso:
 *   node scripts/audit.mjs
 *   npm run audit
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Cores ────────────────────────────────────────────────────────────────────
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[90m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

// ── Config ───────────────────────────────────────────────────────────────────
const SCAN_DIRS = ['features', 'components', 'views', 'modules', 'hooks', 'services', 'src'];
const EXTENSIONS = ['.ts', '.tsx'];

// ── Helpers ──────────────────────────────────────────────────────────────────

function walkDir(dir) {
  const results = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return results; }
  for (const entry of entries) {
    if (['node_modules', 'PREVANTABACKUP', '.git', 'dist', 'tests'].includes(entry)) continue;
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

function runCmd(cmd, label) {
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'pipe', timeout: 120_000 });
    return { ok: true, label };
  } catch (e) {
    return { ok: false, label, output: e.stdout?.toString() || e.stderr?.toString() || e.message };
  }
}

// ── Regras de Código (substituem auditoria manual) ───────────────────────────

const CODE_RULES = [
  // 1. Timestamp UTC direto pro banco
  {
    id: 'utc-timestamp',
    pattern: /new Date\(\)\.toISOString\(\)/,
    msg: 'new Date().toISOString() gera UTC — usar toLocaleString("sv-SE", {timeZone:"America/Sao_Paulo"}) + "-03:00"',
    severity: 'error',
    contextCheck: (line) => {
      // OK: comparações client-side (.split('T')[0], .slice(0,10))
      if (/split\(['"]T['"]\)\[0\]/.test(line)) return false;
      if (/\.slice\(0,\s*10\)/.test(line)) return false;
      // OK: .replace('Z', '-03:00') — já corrige o offset
      if (/\.replace\(['"]Z['"],\s*['"]-03:00['"]\)/.test(line)) return false;
      // OK: timestamps de UI/log/optimistic
      if (/console\.|\.log\(|optimistic/i.test(line)) return false;
      // OK: comparações locais (sem gravar no banco)
      if (/const\s+(hoje|today|now|agora)\b/.test(line)) return false;
      return true;
    },
  },
  // 2. Catch vazio sem feedback
  {
    id: 'empty-catch',
    pattern: /\bcatch\s*(?:\([^)]*\))?\s*\{\s*\}/,
    msg: 'catch vazio — erros silenciosos. Adicionar toast/log ou comentário justificando',
    severity: 'warning',
  },
  // 3. Hooks depois de early return
  {
    id: 'hook-after-return',
    severity: 'error',
    fileCheck: (content, relPath) => {
      if (!relPath.endsWith('.tsx')) return [];
      const issues = [];
      const lines = content.split('\n');
      let insideComponent = false;
      let foundReturn = false;
      let braceDepth = 0;
      let componentStart = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Detecta início de componente React
        if (/(?:export\s+)?(?:const|function)\s+\w+.*(?:React\.FC|: FC|=>)/.test(line) || /(?:export\s+)?function\s+\w+.*\(.*props/.test(line)) {
          insideComponent = true;
          foundReturn = false;
          braceDepth = 0;
          componentStart = i;
        }

        if (!insideComponent) continue;

        // Conta braces para saber quando saiu do componente
        for (const ch of line) {
          if (ch === '{') braceDepth++;
          if (ch === '}') braceDepth--;
        }

        // Early return (if (...) return)
        if (/\bif\s*\(.*\)\s*return\b/.test(line) && braceDepth <= 2) {
          foundReturn = true;
        }

        // Hook depois de early return
        if (foundReturn && /\b(useState|useEffect|useMemo|useCallback|useRef|useContext|useReducer)\s*[(<]/.test(line)) {
          issues.push({ line: i + 1, msg: `Hook "${line.match(/\b(use\w+)/)?.[1]}" chamado após early return — viola Rules of Hooks` });
        }

        if (braceDepth <= 0 && i > componentStart + 1) {
          insideComponent = false;
          foundReturn = false;
        }
      }
      return issues;
    },
  },
  // 4. select() com coluna que pode não existir (detecta padrões suspeitos)
  {
    id: 'supabase-select-star',
    pattern: /\.select\(\s*['"]?\*['"]?\s*\)/,
    msg: 'select("*") — considerar listar colunas explicitamente',
    severity: 'info',
  },
  // 5. fixed inset-0 em componentes (já coberto por lint:layout, mas reforça)
  {
    id: 'fixed-inset',
    pattern: /className=.*\bfixed\s+inset-0\b/,
    msg: 'fixed inset-0 em componente — usar absolute inset-0 (modais dentro do container)',
    severity: 'error',
    excludeFiles: ['App.tsx', 'CheckoutPage.tsx', 'AdminDashboardView.tsx', 'DevAccountSwitcher.tsx', 'AuthModal.tsx'],
  },
  // 6. console.log esquecido (info only — muitos são legítimos em services)
  {
    id: 'console-log',
    pattern: /\bconsole\.(log|debug)\(/,
    msg: 'console.log/debug em produção — remover ou usar console.warn/error',
    severity: 'info',
    excludeFiles: ['vite.config.ts', 'vitest.config.ts', 'eslint.config.js', 'audit.mjs', 'lint-layout.mjs'],
  },
  // 7. Supabase sem tratamento de erro — desativado (ruído demais, checar manualmente quando relevante)
  // {
  //   id: 'supabase-no-error-check',
  //   pattern: /supabase\s*\.\s*from\s*\(\s*['"]\w+['"]\s*\)\s*\.\s*(?:select|insert|update|delete|upsert)\b/,
  //   msg: 'Query Supabase sem checar { error } — pode falhar silenciosamente',
  //   severity: 'info',
  // },
  // 8. useEffect com query Supabase sem catch/error handling (pode travar o app)
  {
    id: 'useeffect-no-catch',
    severity: 'warning',
    fileCheck: (content, relPath) => {
      if (!relPath.endsWith('.tsx') && !relPath.endsWith('.ts')) return [];
      const issues = [];
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (/audit-ok|lint-layout-ok/.test(line)) continue;

        // Detecta useEffect(() => { ... supabase.from(
        if (/useEffect\s*\(/.test(line)) {
          // Encontrar fim do useEffect via parênteses balanceados
          let depth = 0;
          let endIdx = i;
          let started = false;
          for (let j = i; j < Math.min(i + 150, lines.length); j++) {
            for (const ch of lines[j]) {
              if (ch === '(') { depth++; started = true; }
              if (ch === ')') depth--;
              if (started && depth === 0) { endIdx = j; break; }
            }
            if (started && depth === 0) break;
          }
          const block = lines.slice(i, endIdx + 1).join('\n');
          const hasSupabase = /supabase\s*\.\s*from\b/.test(block);
          if (!hasSupabase) continue;

          // .catch(), try{}, .then(fn, errFn), ou audit-ok em qualquer linha do bloco
          const hasCatch = /\.catch\b|try\s*\{|,\s*\(\s*\)\s*=>|,\s*\(\s*err/.test(block)
            || lines.slice(i, endIdx + 1).some(l => /audit-ok/.test(l));
          if (!hasCatch) {
            issues.push({ line: i + 1, msg: 'useEffect com query Supabase sem tratamento de erro — app pode travar se Supabase cair' });
          }
        }
      }
      return issues;
    },
  },
  // TODO/FIXME/HACK esquecidos
  {
    id: 'todo-fixme',
    pattern: /\b(TODO|FIXME|HACK|XXX)\b/,
    msg: 'TODO/FIXME encontrado — resolver antes de entregar',
    severity: 'info',
  },
  // 9. Inline style com px fixo grande (pode não ser responsivo)
  {
    id: 'inline-px',
    pattern: /style=\{\{[^}]*(?:width|height|maxWidth|minWidth)\s*:\s*['"]?\d{4,}(?:px)?/,
    msg: 'Style inline com valor fixo grande — verificar responsividade',
    severity: 'warning',
  },
  // 10. Import não utilizado (simplificado — ESLint cobre melhor, catch básico)
  {
    id: 'unused-import-simple',
    severity: 'info',
    fileCheck: (content, relPath) => {
      if (!relPath.endsWith('.tsx') && !relPath.endsWith('.ts')) return [];
      const issues = [];
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // import { A, B, C } from '...'
        const match = line.match(/^import\s+\{([^}]+)\}\s+from/);
        if (!match) continue;

        const imports = match[1].split(',').map(s => s.trim().split(/\s+as\s+/).pop().trim()).filter(Boolean);
        const restOfFile = lines.slice(i + 1).join('\n');

        for (const name of imports) {
          // Pula type imports
          if (/\btype\b/.test(line) && line.indexOf(name) > line.indexOf('type')) continue;
          // Checa se o nome aparece no resto do arquivo
          const regex = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
          if (!regex.test(restOfFile)) {
            issues.push({ line: i + 1, msg: `Import "${name}" possivelmente não utilizado` });
          }
        }
      }
      return issues;
    },
  },
];

// ── Scanner ──────────────────────────────────────────────────────────────────

function auditFile(filePath) {
  const issues = [];
  const relPath = relative(ROOT, filePath);
  const fileName = filePath.split('/').pop() || '';
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  for (const rule of CODE_RULES) {
    // File-level check
    if (rule.fileCheck) {
      const fileIssues = rule.fileCheck(content, relPath);
      for (const issue of fileIssues) {
        issues.push({
          file: relPath,
          line: issue.line,
          msg: issue.msg || rule.msg || rule.id,
          severity: rule.severity,
          id: rule.id,
        });
      }
      continue;
    }

    // Exclude files
    if (rule.excludeFiles?.includes(fileName)) continue;

    // Multiline pattern
    if (rule.multiline) {
      const joinedContent = content.replace(/\n/g, ' ');
      if (rule.pattern.test(joinedContent)) {
        // Find approximate line
        const match = content.match(rule.pattern);
        if (match) {
          const idx = content.indexOf(match[0]);
          const lineNum = content.substring(0, idx).split('\n').length;
          issues.push({ file: relPath, line: lineNum, msg: rule.msg, severity: rule.severity, id: rule.id });
        }
      }
      continue;
    }

    // Line-by-line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Pula comentários
      if (/^\s*\/\//.test(line) || /^\s*\*/.test(line) || /^\s*\/\*/.test(line)) continue;
      // Pula linhas com supressão
      if (/audit-ok|lint-layout-ok/.test(line)) continue;

      if (rule.pattern.test(line)) {
        // Context check (filtra falsos positivos)
        if (rule.contextCheck && !rule.contextCheck(line)) continue;

        issues.push({
          file: relPath,
          line: i + 1,
          msg: rule.msg,
          severity: rule.severity,
          id: rule.id,
          text: line.trim().slice(0, 100),
        });
      }
    }
  }

  return issues;
}

// ── Main ─────────────────────────────────────────────────────────────────────

const verbose = process.argv.includes('--verbose') || process.argv.includes('-v');
console.log(`\n${BOLD}🔍 VANTA Audit${RESET}${verbose ? ' (verbose)' : ''}\n`);

const startTime = Date.now();
let totalErrors = 0;
let totalWarnings = 0;
let totalInfo = 0;

// ── Fase 1: Tooling (TSC + ESLint + lint:layout + Build) ────────────────────
console.log(`${DIM}Fase 1: Tooling...${RESET}`);

const toolChecks = [
  { cmd: 'npx tsc --noEmit', label: 'TypeScript' },
  { cmd: 'npx eslint src/ modules/ features/ hooks/ services/ --quiet', label: 'ESLint' },
  { cmd: 'node scripts/lint-layout.mjs', label: 'lint:layout' },
  { cmd: 'npx vite build', label: 'Build' },
];

const toolResults = [];
for (const { cmd, label } of toolChecks) {
  const result = runCmd(cmd, label);
  toolResults.push(result);
  if (result.ok) {
    console.log(`  ${GREEN}✓${RESET} ${label}`);
  } else {
    console.log(`  ${RED}✗${RESET} ${label}`);
    if (result.output) {
      const preview = result.output.split('\n').slice(0, 8).join('\n');
      console.log(`    ${DIM}${preview}${RESET}`);
    }
    totalErrors++;
  }
}

// ── Fase 2: Regras de Código ─────────────────────────────────────────────────
console.log(`\n${DIM}Fase 2: Regras de código...${RESET}`);

const allFiles = [];
for (const dir of SCAN_DIRS) {
  const fullDir = join(ROOT, dir);
  try { statSync(fullDir); allFiles.push(...walkDir(fullDir)); } catch { /* */ }
}
// Root files
try {
  const rootFiles = readdirSync(ROOT)
    .filter(f => EXTENSIONS.some(ext => f.endsWith(ext)))
    .map(f => join(ROOT, f));
  allFiles.push(...rootFiles);
} catch { /* */ }

const allIssues = [];
for (const file of allFiles) {
  allIssues.push(...auditFile(file));
}

const errors = allIssues.filter(i => i.severity === 'error');
const warnings = allIssues.filter(i => i.severity === 'warning');
const infos = allIssues.filter(i => i.severity === 'info');

if (errors.length > 0) {
  console.log(`\n  ${RED}${BOLD}Erros (${errors.length}):${RESET}`);
  for (const e of errors) {
    console.log(`  ${RED}✗${RESET} ${YELLOW}${e.file}:${e.line}${RESET} [${e.id}] ${e.msg}`);
    if (e.text) console.log(`    ${DIM}${e.text}${RESET}`);
  }
}

if (warnings.length > 0) {
  console.log(`\n  ${YELLOW}${BOLD}Avisos (${warnings.length}):${RESET}`);
  for (const w of warnings) {
    console.log(`  ${YELLOW}⚠${RESET} ${DIM}${w.file}:${w.line}${RESET} [${w.id}] ${w.msg}`);
    if (w.text) console.log(`    ${DIM}${w.text}${RESET}`);
  }
}

if (infos.length > 0 && verbose) {
  console.log(`\n  ${DIM}${BOLD}Info (${infos.length}):${RESET}`);
  for (const info of infos) {
    console.log(`  ${DIM}ℹ ${info.file}:${info.line} [${info.id}] ${info.msg}${RESET}`);
  }
} else if (infos.length > 0) {
  console.log(`\n  ${DIM}ℹ ${infos.length} info (use --verbose para ver)${RESET}`);
}

if (errors.length === 0 && warnings.length === 0 && infos.length === 0) {
  console.log(`  ${GREEN}✓${RESET} Nenhum problema encontrado`);
}

totalErrors += errors.length;
totalWarnings += warnings.length;
totalInfo += infos.length;

// ── Resumo ───────────────────────────────────────────────────────────────────
const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
const toolFails = toolResults.filter(r => !r.ok).length;

console.log(`\n${'─'.repeat(50)}`);
if (totalErrors === 0 && toolFails === 0) {
  console.log(`${GREEN}${BOLD}✓ Auditoria VANTA OK${RESET} ${DIM}(${elapsed}s)${RESET}`);
  console.log(`  ${DIM}${allFiles.length} arquivos · ${warnings.length} avisos · ${infos.length} info${RESET}`);
} else {
  console.log(`${RED}${BOLD}✗ Auditoria falhou${RESET} ${DIM}(${elapsed}s)${RESET}`);
  console.log(`  ${RED}${totalErrors + toolFails} erro(s)${RESET} · ${YELLOW}${totalWarnings} aviso(s)${RESET} · ${DIM}${totalInfo} info${RESET}`);
}
console.log(`${DIM}Para suprimir falso-positivo: "audit-ok" na linha.${RESET}\n`);

process.exit(totalErrors + toolFails > 0 ? 1 : 0);
