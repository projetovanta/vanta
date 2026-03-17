# VANTA — Memória Compartilhada da Equipe

> Índice curto. Detalhes ficam nas atas (Memo) e memórias de módulo.
> Todo agente DEVE ler este arquivo ANTES de agir.

---

## Estado Atual

**Fase:** Produção e testes finais + Visual Redesign
**Última sessão:** 2026-03-17 (sessão 4)
**Atualizado por:** Memo

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
| Stripe TEST MODE ativo (secrets + 3 EFs deployed) | `memory/modulo_compra_ingresso.md` |
| Login Google ATIVO, Apple aguarda conta Developer | `memory/modulo_perfil_feed.md` |
| Padrão sprint: blocos → investigar → plano → Dan aprova → executar | `memory/feedback_padrao_sprint_sessao.md` |
| Negociação sócio REMOVIDA do app (fora do app) | `memory/sub_negociacao_socio.md` |

---

## Mudanças Recentes (resumo → detalhe na memória)

| O que mudou | Onde ler |
|-------------|----------|
| Visual Redesign Home + EventCard + VANTA Indica (sessão 4) | `memory/sessao_atual.md` |
| VANTA Indica: handlers rota completos (6 tipos) + 7 templates | `memory/sessao_atual.md` |
| Admin: sem sessionStorage, sempre abre Dashboard | `memory/sessao_atual.md` |
| Admin: max-w-[500px] contém absolute inset-0 (relative) | `memory/sessao_atual.md` |
| Bloco C completo (C1 login social, C2 onboarding produtor, C3 CMS master) | `memory/sessao_atual.md` |
| Sprint 2 completo (comprovante, CSV, encerrar/cancelar, LGPD) | `memory/sessao_atual.md` |
| Stripe TEST MODE ativo (secrets + webhook 9 eventos + 3 EFs) | `memory/modulo_compra_ingresso.md` |
| Login social Google + Apple (código pronto, Google ativo) | `memory/modulo_perfil_feed.md` |
| Deep links Capacitor (deepLinkService + @capacitor/app) | `memory/plataformas.md` |
| iOS gerado (npx cap add ios + sync) | `memory/plataformas.md` |
| LGPD exportação dados (RPC exportar_dados_usuario) | `memory/modulo_perfil_feed.md` |
| Encerrar/cancelar evento (UI + service) | `memory/modulo_evento.md` |
| BottomSheet componente reutilizável criado | `memory/componentes_compartilhados.md` |
| Audit scripts corrigidos (apontam pra memory/ do repo) | Scripts `memory-audit*.mjs` |
| 20 divergências de memória corrigidas | Auditoria 17/mar |

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

1. Conta Apple Developer ($99/ano) — login Apple + deep links iOS + App Store
2. Android Studio — build Android
3. Conta Google Play Console ($25) — Google Play
4. Testar app no Simulador iOS (Xcode já pronto)
5. Polir fluxos existentes tela a tela

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

*Criado: 14/mar/2026. Atualizado: 17/mar/2026.*
