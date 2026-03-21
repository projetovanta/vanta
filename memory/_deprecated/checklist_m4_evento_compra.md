# M4 — Descoberta + Evento + Compra + Carteira

## F4.1 — HOME FEED
- QUEM: usuario | ONDE: HomeView
- COMO: supabaseVantaService.getEventosPaginated() + getEventosPorRegiao()
- TABELAS: eventos_admin (SELECT com filtros cidade/data/categoria)
- SECOES: Destaques, Proximos, Por Categoria, Populares
- CACHE: cache.ts stale-while-revalidate 60s
- STATUS: OK

## F4.2 — BUSCA
- QUEM: usuario | ONDE: SearchView
- COMO: supabaseVantaService.searchEventos(q)
- TABELAS: eventos_admin (SELECT com textSearch GIN trgm)
- ABAS: Eventos, Pessoas, Comunidades
- STATUS: OK

## F4.3 — RADAR (mapa)
- QUEM: usuario | ONDE: RadarView
- COMO: supabaseVantaService.getEventosPorRegiao() + geolocation
- TABELAS: eventos_admin (SELECT com lat/lng bounds)
- STATUS: OK

## F4.4 — FAVORITOS
- QUEM: usuario | ONDE: EventCard (coracao), ProfileView
- COMO: favoritosService.toggle()
- TABELAS: evento_favoritos (INSERT/DELETE)
- DOWNSTREAM: useExtrasStore.savedEvents
- STATUS: OK

## F4.5 — EVENTO DETALHE
- QUEM: usuario | ONDE: EventDetailView
- COMO: supabaseVantaService.getEventoById()
- TABELAS: eventos_admin (SELECT), lotes (SELECT), variacoes_ingresso (SELECT)
- MOSTRA: info, lotes/precos, presenca confirmada, reviews, social proof, share
- SUB-FLUXOS:
  - Presenca confirmada: tickets_caixa (SELECT where evento_id + status ATIVO)
  - Social proof: amigos que vao (friendships + tickets_caixa)
  - Reviews: reviews_evento (SELECT)
  - Share: Web Share API / clipboard
  - Convite: enviar link para amigo
- STATUS: OK

## F4.6 — LANDING PAGE (SEO)
- QUEM: visitante (bot ou browser) | ONDE: EventLandingPage
- COMO: URL /evento/:slug → SSR OG tags via api/og.ts
- TABELAS: eventos_admin (SELECT by slug)
- DOWNSTREAM: compartilhamento em redes sociais
- STATUS: OK

## F4.7 — CHECKOUT (comprar ingresso)
- QUEM: usuario | ONDE: CheckoutPage
- COMO: RPC processar_compra_checkout (Supabase)
- TABELAS: tickets_caixa (INSERT), lotes (UPDATE vendidos++), transactions (INSERT)
- CAMPOS: evento_id, lote_id, variacao_id, user_id, preco, cupom_id, meia
- NOTIF: notify() "Compra confirmada" tipo COMPRA — IN_APP + PUSH
- SUB-FLUXOS:
  - Cupom: cuponsService.validar() + aplicar desconto
  - Meia-entrada: verifica profiles.meia_verificada
  - Mesa/Camarote: mesasService (fluxo separado)
- FALTA: Stripe real (CNPJ pendente) — hoje simula pagamento
- STATUS: PARCIAL — pagamento simulado

## F4.8 — WAITLIST
- QUEM: usuario | ONDE: WaitlistModal (quando lote esgotado)
- COMO: waitlistService.entrar()
- TABELAS: waitlist (UPSERT)
- NOTIF: waitlistService.notificarProximos() → notify() tipo SISTEMA "Vaga disponivel!"
- TRIGGER: chamado MANUALMENTE quando ticket e reembolsado/cancelado (eventosAdminTickets + eventosAdminFinanceiro)
- NAO tem cron/trigger automatico — depende de acao admin (reembolso/cancelamento)
- STATUS: OK (trigger manual via reembolso/cancel)

## F4.9 — CARTEIRA (wallet)
- QUEM: usuario | ONDE: WalletView
- COMO: useTicketsStore.myTickets (supabaseVantaService.getTicketsUsuario())
- TABELAS: tickets_caixa (SELECT), transferencias_ingresso (SELECT)
- MOSTRA: ingressos ativos, passados, pendentes
- STATUS: OK

## F4.10 — QR CODE DO INGRESSO
- QUEM: usuario | ONDE: WalletView → detalhe ticket
- COMO: gera QR com ticket.id + hash
- TABELAS: nenhuma (gerado client-side)
- STATUS: OK

## F4.11 — TRANSFERENCIA DE INGRESSO
- QUEM: usuario | ONDE: WalletView → transferir
- COMO: transferenciaService.transferir()
- TABELAS: transferencias_ingresso (INSERT), tickets_caixa (UPDATE owner_id)
- NOTIF: notify() ao destinatario "X transferiu ingresso" tipo TRANSFERENCIA — IN_APP + PUSH
- SUB-FLUXO: destinatario aceita/recusa (transferenciaService.aceitar/recusar)
- RLS: INSERT remetente_id=auth.uid(), UPDATE destinatario_id=auth.uid() + WITH CHECK, SELECT remetente OU destinatario
- STATUS: OK

## F4.12 — CORTESIA (receber gratis)
- QUEM: admin envia, usuario recebe | ONDE: app do usuario (notificacao)
- COMO: cortesiasService.enviarCortesia()
- TABELAS: cortesias_pendentes (INSERT), cortesias_log (INSERT)
- NOTIF: notify() tipo CORTESIA — IN_APP + PUSH
- SUB-FLUXO: usuario aceita → RPC `aceitar_cortesia_rpc` (SECURITY DEFINER, atomico)
- RLS cortesias_pendentes: INSERT team/admin, SELECT/UPDATE destinatario
- RLS tickets_caixa: INSERT owner/team/admin, UPDATE owner/team/admin, SELECT owner/team/admin. Zero DELETE
- STATUS: OK

## F4.13 — REEMBOLSO (solicitar)
- QUEM: usuario ou admin | ONDE: WalletView (usuario) ou admin (manual)
- COMO: reembolsoService.solicitarReembolso()
- TABELAS: reembolsos (INSERT), tickets_caixa (UPDATE status)
- NOTIF: notify() tipo REEMBOLSO — IN_APP
- SUB-FLUXO aprovacao: master/gerente aprova via admin
- FALTA: Stripe refund real
- STATUS: PARCIAL — refund simulado

## F4.14 — REVIEWS (avaliar evento)
- QUEM: usuario (pos-evento) | ONDE: ReviewModal (via notificacao)
- COMO: reviewsService.enviarReview()
- TABELAS: reviews_evento (INSERT)
- TRIGGER: Edge Function notif-pedir-review (cron diario) envia notif tipo PEDIR_REVIEW
- DOWNSTREAM: EventDetailView (media + comentarios), EventoDashboard
- STATUS: OK

## F4.15 — MESAS/CAMAROTES
- QUEM ADMIN: gerente | ONDE: EventDetailManagement → TabMesas
- COMO: mesasService (CRUD completo)
- TABELAS: mesas (SELECT/INSERT/UPDATE/DELETE)
- CAMPOS: label, x, y, capacidade, valor, status (DISPONIVEL/RESERVADA/OCUPADA), reservado_por
- SUB-FLUXO upload planta: mesasService.uploadPlanta() → Storage
- SUB-FLUXO criar mesa: posicionar no mapa (x,y) + label + capacidade + valor
- ATIVACAO: toggle mesasAtivo no CriarEventoView Step2
- STATUS ADMIN: OK
- QUEM USER: usuario | ONDE: CheckoutPage (selecao mesa)
- FALTA: fluxo de COMPRA de mesa pelo usuario (checkout com mesa) — nao verificado
- STATUS USER: VERIFICAR fluxo de compra
