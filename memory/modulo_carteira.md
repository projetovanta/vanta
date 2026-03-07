# Criado: 2026-03-06 01:34 | Ultima edicao: 2026-03-06 01:34

# Modulo: Carteira (Wallet)

## O que e
Carteira = onde o usuario ve seus ingressos, QR codes, transferencias e cortesias.
Apos a compra, ingresso aparece aqui. Daqui sai transferencia, cortesia, QR check-in.
Sem carteira nao existe check-in, transferencia, cortesia, presenca.

## Tabelas Supabase

### tickets_caixa (ja documentada em modulo_compra_ingresso.md)
Colunas relevantes para carteira:
- owner_id = dono atual do ingresso
- status = DISPONIVEL | USADO | CANCELADO | TRANSFERIDO
- usado_em = timestamp do check-in
- usado_por = quem fez o check-in (portaria)
- origem = CHECKOUT | PORTA | CORTESIA | LISTA

### cortesias_pendentes
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| evento_id | TEXT | ID do evento |
| destinatario_id | UUID FK profiles | Quem recebe a cortesia |
| remetente_nome | TEXT | Nome de quem enviou |
| evento_nome | TEXT | Nome do evento |
| evento_data | TEXT | Data do evento |
| variacao_label | TEXT | Label da variacao |
| quantidade | INT | Quantidade (default 1) |
| status | TEXT | PENDENTE, ACEITO, RECUSADO (default PENDENTE) |
| created_at | TIMESTAMPTZ | auto |

### transferencias_ingresso
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| ticket_id | TEXT | ID do ticket |
| evento_id | TEXT | ID do evento |
| remetente_id | UUID FK profiles | Quem transfere |
| remetente_nome | TEXT | Nome do remetente |
| destinatario_id | UUID FK profiles | Quem recebe |
| destinatario_nome | TEXT | Nome do destinatario |
| variacao_label | TEXT | Label da variacao |
| titulo_evento | TEXT | Nome do evento |
| data_evento | TEXT | Data |
| evento_local | TEXT | Local |
| evento_imagem | TEXT | Imagem |
| status | TEXT | PENDENTE, ACEITO, RECUSADO (default PENDENTE) |
| criado_em | TIMESTAMPTZ | auto |

### cortesias_config
Tabela existe no banco (RLS ativa, 1 row). Configuracao de cortesias por evento.
Usada por cortesiasService.initCortesia. Possui coluna limites_por_tipo (JSONB).

### cortesias_log
Tabela existe no banco (RLS ativa, 0 rows). Log de cortesias emitidas.
Usada por cortesiasService para registrar cada cortesia emitida.

## Store

### useTicketsStore (stores/ticketsStore.ts, 189L)
| Estado | Tipo | Descricao |
|---|---|---|
| myTickets | Ingresso[] | Ingressos do usuario |
| myPresencas | Evento[] | Eventos com presenca confirmada |
| cortesiasPendentes | CortesiaPendente[] | Cortesias aguardando aceite |
| transferenciasPendentes | TransferenciaPendente[] | Transferencias aguardando |

**Acoes:**
- `loadMyTickets(userId)` — SELECT tickets_caixa WHERE owner_id + cache 30s
- `devolverCortesia(ticket)` — cortesiasService.devolverCortesia
- `transferirIngresso(ticket, destId, destNome)` — transferenciaService.transferir
- `aceitarCortesiaPendente(id)` — cortesiasService.aceitarCortesia → gera ticket
- `recusarCortesiaPendente(id)` — cortesiasService.recusarCortesia

## Servicos

### transferenciaService (services/transferenciaService.ts)
- `transferir({ticketId, eventoId, remetenteId, ...})` — INSERT transferencias_ingresso + UPDATE ticket status TRANSFERIDO
- `aceitar(transferenciaId, userId)` — UPDATE transferencia ACEITO + cria novo ticket pro destinatario
- `recusar(transferenciaId, userId)` — UPDATE transferencia RECUSADO + restaura ticket original

### cortesiasService (features/admin/services/cortesiasService.ts)
- `initCortesia(eventoId, config)` — INSERT cortesias_config
- `devolverCortesia(eventoId, ticketId, eventoNome, nomeUsuario)` — devolve cortesia
- `getCortesiasPendentes(userId)` — SELECT cortesias_pendentes WHERE destinatario_id
- `aceitarCortesia(cortesiaId, userId)` — chama RPC `aceitar_cortesia_rpc` (SECURITY DEFINER) que valida ownership, marca ACEITO e cria ticket atomicamente
- `recusarCortesia(cortesiaId, userId)` — UPDATE status RECUSADO
- `registerCallbacks(...)` — callbacks para realtime

### jwtService (features/admin/services/jwtService.ts)
- Gera token JWT para o QR code do ingresso
- QR = token assinado com ticketId + eventoId

## Arquivos
| Arquivo | Linhas | Funcao |
|---|---|---|
| modules/wallet/WalletView.tsx | 453 | Tela principal da carteira |
| modules/wallet/components/EventTicketsCarousel.tsx | 741 | Carrossel de ingressos por evento |
| modules/wallet/components/TicketList.tsx | 319 | Lista de ingressos |
| modules/wallet/components/TicketQRModal.tsx | 211 | Modal com QR code do ingresso |
| modules/wallet/components/WalletLockScreen.tsx | 331 | Tela de bloqueio da carteira (PIN) |
| modules/wallet/components/PresencaList.tsx | 40 | Lista de presencas |

## Fluxos

### VER MEUS INGRESSOS
**Quem**: Usuario logado
**Navegacao**: Bottom nav "Carteira" -> WalletView
**O que acontece**:
1. useTicketsStore.loadMyTickets(userId) — busca tickets_caixa WHERE owner_id
2. Agrupa por evento (EventTicketsCarousel)
3. Cada ticket mostra: area, genero, status, valor
4. Separacao: proximos eventos vs passados (PresencaList)

### VER QR CODE
**Quem**: Usuario com ingresso DISPONIVEL
**Navegacao**: WalletView -> clica ticket -> TicketQRModal
**O que acontece**:
1. jwtService gera token JWT com ticketId
2. QR code renderizado com token
3. Portaria escaneia QR -> valida token -> check-in

**Consequencia**: portaria valida e queima ingresso (usado_em, usado_por, status USADO)

### TRANSFERIR INGRESSO
**Quem**: Usuario com ingresso DISPONIVEL
**Navegacao**: WalletView -> ticket -> opcao Transferir -> busca amigo -> confirma
**O que acontece**:
1. transferenciaService.transferir → INSERT transferencias_ingresso (status PENDENTE)
2. UPDATE tickets_caixa SET status = TRANSFERIDO
3. Destinatario recebe notificacao

**Quem recebe**:
- Destinatario: ve transferencia pendente, pode aceitar ou recusar
- Se aceitar: novo ticket criado pro destinatario, transferencia ACEITO
- Se recusar: ticket original restaurado (status DISPONIVEL), transferencia RECUSADO

### CORTESIA (receber/aceitar/recusar)
**Quem**: Usuario que recebeu cortesia
**Navegacao**: WalletView -> badge cortesias pendentes -> aceitar/recusar
**O que acontece**:
- Aceitar: cortesiasService.aceitarCortesia → RPC `aceitar_cortesia_rpc` (SECURITY DEFINER) cria ticket (origem CORTESIA) + UPDATE cortesia ACEITO atomicamente
- Recusar: cortesiasService.recusarCortesia → UPDATE cortesia RECUSADO

**Quem envia cortesia**: Admin/gerente via dashboard (cortesiasService do admin)

### DEVOLVER CORTESIA
**Quem**: Usuario que recebeu cortesia e quer devolver
**Navegacao**: WalletView -> ticket cortesia -> opcao Devolver
**O que acontece**: cortesiasService.devolverCortesia → ticket removido/cancelado

### WALLET LOCK (PIN)
**Quem**: Usuario (configuracao)
**Navegacao**: WalletView -> WalletLockScreen
**O que acontece**: usuario define PIN para proteger carteira. Ao abrir carteira, precisa digitar PIN.
**Dados**: PIN armazenado localmente (supabaseClient, nao no banco)

## Onde este modulo aparece (propagacao)

| Tela | O que usa |
|---|---|
| Bottom nav | Badge de tickets + cortesias pendentes |
| EventDetailView | Botao "Ja tenho ingresso" se ticket existe |
| CheckoutPage | BroadcastChannel atualiza carteira |
| Check-in portaria | Valida QR do ticket |
| PedidosSubView (admin) | Lista tickets do evento |
| HistoricoView (perfil) | Tickets passados |
| TransferirModal | Fluxo de transferencia |

## Checklist de status
| # | Item | Status | Detalhe |
|---|---|---|---|
| 1 | WalletView | OK | 453L, agrupa por evento |
| 2 | Carrossel ingressos | OK | EventTicketsCarousel 741L |
| 3 | QR code JWT | OK | TicketQRModal + jwtService |
| 4 | Transferir ingresso | OK | transferenciaService completo |
| 5 | Aceitar/recusar transferencia | OK | Fluxo bidirecional |
| 6 | Cortesias pendentes | OK | Aceitar/recusar/devolver |
| 7 | Presencas (eventos passados) | OK | PresencaList 40L |
| 8 | Wallet Lock (PIN) | OK | WalletLockScreen 331L |
| 9 | Cache 30s | OK | circuitBreaker + cache layer |
| 10 | Realtime callbacks cortesias | OK | registerCallbacks |
| 11 | Reembolso de ingresso (usuario) | OK | EventTicketsCarousel importa solicitarReembolsoAutomatico de reembolsoService, elegibilidade verificada, modal inline |
| 12 | Notificacao ao receber transferencia | OK | transferenciaService envia notify tipo TRANSFERENCIA_PENDENTE |
| 13 | Notificacao ao receber cortesia | OK | cortesiasService envia notificationsService.add tipo CORTESIA_PENDENTE |
| 14 | Historico de transferencias | NAO EXISTE | Usuario nao ve historico de transferencias feitas |
| 15 | Download ingresso PDF | NAO EXISTE | Sem export do ingresso |
| 16 | Apple Wallet / Google Wallet | NAO EXISTE | Sem integracao com wallets nativas |
| 17 | RLS segura (tickets/cortesias/transf) | OK | Policies restritivas: owner, team, admin. Zero brechas. RPC aceitar_cortesia_rpc SECURITY DEFINER |
