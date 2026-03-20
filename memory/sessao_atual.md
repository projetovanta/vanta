# Sessao Atual — Estado para Continuidade

## Branch: visual-redesign
## Ultimo commit: (sessão 12 — commit pendente)
## TSC: 0 erros
## Diff-check: OK

## O que foi feito na sessao 12 (19 mar 2026)

### EventCard — Preço
- Fonte do preço: Inter Bold (era Playfair/TYPOGRAPHY.cardTitle)
- Tamanho: "A partir de" e valor ambos `text-[0.6rem]`, centralizado (`justify-center`)
- Lógica: filtra variações gratuitas (valor=0) — pega só menor valor **pago**
- Se minPrice === 0 → "Sob consulta"

### EventCard — Badges de estilo musical
- Cores: fundo `400/50` + texto `100` da mesma cor
- Sombra: `shadow-[0_2px_8px_rgba(0,0,0,0.5)]`
- Sem backdrop-blur (badge dentro do gradient, blur ineficaz)
- Padding: `px-2 py-0.5`, fonte `text-[0.55rem]`
- Gradient local: apenas na área badge+título (`pt-10 from-black/80 via-black/40`)

### EventCard — Badges de status
- Opacidade `/90` (era `/70`) — Acontecendo, Começa em Breve, Acaba em Breve
- ÚLTIMAS VAGAS: laranja `bg-orange-500/90` (era dourado #FFD300)

### Highlights (VANTA Indica) — badges padronizados
- BADGE_COLORS atualizado: mesmo padrão 400/50 + texto 100
- Sombra, padding, font-weight alinhados com EventCard

### Filtros — estilo principal
- 4 seções: ProximosEventos, MaisVendidos, IndicaPraVoce, BeneficiosMV
- Sub-carrosséis filtram só por `estilos[0]` (sem duplicação)

### Regra de categorização (decisão do Dan)
- Formato (tipo): 1 obrigatório (Show, Beach Club, Boate, Festival...)
- Estilo principal: 1 obrigatório = `estilos[0]`
- Estilos secundários: 0+ opcionais
- Cards/filtros usam apenas estilo principal

## Decisoes do Dan ativas (sessão 12)
- Preço: Inter Bold, mesmo tamanho label+valor, centralizado
- Variações grátis: ignoradas no cálculo; "Sob consulta" quando tudo grátis
- ÚLTIMAS VAGAS: faixa laranja (orange-500)
- Badges estilo: fundo 400/50 + texto 100 + sombra (padrão app inteiro)
- Categorização: formato=1, estilo principal=1 (estilos[0]), secundários=opcionais
- Filtros Home: só estilo principal nos sub-carrosséis
- Feature futura: filtro personalizado por preferência do usuário na Home

## Decisoes do Dan ativas (anteriores)
- Badges de status: pill, topo-direito, opacidade /90
- ESGOTADO: faixa diagonal vermelha
- Coroa MV: ao lado do badge de estilo
- Refund automatico ate R$100, manual acima
- Saques: preparar automatico
- EventCard: sem social proof, aspect 4/5
- Ordem Home: Indica → Próximos → Mais Vendidos 24h → Locais Parceiros → Descubra Cidades → Benefícios MV → VANTA Indica pra Você
- Fonte: Playfair Display Bold 700
- Responsividade: mínimo 360px, máximo 500px

## 🔴 DELETAR ANTES DO LANÇAMENTO — Eventos de teste
- Função `atualizar_eventos_teste()` + pg_cron `atualizar-eventos-teste` (6h)
- Função `seed_eventos_home_vitrine()` + pg_cron `seed-vitrine-home` (6h)
- Eventos: IDs 101c9086, 4f7215b7, 1fad4f03, f6fb4b70, e5555555, e6666666
- Eventos seed: IDs b1000001-b1000017, c2*
- 8 registros em mais_vanta_config_evento (teste MV)
- Lotes seed criados para RJ e BH

## Pendências técnicas ativas
- C5/C6/C7 — credenciais .env
- C9 — schema base
- C17-C20 — mobile (Apple/Google)
- C21/C22 — testes
- A2 — CORS *
- A5 — N+1 queries financeiro
- A22 — 160 hover: em views mobile
- A27 — lazy load ExcelJS/jsPDF

## Proxima sessao — prioridades
1. Feature: filtro personalizado por preferência do usuário na Home
2. MinhasPendenciasView — reorganizar

## Pendencias externas (sem mudanca)
- Conta Apple Developer ($99/ano)
- Conta Google Play Console ($25)
- CNPJ + emails legais
- Android Studio
