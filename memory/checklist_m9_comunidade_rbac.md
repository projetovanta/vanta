# M9 — Comunidade + RBAC

## F9.1 — CRIAR COMUNIDADE
- QUEM: master | ONDE: CriarComunidadeView
- COMO: comunidadesService.criar()
- TABELAS: comunidades (INSERT), atribuicoes_rbac (INSERT gerente)
- CAMPOS: nome, cidade, endereco, descricao, foto, categoria
- NOTIF: notify() ao gerente nomeado
- STATUS: OK

## F9.2 — EDITAR COMUNIDADE
- QUEM: gerente/master | ONDE: ComunidadeDetalheView (ou EditarComunidade)
- COMO: comunidadesService.editar()
- TABELAS: comunidades (UPDATE)
- STATUS: OK

## F9.3 — DESATIVAR COMUNIDADE
- QUEM: master | ONDE: ComunidadesView
- COMO: comunidadesService.desativar()
- TABELAS: comunidades (UPDATE ativa=false)
- STATUS: OK

## F9.4 — COMUNIDADE PUBLICA
- QUEM: usuario | ONDE: ComunidadePublicView
- COMO: comunidadesService.getById() + communityFollowService
- TABELAS: comunidades (SELECT), community_follows (SELECT/INSERT/DELETE)
- MOSTRA: info, eventos, seguir/deixar de seguir
- STATUS: OK

## F9.5 — EQUIPE DA COMUNIDADE (atribuicoes RBAC)
- QUEM: master/gerente | ONDE: CriarComunidadeView (step equipe), ComunidadeDetalheView
- COMO: comunidadesService.atribuirCargo(), rbacService
- TABELAS: atribuicoes_rbac (INSERT/UPDATE/DELETE)
- CARGOS: vanta_masteradm, vanta_gerente, vanta_socio, vanta_porteiro, vanta_caixa, vanta_promoter
- STATUS: OK

## F9.6 — CONVITE SOCIO
- QUEM: gerente (via CriarEventoView Step4) | ONDE: Step4EquipeSocio
- COMO: eventosAdminCrud.convidarSocio() → notify() tipo CONVITE_SOCIO
- TABELAS: equipe_evento (INSERT tipo=SOCIO_CONVITE)
- NOTIF: CONVITE_SOCIO — IN_APP + PUSH
- DOWNSTREAM: socio aceita → ConviteSocioModal → equipe_evento (UPDATE aceito)
- STATUS: OK

## F9.7 — CONTRA-PROPOSTA SOCIO
- QUEM: socio responde | ONDE: ConviteSocioModal
- COMO: eventosAdminAprovacao.contraPropostaConvite()
- TABELAS: equipe_evento (UPDATE split proposto)
- MAX: 3 rodadas
- STATUS: OK

## F9.8 — ADMIN GATEWAY (roteamento por role)
- QUEM: qualquer admin | ONDE: DashboardV2Gateway.tsx
- COMO: verifica role + comunidades do usuario → redireciona
- MASTER: opcao "Visao Global" + lista todas comunidades
- GERENTE/SOCIO: lista comunidades onde tem cargo
- PORTEIRO/CAIXA: direto pra operacao
- STATUS: OK

## F9.9 — SIDEBAR ADMIN (RBAC)
- QUEM: qualquer admin | ONDE: AdminSidebar.tsx
- COMO: SIDEBAR_SECTIONS (visao global) vs COMMUNITY_SIDEBAR_SECTIONS (dentro comunidade)
- FILTRA: itens visiveis por role (master ve tudo, gerente ve subset, socio ve menos)
- STATUS: OK

## F9.10 — PERMISSOES GRANULARES SOCIO
- QUEM: gerente define | ONDE: equipe_evento (flags)
- FLAGS: VER_FINANCEIRO, GERIR_LISTAS, EMITIR_CORTESIAS
- DOWNSTREAM: sidebar e views filtram por flags
- STATUS: OK

## F9.11 — HORARIO DE FUNCIONAMENTO
- QUEM: gerente | ONDE: HorarioFuncionamentoEditor
- COMO: comunidadesService (campo horario_funcionamento JSONB)
- TABELAS: comunidades (UPDATE horario_funcionamento)
- DOWNSTREAM: HorarioPublicDisplay na ComunidadePublicView
- STATUS: OK

## F9.12 — PARTICIPANTES (equipe por evento)
- QUEM: gerente/socio | ONDE: ParticipantesView
- COMO: eventosAdminService.getEquipe()
- TABELAS: equipe_evento (SELECT)
- STATUS: OK
