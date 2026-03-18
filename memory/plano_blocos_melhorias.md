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
