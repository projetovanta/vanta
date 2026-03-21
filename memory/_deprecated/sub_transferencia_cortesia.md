# Criado: 2026-03-06 01:46 | Ultima edicao: 2026-03-06 01:46

# Sub-modulo: Transferencia + Cortesia

## Pertence a: modulo_carteira.md

## Transferencia de Ingresso

### Fluxo completo
```
Dono do ticket -> WalletView -> seleciona ticket -> "Transferir"
-> busca amigo (friendshipsService) -> seleciona destinatario -> confirma

1. transferenciaService.transferir:
   a. INSERT transferencias_ingresso (status PENDENTE)
   b. UPDATE tickets_caixa SET status = TRANSFERIDO
   c. notify(destinatario, tipo TRANSFERENCIA_PENDENTE)

2. Destinatario recebe notificacao -> ve transferencia pendente

3a. ACEITAR:
   transferenciaService.aceitar:
   a. SELECT transferencia + JOIN ticket
   b. UPDATE transferencia status = ACEITO
   c. UPDATE ticket original owner_id = destinatario, status = DISPONIVEL
   d. Retorna ingresso atualizado pro destinatario

3b. RECUSAR:
   transferenciaService.recusar:
   a. UPDATE transferencia status = RECUSADO
   b. UPDATE ticket original status = DISPONIVEL (restaura)
```

### Tabela: transferencias_ingresso
(detalhada em modulo_carteira.md)

### Service: transferenciaService (services/transferenciaService.ts)
- `transferir({ticket, eventoId, remetente, destinatario})` — INSERT + UPDATE + notify
- `aceitar(transferenciaId, userId)` — UPDATE ACEITO + muda owner
- `recusar(transferenciaId, userId)` — UPDATE RECUSADO + restaura

### RLS
- SELECT: remetente OU destinatario
- INSERT: apenas remetente (auth.uid() = remetente_id)
- UPDATE: apenas destinatario (auth.uid() = destinatario_id) + WITH CHECK

## Cortesia

### Fluxo completo
```
Admin/gerente -> Dashboard evento -> Cortesias -> seleciona destinatario -> envia

1. cortesiasService.enviarCortesia (via admin):
   a. INSERT cortesias_pendentes (status PENDENTE)
   b. notificationsService.add(tipo CORTESIA_PENDENTE)

2. Destinatario recebe notificacao -> WalletView -> badge cortesias pendentes

3a. ACEITAR:
   cortesiasService.aceitarCortesia -> RPC `aceitar_cortesia_rpc` (SECURITY DEFINER):
   a. Valida cortesia PENDENTE + destinatario_id = auth.uid()
   b. UPDATE cortesia status = ACEITO
   c. INSERT tickets_caixa (origem CORTESIA, owner_id = auth.uid(), status DISPONIVEL)
   d. Retorna ingresso pro destinatario (atomico, server-side)

3b. RECUSAR:
   cortesiasService.recusarCortesia:
   a. UPDATE cortesia status = RECUSADO

4. DEVOLVER (apos aceitar):
   cortesiasService.devolverCortesia:
   a. Ticket cancelado/removido
   b. Cortesia volta ao pool
```

### Tabelas
- cortesias_pendentes (detalhada em modulo_carteira.md)
- cortesias_config (config por evento, detalhada em modulo_carteira.md)

### RLS cortesias_pendentes
- SELECT: destinatario_id = auth.uid()
- INSERT: is_event_team_member(evento_id::uuid) OR is_vanta_admin()
- UPDATE: destinatario_id = auth.uid()

### RLS tickets_caixa
- SELECT: owner_id = auth.uid() | is_event_team_member(evento_id) | is_vanta_admin()
- INSERT: owner_id = auth.uid() | is_event_team_member(evento_id) | is_vanta_admin()
- UPDATE: owner_id = auth.uid() | is_event_team_member(evento_id) | is_vanta_admin()
- DELETE: nenhuma policy (nao se deleta ticket)

### Realtime
cortesiasService.registerCallbacks — recebe cortesias em tempo real via Supabase Realtime

## Checklist
| # | Item | Status | Detalhe |
|---|---|---|---|
| 1 | Transferir ingresso | OK | transferenciaService completo |
| 2 | Aceitar transferencia | OK | Muda owner_id |
| 3 | Recusar transferencia | OK | Restaura ticket |
| 4 | Notificacao transferencia | OK | TRANSFERENCIA_PENDENTE |
| 5 | RLS transferencia | OK | Policies remetente/destinatario + WITH CHECK |
| 6 | Enviar cortesia (admin) | OK | cortesiasService |
| 7 | Aceitar cortesia | OK | RPC aceitar_cortesia_rpc SECURITY DEFINER (atomico) |
| 8 | Recusar cortesia | OK | UPDATE RECUSADO |
| 9 | Devolver cortesia | OK | devolverCortesia |
| 10 | Notificacao cortesia | OK | CORTESIA_PENDENTE |
| 11 | Realtime cortesias | OK | registerCallbacks |
| 12 | Transferir para nao-amigo | NAO EXISTE | Apenas para amigos |
| 13 | Limite de transferencias | NAO EXISTE | Sem limite por ticket |
