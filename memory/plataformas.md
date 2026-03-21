# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 16:47
# Plataformas — PWA, Lojas, E2E

## 🔴 REGRA ABSOLUTA — NUNCA ESQUECER
**O VANTA é simultaneamente APP NATIVO (App Store + Google Play) E SITE (browser).**
- Todo código DEVE funcionar nos dois contextos sem exceção.
- React Router v6 gerencia URLs — funciona no WebView do Capacitor E no browser.
- No browser: URLs visíveis, compartilháveis, indexáveis (SEO).
- No app nativo (Capacitor): mesmas rotas funcionam internamente, usuário NÃO vê barra de URL.
- Deep links (`vfronta.com/evento/slug`) abrem o app nativo via Universal Links (iOS) / App Links (Android).
- **NUNCA tomar decisão que quebre um dos dois contextos.** Se algo é "só pra web" ou "só pra app", PERGUNTAR ao usuário antes.

## PWA (funcional)
- `vite-plugin-pwa` com Workbox (generateSW)
- `manifest.json`: 5 ícones no manifest (48, 72, 96, 192, 512) + maskable, shortcuts, screenshots
- Meta tags iOS completas (apple-mobile-web-app-capable, theme-color, OG)
- Service Worker Firebase para push
- `public/.well-known/assetlinks.json` — placeholder (SHA-256 pendente)
- `public/.well-known/apple-app-site-association` — placeholder (TEAMID pendente)

## Ícones disponíveis em `public/`
48, 72, 96, 144, 192, 512, 1024 + apple-touch-icon + favicon

## Capacitor (projetos nativos GERADOS)
- `capacitor.config.ts` — appId `com.maisvanta.app`, webDir `dist`
- Plugins: SplashScreen (#050505), StatusBar (DARK), PushNotifications, Browser (checkout externo)
- `@capacitor/core`, `@capacitor/ios`, `@capacitor/android`, `@capacitor/app`, `@capacitor/push-notifications`, `@capacitor/browser` em dependencies
- `@capacitor/cli` em devDependencies
- Projetos gerados: `ios/App/App.xcodeproj` (android pendente — Android Studio não instalado)
- Sincronizado: `npx cap sync` OK
- Abrir: `npm run cap:ios` (Xcode) ou `npm run cap:android` (Android Studio)
- Deep links: `deepLinkService.ts` escuta `appUrlOpen` → navega pra evento/comunidade/checkout/wallet/perfil
- hostname: `maisvanta.com` configurado no capacitor.config.ts

## Playwright E2E (configurado, testes NÃO rodados)
- `playwright.config.ts` — 3 projetos: Mobile Chrome (Pixel 7), Mobile Safari (iPhone 14), Desktop Chrome
- baseURL: `http://localhost:5173`, webServer auto (`npm run dev`)
- 14 specs em `tests/e2e/`:
  - `acessibilidade.spec.ts` — ARIA, contraste, navegação teclado
  - `admin-flow.spec.ts` — fluxos completos admin
  - `admin.spec.ts` — painel admin, sidebar, busca membros
  - `auth.spec.ts` — login/logout
  - `busca.spec.ts` — busca de eventos, pessoas, lugares
  - `erros-globais.spec.ts` — tratamento de erros, fallbacks
  - `evento-detalhe.spec.ts` — página de detalhe do evento
  - `feed.spec.ts` — feed e listagens
  - `navigation.spec.ts` — tab bar, console.error check
  - `performance.spec.ts` — métricas de performance
  - `pwa.spec.ts` — manifest, SW, ícones, meta tags
  - `radar.spec.ts` — mapa, filtros, geolocalização
  - `responsive.spec.ts` — iPhone SE, iPhone 14, iPad, Desktop
  - `seguranca.spec.ts` — XSS, CSRF, headers
- Scripts: `npm run test:e2e`, `test:e2e:ui`, `test:e2e:headed`

## Scripts de loja
- `npm run generate-icons` — gera ícones extras via sips (macOS)
- `npm run cap:sync` — build + cap sync
- `npm run cap:ios` / `cap:android` — abrir IDE nativa

## Checklist de loja
- `docs/setup/STORE_CHECKLIST.md` — Google Play + Apple App Store completo

## Pendências para publicação
1. Conta Apple Developer ($99/ano)
2. Conta Google Play Console ($25)
3. SHA-256 real no assetlinks.json
4. TEAMID real no apple-app-site-association
5. Screenshots reais para lojas
6. Política de privacidade + termos de uso (URLs públicas)
7. Rodar `npm run test:e2e` para validar specs
8. `npx cap add ios/android` para gerar projetos nativos
