# Sessao Atual — Estado para Continuidade

## Branch: visual-redesign
## Ultimo commit: 617a717 (RPCs atômicas + push equipe + deep link + resumo promoter + Storage RLS)
## Mudancas locais: NÃO
## Preflight: 8/8 OK + 11/11 testes E2E

## Resumo da sessao (18 mar 2026 — sessao 2)

### O que foi feito — Plano Wizards v2 COMPLETO + Pendências backend

#### Commits da sessão (8 commits)
1. `4287fdf` — Fase 1: 6 correções críticas
2. `a606ead` — Fase 2+3: 10 componentes design system + wizards reorganizados
3. `8a2dfc4` — Fase 4: rascunho automático (tabela drafts + useDraft)
4. `e5845cf` — Fase 5: 16 índices + 10 constraints + classificação etária
5. `037db2e` — Fase 6: social proof, urgência, MV, return-to-context
6. `ef6fab5` — Memórias atualizadas
7. `617a717` — RPCs atômicas + push 2h equipe + deep link sócio + resumo promoter + Storage RLS

#### Auditoria completa (6 especialistas)
- Luna (frontend), Kai (backend), Zara (segurança), Iris (visual), Sage (DBA), Maya (produto)
- 8 personas mapeadas, benchmark 6 concorrentes, 26 problemas identificados
- Plano de 38 itens aprovado pelo Dan em 6 blocos (A-F)

#### Fase 1 — Correções Críticas
- Guard anti-double-click comunidade, toast ambos wizards, currentUserId CentralEventosView
- Validação upload 5MB JPEG/PNG/WebP, labels 10px mínimo (11 arquivos), scroll to error

#### Fase 2 — Design System (10 componentes)
- components/wizard/: FormWizard, StepIndicator, DraftBanner
- components/form/: InputField, TextAreaField, SectionTitle, UploadArea, AccordionSection
- components/CelebrationScreen.tsx

#### Fase 3 — Wizards Reorganizados
- Comunidade: 3→4 steps (Identidade+Fotos → Localização+Capacidade → Operação → Produtores+Taxas)
- Evento: 5→4 steps (Essencial → Ingressos+Classificação → Equipe+Listas → Revisar+Publicar)
- ClassificacaoInline com AccordionSection, CelebrationScreen no sucesso

#### Fase 4 — Rascunho Automático
- Tabela drafts no Supabase (RLS, trigger, índices, expira 30 dias)
- Hook useDraft.ts (auto-save 3s, carregar/restaurar/descartar)
- DraftBanner inline nos 2 wizards

#### Fase 5 — Backend Robusto
- 16 índices de performance (community_follows, eventos, tickets, transactions, rbac, etc.)
- 10 CHECK constraints + UNIQUE dedup evento
- classificacao_etaria (LIVRE/16+/18+) + limite_notificacoes_mes na comunidade

#### Fase 6 — Features Novas
- Social proof "X pessoas vão" nos cards + "Últimos ingressos" >80%
- Timer "Lote encerra em Xh" no detalhe
- Classificação etária: selector no wizard + badge no detalhe
- Benefício MV: Crown dourada ao lado do botão comprar
- Return-to-context: visitante volta ao evento após criar conta

#### Pendências backend (resolvidas pós-plano)
- RPC criar_evento_completo (transação atômica — 1 RPC em vez de 7+ INSERTs)
- RPC criar_comunidade_completa (transação atômica — INSERT + RBAC + slug)
- Push 2h antes pra equipe (INSERT push_agendados)
- Deep link convite sócio (/convite-socio/:eventoId/:socioId)
- Resumo promoter D+1 (listasService.gerarResumoPromoter)
- Storage RLS restritiva (só gerente RBAC ou masteradm faz upload)

#### Backlog — Status
- BatchActionBar: componente pronto, views sem UI de batch ainda
- FilterBar: componente pronto, views sem filtros avançados ainda
- Skeletons (Profile, Chat, Highlight): componentes prontos, views usam cache sem loading visível
- CARGO_DESCRICOES: JÁ INTEGRADO em CARGOS_PREDEFINIDOS
- 3 fontSize px: todos em gráficos Recharts (normal pra SVG)

### Migrations Supabase aplicadas nesta sessão
- tabela_drafts_rascunho_v2 (drafts + RLS + trigger)
- indices_performance_v3 (16 índices)
- check_constraints (10 CHECKs + UNIQUE dedup)
- classificacao_etaria_evento (classificacao_etaria + limite_notificacoes_mes)
- rpc_criar_evento_completo
- rpc_criar_comunidade_completa
- storage_rls_restritiva (bucket comunidades)

## Pendencias externas (sem mudança)
- Conta Apple Developer ($99/ano)
- Conta Google Play Console ($25)
- CNPJ + emails legais
- Android Studio
