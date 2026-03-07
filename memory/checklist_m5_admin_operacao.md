# M5 — Admin Evento + Operacao do Dia

## F5.1 — CRIAR EVENTO (wizard)
- QUEM: gerente/socio | ONDE: CriarEventoView (wizard multi-step)
- COMO: eventosAdminCrud.criarEvento()
- TABELAS: eventos_admin (INSERT), lotes (INSERT), variacoes_ingresso (INSERT), equipe_evento (INSERT)
- STEPS:
  - Step1Evento: nome, descricao, data, local, lat/lng, categoria, banner
  - Step2Ingressos: lotes (nome, preco, quantidade, data abertura/fechamento)
  - Step3Listas: regras de lista, cotas promoter
  - Step4Equipe: equipe da casa + convite socio (se COM SOCIO)
  - Step5Financeiro: split produtor/socio, fee mode (absorver/repassar)
- PRE-REQUISITO: TipoEventoScreen (COM/SEM VENDA × COM/SEM SOCIO)
- NOTIF: notify() ao master "Evento pendente de aprovacao" — IN_APP + PUSH
- STATUS: OK

## F5.2 — EDITAR EVENTO
- QUEM: gerente/socio | ONDE: EditarEventoView
- COMO: eventosAdminCrud.editarEvento()
- TABELAS: eventos_admin (UPDATE), lotes (UPDATE/INSERT/DELETE), variacoes_ingresso, equipe_evento
- STATUS: OK

## F5.3 — COPIAR EVENTO
- QUEM: gerente | ONDE: DuplicarModal (via CriarEventoView botao "Importar dados")
- COMO: CopiarModal lista eventos anteriores, gerente seleciona → pre-preenche Steps 2-4
- COPIA: lotes (variacoes zeradas), listas (regras), equipe
- NAO COPIA: vendas, check-ins, reviews, foto, nome, datas
- NAO cria evento no banco — apenas preenche formulario
- STATUS: PENDENTE (usuario pediu para anotar)

## F5.4 — DASHBOARD EVENTO (EventoDashboard)
- QUEM: gerente/socio | ONDE: EventoDashboard (9 sub-views via tabs)
- SUB-VIEWS:
  - TabGeral: KPIs (vendidos, receita, check-ins, cortesias)
  - TabIngressos: lista de ingressos vendidos
  - TabEquipe: equipe do evento
  - TabEquipeSocio: equipe do socio
  - TabEquipePromoter: promoters + cotas
  - TabListas: listas do evento
  - TabLotacao: ocupacao em tempo real
  - TabCortesias: cortesias enviadas/aceitas/recusadas
  - TabRelatorio: relatorio pos-evento
  - TabLogs: audit log do evento
  - TabMesas: mesas/camarotes
  - CuponsSubView: cupons do evento
  - AnalyticsSubView: analytics do evento
- COMO: eventosAdminService + cortesiasService + listasService + reviewsService
- TABELAS: eventos_admin, tickets_caixa, lotes, equipe_evento, cortesias_*, listas_*, reviews_evento
- STATUS: OK

## F5.5 — GERENTE DASHBOARD (GerenteDashboardView)
- QUEM: gerente | ONDE: GerenteDashboardView
- SECOES: Agora (eventos em andamento), Futuros, Passados, Propostas VANTA
- COMO: eventosAdminService.getEventos() filtrado por comunidade
- STATUS: OK

## F5.6 — LOTES (CRUD)
- QUEM: gerente/socio | ONDE: EditarLotesSubView
- COMO: eventosAdminCrud.editarEvento() (lotes embutidos)
- TABELAS: lotes (INSERT/UPDATE/DELETE), variacoes_ingresso (INSERT/UPDATE/DELETE)
- SUB-FLUXO virada automatica: quando lote esgota, proximo abre
- STATUS: OK

## F5.7 — LISTAS (CRUD completo)
- QUEM: gerente/socio/promoter | ONDE: ListasView, EditarListaSubView
- COMO: listasService
- TABELAS: listas_evento, regras_lista, cotas_promoter, convidados_lista
- SUB-FLUXOS:
  - Criar regra de lista (nome, tipo, preco, desconto)
  - Definir cotas por promoter
  - Promoter adiciona nomes (convidados_lista INSERT)
  - Check-in por lista (portaria)
- STATUS: OK

## F5.8 — PROMOTER DASHBOARD
- QUEM: promoter | ONDE: PromoterDashboardView
- COMO: listasService.getCotasPromoter(), getConvidadosLista()
- TABELAS: cotas_promoter (SELECT), convidados_lista (SELECT/INSERT)
- STATUS: OK

## F5.9 — PROMOTER COTAS (visualizacao)
- QUEM: promoter | ONDE: PromoterCotasView
- COMO: listasService.getLista() → filtra cotas do promoter logado
- MOSTRA: cotas alocadas, usadas, convidados inseridos, check-ins
- EXPORT: CSV e PDF (exportUtils)
- SOLICITAR MAIS COTAS: NAO EXISTE — promoter so visualiza o que foi alocado pelo gerente
- STATUS: OK (somente leitura + export)

## F5.10 — CORTESIAS (admin envia)
- QUEM: gerente/socio | ONDE: TabCortesias
- COMO: cortesiasService.enviarCortesia()
- TABELAS: cortesias_pendentes (INSERT), cortesias_log (INSERT)
- NOTIF: notify() ao destinatario tipo CORTESIA
- SUB-FLUXO: destinatario aceita → ticket criado, recusa → log
- STATUS: OK

## F5.11 — CUPONS (CRUD)
- QUEM: gerente/socio | ONDE: CuponsSubView
- COMO: cuponsService
- TABELAS: cupons (INSERT/UPDATE/DELETE)
- STATUS: OK

## F5.12 — PORTARIA QR (scanner)
- QUEM: porteiro | ONDE: PortariaScannerView
- COMO: eventosAdminTickets.validarTicket()
- TABELAS: tickets_caixa (UPDATE status=USADO)
- OFFLINE: offlineEventService sincroniza depois
- STATUS: OK

## F5.13 — PORTARIA LISTA (check-in por nome)
- QUEM: porteiro | ONDE: CheckInView (modo LISTA)
- COMO: listasService + eventosAdminTickets
- TABELAS: convidados_lista (UPDATE checkin), tickets_caixa
- STATUS: OK

## F5.14 — CAIXA (venda presencial)
- QUEM: caixa | ONDE: CaixaView
- COMO: eventosAdminTickets.venderNaCaixa()
- TABELAS: tickets_caixa (INSERT tipo=CAIXA), lotes (UPDATE vendidos)
- NOTIF: nenhuma
- STATUS: OK

## F5.15 — CAIXA FECHAMENTO (encerrar evento)
- QUEM: gerente | ONDE: FinanceiroView → ModalFechamento
- COMO: supabase.from('eventos_admin').update({ status_evento: 'FINALIZADO' })
- TABELAS: eventos_admin (UPDATE status_evento)
- UI: ModalFechamento mostra check-ins, receita bruta, saldo a transferir. Botao "Confirmar Encerramento"
- NAO usa tabela separada — apenas muda status do evento
- DOWNSTREAM: eventosAdminService.refresh()
- STATUS: OK

## F5.16 — SELFIE CHECK-IN
- QUEM: porteiro | ONDE: SelfieCameraComponent
- COMO: supabaseVantaService.uploadSelfie()
- TABELAS: selfies (INSERT), profiles (UPDATE biometria_url)
- STATUS: OK

## F5.17 — OFFLINE SYNC
- QUEM: sistema | ONDE: offlineDB.ts + offlineEventService.ts
- COMO: IndexedDB local → sync quando reconecta
- TABELAS: tickets_caixa (batch UPDATE quando online)
- STATUS: OK
