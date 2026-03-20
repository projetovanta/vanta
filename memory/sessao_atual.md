# Sessao Atual — Estado para Continuidade

## Branch: visual-redesign
## Ultimo commit: sessão 15 — sidebar admin reorganizada
## TSC: OK (diff-check passou)
## Diff-check: OK

## Sessão 16 — Concluída (20 mar 2026)

### O que foi feito
- **Parte A — Limpeza chips (ProximosEventosSection)**
  - Removido: import SectionFilterChips, state selectedChip, memo chips
  - Simplificado: visibleFormatoGroups, visibleEstiloGroups (direto filterTopGroups)
  - Removido memo todosEventos → usa filteredEventos direto
  - Componente de ~303L → ~270L

- **Parte B — User Behavior**
  - Migration `20260320200000_user_behavior.sql` — tabela user_behavior (action_type: VIEW/PURCHASE/FAVORITE/DWELL)
  - RPC `eventos_recomendados_behavior` — behavior (peso 2x) + interesses onboarding (peso 1x), 90 dias
  - Service `behaviorService.ts` — trackView, trackPurchase, trackFavorite, trackDwell, getRecomendados
  - EventDetailView: VIEW no mount + DWELL no unmount (mínimo 3s)
  - CheckoutSuccessPage: PURCHASE após confirmação de pagamento
  - extrasStore: FAVORITE no toggle (só quando adiciona)
  - IndicaPraVoceSection: usa getRecomendados com fallback pra filtro local por interesses

### Decisões do Dan — CMS Master (IDEIA, não aprovado)
- Painel CMS interno pra master editar tudo sem código
- Salvo em `memory/projeto_cms_master.md` — retomar quando Dan quiser
- NÃO iniciar sem aprovação explícita

### Pendente
- Commit da sessão 16
- Preflight final (quando Dan pedir)

## Decisoes do Dan ativas (sessão 16)
- Chips NÃO aparecem por padrão — só com filtros ativos pelo ⚙
- User behavior: VIEW, PURCHASE, FAVORITE, DWELL → alimenta IndicaPraVoce
- Indica combina interesses do onboarding + behavior (behavior pesa mais)

## Decisoes do Dan ativas (sessão 14)
- Filtro ⚙ = VOLÁTIL (estado local, reseta ao sair)
- Próximos Eventos mostra TUDO sempre (sem filtro persistente)
- Indica pra Você = posição 2 (logo após Próximos Eventos)
- Filtros ativos: chips com X aparecem, sem filtro = sem chips
- Tags removíveis com X + botão (+N filtros)
- Admin: página única com seções + etiquetas de uso
- Interesses = só genuínos (sem duplicar formatos/estilos)

## Decisoes do Dan ativas (sessão 13)
- 26 tipos de espaço como formatos únicos
- 39 estilos musicais ativos
- Cada comunidade só cria evento do seu próprio tipo
- PRODUTORA = todos os formatos
- IndicaPraVoce = inteligência automática (não filtro manual)
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
- A2 — CORS *
- A5 — N+1 queries financeiro
- A22 — 160 hover: em views mobile
- A27 — lazy load ExcelJS/jsPDF

## Pendencias externas
- Conta Apple Developer ($99/ano)
- Conta Google Play Console ($25)
- CNPJ + emails legais
