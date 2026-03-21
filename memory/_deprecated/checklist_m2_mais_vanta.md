# M2 — MAIS VANTA (Clube de Influencia) — Admin + Membro

## MEMBRO

### F2.1 — SOLICITAR ENTRADA
- QUEM: usuario | ONDE: ClubeOptInView (modules/profile/)
- COMO: clubeSolicitacoesService.solicitar()
- TABELAS: solicitacoes_clube (INSERT status=PENDENTE)
- PRE-REQ: ter Instagram preenchido no perfil
- NOTIF: nenhuma ao admin (deveria?)
- STATUS: OK mas FALTA notificar admin

### F2.2 — VERIFICACAO INSTAGRAM
- QUEM: sistema | ONDE: Edge Function verify-instagram-bio
- COMO: verifica codigo VANTA-XXXX na bio do Instagram
- TABELAS: solicitacoes_clube (UPDATE instagram_verificado=true)
- STATUS: OK

### F2.3 — RESERVAR VAGA EM EVENTO
- QUEM: membro ativo | ONDE: EventDetailView → botao "Reservar via MAIS VANTA"
- COMO: clubeReservasService.reservar()
- VALIDACOES: membro ativo + tier compativel + passport cidade + assinatura ativa + vagas
- TABELAS: reservas_mais_vanta (INSERT), lotes_mais_vanta (UPDATE reservados++)
- NOTIF: nenhuma
- STATUS: OK

### F2.4 — PRAZO DE POST
- QUEM: sistema (cron) | ONDE: Edge Function notif-evento-finalizou
- COMO: detecta eventos encerrados, notifica membros com reserva USADO
- TABELAS: reservas_mais_vanta (UPDATE post_deadline_em)
- NOTIF: push "Voce tem Xh pra postar" — PUSH
- STATUS: OK

### F2.5 — INFRACAO POR NAO POSTAR
- QUEM: sistema (cron) | ONDE: Edge Function notif-infraccao-registrada
- COMO: detecta deadlines vencidos, registra infracao, aplica bloqueio progressivo
- TABELAS: infracoes_mais_vanta (INSERT), membros_clube (UPDATE bloqueio_nivel), reservas_mais_vanta (UPDATE)
- NOTIF: push contextualizado por gravidade — PUSH
- LOGICA: 3 infracoes → bloqueio1 (30d), 6 → bloqueio2 (60d), 9 → ban permanente
- STATUS: OK

## ADMIN — Hub MaisVantaHubView (5 abas)

### F2.6 — PLANOS (PlanosMaisVantaView)
- QUEM: master | ONDE: MaisVantaHubView → aba PLANOS
- ACOES: criar/editar/desativar/reativar plano, criar/editar/desativar/reativar tier
- COMO: assinaturaService (planos), clubeService (tiers)
- TABELAS: planos_mais_vanta (CRUD), tiers_mais_vanta (CRUD)
- NOTIF: nenhuma
- DECISOES TOMADAS: modal desativar plano, botao reativar, botoes tier, diasCastigo removido
- STATUS: OK — CORRIGIDO

### F2.7 — ASSINATURAS (AssinaturasMaisVantaView)
- QUEM: master | ONDE: MaisVantaHubView → aba ASSINATURAS
- ACOES: ver KPIs (ativas/pendentes/MRR), ativar/cancelar assinatura
- COMO: assinaturaService.ativarAssinatura/cancelarAssinatura
- TABELAS: assinaturas_mais_vanta (SELECT/UPDATE)
- NOTIF: NENHUMA ao ativar/cancelar → FALTA
- UPSTREAM: Edge Function create-checkout cria assinatura (mas NENHUMA UI chama iniciarCheckout)
- FALTA:
  1. UI para gerente contratar assinatura (ninguem chama iniciarCheckout)
  2. Notificacao ao gerente quando ativada/cancelada
  3. Edge Function create-checkout usa planos legados hardcoded (nao dinamicos)
  4. CORS * no create-checkout (deveria ser maisvanta.com)
- STATUS: INCOMPLETO

### F2.8 — PASSAPORTES (PassaportesMaisVantaView)
- QUEM: master | ONDE: MaisVantaHubView → aba PASSAPORTES
- ACOES: aprovar/rejeitar/revogar passaporte
- COMO: clubeService.aprovarPassport/rejeitarPassport, supabase direto (revogar)
- TABELAS: passport_aprovacoes (SELECT/UPDATE)
- NOTIF: nenhuma → FALTA notificar membro quando aprovado/rejeitado
- STATUS: PARCIAL — falta notificacao

### F2.9 — CONFIG (ConfigMaisVantaView)
- QUEM: master | ONDE: MaisVantaHubView → aba CONFIG
- ACOES: editar branding, regras, beneficios, textos, termos
- COMO: maisVantaConfigService.updateConfig()
- TABELAS: mais_vanta_config (SELECT/UPDATE)
- STATUS: OK

## ADMIN — Hub MonitoramentoMaisVantaView (4 abas)

### F2.10 — MEMBROS (MembrosGlobaisMaisVantaView)
- QUEM: master | ONDE: MonitoramentoMaisVantaView → aba MEMBROS
- ACOES: desbloquear, banir, resolver divida, acoes bulk
- COMO: supabase direto (membros_clube UPDATE)
- TABELAS: membros_clube (SELECT/UPDATE), profiles (SELECT)
- NOTIF: nenhuma → FALTA notificar membro quando desbloqueado/banido
- STATUS: PARCIAL — falta notificacao + supabase direto em vez de service

### F2.11 — EVENTOS MV (EventosGlobaisMaisVantaView)
- QUEM: master | ONDE: MonitoramentoMaisVantaView → aba EVENTOS
- ACOES: ver eventos com lotes MV, detalhe (lotes por tier, reservas, ocupacao)
- COMO: clubeService + eventosAdminService
- TABELAS: lotes_mais_vanta (SELECT), reservas_mais_vanta (SELECT)
- STATUS: OK (somente leitura)

### F2.12 — INFRACOES (InfracoesGlobaisMaisVantaView)
- QUEM: master | ONDE: MonitoramentoMaisVantaView → aba INFRACOES
- ACOES: ver infracoes, deletar infracao + recalcular bloqueio
- COMO: supabase direto (infracoes_mais_vanta, membros_clube)
- TABELAS: infracoes_mais_vanta (SELECT/DELETE), membros_clube (UPDATE bloqueio_nivel)
- NOTIF: nenhuma
- DECISAO: limite infracoes lido do config global (corrigido)
- STATUS: OK — CORRIGIDO

### F2.13 — DIVIDA SOCIAL (DividaSocialMaisVantaView)
- QUEM: master | ONDE: MonitoramentoMaisVantaView → aba DIVIDA
- ACOES: ver reservas com post pendente, resolver divida
- COMO: supabase direto (reservas_mais_vanta UPDATE post_verificado=true)
- TABELAS: reservas_mais_vanta (SELECT/UPDATE)
- DECISAO: prazo lido do config global (corrigido)
- STATUS: OK — CORRIGIDO

### F2.14 — APROVAR SOLICITACAO (curadoria clube)
- QUEM: master | ONDE: CuradoriaView → tabClube
- COMO: clubeSolicitacoesService.aprovar()
- TABELAS: solicitacoes_clube (UPDATE), membros_clube (INSERT), passport_aprovacoes (INSERT auto)
- NOTIF: notify() "Voce foi aprovado no MAIS VANTA!" — IN_APP + PUSH
- STATUS: OK
