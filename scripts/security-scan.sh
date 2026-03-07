#!/usr/bin/env bash
# security-scan.sh — Auditoria de Segurança Completa (Vanta)
# Executa: gitleaks (secrets), npm audit (deps), trivy (filesystem)

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

REPORT_DIR="audit-reports"
mkdir -p "$REPORT_DIR"

ERRORS=0
WARNINGS=0

echo -e "\n${BOLD}${CYAN}══════════════════════════════════════════${NC}"
echo -e "${BOLD}${CYAN}   🔒 VANTA SECURITY SCAN${NC}"
echo -e "${BOLD}${CYAN}══════════════════════════════════════════${NC}\n"

# ─── 1. Gitleaks — Secrets Detection ───
echo -e "${BOLD}[1/4] Gitleaks — Detectando secrets expostos...${NC}"
if command -v gitleaks &>/dev/null; then
  if gitleaks detect --source . --config .gitleaks.toml --report-path "$REPORT_DIR/gitleaks-report.json" --report-format json 2>/dev/null; then
    echo -e "  ${GREEN}✓ Nenhum secret detectado${NC}"
  else
    LEAK_COUNT=$(cat "$REPORT_DIR/gitleaks-report.json" 2>/dev/null | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "?")
    echo -e "  ${RED}✗ $LEAK_COUNT secrets encontrados! Ver: $REPORT_DIR/gitleaks-report.json${NC}"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo -e "  ${YELLOW}⚠ gitleaks não instalado (brew install gitleaks)${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# ─── 2. npm audit — Dependency Vulnerabilities ───
echo -e "\n${BOLD}[2/4] npm audit — Vulnerabilidades em dependências...${NC}"
npm audit --json > "$REPORT_DIR/npm-audit.json" 2>/dev/null || true
VULN_TOTAL=$(cat "$REPORT_DIR/npm-audit.json" | python3 -c "
import sys, json
data = json.load(sys.stdin)
vulns = data.get('metadata', {}).get('vulnerabilities', {})
total = vulns.get('low',0) + vulns.get('moderate',0) + vulns.get('high',0) + vulns.get('critical',0)
crit = vulns.get('critical',0)
high = vulns.get('high',0)
print(f'{total}|{crit}|{high}')
" 2>/dev/null || echo "0|0|0")

IFS='|' read -r TOTAL CRIT HIGH <<< "$VULN_TOTAL"
if [ "$CRIT" -gt 0 ] 2>/dev/null; then
  echo -e "  ${RED}✗ $TOTAL vulnerabilidades ($CRIT críticas, $HIGH altas)${NC}"
  ERRORS=$((ERRORS + 1))
elif [ "$HIGH" -gt 0 ] 2>/dev/null; then
  echo -e "  ${YELLOW}⚠ $TOTAL vulnerabilidades ($HIGH altas)${NC}"
  WARNINGS=$((WARNINGS + 1))
elif [ "$TOTAL" -gt 0 ] 2>/dev/null; then
  echo -e "  ${YELLOW}⚠ $TOTAL vulnerabilidades (nenhuma crítica/alta)${NC}"
else
  echo -e "  ${GREEN}✓ Nenhuma vulnerabilidade encontrada${NC}"
fi

# ─── 3. Trivy — Filesystem Scan ───
echo -e "\n${BOLD}[3/4] Trivy — Scan de vulnerabilidades no filesystem...${NC}"
if command -v trivy &>/dev/null; then
  trivy fs . --severity HIGH,CRITICAL --skip-dirs node_modules,dist,android,ios,.git \
    --format json --output "$REPORT_DIR/trivy-report.json" 2>/dev/null || true
  TRIVY_VULNS=$(cat "$REPORT_DIR/trivy-report.json" | python3 -c "
import sys, json
data = json.load(sys.stdin)
results = data.get('Results', [])
total = sum(len(r.get('Vulnerabilities', [])) for r in results)
print(total)
" 2>/dev/null || echo "0")
  if [ "$TRIVY_VULNS" -gt 0 ] 2>/dev/null; then
    echo -e "  ${YELLOW}⚠ $TRIVY_VULNS vulnerabilidades HIGH/CRITICAL encontradas${NC}"
    echo -e "  ${CYAN}  Ver detalhes: $REPORT_DIR/trivy-report.json${NC}"
    WARNINGS=$((WARNINGS + 1))
  else
    echo -e "  ${GREEN}✓ Nenhuma vulnerabilidade HIGH/CRITICAL${NC}"
  fi
else
  echo -e "  ${YELLOW}⚠ trivy não instalado (brew install trivy)${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# ─── 4. Hardcoded Secrets Check (manual grep) ───
echo -e "\n${BOLD}[4/4] Grep manual — Patterns de secrets no código...${NC}"
HARDCODED=$(grep -rn \
  --include='*.ts' --include='*.tsx' --include='*.js' --include='*.json' \
  -E '(sk_live|sk_test|AKIA[A-Z0-9]{16}|AIza[A-Za-z0-9_-]{35}|ghp_[A-Za-z0-9]{36}|password\s*[:=]\s*["\x27][^"\x27]{8,})' \
  src/ modules/ features/ hooks/ services/ 2>/dev/null | \
  grep -v 'node_modules' | grep -v '.env' | grep -v 'example' | grep -v '\.d\.ts' || true)

if [ -n "$HARDCODED" ]; then
  echo -e "  ${RED}✗ Possíveis secrets hardcoded encontrados:${NC}"
  echo "$HARDCODED" | head -10
  echo "$HARDCODED" > "$REPORT_DIR/hardcoded-secrets.txt"
  ERRORS=$((ERRORS + 1))
else
  echo -e "  ${GREEN}✓ Nenhum secret hardcoded detectado${NC}"
fi

# ─── Summary ───
echo -e "\n${BOLD}${CYAN}──────────────────────────────────────────${NC}"
echo -e "${BOLD}  RESUMO SEGURANÇA${NC}"
echo -e "${CYAN}──────────────────────────────────────────${NC}"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "  ${GREEN}${BOLD}✓ TUDO LIMPO — 0 erros, 0 warnings${NC}"
elif [ $ERRORS -eq 0 ]; then
  echo -e "  ${YELLOW}${BOLD}⚠ $WARNINGS warnings (0 erros)${NC}"
else
  echo -e "  ${RED}${BOLD}✗ $ERRORS erros, $WARNINGS warnings${NC}"
fi
echo -e "  Relatórios em: ${CYAN}$REPORT_DIR/${NC}\n"

exit $ERRORS
