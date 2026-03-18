# Sessao Atual — Estado para Continuidade

## Branch: visual-redesign
## Ultimo commit: 895408c (docs: fix referências)
## Mudancas locais: ~90 arquivos modificados (visual + wizards + testes + fontes)
## TSC: 0 erros

## O que foi feito na sessao 4 (18 mar 2026)

### Bloco A — C9 Schema Reference
- supabase/SCHEMA-REFERENCE.md criado (94 tabelas/views, 50 RPCs, 219 migrations)

### Bloco B — Wizards integrados
- FormWizard: X→ArrowLeft, safe-area, topSlot, scrollRef via ref
- StepIndicator: barra linear→bolinhas numeradas com check
- DraftBanner: localStorage→props puras (savedAt, onRestore, onDiscard)
- CriarComunidade e CriarEvento: integrados com FormWizard+DraftBanner

### Bloco C — Testes (28 novos)
- tests/unit/financeiro.test.ts (10 testes: CDC, reembolso, exports)
- tests/unit/auth.test.ts (8 testes: profileToMembro, login)
- tests/unit/rbac-permissoes.test.ts (10 testes: permissoes, cargos)

### EventCard
- Social proof removido (so na pagina do evento)
- Aspect ratio: 4/5
- Footer fixo: h-[3.25rem]
- Badges padronizados: mesma altura h-[1.375rem], px-2 py-1 rounded-lg
- Badge "ACONTECENDO AGORA": fundo verde pulsante + icone Radio preto
- Keyframe glowPulse adicionado em app.css

### Fonte Playfair
- Playfair Display SC→Playfair Display Bold 700 em TODO o app
- Google Fonts (index.html): Playfair+Display:wght@700
- CSS .font-serif: Playfair Display, font-weight 700
- constants.ts: FONTS.serif atualizado
- Italic removido de TODOS os Playfair (~90 arquivos)
- Italic Inter preservado (subtitulos, textos auxiliares)

### Home — Estado atual
- Saudacao: "Boa noite, DANIEL" + "BEM-VINDO AO VANTA" dourado caps
- VANTA Indica (Highlights): pt-6→pt-2 (subiu)
- Perto de Voce (NearYouSection): ativa, usando EventCarousel
- EventFeed (categorias): ativo, usando EventCarousel, sem "Outros"
- ThisWeekSection: arquivo vazio, removida da HomeView — reconstruir
- LiveNowSection: removida da HomeView (arquivo existe)
- FriendsGoingSection: removida da HomeView (arquivo existe)
- ForYouSection: removida da HomeView (arquivo existe)
- EventCarousel.tsx: componente unico de carrossel criado

### 4 eventos de teste no banco
- TESTE Badge — Acontecendo Agora (Mansion Club)
- TESTE Badge — Comeca em Breve (Mansion Club)
- TESTE Badge — Acaba em Breve (Mansion Club)
- TESTE Badge — Data Normal (Mansion Club)

## Decisoes do Dan ativas
- Refund automatico ate R$100, manual acima
- Saques: preparar automatico
- Componentes wizard/form: integrados nos wizards
- EventCard: sem social proof, aspect 4/5, badges mesma altura
- Acontecendo Agora: badge discreto no card (sem secao separada)
- Ordem Home: Perto→Esta Semana→Categorias
- Fonte: Playfair Display Bold 700 (sem SC, sem italic) — SEMPRE
- Padrao: titulos=Playfair, corpo=Inter, labels=caps tracking
- Luna demitida — Iris assume visual
- "Outros" removido do EventFeed

## Proxima sessao — prioridades
1. Resolver alinhamento dos carrosseis (paddingInline no mobile)
2. Reconstruir ThisWeekSection com EventCarousel
3. Padronizar estilos de texto restantes (Iris)
4. Reconectar FriendsGoingSection e ForYouSection
5. Apagar eventos de teste do banco
6. C21/C22 — Testes (continuar cobertura)
7. C17-C20 — Mobile (depende contas Apple/Google)

## Pendencias externas (sem mudanca)
- Conta Apple Developer ($99/ano)
- Conta Google Play Console ($25)
- CNPJ + emails legais
- Android Studio
