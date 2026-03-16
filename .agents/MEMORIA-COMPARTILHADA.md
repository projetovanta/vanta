# VANTA — Memória Compartilhada da Equipe

> Índice curto. Detalhes ficam nas atas (Memo) e memórias de módulo.
> Todo agente DEVE ler este arquivo ANTES de agir.

---

## Estado Atual

**Fase:** Produção e testes finais
**Última sessão:** 2026-03-16
**Atualizado por:** Rafa

---

## Decisões Ativas (o que vale AGORA)

| Decisão | Onde ler detalhes |
|---------|-------------------|
| Painel admin: sidebar completa, V2/V3 são protótipos | `memory/painel_administrativo.md` |
| ZERO workarounds `as any` — migration primeiro | `memory/feedback_zero_workarounds_any.md` |
| Consultar referências visuais do Dan antes de redesenhar | `memory/feedback_alex_demitido.md` |
| Memo OBRIGATÓRIO em toda sessão | `.claude/agents/memo.md` |
| Gate Duplo (Lia + Memo) antes de commit | `.claude/hooks/enforce-gate-duplo.sh` |
| Rafa NUNCA age sozinho — convoca especialistas | `memory/feedback_rafa_convoca_equipe.md` |
| Rafa NÃO atualiza memória de módulo (delega) | `.claude/hooks/block-rafa-memory-update.sh` |
| Rafa NÃO escreve atas (Memo faz) | `.claude/hooks/block-rafa-ata.sh` |
| Posicionamento VANTA = descoberta + curadoria + benefícios | `memory/projeto_posicionamento.md` |
| Identidade visual: Confiança, Curadoria, Estilo | `memory/projeto_identidade_visual.md` |
| Modelo financeiro: taxa variável, D+15, Stripe Connect | `memory/projeto_modelo_financeiro.md` |
| Checkout Stripe integrado (falta secrets) | `memory/modulo_compra_ingresso.md` |

---

## Mudanças Recentes (resumo → detalhe na memória)

| O que mudou | Onde ler |
|-------------|----------|
| Dashboard V2 + Panorama + AdminViewHeader | `memory/painel_administrativo.md` |
| Negociação comercial completa | `memory/sub_aprovacao_negociacao.md` |
| 7 hooks de compliance criados | `.claude/settings.json` |
| 3 hooks de delegação criados (16/mar) | `block-rafa-memory-update.sh`, `block-rafa-ata.sh`, `warn-rafa-delegate.sh` |
| Copy auditada (deals→benefícios, grátis→entrada livre) | `memory/projeto_posicionamento.md` |
| Home reorganizada, perfil simplificado, checkout redesign | Memórias dos módulos respectivos |

---

## Regras que Afetam Todos

| Regra | Imposta por |
|-------|-------------|
| Migration ANTES de código | Hook `enforce-rafa-workflow.sh` |
| Ler feedbacks ANTES de agir | Hook `enforce-rules-compliance.sh` |
| Memo primeiro em toda sessão | Hook `enforce-memo-first.sh` |
| Preflight 8/8 antes de entregar | Hook `delivery-gate.sh` |
| Zero `as any` | Hook `enforce-rafa-workflow.sh` |
| Rafa delega código pros especialistas | Hook `warn-rafa-delegate.sh` |

---

## Próximas Prioridades

1. Auditar fluxos tela a tela do painel admin
2. Redesenhar hooks/protocolos de delegação dos 25 agentes
3. Configurar secrets Stripe (quando Dan tiver conta)
4. Onboarding do produtor (tour guiado)

---

## Glossário do Dan

| Dan fala | Significa |
|----------|----------|
| "dono do evento" | Sócio do evento |
| "dono da comunidade" | Gerente da comunidade |
| "tá quebrado" | Algo não funciona como deveria |
| "manda bala" | Pode executar |
| "segura" | NÃO executar, esperar |

---

## Como Usar

- **LER** antes de qualquer trabalho
- **Detalhes** → seguir o link da coluna "Onde ler"
- **Registrar mudança** → adicionar 1 linha na tabela "Mudanças Recentes" com link
- **NUNCA** escrever detalhes aqui — só ponteiros
- **Conflito** com memória de módulo → este arquivo tem prioridade (decisão mais recente)

*Criado: 14/mar/2026. Formato simplificado: 16/mar/2026.*
