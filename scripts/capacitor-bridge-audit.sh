#!/usr/bin/env bash
# capacitor-bridge-audit.sh — Audita chamadas a APIs nativas sem guard de plataforma
# Detecta: navigator.* sem try/catch, Capacitor plugins sem isNativePlatform(), etc.

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

# Helper: verifica se a linha está protegida por try/catch ou error callback
check_protected() {
  local FILE="$1"
  local LINE_NUM="$2"
  local LOOKBACK="${3:-10}"
  local LOOKFORWARD="${4:-5}"
  local START=$((LINE_NUM - LOOKBACK))
  local END=$((LINE_NUM + LOOKFORWARD))
  [ "$START" -lt 1 ] && START=1
  local CONTEXT
  CONTEXT=$(sed -n "${START},${END}p" "$FILE" 2>/dev/null)
  # Aceita: try block, error callback (() => {}), .catch(), guard de disponibilidade
  if echo "$CONTEXT" | grep -qE "try|catch|\.catch\(|\(\) *=>|\(err|\(error|!navigator\.|typeof navigator"; then
    echo "1"
  else
    echo "0"
  fi
}

echo -e "\n${BOLD}${CYAN}══════════════════════════════════════════${NC}"
echo -e "${BOLD}${CYAN}   🔌 CAPACITOR BRIDGE AUDIT${NC}"
echo -e "${BOLD}${CYAN}══════════════════════════════════════════${NC}\n"

# ─── 1. navigator.geolocation ───
echo -e "${BOLD}[1/5] navigator.geolocation sem try/catch...${NC}"
GEO_CALLS=$(grep -rn --include='*.ts' --include='*.tsx' \
  'navigator\.geolocation\.' \
  src/ modules/ features/ hooks/ components/ 2>/dev/null || true)

if [ -n "$GEO_CALLS" ]; then
  TOTAL=$(echo "$GEO_CALLS" | wc -l | tr -d ' ')
  echo -e "  ${CYAN}$TOTAL chamadas encontradas${NC}"
  while IFS= read -r line; do
    FILE=$(echo "$line" | cut -d: -f1)
    LINE_NUM=$(echo "$line" | cut -d: -f2)
    HAS_TRY=$(check_protected "$FILE" "$LINE_NUM")
    if [ "$HAS_TRY" -eq 1 ]; then
      echo -e "    ${GREEN}✓ Com try/catch:${NC} $FILE:$LINE_NUM"
    else
      echo -e "    ${RED}✗ SEM try/catch:${NC} $FILE:$LINE_NUM"
      WARNINGS=$((WARNINGS + 1))
    fi
  done <<< "$GEO_CALLS"
else
  echo -e "  ${GREEN}✓ Nenhuma chamada direta${NC}"
fi

# ─── 2. navigator.mediaDevices ───
echo -e "\n${BOLD}[2/5] navigator.mediaDevices sem try/catch...${NC}"
MEDIA_CALLS=$(grep -rn --include='*.ts' --include='*.tsx' \
  'navigator\.mediaDevices\.' \
  src/ modules/ features/ hooks/ components/ 2>/dev/null || true)

if [ -n "$MEDIA_CALLS" ]; then
  TOTAL=$(echo "$MEDIA_CALLS" | wc -l | tr -d ' ')
  echo -e "  ${CYAN}$TOTAL chamadas encontradas${NC}"
  while IFS= read -r line; do
    FILE=$(echo "$line" | cut -d: -f1)
    LINE_NUM=$(echo "$line" | cut -d: -f2)
    HAS_TRY=$(check_protected "$FILE" "$LINE_NUM")
    if [ "$HAS_TRY" -eq 1 ]; then
      echo -e "    ${GREEN}✓ Com try/catch:${NC} $FILE:$LINE_NUM"
    else
      echo -e "    ${RED}✗ SEM try/catch:${NC} $FILE:$LINE_NUM"
      WARNINGS=$((WARNINGS + 1))
    fi
  done <<< "$MEDIA_CALLS"
else
  echo -e "  ${GREEN}✓ Nenhuma chamada direta${NC}"
fi

# ─── 3. navigator.share ───
echo -e "\n${BOLD}[3/5] navigator.share sem guard...${NC}"
SHARE_CALLS=$(grep -rn --include='*.ts' --include='*.tsx' \
  'navigator\.share(' \
  src/ modules/ features/ hooks/ components/ 2>/dev/null || true)

if [ -n "$SHARE_CALLS" ]; then
  while IFS= read -r line; do
    FILE=$(echo "$line" | cut -d: -f1)
    LINE_NUM=$(echo "$line" | cut -d: -f2)
    START=$((LINE_NUM - 5))
    [ "$START" -lt 1 ] && START=1
    HAS_CHECK=$(sed -n "${START},${LINE_NUM}p" "$FILE" 2>/dev/null | grep -q "if.*navigator\.share" && echo "1" || echo "0")
    HAS_TRY=$(check_protected "$FILE" "$LINE_NUM" 10)
    if [ "$HAS_CHECK" -eq 1 ] || [ "$HAS_TRY" -eq 1 ]; then
      echo -e "    ${GREEN}✓ Com guard:${NC} $FILE:$LINE_NUM"
    else
      echo -e "    ${RED}✗ SEM guard:${NC} $FILE:$LINE_NUM"
      WARNINGS=$((WARNINGS + 1))
    fi
  done <<< "$SHARE_CALLS"
else
  echo -e "  ${GREEN}✓ Nenhuma chamada${NC}"
fi

# ─── 4. navigator.clipboard ───
echo -e "\n${BOLD}[4/5] navigator.clipboard sem try/catch...${NC}"
CLIP_CALLS=$(grep -rn --include='*.ts' --include='*.tsx' \
  'navigator\.clipboard\.' \
  src/ modules/ features/ hooks/ components/ 2>/dev/null || true)

if [ -n "$CLIP_CALLS" ]; then
  TOTAL=$(echo "$CLIP_CALLS" | wc -l | tr -d ' ')
  echo -e "  ${CYAN}$TOTAL chamadas encontradas${NC}"
  while IFS= read -r line; do
    FILE=$(echo "$line" | cut -d: -f1)
    LINE_NUM=$(echo "$line" | cut -d: -f2)
    HAS_TRY=$(check_protected "$FILE" "$LINE_NUM")
    HAS_CATCH=0
    echo "$line" | grep -q "\.catch(" && HAS_CATCH=1
    if [ "$HAS_TRY" -eq 1 ] || [ "$HAS_CATCH" -eq 1 ]; then
      echo -e "    ${GREEN}✓ Com error handling:${NC} $FILE:$LINE_NUM"
    else
      echo -e "    ${RED}✗ SEM error handling:${NC} $FILE:$LINE_NUM"
      WARNINGS=$((WARNINGS + 1))
    fi
  done <<< "$CLIP_CALLS"
else
  echo -e "  ${GREEN}✓ Nenhuma chamada${NC}"
fi

# ─── 5. Capacitor.isNativePlatform() ───
echo -e "\n${BOLD}[5/5] Uso de Capacitor.isNativePlatform()...${NC}"
CAP_GUARD=$(grep -rn --include='*.ts' --include='*.tsx' \
  -E 'isNativePlatform|Capacitor\.getPlatform|Capacitor\.isPluginAvailable' \
  src/ modules/ features/ hooks/ components/ 2>/dev/null || true)

if [ -n "$CAP_GUARD" ]; then
  TOTAL=$(echo "$CAP_GUARD" | wc -l | tr -d ' ')
  echo -e "  ${GREEN}✓ $TOTAL verificações de plataforma encontradas${NC}"
else
  echo -e "  ${YELLOW}⚠ ZERO verificações Capacitor.isNativePlatform() no código${NC}"
  echo -e "  ${YELLOW}  O app usa APIs web (navigator.*) sem distinguir nativo vs web.${NC}"
  echo -e "  ${YELLOW}  Considere adicionar guards para comportamento diferenciado em iOS/Android.${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# ─── Bonus: Notification.requestPermission ───
echo -e "\n${BOLD}[Bonus] Notification.requestPermission sem try/catch...${NC}"
NOTIF_CALLS=$(grep -rn --include='*.ts' --include='*.tsx' \
  'Notification\.requestPermission' \
  src/ modules/ features/ hooks/ components/ 2>/dev/null || true)

if [ -n "$NOTIF_CALLS" ]; then
  while IFS= read -r line; do
    FILE=$(echo "$line" | cut -d: -f1)
    LINE_NUM=$(echo "$line" | cut -d: -f2)
    HAS_TRY=$(check_protected "$FILE" "$LINE_NUM")
    if [ "$HAS_TRY" -eq 1 ]; then
      echo -e "    ${GREEN}✓ Com try/catch:${NC} $FILE:$LINE_NUM"
    else
      echo -e "    ${RED}✗ SEM try/catch:${NC} $FILE:$LINE_NUM"
      WARNINGS=$((WARNINGS + 1))
    fi
  done <<< "$NOTIF_CALLS"
else
  echo -e "  ${GREEN}✓ Nenhuma chamada direta${NC}"
fi

# ─── Summary ───
echo -e "\n${BOLD}${CYAN}──────────────────────────────────────────${NC}"
echo -e "${BOLD}  RESUMO BRIDGE AUDIT${NC}"
echo -e "${CYAN}──────────────────────────────────────────${NC}"
if [ $WARNINGS -eq 0 ]; then
  echo -e "  ${GREEN}${BOLD}✓ Todas as chamadas nativas estão protegidas${NC}"
else
  echo -e "  ${YELLOW}${BOLD}⚠ $WARNINGS pontos de atenção${NC}"
  echo -e "  ${CYAN}  Recomendação: adicionar try/catch e/ou Capacitor.isNativePlatform()${NC}"
fi
echo ""
