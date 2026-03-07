# Criado: 2026-03-06 01:38 | Ultima edicao: 2026-03-06 01:38

# Modulo: Financeiro

## O que e
Financeiro = tudo que envolve dinheiro: receita de vendas, taxas VANTA, saques, reembolsos, chargebacks.
Fluxo: venda gera transaction → gerente ve receita → solicita saque → master aprova → dinheiro sai.
Reembolso: comprador solicita → hierarquia socio→gerente→master aprova → ticket cancelado.

## Tabelas Supabase

### transactions (ja documentada em modulo_compra_ingresso.md)
Registro financeiro de cada venda. Colunas: valor_bruto, valor_liquido, taxa_aplicada, status, tipo.

### solicitacoes_saque
| Coluna | Tipo | Origem | Descricao |
|---|---|---|---|
| id | UUID PK | schema.sql | auto |
| produtor_id | UUID FK profiles | schema.sql | Quem solicita |
| evento_id | UUID FK eventos_admin | schema.sql | Evento |
| valor | NUMERIC(10,2) | schema.sql | Valor solicitado |
| valor_liquido | NUMERIC(10,2) | schema.sql | Apos taxas |
| valor_taxa | NUMERIC(10,2) | schema.sql | Taxa cobrada |
| pix_tipo | TEXT | schema.sql | CPF, CNPJ, EMAIL, CELULAR (default CPF) |
| pix_chave | TEXT | schema.sql | Chave PIX |
| status | TEXT | schema.sql | PENDENTE, APROVADO, REJEITADO (default PENDENTE) |
| solicitado_em | TIMESTAMPTZ | schema.sql | auto |
| processado_em | TIMESTAMPTZ | schema.sql | Quando processado |
| processado_por | UUID FK profiles | schema.sql | Quem processou |
| etapa | TEXT | migration | SOLICITADO, GERENTE_APROVADO, MASTER_APROVADO, PAGO |
| gerente_aprovado_por | UUID FK profiles | migration | Gerente que aprovou |
| gerente_aprovado_em | TIMESTAMPTZ | migration | Quando gerente aprovou |
| motivo_recusa | TEXT | migration | Motivo se recusado |

### reembolsos
| Coluna | Tipo | Origem | Descricao |
|---|---|---|---|
| id | UUID PK | migration | auto |
| ticket_id | UUID UNIQUE | migration | Ticket reembolsado |
| evento_id | UUID | migration | Evento |
| tipo | TEXT | migration | AUTOMATICO ou MANUAL |
| status | TEXT | migration | SOLICITADO, SOCIO_APROVADO, GERENTE_APROVADO, MASTER_APROVADO, REJEITADO |
| motivo | TEXT | migration | Motivo do reembolso |
| valor | NUMERIC(10,2) | migration | Valor reembolsado |
| solicitado_por | UUID | migration | Quem pediu |
| aprovado_por | UUID | migration | Quem aprovou |
| rejeitado_por | UUID | migration | Quem rejeitou |
| solicitado_em | TIMESTAMPTZ | migration | auto |
| processado_em | TIMESTAMPTZ | migration | Quando finalizado |
| rejeitado_em | TIMESTAMPTZ | migration | Quando rejeitado |
| rejeitado_motivo | TEXT | migration | Motivo rejeicao |
| etapa | TEXT | migration | Etapa atual do fluxo |
| socio_id | UUID FK profiles | migration | Socio que decidiu |
| socio_decisao | TEXT | migration | Decisao do socio |
| socio_decisao_em | TIMESTAMPTZ | migration | Quando socio decidiu |
| gerente_id | UUID FK profiles | migration | Gerente que decidiu |
| gerente_decisao | TEXT | migration | Decisao do gerente |
| gerente_decisao_em | TIMESTAMPTZ | migration | Quando gerente decidiu |
| comprador_nome | TEXT | migration | Nome do comprador |
| notificado_em | TIMESTAMPTZ | migration | Quando notificado |

### reembolsos_contagem (limite mensal)
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| user_id | UUID FK profiles | Usuario |
| mes_ano | TEXT | Formato '2026-03' |
| contagem | INT | Quantidade no mes (default 0) |
| UNIQUE | (user_id, mes_ano) | |

## Servicos

### eventosAdminService — metodos financeiros
**Saque:**
- `getSaldoFinanceiro(eventoId)` — calcula receita - taxas - saques
- `solicitarSaque(eventoId)` — INSERT solicitacoes_saque
- `getSolicitacoesSaque()` — lista saques pendentes
- `getSaquesByProdutor(produtorId)` — historico do produtor
- `confirmarSaque(id)` — UPDATE status APROVADO
- `estornarSaque(id)` — estorna saque
- `autorizarSaqueGerente(id)` — gerente aprova (etapa intermediaria)
- `recusarSaque(id)` — recusa saque

**Taxas (modelo completo — ver sub_taxas_modelo.md):**
- `getContractedFees(eventoId)` — taxas negociadas (3-level inheritance: evento -> comunidade -> defaults). Campos: taxaServico, taxaFixa, gatewayFeeMode, taxaProcessamento, taxaPorta, taxaMinima, taxaFixaEvento, quemPagaServico, cotaNomesLista, taxaNomeExcedente, cotaCortesias, taxaCortesiaExcedentePct, prazoPagamentoDias
- `setContractedFees(eventoId, fees)` — define taxas (Supabase update + cache sync)
- `getGatewayCostByEvento(eventoId)` — custo gateway por evento
- `getGatewayCostGlobal()` — custo gateway global

**Reembolso (via eventosAdminService):**
- `isReembolsoAutomaticoElegivel(ticketId)` — verifica elegibilidade
- `processarReembolsoAutomatico(ticketId)` — processa automatico
- `aprovarReembolsoManual(id)` — aprova manual
- `verificarLimiteReembolso(userId)` — checa limite mensal
- `solicitarReembolso(ticketId)` — inicia fluxo
- `aprovarReembolsoEtapa(id)` — aprova etapa (hierarquia)
- `executarReembolsoFinal(id)` — executa final
- `recusarReembolso(id)` — recusa
- `registrarChargeback(id)` — registra chargeback

### reembolsoService (features/admin/services/reembolsoService.ts, 449L)
- `podeReembolsoAutomatico(ticketId)` — elegibilidade
- `solicitarReembolsoAutomatico(ticketId, eventoId, userId)` — auto
- `solicitarReembolsoManual(ticketId, eventoId, motivo)` — manual
- `aprovarReembolsoManual(id)` — aprova
- `rejeitarReembolsoManual(id, motivo)` — rejeita
- `getReembolsosPorEvento(eventoId)` — lista por evento
- `getReembolsosPendentes()` — pendentes (master)
- `getReembolsosAprovados()` — aprovados
- `getReembolsosRejeitados()` — rejeitados

## Arquivos
| Arquivo | Linhas | Funcao |
|---|---|---|
| features/admin/views/financeiro/index.tsx | 790 | FinanceiroView — painel financeiro do gerente |
| features/admin/views/financeiro/ModalSaque.tsx | 120 | Modal de solicitacao de saque |
| features/admin/views/financeiro/ModalFechamento.tsx | 77 | Modal de fechamento financeiro |
| features/admin/views/financeiro/ModalReembolsoManual.tsx | 83 | Modal de reembolso manual |
| features/admin/views/financeiro/ReembolsosSection.tsx | 114 | Secao de reembolsos |
| features/admin/views/financeiro/HistoricoSaques.tsx | 51 | Historico de saques |
| features/admin/views/masterFinanceiro/index.tsx | 636 | MasterFinanceiroView — consolidado master |
| features/admin/views/masterFinanceiro/SimuladorGateway.tsx | 84 | Simulador de taxas gateway |
| features/admin/views/masterFinanceiro/RaioXEvento.tsx | 84 | Raio-X financeiro por evento |
| features/admin/views/masterFinanceiro/LucroPorComunidade.tsx | 101 | Lucro por comunidade |
| features/admin/services/reembolsoService.ts | 449 | Service de reembolsos |

## Fluxos

### RECEITA DO EVENTO
**Quem**: Gerente
**Navegacao**: Dashboard Admin -> Evento -> Financeiro (FinanceiroView)
**O que acontece**:
1. getSaldoFinanceiro calcula: SUM(transactions.valor_bruto) - taxas - saques
2. Exibe receita bruta, taxas VANTA, gateway, valor liquido
3. Graficos via VantaPieChart (distribuicao por variacao, origem)

### SOLICITAR SAQUE
**Quem**: Gerente/produtor
**Navegacao**: FinanceiroView -> Botao Saque -> ModalSaque
**O que acontece**:
1. Gerente define valor + chave PIX
2. INSERT solicitacoes_saque (etapa SOLICITADO)
3. Se evento COM_SOCIO: socio precisa aprovar primeiro (etapa GERENTE_APROVADO)
4. Master recebe para aprovacao final

**Hierarquia de aprovacao**:
- SOLICITADO → gerente aprova → GERENTE_APROVADO → master aprova → PAGO
- Em qualquer etapa pode ser recusado

**Quem recebe**: Master ve em MasterFinanceiroView saques pendentes

### REEMBOLSO AUTOMATICO (usuario)
**Quem**: Comprador
**Navegacao**: Carteira -> Ticket -> Solicitar Reembolso
**O que acontece**:
1. podeReembolsoAutomatico verifica: prazo OK, limite mensal OK, elegivel
2. Se elegivel: INSERT reembolsos (tipo AUTOMATICO, status depende da hierarquia)
3. Fluxo: SOLICITADO → socio (se COM_SOCIO) → gerente → master → APROVADO
4. Ticket cancelado, transaction atualizada

### REEMBOLSO MANUAL (admin)
**Quem**: Gerente ou master
**Navegacao**: FinanceiroView -> ReembolsosSection -> ModalReembolsoManual
**O que acontece**:
1. Admin seleciona ticket e define motivo
2. INSERT reembolsos (tipo MANUAL)
3. Aprovacao por hierarquia

### CHARGEBACK
**Quem**: Sistema (stripe webhook) ou master manual
**O que acontece**: registrarChargeback marca transaction como contestada

### MASTER FINANCEIRO (consolidado)
**Quem**: Master admin
**Navegacao**: Painel Master -> Financeiro (MasterFinanceiroView)
**O que acontece**:
1. Ve receita total, por comunidade, por evento
2. SimuladorGateway: simula impacto de mudanca de taxa
3. RaioXEvento: detalhamento financeiro de um evento
4. LucroPorComunidade: ranking de lucro
5. Saques pendentes para aprovar
6. Reembolsos pendentes para decidir

## Onde este modulo aparece (propagacao)

| Tela | O que usa |
|---|---|
| FinanceiroView (gerente) | transactions, solicitacoes_saque, reembolsos |
| MasterFinanceiroView (master) | Consolidado de tudo |
| EventTicketsCarousel (usuario) | solicitarReembolsoAutomatico |
| PedidosSubView | Cancelar ingresso → reembolso |
| Dashboard evento | Resumo financeiro |
| RelatorioEventoView | Dados financeiros |
| RelatorioMasterView | Consolidado |
| Stripe Webhook | Atualiza transactions |
| Create Checkout | Calcula taxas |

### Se mexer nas tabelas financeiras, verificar:
- FinanceiroView (790L) + MasterFinanceiroView (636L)
- reembolsoService (449L)
- eventosAdminService (metodos financeiros, ~20 funcoes)
- Hierarquia: socio → gerente → master em saques E reembolsos
- Stripe webhook atualiza transactions

## Checklist de status
| # | Item | Status | Detalhe |
|---|---|---|---|
| 1 | Receita por evento | OK | getSaldoFinanceiro |
| 2 | Taxas VANTA (% + fixa) | OK | vanta_fee_percent + vanta_fee_fixed |
| 3 | Gateway fee mode | OK | ABSORVER ou REPASSAR |
| 4 | Solicitar saque | OK | ModalSaque + INSERT |
| 5 | Hierarquia saque | OK | SOLICITADO → GERENTE → MASTER → PAGO |
| 6 | Chave PIX | OK | pix_tipo + pix_chave |
| 7 | Historico saques | OK | HistoricoSaques 51L |
| 8 | Reembolso automatico | OK | podeReembolsoAutomatico + solicitarReembolsoAutomatico |
| 9 | Reembolso manual | OK | ModalReembolsoManual 83L |
| 10 | Hierarquia reembolso | OK | socio → gerente → master |
| 11 | Limite mensal reembolso | OK | reembolsos_contagem (user_id, mes_ano) |
| 12 | Chargeback | OK | chargebacks tabela + registrarChargeback |
| 13 | Simulador gateway | OK | SimuladorGateway 84L |
| 14 | Raio-X evento | OK | RaioXEvento 84L |
| 15 | Lucro por comunidade | OK | LucroPorComunidade 101L |
| 16 | RLS financeiro | OK | Todas tabelas com RLS |
| 17 | Pagamento real (Stripe) | NAO ATIVO | Edge Functions existem, pagamento via RPC direto |
| 18 | Nota fiscal | NAO EXISTE | Sem geracao de NF |
| 19 | Relatorio exportavel financeiro | NAO EXISTE | Sem CSV/PDF dedicado do financeiro |
| 20 | Notificacao ao aprovar saque | OK | SAQUE_APROVADO em eventosAdminFinanceiro.ts + useAppHandlers |
| 21 | Notificacao ao aprovar reembolso | OK | REEMBOLSO_APROVADO em eventosAdminFinanceiro.ts + email via send-reembolso-email Edge Function |
