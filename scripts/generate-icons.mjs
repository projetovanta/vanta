#!/usr/bin/env node

/**
 * Gera ícones em múltiplos tamanhos a partir do icon-512.png
 * Usa canvas nativo do Node.js (requer sharp ou canvas)
 *
 * Alternativa simples: usar sips (macOS built-in)
 *
 * Uso: node scripts/generate-icons.mjs
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

const SOURCE = resolve('public/icon-512.png');
const OUTPUT_DIR = resolve('public');

if (!existsSync(SOURCE)) {
  console.error('❌ Arquivo fonte não encontrado:', SOURCE);
  process.exit(1);
}

// Tamanhos necessários para lojas
const sizes = [48, 72, 96, 144, 1024];

console.log('🎨 Gerando ícones a partir de icon-512.png...\n');

for (const size of sizes) {
  const output = resolve(OUTPUT_DIR, `icon-${size}.png`);

  if (existsSync(output)) {
    console.log(`  ⏭️  icon-${size}.png já existe, pulando`);
    continue;
  }

  try {
    // macOS: usar sips (built-in, sem dependências extras)
    execSync(
      `sips -z ${size} ${size} "${SOURCE}" --out "${output}" 2>/dev/null`,
      { stdio: 'pipe' }
    );
    console.log(`  ✅ icon-${size}.png (${size}x${size})`);
  } catch {
    console.error(`  ❌ Falha ao gerar icon-${size}.png`);
  }
}

console.log('\n✅ Ícones gerados em public/');
console.log('\n📋 Próximo passo: atualizar manifest.json com os novos tamanhos');
