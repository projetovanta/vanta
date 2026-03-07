#!/usr/bin/env bash
# bundle-audit.sh — Auditoria de Performance & Bundle (Vanta)
# Analisa: tamanho do build, assets pesados, dependências grandes, tree-shaking

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

REPORT_DIR="audit-reports"
mkdir -p "$REPORT_DIR"

WARNINGS=0

echo -e "\n${BOLD}${CYAN}══════════════════════════════════════════${NC}"
echo -e "${BOLD}${CYAN}   ⚡ VANTA BUNDLE & PERFORMANCE AUDIT${NC}"
echo -e "${BOLD}${CYAN}══════════════════════════════════════════${NC}\n"

# ─── 1. Build Size Analysis ───
echo -e "${BOLD}[1/5] Vite Build — Gerando bundle de produção...${NC}"
npm run build 2>&1 | tail -30 > "$REPORT_DIR/build-output.txt"

if [ -d "dist" ]; then
  TOTAL_SIZE=$(du -sh dist | cut -f1)
  JS_SIZE=$(find dist -name '*.js' -exec du -ch {} + 2>/dev/null | tail -1 | cut -f1)
  CSS_SIZE=$(find dist -name '*.css' -exec du -ch {} + 2>/dev/null | tail -1 | cut -f1)
  ASSET_SIZE=$(find dist/assets -type f ! -name '*.js' ! -name '*.css' -exec du -ch {} + 2>/dev/null | tail -1 | cut -f1 || echo "0K")

  echo -e "  ${CYAN}Total:${NC} $TOTAL_SIZE"
  echo -e "  ${CYAN}JS:${NC}    $JS_SIZE"
  echo -e "  ${CYAN}CSS:${NC}   $CSS_SIZE"
  echo -e "  ${CYAN}Assets:${NC} $ASSET_SIZE"

  # Checar se bundle JS > 2MB (ruim para mobile)
  JS_BYTES=$(find dist -name '*.js' -exec du -c {} + 2>/dev/null | tail -1 | awk '{print $1}')
  if [ "${JS_BYTES:-0}" -gt 2048 ]; then
    echo -e "  ${YELLOW}⚠ Bundle JS > 2MB — impacto em mobile 3G/4G${NC}"
    WARNINGS=$((WARNINGS + 1))
  else
    echo -e "  ${GREEN}✓ Bundle JS dentro do limite (<2MB)${NC}"
  fi
else
  echo -e "  ${RED}✗ Build falhou — sem diretório dist/${NC}"
fi

# ─── 2. Largest JS Chunks ───
echo -e "\n${BOLD}[2/5] Maiores chunks JS (top 10)...${NC}"
if [ -d "dist" ]; then
  find dist -name '*.js' -exec du -k {} + | sort -rn | head -10 | while read size file; do
    if [ "$size" -gt 500 ]; then
      echo -e "  ${YELLOW}⚠ ${size}KB${NC} — $(basename "$file")"
    else
      echo -e "  ${GREEN}  ${size}KB${NC} — $(basename "$file")"
    fi
  done
  find dist -name '*.js' -exec du -k {} + | sort -rn | head -10 > "$REPORT_DIR/largest-chunks.txt"
fi

# ─── 3. Heavy Dependencies ───
echo -e "\n${BOLD}[3/5] Dependências pesadas (node_modules)...${NC}"
HEAVY_DEPS=$(du -sk node_modules/*/ 2>/dev/null | sort -rn | head -15)
echo "$HEAVY_DEPS" | while read size dir; do
  name=$(basename "$dir")
  sizeMB=$((size / 1024))
  if [ "$sizeMB" -gt 10 ]; then
    echo -e "  ${YELLOW}⚠ ${sizeMB}MB${NC} — $name"
  elif [ "$sizeMB" -gt 5 ]; then
    echo -e "  ${CYAN}  ${sizeMB}MB${NC} — $name"
  fi
done
echo "$HEAVY_DEPS" > "$REPORT_DIR/heavy-deps.txt"

# ─── 4. Large Static Assets ───
echo -e "\n${BOLD}[4/5] Assets estáticos grandes (>100KB)...${NC}"
LARGE_ASSETS=$(find public src modules features -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' -o -name '*.gif' -o -name '*.svg' -o -name '*.webp' -o -name '*.mp4' -o -name '*.woff2' -o -name '*.ttf' \) -size +100k 2>/dev/null || true)
if [ -n "$LARGE_ASSETS" ]; then
  echo "$LARGE_ASSETS" | while read file; do
    SIZE=$(du -h "$file" | cut -f1)
    echo -e "  ${YELLOW}⚠ $SIZE${NC} — $file"
  done
  ASSET_COUNT=$(echo "$LARGE_ASSETS" | wc -l | tr -d ' ')
  echo -e "  ${YELLOW}Total: $ASSET_COUNT assets > 100KB${NC}"
  echo "$LARGE_ASSETS" > "$REPORT_DIR/large-assets.txt"
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "  ${GREEN}✓ Nenhum asset > 100KB encontrado${NC}"
fi

# ─── 5. Import Cost Estimate ───
echo -e "\n${BOLD}[5/5] Imports pesados no código...${NC}"
HEAVY_IMPORTS=$(grep -rn --include='*.ts' --include='*.tsx' \
  -E "import .+ from ['\"](@supabase|firebase|recharts|xlsx|jspdf|leaflet|react-leaflet)" \
  src/ modules/ features/ 2>/dev/null | head -20 || true)
if [ -n "$HEAVY_IMPORTS" ]; then
  echo -e "  ${CYAN}Bibliotecas pesadas importadas:${NC}"
  echo "$HEAVY_IMPORTS" | sed 's/^/    /' | head -15
  echo "$HEAVY_IMPORTS" > "$REPORT_DIR/heavy-imports.txt"
else
  echo -e "  ${GREEN}✓ Sem imports de libs excessivamente pesadas${NC}"
fi

# ─── Summary ───
echo -e "\n${BOLD}${CYAN}──────────────────────────────────────────${NC}"
echo -e "${BOLD}  RESUMO PERFORMANCE & BUNDLE${NC}"
echo -e "${CYAN}──────────────────────────────────────────${NC}"
if [ -d "dist" ]; then
  echo -e "  Bundle total: ${BOLD}$TOTAL_SIZE${NC}"
fi
if [ $WARNINGS -eq 0 ]; then
  echo -e "  ${GREEN}${BOLD}✓ Performance OK${NC}"
else
  echo -e "  ${YELLOW}${BOLD}⚠ $WARNINGS pontos de atenção${NC}"
fi
echo -e "  Relatórios em: ${CYAN}$REPORT_DIR/${NC}\n"
