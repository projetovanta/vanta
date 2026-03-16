# Sessao Atual — Estado para Continuidade

## Branch: main
## Ultimo commit: `2237e31` — docs: sessao_atual
## Mudancas locais: SIM — 65 arquivos (NÃO commitado, Dan precisa pedir commit)
## Preflight: 8/8
## Dev server: precisa `npm run dev` pra testar

## Resumo da sessao (16 mar 2026)

### Alex demitido, Rafa contratado
- Alex ignorou memórias, substituiu admin sem autorização, usou `as any`, 3h perdidas
- Rafa é o novo gerente-geral com protocolos obsessivos de memória

### Negociação Comercial (COMPLETA — migration aplicada, tipos gerados, Edge Function deployada)
- Tabela condicoes_comerciais no Supabase (RLS com profiles + atribuicoes_rbac + dono_id)
- condicoesService.ts (definir/aceitar/recusar/histórico/resumoGlobal)
- ComercialTab na ComunidadeDetalheView (master define condições + histórico)
- CondicoesProducerView (sócio aceita/recusa com countdown 7 dias)
- CondicoesResumoCard no MasterFinanceiroView
- Edge Function expirar-condicoes DEPLOYADA (cron: expira pendentes > 7 dias)
- SocioDashboardView: botão "Condições Comerciais" nas ações rápidas
- AdminSubView CONDICOES_COMERCIAIS nos dois admins

### Admin V3 — views reais plugadas (protótipo em /admin-v3)
- AdminV3Gateway com props, lazy imports, renderContent() + guards RBAC
- NÃO substitui admin principal (decisão Dan)

### Agentes importados/atualizados
- Memo (100% novo — secretário executivo, Gate Duplo)
- Lia (atualizada — Gate Duplo + formato verificação + protocolos)
- Iris (atualizada — formato análise visual + protocolos)
- Dr. Théo (atualizado — formato parecer + protocolos)

### Hooks atualizados
- pre-execute-confirm.sh substitui block-dangerous-git.sh (cobre mais: SQL, deploy, rm, Gate Duplo no commit)
- pre-write-confirm.sh NOVO (protege arquivos críticos)

### Protocolos importados
- PROTOCOLO-ANTI-ALUCINACAO.md, PROTOCOLO-ERRO.md, DECISION-LOG template
- REGRAS-GLOBAIS.md, PERFIL-DAN.md, APRENDIZADOS.md
- 4 skills: dados, marketing, orquestração, produto
- Sistema de atas (template + índice)

### Referências visuais identificadas
- ~/Downloads/ui-ux-pro-max-skill-main — ferramenta de busca UI/UX (usar pra dashboard)
- ~/Downloads/claude-cookbooks-main — cookbooks do Claude (referência técnica)

## Feito nesta sessão (16 mar continuação)

### Dashboard V2 (COMPLETO — preflight 8/8)
- Rota `/dashboard-v2` standalone — NÃO substitui o painel atual
- `DashboardV2Gateway.tsx` — RBAC via get_admin_access + abas de role (ferramenta de dev)
- `DashboardV2Home.tsx` — pendências primeiro, hero financeiro dourado, gráfico, pizza, resumo, MV, ações
- `VendasTimelineChart.tsx` — gráfico de linha dourada (vendas ao longo do tempo)
- `getVendasTimeline(periodo, comunidadeId?)` — método novo no dashboardAnalyticsService
- Rota registrada no App.tsx

### Hooks e regras
- Hook `enforce-rules-compliance.sh` — bloqueia se não leu feedbacks ou não consultou equipe
- Feedbacks: `feedback_rafa_convoca_equipe.md`, `feedback_ler_memorias_obrigatorio.md`
- Regras atualizadas: convocação de equipe + leitura obrigatória de feedbacks

## Feito nesta sessão (16 mar continuação 2)

### Dashboard V2 — Panorama "Caixa de Entrada"
- PanoramaHome criado — mostra TUDO do usuário (pendências + negócios + operação)
- 6 homes por role (Master, Gerente, Sócio, Promoter, Portaria, Caixa)
- Toque num card → entra no contexto com sidebar + home por cargo
- "← Panorama" no header pra voltar

### Padronização AdminViewHeader
- AdminViewHeader.tsx criado — componente padrão (← esquerda, título, ações direita)
- 44 views migradas — TODAS usam AdminViewHeader
- Padrão único: voltar sempre esquerda, título + kicker, ações à direita, touch 44px+
- `absolute inset-0` → `flex-1` em todas

### Hooks criados/atualizados
- enforce-rules-compliance.sh — gate master (feedbacks, Memo, equipe, as any, diff-check)
- enforce-rafa-obligations.sh — checa obrigações pós-edit
- enforce-rafa-workflow.sh — agentes por contexto + layout + Supabase
- enforce-gate-duplo.sh — bloqueia commit sem Lia + Memo + preflight
- enforce-memo-first.sh — bloqueia sem Memo ativo
- enforce-memo-ata.sh — avisa se ata desatualizada após decisão
- track-diffcheck.sh — marca diff-check passou/falhou
- Memo adicionado ao CLAUDE.md + BRT

### Regras documentadas
- Rafa convoca equipe obrigatório
- Ler feedbacks obrigatório
- Supabase: migration antes de código
- Preflight 8/8 antes de entregar

## Proximo passo
1. **Auditar todos os fluxos tela a tela** — criar evento, criar comunidade, criar parceiro, cupom, MAIS VANTA, etc.
2. Configurar secrets Stripe — quando Dan tiver conta
3. Onboarding do produtor (tour guiado)

## Decisões Dan (sessão 16/mar)
- Painel admin: sidebar completa, V2/V3 são protótipos de referência
- Dashboard impactante pro empresário: mesma lógica pra todos, filtrado por RBAC
- ZERO workarounds `as any` — migration primeiro, tipos depois, código por último
- SEMPRE consultar referências visuais do Dan antes de redesenhar
- Memo SEMPRE chamado primeiro em toda sessão
- Gate Duplo obrigatório (Lia + Memo) antes de commit

## Pendencias gerais
- Login social (Google/Apple)
- Teste no celular real
- CNPJ + emails legais
- Deep links + Info.plist
- Regime tributário (consultar contador)
- NFS-e integrador
- Modelo preço publicidade Indica
- Stripe sem secrets
