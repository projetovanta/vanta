#!/usr/bin/env node
/**
 * memory-audit — verifica se as memórias estão atualizadas.
 *
 * Para cada memória .md:
 *   1. Extrai paths de arquivos referenciados (pattern: `arquivo.tsx`, `path/to/file.ts`)
 *   2. Verifica se o arquivo existe no disco
 *   3. Reporta: arquivos ausentes, memórias sem referências, memórias vazias
 *
 * Uso: npm run memory-audit
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'fs';
import { join, resolve } from 'path';

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

// ── Padrões para extrair referências a arquivos ──
const FILE_PATTERNS = [
  // `path/to/file.tsx` ou `path/to/file.ts` em backticks
  /`([a-zA-Z0-9_/.-]+\.(?:tsx?|jsx?|mjs|sql|json|md))`/g,
  // | `path/to/file.tsx` | em tabelas markdown
  /\|\s*`([a-zA-Z0-9_/.-]+\.(?:tsx?|jsx?|mjs|sql|json))`\s*\|/g,
];

function extractFileRefs(content) {
  const refs = new Set();
  for (const pattern of FILE_PATTERNS) {
    let match;
    const re = new RegExp(pattern.source, pattern.flags);
    while ((match = re.exec(content)) !== null) {
      const ref = match[1];
      // Ignorar padrões genéricos/exemplos
      if (ref.startsWith('*.') || ref.includes('*')) continue;
      // Ignorar nomes muito curtos (labels, não paths)
      if (!ref.includes('/') && !ref.includes('.ts') && !ref.includes('.tsx')) continue;
      refs.add(ref);
    }
  }
  return [...refs];
}

// Cache de todos os arquivos do projeto (para busca por nome)
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
  // 1. Tenta resolver relativo ao projeto (path completo)
  const candidates = [
    join(PROJECT_DIR, ref),
    join(PROJECT_DIR, 'src', ref),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }

  // 2. Busca por nome do arquivo em qualquer lugar do projeto
  const fileName = ref.split('/').pop();
  const allFiles = getAllFiles(PROJECT_DIR);
  const matches = allFiles.filter(f => f.endsWith('/' + fileName) || f === fileName);
  if (matches.length > 0) return join(PROJECT_DIR, matches[0]);

  return null;
}

// ── Main ──
const files = readdirSync(MEMORY_DIR).filter(f => f.endsWith('.md')).sort();
let totalMemories = 0;
let totalRefs = 0;
let totalMissing = 0;
let totalEmpty = 0;
const issues = [];

console.log(`\n${B}══ MEMORY AUDIT ══${X}\n`);
console.log(`${D}Diretório: ${MEMORY_DIR}${X}`);
console.log(`${D}Projeto: ${PROJECT_DIR}${X}\n`);

for (const file of files) {
  totalMemories++;
  const filePath = join(MEMORY_DIR, file);
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').length;

  if (lines <= 3 || content.trim().length < 50) {
    totalEmpty++;
    issues.push({ file, type: 'EMPTY', message: `Apenas ${lines} linhas` });
    continue;
  }

  const refs = extractFileRefs(content);
  if (refs.length === 0) {
    // Mapas e MEMORY.md não precisam de refs diretas
    if (!file.startsWith('mapa_') && file !== 'MEMORY.md' && file !== 'regras_usuario.md') {
      issues.push({ file, type: 'NO_REFS', message: 'Sem referências a arquivos do projeto' });
    }
    continue;
  }

  const missing = [];
  for (const ref of refs) {
    totalRefs++;
    const resolved = resolveRef(ref);
    if (!resolved) {
      // Ignorar referências a memórias (memory/*.md)
      if (ref.startsWith('memory/')) continue;
      // Ignorar referências a migrations que podem estar só no Supabase
      if (ref.includes('migration')) continue;
      missing.push(ref);
      totalMissing++;
    }
  }

  if (missing.length > 0) {
    issues.push({
      file,
      type: 'MISSING_FILES',
      message: `${missing.length} arquivo(s) não encontrado(s)`,
      details: missing,
    });
  }
}

// ── Report ──
if (issues.length === 0) {
  console.log(`${G}${B}✓ Todas as ${totalMemories} memórias estão OK${X}`);
  console.log(`${D}  ${totalRefs} referências verificadas, 0 problemas${X}\n`);
} else {
  // Agrupar por tipo
  const byType = {};
  for (const issue of issues) {
    if (!byType[issue.type]) byType[issue.type] = [];
    byType[issue.type].push(issue);
  }

  if (byType.MISSING_FILES) {
    console.log(`${R}${B}✗ Arquivos referenciados não encontrados:${X}`);
    for (const issue of byType.MISSING_FILES) {
      console.log(`  ${Y}${issue.file}${X} — ${issue.message}`);
      for (const d of issue.details) {
        console.log(`    ${R}✗${X} ${D}${d}${X}`);
      }
    }
    console.log();
  }

  if (byType.EMPTY) {
    console.log(`${Y}${B}⚠ Memórias vazias/mínimas:${X}`);
    for (const issue of byType.EMPTY) {
      console.log(`  ${Y}${issue.file}${X} — ${issue.message}`);
    }
    console.log();
  }

  if (byType.NO_REFS) {
    console.log(`${C}ℹ Memórias sem referências a arquivos:${X}`);
    for (const issue of byType.NO_REFS) {
      console.log(`  ${D}${issue.file}${X}`);
    }
    console.log();
  }

  console.log(`${B}Resumo:${X} ${totalMemories} memórias, ${totalRefs} refs, ${R}${totalMissing} ausentes${X}, ${Y}${totalEmpty} vazias${X}\n`);
}
