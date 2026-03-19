# Criado: 2026-03-06 01:47 | Ultima edicao: 2026-03-06 01:47

# Sub-modulo: Saque + Reembolso (Hierarquia)

## Pertence a: modulo_financeiro_completo.md

## SAQUE — Fluxo hierarquico

### Etapas
```
Gerente solicita saque (ModalSaque)
-> INSERT solicitacoes_saque (etapa SOLICITADO)
-> Se evento COM_SOCIO: gerente precisa aprovar (autorizarSaqueGerente)
   -> etapa = GERENTE_APROVADO
-> Master recebe para aprovacao final
-> Master aprova (confirmarSaque) → etapa = PAGO
   OU Master recusa (recusarSaque) → motivo_recusa
   OU Master estorna (estornarSaque)
```

### Dados do saque
- valor: quanto quer sacar
- valor_liquido: apos taxas
- valor_taxa: taxa cobrada
- pix_tipo: CPF, CNPJ, EMAIL, CELULAR
- pix_chave: chave PIX

### Metodos (eventosAdminService)
- `solicitarSaque(eventoId)` — INSERT
- `autorizarSaqueGerente(id)` — etapa GERENTE_APROVADO
- `confirmarSaque(id)` — master aprova, etapa PAGO
- `recusarSaque(id, motivo)` — recusa
- `estornarSaque(id)` — estorna
- `getSolicitacoesSaque()` — pendentes
- `getSaquesByProdutor(produtorId)` — historico

### Notificacao
- SAQUE_APROVADO enviado ao produtor (eventosAdminFinanceiro.ts)

## REEMBOLSO — Fluxo hierarquico

### Dois tipos
1. **AUTOMATICO**: usuario solicita, sistema verifica elegibilidade
2. **MANUAL**: admin inicia manualmente

### Etapas (reembolso automatico)
```
Usuario solicita reembolso (EventTicketsCarousel -> solicitarReembolsoAutomatico)
-> podeReembolsoAutomatico verifica:
   - Prazo OK (politica_reembolso / prazo_reembolso_dias)
   - Limite mensal OK (reembolsos_contagem)
   - Ticket elegivel
-> INSERT reembolsos (tipo AUTOMATICO, etapa SOLICITADO)

Hierarquia de aprovacao:
1. Se evento COM_SOCIO → socio decide (socio_decisao)
2. Gerente decide (gerente_decisao)
3. Master decide → aprovacao final

Cada etapa:
- aprovarReembolsoEtapa(id) → avanca etapa
- executarReembolsoFinal(id) → APROVADO, ticket cancelado
- recusarReembolso(id, motivo) → REJEITADO
```

### Etapas (reembolso manual)
```
Admin abre ModalReembolsoManual -> seleciona ticket -> motivo
-> solicitarReembolsoManual → INSERT reembolsos (tipo MANUAL)
-> Mesmo fluxo de aprovacao hierarquica
```

### Metodos (reembolsoService, ~590L)
- `podeReembolsoAutomatico(ticketId)` — elegibilidade (usa criado_em do ticket, CDC Art. 49)
- `solicitarReembolsoAutomatico(ticketId, eventoId, userId)` — INSERT + refund Stripe via EF process-stripe-refund (auto até R$100)
- `solicitarReembolsoManual(ticketId, eventoId, motivo)` — INSERT manual
- `aprovarReembolsoEtapa(reembolsoId, aprovadorId)` — cadeia hierárquica + refund Stripe quando APROVADO
- `rejeitarReembolsoManual(id, motivo)` — rejeita
- `getReembolsosPorEvento(eventoId)` — lista
- `getReembolsosPendentes()` — pendentes
- `getReembolsos(eventoIds?)` — todos (master financeiro)

### Metodos (eventosAdminService)
- `verificarLimiteReembolso(userId)` — checa reembolsos_contagem
- `solicitarReembolso(ticketId)` — wrapper
- `aprovarReembolsoEtapa(id)` — avanca etapa
- `executarReembolsoFinal(id)` — executa
- `recusarReembolso(id, motivo)` — recusa

### Notificacao
- reembolsoService usa notifyService (in-app + push FCM + email Resend — 3 canais automáticos)
- Tipos: REEMBOLSO_SOLICITADO (sócios/gerentes/masters), REEMBOLSO_APROVADO, REEMBOLSO_RECUSADO (solicitante)

### Limite mensal
- Tabela reembolsos_contagem: (user_id, mes_ano, contagem)
- Verifica antes de permitir novo reembolso

## Telas
| Tela | O que mostra |
|---|---|
| FinanceiroView -> ModalSaque | Formulario de saque |
| FinanceiroView -> ReembolsosSection | Lista reembolsos do evento |
| FinanceiroView -> ModalReembolsoManual | Reembolso manual |
| FinanceiroView -> HistoricoSaques | Historico de saques |
| MasterFinanceiroView | Saques + reembolsos pendentes (master) |
| EventTicketsCarousel | Solicitar reembolso (usuario) |

## Checklist
| # | Item | Status | Detalhe |
|---|---|---|---|
| 1 | Solicitar saque | OK | ModalSaque + INSERT |
| 2 | Hierarquia saque (gerente → master) | OK | Etapas implementadas |
| 3 | Recusar saque | OK | motivo_recusa |
| 4 | Estornar saque | OK | estornarSaque |
| 5 | Notif saque aprovado | OK | SAQUE_APROVADO |
| 6 | Reembolso automatico | OK | Elegibilidade + INSERT |
| 7 | Reembolso manual | OK | ModalReembolsoManual |
| 8 | Hierarquia reembolso (socio → gerente → master) | OK | 3 etapas |
| 9 | Limite mensal | OK | reembolsos_contagem |
| 10 | Notif reembolso (3 canais) | OK | REEMBOLSO_SOLICITADO/APROVADO/RECUSADO via notifyService (in-app + push + email) |
| 11 | Chargeback | OK | registrarChargeback |
| 12 | Comprovante de pagamento saque | OK | uploadComprovanteSaque + confirmarSaque aceita arquivo + HistoricoSaques mostra botão + modal fullscreen |
| 13 | Extrato financeiro | NAO EXISTE | Sem extrato detalhado |
| 14 | Double-click guard | OK | useRef + try/finally em confirmarSaque, estornarSaque (masterFinanceiro) e aprovarReembolso, rejeitarReembolso (financeiro) |
| 15 | Observabilidade | OK | logger.error (Sentry) em reembolsoService + eventosAdminFinanceiro com IDs contextuais |
| 16 | Modal "Tem certeza?" saque | OK | Fix 16/mar: modal bottom-sheet antes de confirmar/estornar saque no masterFinanceiro |
