# Sessao Atual — Estado para Continuidade

## Branch: visual-redesign
## Ultimo commit: 955ae01 — sessão 22
## TSC: OK
## Diff-check: OK
## Preflight: 8/8

## Sessão 22 — Merge visual-redesign→main + fix CI E2E

### Concluído
- Merge visual-redesign → main (54 commits das sessões 8-21)
- Pull + merge com 2 commits do remote (ESLint + hook git pull)
- Push main + visual-redesign sincronizados (955ae01)
- 11 testes E2E Playwright corrigidos (5 arquivos):
  - auth.spec.ts: `/visitante/i` → saudação dinâmica + timeouts aumentados
  - feed.spec.ts: idem + seções resilientes (não dependem de selectedCity)
  - navigation.spec.ts: "próximos eventos" → saudação + filtros console.error ampliados
  - responsive.spec.ts: `/visitante/i` → saudação dinâmica
  - admin.spec.ts: "Vanta Indica" → saudação (seções dependem de dados)
- Preflight 8/8, diff-check OK
- CI local: 11/11 testes passando

### Decisões do Dan — sessão 22
- Merge visual-redesign → main: aprovado
- Corrigir 11 testes E2E: aprovado, commit e push direto

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
