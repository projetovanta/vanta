# Sessao Atual — Estado para Continuidade

## Branch: visual-redesign
## Ultimo commit: 30b9163 (sessão 7, pushado) + mudanças locais sessão 8
## Mudancas locais: ~20 arquivos (novas seções Home)
## TSC: 0 erros
## Preflight: 8/8

## O que foi feito na sessao 8 (19 mar 2026)

### Home — Novas seções implementadas (escalável 1000+ eventos)
- 4 RPCs server-side: top_vendidos_24h, cidades_com_eventos, parceiros_por_cidade, eventos_por_cidade_paginado
- 3 índices: vendas_log(ts), eventos_admin(cidade), comunidades(cidade, ativa)
- Migration 20260319100000 aplicada + tipos gerados
- 5 métodos novos no supabaseVantaService + IVantaService
- Tipos: Parceiro, CidadeResumo em tipos/eventos.ts

### Home — Nova ordem de seções
1. Highlights (VANTA Indica) — mantido
2. ProximosEventosSection — 9 cards + "Ver todos" → AllEventsView
3. MaisVendidosSection — top 10 vendidos 24h (some se 0 vendas)
4. LocaisParceiroSection — comunidades ativas + "Ver todos" → AllPartnersView
5. DescubraCidadesSection — cidades com eventos (exceto atual) → CityView
6. IndicaPraVoceSection — por interesses (só logado)

### Novos componentes
- ViewAllCard, PartnerCard, CityCard (3 cards novos)
- EventCarousel atualizado: onViewAll + maxCards + ViewAllCard automático

### Novas views overlay
- AllEventsView (z-160) — infinite scroll, tabs futuros/passados
- AllPartnersView (z-160) — lista paginada de parceiros
- CityView (z-170) — mini-Home por cidade (hero + próximos + parceiros + passados)

### Navegação (useNavigation)
- 3 estados: selectedAllEventsCity, selectedCityView, selectedAllPartnersCity
- 6 funções: openAllEvents/closeAllEvents, openCityView/closeCityView, openAllPartners/closeAllPartners

### Seções antigas removidas
- ThisWeekSection, ComingSoonSection, FriendsGoingSection, ForYouSection → movidos pra _deprecated/
- Infinite scroll global removido (cada seção busca via RPC)

## Decisoes do Dan ativas
- Refund automatico ate R$100, manual acima
- Saques: preparar automatico
- Componentes wizard/form: integrados nos wizards
- EventCard: sem social proof, aspect 4/5, badges mesma altura
- Acontecendo Agora: badge discreto no card (sem secao separada)
- Ordem Home: Indica → Próximos (9+ver todos) → Mais Vendidos 24h → Locais Parceiros → Descubra Cidades → VANTA Indica pra Você ✅ IMPLEMENTADO
- Fonte: Playfair Display Bold 700 (sem SC, sem italic) — SEMPRE. 700=peso, não tamanho
- Padrao: titulos=Playfair, corpo=Inter, labels=caps tracking
- Luna recontratada (18/mar s5) — regras rígidas, hook enforce-luna-scope, escopo fechado
- Iris continua como Especialista Visual
- Header padrão tabs: text-3xl dourado, pt-6 px-6 pb-4
- Header padrão sub-views: text-xl branco, pt-6 px-6 pb-4
- Responsividade: mínimo 360px, máximo 500px. CSS global min-width: 360px. Zero vw nos componentes.
- "Todas as cidades" removido — Home sempre baseada em UMA cidade
- Foto obrigatória no cadastro de evento (card sem foto não existe)
- EventCards: sem truncate, prontos, não mexer
- Fundo externo: radial-gradient chumbo
- UI UX Pro Max: usar em decisões visuais/tipográficas

## 🔴 DELETAR ANTES DO LANÇAMENTO — Eventos de teste
- Função `atualizar_eventos_teste()` no Supabase — atualiza datas de 6 eventos automaticamente
- pg_cron job `atualizar-eventos-teste` — roda a cada 6h
- IDs dos eventos auto-atualizados:
  - `101c9086...` — Acontecendo Agora (auto)
  - `4f7215b7...` — Acaba em Breve (auto)
  - `1fad4f03...` — Começa em Breve (auto)
  - `f6fb4b70...` — Amanhã (auto)
  - `e5555555...` — Daqui 2 dias (auto)
  - `e6666666...` — Daqui 3 dias (auto)
- **DELETAR**: `SELECT cron.unschedule('atualizar-eventos-teste'); DROP FUNCTION atualizar_eventos_teste();` + deletar os 31 eventos de teste
- Mais 17 eventos estáticos de teste (IDs b1000001 a b1000017)

## Blocos futuros (quando sobrar tempo)
- Desktop Experience: layout responsivo adaptativo pra desktop web (768px+)

## Proxima sessao — prioridades
1. MinhasPendenciasView — reorganizar (Dan pediu juntar solicitações + amizades)
2. C21/C22 — Testes (continuar cobertura)
3. Revisar visual das novas seções com Iris (cores, espaçamento, polish)

## Pendencias externas (sem mudanca)
- Conta Apple Developer ($99/ano)
- Conta Google Play Console ($25)
- CNPJ + emails legais
- Android Studio
