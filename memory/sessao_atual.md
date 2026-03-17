# Sessao Atual — Estado para Continuidade

## Branch: main
## Ultimo commit: `7aba981` — fix: avatar padrão VANTA
## Mudancas locais: SIM (sidebar mobile fix)
## Preflight: diff-check OK

## Resumo da sessao (17 mar 2026 — sessao 2)

### Commits desta sessao (10)
1. `26c69fc` — feat: Sprint 2 completo (comprovante saque, CSV, encerrar/cancelar, LGPD)
2. `bb5ac26` — docs: B1 Stripe test mode + B2 iOS gerado
3. `56c1ca4` — feat: C1 Login Social Google + Apple
4. `2c71806` — feat: B3 Deep Links + Google ATIVO
5. `defc6b7` — fix: caminhos antigos + auditoria + BottomSheet
6. `1b9e1ee` — fix: audit deep com SQL + supabase dir
7. `79d7712` — docs: sincronizar memórias agentes
8. `c9b00b3` — feat: Dashboard V2 é o admin principal + admin-v2/v3 deletados
9. `1d5ad5b` — fix: CSP img-src Google avatar
10. `7aba981` — fix: avatar padrão VANTA sempre

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
- 20260317220000_trigger_profile_social_login (auto-create profile)
- 20260317230000_fix_avatar_padrao_vanta (avatar NEUTRO sempre)

### Painel Admin
- Dashboard V2 agora é o admin principal (features/dashboard-v2/)
- admin-v2 e admin-v3 deletados (protótipos mock, 2269L removidas)
- Sidebar mobile: começa fechada, fecha ao clicar item
- CSP: lh3.googleusercontent.com liberado em img-src
- Avatar: sempre padrão VANTA, nunca importa foto de provider

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
