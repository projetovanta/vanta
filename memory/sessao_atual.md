# Sessao Atual — Estado para Continuidade

## Branch: visual-redesign
## Ultimo commit: (pendente — commit desta sessão 5)
## Mudancas locais: 19 arquivos (padronização tipográfica + headers)
## TSC: 0 erros

## O que foi feito na sessao 6 (19 mar 2026)

### Responsividade
- Piso 320px → 360px (App.tsx scaling + CSS global min-width: 360px)
- vanta-min-w class em todos containers fixed inset-0
- Todos vw removidos dos componentes Home (44vw → 9.5rem)
- Resumo Total admin: breakpoint min-[400px] → min-[448px]

### Home — Seções reconectadas
- ThisWeekSection migrada pro EventCarousel
- FriendsGoingSection migrada pro EventCarousel
- ForYouSection migrada pro EventCarousel
- ComingSoonSection criada (Em Breve)
- NearYouSection removida da Home (fica no Radar)
- "Todas as cidades" removido do seletor — auto-seleciona primeira cidade

### EventCarousel — corrigido alinhamento
- paddingInlineStart → inner div w-max px-5 (resolve bug scroll engolir padding)
- Cards 9.5rem (cabe 2 + pedacinho do 3º em 360px)

### Headers admin padronizados (19 views)
- pt-8 → pt-6, backdrop-blur removido, pb-5 → pb-4, text-lg → text-xl
- Padrão: shrink-0 bg-[#0A0A0A] border-b border-white/5 px-6 pt-6 pb-4

### Highlights (VANTA Indica)
- truncate removido do título (idêntico ao preview admin)
- Touch handlers → passive: true (resolve [Violation] touchmove delayed)

### EventCard
- truncate removido do nome do local

### Fundo externo
- radial-gradient chumbo pra diferenciar app do fundo

### Tipografia documentada
- memory/tipografia.md criado com todos os tokens e padrões

### Dados de teste
- 17 eventos novos criados no Supabase (31 total)
- 8 eventos antigos movidos pra datas futuras
- 6 eventos com datas auto-atualizadas (pg_cron a cada 6h)
- Lotes + preços criados pra todos os 31 eventos
- Fotos Unsplash adicionadas a todos os eventos sem foto

## O que foi feito na sessao 5 (18 mar 2026)

### Limpeza tipográfica — font-serif (9 edits)
- Removido font-bold redundante de 6 componentes (CSS .font-serif já aplica weight 700)
- Removido font-semibold incorreto de 3 componentes (Playfair só carrega 700)
- Arquivos: CompletarPerfilSocial, LoginView, EventFooter, SidebarV2, SearchResults, PriceFilterModal, EventFeed, NearYouSection, LiveNowSection

### Padronização headers tabs principais (2 edits)
- Radar: top-3 px-4 → top-6 px-6 (alinhado posição com Mensagens)
- SearchHeader (Buscar): pt-0 pb-6 → pt-6 pb-4 (alinhado padding com Mensagens)
- Radar: text-2xl → text-3xl (alinhado tamanho com Mensagens/Buscar)
- Mensagens: já era o padrão (text-3xl dourado, pt-6 px-6 pb-4)

### Padronização headers sub-views (11 edits)
Padrão aplicado: shrink-0 bg-[#0A0A0A] border-b border-white/5 px-6 pt-6 pb-4 + text-xl
- EditProfileView: removido style inline paddingTop, removido backdrop-blur
- HistoricoView: removido style inline paddingTop, text-lg → text-xl
- PreferencesView: removido style inline paddingTop, text-lg → text-xl
- BloqueadosView: px-5 py-4 → px-6 pt-6 pb-4, text-lg → text-xl
- MinhasPendenciasView: px-4 py-3 → px-6 pt-6 pb-4, text-base → text-xl
- MinhasSolicitacoesView: px-4 pt-safe pb-3 → px-6 pt-6 pb-4, text-base → text-xl
- MyTicketsView: pt-8 pb-5 → pt-6 pb-4, removido backdrop-blur
- SolicitarParceriaView: pt-8 → pt-6, removido backdrop-blur, text-lg → text-xl

### Luna recontratada
- Regras rígidas adicionadas no topo de engenheiro-frontend.md (expertise preservada)
- Hook enforce-luna-scope.sh criado e registrado no settings.json
- Escopo fechado: só faz o que foi pedido, zero invenção

### UI UX Pro Max instalado
- Skill principal + 6 extras: brand, design, design-system, slides, ui-styling, banner-design
- Busca: python3 .claude/skills/ui-ux-pro-max/scripts/search.py "query" --domain style
- Já reconhece Playfair+Inter como #1 "Classic Elegant" (luxury/premium)

### Monitor de contexto criado
- Hook context-monitor.sh: conta interações, avisa em 4 zonas (verde/amarela/laranja/vermelha)
- Alerta com 60% (51+ interações) por pedido do Dan

### Memória identidade visual atualizada
- Playfair Display SC → Playfair Display Bold 700 em projeto_identidade_visual.md
- 700 = peso (weight), não tamanho

## Decisoes do Dan ativas
- Refund automatico ate R$100, manual acima
- Saques: preparar automatico
- Componentes wizard/form: integrados nos wizards
- EventCard: sem social proof, aspect 4/5, badges mesma altura
- Acontecendo Agora: badge discreto no card (sem secao separada)
- Ordem Home: Perto→Esta Semana→Categorias
- Fonte: Playfair Display Bold 700 (sem SC, sem italic) — SEMPRE. 700=peso, não tamanho
- Padrao: titulos=Playfair, corpo=Inter, labels=caps tracking
- Luna recontratada (18/mar s5) — regras rígidas, hook enforce-luna-scope, escopo fechado
- Iris continua como Especialista Visual
- "Outros" removido do EventFeed
- Header padrão tabs: text-3xl dourado, pt-6 px-6 pb-4
- Header padrão sub-views: text-xl branco, pt-6 px-6 pb-4
- Responsividade: mínimo 360px, máximo 500px. CSS global min-width: 360px. Zero vw nos componentes.
- Home: Indica → Próximos Eventos (9+ver todos) → Mais Vendidos 24h (9+ver todos) → Locais Parceiros → Descubra Cidades → VANTA Indica pra Você
- "Todas as cidades" removido — Home sempre baseada em UMA cidade
- NearYouSection removida da Home (localização fica no Radar)
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
- Desktop Experience: layout responsivo adaptativo pra desktop web (768px+). App fica bonito em telas grandes, não só espremido em 500px. Planejar tela por tela com Luna + Iris. Painel admin também ganha mais espaço.

## Proxima sessao — prioridades
1. Implementar novas seções Home: Próximos Eventos (9+ver todos), Mais Vendidos 24h, Locais Parceiros, Descubra Cidades, VANTA Indica pra Você
2. Card "Ver todos" no final de cada carrossel (10º card → leva pra Busca)
3. Página de cidade (quando clicar no card de cidade)
4. MinhasPendenciasView — reorganizar (Dan pediu juntar solicitações + amizades)
5. C21/C22 — Testes (continuar cobertura)

## Pendencias externas (sem mudanca)
- Conta Apple Developer ($99/ano)
- Conta Google Play Console ($25)
- CNPJ + emails legais
- Android Studio
