# M7 — Master Tools

## F7.1 — CURADORIA DE PERFIS (CuradoriaView)
- QUEM: master | ONDE: CuradoriaView (3 abas: Perfis, Clube, Novos)
- ACOES: atribuir tags, marcar curadoria concluida, adicionar notas, destaque
- COMO: adminService.setTagsCuradoria(), concluirCuradoria(), setNotas(), setDestaque()
- TABELAS: profiles (UPDATE tags_curadoria, curadoria_concluida, notas_admin, destaque_curadoria)
- SUB-ABA Clube: aprovar/rejeitar solicitacoes MAIS VANTA (ver F2.14)
- SUB-ABA Novos: perfis que ainda nao passaram por curadoria
- NOTIF: nenhuma (curadoria e interna)
- STATUS: OK

## F7.2 — CATEGORIAS (CategoriasAdminView)
- QUEM: master | ONDE: CategoriasAdminView
- ACOES: CRUD de 4 tipos: Formatos, Estilos, Experiencias, Outros(interesses)
- COMO: supabase direto (nao usa service dedicado)
- TABELAS: formatos (CRUD), estilos (CRUD), experiencias (CRUD), interesses (CRUD)
- CAMPOS: id, label, ativo, ordem
- 4 ABAS: cada uma opera na sua tabela Supabase
- STATUS: OK

## F7.3 — VANTA INDICA (VantaIndicaView)
- QUEM: master | ONDE: VantaIndicaView
- ACOES: CRUD cards de recomendacao que aparecem no Home feed
- COMO: adminService.getVantaIndica(), criarVantaIndica(), editarVantaIndica(), toggleVantaIndica()
- TABELAS: vanta_indica (INSERT/UPDATE/SELECT)
- DOWNSTREAM: HomeView exibe cards Vanta Indica
- STATUS: OK

## F7.4 — EVENTOS PENDENTES (EventosPendentesView)
- QUEM: master | ONDE: EventosPendentesView (badge na sidebar)
- ACOES: aprovar/rejeitar evento, enviar Proposta VANTA (eventos SEM VENDA)
- COMO: eventosAdminAprovacao (aprovarEvento, rejeitarEvento, enviarPropostaVanta)
- TABELAS: eventos_admin (UPDATE status)
- NOTIF: notify() ao criador "Evento aprovado/rejeitado/proposta"
- SUB-FLUXO Proposta VANTA: comissao %, codigo afiliado, ate 3 rodadas
- STATUS: OK

## F7.5 — DEFINIR CARGOS (DefinirCargosView)
- QUEM: master | ONDE: DefinirCargosView
- ACOES: atribuir cargo a usuario em comunidade ou evento
- COMO: rbacService + comunidadesService + eventosAdminService + authService.buscarMembros()
- FLUXO: busca membro por email → seleciona destino (comunidade ou evento) → seleciona cargo (predefinido ou custom)
- MODOS: ADICIONAR (busca + atribui) ou IMPORTAR (staff em lote)
- CARGOS PREDEFINIDOS: CARGO_LABELS + CARGO_PERMISSOES do rbacService
- CARGO CUSTOM: PainelCargoCustom com permissoes granulares
- TABELAS: atribuicoes_rbac (INSERT)
- SUB-COMPONENTES: PainelCargoCustom, ImportarStaffPanel, SuccessScreen, ConfirmacaoModal
- STATUS: OK

## F7.6 — HEALTH CHECK (DatabaseHealthView)
- QUEM: master | ONDE: DatabaseHealthView
- ACOES: diagnostico de perfis (incompletos, sem email, sem cidade), broadcast
- COMO: queries diretas profiles
- TABELAS: profiles (SELECT com filtros diagnostico)
- STATUS: OK

## F7.7 — SUPABASE DIAGNOSTIC (SupabaseDiagnosticView)
- QUEM: master | ONDE: SupabaseDiagnosticView
- ACOES: debug Supabase (status, tabelas, RLS, storage)
- COMO: queries de diagnostico
- STATUS: OK (ferramenta dev)

## F7.8 — AUDIT LOG (AuditLogView)
- QUEM: master | ONDE: AuditLogView
- ACOES: ver log de acoes (quem fez o que, quando)
- COMO: auditService.getLogs()
- TABELAS: audit_logs (SELECT)
- STATUS: OK

## F7.9 — NOTIFICACOES/CAMPANHAS (NotificacoesAdminView)
- QUEM: master | ONDE: NotificacoesAdminView
- ACOES: enviar notificacao massa (6 tipos de acao)
- COMO: campanhasService
- CANAIS: IN_APP (notificationsService) + PUSH (send-push) + EMAIL (send-invite)
- TIPOS: Aviso Geral, Novo Evento, Completar Cadastro, Ver Comunidade, Convite Clube, Ir para Carteira
- DEEP LINK: cada tipo navega pra tela correta
- STATUS: OK

## F7.10 — COMPROVANTES MEIA (GestaoComprovantesView)
- QUEM: master | ONDE: GestaoComprovantesView
- ACOES: aprovar (com validade) / rejeitar (com motivo) comprovante
- COMO: comprovanteService.aprovarComprovante() / rejeitarComprovante()
- TABELAS: comprovantes_meia (SELECT/UPDATE status, aprovado_por, aprovado_em, validade_ate, motivo_rejeicao)
- STORAGE: bucket 'comprovantes-meia' (fotos do comprovante)
- 3 ABAS: Pendentes, Aprovados, Outros (rejeitados/vencidos)
- VALIDADE: 3m, 6m, 1a, 2a, 5a, ilimitado
- VENCIMENTO: comprovanteService.refresh() verifica validade e marca VENCIDO automaticamente
- DOWNSTREAM: checkout verifica elegibilidade via comprovanteService
- TIPOS: TIPOS_COMPROVANTE_MEIA (definido em types)
- STATUS: OK

## F7.11 — PRODUCT ANALYTICS (ProductAnalyticsView)
- QUEM: master | ONDE: ProductAnalyticsView
- ACOES: ver metricas de produto (DAU, MAU, retention, etc)
- COMO: dashboardAnalyticsService + analyticsService
- TABELAS: analytics_events, pmf_responses
- STATUS: OK

## F7.12 — RELATORIOS
- QUEM: master/gerente | ONDE: RelatorioEventoView, RelatorioComunidadeView, RelatorioMasterView
- ACOES: gerar/exportar relatorios
- COMO: relatorioService.gerarRelatorio()
- TABELAS: eventos_admin, tickets_caixa, reviews_evento
- SUB-FLUXO export: exportRelatorio.ts, exportRelatorioComunidade.ts
- STATUS: OK

## F7.13 — CONVITES SOCIO (ConvitesSocioView)
- QUEM: master (visualiza) | ONDE: ConvitesSocioView
- ACOES: ver convites de socio pendentes/aceitos/recusados
- COMO: eventosAdminService
- TABELAS: equipe_evento (SELECT convites)
- STATUS: OK
