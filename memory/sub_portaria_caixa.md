# Criado: 2026-03-06 01:47 | Ultima edicao: 2026-03-06 01:47

# Sub-modulo: Portaria (Check-in) + Caixa (Venda Presencial)

## Pertence a: modulo_evento.md + modulo_listas.md + modulo_compra_ingresso.md

## Check-in (Portaria)

### Arquivos (6 arquivos, 954L)
| Arquivo | Linhas | Funcao |
|---|---|---|
| checkin/index.tsx | 78 | CheckInView — selecao de evento |
| checkin/EventCheckInView.tsx | 388 | Tela de check-in (QR + Lista) |
| checkin/QRScanner.tsx | 303 | Scanner de QR code (camera) |
| checkin/FeedbackOverlay.tsx | 58 | Feedback visual (VERDE/AMARELO/VERMELHO) |
| checkin/EventoCheckInCard.tsx | 124 | Card de evento na selecao |
| checkin/checkinTypes.ts | 3 | Tipos: Modo (LISTA|QR), FeedbackTela |

### Fluxo CHECK-IN QR
```
Portaria abre CheckInView -> seleciona evento -> EventCheckInView
-> Modo QR -> QRScanner (camera)
-> Escaneia QR do ingresso
-> jwtService decodifica token → extrai ticketId
-> eventosAdminService.validarEQueimarIngresso
   -> UPDATE tickets_caixa SET status=USADO, usado_em=now(), usado_por=porteiro
-> FeedbackOverlay:
   VERDE = sucesso (ingresso valido)
   AMARELO = atencao (ja usado ou algo irregular)
   VERMELHO = erro (ingresso invalido/cancelado)
```

### Fluxo CHECK-IN LISTA
```
Portaria abre EventCheckInView -> Modo LISTA
-> Busca por nome (index GIN trgm, busca fuzzy)
-> Seleciona convidado
-> listasService.checkIn → UPDATE checked_in=true, checked_in_em, checked_in_por_nome
-> Se regra tem valor: portaria cobra na entrada
```

### Offline
- offlineEventService + offlineDB para funcionar sem internet
- Sincroniza quando volta online
- useConnectivity hook monitora status

## Caixa (Venda Presencial)

### Arquivos (2 arquivos, 835L)
| Arquivo | Linhas | Funcao |
|---|---|---|
| caixa/index.tsx | 120 | CaixaView — selecao de evento |
| caixa/EventoCaixaView.tsx | 715 | Tela de venda presencial |

### Fluxo VENDA PRESENCIAL
```
Caixa abre CaixaView -> seleciona evento -> EventoCaixaView
-> Ve lotes/variacoes disponiveis com precos
-> Seleciona variacao + quantidade
-> Pode gerar via RPC processar_venda_caixa:
   -> INSERT tickets_caixa (origem PORTA, status DISPONIVEL)
   -> INSERT transactions (tipo VENDA_CAIXA)
   -> UPDATE variacoes_ingresso.vendidos + N
   -> INSERT vendas_log (origem PORTA)
-> Gera QR code do ingresso na hora (pode imprimir ou mostrar na tela)
```

### Funcionalidades
- Selecao de lote/variacao
- Ajuste de quantidade
- Gerar ingresso com QR
- Offline mode (offlineEventService)
- Permissao de camera (usePermission)

## Checklist
| # | Item | Status | Detalhe |
|---|---|---|---|
| 1 | Check-in QR | OK | QRScanner 303L + validarEQueimarIngresso |
| 2 | Check-in Lista | OK | listasService.checkIn + busca fuzzy |
| 3 | Feedback visual | OK | FeedbackOverlay (3 cores) |
| 4 | Selecao de evento | OK | EventoCheckInCard + CheckInView |
| 5 | Offline check-in | OK | offlineEventService + offlineDB |
| 6 | Venda presencial | OK | EventoCaixaView 715L |
| 7 | Gerar QR na hora | OK | jwtService |
| 8 | Offline venda | OK | offlineEventService |
| 9 | Camera permission | OK | usePermission hook |
| 10 | Selfie check-in | NAO EXISTE | Sem captura de selfie na entrada |
| 11 | Lotacao em tempo real | NAO EXISTE | Sem contador ao vivo |
