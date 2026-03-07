# Criado: 2026-03-06 01:48 | Ultima edicao: 2026-03-06

# Sub-modulo: Aprovacao + Negociacao Socio

## Pertence a: modulo_evento.md

## Aprovacao de Evento (Master)

### Arquivo: EventosPendentesView.tsx
**Navegacao**: Painel Master -> Sidebar "Eventos Pendentes"

### Fluxo Aprovacao (UI com checkboxes inline)
```
Gerente cria evento -> status PENDENTE
-> Master abre EventosPendentesView
-> Ve lista de eventos pendentes
-> Para cada evento, abre tela de analise com:
   - Cada campo tem CHECKBOX ao lado (nome, datas, local, descricao, foto, etc)
   - Campos de ingressos (lotes, variacoes) tambem tem checkbox (so COM VENDA)
   - Ao marcar um checkbox: campo fica vermelho + input de sugestao aparece
   - Footer DINAMICO:
     * Nenhum campo marcado: botoes "Rejeitar" + "Aceitar"
     * Campos marcados: botoes "Limpar" + "Solicitar Edicoes (N)"
   - Secao "Acordo Financeiro": master define todas as taxas do evento (taxa VANTA %, taxa fixa, processamento %, porta %, minima R$, fixa evento R$, quem paga servico, cota nomes, R$/nome exc, cota cortesias, % cortesia exc, prazo pgto dias)
   - ACEITAR: aprovarEvento -> publicado=true, status=ATIVO (inclui taxas negociadas)
   - REJEITAR (sem campos): rejeicao definitiva, evento nao aceito
   - SOLICITAR EDICOES (com campos): status=EM_REVISAO + rejeicao_campos JSONB
   - Componente CampoEditavel: checkbox + label + children + input de sugestao
```

### Fluxo Edicao/Correcao
```
Master solicita edicoes (marca campos + comentarios)
-> status_evento = EM_REVISAO
-> rejeicao_campos = {campo: "sugestao do master", ...}
-> rodada_rejeicao incrementa (max 3)

Gerente abre wizard de correcao:
-> Campos OK = cinza/desabilitados
-> Campos sinalizados = vermelho + anotacao do master
-> enviarCorrecao() valida campos permitidos
-> status volta pra PENDENTE -> Master revisa de novo

Se rodada_rejeicao >= 3: evento CANCELADO automaticamente
-> Vai pra aba "Rejeitados" do gerente
```

### Campos com checkbox inline
- **Dados**: nome, descricao, foto, data_inicio, data_fim, local, categoria, estilos, experiencias
- **Ingressos (so COM VENDA)**: lotes, variacoes

### Colunas no banco (eventos_admin)
- `rejeicao_campos JSONB` — {campo: "comentario"}, NULL quando nao rejeitado
- `rodada_rejeicao SMALLINT DEFAULT 0` — contador (0=nunca rejeitado, max 3)

### Aba Rejeitados (gerente)
- Paginacao: 10 por pagina
- Busca por nome do evento
- Filtro por mes/ano
- Eventos CANCELADOS do gerente

### Metodos (eventosAdminAprovacao.ts)
- `aprovarEvento(eventoId, masterUserId, negociacao?)` — aprova + limpa rejeicao. negociacao inclui 11 campos de taxas (taxa, taxaFixa, taxaProcessamento, taxaPorta, taxaMinima, taxaFixaEvento, quemPagaServico, cotaNomes, taxaNomeExcedente, cotaCortesias, taxaCortesiaExcedentePct, prazoPagamentoDias)
- `rejeitarEvento(eventoId, masterUserId, motivo, campos?)` — rejeita com campos especificos
- `enviarCorrecao(eventoId, gerenteId, correcoes)` — gerente envia correcoes (valida campos permitidos)
- `getEventosPendentes()` — lista pendentes (master)
- `getEventosEmRevisao(criadorId)` — lista EM_REVISAO do gerente
- `getEventosRejeitados(criadorId)` — lista CANCELADOS do gerente

### Edicao pendente (pos-aprovacao)
```
Gerente edita evento ja aprovado
-> eventosAdminService.submeterEdicao
   -> UPDATE edicao_pendente (JSONB com dados novos)
   -> UPDATE edicao_status = 'PENDENTE'
-> Master ve edicao pendente
-> APROVAR: eventosAdminService.aprovarEdicao
   -> Aplica dados da edicao_pendente ao evento
   -> Limpa edicao_pendente, edicao_status, edicao_motivo
-> REJEITAR: eventosAdminService.rejeitarEdicao
   -> Define edicao_motivo
   -> Gerente recebe notificacao
```

## Negociacao Socio (COM_SOCIO)

**Design completo**: ver `memory/sub_negociacao_socio.md`

### Fluxo completo
```
Gerente cria evento COM_SOCIO
-> INSERT socios_evento (N socios, cada um com split_percentual + permissoes)
-> status_evento = NEGOCIANDO
-> Cada socio recebe convite (CONVITE_SOCIO) + push FCM

Negociacao turn-based (NegociacaoSocioView — tela cheia chat):
1. ACEITAR (com confirmacao): RPC aceitar_convite_socio / aceitar_proposta_produtor
   -> socios_evento.status = ACEITO
   -> Auto-cria RBAC SOCIO no evento + comunidade (atribuicoes_rbac ON CONFLICT DO NOTHING)
   -> Se TODOS aceitaram: eventos_admin.status_evento = PUBLICADO (automatico)

2. RECUSAR: RPC recusar_convite_socio / cancelar_convite_produtor
   -> socios_evento.status = RECUSADO/CANCELADO
   -> evento volta pra RASCUNHO

3. CONTRAPROPOSTA: RPC contraproposta_convite_socio / contraproposta_produtor
   -> rodada_negociacao += 1, ultimo_turno alternado
   -> prazo_resposta = +48h
   -> Historico salvo em historico_propostas (JSONB)

Max 3 rodadas. 48h por turno. Expirou = EXPIRADO (cron a cada hora).
Pos-falha: produtor pode reiniciar_negociacao ou trocar socio.
```

### RPCs (9 total — SECURITY DEFINER)
- `get_convite_socio` — dados do convite (socio only)
- `aceitar_convite_socio` — socio aceita
- `recusar_convite_socio` — socio recusa
- `contraproposta_convite_socio` — socio contrapropoe
- `contraproposta_produtor` — produtor contrapropoe
- `aceitar_proposta_produtor` — produtor aceita proposta do socio
- `cancelar_convite_produtor` — produtor cancela/desiste
- `reiniciar_negociacao` — produtor reinicia com mesmo socio
- `expirar_negociacoes_vencidas` — sistema expira turnos > 48h

### Tabela socios_evento (multi-socio)
- evento_id, socio_id, split_percentual, permissoes, status, rodada_negociacao, mensagem_negociacao, motivo_rejeicao, ultimo_turno, prazo_resposta, historico_propostas
- Status: PENDENTE | NEGOCIANDO | ACEITO | RECUSADO | CANCELADO | EXPIRADO
- Split do produtor = 100 - SUM(split_percentual dos socios)
- Campos legados em eventos_admin (socio_convidado_id, split_produtor, split_socio) = DEPRECATED

### View: NegociacaoSocioView.tsx
- Tela cheia, chat com baloes, aceitar/contrapor/recusar
- Funciona tanto pro socio quanto pro produtor (prop `papel`)
- Push FCM em todos os handlers
- Painel reiniciar pos-falha (produtor only)

## Checklist
| # | Item | Status | Detalhe |
|---|---|---|---|
| 1 | Eventos pendentes (master) | OK | EventosPendentesView com checkboxes inline |
| 2 | Aprovar evento | OK | publicado=true, status=ATIVO, limpa rejeicao |
| 3 | Rejeitar com campos | OK | rejeitarEvento com campos JSONB + rodada |
| 4 | Status EM_REVISAO | OK | Novo status entre rejeicao e correcao |
| 5 | enviarCorrecao | OK | Valida campos permitidos, volta pra PENDENTE |
| 6 | Max 3 rodadas | OK | rodada >= 3 = CANCELADO automatico |
| 7 | Taxa customizada | OK | Override vanta_fee na aprovacao |
| 8 | Edicao pendente | OK | edicao_pendente JSONB |
| 9 | Aprovar/rejeitar edicao | OK | aprovarEdicao/rejeitarEdicao |
| 10 | Convite socio | OK | NegociacaoSocioView tela cheia chat |
| 11 | Contraproposta socio | OK | RPC contraproposta_convite_socio |
| 12 | Contraproposta produtor | OK | RPC contraproposta_produtor |
| 13 | Split produtor/socio | OK | socios_evento.split_percentual (multi-socio) |
| 14 | Aceitar produtor | OK | RPC aceitar_proposta_produtor |
| 15 | Cancelar produtor | OK | RPC cancelar_convite_produtor |
| 16 | Reiniciar negociacao | OK | RPC reiniciar_negociacao + UI |
| 17 | Expirar 48h | OK | RPC expirar_negociacoes_vencidas + cron horario |
| 18 | Push FCM turnos | OK | send-push em todos os handlers |
| 19 | Badge card evento | OK | MeusEventosView mostra status negociacao |
| 14 | Notificacao ao aprovar | OK | EVENTO_APROVADO + notify + audit |
| 15 | Notificacao ao rejeitar | OK | EVENTO_RECUSADO push+in-app+email |
| 16 | Audit correcao | OK | EVENTO_CORRECAO_ENVIADA |
| 17 | UI master selecionar campos | OK | CampoEditavel + checkboxes inline + footer dinamico |
| 18 | UI gerente corrigir campos | PENDENTE | Wizard com cinza/vermelho |
| 19 | Aba Rejeitados (gerente) | OK | MeusEventosView: paginacao 10/pg + busca + filtro mes/ano |
| 20 | Historico de negociacoes | NAO EXISTE | Sem log das rodadas |
