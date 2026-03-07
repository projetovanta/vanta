#!/usr/bin/env bash
# design-audit.sh — Auditoria de UI/UX, Consistência Visual e Acessibilidade
# Projeto VANTA — React + Tailwind v4 + Capacitor
#
# Paleta oficial:
#   BG: #050505, #0A0A0A
#   Accent/Gold: #FFD300
#   Text: rgba(255,255,255,0.92/0.58/0.38)
#   Zinc scale: zinc-900, zinc-800, zinc-700, zinc-600
#   Feedback: green-500, red-500, yellow-500

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

SEARCH_DIRS="src/ modules/ features/ hooks/ components/"
TOTAL_ISSUES=0
REPORT_FILE="$REPORT_DIR/design-audit-report.txt"
: > "$REPORT_FILE"

echo -e "\n${BOLD}${MAGENTA}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${MAGENTA}║       🎨 VANTA DESIGN & UI/UX AUDIT             ║${NC}"
echo -e "${BOLD}${MAGENTA}║       Cores • Responsividade • a11y • SafeArea   ║${NC}"
echo -e "${BOLD}${MAGENTA}╚══════════════════════════════════════════════════╝${NC}\n"

# ═══════════════════════════════════════════════════════════
# 1. CONSISTÊNCIA DE CORES
# ═══════════════════════════════════════════════════════════
echo -e "${BOLD}${CYAN}══════════════════════════════════════════${NC}"
echo -e "${BOLD}${CYAN}   1. CONSISTÊNCIA DE CORES${NC}"
echo -e "${BOLD}${CYAN}══════════════════════════════════════════${NC}\n"

# 1a. Cores hex únicas fora da paleta oficial
echo -e "${BOLD}[1a] Cores hex fora da paleta oficial...${NC}"

# Extrair APENAS os hex codes (sem arquivo:linha), agrupar, contar
ALL_HEX=$(grep -roh --include='*.tsx' --include='*.ts' \
  -E '#[0-9a-fA-F]{3,8}' \
  $SEARCH_DIRS 2>/dev/null | \
  tr '[:lower:]' '[:upper:]' | \
  sort | uniq -c | sort -rn || true)

# Paleta aprovada (uppercase para comparação)
APPROVED_RE='^#(FFD300|050505|0A0A0A|000000|000|FFF|FFFFFF|111|111111)$'

ON_COUNT=0
OFF_COUNT=0
OFF_PALETTE=""

if [ -n "$ALL_HEX" ]; then
  while read -r count color; do
    if echo "$color" | grep -qE "$APPROVED_RE"; then
      ON_COUNT=$((ON_COUNT + 1))
    else
      OFF_COUNT=$((OFF_COUNT + 1))
      OFF_PALETTE="${OFF_PALETTE}    ${YELLOW}⚠ $color${NC} ($count usos)\n"
    fi
  done <<< "$ALL_HEX"

  echo -e "  ${GREEN}$ON_COUNT cores na paleta oficial${NC}"
  if [ "$OFF_COUNT" -gt 0 ]; then
    echo -e "  ${YELLOW}$OFF_COUNT cores fora da paleta:${NC}"
    echo -en "$OFF_PALETTE"
    TOTAL_ISSUES=$((TOTAL_ISSUES + OFF_COUNT))
  else
    echo -e "  ${GREEN}✓ Todas as cores estão na paleta oficial${NC}"
  fi
fi

# 1b. Cores inline em style={{}} em vez de Tailwind
echo -e "\n${BOLD}[1b] Cores em style={{}} em vez de Tailwind...${NC}"
INLINE_COLORS=$(grep -rn --include='*.tsx' \
  -E 'style=\{\{[^}]*(color|background|border).*#[0-9a-fA-F]' \
  $SEARCH_DIRS 2>/dev/null | \
  grep -v 'constants\.ts' | head -20 || true)

if [ -n "$INLINE_COLORS" ]; then
  INLINE_COUNT=$(echo "$INLINE_COLORS" | wc -l | tr -d ' ')
  echo -e "  ${YELLOW}⚠ $INLINE_COUNT estilos inline com cores hardcoded${NC}"
  echo "$INLINE_COLORS" | head -10 | while IFS= read -r line; do
    FILE=$(echo "$line" | cut -d: -f1)
    LN=$(echo "$line" | cut -d: -f2)
    echo -e "    ${CYAN}$FILE:$LN${NC}"
  done
  TOTAL_ISSUES=$((TOTAL_ISSUES + INLINE_COUNT))
  echo "$INLINE_COLORS" >> "$REPORT_FILE"
else
  echo -e "  ${GREEN}✓ Sem cores inline em style={{}}${NC}"
fi

# 1c. Opacidades inconsistentes (rgba com valores não-padrão)
echo -e "\n${BOLD}[1c] Opacidades de texto não-padrão...${NC}"
NON_STD_OPACITY=$(grep -roh --include='*.tsx' --include='*.ts' \
  'rgba(255,\s*255,\s*255,\s*[0-9.]\+)' \
  $SEARCH_DIRS 2>/dev/null | \
  grep -v '0\.92\|0\.58\|0\.38\|0\.1)\|0\.05)\|0\.2)\|0\.3)\|0\.5)\|0\.6)\|0\.7)\|0\.8)\|0\.9)\|,1)' | \
  sort | uniq -c | sort -rn || true)

if [ -n "$NON_STD_OPACITY" ]; then
  echo -e "  ${YELLOW}⚠ Opacidades fora do padrão (0.92/0.58/0.38):${NC}"
  echo "$NON_STD_OPACITY" | head -10 | while IFS= read -r line; do
    echo -e "    ${CYAN}$line${NC}"
  done
else
  echo -e "  ${GREEN}✓ Todas as opacidades seguem o padrão${NC}"
fi

# ═══════════════════════════════════════════════════════════
# 2. RESPONSIVIDADE
# ═══════════════════════════════════════════════════════════
echo -e "\n${BOLD}${CYAN}══════════════════════════════════════════${NC}"
echo -e "${BOLD}${CYAN}   2. RESPONSIVIDADE${NC}"
echo -e "${BOLD}${CYAN}══════════════════════════════════════════${NC}\n"

# 2a. Larguras fixas em px (proibido pelo CLAUDE.md)
echo -e "${BOLD}[2a] Larguras fixas em px (w-[Npx])...${NC}"
FIXED_WIDTHS=$(grep -rn --include='*.tsx' \
  -E 'w-\[[0-9]+px\]|h-\[[0-9]+px\]|min-w-\[[0-9]+px\]|max-w-\[[0-9]+px\]' \
  $SEARCH_DIRS 2>/dev/null || true)

if [ -n "$FIXED_WIDTHS" ]; then
  FW_COUNT=$(echo "$FIXED_WIDTHS" | wc -l | tr -d ' ')
  echo -e "  ${YELLOW}⚠ $FW_COUNT elementos com largura/altura fixa em px${NC}"
  echo "$FIXED_WIDTHS" | head -15 | while IFS= read -r line; do
    FILE=$(echo "$line" | cut -d: -f1)
    LN=$(echo "$line" | cut -d: -f2)
    # Extrair o valor
    VAL=$(echo "$line" | grep -oE '[wh]-\[[0-9]+px\]|m[ai][xn]-[wh]-\[[0-9]+px\]' | head -1)
    echo -e "    ${CYAN}$FILE:$LN${NC} → $VAL"
  done
  echo "$FIXED_WIDTHS" >> "$REPORT_FILE"
  TOTAL_ISSUES=$((TOTAL_ISSUES + FW_COUNT))
else
  echo -e "  ${GREEN}✓ Nenhuma largura fixa em px${NC}"
fi

# 2b. Uso de breakpoints responsivos (md:, lg:, sm:)
echo -e "\n${BOLD}[2b] Uso de breakpoints responsivos...${NC}"
MD_COUNT=$( (grep -rn --include='*.tsx' -c 'md:' $SEARCH_DIRS 2>/dev/null || true) | awk -F: '{s+=$NF} END {print s+0}')
LG_COUNT=$( (grep -rn --include='*.tsx' -c 'lg:' $SEARCH_DIRS 2>/dev/null || true) | awk -F: '{s+=$NF} END {print s+0}')
SM_COUNT=$( (grep -rn --include='*.tsx' -c 'sm:' $SEARCH_DIRS 2>/dev/null || true) | awk -F: '{s+=$NF} END {print s+0}')

echo -e "  ${CYAN}sm:${NC} $SM_COUNT | ${CYAN}md:${NC} $MD_COUNT | ${CYAN}lg:${NC} $LG_COUNT usos"

# Total de arquivos TSX
TSX_COUNT=$(find $SEARCH_DIRS -name '*.tsx' 2>/dev/null | wc -l | tr -d ' ')
FILES_WITH_BP=$(grep -rl --include='*.tsx' -E 'md:|lg:|sm:' $SEARCH_DIRS 2>/dev/null | wc -l | tr -d ' ')
PERCENT=$((FILES_WITH_BP * 100 / (TSX_COUNT + 1)))

echo -e "  ${CYAN}$FILES_WITH_BP/$TSX_COUNT${NC} arquivos TSX usam breakpoints ($PERCENT%)"

if [ "$PERCENT" -lt 30 ]; then
  echo -e "  ${YELLOW}⚠ Menos de 30% dos componentes têm breakpoints responsivos${NC}"
  TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
else
  echo -e "  ${GREEN}✓ Cobertura responsiva adequada${NC}"
fi

# 2c. fixed inset-0 (proibido para modais, ok para standalone)
echo -e "\n${BOLD}[2c] Modais com 'fixed inset-0' (proibido)...${NC}"
FIXED_MODALS=$(grep -rn --include='*.tsx' \
  -E 'fixed inset-0' \
  $SEARCH_DIRS 2>/dev/null | \
  grep -iv 'App\.tsx\|standalone\|screen' || true)

if [ -n "$FIXED_MODALS" ]; then
  FM_COUNT=$(echo "$FIXED_MODALS" | wc -l | tr -d ' ')
  echo -e "  ${YELLOW}⚠ $FM_COUNT usos de 'fixed inset-0' (deveria ser 'absolute inset-0' em modais)${NC}"
  echo "$FIXED_MODALS" | head -10 | while IFS= read -r line; do
    FILE=$(echo "$line" | cut -d: -f1)
    LN=$(echo "$line" | cut -d: -f2)
    echo -e "    ${CYAN}$FILE:$LN${NC}"
  done
  echo "$FIXED_MODALS" >> "$REPORT_FILE"
else
  echo -e "  ${GREEN}✓ Sem modais com 'fixed inset-0'${NC}"
fi

# 2d. Textos longos sem truncate/line-clamp
echo -e "\n${BOLD}[2d] Textos potencialmente longos sem truncate...${NC}"
LONG_TEXT=$(grep -rn --include='*.tsx' \
  -E '(titulo|nome|descricao|description|title|label|text)\}' \
  $SEARCH_DIRS 2>/dev/null | \
  grep -v 'truncate\|line-clamp\|overflow' | \
  grep -v '\.test\.\|\.spec\.' | head -20 || true)

LONG_TEXT_COUNT=0
if [ -n "$LONG_TEXT" ]; then
  LONG_TEXT_COUNT=$(echo "$LONG_TEXT" | wc -l | tr -d ' ')
fi
echo -e "  ${CYAN}$LONG_TEXT_COUNT pontos com texto dinâmico sem truncate (verificar manualmente)${NC}"

# ═══════════════════════════════════════════════════════════
# 3. ACESSIBILIDADE (a11y)
# ═══════════════════════════════════════════════════════════
echo -e "\n${BOLD}${CYAN}══════════════════════════════════════════${NC}"
echo -e "${BOLD}${CYAN}   3. ACESSIBILIDADE (a11y)${NC}"
echo -e "${BOLD}${CYAN}══════════════════════════════════════════${NC}\n"

# 3a. Imagens sem alt
echo -e "${BOLD}[3a] <img> sem atributo alt...${NC}"
IMG_NO_ALT=$(grep -rn --include='*.tsx' \
  '<img ' \
  $SEARCH_DIRS 2>/dev/null | \
  grep -v 'alt=' || true)

if [ -n "$IMG_NO_ALT" ]; then
  INA_COUNT=$(echo "$IMG_NO_ALT" | wc -l | tr -d ' ')
  echo -e "  ${RED}✗ $INA_COUNT imagens sem alt${NC}"
  echo "$IMG_NO_ALT" | head -10 | while IFS= read -r line; do
    FILE=$(echo "$line" | cut -d: -f1)
    LN=$(echo "$line" | cut -d: -f2)
    echo -e "    ${CYAN}$FILE:$LN${NC}"
  done
  TOTAL_ISSUES=$((TOTAL_ISSUES + INA_COUNT))
  echo "$IMG_NO_ALT" >> "$REPORT_FILE"
else
  echo -e "  ${GREEN}✓ Todas as imagens têm alt${NC}"
fi

# 3b. Botões de ícone sem aria-label
echo -e "\n${BOLD}[3b] Botões de ícone sem aria-label...${NC}"
ICON_BUTTONS=$(grep -rn --include='*.tsx' \
  -E '<button[^>]*>' \
  $SEARCH_DIRS 2>/dev/null | \
  grep -v 'aria-label' | \
  grep -iE 'Icon|icon|<svg|lucide' || true)

if [ -n "$ICON_BUTTONS" ]; then
  IB_COUNT=$(echo "$ICON_BUTTONS" | wc -l | tr -d ' ')
  echo -e "  ${YELLOW}⚠ $IB_COUNT botões de ícone potencialmente sem aria-label${NC}"
  echo "$ICON_BUTTONS" | head -10 | while IFS= read -r line; do
    FILE=$(echo "$line" | cut -d: -f1)
    LN=$(echo "$line" | cut -d: -f2)
    echo -e "    ${CYAN}$FILE:$LN${NC}"
  done
  TOTAL_ISSUES=$((TOTAL_ISSUES + IB_COUNT))
  echo "$ICON_BUTTONS" >> "$REPORT_FILE"
else
  echo -e "  ${GREEN}✓ Botões de ícone com aria-label${NC}"
fi

# 3c. Inputs sem label associado
echo -e "\n${BOLD}[3c] <input> sem label ou aria-label...${NC}"
INPUTS_NO_LABEL=$(grep -rn --include='*.tsx' \
  '<input ' \
  $SEARCH_DIRS 2>/dev/null | \
  grep -v 'aria-label\|aria-labelledby\|id=.*label\|placeholder' | \
  grep -v 'hidden\|type="file"\|type="checkbox"\|type="radio"' || true)

if [ -n "$INPUTS_NO_LABEL" ]; then
  INL_COUNT=$(echo "$INPUTS_NO_LABEL" | wc -l | tr -d ' ')
  echo -e "  ${YELLOW}⚠ $INL_COUNT inputs sem label/aria-label (placeholder não substitui label)${NC}"
  TOTAL_ISSUES=$((TOTAL_ISSUES + INL_COUNT))
else
  echo -e "  ${GREEN}✓ Inputs com labels adequados${NC}"
fi

# 3d. Elementos clicáveis sem role ou semântica
echo -e "\n${BOLD}[3d] <div onClick> sem role='button'...${NC}"
DIV_CLICK=$(grep -rn --include='*.tsx' \
  '<div.*onClick' \
  $SEARCH_DIRS 2>/dev/null | \
  grep -v 'role=' | head -20 || true)

if [ -n "$DIV_CLICK" ]; then
  DC_COUNT=$(echo "$DIV_CLICK" | wc -l | tr -d ' ')
  echo -e "  ${YELLOW}⚠ $DC_COUNT divs com onClick sem role='button'${NC}"
  echo "$DIV_CLICK" | head -5 | while IFS= read -r line; do
    FILE=$(echo "$line" | cut -d: -f1)
    LN=$(echo "$line" | cut -d: -f2)
    echo -e "    ${CYAN}$FILE:$LN${NC}"
  done
  TOTAL_ISSUES=$((TOTAL_ISSUES + DC_COUNT))
else
  echo -e "  ${GREEN}✓ Sem divs clicáveis sem role${NC}"
fi

# 3e. Contraste — textos cinza sobre fundo escuro
echo -e "\n${BOLD}[3e] Textos com baixo contraste potencial...${NC}"
LOW_CONTRAST=$(grep -rn --include='*.tsx' \
  -E 'text-zinc-[7-9]00|text-gray-[7-9]00|text-neutral-[7-9]00|text-\[#[3-5][0-9a-f]{5}\]' \
  $SEARCH_DIRS 2>/dev/null | head -15 || true)

if [ -n "$LOW_CONTRAST" ]; then
  LC_COUNT=$(echo "$LOW_CONTRAST" | wc -l | tr -d ' ')
  echo -e "  ${YELLOW}⚠ $LC_COUNT elementos com texto potencialmente de baixo contraste${NC}"
  echo -e "  ${CYAN}  (text-zinc-700+ sobre bg escuro pode falhar WCAG AA)${NC}"
else
  echo -e "  ${GREEN}✓ Sem problemas óbvios de contraste${NC}"
fi

# ═══════════════════════════════════════════════════════════
# 4. SAFE AREA — CAPACITOR LAYOUT
# ═══════════════════════════════════════════════════════════
echo -e "\n${BOLD}${CYAN}══════════════════════════════════════════${NC}"
echo -e "${BOLD}${CYAN}   4. SAFE AREA (Capacitor Layout)${NC}"
echo -e "${BOLD}${CYAN}══════════════════════════════════════════${NC}\n"

# 4a. Uso de safe-area-inset
echo -e "${BOLD}[4a] Uso de safe-area-inset...${NC}"
SA_TOP=$( (grep -rc --include='*.tsx' 'safe-area-inset-top' $SEARCH_DIRS App.tsx 2>/dev/null || true) | awk -F: '{s+=$NF} END {print s+0}')
SA_BOTTOM=$( (grep -rc --include='*.tsx' 'safe-area-inset-bottom' $SEARCH_DIRS 2>/dev/null || true) | awk -F: '{s+=$NF} END {print s+0}')
SA_LEFT=$( (grep -rc --include='*.tsx' 'safe-area-inset-left' $SEARCH_DIRS 2>/dev/null || true) | awk -F: '{s+=$NF} END {print s+0}')
SA_RIGHT=$( (grep -rc --include='*.tsx' 'safe-area-inset-right' $SEARCH_DIRS 2>/dev/null || true) | awk -F: '{s+=$NF} END {print s+0}')

echo -e "  ${CYAN}top:${NC} $SA_TOP | ${CYAN}bottom:${NC} $SA_BOTTOM | ${CYAN}left:${NC} $SA_LEFT | ${CYAN}right:${NC} $SA_RIGHT"

if [ "$SA_TOP" -eq 0 ]; then
  echo -e "  ${RED}✗ ZERO usos de safe-area-inset-top — conteúdo pode colidir com notch do iPhone!${NC}"
  TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
else
  echo -e "  ${GREEN}✓ safe-area-inset-top configurado${NC}"
fi

if [ "$SA_BOTTOM" -eq 0 ]; then
  echo -e "  ${RED}✗ ZERO usos de safe-area-inset-bottom — conteúdo pode colidir com home indicator!${NC}"
  TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
else
  echo -e "  ${GREEN}✓ safe-area-inset-bottom configurado${NC}"
fi

# 4b. viewport-fit=cover no meta tag
echo -e "\n${BOLD}[4b] viewport-fit=cover...${NC}"
if grep -q 'viewport-fit=cover' index.html 2>/dev/null; then
  echo -e "  ${GREEN}✓ viewport-fit=cover presente no index.html${NC}"
else
  echo -e "  ${RED}✗ viewport-fit=cover AUSENTE — safe-area não funciona sem isso!${NC}"
  TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
fi

# 4c. Status bar overlap check
echo -e "\n${BOLD}[4c] Headers/toolbars com padding-top...${NC}"
HEADER_PT=$(grep -rn --include='*.tsx' \
  -E '(Header|header|toolbar|Toolbar|TopBar|topbar|nav|Nav)' \
  $SEARCH_DIRS 2>/dev/null | \
  grep -E 'pt-\[env\|padding-top.*safe' | head -10 || true)

HEADER_TOTAL=$(grep -rl --include='*.tsx' -iE 'header|toolbar|topbar' $SEARCH_DIRS 2>/dev/null | wc -l | tr -d ' ')

if [ -n "$HEADER_PT" ]; then
  HPT_COUNT=$(echo "$HEADER_PT" | wc -l | tr -d ' ')
  echo -e "  ${GREEN}✓ $HPT_COUNT headers com safe-area padding${NC}"
else
  echo -e "  ${CYAN}  $HEADER_TOTAL arquivos com header/toolbar — verificar safe-area manualmente${NC}"
fi

# 4d. w-screen / h-screen (pode ultrapassar safe area)
echo -e "\n${BOLD}[4d] Uso de w-screen/h-screen...${NC}"
SCREEN_USE=$(grep -rn --include='*.tsx' \
  -E 'w-screen|h-screen' \
  $SEARCH_DIRS 2>/dev/null | \
  grep -v 'App\.tsx' || true)

if [ -n "$SCREEN_USE" ]; then
  SU_COUNT=$(echo "$SCREEN_USE" | wc -l | tr -d ' ')
  echo -e "  ${YELLOW}⚠ $SU_COUNT usos de w-screen/h-screen (pode ultrapassar safe area)${NC}"
  echo "$SCREEN_USE" | head -5 | while IFS= read -r line; do
    FILE=$(echo "$line" | cut -d: -f1)
    LN=$(echo "$line" | cut -d: -f2)
    echo -e "    ${CYAN}$FILE:$LN${NC}"
  done
  TOTAL_ISSUES=$((TOTAL_ISSUES + SU_COUNT))
else
  echo -e "  ${GREEN}✓ Sem w-screen/h-screen fora do App.tsx${NC}"
fi

# ═══════════════════════════════════════════════════════════
# 5. TIPOGRAFIA & DESIGN SYSTEM
# ═══════════════════════════════════════════════════════════
echo -e "\n${BOLD}${CYAN}══════════════════════════════════════════${NC}"
echo -e "${BOLD}${CYAN}   5. TIPOGRAFIA & DESIGN SYSTEM${NC}"
echo -e "${BOLD}${CYAN}══════════════════════════════════════════${NC}\n"

# 5a. Font-family inline em vez de usar constants.ts
echo -e "${BOLD}[5a] font-family hardcoded em vez de FONTS/TYPOGRAPHY...${NC}"
INLINE_FONTS=$(grep -rn --include='*.tsx' \
  -E "fontFamily.*['\"]|font-family:" \
  $SEARCH_DIRS 2>/dev/null | \
  grep -v 'constants\|FONTS\|TYPOGRAPHY' | head -15 || true)

if [ -n "$INLINE_FONTS" ]; then
  IF_COUNT=$(echo "$INLINE_FONTS" | wc -l | tr -d ' ')
  echo -e "  ${YELLOW}⚠ $IF_COUNT usos de fontFamily inline (deveria usar FONTS/TYPOGRAPHY de constants.ts)${NC}"
  echo "$INLINE_FONTS" | head -5 | while IFS= read -r line; do
    FILE=$(echo "$line" | cut -d: -f1)
    LN=$(echo "$line" | cut -d: -f2)
    echo -e "    ${CYAN}$FILE:$LN${NC}"
  done
  TOTAL_ISSUES=$((TOTAL_ISSUES + IF_COUNT))
else
  echo -e "  ${GREEN}✓ Tipografia centralizada em constants.ts${NC}"
fi

# 5b. font-size em px (deveria ser Tailwind text-xs/sm/base/lg)
echo -e "\n${BOLD}[5b] font-size em px hardcoded...${NC}"
FS_PX=$(grep -rn --include='*.tsx' \
  -E "fontSize.*['\"][0-9]+px['\"]|text-\[[0-9]+px\]" \
  $SEARCH_DIRS 2>/dev/null | head -20 || true)

if [ -n "$FS_PX" ]; then
  FS_COUNT=$(echo "$FS_PX" | wc -l | tr -d ' ')
  echo -e "  ${CYAN}$FS_COUNT usos de fontSize em px (comum em design systems — verificar se necessário)${NC}"
else
  echo -e "  ${GREEN}✓ Sem fontSize em px${NC}"
fi

# 5c. <select> HTML nativo (proibido pelo CLAUDE.md)
echo -e "\n${BOLD}[5c] <select> HTML nativo (proibido)...${NC}"
NATIVE_SELECT=$(grep -rn --include='*.tsx' \
  '<select' \
  $SEARCH_DIRS 2>/dev/null | \
  grep -v '^\s*\*\|^\s*//\|/\*\*' || true)

if [ -n "$NATIVE_SELECT" ]; then
  NS_COUNT=$(echo "$NATIVE_SELECT" | wc -l | tr -d ' ')
  echo -e "  ${RED}✗ $NS_COUNT usos de <select> nativo (deve ser dropdown/modal Vanta)${NC}"
  echo "$NATIVE_SELECT" | head -5 | while IFS= read -r line; do
    FILE=$(echo "$line" | cut -d: -f1)
    LN=$(echo "$line" | cut -d: -f2)
    echo -e "    ${CYAN}$FILE:$LN${NC}"
  done
  TOTAL_ISSUES=$((TOTAL_ISSUES + NS_COUNT))
else
  echo -e "  ${GREEN}✓ Sem <select> HTML nativo${NC}"
fi

# ═══════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════
echo -e "\n${BOLD}${MAGENTA}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${MAGENTA}║       RESUMO DESIGN AUDIT                        ║${NC}"
echo -e "${BOLD}${MAGENTA}╚══════════════════════════════════════════════════╝${NC}"
if [ "$TOTAL_ISSUES" -eq 0 ]; then
  echo -e "  ${GREEN}${BOLD}✓ DESIGN CONSISTENTE — 0 issues${NC}"
else
  echo -e "  ${YELLOW}${BOLD}⚠ $TOTAL_ISSUES pontos de atenção encontrados${NC}"
  echo -e "  ${CYAN}  Relatório detalhado: $REPORT_FILE${NC}"
fi
echo -e "  ${CYAN}  Recomendações para look premium nas lojas:${NC}"
echo -e "  ${CYAN}  • Cores: usar COLORS de constants.ts, evitar hex inline${NC}"
echo -e "  ${CYAN}  • a11y: alt em todas as <img>, aria-label em botões de ícone${NC}"
echo -e "  ${CYAN}  • Safe area: pt-[env(safe-area-inset-top)] em headers${NC}"
echo -e "  ${CYAN}  • Responsividade: breakpoints md:/lg: em componentes principais${NC}"
echo ""
