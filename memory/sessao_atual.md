# Sessao Atual — Estado para Continuidade

## Branch: visual-redesign
## Ultimo commit: 1f235c5 — sessão 16 (pendente commit sessões 17-19)
## TSC: OK
## Diff-check: OK

## Sessão 19 — Fechamento pendências sessão 18

### Concluído
- Migration fix_search_path_and_policies APLICADA via MCP (5 RPCs + 2 policies)
- Migration drop_profiles_legacy_columns já estava aplicada (7 colunas já removidas)
- types/supabase.ts REGENERADO (190K chars, sem colunas legadas)
- 3 tabelas verificadas: brand_profiles, cargos_plataforma, atribuicoes_plataforma já documentadas
- 59 RPCs verificadas: todas com pelo menos 1 menção em memórias
- EDGES.md atualizado com 3 tabelas que faltavam
- Tracking duplo (analytics_events + user_behavior) mantido separado por decisão do Dan

### Decisões do Dan — sessão 19
- Tracking duplo: MANTER separado (analytics + recomendações = mais seguro)
- Migrations: aplicar ambas imediatamente

### Decisões do Dan — sessão 17
- Skeletons (3): MANTER
- VantaAlertModal: MANTER
- trackEventView: RECONECTADO no ProximosEventosSection
- consultarCnpj: MANTER
- Todos 11 types: MANTER
- BatchActionBar + BottomSheet: RESTAURADOS
- VANTA_LIVRO.md + VANTA_FLUXOS.md: criados como documentação definitiva

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
- Função `atualizar_eventos_teste()` + pg_cron
- Eventos TESTE: IDs 101c9086, 4f7215b7, 1fad4f03, f6fb4b70
- Eventos seed: IDs b1000001-b1000009, c2000001-c2000018

## Pendências técnicas ativas
- C5/C6/C7 — credenciais .env
- C17-C20 — mobile (Apple/Google)
- A5 — N+1 queries financeiro (waitlist resolvido sessão 18) — Dan quer visão planilha, equipe investiga
- LGPD hard delete — decisões tomadas, implementar na próxima sessão
- Push web — config OK, precisa HTTPS (deploy produção)
- Verificar filtros da Search visualmente (5 modais — provavelmente OK)
- Google OAuth branding — trocar nome no Google Cloud Console

## Pendencias externas
- Conta Apple Developer ($99/ano)
- Conta Google Play Console ($25)
- CNPJ + emails legais
- Google Cloud Console: configurar OAuth Consent Screen com nome "VANTA" + logo (conta projetovanta@gmail.com)
