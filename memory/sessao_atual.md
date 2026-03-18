# Sessao Atual — Estado para Continuidade

## Branch: visual-redesign
## Ultimo commit: 037db2e (Fase 6 features novas)
## Mudancas locais: NÃO
## Preflight: 8/8 OK + 11/11 testes E2E

## Resumo da sessao (18 mar 2026 — sessao 2)

### O que foi feito — Plano Wizards v2 COMPLETO (38 itens, 6 fases)

#### Fase 1 — Correções Críticas (commit 4287fdf)
- Guard anti-double-click criação de comunidade
- Toast sucesso/erro em ambos wizards
- currentUserId/currentUserNome passados na CentralEventosView
- Validação upload: tipo real JPEG/PNG/WebP + máx 5MB
- Labels 7-8px → 10px mínimo (11 arquivos)
- Scroll to error (setErroScroll + scrollRef)

#### Fase 2 — Design System (commit a606ead)
- 10 componentes: FormWizard, StepIndicator, DraftBanner, InputField, TextAreaField, SectionTitle, UploadArea, AccordionSection, CelebrationScreen + 2 barrel exports
- Diretórios: components/wizard/, components/form/

#### Fase 3 — Wizards Reorganizados (commit a606ead)
- Comunidade: 3→4 steps (Identidade+Fotos → Localização+Capacidade → Operação → Produtores+Taxas)
- Evento: 5→4 steps (Essencial → Ingressos+Classificação → Equipe+Listas → Revisar+Publicar)
- ClassificacaoInline com AccordionSection (formato/estilo/experiência)
- Step Revisar com mini preview card + resumo + split financeiro
- CelebrationScreen no sucesso de ambos wizards
- Step3Fotos.tsx → _deprecated/

#### Fase 4 — Rascunho Automático (commit 8a2dfc4)
- Migration: tabela drafts no Supabase (RLS, trigger, índices)
- Hook useDraft.ts: auto-save debounce 3s, carregar/restaurar/descartar
- Integrado nos 2 wizards com DraftBanner inline
- Rascunho expira em 30 dias, unique por user+tipo+comunidade

#### Fase 5 — Backend Robusto (commit e5845cf)
- 16 índices de performance
- 10 CHECK constraints + UNIQUE dedup evento
- classificacao_etaria no evento (LIVRE / 16+ / 18+)
- limite_notificacoes_mes na comunidade (default 3, editável pelo master)
- Types supabase.ts regenerados

#### Fase 6 — Features Novas (commit 037db2e)
- Social proof: "X pessoas vão" nos cards + "Últimos ingressos" >80%
- Timer "Lote encerra em Xh" no detalhe do evento
- Classificação etária: selector no wizard + badge no detalhe
- Benefício MV: Crown dourada + "Você tem benefício" ao lado do botão comprar
- Return-to-context: visitante volta ao evento após criar conta

### Arquivos criados nesta sessão
- components/wizard/FormWizard.tsx, StepIndicator.tsx, DraftBanner.tsx, index.ts
- components/form/InputField.tsx, TextAreaField.tsx, SectionTitle.tsx, UploadArea.tsx, AccordionSection.tsx, index.ts
- components/CelebrationScreen.tsx
- features/admin/views/criarComunidade/Step3Operacao.tsx, Step4ProdutoresTaxas.tsx
- hooks/useDraft.ts
- memory/plano_wizards_v2.md

### Arquivos modificados nesta sessão
- features/admin/views/criarComunidade/index.tsx, Step1Identidade.tsx, Step2Localizacao.tsx
- features/admin/views/CriarEventoView.tsx
- features/admin/views/criarEvento/Step1Evento.tsx, Step2Ingressos.tsx, Step3Listas.tsx, Step4EquipeCasa.tsx, Step4EquipeSocio.tsx, Step5Financeiro.tsx, TipoEventoScreen.tsx, CapacidadeModal.tsx
- features/admin/views/comunidades/CentralEventosView.tsx, ComunidadeDetalheView.tsx
- features/admin/services/eventosAdminCrud.ts, eventosAdminCore.ts
- modules/event-detail/EventDetailView.tsx, components/EventFooter.tsx
- components/EventCard.tsx, AuthModal.tsx
- hooks/useAppHandlers.ts, App.tsx
- services/supabaseVantaService.ts
- types/eventos.ts, types/supabase.ts

## Pendências do plano (não implementadas)
- [ ] RPC criar_evento_completo (transação atômica) — Fase 5 parcial
- [ ] RPC criar_comunidade_completa (transação atômica) — Fase 5 parcial
- [ ] Edge Function notificações batch para seguidores
- [ ] Importação de evento anterior com checkboxes (melhorada)
- [ ] Convite sócio via deep link WhatsApp/email
- [ ] Push 2h antes pra equipe
- [ ] Resumo promoter D+1
- [ ] Storage RLS restritiva (verificar dono da comunidade)

## Pendências anteriores (sem mudança)
- [ ] Integrar BatchActionBar e FilterBar nas views
- [ ] Aplicar ProfileSkeleton, ChatItemSkeleton, HighlightCardSkeleton
- [ ] CARGO_DESCRICOES — exibir na UI
- [ ] 3 fontSize em px hardcoded

## Pendencias externas (sem mudança)
- Conta Apple Developer ($99/ano)
- Conta Google Play Console ($25)
- CNPJ + emails legais
- Android Studio
