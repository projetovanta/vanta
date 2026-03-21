# Checklist Interativo — Mapeamento Completo do Projeto PREVANTA

## O QUE ESTAMOS FAZENDO
Mapeando CADA fluxo e sub-fluxo do app inteiro. Para cada um: quem faz, onde, como, o que acontece, quem recebe a reacao, o que falta.
Depois de mapeado, vamos passar juntos resolvendo o que falta.

## INDICE DE MAPEAMENTOS (divididos por arquivo)

| # | Dominio | Arquivo | Fluxos | Status |
|---|---|---|---|---|
| 1 | Fluxo principal (8 passos) | `checklist_m1_fluxo_principal.md` | 8 passos | COMPLETO |
| 2 | MAIS VANTA (clube) | `checklist_m2_mais_vanta.md` | F2.1-F2.14 (14 fluxos) | COMPLETO |
| 3 | Auth + Perfil + Social | `checklist_m3_auth_social.md` | F3.1-F3.18 (18 fluxos) | COMPLETO |
| 4 | Descoberta + Evento + Compra | `checklist_m4_evento_compra.md` | F4.1-F4.15 (15 fluxos) | COMPLETO |
| 5 | Admin Evento + Operacao | `checklist_m5_admin_operacao.md` | F5.1-F5.17 (17 fluxos) | COMPLETO |
| 6 | Financeiro | `checklist_m6_financeiro.md` | F6.1-F6.11 (11 fluxos) | COMPLETO |
| 7 | Master tools | `checklist_m7_master.md` | F7.1-F7.13 (13 fluxos) | COMPLETO |
| 8 | Infra + Edge Functions | `checklist_m8_infra.md` | F8.1-F8.24 (24 fluxos) | COMPLETO |
| 9 | Comunidade + RBAC | `checklist_m9_comunidade_rbac.md` | F9.1-F9.12 (12 fluxos) | COMPLETO |

**TOTAL: 132 fluxos mapeados**

## RESUMO DE PENDENCIAS (por prioridade)

### INCOMPLETO (precisa de trabalho)
- F2.7 — Assinaturas: nenhuma UI chama iniciarCheckout, Edge Function hardcoded, sem notif
- F2.8 — Passaportes: sem notificacao ao membro quando aprovado/rejeitado
- F2.10 — Membros: sem notificacao quando desbloqueado/banido
- F3.11 — Chat: sem push para mensagens offline
- F3.14 — Preferencias: NAO EXISTE (nao ha PreferencesView)
- F4.7 — Checkout: Stripe real pendente (CNPJ)
- F4.13 — Reembolso: Stripe refund pendente
- F4.15 — Mesas: admin OK, fluxo de COMPRA pelo usuario nao verificado
- F6.4 — Saque: PIX transfer manual
- F8.1 — Push Web: 0 tokens registrados
- F8.5 — create-checkout: hardcoded, CORS *, ninguem chama

### PARCIAL (funciona mas falta algo)
- F2.1 — Solicitar entrada clube: falta notificar admin
- F3.4 — Excluir conta: soft delete funcional, falta hard delete LGPD
- F5.3 — Copiar evento: PENDENTE (usuario pediu anotar)
- F6.1 — Receita: listas pagas NAO entram no FinanceiroView (saque/saldoConsolidado), so no TabResumoCaixa
- F6.5 — Reembolso admin: refund simulado

### DECISOES PENDENTES (perguntar ao usuario)
- F3.14: Criar PreferencesView? (tema, idioma, notif prefs)
- F4.15: Verificar fluxo de compra de mesa pelo usuario
- F3.4: Implementar hard delete LGPD?

## REVISAO COM USUARIO (onde parou)
- Passo 1 (Comunidade): OK ✓
- Passo 2 (Criar evento): F5.1 Steps 1-5 ✓, F5.2 ✓, F5.3 PENDENTE, F5.6 ✓, F5.7 parou aqui
- Faltam revisar: F5.11, F9.6, F4.15 (compra mesa), Passos 3-8

## DECISOES JA TOMADAS (historico)
- diasCastigo removido → substituido por bloqueio1Dias/bloqueio2Dias no config global
- Limite infracoes e prazo post: lidos do maisVantaConfigService (nao hardcoded)
- Planos: modal confirmacao para desativar, botao reativar para planos e tiers
- Capacidade: vem da comunidade (capacidadeMax), usuario confirmou que e suficiente
- Step4 Socio: observacao menor — VER_FINANCEIRO desmarcado mas split aparece no Step5
Ver cada arquivo de mapeamento para decisoes especificas.

## IDEIAS FUTURAS (NUNCA ESQUECER)
- **IDEIA B: Area publica de cadastro** — crescimento organico
- **BAR/CASHLESS** — PDV, comanda digital, creditos pre-pagos. FASE 2.
