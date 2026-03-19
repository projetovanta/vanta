# Sessao Atual — Estado para Continuidade

## Branch: visual-redesign
## Ultimo commit: 30b9163 (sessão 7, pushado) + mudanças locais sessão 8 + auditoria sessão 9
## Mudancas locais: ~25 arquivos (Home + auditoria memórias + organização docs)
## TSC: 0 erros
## Preflight: 8/8

## O que foi feito na sessao 9 (19 mar 2026)

### Auditoria de memórias — CONCLUÍDA
- 5 decisões do Dan resolvidas:
  1. modulo_financeiro.md (legacy) → _deprecated/ (unificado no completo)
  2. clube_influencia.md → absorvido no modulo_clube.md + _deprecated/
  3. PENDENCIAS-18-MARCO-2026.md → _deprecated/ (pendências ativas abaixo)
  4. sub_negociacao_socio.md → _deprecated/ (feature removida)
  5. checklist_entrega.md → _deprecated/ (congelado, checklist já no CLAUDE.md)
- modulo_clube.md atualizado: seção Services adicionada (sub-services com linhas)
- MEMORY.md limpo: referências obsoletas removidas
- Skill vanta-design criado (.claude/skills/) — sessão anterior

### Organização de arquivos (sessão anterior, não commitado)
- 22 .md da raiz movidos para docs/ e _deprecated/
- .gitignore: *.code-workspace e .claude/skills/ adicionados
- plataformas.md: path docs/setup/ corrigido

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

## Pendências técnicas ativas (ex-PENDENCIAS-18-MARCO)
- C5/C6/C7 — credenciais .env (verificar Vercel, rotacionar)
- C9 — schema base (dump inicial não versionado)
- C17-C20 — mobile (depende contas Apple/Google)
- C21/C22 — testes (cobertura ~2-3%)
- A2 — CORS * em Edge Functions
- A5 — N+1 queries financeiro
- A22 — 160 hover: em views mobile
- A27 — lazy load ExcelJS/jsPDF

## Blocos futuros (quando sobrar tempo)
- Desktop Experience: layout responsivo adaptativo pra desktop web (768px+)

## Proxima sessao — prioridades
1. MinhasPendenciasView — reorganizar (Dan pediu juntar solicitações + amizades)
2. C21/C22 — Testes (continuar cobertura)
3. Revisar visual das novas seções com Iris (cores, espaçamento, polish)
4. Commit + push de todas as mudanças locais

## Pendencias externas (sem mudanca)
- Conta Apple Developer ($99/ano)
- Conta Google Play Console ($25)
- CNPJ + emails legais
- Android Studio
