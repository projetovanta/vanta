---
name: Plano de Melhorias — 4 Blocos
description: Plano aprovado pelo Dan em 17/mar/2026 sessão 4 — melhorias no painel admin e app organizadas em 4 blocos temáticos
type: project
---

Plano de melhorias aprovado em 17/mar/2026 (sessão 4). 4 blocos independentes, priorizados por impacto.

**Why:** Dan pediu auditoria completa do painel e app. Equipe (Luna, Kai, Iris, Nix, Zara, Val, Théo) analisou 49 views, 200 arquivos, 52.807 linhas. Resultado: 4 blocos de melhorias cross-cutting.

**How to apply:** Executar bloco a bloco, na ordem de prioridade. Cada bloco é independente.

---

## Bloco 1 — Polimento Visual (PRIORIDADE 1)
**Donos: Iris + Luna | Impacto: percepção de qualidade**

| # | Item | Onde afeta |
|---|------|-----------|
| 1.1 | Tema escuro consistente (#0A0A0A base) | Todas 49 views admin + Home + modais |
| 1.2 | Empty states com ilustração + CTA | Admin (listas vazias) + App (carteira, sem eventos, sem amigos) |
| 1.3 | Skeleton loading (substituir spinners) | Admin (tabelas) + App (feed, cards, perfil) |
| 1.4 | VANTA Indica editor completo | Emoji picker + paleta cores + snaps melhorados + templates salvos no DB |

## Bloco 2 — Navegação e Busca Inteligente (PRIORIDADE 2)
**Donos: Luna + Kai | Impacto: produtividade do admin**

| # | Item | Onde afeta |
|---|------|-----------|
| 2.1 | CommandPalette busca dados (eventos, membros, comunidades) | Admin |
| 2.2 | Breadcrumbs (até 4 níveis de profundidade) | Admin |
| 2.3 | Deep links admin (URL reflete view atual) | Admin + compartilhável |
| 2.4 | Cargos com descrição (o que cada cargo pode fazer) | Admin + App |

## Bloco 3 — Financeiro e Dados com Contexto (PRIORIDADE 3)
**Donos: Nix + Kai + Luna | Impacto: decisões de negócio**

| # | Item | Onde afeta |
|---|------|-----------|
| 3.1 | Seletor de período (hoje/7d/30d/custom) | Financeiro + Analytics + Relatórios + Dashboard |
| 3.2 | Sparklines nos KPIs (tendência visual) | Dashboard + Financeiro + Analytics MV |
| 3.3 | Audit log contextual (botão "Histórico" em cada view) | Financeiro + Eventos + Membros |
| 3.4 | Evolução mensal gráfico (receita/tickets por mês) | Financeiro Master + Dashboard comunidade |

## Bloco 4 — Operações em Escala (PRIORIDADE 4)
**Donos: Luna + Kai + Zara | Impacto: eficiência operacional**

| # | Item | Onde afeta |
|---|------|-----------|
| 4.1 | Batch actions (checkbox + barra de ação) | Membros, Eventos, Convites |
| 4.2 | Filtros avançados em listas (componente reutilizável) | Pendências, Eventos, Membros |
| 4.3 | Notificações batch (enviar pra grupo) | Admin → Usuário |
| 4.4 | Sessão ativa + timeout (30min inativo = logout) | Admin header + segurança |
