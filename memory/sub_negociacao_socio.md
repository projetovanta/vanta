# Sub-Modulo: Negociacao Socio-Produtor
# Criado: 2026-03-07 | Status: DESIGN COMPLETO, NAO IMPLEMENTADO

## Conceito
Negociacao turn-based entre produtor e socio sobre percentual do evento. Max 3 rodadas. Vez alternada.

## Fluxo Completo
1. Produtor cria evento e convida socio → digita % inicial + mensagem (max 500 chars)
2. Socio recebe notificacao (in-app + push) → abre tela de negociacao
3. Socio pode: Aceitar | Contrapor (novo % + mensagem) | Recusar
4. Se contraproposta → produtor recebe notificacao → mesmas 3 opcoes
5. Max 3 rodadas. Se nao houve acordo → evento cancelado
6. Prazo: 48h pra cada lado responder. Se expirar → negociacao cancelada

## Regras de Negocio
- Produtor digita % livremente (sem limites)
- Socio pode propor qualquer % diferente na contraproposta
- Mensagem obrigatoria, max 500 caracteres
- Cada lado pode aceitar, contrapor ou recusar a qualquer momento
- Produtor pode desistir/cancelar o convite a qualquer momento
- Botao aceitar mostra o valor: "Aceitar 20%" + tela de confirmacao antes de fechar
- Prazo 48h por resposta. Expirou = negociacao cancelada automaticamente

## Pos-Falha (3 rodadas sem acordo ou cancelamento)
- Evento fica visivel para ambos (somente leitura, historico completo)
- Ninguem pode alterar mais nada
- Produtor pode: Reiniciar negociacao (mesmo socio, reseta rodadas) OU Convidar outro socio
- Dados do evento sao preservados (produtor nao perde o que criou)

## Ao Aceitar
- Evento muda para PUBLICADO automaticamente (sem etapa intermediaria)

## Tela de Negociacao — Design
- **Acesso**: pela notificacao OU de dentro do evento (ambos)
- **Layout**: tela cheia dedicada
- **Header**: nome do evento + "Rodada X/3"
- **Resumo evento**: no topo, antes do chat (nome, data, local)
- **Historico**: visual estilo chat com baloes alternados
  - Produtor: balao a esquerda
  - Socio: balao a direita
  - Cada balao: nome, percentual, mensagem, data/hora
- **Data limite**: mostra data/hora limite (nao contagem regressiva)
- **Acoes** (parte de baixo, quando e sua vez):
  - 3 botoes: "Aceitar X%" | "Contrapor" | "Recusar"
  - Ao clicar Contrapor: campo de % + textarea aparece embaixo na mesma tela
  - Ao clicar Aceitar: tela de confirmacao aparece antes de confirmar
- **Resumo final**: quando termina, mostra status (acordo/cancelado), % final, historico completo

## Notificacoes
- Cada turno: notificacao in-app + push pro outro lado
- Tipos: CONVITE_SOCIO (convite inicial), NEGOCIACAO_TURNO (contraproposta), NEGOCIACAO_ACEITA, NEGOCIACAO_RECUSADA, NEGOCIACAO_EXPIRADA

## Status no Painel Admin
- Badge no card do evento: "Negociando", "Aguardando socio", "Aguardando produtor", "Acordo", "Cancelado"

## Tabela: socios_evento
- Colunas necessarias: status, rodada, percentual_atual, ultimo_turno (produtor/socio), prazo_resposta, historico_propostas (jsonb array)
- Status possiveis: PENDENTE | NEGOCIANDO | ACEITO | RECUSADO | CANCELADO | EXPIRADO

## Implementacao — Estado Atual
- [x] Migration `20260307140000_negociacao_turno.sql` aplicada (colunas + 8 RPCs)
- [x] RPCs: get_convite_socio, aceitar_convite_socio, recusar_convite_socio, contraproposta_convite_socio, contraproposta_produtor, aceitar_proposta_produtor, cancelar_convite_produtor, reiniciar_negociacao, expirar_negociacoes_vencidas
- [x] types/supabase.ts regenerado (3574L)
- [x] NegociacaoSocioView.tsx criada (tela cheia, chat, acoes socio+produtor)
- [x] App.tsx: substitui ConviteSocioModal por NegociacaoSocioView
- [x] useAppHandlers: detecta papel (socio/produtor) via created_by do evento
- [x] Notificacoes tipo CONVITE_SOCIO usadas em todos os handlers

## Tudo Implementado
- [x] Cron `expirar-negociacoes-vencidas` (a cada hora) via pg_cron
- [x] Badge no card do evento: "negociando", "aguardando sócio", "recusado", "expirado", "cancelado" (MeusEventosView)
- [x] Botao "Reiniciar negociacao" na view pos-falha (produtor only, painel dedicado com % + mensagem)
- [x] Push FCM em todos os 6 handlers (aceitar x2, contrapor x2, recusar, cancelar, reiniciar)
- [x] Status CANCELADO e EXPIRADO no tipo SocioEvento (types/eventos.ts)
- [ ] Badge no card do evento
- [ ] Botao "Reiniciar negociacao" e "Convidar outro socio" pos-falha
