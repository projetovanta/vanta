# APRENDIZADOS DA EQUIPE — Memoria Adaptativa
# Este arquivo registra licoes aprendidas, erros a evitar, e padroes de sucesso.
# TODOS os agentes DEVEM ler antes de trabalhar e ATUALIZAR apos cada sessao relevante.
# REGRA: So adicionar. NUNCA apagar. NUNCA editar o que ja existe.

---

## Como Funciona

1. Apos cada sessao de trabalho, o agente responsavel adiciona aprendizados
2. Memo organiza e categoriza durante o fechamento da ata
3. Todos os agentes consultam este arquivo no inicio de cada sessao
4. Padroes que se repetem 3+ vezes viram regra no REGRAS-GLOBAIS.md

---

## Licoes Tecnicas

> Erros tecnicos, solucoes encontradas, padroes de codigo.
> Formato: [DATA] Agente — Licao

<!-- Exemplos:
[2026-03-16] Kai — Sempre rodar `supabase db reset` local antes de push de migration
[2026-03-16] Luna — Zustand: usar slices separados por modulo, nunca store monolitico
[2026-03-16] Zara — RLS policy nova = testar com 3 roles (anon, authenticated, service)
[2026-03-16] Val — Vitest: mock de Supabase com `vi.mock('@supabase/supabase-js')`
-->

---

## Licoes de Processo

> Aprendizados sobre como trabalhar melhor em equipe.
> Formato: [DATA] Agente — Licao

<!-- Exemplos:
[2026-03-16] Alex — Sempre confirmar com Dan antes de envolver mais de 2 agentes
[2026-03-16] Memo — Atas parciais a cada 30min evitam perda de contexto em sessoes longas
[2026-03-16] Lia — Verificar fontes da verdade (LIVRO/PRODUTO/FLUXOS) ANTES de comecar trabalho, nao so antes do commit
-->

---

## Erros a NUNCA Repetir

> Erros graves que causaram problemas. VERMELHO. Todo agente deve conhecer.
> Formato: [DATA] Agente — Erro — Consequencia — Como evitar

<!-- Exemplos:
[2026-03-16] Ops — Deploy sem rodar testes — App quebrou em producao — SEMPRE Val antes de Ops
[2026-03-16] Kai — Migration sem backup — Perdeu dados de teste — SEMPRE backup antes
-->

---

## Padroes de Sucesso

> Abordagens que deram certo e devem ser repetidas.
> Formato: [DATA] Agente — Padrao — Resultado

<!-- Exemplos:
[2026-03-16] Alex — Diagnostico com 3 opcoes + recomendacao — Dan decide rapido
[2026-03-16] Luna — Prototipar em componente isolado antes de integrar — Menos bugs
-->

---

## Preferencias de Stack (evolucao)

> Registrar aqui mudancas e evolucoes nas preferencias tecnicas.
> Formato: [DATA] Decisao — Motivo

### Stack atual (Março 2026):
- Frontend: React 19 + TypeScript 5.8 + Vite 6 + Tailwind 4
- State: Zustand 5
- Backend: Supabase (PostgreSQL + Auth + Storage + Edge Functions + Realtime)
- Pagamentos: Stripe
- Mobile: Capacitor 8
- Deploy: Vercel
- Monitoramento: Sentry
- CI/CD: GitHub Actions + Claude Code Action

---

## Glossario VANTA

> Termos especificos do projeto que os agentes precisam conhecer.
> Formato: Termo — Definicao

| Termo | Definicao |
|-------|-----------|
| VANTA | Plataforma de experiencias exclusivas de noite premium |
| MAIS VANTA | Plano premium (R$149/mes) com concierge e prioridade total |
| Gate Duplo | Verificacao obrigatoria de Lia + Memo antes de commit |
| Preflight | Script de validacao pre-deploy (npm run preflight) |
| Ata | Registro diario de tudo que acontece nas sessoes de trabalho |
| Memoria Compartilhada | Quadro de avisos em MEMORIA-COMPARTILHADA.md |

> Adicionar termos novos conforme forem surgindo no projeto.

---

## Historico de Mudancas de Regras

> Quando uma regra muda, registrar aqui pra ninguem se perder.
> Formato: [DATA] Regra antiga → Regra nova — Motivo — Quem decidiu

<!-- Exemplos:
[2026-03-16] Sem Gate de commit → Gate Duplo (Lia + Memo) — Evitar perda de info — Dan
[2026-03-16] 21 agentes → 22 agentes (+ Memo) — Sistema de atas — Dan
-->

---

## Metricas de Aprendizado

> Quantos aprendizados por area (atualizar mensalmente)

| Area | Total | Ultimo update |
|------|-------|---------------|
| Tecnica | 0 | — |
| Processo | 0 | — |
| Erros | 0 | — |
| Sucesso | 0 | — |
| Stack | 0 | — |
| Glossario | 6 | 2026-03-16 |
