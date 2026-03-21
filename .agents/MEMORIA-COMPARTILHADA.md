# VANTA — Memória Compartilhada da Equipe

> Índice curto. Detalhes ficam nas atas (Memo) e memórias de módulo.
> Todo agente DEVE ler este arquivo ANTES de agir.

---

## Estado Atual

**Fase:** Produção e testes finais + Visual Redesign
**Última sessão:** 2026-03-21 (sessão 27)
**Atualizado por:** Lia

---

## Decisões Ativas (o que vale AGORA)

| Decisão | Onde ler detalhes |
|---------|-------------------|
| Painel admin: sidebar completa, V2/V3 são protótipos | `VANTA_LIVRO.md` (Cap. Admin) |
| ZERO workarounds `as any` — migration primeiro | `memory/feedback_zero_workarounds_any.md` |
| Consultar referências visuais do Dan antes de redesenhar | `memory/feedback_alex_demitido.md` |
| Memo OBRIGATÓRIO em toda sessão | `.claude/agents/memo.md` |
| Gate Duplo (Lia + Memo) antes de commit | `.claude/hooks/enforce-gate-duplo.sh` |
| Rafa NUNCA age sozinho — convoca especialistas | `memory/feedback_rafa_convoca_equipe.md` |
| Rafa NÃO atualiza memória de módulo (delega) | `.claude/hooks/block-rafa-memory-update.sh` |
| Rafa NÃO escreve atas (Memo faz) | `.claude/hooks/block-rafa-ata.sh` |
| Posicionamento VANTA = descoberta + curadoria + benefícios | `VANTA_PRODUTO.md` (Seção 1) |
| Identidade visual: Confiança, Curadoria, Estilo | `VANTA_PRODUTO.md` (Seção 10) |
| Modelo financeiro: taxa variável, D+15, Stripe Connect | `VANTA_PRODUTO.md` (Seção 2) |
| Stripe TEST MODE ativo (secrets + 3 EFs deployed) | `VANTA_PRODUTO.md` (Seção 7) |
| Login Google ATIVO, Apple aguarda conta Developer | `VANTA_PRODUTO.md` (Seção 8) |
| Padrão sprint: blocos → investigar → plano → Dan aprova → executar | `memory/feedback_padrao_sprint_sessao.md` |
| Negociação sócio REMOVIDA do app (fora do app) | `VANTA_PRODUTO.md` (Seção 6) |

---

## Estado Atual do Código (o que está implementado)

| Feature | Status | Onde ver detalhes |
|---------|--------|-------------------|
| VANTA_LIVRO 100% Nível A (8470L, ~410 seções) | ✅ | `VANTA_LIVRO.md` |
| Reorganização memórias: 3 fontes da verdade | ✅ | `memory/MEMORY.md` |
| Stripe TEST MODE (secrets + webhook + 3 EFs) | ✅ | `VANTA_PRODUTO.md` (Seção 7) |
| Login social Google ativo, Apple pendente | ✅/⏳ | `VANTA_PRODUTO.md` (Seção 8) |
| Deep links Capacitor + iOS gerado | ✅ | `memory/plataformas.md` |
| RPCs atômicas (criar_evento + criar_comunidade) | ✅ | `VANTA_LIVRO.md` |
| Wizards v2 (FormWizard + drafts + 4 steps) | ✅ | `VANTA_LIVRO.md` |
| Design tokens @theme + Playfair Display Bold 700 | ✅ | `VANTA_LIVRO.md` |
| EventCard + EventCarousel redesign | ✅ | `VANTA_LIVRO.md` |
| 28 testes (financeiro, auth, RBAC) | ✅ | `tests/unit/` |
| Auditoria admin: 197 views, 73 services, ZERO órfãos | ✅ | Sessão 21 |
| 21 `as any` removidos (2 legítimos mantidos) | ✅ | Sessão 21 |
| LGPD exportação dados (RPC) | ✅ | `VANTA_PRODUTO.md` |
| 16 agentes especializados | ✅ | `.claude/agents/` |

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

Ver `VANTA_PRODUTO.md` (Seções 7 e 8) para pendências técnicas e externas completas.

### Pendências externas
- Conta Apple Developer ($99/ano) — login Apple + deep links iOS + App Store
- Android Studio — build Android
- Conta Google Play Console ($25) — Google Play

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
- **Registrar mudança** → adicionar 1 linha na tabela "Estado Atual do Código" com link
- **NUNCA** escrever detalhes aqui — só ponteiros
- **Conflito** com fonte da verdade → LIVRO/PRODUTO/FLUXOS têm prioridade

*Criado: 14/mar/2026. Atualizado: 21/mar/2026.*
