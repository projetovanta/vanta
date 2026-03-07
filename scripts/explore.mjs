#!/usr/bin/env node
/**
 * explore.mjs — Mapeia um módulo/diretório e retorna resumo compacto.
 *
 * Uso: npm run explore -- modules/profile
 *      npm run explore -- services/messagesService.ts
 *      npm run explore -- hooks/useUserData.ts
 *
 * Output: lista de arquivos, interfaces, tipos, funções exportadas,
 *         props de componentes React, imports internos do projeto.
 *         Tudo em texto compacto pra colar no contexto do Claude.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const target = process.argv[2];
if (!target) {
  console.error('Uso: npm run explore -- <path>');
  console.error('  Ex: npm run explore -- modules/profile');
  console.error('  Ex: npm run explore -- services/messagesService.ts');
  process.exit(1);
}

const ROOT = process.cwd();
const fullPath = join(ROOT, target);

// ── Coletar arquivos TS/TSX ────────────────────────────────────────────────

function collectFiles(dir) {
  const files = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return files;
  }
  for (const entry of entries) {
    if (entry === 'node_modules' || entry === 'dist' || entry === '.git') continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...collectFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith('.d.ts')) {
      files.push(full);
    }
  }
  return files;
}

let files;
try {
  const stat = statSync(fullPath);
  if (stat.isDirectory()) {
    files = collectFiles(fullPath);
  } else {
    files = [fullPath];
  }
} catch {
  console.error(`Caminho não encontrado: ${target}`);
  process.exit(1);
}

if (files.length === 0) {
  console.error(`Nenhum arquivo .ts/.tsx em: ${target}`);
  process.exit(1);
}

// ── Analisar cada arquivo ──────────────────────────────────────────────────

const output = [];

for (const file of files) {
  const rel = relative(ROOT, file);
  const content = readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  const lineCount = lines.length;
  const ext = extname(file);

  const section = { path: rel, lines: lineCount, exports: [], imports: [], props: [] };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const ln = i + 1;

    // Exports: interfaces, types, const, function, class
    const exportMatch = line.match(
      /^export\s+(?:default\s+)?(?:const|let|function|class|interface|type|enum)\s+(\w+)/
    );
    if (exportMatch) {
      const name = exportMatch[1];
      // Detectar tipo do export
      if (/\binterface\b/.test(line)) {
        // Capturar campos da interface (próximas linhas até })
        const fields = [];
        for (let j = i + 1; j < lines.length && j < i + 40; j++) {
          if (lines[j].match(/^\}/)) break;
          const fieldMatch = lines[j].match(/^\s+(\w+)(\??):\s*(.+?);?\s*$/);
          if (fieldMatch) {
            fields.push(`${fieldMatch[1]}${fieldMatch[2]}: ${fieldMatch[3].replace(/;$/, '').trim()}`);
          }
        }
        section.exports.push({ name, kind: 'interface', ln, fields });
      } else if (/\btype\b/.test(line)) {
        // Capturar definição do type (mesma linha ou multi-linha)
        let def = line.replace(/^export\s+(default\s+)?type\s+\w+\s*=\s*/, '').replace(/;$/, '').trim();
        if (!def || def === '') {
          // Multi-line
          const nextLines = [];
          for (let j = i + 1; j < lines.length && j < i + 10; j++) {
            nextLines.push(lines[j].trim());
            if (lines[j].includes(';')) break;
          }
          def = nextLines.join(' ').replace(/;$/, '').trim();
        }
        section.exports.push({ name, kind: 'type', ln, def });
      } else if (/\bfunction\b/.test(line) || /\bconst\b.*=>/.test(line) || /\bconst\b.*=\s*(async\s+)?\(/.test(line)) {
        // Funções e arrow functions
        let sig = line.replace(/^export\s+(default\s+)?/, '').trim();
        // Truncar body
        const bodyIdx = sig.indexOf('{');
        if (bodyIdx > 0) sig = sig.substring(0, bodyIdx).trim();
        const arrowIdx = sig.indexOf('=>');
        if (arrowIdx > 0) sig = sig.substring(0, arrowIdx).trim();
        section.exports.push({ name, kind: 'function', ln, sig });
      } else if (/\bclass\b/.test(line)) {
        section.exports.push({ name, kind: 'class', ln });
      } else if (/\benum\b/.test(line)) {
        section.exports.push({ name, kind: 'enum', ln });
      } else {
        // const genérico (objeto, array, etc.)
        section.exports.push({ name, kind: 'const', ln });
      }
    }

    // Props de componentes React: interface XxxProps { ... }
    const propsMatch = line.match(/^(?:export\s+)?interface\s+(\w+Props)\s*\{/);
    if (propsMatch) {
      const propsName = propsMatch[1];
      const fields = [];
      for (let j = i + 1; j < lines.length && j < i + 30; j++) {
        if (lines[j].match(/^\}/)) break;
        const fieldMatch = lines[j].match(/^\s+(\w+)(\??):\s*(.+?);?\s*$/);
        if (fieldMatch) {
          fields.push(`${fieldMatch[1]}${fieldMatch[2]}: ${fieldMatch[3].replace(/;$/, '').trim()}`);
        }
      }
      section.props.push({ name: propsName, fields });
    }

    // Imports internos (não node_modules)
    const importMatch = line.match(/^import\s+.*from\s+['"](\.\.?\/.+?)['"]/);
    if (importMatch) {
      section.imports.push(importMatch[1]);
    }
  }

  output.push(section);
}

// ── Formatar output ────────────────────────────────────────────────────────

console.log(`\n══ EXPLORE: ${target} ══\n`);
console.log(`Arquivos: ${output.length}`);
console.log(`Total linhas: ${output.reduce((a, s) => a + s.lines, 0)}\n`);

for (const section of output) {
  console.log(`── ${section.path} (${section.lines}L) ──`);

  if (section.imports.length > 0) {
    console.log(`  imports: ${section.imports.join(', ')}`);
  }

  for (const exp of section.exports) {
    if (exp.kind === 'interface' && exp.fields?.length > 0) {
      console.log(`  [${exp.kind}] ${exp.name} :${exp.ln}`);
      for (const f of exp.fields) {
        console.log(`    ${f}`);
      }
    } else if (exp.kind === 'type' && exp.def) {
      console.log(`  [${exp.kind}] ${exp.name} = ${exp.def} :${exp.ln}`);
    } else if (exp.kind === 'function' && exp.sig) {
      console.log(`  [${exp.kind}] ${exp.sig} :${exp.ln}`);
    } else {
      console.log(`  [${exp.kind}] ${exp.name} :${exp.ln}`);
    }
  }

  for (const prop of section.props) {
    if (section.exports.some(e => e.name === prop.name)) continue; // já impresso
    console.log(`  [props] ${prop.name}`);
    for (const f of prop.fields) {
      console.log(`    ${f}`);
    }
  }

  console.log('');
}
