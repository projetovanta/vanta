#!/usr/bin/env bash
# app-privacy-audit.sh — Audita Info.plist vs uso real de APIs privadas
# Cruza código-fonte com Usage Descriptions exigidas pela Apple

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

PLIST="ios/App/App/Info.plist"
ERRORS=0
WARNINGS=0

echo -e "\n${BOLD}${CYAN}══════════════════════════════════════════${NC}"
echo -e "${BOLD}${CYAN}   🍎 APP PRIVACY AUDIT (Info.plist)${NC}"
echo -e "${BOLD}${CYAN}══════════════════════════════════════════${NC}\n"

if [ ! -f "$PLIST" ]; then
  echo -e "  ${RED}✗ Info.plist não encontrado em $PLIST${NC}"
  exit 1
fi

# ═══ Função helper: detecta uso no código e verifica plist ═══
check_permission() {
  local LABEL="$1"
  local PLIST_KEY="$2"
  local GREP_PATTERN="$3"
  local SEARCH_DIRS="src/ modules/ features/ hooks/ components/ services/"

  # Verificar uso no código
  USAGE=$(grep -rn --include='*.ts' --include='*.tsx' -E "$GREP_PATTERN" $SEARCH_DIRS 2>/dev/null | head -5 || true)
  if [ -n "$USAGE" ]; then
    USAGE_COUNT=$(echo "$USAGE" | wc -l | tr -d ' ')
  else
    USAGE_COUNT=0
  fi

  # Verificar se a key existe no plist (skip para keys especiais como "—")
  if [ "$PLIST_KEY" = "—" ]; then
    HAS_KEY=0
  else
    HAS_KEY=$(grep "$PLIST_KEY" "$PLIST" 2>/dev/null | wc -l | tr -d ' ')
  fi

  if [ "$USAGE_COUNT" -gt 0 ]; then
    if [ "$PLIST_KEY" = "—" ]; then
      # API sem plist key correspondente (ex: push) — apenas informar
      echo -e "  ${CYAN}ℹ $LABEL — $USAGE_COUNT refs no código (sem plist key dedicada)${NC}"
      return
    elif [ "$HAS_KEY" -gt 0 ]; then
      echo -e "  ${GREEN}✓ $LABEL${NC}"
      echo -e "    ${CYAN}Código usa ($USAGE_COUNT refs) + $PLIST_KEY presente${NC}"
    else
      echo -e "  ${RED}✗ $LABEL — BLOQUEANTE PARA APP STORE${NC}"
      echo -e "    ${RED}  Código usa a API mas $PLIST_KEY AUSENTE no Info.plist!${NC}"
      echo -e "    ${CYAN}  Exemplos de uso:${NC}"
      echo "$USAGE" | head -3 | sed 's/^/      /'
      ERRORS=$((ERRORS + 1))
    fi
  else
    if [ "$HAS_KEY" -gt 0 ]; then
      echo -e "  ${YELLOW}⚠ $LABEL${NC}"
      echo -e "    ${YELLOW}  $PLIST_KEY presente mas API NÃO usada no código${NC}"
      echo -e "    ${YELLOW}  Apple pode questionar durante review — considere remover${NC}"
      WARNINGS=$((WARNINGS + 1))
    else
      echo -e "  ${GREEN}○ $LABEL — Não usa, não declarado (OK)${NC}"
    fi
  fi
}

# ═══ Verificações obrigatórias da Apple ═══

echo -e "${BOLD}Verificando APIs privadas vs Info.plist...${NC}\n"

check_permission \
  "Câmera" \
  "NSCameraUsageDescription" \
  "navigator\.mediaDevices\.getUserMedia|getUserMedia|Html5Qrcode|html5-qrcode|\.startCamera"

check_permission \
  "Biblioteca de Fotos (leitura)" \
  "NSPhotoLibraryUsageDescription" \
  "input.*type.*file|FileReader|react-easy-crop|uploadAvatar|photoService|image.*upload"

check_permission \
  "Biblioteca de Fotos (gravação)" \
  "NSPhotoLibraryAddUsageDescription" \
  "saveToPhotos|UIImageWriteToSavedPhotosAlbum|saveToCameraRoll"

check_permission \
  "Localização (em uso)" \
  "NSLocationWhenInUseUsageDescription" \
  "navigator\.geolocation|getCurrentPosition|watchPosition|CLLocationManager"

check_permission \
  "Localização (sempre)" \
  "NSLocationAlwaysUsageDescription" \
  "allowsBackgroundLocationUpdates|startMonitoringSignificantLocationChanges"

check_permission \
  "Microfone" \
  "NSMicrophoneUsageDescription" \
  "audio.*getUserMedia|AudioContext|MediaRecorder|microphone"

check_permission \
  "Face ID" \
  "NSFaceIDUsageDescription" \
  "LAContext|evaluatePolicy|biometricType.*faceID|FaceID"

check_permission \
  "Contatos" \
  "NSContactsUsageDescription" \
  "CNContactStore|ABAddressBook|navigator\.contacts"

check_permission \
  "Bluetooth" \
  "NSBluetoothAlwaysUsageDescription" \
  "CBCentralManager|CBPeripheralManager|bluetooth"

check_permission \
  "Calendário" \
  "NSCalendarsUsageDescription" \
  "EKEventStore|EventKit|addToCalendar"

check_permission \
  "Rastreamento (ATT)" \
  "NSUserTrackingUsageDescription" \
  "ATTrackingManager|requestTrackingAuthorization|AdSupport"

check_permission \
  "Push Notifications" \
  "—" \
  "Notification\.requestPermission|registerForRemoteNotifications|getToken.*messaging"

# ─── Push notification entitlement check ───
echo -e "\n${BOLD}Verificando Push Notification capability...${NC}"
PUSH_USAGE=$(grep -rn --include='*.ts' --include='*.tsx' \
  'Notification\.requestPermission\|getToken.*messaging\|firebase/messaging' \
  src/ modules/ features/ hooks/ components/ services/ 2>/dev/null | head -3 || true)

if [ -n "$PUSH_USAGE" ]; then
  # Check entitlements file
  ENT_FILE=$(find ios/ -name '*.entitlements' 2>/dev/null | head -1 || echo "")
  if [ -n "$ENT_FILE" ] && grep -q "aps-environment" "$ENT_FILE" 2>/dev/null; then
    echo -e "  ${GREEN}✓ Push Notifications: código usa + entitlement configurado${NC}"
  else
    echo -e "  ${YELLOW}⚠ Push Notifications: código usa mas entitlement não encontrado${NC}"
    echo -e "  ${YELLOW}  Adicione aps-environment ao .entitlements ou configure no Xcode${NC}"
    WARNINGS=$((WARNINGS + 1))
  fi
fi

# ─── Verificar se Usage Descriptions têm texto adequado ───
echo -e "\n${BOLD}Verificando qualidade das Usage Descriptions...${NC}"
while IFS= read -r line; do
  KEY=$(echo "$line" | grep -oE 'NS[A-Za-z]+UsageDescription' || true)
  if [ -n "$KEY" ]; then
    # Ler a próxima linha (o valor da string)
    LINE_NUM=$(grep -n "$KEY" "$PLIST" | head -1 | cut -d: -f1)
    NEXT_LINE=$((LINE_NUM + 1))
    VALUE=$(sed -n "${NEXT_LINE}p" "$PLIST" | sed 's/<[^>]*>//g' | xargs)
    if [ ${#VALUE} -lt 10 ]; then
      echo -e "  ${RED}✗ $KEY: texto muito curto (\"$VALUE\")${NC}"
      echo -e "  ${RED}  Apple REJEITA descriptions genéricas. Seja específico sobre o uso.${NC}"
      ERRORS=$((ERRORS + 1))
    elif [ ${#VALUE} -lt 30 ]; then
      echo -e "  ${YELLOW}⚠ $KEY: texto pode ser curto demais (\"$VALUE\")${NC}"
      WARNINGS=$((WARNINGS + 1))
    else
      echo -e "  ${GREEN}✓ $KEY: \"$VALUE\"${NC}"
    fi
  fi
done < "$PLIST"

# ─── Summary ───
echo -e "\n${BOLD}${CYAN}──────────────────────────────────────────${NC}"
echo -e "${BOLD}  RESUMO APP PRIVACY${NC}"
echo -e "${CYAN}──────────────────────────────────────────${NC}"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "  ${GREEN}${BOLD}✓ PRONTO PARA APP STORE — todas as permissions corretas${NC}"
elif [ $ERRORS -eq 0 ]; then
  echo -e "  ${YELLOW}${BOLD}⚠ $WARNINGS pontos de atenção (review pode questionar)${NC}"
else
  echo -e "  ${RED}${BOLD}✗ $ERRORS itens BLOQUEANTES para App Store, $WARNINGS warnings${NC}"
  echo -e "  ${RED}  Corrigir ANTES de submeter à Apple!${NC}"
fi
echo ""

exit $ERRORS
