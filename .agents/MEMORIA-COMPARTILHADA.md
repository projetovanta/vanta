# VANTA — Memória Compartilhada da Equipe

> Índice curto. Detalhes ficam nas atas (Memo) e memórias de módulo.
> Todo agente DEVE ler este arquivo ANTES de agir.

---

## Estado Atual

**Fase:** Produção e testes finais + Visual Redesign
**Última sessão:** 2026-03-18 (sessão 2)
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
| Plano Wizards v2: 6 FASES COMPLETAS (38 itens entregues em 1 sessão) | `memory/plano_wizards_v2.md` |
| Fase 1-6: correções + design system + wizards 4 steps + drafts + índices/constraints + features | `memory/sessao_atual.md` |
| 10 componentes novos: FormWizard, InputField, UploadArea, CelebrationScreen, AccordionSection, etc. | `components/wizard/` + `components/form/` |
| Tabela drafts criada (rascunho auto-save 3s, expira 30 dias) | Migration Supabase |
| 16 índices + 10 CHECK constraints + UNIQUE dedup evento | Migration Supabase |
| classificacao_etaria (LIVRE/16+/18+) + limite_notificacoes_mes na comunidade | Migration Supabase |
| Social proof, urgência "Últimos ingressos", benefício MV ao lado do botão, return-to-context | Fase 6 |
| RPCs atômicas: criar_evento_completo + criar_comunidade_completa (transação única) | `memory/sub_criar_evento.md` + `memory/sub_comunidade_crud.md` |
| Push 2h antes pra equipe (push_agendados) + deep link convite sócio + resumo promoter D+1 | `memory/sessao_atual.md` |
| Storage RLS restritiva: bucket comunidades só gerente RBAC ou masteradm | Migration Supabase |
| Backlog limpo: CARGO_DESCRICOES já integrado, fontSize px normal (Recharts SVG) | Verificado 18/mar |
| RTK instalado + TTL markers 30min + markers reutilizáveis (velocidade 3-4x) | `memory/sessao_atual.md` |
| Auditoria limpeza: selects, deprecated, fontFamily, cnpjValidator | `memory/sessao_atual.md` |
| Bloco 8 Auditoria COMPLETO (sessão 5): audit RBAC, extrato, CNPJ, histórico edições | `memory/plano_blocos_melhorias.md` |
| Blocos 6-7 COMPLETOS (sessão 5): PDF comprovante, histórico transf, realtime, remover lista | `memory/plano_blocos_melhorias.md` |
| Bloco 5 Busca Inteligente COMPLETO (sessão 5): aba Lugares, histórico buscas | `memory/sub_busca_filtros.md` |
| 3 novos agentes: Axel (Integrações), Maya (Produto), Pixel (Crescimento) | `.claude/agents/` |
| 20 decisões features futuras (Dan, sessão 5) | `memory/decisoes_features_futuras.md` |
| Projeto IA visual: agente com visão + análise de marca + geração de imagem | Em investigação |
| Bloco 1 Polimento Visual COMPLETO (sessão 5): EmptyState, Skeleton, Indica editor | `memory/sessao_atual.md` |
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

### Plano 4 Blocos de Melhorias (aprovado 17/mar sessão 4)
1. **Bloco 1 — Polimento Visual** ✅ COMPLETO
2. **Bloco 2 — Navegação** ✅ COMPLETO
3. **Bloco 3 — Financeiro** ✅ COMPLETO
4. **Bloco 4 — Operações** ✅ COMPLETO — todos os 4 blocos entregues na sessão 5

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
- **Registrar mudança** → adicionar 1 linha na tabela "Mudanças Recentes" com link
- **NUNCA** escrever detalhes aqui — só ponteiros
- **Conflito** com memória de módulo → este arquivo tem prioridade (decisão mais recente)

*Criado: 14/mar/2026. Atualizado: 17/mar/2026.*
