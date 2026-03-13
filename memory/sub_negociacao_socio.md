# Sub-Modulo: Negociacao Socio — REMOVIDO (13/03/2026)

## Status: REMOVIDO

A negociação turn-based entre produtor e sócio foi eliminada do app. A negociação agora acontece FORA do app (presencialmente, WhatsApp, etc).

## Novo fluxo simplificado
1. Produtor cria evento com sócio(s) e split definido → status = PENDENTE (direto, sem NEGOCIANDO)
2. Master aprova → status = ATIVO, publicado = true
3. Na aprovação: sócios são auto-aceitos (socios_evento.status = ACEITO) + RBAC criado + notificação SOCIO_ADICIONADO
4. Sócio recebe notificação informativa ("Você foi adicionado ao evento X com Y%")

## O que foi removido
- Status NEGOCIANDO (eventos_admin e socios_evento)
- Status EXPIRADO (socios_evento)
- 8 RPCs SQL: aceitar/recusar/contraproposta/cancelar/reenviar/expirar convites
- Cron `expirar-negociacoes-vencidas`
- Views: NegociacaoSocioView, ConvitesSocioView, ConviteSocioModal
- Sidebar: item CONVITES_SOCIO
- Pendência: CONVITE_SOCIO
- Handler: conviteSocioEventoId, negociacaoPapel (useAppHandlers)
- ModalReenvio (GerenteDashboardView)
- canAccessConvitesSocio (permissoes.ts)

## O que foi mantido
- Tabela socios_evento (dados de split, permissões)
- Proposta VANTA (afiliado) — fluxo separado, usa propostaStatus NEGOCIANDO (não é sócio)
- Campos legados (socio_convidado_id, split_produtor, split_socio) — DEPRECATED
