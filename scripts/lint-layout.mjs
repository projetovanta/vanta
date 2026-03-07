#!/usr/bin/env node
/**
 * lint-layout.mjs — Garante padrão de responsividade VANTA.
 *
 * Bloqueia anti-padrões de layout em .tsx que causam:
 *   - Scroll horizontal
 *   - Layout fixo que não se adapta
 *   - Elementos que vazam da tela em mobile
 *   - Caixas desproporcionais (uma gigante, outra pequena)
 *   - Conteúdo cortado / invisível por falta de scroll
 *   - Texto sem truncamento estourando layout
 *
 * Uso:
 *   node scripts/lint-layout.mjs
 *   npm run lint:layout
 *
 * Para suprimir um falso-positivo, adicionar na mesma linha:
 *   lint-layout-ok (como comentário JSX ou JS)
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Config ────────────────────────────────────────────────────────────────────

const SCAN_DIRS = ['features', 'components', 'views', 'modules', 'hooks'];
const EXTENSIONS = ['.tsx'];

// Arquivos que podem usar h-screen / fixed inset-0 (raiz do app, admin overlays, standalone)
const FILE_WHITELIST = [
  'App.tsx',
  'CheckoutPage.tsx',
  'AdminDashboardView.tsx',
  'AdminGateway.tsx',
  'DevAccountSwitcher.tsx',
  'ErrorBoundary.tsx',
];

// ── Regras ────────────────────────────────────────────────────────────────────

const RULES = [
  // ═══ LARGURA ═══

  // w-screen em qualquer lugar = proibido
  {
    pattern: /\bw-screen\b/,
    msg: 'w-screen proibido — usar w-full',
    severity: 'error',
  },
  // h-screen fora de whitelisted files
  {
    pattern: /\bh-screen\b/,
    msg: 'h-screen proibido — usar flex-1 ou min-h-0',
    allowWhitelist: true,
    severity: 'error',
  },
  // fixed inset-0 fora de whitelisted files
  {
    pattern: /\bfixed\s+inset-0\b/,
    msg: 'fixed inset-0 proibido em componentes — usar absolute inset-0',
    allowWhitelist: true,
    severity: 'error',
  },
  // w-[Npx] acima de 80px sem shrink-0 = suspeito de layout fixo
  {
    pattern: /\bw-\[(\d+)px\]/,
    msg: 'w-[Npx] largo proibido — usar %, flex, w-full',
    minPxValue: 80,
    severity: 'error',
  },
  // min-w-[Npx] acima de 40px
  {
    pattern: /\bmin-w-\[(\d+)px\]/,
    msg: 'min-w-[Npx] proibido — usar min-w-0 ou classe Tailwind',
    minPxValue: 40,
    severity: 'error',
  },
  // max-w-[Npx] acima de 320px = container que deveria usar max-w-sm/md/lg
  {
    pattern: /\bmax-w-\[(\d+)px\]/,
    msg: 'max-w-[Npx] largo proibido — usar max-w-xs/sm/md ou %',
    minPxValue: 320,
    severity: 'error',
  },

  // ═══ ALTURA FIXA (caixas desproporcionais) ═══

  // h-[Npx] acima de 600px = container que deveria ser flex-1
  {
    pattern: /\bh-\[(\d+)px\]/,
    msg: 'h-[Npx] alto demais — usar flex-1, min-h-0 ou h-auto para containers',
    minPxValue: 600,
    severity: 'warning',
  },
  // min-h-[Npx] acima de 600px = provavelmente deveria ser flex-1
  {
    pattern: /\bmin-h-\[(\d+)px\]/,
    msg: 'min-h-[Npx] alto demais — container flexível deveria usar flex-1',
    minPxValue: 600,
    severity: 'warning',
  },

  // ═══ OVERFLOW / SCROLL ═══

  // overflow-visible em div que pode conter conteúdo variável
  {
    pattern: /\boverflow-visible\b/,
    msg: 'overflow-visible suspeito — conteúdo pode vazar. Verificar se é intencional',
    severity: 'warning',
  },

  // ═══ TEXTO SEM TRUNCAMENTO ═══

  // Títulos/nomes dinâmicos sem truncate (h1, h2, h3, p com conteúdo de variável)
  // Não dá pra pegar perfeitamente, mas textos em containers sem min-w-0 são suspeitos

  // ═══ GRID/FLEX DESBALANCEADO ═══

  // grid-cols com colunas fixas acima de 7 = provavelmente vai quebrar em mobile
  // grid-cols-7 é padrão para calendários (dom-seg-ter-qua-qui-sex-sab)
  // Ignora breakpoints (sm:grid-cols-8 = OK, só vale pra telas maiores)
  {
    pattern: /(?<!\w:)\bgrid-cols-([8-9]|\d{2,})\b/,
    msg: 'grid-cols-8+ proibido em mobile — usar grid-cols-2/3/4 + responsive',
    severity: 'warning',
  },

  // grid-cols-3+ sem breakpoint responsivo = espremido em mobile
  // OK: "grid-cols-2 md:grid-cols-3", "sm:grid-cols-3"
  // RUIM: "grid-cols-3 gap-2" (sem md:/sm:/lg: antes)
  // Exceção: color pickers, botões de opção (contextual — usar lint-layout-ok)
  {
    pattern: /(?<!\w:)\bgrid-cols-([3-6])\b/,
    msg: 'grid-cols-3+ sem breakpoint — espremido em mobile. Usar grid-cols-2 md:grid-cols-N',
    severity: 'warning',
    // Só reporta se a mesma linha NÃO contém md:grid-cols ou sm:grid-cols ou lg:grid-cols
    extraCheck: (line) => !/\b(sm|md|lg|xl):grid-cols-/.test(line),
  },

  // ═══ FONTE MUITO PEQUENA ═══

  // text-[Npx] abaixo de 8px = ilegível em mobile
  {
    pattern: /\btext-\[([1-7])px\]/,
    msg: 'text-[<8px] ilegível em mobile — mínimo text-[9px] ou text-xs',
    severity: 'warning',
  },

  // ═══ BOTTOM-SHEET SEM SAFE-AREA ═══

  // rounded-t-* com pb-8/pb-10/pb-12 fixo = deveria usar safe-area-inset-bottom
  {
    pattern: /\brounded-t-.*\bpb-(8|10|12)\b|\bpb-(8|10|12)\b.*\brounded-t-/,
    msg: 'Bottom-sheet com pb fixo — usar paddingBottom: max(Nrem, env(safe-area-inset-bottom))',
    severity: 'error',
  },

  // ═══ Z-INDEX PERIGOSO ═══

  // z-[9999] ou z-[999] = z-index absurdo, pode cobrir tudo
  // z-[300-600] é padrão aceitável para modais/overlays/toasts
  {
    pattern: /\bz-\[(\d+)\]/,
    msg: 'z-index muito alto — usar z-[50-600] conforme hierarquia',
    minPxValue: 700,
    severity: 'warning',
  },
];

// ── Regras de ARQUIVO (analisam o componente inteiro) ─────────────────────────

const FILE_RULES = [
  // View com overflow-hidden no pai mas sem overflow-y-auto interno
  {
    id: 'missing-scroll',
    test: (content, relPath) => {
      // Só checa Views (não componentes pequenos)
      if (!relPath.includes('View') && !relPath.includes('Section') && !relPath.includes('Page')) return null;
      if (content.includes('lint-layout-ok')) return null;

      // Tab containers que renderizam children com scroll próprio — OK
      const isTabContainer = /activeTab|selectedTab|currentTab|activeHub/.test(content)
        && /\{.*===.*&&\s*<|switch\s*\(/.test(content);
      if (isTabContainer) return null;

      // Views que não precisam de scroll (scanner, mapa, carousel, onboarding)
      const isNoScrollView = /MapContainer|Html5Qrcode|Scanner|Carousel|onboarding/i.test(content);
      if (isNoScrollView) return null;

      // Login/Auth com form curto — flex layout centra sem scroll
      const isAuthView = /Login|Auth|Signup/i.test(relPath) && /flex.*items-center.*justify-center|flex-col.*items-center/.test(content);
      if (isAuthView) return null;

      const hasAbsoluteInset = /absolute\s+inset-0/.test(content);
      const hasOverflowYAuto = /overflow-y-auto/.test(content);
      const hasOverflowAuto = /overflow-auto/.test(content);
      const hasFlexColOverflow = /flex\s+flex-col\s+overflow-hidden/.test(content) || /flex-col.*overflow-hidden/.test(content);

      if (hasAbsoluteInset && !hasOverflowYAuto && !hasOverflowAuto) {
        return 'View fullscreen (absolute inset-0) sem overflow-y-auto — conteúdo pode ficar invisível';
      }
      if (hasFlexColOverflow && !hasOverflowYAuto && !hasOverflowAuto) {
        return 'Container flex-col overflow-hidden sem overflow-y-auto interno — scroll travado';
      }
      return null;
    },
    severity: 'warning',
  },
  // Componente com grid-cols mas sem gap
  {
    id: 'grid-no-gap',
    test: (content) => {
      const hasGrid = /\bgrid\b/.test(content) && /\bgrid-cols-/.test(content);
      const hasGap = /\bgap-/.test(content);
      if (hasGrid && !hasGap && !content.includes('lint-layout-ok')) {
        return 'Grid sem gap — itens vão ficar colados';
      }
      return null;
    },
    severity: 'warning',
  },
  // Bottom-sheet (items-end + rounded-t-) sem safe-area-inset-bottom nem <BottomSheet
  {
    id: 'bottomsheet-no-safearea',
    test: (content) => {
      if (content.includes('lint-layout-ok')) return null;
      // Detecta padrão bottom-sheet: items-end + rounded-t-
      const hasItemsEnd = /items-end/.test(content);
      const hasRoundedTop = /rounded-t-/.test(content);
      if (!hasItemsEnd || !hasRoundedTop) return null;
      // OK se já tem safe-area ou usa componente BottomSheet
      const hasSafeArea = /safe-area-inset-bottom/.test(content);
      const usesBottomSheet = /<BottomSheet/.test(content);
      if (hasSafeArea || usesBottomSheet) return null;
      return 'Bottom-sheet detectado (items-end + rounded-t-) sem safe-area-inset-bottom — usar <BottomSheet> ou style paddingBottom com env(safe-area-inset-bottom)';
    },
    severity: 'warning',
  },
  // Texto dinâmico ({variable}) dentro de container sem min-w-0 ou truncate
  {
    id: 'text-overflow',
    test: (content) => {
      // Busca padrões: <p ...>{algumaVariavel}</p> ou <span>{x.nome}</span>
      // onde o container pai não tem min-w-0 nem truncate
      const lines = content.split('\n');
      const issues = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Pula comentários e linhas com supressão
        if (/^\s*\/\//.test(line) || /lint-layout-ok/.test(line)) continue;
        // Detecta tags de texto com conteúdo dinâmico
        const textMatch = line.match(/<(h[1-6]|p)\s[^>]*>\s*\{[^}]*\.(nome|titulo|label|descricao|email|tituloEvento|contextNome)\b/);
        if (textMatch) {
          // Verifica contexto: 3 linhas antes + a própria linha
          const ctx = (lines[i - 3] || '') + (lines[i - 2] || '') + (lines[i - 1] || '') + line;
          // Se parent tem min-w-0, overflow-hidden, truncate, line-clamp, text-center, leading-relaxed, break-words = OK
          if (!/truncate|line-clamp|whitespace-nowrap|min-w-0|overflow-hidden|text-center|break-words|leading-relaxed/.test(ctx)) {
            const isSmallText = /text-\[(8|9|10)px\]|text-xs/.test(line);
            const field = textMatch[2];
            // Labels e descricoes pequenas são geralmente curtos
            if (isSmallText && (field === 'label' || field === 'descricao')) continue;
            // Textos em containers justify-between já são limitados pelo espaço flex
            if (/justify-between/.test(ctx)) continue;
            issues.push(`Linha ${i + 1}: texto dinâmico (${field}) sem truncate — pode estourar layout`);
          }
        }
      }
      return issues.length > 0 ? issues.join('; ') : null;
    },
    severity: 'warning',
  },
];

// Linhas com qualquer desses padrões são automaticamente isentas
const LINE_EXCEPTIONS = [
  /lint-layout-ok/,     // supressão explícita
  /shrink-0/,           // avatar/ícone fixo com shrink-0 é OK
  /\/\/.*proibido/,     // referência ao lint em comentário
  /^\s*\*/,             // continuação de bloco de comentário JSDoc
  /^\s*\{\/\*/,         // abertura de comentário JSX
  /viewBox/,            // SVG viewBox usa px mas é viewport interno
  /\bw-full\b.*\bmax-w-\[/, // w-full + max-w-[Npx] é padrão OK
  /\bmax-w-\[.*\bw-full\b/, // ordem inversa
  /\bmax-w-\[\d+px\].*\btext-center\b/, // max-w-[Npx] + text-center = texto limitado
  /\btext-center\b.*\bmax-w-\[\d+px\]/, // ordem inversa
  /\bmx-auto\b.*\bmax-w-\[/, // mx-auto + max-w-[Npx] = centrado com limite
  /\bmax-w-\[.*\bmx-auto\b/, // ordem inversa
  /\baspect-/, // aspect-ratio com dimensão fixa = proporcional, OK
  /\brounded-full\b.*\bw-\[/, // circle avatar com w-[Npx] = OK
  /\bw-\[.*\brounded-full\b/, // ordem inversa
  /\btruncate\b.*\bmax-w-\[/, // truncate + max-w-[Npx] = texto limitado, OK
  /\bmax-w-\[.*\btruncate\b/, // ordem inversa
  /\bline-clamp.*\bmax-w-\[/, // line-clamp + max-w-[Npx] = OK
  /\bmax-w-\[.*\bline-clamp/, // ordem inversa
  /\bleading-relaxed\b.*\bmax-w-\[/, // texto descritivo com max-w limitado = OK
  /\bmax-w-\[.*\bleading-relaxed\b/, // ordem inversa
  /\bh-\[.*\b(bg-|border|rounded)/, // decorativo (barras, separadores)
  /style=\{/, // inline styles (geralmente calculados)
  /translate|transform|rotate/, // transformações CSS
  /\bmax-h-\[/, // max-h com px geralmente é pro scroll funcionar
  /\bmin-w-0\b/, // min-w-0 no container = texto já é contido
  /\bline-clamp/, // line-clamp presente = texto já é contido
];

// ── Scanner ───────────────────────────────────────────────────────────────────

function walkDir(dir) {
  const results = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return results; }
  for (const entry of entries) {
    if (entry === 'node_modules' || entry === 'PREVANTABACKUP' || entry === '.git' || entry === 'dist') continue;
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

function checkFile(filePath) {
  const violations = [];
  const relPath = relative(ROOT, filePath);
  const fileName = filePath.split('/').pop() || '';
  const isWhitelisted = FILE_WHITELIST.includes(fileName);
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Regras por linha
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Pula linhas isentas (checa linha atual + linha anterior/posterior para comentários JSX)
    const prevLine = i > 0 ? lines[i - 1] : '';
    const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
    if (LINE_EXCEPTIONS.some(ex => ex.test(line) || ex.test(prevLine) || ex.test(nextLine))) continue;

    // Pula linhas que são puramente comentário JS
    if (/^\s*\/\//.test(line)) continue;

    for (const rule of RULES) {
      // Whitelist de arquivo (App.tsx, standalone)
      if (rule.allowWhitelist && isWhitelisted) continue;

      const match = line.match(rule.pattern);
      if (!match) continue;

      // Se a regra tem minPxValue, checa o valor capturado
      if (rule.minPxValue !== undefined && match[1]) {
        const px = parseInt(match[1], 10);
        if (px < rule.minPxValue) continue;
      }

      // Se a regra tem extraCheck, só reporta se a função retornar true
      if (rule.extraCheck && !rule.extraCheck(line)) continue;

      violations.push({
        file: relPath,
        line: i + 1,
        text: line.trim().slice(0, 120),
        msg: rule.msg,
        severity: rule.severity || 'error',
      });
    }
  }

  // Regras de arquivo inteiro
  for (const fileRule of FILE_RULES) {
    const result = fileRule.test(content, relPath);
    if (result) {
      violations.push({
        file: relPath,
        line: 0,
        text: '',
        msg: result,
        severity: fileRule.severity || 'warning',
      });
    }
  }

  return violations;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const allFiles = [];
for (const dir of SCAN_DIRS) {
  const fullDir = join(ROOT, dir);
  try { statSync(fullDir); allFiles.push(...walkDir(fullDir)); } catch { /* */ }
}

// Root .tsx (App.tsx etc)
try {
  const rootFiles = readdirSync(ROOT)
    .filter(f => EXTENSIONS.some(ext => f.endsWith(ext)))
    .map(f => join(ROOT, f));
  allFiles.push(...rootFiles);
} catch { /* */ }

const allViolations = [];
for (const file of allFiles) {
  allViolations.push(...checkFile(file));
}

const errors = allViolations.filter(v => v.severity === 'error');
const warnings = allViolations.filter(v => v.severity === 'warning');

if (allViolations.length === 0) {
  console.log('\x1b[32m✓ lint:layout — 0 violações. Padrão VANTA OK.\x1b[0m');
  process.exit(0);
} else {
  if (errors.length > 0) {
    console.error(`\x1b[31m✗ ${errors.length} erro(s) de layout:\x1b[0m\n`);
    for (const v of errors) {
      console.error(`  \x1b[31m✗\x1b[0m \x1b[33m${v.file}${v.line ? ':' + v.line : ''}\x1b[0m — ${v.msg}`);
      if (v.text) console.error(`    ${v.text}\n`);
    }
  }
  if (warnings.length > 0) {
    console.error(`\x1b[33m⚠ ${warnings.length} aviso(s) de layout:\x1b[0m\n`);
    for (const v of warnings) {
      console.error(`  \x1b[33m⚠\x1b[0m \x1b[90m${v.file}${v.line ? ':' + v.line : ''}\x1b[0m — ${v.msg}`);
      if (v.text) console.error(`    ${v.text}\n`);
    }
  }
  console.error('\x1b[90mPara suprimir falso-positivo, adicionar "lint-layout-ok" na linha.\x1b[0m');
  // Só falha (exit 1) se tiver erros, não warnings
  process.exit(errors.length > 0 ? 1 : 0);
}
