# Checklist — Publicação nas Lojas

## Google Play Store (TWA)

### Conta & Configuração
- [ ] Conta Google Play Console criada ($25 único)
- [ ] Informações do desenvolvedor preenchidas
- [ ] Classificação de conteúdo (questionário IARC)

### Assets Obrigatórios
- [ ] Ícone 512x512 (`public/icon-512.png`) ✅ existe
- [ ] Feature Graphic 1024x500 (banner da loja)
- [ ] Screenshots telefone (mín. 2, 1080x1920 recomendado)
- [ ] Screenshots tablet (opcional mas recomendado)

### Técnico
- [ ] `public/.well-known/assetlinks.json` com SHA-256 real do certificado
- [ ] TWA gerado via PWABuilder (APK wrapper)
- [ ] Manifest.json válido ✅
- [ ] Service Worker funcional ✅
- [ ] HTTPS no domínio ✅

### Políticas
- [ ] Política de privacidade (URL pública)
- [ ] Termos de uso (URL pública)
- [ ] Declaração de permissões (push notifications, câmera)

---

## Apple App Store (Capacitor)

### Conta & Configuração
- [ ] Conta Apple Developer criada ($99/ano)
- [ ] App ID registrado: `com.maisvanta.app`
- [ ] Certificados de distribuição gerados
- [ ] Provisioning profile criado

### Assets Obrigatórios
- [ ] Ícone 1024x1024 sem transparência, sem alpha (`public/icon-1024.png`)
- [ ] Screenshots iPhone 6.7" — 1290x2796 (iPhone 14 Pro Max)
- [ ] Screenshots iPhone 6.5" — 1242x2688 (iPhone 11 Pro Max)
- [ ] Screenshots iPad 12.9" — 2048x2732 (se suportar iPad)

### Técnico
- [ ] Capacitor configurado (`capacitor.config.ts`) ✅
- [ ] `npx cap add ios` executado
- [ ] `npm run build && npx cap sync` sem erros
- [ ] Build via Xcode (requer macOS)
- [ ] TestFlight: upload de build de teste

### Splash Screens iOS
- [ ] Geradas via Capacitor SplashScreen plugin ou manualmente
- [ ] Background #050505 com logo centralizado
- [ ] Todos os tamanhos de dispositivo cobertos

### Políticas
- [ ] Política de privacidade (URL pública)
- [ ] Descrição detalhada do app
- [ ] Keywords (máx 100 caracteres)
- [ ] Categoria principal: Entretenimento
- [ ] Categoria secundária: Social Networking
- [ ] Informações de contato

---

## Ambas as Lojas

### Metadados
- [ ] Nome do app: **VANTA**
- [ ] Descrição curta: "Experiências exclusivas de noite premium"
- [ ] Descrição longa (até 4000 chars)
- [ ] URL do site: maisvanta.com

### Pré-requisitos Técnicos
- [ ] PWA funcional com offline support ✅
- [ ] Testes E2E passando (Playwright) ✅ configurado
- [ ] Performance adequada (Lighthouse > 80)
- [ ] Sem crashes críticos em produção
- [ ] Push notifications funcionando

### URLs Necessárias (hospedar antes de submeter)
- [ ] `https://maisvanta.com/privacy` — Política de Privacidade
- [ ] `https://maisvanta.com/terms` — Termos de Uso
- [ ] `https://maisvanta.com/.well-known/assetlinks.json` — Digital Asset Links (Google)

---

## Comandos Úteis

```bash
# Gerar ícones extras
node scripts/generate-icons.mjs

# Build do app
npm run build

# Capacitor — sincronizar
npx cap sync

# Capacitor — abrir Xcode
npx cap open ios

# Capacitor — abrir Android Studio
npx cap open android

# Testes E2E
npm run test:e2e

# Lighthouse audit
npm run lighthouse
```
