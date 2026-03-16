# Skill: Dados e Analytics VANTA
# Ativada automaticamente pelos squads: equipe-dados, dba (Sage), gerente-geral (Alex)

## Stack de Dados

### Banco de Dados Principal: Supabase (PostgreSQL)
- 199 migrations ativas
- 19 Edge Functions
- RLS habilitado em todas as tabelas publicas
- Conexao: via Supabase MCP ou SQL direto

### Tabelas Principais (referencia)
- `profiles` — usuarios (id, nome, email, avatar, plano, created_at)
- `events` — eventos (id, titulo, data, local, capacidade, preco, status)
- `tickets` — ingressos (id, user_id, event_id, tipo, status, qr_code)
- `plans` — planos de assinatura (FREE, VANTA, MAIS_VANTA)
- `subscriptions` — assinaturas ativas (user_id, plan_id, status, stripe_id)
- `payments` — pagamentos (id, user_id, valor, status, stripe_payment_id)
- `waitlist` — lista de espera (email, referral_code, position)
- `check_ins` — check-ins nos eventos (ticket_id, timestamp, metodo)
- `reviews` — avaliacoes de eventos (user_id, event_id, nota, comentario)
- `notifications` — notificacoes push (user_id, tipo, titulo, lido)

### Stripe (Pagamentos)
- Planos recorrentes (mensal/anual)
- Ingressos avulsos
- Webhooks configurados
- Metricas: MRR, churn, LTV disponíveis via Stripe Dashboard

## Comandos de Dados

### /metricas [periodo]
Gera relatorio de metricas do periodo (padrao: ultimos 7 dias):

**Metricas de Produto:**
- DAU / WAU / MAU (usuarios ativos)
- Taxa de retencao D1, D7, D30
- Sessoes por usuario
- Telas mais visitadas (funil)
- Tempo medio de sessao

**Metricas Financeiras:**
- MRR (Monthly Recurring Revenue)
- Novos assinantes vs churns
- ARPU (Average Revenue Per User)
- Receita de ingressos vs assinaturas
- LTV estimado por cohort

**Metricas de Engajamento:**
- Eventos visualizados vs ingressos comprados (conversao)
- Taxa de check-in (compraram vs foram)
- NPS medio (reviews)
- Referrals gerados

### /consulta-sql [descricao]
Escreve e executa query SQL otimizada:
- Sempre usar CTEs pra legibilidade
- Sempre limitar com LIMIT (padrao 100)
- Nunca SELECT * em tabelas grandes
- Sempre incluir WHERE em deletes/updates (CRITICO)
- Respeitar RLS — usar service_role SOMENTE quando necessario

### /dashboard [tipo]
Cria dashboard interativo em HTML:
- `produto`: DAU, retencao, funil, engajamento
- `financeiro`: MRR, churn, LTV, ARPU, receita
- `eventos`: proximos eventos, ingressos vendidos, capacidade, check-ins
- `marketing`: CAC, ROAS, conversoes, fontes de trafego
- `completo`: todos os acima em abas

### /funil [nome]
Analisa funil de conversao:
- `onboarding`: download > cadastro > completar perfil > primeiro evento
- `compra`: ver evento > ver detalhes > iniciar compra > confirmar > pagar
- `upgrade`: free > ver beneficios > iniciar upgrade > pagar > ativar plano
- `retencao`: primeiro evento > segundo evento > terceiro evento (habito)

### /cohort [metrica] [periodo]
Analise de cohort por semana ou mes:
- Retencao por cohort de signup
- Revenue por cohort
- Engajamento por cohort
- Compara cohorts pra identificar tendencias

## Alertas Automaticos (regras pro equipe-dados)

Quando qualquer dessas condicoes for detectada, reportar ao Alex como VERMELHO:
- Churn mensal > 10%
- DAU cair > 20% vs semana anterior
- Taxa de erro em pagamentos > 2%
- Tempo de resposta de queries > 3 segundos
- Tabela sem RLS acessada via API publica

Reportar como AMARELO:
- Retencao D7 < 30%
- ARPU cair vs mes anterior
- Funil de compra com conversao < 3%
- Query rodando > 1 segundo

## Queries Prontas (referencia rapida)

```sql
-- Usuarios ativos hoje
SELECT COUNT(DISTINCT user_id) as dau
FROM auth.sessions
WHERE created_at >= CURRENT_DATE;

-- MRR atual
SELECT SUM(p.preco) as mrr
FROM subscriptions s
JOIN plans p ON s.plan_id = p.id
WHERE s.status = 'active';

-- Top eventos por venda
SELECT e.titulo, COUNT(t.id) as vendidos, e.capacidade,
  ROUND(COUNT(t.id)::numeric / e.capacidade * 100, 1) as ocupacao_pct
FROM tickets t
JOIN events e ON t.event_id = e.id
WHERE t.status = 'confirmed'
GROUP BY e.id
ORDER BY vendidos DESC
LIMIT 10;

-- Funil de onboarding (ultimos 30 dias)
WITH signups AS (
  SELECT COUNT(*) as total FROM profiles WHERE created_at >= CURRENT_DATE - 30
),
completed_profile AS (
  SELECT COUNT(*) as total FROM profiles WHERE avatar IS NOT NULL AND created_at >= CURRENT_DATE - 30
),
first_event AS (
  SELECT COUNT(DISTINCT user_id) as total FROM tickets WHERE created_at >= CURRENT_DATE - 30
)
SELECT
  s.total as cadastros,
  cp.total as perfil_completo,
  fe.total as primeiro_ingresso
FROM signups s, completed_profile cp, first_event fe;
```

## Regras de Dados

1. **Nunca expor dados pessoais** em dashboards compartilhados (email, telefone, CPF)
2. **Sempre anonimizar** em exports e relatorios externos
3. **RLS e obrigatorio** — toda nova tabela PRECISA de policy
4. **Backup antes de migration** — Sage deve garantir que tem backup antes de rodar
5. **Metricas sao sagradas** — nunca arredonde ou ajuste numeros pra parecer melhor
6. **LGPD**: direito ao esquecimento, portabilidade, consentimento documentado
