# Sessao Atual — Estado para Continuidade

## Branch: main
## Ultimo commit: `e798e15` — checkout Stripe integrado
## Mudancas locais: NÃO (tudo commitado e pushed)

## Repositorio e Deploy
- **GitHub**: `projetovanta/vanta` (conta: projetovanta)
- **Vercel**: projeto `vanta-a2b3` (danloures-projects) conectado a projetovanta/vanta

## Preflight: 8/8

## Resumo da sessao (2 dias: 15-16 mar 2026)

### Redesign app completo (lado usuário)
- Guest modal contextual, onboarding 3 telas, cadastro glass
- Home reorganizada + camada MV, VANTA Indica 5 tipos
- Detalhe evento footer adaptativo, perfil simplificado
- Checkout confete, busca "Pra Você", radar parceiros
- Minha Experiência, login redesign, auditoria copy

### Checkout Stripe integrado
- processarCompra chama Edge Function create-ticket-checkout (já existia completa!)
- Fluxo: front → Edge Function → Stripe Checkout Session → webhook → cria tickets
- Fluxo gratuito mantém RPC direto
- Falta: secrets no Supabase (STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET)

### Protótipos admin paralelos
- `/admin-v2` — sidebar 5 ícones + glass + command palette
- `/admin-v3` — 16 itens mesclados em 4 seções + dashboard financeiro intuitivo
- Backups: AdminSidebar.backup.tsx + AdminDashboardView.backup.tsx
- Admin atual INTACTO

### Modelo financeiro DEFINIDO
- Ver memory/projeto_modelo_financeiro.md (documento completo)
- 4 fontes: taxa ingresso + assinatura produtor + parceiros MV + publicidade Indica
- Tudo negociável pelo master
- Pagamento SEMPRE no site (nunca in-app)
- Stripe Connect + PIX + Apple Pay + Google Pay
- D+15, master autoriza, reembolso produtor absorve
- Aceite condições 7 dias + pausa automática

## Proximo passo (próxima sessão)
1. **Conectar Admin V3 com views reais** — plugar as 16 páginas com os componentes existentes
2. **Tela negociação comercial** — master define condições por comunidade/parceiro
3. **Deploy Edge Functions** — supabase functions deploy
4. **Configurar secrets Stripe** — quando Dan tiver conta

## Pendencias gerais
- Login social (Google/Apple)
- Teste no celular real
- CNPJ + emails legais
- Deep links + Info.plist
- Regime tributário (consultar contador)
- NFS-e integrador
- Modelo preço publicidade Indica

## Como estamos trabalhando
- Alex coordena, NUNCA faz trabalho de outro agente
- Cada agente responde por si
- Rio SEMPRE presente
- Chatão + Lia rodam automaticamente antes de cada entrega
- NUNCA repetir perguntas já decididas — consultar memórias ANTES
- Admin deve ser intuitivo pra empresário não-técnico
- Pagamento SEMPRE fora do app (site)
