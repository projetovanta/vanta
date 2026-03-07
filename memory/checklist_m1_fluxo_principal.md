# M1 — Fluxo Principal (8 passos) — COMPLETO

## PASSO 1 — Master cria comunidade + gerente
- QUEM: master | ONDE: CriarComunidadeView | COMO: comunidadesService.criar()
- TABELAS: comunidades (INSERT), atribuicoes_rbac (INSERT gerente)
- NOTIF: notify() ao gerente "Voce foi nomeado gerente" — IN_APP + PUSH
- STATUS: OK — IMPLEMENTADO

## PASSO 2 — Gerente cria evento
- QUEM: gerente | ONDE: CriarEventoView (wizard 4-5 steps)
- COMO: eventosAdminCrud.criarEvento()
- TABELAS: eventos_admin (INSERT), lotes (INSERT), variacoes_ingresso (INSERT), equipe_evento (INSERT)
- NOTIF: notify() ao master "Novo evento pendente" — IN_APP + PUSH
- SUB-FLUXOS:
  - TipoEventoScreen: COM/SEM VENDA → COM/SEM SOCIO (4 combinacoes)
  - Step1 dados, Step2 lotes, Step3 listas, Step4 equipe, Step5 financeiro
- STATUS: OK — IMPLEMENTADO

## PASSO 3 — Socio recebe convite + aceita
- QUEM: sistema envia, socio responde | ONDE: ConviteSocioModal
- COMO: eventosAdminCrud.convidarSocio() → notify() tipo CONVITE_SOCIO
- TABELAS: equipe_evento (INSERT convite), eventos_admin (UPDATE split)
- NOTIF: CONVITE_SOCIO ao socio — IN_APP + PUSH
- SUB-FLUXO: aceitar/recusar/contra-proposta (ate 3 rodadas)
- STATUS: OK — IMPLEMENTADO

## PASSO 4 — Master aprova evento
- QUEM: master | ONDE: EventosPendentesView
- COMO: eventosAdminAprovacao.aprovarEvento() ou enviarPropostaVanta()
- TABELAS: eventos_admin (UPDATE status=PUBLICADO)
- NOTIF: notify() ao criador "Evento aprovado/proposta enviada"
- SUB-FLUXO SEM VENDA: Proposta VANTA (comissao, codigo afiliado, ate 3 rodadas)
- STATUS: OK — IMPLEMENTADO

## PASSO 5 — Usuario descobre evento
- QUEM: usuario | ONDE: HomeView, SearchView, RadarView
- COMO: supabaseVantaService.getEventos(), searchEventos()
- TABELAS: eventos_admin (SELECT), evento_favoritos (INSERT/DELETE)
- NOTIF: nenhuma
- STATUS: OK

## PASSO 6 — Usuario compra ingresso
- QUEM: usuario | ONDE: EventDetailView → CheckoutPage
- COMO: RPC processar_compra_checkout
- TABELAS: tickets_caixa (INSERT), lotes (UPDATE vendidos), transactions (INSERT)
- NOTIF: notify() "Compra confirmada" — IN_APP + PUSH
- SUB-FLUXOS: cupom, meia-entrada, mesa/camarote, waitlist
- FALTA: Stripe real (bloqueado por CNPJ)
- STATUS: PARCIAL — falta pagamento real

## PASSO 7 — Portaria faz check-in
- QUEM: porteiro | ONDE: PortariaScannerView (QR), CheckInView (lista), CaixaView
- COMO: eventosAdminTickets.validarTicket()
- TABELAS: tickets_caixa (UPDATE status=USADO), presencas (INSERT)
- NOTIF: nenhuma ao usuario (deveria?)
- STATUS: OK

## PASSO 8 — Pos-evento
- QUEM: sistema (cron) + master/gerente
- ONDE: FinanceiroView, WalletView, ReviewModal
- SUB-FLUXOS:
  - Financeiro: saque hierarquico, reembolso
  - Carteira: ingressos com status final
  - Reviews: Edge Function notif-pedir-review (cron 14h BRT)
  - Alertas ao vivo: ocupacao 80%/95%
- STATUS: OK — IMPLEMENTADO
