# Sessao Atual — Estado para Continuidade

## Branch: main
## Ultimo commit: `8e9fb1c` — feat: tela Minhas Pendências no perfil
## Mudancas locais: SIM — Parceria Etapa 2 (onboarding + local editavel) — não commitado

## Repositorio e Deploy
- **GitHub**: `projetovanta/vanta` (conta: projetovanta)
- **Vercel**: projeto `vanta-a2b3` (danloures-projects) conectado a projetovanta/vanta

## Preflight: 6/8 (Playwright timeout infra, Knip pre-existente)

## O que foi feito nesta sessao

### Parceria Etapa 2 — Onboarding + Local Editavel
1. Migration `20260314100000_onboarding_comunidade.sql` — coluna `onboarding_completo` em comunidades
2. `OnboardingWelcome.tsx` — tela boas-vindas 1x pos-aprovacao (localStorage flag)
3. `OnboardingChecklist.tsx` — checklist no painel: foto, capa, endereco, horarios, 1o evento. Auto-marca completo
4. `AdminDashboardHome.tsx` — integra welcome + checklist quando gerente com onboarding pendente
5. `Step1Evento.tsx` — campos Local/Endereco/Cidade editaveis quando `tipo_comunidade === 'PRODUTORA'`
6. `CriarEventoView.tsx` — states localNome/localEndereco/localCidade, usa no save
7. `EditarEventoView.tsx` — mesma logica de local editavel
8. `comunidadesService.ts` — mapeia tipo_comunidade + onboarding_completo
9. `types/eventos.ts` — tipo_comunidade + onboarding_completo no type Comunidade
10. `types/supabase.ts` — onboarding_completo em Row/Insert/Update
11. Memorias atualizadas: sub_solicitacao_parceria.md, modulo_comunidade.md

### Limpeza
- Copiado `.env.local` de prevanta-OLD para projeto
- Deletado `prevanta-OLD/` (262MB, copia redundante)

## Pendencias
- **Commit + push** — aguardando OK do usuario
- **Migration** — aplicar `20260314100000_onboarding_comunidade.sql` no Supabase

## Pendencias futuras
### Parceria (etapas restantes)
- Etapa 3: aprovacao master (edicoes do dono precisam OK, exceto equipe)
- Etapa 4: onboarding tutorial novos donos

### Arquivar mensagens
- Testar swipe no mobile (touch events)
- Testar agrupamento notificacoes pos-fix

### MAIS VANTA futuras
- Painel do parceiro (cargo vanta_parceiro_mv)
- Gerente por cidade
- Meta Graph API integracao
- Dashboard analytics MV
- Notificacoes MV v2
- Convite master → membro/parceiro
- QR VIP dourado por deal
