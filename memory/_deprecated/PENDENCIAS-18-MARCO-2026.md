# PENDÊNCIAS VANTA — 18 de março de 2026
# Auditoria Total — 10 agentes, investigação completa do codebase

> **NINGUÉM EDITA CÓDIGO sem autorização do Dan.**
> Este arquivo é a ÚNICA FONTE DA VERDADE sobre o que precisa ser corrigido.

---

## STATUS — Atualizado 18/mar sessão 3

### RESOLVIDOS (28 itens)
✅ C1 overselling FOR UPDATE | ✅ C2 webhook PAGO/PAGO | ✅ C3 emitido_em→criado_em
✅ C4 refund Stripe EF | ✅ C8 RPCs versionadas (2 de 5) | ✅ C10 FKs auth.users (44 colunas)
✅ C11 CASCADE→RESTRICT | ✅ C12 policy socios_evento | ✅ C13 timestamps renomeados
✅ C14 deep link comunidade | ✅ C15 deep links admin | ✅ C16 push cleanup
✅ C23 design tokens @theme | ✅ A1 DOMPurify XSS | ✅ A4 npm 0 vulns
✅ A6 .limit() RBAC | ✅ A8 buckets storage | ✅ A11 N+1 membros
✅ A12 transferencias UUID+FK | ✅ A23 font-light | ✅ A24 cores neon
✅ A25 Inter peso 900 | ✅ A26 .nvmrc | ✅ A30 cupom usos webhook

### PENDENTES PRIORITÁRIOS
- C9 schema base (dump) | C5/C6/C7 credenciais (risco baixo)
- C17-C20 mobile (depende contas Apple/Google)
- C21/C22 testes (cobertura 2-3%)
- A2 CORS 7 EFs | A5 N+1 financeiro | A13 arquivos órfãos
- A22 hover mobile (160 ocorrências) | A27 lazy load ExcelJS/jsPDF
- Memórias: 18 desync, EDGES.md, paths

---

## LEGENDA
- **CRÍTICO** = bloqueia produção / risco de perda de dados ou dinheiro
- **ALTO** = deve corrigir antes de ir pra loja
- **MÉDIO** = melhorar quando puder
- **BAIXO** = nice to have

---

## CRÍTICOS (22 únicos)

### Dinheiro (Nix)
| # | Pendência | Arquivo/Local | Risco |
|---|-----------|---------------|-------|
| C1 | Race condition overselling — sem FOR UPDATE | `processar_compra_checkout` (migration) | 2 compras do último ingresso = ambas passam |
| C2 | Webhook marca PAGO quando RPC falha | `stripe-webhook/index.ts:160` | `allOk ? 'PAGO' : 'PAGO'` — bug literal |
| C3 | Reembolso usa coluna inexistente `emitido_em` | `reembolsoService.ts:204` | CDC Art. 49 quebrado |
| C4 | Refund nunca acontece no Stripe | Zero `stripe_refund` no codebase | Marca reembolsado mas dinheiro fica na VANTA |

### Segurança (Zara + Ops)
| # | Pendência | Arquivo/Local | Risco |
|---|-----------|---------------|-------|
| C5 | `VITE_DEV_ADMIN_KEY` = service_role key | `.env.local:9` | Se na Vercel, aparece no bundle JS |
| C6 | `SUPABASE_DB_PASSWORD` texto plano | `.env.local:4` | Acesso direto ao PostgreSQL |
| C7 | `SUPABASE_ACCESS_TOKEN` (PAT) exposto | `.env.local:8` | Management API do Supabase |

### Banco de Dados (Kai + Sage)
| # | Pendência | Arquivo/Local | Risco |
|---|-----------|---------------|-------|
| C8 | 5 RPCs sem migration | criar_comunidade_completa, criar_evento_completo, buscar_eventos_texto, get_saldo_consolidado, get_analytics_overview | Banco não recriável do zero |
| C9 | 27+ tabelas base sem CREATE TABLE | comunidades, eventos_admin, profiles, tickets_caixa, etc. | Schema inicial não versionado |
| C10 | TODAS FKs para profiles(id) dropadas | `20260301002000_drop_all_profiles_fk.sql` | Zero integridade referencial com usuários |
| C11 | ON DELETE CASCADE em reembolsos | `20260301100000_reembolsos_table.sql` | Deletar ticket apaga registro fiscal |
| C12 | Policy socios_evento usa cargos inexistentes | `20260306210000_socios_evento_multi.sql:71` | Policy morta, admin sem acesso |
| C13 | Timestamps migrations duplicados | 3 arquivos com `20260313001500`, 2 com `20260307100000` | Ordem indeterminada |

### Frontend (Luna)
| # | Pendência | Arquivo/Local | Risco |
|---|-----------|---------------|-------|
| C14 | Deep link /comunidade/:id quebrado | `App.tsx:157` | Push não leva à comunidade |
| C15 | Deep links admin não funcionam | `useAppHandlers.ts:217-222` | adminDeepLink não consumido |
| C16 | Push listeners sem cleanup | `App.tsx:174-182` | Memory leak nativo |

### Mobile (Rio)
| # | Pendência | Arquivo/Local | Risco |
|---|-----------|---------------|-------|
| C17 | iOS sem Podfile | `/ios/App/Podfile` ausente | Build impossível |
| C18 | Sem GoogleService-Info.plist | `/ios/App/App/` | Push nativo não funciona |
| C19 | Sem .entitlements iOS | `/ios/App/App/` | Push + deep links desativados |
| C20 | Android inexistente | `/android/` ausente | Zero build Android |

### QA (Val)
| # | Pendência | Arquivo/Local | Risco |
|---|-----------|---------------|-------|
| C21 | Cobertura testes ~2-3% | 90 assertions / 120k linhas | Fluxos críticos sem teste |
| C22 | Zero teste checkout/pagamento | — | Dinheiro real sem validação automatizada |

### Visual (Iris)
| # | Pendência | Arquivo/Local | Risco |
|---|-----------|---------------|-------|
| C23 | Sem design tokens centralizados | Sem tailwind.config custom | Paleta hardcoded em centenas de arquivos |

---

## ALTOS (28 únicos)

### Segurança
| # | Pendência | Arquivo |
|---|-----------|---------|
| A1 | XSS via dangerouslySetInnerHTML | `LegalEditorView.tsx:140` |
| A2 | CORS * em 10+ Edge Functions | Todas exceto notif-checkin-confirmacao |
| A3 | Upload sem validação server-side | `photoService.ts` |
| A4 | 4 vulns HIGH npm (serialize-javascript) | `npm audit` |

### Banco/Backend
| # | Pendência | Arquivo |
|---|-----------|---------|
| A5 | N+1 queries financeiro | `eventosAdminFinanceiro.ts:146` |
| A6 | Queries sem .limit() RBAC | `rbacService.ts:181,220,224` |
| A7 | Tabelas órfãs (lotes_mais_vanta, reservas_mais_vanta, niveis_prestigio) | Migrations |
| A8 | Buckets storage sem migration | eventos, comprovantes-meia, parceria-fotos, comunidades, indica-assets |
| A9 | toISOString() em filtros analytics | 4 services analytics |
| A10 | brand_profiles sem migration | Criada direto no Dashboard |
| A11 | N+1 em MembrosGlobaisMaisVantaView | Linhas 184-211 |
| A12 | transferencias_ingresso TEXT sem FK | `20260227090000` |

### Frontend
| # | Pendência | Arquivo |
|---|-----------|---------|
| A13 | 27 arquivos órfãos | _deprecated/, wizard/, form/, AdminGateway, etc. |
| A14 | 9 exports órfãos | VantaAlertModal, CARGO_DESCRICOES, parseDeepLink, etc. |
| A15 | useEffect sem cleanup ~40% | ~63 de 104 useEffects em /modules/ |
| A16 | Offline handling só 3 telas admin | Resto do app: branco ou erro |

### Mobile
| # | Pendência | Arquivo |
|---|-----------|---------|
| A17 | Info.plist sem permissões | Camera, Galeria, Localização |
| A18 | TEAMID placeholder | `apple-app-site-association` |
| A19 | Manifest sem ícone 144x144 | `manifest.json` |
| A20 | Landscape permitido iOS | `Info.plist` |
| A21 | Plugins nativos não instalados | StatusBar, SplashScreen, Keyboard |

### Visual
| # | Pendência | Arquivo |
|---|-----------|---------|
| A22 | 160 hover: em 72 arquivos | Views mobile com hover |
| A23 | font-light em branco/preto | 10 ocorrências |
| A24 | Cores fora da paleta | #FF3131, #39FF14, cyan, #00f2ea |
| A25 | Inter sem peso 800/900 | Google Fonts load |

### DevOps
| # | Pendência | Arquivo |
|---|-----------|---------|
| A26 | Sem .nvmrc | Raiz do projeto |
| A27 | ExcelJS 910KB + jsPDF 377KB no bundle | Lazy load urgente |
| A28 | Playwright não roda no CI | `.github/workflows/ci.yml` |

### Pagamentos
| # | Pendência | Arquivo |
|---|-----------|---------|
| A29 | Saque 100% manual | Sem Stripe Connect/Transfer |
| A30 | Cupom não decrementa usos (Stripe) | `stripe-webhook/index.ts` |

### Memórias (Lia)
| # | Pendência | Arquivo |
|---|-----------|---------|
| A31 | 18 memórias desync | modulo_*.md vs código |
| A32 | EDGES.md referencia arquivos removidos | NegociacaoSocioView, ConviteSocioModal |
| A33 | 18+ paths incorretos nas memórias | Ver relatório Lia |
| A34 | VantaAlertModal não existe | Referenciado em MEMORIA-COMPARTILHADA |

---

## MÉDIOS (53 itens) — resumo por área

- **Segurança**: rate limiting client-only, CSP unsafe-inline, deep links sem validação, localStorage com PIN, console.log em Edge Functions
- **Banco**: 3 tabelas sem RLS, RPCs com 7+ versões, useDraft toISOString, colunas duplicadas em profiles
- **Frontend**: ImageCropModal duplicado, SuccessScreen duplicado, 48 w-[Npx] hardcoded, tipos não usados
- **Mobile**: sem @capacitor/keyboard, sem back button Android, sem appStateChange, AbortController quase inexistente
- **Visual**: cores de estado não padronizadas, 5 tamanhos sub-12px, animate-pulse (proibido), border-radius de modais varia (4 valores)
- **DevOps**: ESLint com regras desligadas, sem staging Supabase, 211 migrations acumulando, DashboardV2Gateway 452KB
- **Pagamentos**: sem payment_intent.payment_failed, desconto MV client-side, sem FOR UPDATE no create-ticket-checkout

---

## MÉTRICAS DO CODEBASE

| Métrica | Valor |
|---------|-------|
| Linhas de código | ~120k+ |
| Arquivos .ts/.tsx | 539 |
| Services | 37 |
| Stores Zustand | 5 |
| Migrations SQL | 211 |
| Edge Functions | 20 |
| Testes (unit+integration) | 90 assertions |
| Testes E2E (Playwright) | 14 specs |
| Cobertura estimada | ~2-3% |
| Bundle JS | 6.2MB |
| Build dist/ | 27MB |
| TSC erros | 0 |
| Secrets expostos no git | 0 |

---

## PRIORIDADE SUGERIDA (Rafa + equipe)

### Hoje / Imediato
1. Verificar se `VITE_DEV_ADMIN_KEY` existe na Vercel (C5)
2. Rotacionar DB_PASSWORD e ACCESS_TOKEN (C6, C7)

### Bloco 1 — Dinheiro (antes de qualquer transação real)
3. FOR UPDATE no overselling (C1)
4. Fix ternário webhook PAGO/PAGO (C2)
5. Coluna emitido_em → criado_em no reembolso (C3)
6. Criar Edge Function de refund Stripe (C4)
7. Cupom decrementar usos no webhook (A30)

### Bloco 2 — Integridade do banco
8. Migration base com schema inicial (C8, C9)
9. Recriar FKs para auth.users(id) (C10)
10. ON DELETE RESTRICT em reembolsos (C11)
11. Fix policy socios_evento (C12)

### Bloco 3 — Frontend + Deep links
12. Fix deep link /comunidade/:id (C14)
13. Migrar adminDeepLink pro DashboardV2 (C15)
14. Cleanup push listeners (C16)
15. Deletar 27 arquivos mortos (A13)

### Bloco 4 — Mobile (antes da loja)
16. cap sync iOS (C17)
17. GoogleService-Info.plist (C18)
18. Entitlements iOS (C19)
19. Info.plist permissões (A17)
20. Instalar plugins nativos (A21)

### Bloco 5 — Visual + Design System
21. Criar tailwind.config com tokens (C23)
22. Remover hover: de views mobile (A22)
23. Carregar Inter 800/900 (A25)

### Bloco 6 — Testes (progressivo)
24. Teste de checkout end-to-end (C22)
25. Teste RPCs atômicas (C21)

### Bloco 7 — DevOps
26. npm audit fix (A4)
27. Lazy load ExcelJS + jsPDF (A27)
28. .nvmrc (A26)

### Bloco 8 — Memórias
29. Atualizar 18 memórias desync (A31)
30. Limpar EDGES.md (A32)
31. Corrigir 18+ paths (A33)

---

*Gerado por: Rafa (Gerente Geral) + Val (Guardiã do Código)*
*Baseado em: 10 auditorias paralelas (Luna, Kai, Zara, Val, Sage, Rio, Iris, Lia, Nix, Ops)*
*Tokens consumidos: ~500k*
*Data: 18 de março de 2026*
