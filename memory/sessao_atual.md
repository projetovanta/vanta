# Sessao Atual — Estado para Continuidade

## Branch: main
## Ultimo commit: `f804341` — docs: onboarding — botão "Criar Conta" + fotos Unsplash/Pexels
## Mudancas locais: NÃO (tudo commitado e pushed)

## Repositorio e Deploy
- **GitHub**: `projetovanta/vanta` (conta: projetovanta)
- **Vercel**: projeto `vanta-a2b3` (danloures-projects) conectado a projetovanta/vanta

## Preflight: 8/8

## O que foi feito nesta sessao (11 commits)

### 1. Auditoria Completa
- Preflight 8/8, security scan, bundle audit, bridge audit, privacy audit
- npm audit: 11 vulnerabilidades em ferramentas de dev — decisão: manter
- Info.plist não encontrado — pendência pré-build iOS

### 2. SEO
- vercel.json: robots.txt + sitemap.xml ativados

### 3. Eventos Privados
- MinhasPendenciasView: nova aba "Eventos Privados" com timeline visual

### 4. Resgate de Deals
- BeneficiosMVTab: membros MAIS VANTA resgatam deals na busca (QR, status, cancelar)

### 5. Bundle -34%
- recharts e leaflet removidos do manualChunks (lazy via AdminGateway/RadarView)
- Core ~4MB (era ~6MB)

### 6. Onboarding Usuário Novo
- Simplificado: 1 tela só — busca de cidades via API IBGE (5571 municípios)
- Sem slides, sem interesses. Só cidade.

### 7. Melhorias Visuais
- EventCard: tags coloridas por estilo musical (16 cores)
- EventFooter: botão dourado com sombra
- Estados vazios com textos sóbrios

### 8. Copy Premium
- Cadastro: "Bem-vindo à VANTA. A noite agora é sua."
- Carteira: "A noite te espera..."
- CTA: "Garantir Ingresso"

### 9. Banner MAIS VANTA na Home
- Substituiu QuickActions (Carteira/Favoritos/MaisVanta)
- Visual premium com gradiente dourado e estrela
- 3 estados: não-membro, pendente, membro

### 10. Navegação Inteligente
- goBack em TODAS sub-views do Perfil volta pra tab de origem
- returnTabRef guarda de onde veio (sem flash)
- resetNavigation no logout (limpa scroll positions)

### 11. Cadastro Simplificado + Formulário MV
- Cadastro: removido telefone (fica email+senha+nome+nascimento+termos)
- Checkout: modal de telefone no 1º checkout se não tem
- Avatares: migrados do imgur pro Supabase Storage (quadrados)
- Formulário MAIS VANTA enriquecido: gênero, telefone, frequência, interesses (condicionais)
- Migration: coluna frequencia em solicitacoes_clube
- 19 interesses cadastrados no banco (Eletrônica, Funk, Sertanejo, etc)

### 12. Limpeza de Riscos (Knip + Bundle)
- QuickActions.tsx REMOVIDO (ninguém importava, substituído por MaisVantaBanner)
- fmtTelefone aplicado nos 3 campos: CheckoutPage, EditProfileView, ClubeOptInView
- knip.config.ts limpo (patterns redundantes removidos)

### Limpeza (-865 linhas)
- DealsMembroSection.tsx REMOVIDO
- MaisVantaReservaModal.tsx REMOVIDO
- MinhasSolicitacoesPrivadoView.tsx REMOVIDO
- StatusBadge.tsx REMOVIDO
- QuickActions.tsx REMOVIDO

### Agentes adicionados/atualizados
- Lia (guardiao-memoria.md) — nova
- Iris (especialista-visual.md) — nova
- Dr. Théo (consultor-legal.md) — novo (LGPD, CDC, compliance)
- Brunei (brunei.md) — atualizado
- Alex (gerente-geral.md) — atualizado com convocação automática + Lia obrigatória + seção "Alex Chatão" (checa memórias vs últimos 3 commits)
- REGRAS-DA-EMPRESA.md — atualizado (assinatura + revisão cruzada + Lia)
- VANTA-EMPRESA.md — atualizado (Iris e Théo adicionados na equipe)
- CLAUDE.md — Dev Squad atualizado (Lia, Iris, Théo, Brunei + atalhos por nome)
- Hook pre-commit-memoria.md — novo (Lia checa memórias antes de todo commit)

### 13. Importação Tier 1 — 30 agentes de negócio/marketing
- C-Level (4): CMO, CTO, COO, Vision Chief
- Advisory Board (7): Peter Thiel, Reid Hoffman, Naval Ravikant, Charlie Munger, Ray Dalio, Patrick Lencioni, Brené Brown
- Copy Squad (6): Russell Brunson, Dan Kennedy, Gary Halbert, David Deutsch, Stefan Georgi, Joe Sugarman
- Brand Squad (3): Marty Neumeier, Donald Miller, Brand Chief
- Traffic Masters (3): Traffic Chief, Ad Midas, Kasim Aslam
- Data Squad (3): Avinash Kaushik, Sean Ellis, Data Chief
- Hormozi Squad (4): Offers, Closer, Leads, Chief
- Total agentes no projeto: 55

### 14. Reunião Estratégica — Posicionamento VANTA
- Participantes: Peter Thiel, Donald Miller, Hormozi Offers, Alex
- VANTA não é ticketeria — é plataforma de descoberta + curadoria + benefícios
- Membro NÃO paga pelo clube — quem paga é o empresário (lado B)
- BrandScript completo (SB7)
- Oferta Grand Slam definida
- Regra: NUNCA usar "grátis" — tom é exclusividade e curadoria
- Slogan: "A noite é sua. Se você faz parte."
- Memória criada: memory/projeto_posicionamento.md

### 15. Redesign do App — Perguntas e Decisões
- 7 blocos de perguntas respondidos pelo Dan
- Consolidação completa em memory/projeto_redesign_app.md
- Equipe envolvida: Thiel, Miller, Hormozi, Sugarman, Iris, Théo, Zara
- Decisões-chave: 3 camadas de acesso, tiers invisíveis, convites como motor, tab bar mantém 5, perfil simplifica, carteira vira "Minha Experiência", onboarding emocional

## Pendencias futuras

### Alta prioridade (pré-lançamento)
- Login social (Google/Apple) — 30-50% mais cadastros
- Rotas dedicadas por sub-view — cada tela com URL própria
- Configurar Stripe secrets no Supabase — pra cobrar produtores
- Testar app no celular real

### Média prioridade
- Configurar Meta API token — verificação Instagram
- Classificação etária dos eventos (ECA Digital — lei em vigor)
- PIX no checkout

### Baixa prioridade
- Parceria etapa 3 (aprovação master)
- Parceria etapa 4 (onboarding tutorial novos donos)
- iOS: Info.plist + build nativo
- Internacionalização (app em inglês pra turistas)
