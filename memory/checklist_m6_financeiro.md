# M6 — Financeiro

## F6.1 — RECEITA DO EVENTO
- QUEM: gerente/socio (visualiza) | ONDE: FinanceiroView (TabGeral)
- COMO: eventosAdminFinanceiro.getResumoFinanceiro()
- TABELAS: tickets_caixa (SELECT sum preco), transactions (SELECT)
- MOSTRA: receita bruta, taxa VANTA, liquido, split produtor/socio
- FALTA: receita de LISTAS PAGAS nao entra no calculo de receitaBrutaEvento nem saldoConsolidado (FinanceiroView). Entra apenas no TabResumoCaixa
- STATUS: PARCIAL — receita de listas pagas nao contabilizada no saque

## F6.2 — TAXAS VANTA
- QUEM: master define | ONDE: CriarEventoView (Step5), EventosPendentesView
- COMO: eventosAdminCrud (feePercent, feeFixed, feeMode)
- TABELAS: eventos_admin (colunas fee_percent, fee_fixed, fee_mode)
- REGRA: so master altera feePercent/feeFixed (cadeado)
- STATUS: OK

## F6.3 — SOLICITAR SAQUE
- QUEM: gerente/socio | ONDE: FinanceiroView → ModalSaque
- COMO: eventosAdminFinanceiro.solicitarSaque()
- TABELAS: solicitacoes_saque (INSERT)
- CAMPOS: evento_id, valor, pix_chave, pix_tipo, solicitante_id
- NOTIF: notify() ao master "Novo pedido de saque" — IN_APP + PUSH
- STATUS: OK

## F6.4 — APROVAR/REJEITAR SAQUE
- QUEM: master | ONDE: MasterFinanceiroView
- COMO: eventosAdminFinanceiro.aprovarSaque() / rejeitarSaque()
- TABELAS: solicitacoes_saque (UPDATE status)
- NOTIF: notify() ao solicitante "Saque aprovado/rejeitado"
- FALTA: transferencia PIX real (manual hoje)
- STATUS: PARCIAL — transferencia manual

## F6.5 — REEMBOLSO (admin inicia)
- QUEM: gerente/socio/master | ONDE: ModalReembolsoManual, ReembolsosSection
- COMO: reembolsoService.iniciarReembolso()
- TABELAS: reembolsos (INSERT), tickets_caixa (UPDATE status=REEMBOLSADO)
- NOTIF: notify() ao comprador "Reembolso aprovado" + email (send-reembolso-email)
- FALTA: Stripe refund real
- STATUS: PARCIAL — refund simulado

## F6.6 — REEMBOLSO (usuario solicita)
- QUEM: usuario | ONDE: WalletView → solicitar reembolso
- COMO: reembolsoService.solicitarReembolso()
- TABELAS: reembolsos (INSERT status=PENDENTE)
- NOTIF: notify() ao admin "Pedido de reembolso"
- SUB-FLUXO: admin aprova/rejeita
- STATUS: OK

## F6.7 — SIMULADOR DE RECEITA
- QUEM: gerente | ONDE: SimuladorGateway
- COMO: calculo local (sem Supabase)
- STATUS: OK

## F6.8 — MASTER FINANCEIRO (visao global)
- QUEM: master | ONDE: MasterFinanceiroView
- COMO: eventosAdminFinanceiro (queries globais)
- TABELAS: tickets_caixa (SELECT global), solicitacoes_saque (SELECT), reembolsos (SELECT)
- MOSTRA: receita total, taxa VANTA total, saques pendentes, reembolsos
- STATUS: OK

## F6.9 — RAIO-X EVENTO
- QUEM: gerente/socio | ONDE: RaioXEvento
- COMO: eventosAdminFinanceiro + eventosAdminTickets
- MOSTRA: breakdown vendas por lote, por dia, por canal (online/caixa)
- STATUS: OK

## F6.10 — LUCRO POR COMUNIDADE
- QUEM: master | ONDE: LucroPorComunidade
- COMO: queries agregadas por comunidade
- STATUS: OK

## F6.11 — HISTORICO DE SAQUES
- QUEM: gerente/socio | ONDE: HistoricoSaques
- COMO: eventosAdminFinanceiro.getSaques()
- TABELAS: solicitacoes_saque (SELECT)
- STATUS: OK
