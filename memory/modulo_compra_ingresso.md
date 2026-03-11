# Criado: 2026-03-06 01:32 | Ultima edicao: 2026-03-06 01:32

# Modulo: Compra de Ingresso (Checkout)

## O que e
Checkout = fluxo de compra de ingresso pelo usuario final.
Usuario ve evento publicado → escolhe lote/variacao → aplica cupom → login → RPC processa compra → ticket gerado.
Sem checkout nao existe ingresso, carteira, check-in, financeiro.

## Tabelas Supabase

### tickets_caixa (ingressos gerados)
| Coluna | Tipo | Obrigatorio | Origem | Descricao |
|---|---|---|---|---|
| id | UUID PK | auto | schema.sql | gen_random_uuid() |
| evento_id | UUID FK eventos_admin | sim | schema.sql | Evento do ingresso |
| lote_id | UUID FK lotes | nao | schema.sql | Lote de origem |
| variacao_id | UUID FK variacoes_ingresso | nao | schema.sql | Variacao comprada |
| email | TEXT | sim | schema.sql | Email do comprador |
| owner_id | UUID FK profiles | nao | schema.sql | Dono do ingresso |
| valor | NUMERIC(10,2) | sim | schema.sql | Valor pago (default 0) |
| status | TEXT | sim | schema.sql | DISPONIVEL, USADO, CANCELADO, TRANSFERIDO (default DISPONIVEL) |
| usado_em | TIMESTAMPTZ | nao | schema.sql | Quando foi usado (check-in) |
| usado_por | UUID FK profiles | nao | schema.sql | Quem fez o check-in |
| criado_por | UUID FK profiles | nao | schema.sql | Quem criou (portaria/caixa) |
| criado_em | TIMESTAMPTZ | auto | schema.sql | now() |
| origem | TEXT | sim | migration | PORTA, CHECKOUT, CORTESIA, LISTA (default PORTA) |
| comprovante_id | UUID FK comprovantes_meia | nao | migration | Comprovante de meia-entrada |

### transactions (registro financeiro da venda)
| Coluna | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| id | UUID PK | auto | gen_random_uuid() |
| evento_id | UUID FK eventos_admin | sim | Evento |
| ticket_id | UUID FK tickets_caixa | nao | Ticket gerado |
| comprador_id | UUID FK profiles | nao | Quem comprou |
| email | TEXT | sim | Email |
| valor_bruto | NUMERIC(10,2) | sim | Valor cheio |
| valor_liquido | NUMERIC(10,2) | sim | Valor apos taxas |
| taxa_aplicada | NUMERIC(5,4) | sim | Taxa % (default 0.05) |
| status | TEXT | sim | PENDENTE, PAGO, CANCELADO (default PENDENTE) |
| tipo | TEXT | sim | VENDA_CHECKOUT, VENDA_CAIXA, CORTESIA (default VENDA_CHECKOUT) |
| created_at | TIMESTAMPTZ | auto | now() |

### vendas_log (log para analytics)
| Coluna | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| id | UUID PK | auto | gen_random_uuid() |
| evento_id | UUID FK eventos_admin | sim | Evento |
| variacao_id | UUID FK variacoes_ingresso | nao | Variacao |
| variacao_label | TEXT | sim | Label da variacao |
| valor | NUMERIC(10,2) | sim | Valor |
| origem | TEXT | sim | PORTA, CHECKOUT (default PORTA) |
| ts | TIMESTAMPTZ | auto | now() |

### cupons (tabela de cupons de desconto)
Ja documentada em modulo_evento.md (CuponsSubView). Usado aqui via cuponsService.validarCupom().

## RPC Principal

### processar_compra_checkout(p_evento_id, p_lote_id, p_variacao_id, p_email, p_valor_unit, p_quantidade, p_comprador_id, p_taxa, p_ref_code)
**O que faz (atomico)**:
1. CHECK vendidos < limite na variacoes_ingresso (se esgotado, retorna erro)
2. INSERT tickets_caixa (status DISPONIVEL, origem CHECKOUT)
3. INSERT transactions (valor_bruto, valor_liquido, taxa_aplicada)
4. UPDATE variacoes_ingresso SET vendidos = vendidos + 1
5. INSERT vendas_log (variacao_label, valor, origem CHECKOUT)
6. Se p_ref_code: UPDATE comemoracoes SET vendas_count += p_quantidade + gerar_cortesias_comemoracao()
6. Retorna {ok: true, tickets: [{ticketId}]}

**Atomicidade**: tudo roda em uma transacao SQL. Se falha em qualquer ponto, rollback completo.

## Servicos

### cuponsService (features/admin/services/cuponsService.ts)
- `validarCupom(codigo, eventoId)` — valida se cupom existe, ativo, nao expirado, nao excedeu limite
- `calcDesconto(cupom, subtotal)` — calcula desconto (% ou valor fixo)
- `usarCupom(cupomId)` — incrementa usos_count

### waitlistService (services/waitlistService.ts)
- Quando variacao esgota, usuario pode entrar na lista de espera
- WaitlistModal exibido automaticamente

### comprovanteService (features/admin/services/comprovanteService.ts)
- Upload de comprovante de meia-entrada
- Bucket: comprovantes-meia (privado, signed URLs)

### notifyService (services/notifyService.ts)
- `notify()` — dispara notificacao 3 canais (in-app + push + email)
- Tipo COMPRA_CONFIRMADA enviado ao comprador

## Arquivos

### Frontend
| Arquivo | Linhas | Funcao |
|---|---|---|
| modules/checkout/CheckoutPage.tsx | ~980 | Pagina de checkout standalone. Guard CPF (Perfil Progressivo Nivel 2) antes de processar compra |
| modules/checkout/SuccessScreen.tsx | 105 | Tela de sucesso pos-compra |
| modules/checkout/WaitlistModal.tsx | 60 | Modal lista de espera |

### Backend (Edge Functions)
| Arquivo | Linhas | Funcao |
|---|---|---|
| supabase/functions/create-checkout/index.ts | 133 | Cria sessao Stripe Checkout |
| supabase/functions/stripe-webhook/index.ts | 163 | Recebe webhook checkout.session.completed |

## Fluxos

### COMPRA DE INGRESSO (fluxo principal)
**Quem**: Usuario logado ou nao-logado (login inline)
**Navegacao**: EventDetailView -> Botao "Comprar" -> CheckoutPage (/checkout/:eventoId)

**O que acontece**:
1. Carrega evento (publicado=true) + lotes ativos + variacoes do lote ativo
2. Usuario seleciona quantidade por variacao
3. (Opcional) Aplica cupom de desconto → cuponsService.validarCupom
4. (Opcional) Se mesas_ativo, seleciona mesa
5. Usuario faz login inline (email + senha → supabase.auth.signInWithPassword)
6. Para cada variacao com qtd > 0: supabase.rpc('processar_compra_checkout')
7. Se cupom aplicado: cuponsService.usarCupom
8. BroadcastChannel envia 'VANTA_TICKET_PURCHASED' para o app principal
9. Notifica comprador (tipo COMPRA_CONFIRMADA, 3 canais)
10. Redireciona para SuccessScreen

**Reacao no sistema (por variacao)**:
- INSERT tickets_caixa (1 por ingresso, status DISPONIVEL, origem CHECKOUT)
- INSERT transactions (registro financeiro)
- UPDATE variacoes_ingresso SET vendidos + N
- INSERT vendas_log (para analytics)

**Quem recebe**:
- Comprador: notificacao COMPRA_CONFIRMADA + ingressos na carteira (WalletView)
- Gerente: ve venda no Dashboard -> Analytics + Pedidos
- Financeiro: transaction registrada para calculo de receita/saque

### WAITLIST (variacao esgotada)
**Quem**: Usuario quando variacao atinge limite
**Navegacao**: CheckoutPage -> variacao esgotada -> WaitlistModal
**O que acontece**: waitlistService registra interesse do usuario
**Consequencia**: se variacao reabrir (admin aumenta limite), usuario pode ser notificado

### CHECKOUT VIA STRIPE (fluxo pago)
**Quem**: Usuario quando evento tem preco > 0
**Navegacao**: CheckoutPage -> create-ticket-checkout Edge Function -> Stripe Checkout -> redirect -> CheckoutSuccessPage
**O que acontece**:
1. CheckoutPage detecta preco > 0 → chama Edge Function `create-ticket-checkout`
2. `create-ticket-checkout` valida precos server-side, aplica cupom, cria pedido em `pedidos_checkout` (status=pendente), cria Stripe Checkout Session
3. Redireciona usuario para Stripe
4. Usuario paga no Stripe
5. Stripe dispara webhook → `stripe-webhook` processa
6. CheckoutSuccessPage faz polling em `pedidos_checkout` por status `pago`
**⚠️ INCOMPLETO**: `stripe-webhook` atual SÓ processa assinaturas MAIS VANTA. NÃO tem handler para `pedidos_checkout` (ingressos). Polling do CheckoutSuccessPage vai dar timeout. CheckoutSuccessPage NÃO tem rota registrada no App.tsx.
**Edge Functions**: `create-ticket-checkout` (cria sessão), `stripe-webhook` (precisa de handler para ingressos)
**Tabela**: `pedidos_checkout` (migration `20260309200000_pedidos_checkout.sql`)

### MEIA-ENTRADA (comprovante)
**Quem**: Usuario que selecionou variacao com requer_comprovante=true
**Navegacao**: CheckoutPage -> upload comprovante -> comprovanteService
**O que acontece**: upload para bucket comprovantes-meia, ticket recebe comprovante_id
**Consequencia**: admin pode verificar comprovante no dashboard

## Onde este modulo aparece (propagacao)

### Telas que CONSOMEM dados de tickets/transactions
| Tela | O que usa |
|---|---|
| WalletView | tickets_caixa do owner_id (meus ingressos) |
| TicketDetailView | ticket individual + QR |
| TransferirModal | ticket para transferir |
| Check-in (portaria) | validar ticket por QR |
| Caixa (venda presencial) | INSERT tickets_caixa origem PORTA |
| PedidosSubView | lista tickets do evento |
| AnalyticsSubView | vendas_log para graficos |
| FinanceiroView | transactions para receita |
| RelatorioEventoView | vendas + tickets |
| RelatorioMasterView | consolidado |
| HistoricoView | tickets passados do usuario |

### Se mexer na tabela tickets_caixa, verificar:
- **11+ telas** listadas acima
- Mudanca de status afeta: carteira, check-in, pedidos, financeiro
- Mudanca de owner_id afeta: transferencia, carteira
- Mudanca de valor afeta: financeiro inteiro
- Mudanca de origem afeta: analytics (filtro por origem)

## Checklist de status
| # | Item | Status | Detalhe |
|---|---|---|---|
| 1 | Checkout page standalone | OK | CheckoutPage 827L |
| 2 | Login inline | OK | supabase.auth.signInWithPassword |
| 3 | Selecao lote/variacao | OK | Lote ativo + variacoes |
| 4 | Cupom de desconto | OK | cuponsService.validarCupom + calcDesconto |
| 5 | RPC processar_compra_checkout | OK | Atomico, 5 operacoes |
| 6 | Ticket gerado | OK | tickets_caixa status DISPONIVEL |
| 7 | Transaction registrada | OK | transactions valor_bruto/liquido/taxa |
| 8 | Vendidos incrementado | OK | variacoes_ingresso.vendidos + 1 |
| 9 | vendas_log registrado | OK | Para analytics |
| 10 | Notificacao comprador | OK | COMPRA_CONFIRMADA 3 canais |
| 11 | BroadcastChannel | OK | Atualiza carteira no app |
| 12 | SuccessScreen | OK | 105L com ingressos gerados |
| 13 | Waitlist | OK | WaitlistModal 60L |
| 14 | Meia-entrada comprovante | OK | Upload + flag requer_comprovante |
| 15 | Mesas/camarotes | OK | Selecao de mesa no checkout |
| 16 | Pagamento real Stripe | BRANCH | feat/stripe-ingressos — EFs + frontend prontos, aguarda CNPJ/secrets |
| 25 | Desconto MV no checkout | OK | useEffect busca membros_clube + mais_vanta_lotes_evento, aplica desconto_percentual paralelo ao cupom |
| 17 | Cadastro inline | NAO EXISTE | Apenas login, nao tem signup no checkout |
| 18 | PIX como metodo | NAO EXISTE | Apenas Stripe (cartao) |
| 19 | Boleto como metodo | NAO EXISTE | Apenas Stripe (cartao) |
| 20 | Limite de compra por usuario | NAO EXISTE | Usuario pode comprar infinitos |
| 21 | Timeout de reserva | NAO EXISTE | Sem lock temporario de variacao durante compra |
| 22 | Observabilidade (logger.ts) | OK | logger.error em loadEvento, compra RPC fail; logger.warn em compra RPC not ok |
| 23 | Cancelled flags useEffects | OK | 4 useEffects com cancelled flag + cleanup (loadEvento, loadLotes, loadVariacoes, compra) |
| 24 | .maybeSingle() padrão | OK | Todas queries SELECT por chave usam .maybeSingle() |
