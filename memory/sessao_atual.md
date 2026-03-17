# Sessao Atual — Estado para Continuidade

## Branch: main
## Ultimo commit: `26c69fc` — feat: Sprint 2 completo
## Mudancas locais: SIM (B1 Stripe deploy + B2 iOS gerado + memórias)
## Preflight: 8/8 verde (pre-commit do 26c69fc)

## Resumo da sessao (17 mar 2026 — sessao 2)

### Commits desta sessao
1. `26c69fc` — feat: Sprint 2 completo (comprovante saque, CSV, encerrar/cancelar, LGPD)

### Sprint 2 — COMPLETO
| Bloco | Itens | Status |
|-------|-------|--------|
| S2-A: Financeiro | Comprovante saque + CSV (saques, reembolsos, master) | ✅ |
| S2-B: Eventos | Encerrar/cancelar evento + Templates notificação (já existia) | ✅ |
| S2-C: LGPD | Exportação dados (RPC exportar_dados_usuario) + exclusão conta (já existia) | ✅ |
| S2-D: Config | MV Cidades/Parceiros/Deals + Categorias (já existia) | ✅ |

### B1 Stripe — ATIVO (TEST MODE)
- Conta Stripe teste criada pelo Dan
- Webhook configurado (9 eventos)
- Secrets no Supabase (STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET)
- 3 Edge Functions deployed (create-checkout, create-ticket-checkout, stripe-webhook)

### B2 Teste celular — iOS GERADO
- `npx cap add ios` + `npx cap sync` OK
- Projeto em `ios/App/App.xcodeproj`
- Pronto pra rodar no Simulador iPhone via Xcode
- Android Studio não instalado (pendente)

### Migrations aplicadas nesta sessao
- 20260317200000_comprovante_saque (comprovante_url + bucket comprovantes-saque)
- 20260317210000_rpc_exportar_dados_usuario (LGPD exportação)

### Arquivos novos
- services/lgpdExportService.ts (exportação dados LGPD via RPC)
- memory/feedback_padrao_sprint_sessao.md (padrão de trabalho aprovado)

## Mapa de blocos

### BLOCO A — COMPLETO ✅
### BLOCO B
| B1 Stripe | ✅ TEST MODE | B2 Teste celular | ✅ iOS gerado |
| B3 Deep links | ✅ código + listener + plugin (falta TEAMID + SHA-256 pra produção) | B4 Comprovante saque | ✅ |
| B5 Cupom comunidade | ✅ | B6 Redes sociais | ✅ |
| B7 Autonomia master | ✅ Sprint 1+2 |

### BLOCO C
| C1 Login social | ✅ Google ATIVO + Apple aguarda conta Developer | C2 Onboarding produtor | ⏳ | C3 CMS master | ⏳ |

## Pendencias App (painel SISTEMA)
- Email caixa (Resend) | CNPJ | Deep links (TEAMID + SHA-256)
- Android Studio (instalar pra build Android)

## Pendencias gerais
- Conta Apple Developer ($99/ano) — pra App Store + deep links iOS + teste celular real + login Apple
- Conta Google Play Console ($25) — pra Google Play + deep links Android
- Google Cloud Console — ✅ FEITO (Client ID ativo, login Google funcional)
- CNPJ + emails legais
- Regime tributario
- NFS-e integrador
- Modelo preco publicidade Indica
