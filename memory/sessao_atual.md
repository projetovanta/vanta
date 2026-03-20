# Sessao Atual — Estado para Continuidade

## Branch: visual-redesign
## Ultimo commit: 11b227b — sessão 21
## TSC: OK
## Diff-check: OK
## Preflight: 8/8

## Sessão 21 — Auditoria completa painel admin

### Concluído
- Auditoria completa do painel admin: 197 views, 73 services, 43 componentes, 11 dashboard-v2
- 93 tabelas Supabase verificadas — TODAS com RLS habilitado (mín 1, máx 7 policies)
- 10 buckets de storage verificados — sensíveis privados, exibição públicos
- 21 Edge Functions verificadas — todas ACTIVE
- 60 RPCs verificadas
- 225 migrations
- ZERO arquivos órfãos no admin
- ZERO mocks — todos dashboards consultam Supabase direto
- 21 `as any` removidos em 11 services admin (de 23, 2 legítimos mantidos)
- SearchHeader tracking-widest→tracking-wider (responsividade 360px)
- Policies RLS de push_templates, push_agendados, chat_settings verificadas — OK
- Página pública Promoter/RP investigada e plano desenhado (pendência futura)

### Decisões do Dan — sessão 21
- Página pública Promoter/RP: anotar como pendência, pensar depois

## Decisoes do Dan ativas (sessão 16)
- Chips NÃO aparecem por padrão — só com filtros ativos pelo ⚙
- User behavior: VIEW, PURCHASE, FAVORITE, DWELL → alimenta IndicaPraVoce
- Indica combina interesses do onboarding + behavior (behavior pesa mais)
- Form/Wizard components: manter + migração gradual
- Badge "Acontecendo Agora" vive no EventCard
- APIs Vercel (og, robots, sitemap) ativas — nunca deletar

## Decisoes do Dan ativas (sessão 14)
- Filtro ⚙ = VOLÁTIL (estado local, reseta ao sair)
- Próximos Eventos mostra TUDO sempre
- Indica pra Você = posição 2
- Filtros ativos: chips com X, sem filtro = sem chips
- Admin: página única com seções + etiquetas de uso
- Interesses = só genuínos

## Decisoes do Dan ativas (sessão 13)
- 26 tipos de espaço como formatos únicos
- 39 estilos musicais ativos
- Cada comunidade só cria evento do seu próprio tipo
- PRODUTORA = todos os formatos
- IndicaPraVoce = inteligência automática
- Tasks: SEMPRE montar checklist visual

## Decisoes do Dan ativas (anteriores)
- Preço: Inter Bold, centralizado
- Badges estilo: fundo 400/50 + texto 100 + sombra
- EventCard: sem social proof, aspect 4/5
- Fonte: Playfair Display Bold 700
- Responsividade: mínimo 360px, máximo 500px

## 🔴 DELETAR ANTES DO LANÇAMENTO — Eventos de teste
- Função `atualizar_eventos_teste()` + pg_cron + `seed_eventos_home_vitrine()`
- Eventos TESTE: IDs 101c9086, 4f7215b7, 1fad4f03, f6fb4b70
- Eventos seed: IDs b1000001-b1000009, c2000001-c2000018

## Pendências técnicas ativas
- C5/C6/C7 — credenciais .env
- C17-C20 — mobile (Apple/Google)
- A5 — N+1 queries financeiro — Dan quer visão planilha
- LGPD hard delete — decisões tomadas, implementar
- Push web — config OK, precisa HTTPS (deploy produção)
- Verificar filtros da Search visualmente (5 modais)
- Google OAuth branding — trocar nome no Google Cloud Console
- Página pública Promoter/RP — plano desenhado, backend existe, 1 view + 1 rota
- 2 `as any` legítimos restantes (dashboardAnalytics tabela dinâmica + eventosAdminCore globalThis)

## Pendencias externas
- Conta Apple Developer ($99/ano)
- Conta Google Play Console ($25)
- CNPJ + emails legais
- Google Cloud Console: configurar OAuth Consent Screen com nome "VANTA" + logo (conta projetovanta@gmail.com)
