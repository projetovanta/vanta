---
name: Plano de Melhorias — 4 Blocos
description: Plano aprovado pelo Dan em 17/mar/2026 sessão 4 — melhorias no painel admin e app organizadas em 4 blocos temáticos
type: project
---

Plano de melhorias aprovado em 17/mar/2026 (sessão 4). 4 blocos independentes, priorizados por impacto.

**Why:** Dan pediu auditoria completa do painel e app. Equipe (Luna, Kai, Iris, Nix, Zara, Val, Théo) analisou 49 views, 200 arquivos, 52.807 linhas. Resultado: 4 blocos de melhorias cross-cutting.

**How to apply:** Executar bloco a bloco, na ordem de prioridade. Cada bloco é independente.

---

## Bloco 1 — Polimento Visual (COMPLETO — sessão 5)
**Donos: Iris + Luna | Impacto: percepção de qualidade**

| # | Item | Status |
|---|------|--------|
| 1.1 | Tema escuro consistente | ✅ Já estava 95% OK |
| 1.2 | EmptyState reutilizável + CTA | ✅ Componente + 5 telas |
| 1.3 | Skeleton loading | ✅ 5 variantes + 4 telas |
| 1.4 | VANTA Indica editor (emoji + paleta) | ✅ 24 emojis + 8 cores + badgeColor |

## Bloco 2 — Navegação e Busca Inteligente (COMPLETO — sessão 5)
**Donos: Luna + Kai | Impacto: produtividade do admin**

| # | Item | Status |
|---|------|--------|
| 2.1 | CommandPalette busca dados reais | ✅ Supabase + debounce |
| 2.2 | Breadcrumbs no AdminViewHeader | ✅ Prop opcional |
| 2.3 | Deep links admin (hash URL) | ✅ #admin/VIEW |
| 2.4 | Cargos com descrição | ✅ 8 cargos + CARGO_DESCRICOES |

## Bloco 3 — Financeiro e Dados com Contexto (COMPLETO — sessão 5)
**Donos: Nix + Kai + Luna | Impacto: decisões de negócio**

| # | Item | Status |
|---|------|--------|
| 3.1 | PeriodSelector + filtro real nos financeiros | ✅ |
| 3.2 | Sparklines KPIs | ⏭️ N/A (Dashboard já tem) |
| 3.3 | Audit log contextual + botão Histórico | ✅ |
| 3.4 | VendasTimelineChart nos financeiros | ✅ |

## Bloco 4 — Operações em Escala (COMPLETO — sessão 5)
**Donos: Luna + Kai + Zara | Impacto: eficiência operacional**

| # | Item | Status |
|---|------|--------|
| 4.1 | BatchActionBar componente | ✅ |
| 4.2 | FilterBar componente | ✅ |
| 4.3 | Notificações batch (enviarAgora) | ✅ |
| 4.4 | Session timeout 30min (useSessionTimeout) | ✅ |

## Bloco 5 — Busca Inteligente (COMPLETO — sessão 5)
**Donos: Luna | Impacto: descoberta de eventos e lugares**

| # | Item | Status |
|---|------|--------|
| 5.1 | Aba "Lugares" na busca (comunidades) | ✅ |
| 5.2 | Autocomplete ao vivo | ✅ (já existia via debounce) |
| 5.3 | Histórico buscas com limpar | ✅ localStorage + pills |

## Bloco 6 — Carteira Premium (COMPLETO — sessão 5)
**Donos: Luna + Kai | Impacto: experiência do ingresso**

| # | Item | Status |
|---|------|--------|
| 6.1 | PDF comprovante sem QR | ✅ ticketReceiptPdf + botão Comprovante |
| 6.2 | Apple/Google Wallet | ⏭️ Bloco 9 (contas externas) |
| 6.3 | Histórico transferências | ✅ getHistorico + seção Wallet |

## Bloco 7 — Admin ao Vivo (COMPLETO — sessão 5)
**Donos: Luna + Kai | Impacto: operação do evento**

| # | Item | Status |
|---|------|--------|
| 7.1 | Dashboard realtime | ✅ Supabase Realtime tickets_caixa |
| 7.2 | Notificação promoter (cota) | ✅ Já existia (notify 3 canais) |
| 7.3 | Remover da lista | ✅ removerConvidado (só quem adicionou) |

## Bloco 8 — Auditoria e Controle (COMPLETO — sessão 5)
**Donos: Kai + Luna + Axel | Impacto: governança e rastreio**

| # | Item | Status |
|---|------|--------|
| 8.1 | Audit RBAC | ✅ getAllAtribuicoes + atribuidoPor/atribuidoEm |
| 8.2 | Extrato financeiro | ✅ ExtratoFinanceiro.tsx com filtros |
| 8.3 | Validar CNPJ | ✅ cnpjValidator.ts (dígito + BrasilAPI) |
| 8.4 | Histórico edições comunidade | ✅ COMUNIDADE_EDITADA no audit |

## Bloco 9 — Integrações Externas (precisa contas)
| # | Item | Dependência |
|---|------|------------|
| 9.1 | Apple Wallet | Conta Developer $99 |
| 9.2 | Google Wallet | Service account GCP |
| 9.3 | Nota fiscal NFe.io | CNPJ ativo |
