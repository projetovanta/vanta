#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════
# full-audit.sh — VANTA AUDIT MASTER SCRIPT
# Executa em paralelo: Security, Quality, Dead Code, Bundle, Store Readiness
# ══════════════════════════════════════════════════════════════

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'
BOLD='\033[1m'

REPORT_DIR="audit-reports"
mkdir -p "$REPORT_DIR"

STARTED_AT=$(date '+%Y-%m-%d %H:%M:%S')

echo -e "\n${BOLD}${MAGENTA}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${MAGENTA}║          🛡️  VANTA FULL AUDIT SYSTEM            ║${NC}"
echo -e "${BOLD}${MAGENTA}║          iOS • Android • Web                     ║${NC}"
echo -e "${BOLD}${MAGENTA}╚══════════════════════════════════════════════════╝${NC}"
echo -e "${CYAN}  Iniciado: $STARTED_AT${NC}\n"

# ─── Run parallel audits ───
echo -e "${BOLD}Executando auditorias em paralelo...${NC}\n"

# Create temp files for outputs
SEC_OUT="$REPORT_DIR/.sec_output"
QUAL_OUT="$REPORT_DIR/.qual_output"
DEAD_OUT="$REPORT_DIR/.dead_output"
BUNDLE_OUT="$REPORT_DIR/.bundle_output"
STORE_OUT="$REPORT_DIR/.store_output"
BRIDGE_OUT="$REPORT_DIR/.bridge_output"
CAPSYNC_OUT="$REPORT_DIR/.capsync_output"
PRIVACY_OUT="$REPORT_DIR/.privacy_output"
DESIGN_OUT="$REPORT_DIR/.design_output"

# Security Scan (background)
(bash scripts/security-scan.sh > "$SEC_OUT" 2>&1; echo $? > "$REPORT_DIR/.sec_exit") &
SEC_PID=$!

# Quality (TSC + ESLint + Prettier — sequential within group)
(
  echo -e "${BOLD}${CYAN}══════════════════════════════════════════${NC}"
  echo -e "${BOLD}${CYAN}   📐 QUALITY AUDIT (TSC + ESLint + Prettier)${NC}"
  echo -e "${BOLD}${CYAN}══════════════════════════════════════════${NC}\n"

  QUAL_ERRORS=0

  # TSC
  echo -e "${BOLD}[1/3] TypeScript — npx tsc --noEmit...${NC}"
  TSC_OUTPUT=$(NODE_OPTIONS="--max-old-space-size=4096" npx tsc --noEmit 2>&1 || true)
  # Detect OOM crash
  if echo "$TSC_OUTPUT" | grep -q "heap out of memory\|FATAL ERROR"; then
    echo -e "  ${RED}✗ TSC crashou por falta de memória (OOM)${NC}"
    TSC_ERRS=0
    QUAL_ERRORS=$((QUAL_ERRORS + 1))
  else
    TSC_ERRS=$(echo "$TSC_OUTPUT" | grep -c "error TS" 2>/dev/null || echo "0")
    TSC_ERRS=${TSC_ERRS:-0}
  fi
  if [ "$TSC_ERRS" -eq 0 ] 2>/dev/null; then
    echo -e "  ${GREEN}✓ 0 erros TypeScript${NC}"
  else
    echo -e "  ${RED}✗ $TSC_ERRS erros TypeScript${NC}"
    echo "$TSC_OUTPUT" | grep "error TS" | head -20
    QUAL_ERRORS=$((QUAL_ERRORS + 1))
  fi

  # ESLint (only clean code rules)
  echo -e "\n${BOLD}[2/3] ESLint — Regras de Clean Code...${NC}"
  ESLINT_OUTPUT=$(npx eslint src/ modules/ features/ hooks/ services/ --quiet 2>&1 || true)
  ESLINT_WARNS=$(echo "$ESLINT_OUTPUT" | grep -c "warning" 2>/dev/null || echo "0")
  ESLINT_ERRS=$(echo "$ESLINT_OUTPUT" | grep -c " error " 2>/dev/null || echo "0")

  # Complexity violations
  COMPLEXITY_WARNS=$(echo "$ESLINT_OUTPUT" | grep -c "complexity" 2>/dev/null || echo "0")
  MAX_LINES_WARNS=$(echo "$ESLINT_OUTPUT" | grep -c "max-lines" 2>/dev/null || echo "0")
  MAX_DEPTH_WARNS=$(echo "$ESLINT_OUTPUT" | grep -c "max-depth" 2>/dev/null || echo "0")
  CONSOLE_WARNS=$(echo "$ESLINT_OUTPUT" | grep -c "no-console" 2>/dev/null || echo "0")

  echo -e "  ${CYAN}Complexidade alta:${NC}     $COMPLEXITY_WARNS"
  echo -e "  ${CYAN}Funções longas:${NC}        $MAX_LINES_WARNS"
  echo -e "  ${CYAN}Nesting profundo:${NC}      $MAX_DEPTH_WARNS"
  echo -e "  ${CYAN}console.log:${NC}           $CONSOLE_WARNS"
  echo -e "  ${CYAN}Total warnings:${NC}        $ESLINT_WARNS"
  echo -e "  ${CYAN}Total errors:${NC}          $ESLINT_ERRS"

  if [ "$ESLINT_ERRS" -gt 0 ]; then
    QUAL_ERRORS=$((QUAL_ERRORS + 1))
  fi

  echo "$ESLINT_OUTPUT" > "$REPORT_DIR/eslint-report.txt"

  # Prettier
  echo -e "\n${BOLD}[3/3] Prettier — Formatação...${NC}"
  PRETTIER_OUTPUT=$(npx prettier --check 'src/**/*.{ts,tsx}' 'modules/**/*.{ts,tsx}' 'features/**/*.{ts,tsx}' 'hooks/**/*.{ts,tsx}' 'services/**/*.{ts,tsx}' 2>&1 || true)
  UNFORMATTED=$(echo "$PRETTIER_OUTPUT" | grep -c "would reformat" 2>/dev/null || echo "0")
  if [ "$UNFORMATTED" -eq 0 ]; then
    echo -e "  ${GREEN}✓ Todos os arquivos formatados${NC}"
  else
    echo -e "  ${YELLOW}⚠ $UNFORMATTED arquivos precisam de formatação${NC}"
  fi

  echo -e "\n${BOLD}${CYAN}──────────────────────────────────────────${NC}"
  echo -e "${BOLD}  RESUMO QUALIDADE${NC}"
  echo -e "${CYAN}──────────────────────────────────────────${NC}"
  echo -e "  TSC: ${TSC_ERRS} erros | ESLint: ${ESLINT_ERRS} erros, ${ESLINT_WARNS} warnings | Prettier: ${UNFORMATTED} unformatted"
  if [ $QUAL_ERRORS -eq 0 ]; then
    echo -e "  ${GREEN}${BOLD}✓ Qualidade OK${NC}"
  else
    echo -e "  ${RED}${BOLD}✗ $QUAL_ERRORS categorias com erros${NC}"
  fi
  echo ""
) > "$QUAL_OUT" 2>&1 &
QUAL_PID=$!

# Dead Code (knip)
(
  echo -e "${BOLD}${CYAN}══════════════════════════════════════════${NC}"
  echo -e "${BOLD}${CYAN}   🧹 DEAD CODE ANALYSIS (knip)${NC}"
  echo -e "${BOLD}${CYAN}══════════════════════════════════════════${NC}\n"

  KNIP_OUTPUT=$(npx knip --no-exit-code 2>&1 || true)
  UNUSED_FILES=$(echo "$KNIP_OUTPUT" | grep -c "Unused files" 2>/dev/null || echo "0")
  UNUSED_EXPORTS=$(echo "$KNIP_OUTPUT" | grep -c "Unused exports" 2>/dev/null || echo "0")
  UNUSED_DEPS=$(echo "$KNIP_OUTPUT" | grep -c "Unused dependencies" 2>/dev/null || echo "0")

  echo "$KNIP_OUTPUT" | head -80
  echo ""
  echo "$KNIP_OUTPUT" > "$REPORT_DIR/knip-report.txt"
) > "$DEAD_OUT" 2>&1 &
DEAD_PID=$!

# Store Readiness (background)
(bash scripts/store-readiness.sh > "$STORE_OUT" 2>&1; echo $? > "$REPORT_DIR/.store_exit") &
STORE_PID=$!

# Capacitor Bridge Audit (background)
(bash scripts/capacitor-bridge-audit.sh > "$BRIDGE_OUT" 2>&1) &
BRIDGE_PID=$!

# App Privacy Audit (background)
(bash scripts/app-privacy-audit.sh > "$PRIVACY_OUT" 2>&1) &
PRIVACY_PID=$!

# Design & UI/UX Audit (background)
(bash scripts/design-audit.sh > "$DESIGN_OUT" 2>&1) &
DESIGN_PID=$!

# Capacitor Sync — delayed (needs dist/ from build, started after bundle-audit)
cap_sync_fn() {
  echo -e "${BOLD}${CYAN}══════════════════════════════════════════${NC}"
  echo -e "${BOLD}${CYAN}   📲 CAPACITOR SYNC (Native Linkage)${NC}"
  echo -e "${BOLD}${CYAN}══════════════════════════════════════════${NC}\n"

  if [ ! -f "dist/index.html" ]; then
    echo -e "${BOLD}Building dist/ for cap sync...${NC}"
    npm run build > /dev/null 2>&1 || true
  fi

  echo -e "${BOLD}Executando npx cap sync...${NC}"
  SYNC_OUTPUT=$(npx cap sync 2>&1 || true)
  SYNC_EXIT=$?

  # Checar erros
  SYNC_ERRORS=$(echo "$SYNC_OUTPUT" | grep -ci "error\|failed\|cannot" 2>/dev/null || echo "0")
  SYNC_WARNS=$(echo "$SYNC_OUTPUT" | grep -ci "warn" 2>/dev/null || echo "0")

  echo "$SYNC_OUTPUT" | tail -30
  echo ""

  echo -e "${BOLD}${CYAN}──────────────────────────────────────────${NC}"
  echo -e "${BOLD}  RESUMO CAP SYNC${NC}"
  echo -e "${CYAN}──────────────────────────────────────────${NC}"
  if [ "$SYNC_ERRORS" -eq 0 ] 2>/dev/null; then
    echo -e "  ${GREEN}${BOLD}✓ Sync OK — iOS e Android vinculados${NC}"
  else
    echo -e "  ${RED}${BOLD}✗ Erros no sync — verificar output acima${NC}"
  fi
  echo ""
}

# Wait for security to finish, then run bundle (needs build which is heavy)
wait $SEC_PID 2>/dev/null || true
(bash scripts/bundle-audit.sh > "$BUNDLE_OUT" 2>&1) &
BUNDLE_PID=$!

# Cap Sync — starts after bundle build (needs dist/)
(cap_sync_fn) > "$CAPSYNC_OUT" 2>&1 &
CAPSYNC_PID=$!

# Wait for all
echo -e "  ${CYAN}⏳ Aguardando conclusão de todas as auditorias...${NC}\n"
wait $QUAL_PID 2>/dev/null || true
wait $DEAD_PID 2>/dev/null || true
wait $STORE_PID 2>/dev/null || true
wait $BUNDLE_PID 2>/dev/null || true
wait $BRIDGE_PID 2>/dev/null || true
wait $PRIVACY_PID 2>/dev/null || true
wait $CAPSYNC_PID 2>/dev/null || true
wait $DESIGN_PID 2>/dev/null || true

# ─── Print all results ───
echo -e "${BOLD}${MAGENTA}════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}${MAGENTA}  RESULTADOS COMPLETOS${NC}"
echo -e "${BOLD}${MAGENTA}════════════════════════════════════════════════════${NC}\n"

echo -e "${BOLD}━━━ 1. SEGURANÇA ━━━${NC}"
cat "$SEC_OUT" 2>/dev/null || echo "(sem output)"

echo -e "\n${BOLD}━━━ 2. QUALIDADE ━━━${NC}"
cat "$QUAL_OUT" 2>/dev/null || echo "(sem output)"

echo -e "\n${BOLD}━━━ 3. DEAD CODE ━━━${NC}"
cat "$DEAD_OUT" 2>/dev/null || echo "(sem output)"

echo -e "\n${BOLD}━━━ 4. PERFORMANCE & BUNDLE ━━━${NC}"
cat "$BUNDLE_OUT" 2>/dev/null || echo "(sem output)"

echo -e "\n${BOLD}━━━ 5. STORE READINESS ━━━${NC}"
cat "$STORE_OUT" 2>/dev/null || echo "(sem output)"

echo -e "\n${BOLD}━━━ 6. CAPACITOR BRIDGE AUDIT ━━━${NC}"
cat "$BRIDGE_OUT" 2>/dev/null || echo "(sem output)"

echo -e "\n${BOLD}━━━ 7. APP PRIVACY AUDIT (Info.plist) ━━━${NC}"
cat "$PRIVACY_OUT" 2>/dev/null || echo "(sem output)"

echo -e "\n${BOLD}━━━ 8. CAPACITOR SYNC (Native Linkage) ━━━${NC}"
cat "$CAPSYNC_OUT" 2>/dev/null || echo "(sem output)"

echo -e "\n${BOLD}━━━ 9. DESIGN & UI/UX ━━━${NC}"
cat "$DESIGN_OUT" 2>/dev/null || echo "(sem output)"

# ─── Final Summary ───
ENDED_AT=$(date '+%Y-%m-%d %H:%M:%S')

echo -e "\n${BOLD}${MAGENTA}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${MAGENTA}║          AUDITORIA CONCLUÍDA                     ║${NC}"
echo -e "${BOLD}${MAGENTA}╚══════════════════════════════════════════════════╝${NC}"
echo -e "  ${CYAN}Início:${NC}  $STARTED_AT"
echo -e "  ${CYAN}Fim:${NC}     $ENDED_AT"
echo -e "  ${CYAN}Reports:${NC} $REPORT_DIR/"
echo -e ""
echo -e "  Arquivos de relatório:"
ls -la "$REPORT_DIR"/*.{json,txt} 2>/dev/null | awk '{print "    " $NF " (" $5 " bytes)"}' || echo "    (nenhum)"
echo ""

# Cleanup temp files
rm -f "$SEC_OUT" "$QUAL_OUT" "$DEAD_OUT" "$BUNDLE_OUT" "$STORE_OUT" "$BRIDGE_OUT" "$CAPSYNC_OUT" "$PRIVACY_OUT" "$DESIGN_OUT"
rm -f "$REPORT_DIR/.sec_exit" "$REPORT_DIR/.store_exit"
