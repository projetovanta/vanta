---
name: plano_auditoria_correcoes
description: Plano de correção das divergências encontradas na auditoria profunda sessão 27-29 — checklist de execução
type: project
---

# Plano de Correção — Auditoria Profunda (Sessão 29)

> Checklist de execução. Marcar [x] a cada passo concluído.

---

## BLOCO A — Precisam de decisão do Dan (5 itens)

- [x] **A1. Taxa de processamento Stripe** — cascata VANTA→produtor→cliente, Stripe define valor
  - Doc diz: 3.49% + R$0.39 (cartão) / 0.80% (PIX)
  - Banco diz: `taxa_processamento_percent DEFAULT 0.025` (2.5%)
  - Arquivo: `VANTA_PRODUTO.md` Seção 2
  - Aguardar resposta do Dan

- [x] **A2. Checkout in-app vs site** — manter regra "sempre no site", pendência de migração anotada
  - Doc diz: "Checkout SEMPRE no site (nunca in-app — Apple cobra 30%)"
  - Código: `CheckoutPage.tsx` funciona dentro do app
  - Arquivo: `VANTA_PRODUTO.md` Seção 2
  - Aguardar resposta do Dan

- [x] **A3. "Top Deals" na UI admin** — renomear pra "Benefícios" na UI, código interno mantém "deals"
  - Regra: Palavra "deals" é PROIBIDA
  - Código: `AnalyticsMaisVantaView.tsx` L223 exibe "Top Deals" na interface
  - Também: `DealsMaisVantaView.tsx`, `clubeDealsService.ts` (nomes internos)
  - Aguardar resposta do Dan: corrigir UI? Nomes internos podem manter?

- [x] **A4. Dashboard Realtime** — já implementado, movido de "futuro" para "implementado" no doc
  - Doc diz: Feature futura
  - Código: `DashboardV2Home.tsx` L141 tem referência Realtime
  - Aguardar resposta do Dan

- [x] **A5. Funções teste no banco** — manter durante dev (badges ativos), remover antes do lançamento
  - Doc diz: Deletar `atualizar_eventos_teste()` + `seed_eventos_home_vitrine()` antes do lançamento
  - Código: Não existem no repo (só em types gerados)
  - Aguardar resposta do Dan: verificar no Supabase se já foram removidas?

---

## BLOCO B — Doc desatualizado, corrigir VANTA_PRODUTO.md (13 itens)

- [x] **B1. Onboarding — "5 telas" → "3 steps + login separado"**
  - Arquivo: `VANTA_PRODUTO.md` L158-163
  - De: `### Onboarding — 5 telas` com 5 itens
  - Para: `### Onboarding — Login + 3 Steps` separando login (AuthModal/LoginView) dos 3 steps do OnboardingView (Cidade, Interesses, Boas-vindas)

- [x] **B2. Tab Bar — "5 abas" → "5 + 1 condicional"**
  - Arquivo: `VANTA_PRODUTO.md` L131-132
  - De: `### Tab Bar — 5 abas fixas`
  - Para: `### Tab Bar — 5 abas fixas + 1 condicional` / adicionar ADMIN_HUB (só admins)

- [x] **B3. Home seções — atualizar ordem real**
  - Arquivo: `VANTA_PRODUTO.md` L134-137
  - De: Guest vitrine separada + seções Ao Vivo/Amigos Vão/Perto/Semana/Feed
  - Para: Guest = mesma Home + GuestSignupBanner. Logado = Saudação → Highlights → Próximos Eventos → Indica Pra Você → Mais Vendidos 24h → Locais Parceiros → Descubra Cidades → Benefícios MV. MV = + card "Seus Benefícios" no topo

- [x] **B4. VANTA Indica tipos — 5 → 7**
  - Arquivo: `VANTA_PRODUTO.md` L140
  - De: `5 tipos: Evento, Parceiro, MAIS_VANTA, Experiencia, Informativo`
  - Para: `7 tipos: EVENTO, PARCEIRO, MAIS_VANTA, EXPERIENCIA, INFORMATIVO, DESTAQUE_EVENTO, PUBLICIDADE`

- [x] **B5. Footer gratuito — "Confirmar Presença" → "Eu vou!"**
  - Arquivo: `VANTA_PRODUTO.md` L148 e L345
  - De: `Gratuito ("Confirmar Presenca")`
  - Para: `Gratuito ("Eu vou!")`

- [x] **B6. Busca sub-abas — 3 → 4**
  - Arquivo: `VANTA_PRODUTO.md` L177-179
  - De: `3 sub-abas: Eventos, Pessoas, "Pra Voce"`
  - Para: `4 sub-abas: Eventos, Pessoas, Lugares, "Pra Voce"`

- [x] **B7. Perfil sub-views — 8 → 17**
  - Arquivo: `VANTA_PRODUTO.md` L165-166
  - De: 8 sub-views (MAIN, EDIT_PROFILE, PREFERENCES, MINHA_EXPERIENCIA, CLUBE, MEIA_ENTRADA, PENDENCIAS, BLOQUEADOS)
  - Para: 17 sub-views (+ WALLET legado, MY_TICKETS, PUBLIC_PREVIEW, CHAT_ROOM, PREVIEW_PUBLIC, PREVIEW_FRIENDS, HISTORICO, SOLICITAR_PARCERIA, MINHAS_SOLICITACOES)

- [x] **B8. Busca por Lugares — mover de "futuras" para "implementadas"**
  - Arquivo: `VANTA_PRODUTO.md` L275
  - Remover da tabela de Features Futuras e adicionar nota em B6

- [x] **B9. `as any` — 2 → 14**
  - Arquivo: `VANTA_PRODUTO.md` L305
  - De: `2 as any legitimos restantes`
  - Para: `14 as any em 8 arquivos` com lista detalhada (chatSettingsService 5x, authService 2x, supabaseVantaService 2x, achievementsService 1x, eventosAdminCore 1x, dashboardAnalyticsService 1x, CopiarModal 1x, ConfigMaisVantaView 1x)

- [x] **B10. Botão MV — "Usar Benefício" → "Você tem benefício"**
  - Arquivo: `VANTA_PRODUTO.md` L347
  - De: `Membro MV com beneficio: "Usar Beneficio" (dourado)`
  - Para: `Membro MV com beneficio: "Voce tem beneficio" (dourado, expansivel com detalhe)`

- [x] **B11. Inter pesos — adicionar 300 e 700**
  - Arquivo: `VANTA_PRODUTO.md` L373
  - De: `Inter = corpo (Regular 400, Medium 500, Semibold 600, Black 900)`
  - Para: `Inter = corpo (Light 300, Regular 400, Medium 500, Semibold 600, Bold 700, Black 900)`

- [x] **B12. Playfair Display SC → sem SC**
  - 2 arquivos:
    - `CLAUDE.md` L86: `Playfair Display SC Bold 700` → `Playfair Display Bold 700`
    - `.agents/BRIEFING.md` L25: `Playfair Display SC (títulos)` → `Playfair Display Bold 700 (títulos)`
  - (VANTA_PRODUTO.md L372 já está correto — sem SC)

- [x] **B13. Footer adaptativo seção 3 — alinhar com código** (corrigido junto com B5)
  - Arquivo: `VANTA_PRODUTO.md` L148
  - De: `Footer adaptativo: Pago ("Garantir Ingresso"), Gratuito ("Confirmar Presenca"), Lotando ("Ultimas vagas"), Ja comprou ("Garantido")`
  - Para: `Footer adaptativo: Pago ("Eu vou!" secundario + "Garantir Ingresso" dourado), Gratuito ("Eu vou!" dourado), Confirmado ("Confirmado ✓"), MV ("Voce tem beneficio" expansivel)`

---

## BLOCO C — Memórias de suporte (3 arquivos)

- [x] **C1. EDGES.md — stores atualizadas, 7 tabelas adicionadas, RPC corrigido, rename clube/index.ts**
  - Arquivo: `memory/EDGES.md`
  - Stores: atualizar contagens (useAuthStore 24→47, useTicketsStore 4→9, useChatStore 6→8, useSocialStore 5→10, useExtrasStore 3→10)
  - Tabelas: corrigir consumers de socios_evento, eventos_admin, profiles, membros_clube
  - Adicionar tabelas faltantes: audit_logs, vendas_log, chat_settings, mais_vanta_config_evento, solicitacoes_parceria, cupons, mesas
  - Corrigir RPC gerar_ocorrencias_recorrente consumer (eventosAdminService→CriarEventoView)
  - Renomear clubeIndex.ts → clube/index.ts
  - Método: Grep cirúrgico de cada store/tabela

- [x] **C2. responsividade.md — tabela z-index completa + colisão z-600 documentada**
  - Arquivo: `memory/responsividade.md`
  - Adicionar ~15 componentes faltantes por faixa z-index
  - Notar colisão VantaPickerModal z-[600] vs Toast z-[600]
  - Método: Grep `z-\[\d` por faixa

- [x] **C3. plataformas.md — 3 correções**
  - Arquivo: `memory/plataformas.md`
  - Manifest: "8 ícones" → "5 ícones no manifest (48, 72, 96, 192, 512)"
  - E2E: "5 specs" → "14 specs"
  - Plugin App: remover da lista de plugins do capacitor.config.ts

---

## BLOCO D — Verificação final

- [x] **D1. `npm run diff-check`** — OK (TSC + ESLint + lint:layout + memory-audit)
- [x] **D2. Grep de termos antigos** — 0 ocorrências nos arquivos corrigidos
- [x] **D3. MEMORY.md** — 47 linhas (< 180)
- [x] **D4. Atualizar sessao_atual.md** — atualizado sessão 30
- [x] **D5. MEMORY.md** — ponteiro já existia

---

## Progresso

| Bloco | Total | Feitos | Status |
|-------|-------|--------|--------|
| A (decisão Dan) | 5 | 5 | ✅ COMPLETO |
| B (doc PRODUTO) | 13 | 13 | ✅ COMPLETO |
| C (memórias suporte) | 3 | 3 | ✅ COMPLETO |
| D (verificação) | 5 | 5 | ✅ COMPLETO |
| **TOTAL** | **26** | **0** | — |
