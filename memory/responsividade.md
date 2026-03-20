# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-11 06:45
# Memória — Responsividade

## Scaling Fluido Proporcional (CRÍTICO)
- **ResizeObserver** em App.tsx (useEffect com `[authLoading]`) ajusta `html font-size`
- Fórmula: `fs = (Math.max(360, Math.min(el.offsetWidth, 500)) / 375) * 16`
- 375px = 16px (referência design). 360px = 15.36px (mínimo). 500px = 21.33px (máximo)
- **Admin panel mobile**: scaling fluido igual ao app (320-500px). Admin desktop: font-size 16px (conteúdo 500px + sidebar)
- **Tudo em rem**: 2546 `text-[Npx]` convertidos, 1635 `size={N}` (Lucide icons) convertidos
- Container app: `max-w-[500px]` em px literal (NÃO escala com rem — intencional)
- Valores NÃO convertidos: `w-[1-2px]`, `h-[1-2px]` (decorativos), `rounded-[2px]`, `borderLeftWidth: '3px'`
- **Virtualizers**: devem usar `getItemHeight()` dinâmico baseado no font-size, não px fixo

## Regras (CLAUDE.md)
- Mobile-first (iOS, Android, browser mobile)
- ZERO scroll horizontal
- ZERO valores fixos de largura → usar %, flex, w-full, min-w-0, truncate
- Textos longos: truncate ou line-clamp-N
- Modais: absolute inset-0 (NUNCA fixed inset-0). Se dentro de scroll → usar `<ModalPortal>`
- Exceção: páginas standalone podem usar `h-[100dvh]` e fixed inset-0 (NUNCA `h-screen`)
- Safe area PWA: `style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}` no header, `pb-safe` / `env(safe-area-inset-bottom)` no footer
- `-webkit-tap-highlight-color: transparent` no CSS global (index.html)
- Tap targets interativos: `min-h-[44px]` (Apple HIG)
- Páginas standalone: `h-[100dvh]` em vez de `h-screen` (respeita barra de endereço mobile)
- Views fullscreen (absolute inset-0) com header próprio: `style={{ paddingTop: 'max(Nrem, env(safe-area-inset-top, Nrem))' }}`

## Contêiner Master (App.tsx)
- Outer: fixed inset-0 flex flex-col items-center overflow-hidden, bg: radial-gradient(ellipse at center, #1a1a1a → #0a0a0a → #020202)
- Inner (id="vanta-app"): w-full flex-1 overflow-hidden flex flex-col bg-[#0A0A0A]
- App normal: max-w-[500px]
- Admin: conteúdo max-w-[500px] (igual app) + sidebar ao lado no desktop
- Desktop ≥768px: sidebar fixa + conteúdo 500px. Mobile: sidebar fechada, conteúdo 360-500px
- Regra universal: TUDO cabe em 360px sem cortar. Escala proporcionalmente até 500px

## FocusView (scroll)
```
✅ <div className="absolute inset-0 flex flex-col overflow-hidden">
     <div className="flex-1 overflow-y-auto no-scrollbar">
❌ <div className="min-h-full">  ← scroll travado
```

## Scroll horizontal tabs
overflow-x-auto snap-x no-scrollbar + shrink-0

## Admin tabs/pills — flex-wrap
- Quando muitos itens: `flex-wrap` no container (sem overflow-x-auto, sem shrink-0)
- Fontes mínimas: 6px (0.375rem)
- Espaçamento: `gap-1.5` ou `gap-2` entre pills

## Centralização vertical em scroll views
- Pattern: scroll container `display: flex; flex-direction: column` + inner div `margin: auto 0`
- Quando conteúdo < viewport: centraliza com espaço igual acima/abaixo
- Quando conteúdo > viewport: scroll normal (margin auto colapsa para 0)
- Usado em: ClubeOptInView

## Novos Bottom-Sheets — Regra Obrigatória
- **SEMPRE usar `<BottomSheet>` de `components/BottomSheet.tsx`** para novos bottom-sheets
- O componente já inclui: backdrop, animação, pill handle, safe-area-inset-bottom
- Se não puder usar o componente, DEVE ter `style={{ paddingBottom: 'max(Nrem, env(safe-area-inset-bottom, Nrem))' }}`
- lint:layout bloqueia `pb-8/10/12` em `rounded-t-*` e avisa se falta `safe-area-inset-bottom`

## Tipografia
Playfair Display SC Bold 700, clamp responsivo

## Filter Modals (Busca)
- Backdrop: bg-black/80 backdrop-blur-md (escuro)

## Mapa de Z-Index (faixas oficiais)
| Faixa | Uso | Exemplos |
|-------|-----|----------|
| 0-50 | Conteúdo inline, badges, EventCard overlays | EventCard z-[35] |
| 50-60 | Bottom-sheets e modais internos de views | ReviewModal z-[60], VantaDatePicker z-[60] |
| 70-80 | Modais secundários dentro de views | MaisVantaBeneficioModal z-[70/80], CapacidadeModal z-[70] |
| 100-120 | Sub-overlays, CitySelector, NotificationPanel | CitySelector z-[100], NotificationPanel z-[120] |
| 150 | Admin blocked state | AdminHub blocked z-[150] |
| 160-180 | Views overlay empilhadas (Home → detail) | AllEventsView z-[160], CityView z-[170], ComunidadePublicView z-[180] |
| 200 | Modais globais, filtros, PublicProfile | SessionExpiredModal z-[200], HomeFilterOverlay z-[200], PublicProfilePreview z-[200] |
| 250 | Modais de confirmação acima de views | PresencaConfirmationModal z-[250] |
| 300 | Modais de sucesso/resultado | AppModals success z-[300], WalletLockScreen z-[300], CheckoutPage modal z-[300] |
| 340-350 | Fluxos de auth, guest modal | AuthModal z-[350], GuestModal z-[340] |
| 400 | Modais críticos (legal, CPF, onboarding, crop) | CompletarPerfilCPF z-[400], OnboardingView z-[400], ImageCropperModal z-[400], ReportModal z-[400], LegalView z-[400] |
| 500 | Modais acima de tudo (reset password, unsaved, picker, confirm) | ResetPassword z-[500], UnsavedChangesModal z-[500], VantaPickerModal z-[600] |
| 600 | Toast | Toast z-[600] |
| 2000 | Modais acima de mapas (Leaflet usa z-index altos) | PremiumCalendar z-[2000] |
| 9999-10000 | DevTools (nunca em produção) | DevQuickLogin z-[9999], DevLogPanel z-[9999] |

**Regra**: novo modal deve usar a faixa correspondente ao seu tipo. Nunca inventar z-index fora das faixas.

## Páginas Standalone (podem usar `h-[100dvh]` e `fixed inset-0`)
Lista exaustiva — qualquer outra página segue AppShell:
- `CheckoutPage` — `/checkout/:slug`
- `CheckoutSuccessPage` — `/checkout/sucesso`
- `SuccessScreen` — tela de sucesso pós-compra
- `EventLandingPage` — `/evento/:slug`
- `AceitarConviteMVPage` — `/convite-mv/:token`
- `ParceiroDashboardPage` — `/parceiro`
- `ResetPasswordView` — overlay acima do app (z-[500])

## FocusViews — Lista completa
`isFocusView = true` faz o `<main>` receber `overflow-hidden` em vez de `overflow-y-auto`.
Views dentro do main devem gerenciar seu próprio scroll.

**FocusView ativo quando**:
- `PERFIL` com `subView !== 'MAIN'` (EditProfile, Wallet, Clube, Meia-Entrada, etc)
- `MENSAGENS` com `profileSubView === 'CHAT_ROOM'`
- `ADMIN_HUB` (sempre)
- `selectedMember` ativo (PublicProfilePreview aberto)

**NÃO é FocusView** (main scrola normalmente):
- `INICIO` (HomeView)
- `RADAR` (RadarView)
- `BUSCAR` (SearchView — tem absolute inset-0 próprio)
- `PERFIL` com `subView === 'MAIN'`

Consequência: modais dentro de componentes nas tabs acima DEVEM usar `<ModalPortal>` se precisam cobrir a tela.

## Overlays Empilhados — Comportamento
Views overlay do App.tsx empilham por z-index:
1. AllEventsView / AllPartnersView / AllBeneficiosView — z-[160]
2. CityView — z-[170]
3. ComunidadePublicView — z-[180]
4. PublicProfilePreview — z-[200]

Modais DENTRO de uma view overlay usam z-index relativo àquela view (z-[60] a z-[110]).
Cada overlay tem seu próprio `absolute inset-0` → modais internos se ancoram nele corretamente.

## Modal vs Bottom-Sheet — Quando usar qual
- **Modal** (fullscreen ou centered): ações destrutivas, confirmações, formulários complexos, crop de imagem
- **Bottom-Sheet** (slide de baixo): seleção simples, opções rápidas, pickers
- Componente `<BottomSheet>` de `components/BottomSheet.tsx` existe mas não é usado ativamente — bottom-sheets atuais são inline
- Todo bottom-sheet DEVE ter safe-area-inset-bottom

## Backdrop — Padrão por tipo
- **Modais centralizados**: `bg-black/80 backdrop-blur-sm` ou `backdrop-blur-xl`
- **Bottom-sheets**: `bg-black/70 backdrop-blur-sm`
- **Filtros**: `bg-black/80 backdrop-blur-md`
- **Views overlay**: sem backdrop (cobrem tela inteira com bg sólido)

## NotificationPanel — Posição
- Renderizado fora do `<main>`, dentro do AppShell (L710 App.tsx)
- z-[120], absolute no #vanta-app
- Não é afetado por isFocusView

## Toast — Posição e Z-Index
- `components/Toast.tsx` → z-[600]
- Renderizado via `<GlobalToastContainer>` fora do main (L576 App.tsx)
- Aparece ACIMA de todos os modais (exceto DevTools)
- Position: absolute top-0, pointer-events-none

## Scroll Restoration
- Home (overflow-y-auto no main): posição mantida enquanto tab INICIO estiver ativa
- Ao trocar de tab e voltar: scroll reseta (componente remonta)
- FocusViews: cada view gerencia scroll próprio, não há restoration automática
