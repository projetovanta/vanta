#!/usr/bin/env bash
# store-readiness.sh — Verificação de Prontidão para App Store / Google Play (Vanta)

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

ERRORS=0
WARNINGS=0

echo -e "\n${BOLD}${CYAN}══════════════════════════════════════════${NC}"
echo -e "${BOLD}${CYAN}   📱 STORE READINESS CHECK${NC}"
echo -e "${BOLD}${CYAN}══════════════════════════════════════════${NC}\n"

# ─── 1. Capacitor Config ───
echo -e "${BOLD}[1/7] Capacitor Config...${NC}"
if [ -f "capacitor.config.ts" ]; then
  echo -e "  ${GREEN}✓ capacitor.config.ts presente${NC}"
  # Check appId
  APP_ID=$(grep -o "appId:.*" capacitor.config.ts | head -1 || echo "")
  APP_NAME=$(grep -o "appName:.*" capacitor.config.ts | head -1 || echo "")
  echo -e "  ${CYAN}  $APP_ID${NC}"
  echo -e "  ${CYAN}  $APP_NAME${NC}"
else
  echo -e "  ${RED}✗ capacitor.config.ts ausente${NC}"
  ERRORS=$((ERRORS + 1))
fi

# ─── 2. iOS Project ───
echo -e "\n${BOLD}[2/7] Projeto iOS...${NC}"
if [ -d "ios/App" ]; then
  echo -e "  ${GREEN}✓ Diretório ios/App existe${NC}"
  # Info.plist
  if [ -f "ios/App/App/Info.plist" ]; then
    echo -e "  ${GREEN}✓ Info.plist presente${NC}"
    # Check for required keys
    for key in NSCameraUsageDescription NSPhotoLibraryUsageDescription NSLocationWhenInUseUsageDescription; do
      if grep -q "$key" ios/App/App/Info.plist 2>/dev/null; then
        echo -e "  ${GREEN}  ✓ $key definido${NC}"
      else
        echo -e "  ${YELLOW}  ⚠ $key ausente — necessário se usar recurso${NC}"
        WARNINGS=$((WARNINGS + 1))
      fi
    done
  else
    echo -e "  ${YELLOW}⚠ Info.plist não encontrado${NC}"
    WARNINGS=$((WARNINGS + 1))
  fi
  # App Icons
  ICON_DIR="ios/App/App/Assets.xcassets/AppIcon.appiconset"
  if [ -d "$ICON_DIR" ]; then
    ICON_COUNT=$(find "$ICON_DIR" -name '*.png' 2>/dev/null | wc -l | tr -d ' ')
    if [ "$ICON_COUNT" -gt 0 ]; then
      echo -e "  ${GREEN}✓ $ICON_COUNT ícones iOS encontrados${NC}"
    else
      echo -e "  ${RED}✗ Nenhum ícone iOS (.png) no AppIcon.appiconset${NC}"
      ERRORS=$((ERRORS + 1))
    fi
  else
    echo -e "  ${RED}✗ AppIcon.appiconset não encontrado${NC}"
    ERRORS=$((ERRORS + 1))
  fi
  # Splash screen
  SPLASH_DIR="ios/App/App/Assets.xcassets/Splash.imageset"
  if [ -d "$SPLASH_DIR" ]; then
    echo -e "  ${GREEN}✓ Splash screen configurado${NC}"
  else
    echo -e "  ${YELLOW}⚠ Splash.imageset não encontrado${NC}"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo -e "  ${RED}✗ Projeto iOS não encontrado${NC}"
  ERRORS=$((ERRORS + 1))
fi

# ─── 3. Android Project ───
echo -e "\n${BOLD}[3/7] Projeto Android...${NC}"
if [ -d "android/app" ]; then
  echo -e "  ${GREEN}✓ Diretório android/app existe${NC}"
  # AndroidManifest
  MANIFEST="android/app/src/main/AndroidManifest.xml"
  if [ -f "$MANIFEST" ]; then
    echo -e "  ${GREEN}✓ AndroidManifest.xml presente${NC}"
    # Internet permission
    if grep -q "android.permission.INTERNET" "$MANIFEST" 2>/dev/null; then
      echo -e "  ${GREEN}  ✓ INTERNET permission${NC}"
    fi
    if grep -q "android.permission.CAMERA" "$MANIFEST" 2>/dev/null; then
      echo -e "  ${GREEN}  ✓ CAMERA permission${NC}"
    fi
  else
    echo -e "  ${RED}✗ AndroidManifest.xml ausente${NC}"
    ERRORS=$((ERRORS + 1))
  fi
  # Icons
  RES_DIR="android/app/src/main/res"
  if [ -d "$RES_DIR" ]; then
    ICON_DIRS=$(find "$RES_DIR" -name 'mipmap-*' -type d 2>/dev/null | wc -l | tr -d ' ')
    echo -e "  ${GREEN}✓ $ICON_DIRS densidades de ícone encontradas${NC}"
    # Splash
    SPLASH_FILES=$(find "$RES_DIR" -name 'splash*' -o -name 'launch*' 2>/dev/null | wc -l | tr -d ' ')
    if [ "$SPLASH_FILES" -gt 0 ]; then
      echo -e "  ${GREEN}✓ Splash screen encontrado${NC}"
    else
      echo -e "  ${YELLOW}⚠ Splash screen não encontrado em res/${NC}"
      WARNINGS=$((WARNINGS + 1))
    fi
  fi
  # build.gradle — version
  BUILD_GRADLE="android/app/build.gradle"
  if [ -f "$BUILD_GRADLE" ]; then
    VERSION_CODE=$(grep -o 'versionCode [0-9]*' "$BUILD_GRADLE" | head -1 || echo "não definido")
    VERSION_NAME=$(grep -o "versionName ['\"].*['\"]" "$BUILD_GRADLE" | head -1 || echo "não definido")
    echo -e "  ${CYAN}  $VERSION_CODE${NC}"
    echo -e "  ${CYAN}  $VERSION_NAME${NC}"
  fi
else
  echo -e "  ${RED}✗ Projeto Android não encontrado${NC}"
  ERRORS=$((ERRORS + 1))
fi

# ─── 4. PWA / Web ───
echo -e "\n${BOLD}[4/7] PWA / Web...${NC}"
if [ -f "public/manifest.json" ] || [ -f "public/manifest.webmanifest" ]; then
  echo -e "  ${GREEN}✓ Web manifest encontrado${NC}"
else
  echo -e "  ${YELLOW}⚠ manifest.json/webmanifest ausente em public/${NC}"
  WARNINGS=$((WARNINGS + 1))
fi
if [ -f "public/sw.js" ] || grep -rq "serviceWorker\|workbox" src/ vite.config.* 2>/dev/null; then
  echo -e "  ${GREEN}✓ Service Worker configurado${NC}"
else
  echo -e "  ${YELLOW}⚠ Service Worker não detectado${NC}"
  WARNINGS=$((WARNINGS + 1))
fi
# Favicon
if [ -f "public/favicon.ico" ] || [ -f "public/favicon.svg" ] || [ -f "public/favicon.png" ]; then
  echo -e "  ${GREEN}✓ Favicon presente${NC}"
else
  echo -e "  ${YELLOW}⚠ Favicon ausente${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# ─── 5. Environment Safety ───
echo -e "\n${BOLD}[5/7] Segurança de Environment...${NC}"
if [ -f ".env" ]; then
  if grep -q "\.env" .gitignore 2>/dev/null; then
    echo -e "  ${GREEN}✓ .env está no .gitignore${NC}"
  else
    echo -e "  ${RED}✗ .env NÃO está no .gitignore!${NC}"
    ERRORS=$((ERRORS + 1))
  fi
fi
if [ -f ".env.example" ] || [ -f ".env.local.template" ]; then
  echo -e "  ${GREEN}✓ Template de env presente${NC}"
else
  echo -e "  ${YELLOW}⚠ Sem .env.example ou template${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# ─── 6. TypeScript Strict ───
echo -e "\n${BOLD}[6/7] TypeScript Config...${NC}"
if [ -f "tsconfig.json" ]; then
  if grep -q '"strict": true' tsconfig.json 2>/dev/null; then
    echo -e "  ${GREEN}✓ strict mode ativado${NC}"
  else
    echo -e "  ${YELLOW}⚠ strict mode NÃO ativado no tsconfig${NC}"
    WARNINGS=$((WARNINGS + 1))
  fi
fi

# ─── 7. HTTPS / CSP ───
echo -e "\n${BOLD}[7/7] Security Headers...${NC}"
if grep -rq "Content-Security-Policy\|helmet\|csp" public/ src/ index.html 2>/dev/null; then
  echo -e "  ${GREEN}✓ CSP configurado${NC}"
else
  echo -e "  ${YELLOW}⚠ Content-Security-Policy não detectado${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# ─── Summary ───
echo -e "\n${BOLD}${CYAN}──────────────────────────────────────────${NC}"
echo -e "${BOLD}  RESUMO STORE READINESS${NC}"
echo -e "${CYAN}──────────────────────────────────────────${NC}"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "  ${GREEN}${BOLD}✓ PRONTO PARA STORES${NC}"
elif [ $ERRORS -eq 0 ]; then
  echo -e "  ${YELLOW}${BOLD}⚠ $WARNINGS pontos de atenção (não bloqueantes)${NC}"
else
  echo -e "  ${RED}${BOLD}✗ $ERRORS itens bloqueantes, $WARNINGS warnings${NC}"
fi
echo ""
