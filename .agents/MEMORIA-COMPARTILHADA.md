# VANTA — Memória Compartilhada da Equipe

> Este arquivo é o "quadro de avisos" da empresa.
> Todo agente DEVE ler este arquivo ANTES de agir.
> Todo agente DEVE atualizar este arquivo DEPOIS de fazer mudanças relevantes.

---

## Estado Atual do Projeto

**Última atualização:** 2026-03-15
**Atualizado por:** Alex (Gerente Geral)
**Fase:** Produção e testes finais

---

## Decisões Recentes

<!-- Formato: [DATA] DECISÃO — impacto — decidido por Dan -->
<!-- Exemplo: [2026-03-14] Escolhemos Stripe Connect ao invés de split manual — afeta todo fluxo de pagamento — Dan decidiu -->

[2026-03-15] Vulnerabilidades npm (11, 4 altas) — manter como está, são em ferramentas de dev — Dan decidiu
[2026-03-15] Bundle: recharts e leaflet removidos do manualChunks — carregam lazy agora — Dan aprovou
[2026-03-15] Onboarding: slides + cidade + interesses — cidade obrigatória, interesses opcional — Dan aprovou

---

## Mudanças que Afetam Todos

<!-- Quando alguém muda algo que outros agentes precisam saber, registra aqui -->
<!-- Formato: [DATA] O QUE MUDOU → QUEM É AFETADO → O QUE PRECISA SABER -->

[2026-03-15] SEO ativado — robots.txt + sitemap.xml no vercel.json → afeta SEO/indexação
[2026-03-15] OnboardingView reescrito — agora coleta cidade + interesses → afeta auth, perfil, home (personalização)
[2026-03-15] BeneficiosMVTab com resgate — membros podem resgatar deals na busca → afeta MAIS VANTA, busca
[2026-03-15] MinhasPendenciasView — nova aba Eventos Privados → afeta perfil
[2026-03-15] StatusBadge.tsx removido — era duplicado → afeta admin/dashboard
[2026-03-15] vite.config.ts — recharts/leaflet fora do manualChunks → afeta bundle/performance
[2026-03-15] EventCard — tags coloridas por estilo musical (16 cores mapeadas) → afeta todos os cards de evento
[2026-03-15] EventFooter — botão de compra dourado com sombra (era gradiente roxo) → afeta detalhe do evento
[2026-03-15] EventFeed + SearchResults — estados vazios com textos personalizados → afeta home e busca
[2026-03-15] QuickActions REMOVIDO da Home — substituído por MaisVantaBanner (3 estados) → afeta home, navegação
[2026-03-15] Textos vazios simplificados — tom sóbrio, sem forçar → afeta home e busca
[2026-03-15] MaisVantaBanner redesenhado (estrela, visual premium) → afeta home
[2026-03-15] Navegação "voltar" corrigida — goBack inteligente em TODAS sub-views do Perfil → afeta perfil, navegação
[2026-03-15] 3 arquivos mortos removidos: DealsMembroSection, MaisVantaReservaModal, MinhasSolicitacoesPrivadoView → afeta clube, evento, perfil
[2026-03-15] Rotas dedicadas por sub-view → ANOTADO como próxima prioridade (não feito ainda)
[2026-03-15] Fix: logout agora limpa scroll positions → evita scroll preso ao trocar de conta
[2026-03-15] Cadastro simplificado — telefone removido (email+senha+nome+nascimento+termos) → afeta auth, perfil
[2026-03-15] Telefone pedido no 1º checkout se não tem → afeta checkout
[2026-03-15] Onboarding: busca de cidades via API IBGE (5571 cidades) → afeta onboarding
[2026-03-15] Avatares hospedados no Supabase Storage (saíram do imgur) → afeta perfil, auth
[2026-03-15] Formulário MV: novos campos gênero, telefone, frequência, interesses → afeta clube, perfil, curadoria
[2026-03-15] Migration: coluna frequencia em solicitacoes_clube → afeta banco
[2026-03-15] QuickActions.tsx DELETADO — era órfão, ninguém importava → afeta home
[2026-03-15] fmtTelefone aplicado em CheckoutPage, EditProfileView, ClubeOptInView — telefone formata em tempo real → afeta checkout, perfil, clube
[2026-03-15] knip.config.ts limpo — removidos patterns redundantes → afeta tooling
[2026-03-15] Dr. Théo (consultor-legal.md) importado — agente de direito digital, LGPD, CDC → afeta todos que precisam de compliance
[2026-03-15] Alex Chatão — checagem automática de memórias vs últimos 3 commits toda vez que é chamado → afeta fluxo do Alex
[2026-03-15] Hook pre-commit-memoria — Lia checa memórias antes de todo commit → afeta fluxo de commit
[2026-03-15] CLAUDE.md — Dev Squad atualizado com Lia, Iris, Théo, Brunei + atalhos → afeta ativação de agentes
[2026-03-15] Tier 1 importado — 30 agentes de negócio/marketing (C-Level, Advisory, Copy, Brand, Traffic, Data, Hormozi) → total 55 agentes
[2026-03-15] POSICIONAMENTO DEFINIDO — VANTA = descoberta + curadoria + benefícios (NÃO ticketeria). Membro não paga, empresário paga. NUNCA usar "grátis". Ver memory/projeto_posicionamento.md → afeta TODOS os agentes, copy, design, produto
[2026-03-15] REDESIGN APP — Decisões consolidadas: 3 camadas acesso, tiers invisíveis, convites como motor, NUNCA "deals", tudo português, perfil simplifica, carteira→"Minha Experiência", onboarding emocional. Ver memory/projeto_redesign_app.md → afeta TODOS
[2026-03-15] IDENTIDADE VISUAL — 3 palavras: Confiança•Curadoria•Estilo. VANTA = amigo conectado (não clube frio). Preto+dourado+branco, Playfair+Inter, fotos com pessoas, tom conversacional. Ver memory/projeto_identidade_visual.md → afeta TODOS
[2026-03-15] BRIEFING.md criado — ponto de entrada único pra todos os agentes (posicionamento, identidade, redesign, regras, comunicação) → afeta TODOS os agentes
[2026-03-15] Protocolo de ativação de agentes reordenado — BRIEFING.md agora é passo 1 (antes de ler o agente) → afeta CLAUDE.md, ativação de agentes
[2026-03-15] MEMORY.md recriado — índice nunca havia sido commitado no git, se perdeu entre sessões. Recriado com 132 linhas, 86 memórias → afeta navegação de memórias
[2026-03-15] Guest Modal contextual IMPLEMENTADO — Shield→Sparkles, "Área Restrita"→"Crie sua conta", texto adapta ao que guest tentou (curtir/comprar/mensagem/perfil/notificação) → afeta AppModals, useAppHandlers, App.tsx, RestrictedModal
[2026-03-15] Onboarding 3 telas IMPLEMENTADO — Cidade→Interesses(opcional)→Boas-vindas. 19 chips musicais, salva em profiles.interesses → afeta onboarding, perfil, curadoria
[2026-03-15] AuthModal REDESIGN — glass morphism, Sparkles, labels 10px, ordem nome→email→senha→nasc, botão "Cadastrar", glow dourado → afeta cadastro, auth
[2026-03-15] Validação de nome — isValidNome() exige 2 palavras, bloqueia padrões fake (sem vogais, repetições, números) → afeta cadastro, authHelpers
[2026-03-15] Fix notificationsService — INSERT agora SEMPRE via RPC inserir_notificacao (SECURITY DEFINER). Corrige erro 403 no cadastro → afeta notificações, auth
[2026-03-15] Selfie biométrica REMOVIDA dos Termos de Uso e Política de Privacidade (não é coletada no app) → afeta legal, App Store labels, Google Play Data Safety
[2026-03-15] "Deals" trocado por "Benefícios Exclusivos de Parceiros" nos Termos de Uso (seção 7.6) → afeta legal, comunicação
[2026-03-15] Home REORGANIZADA — removidos: SavedEventsSection, NewOnPlatformSection, MaisVantaBanner. Ordem nova: Saudação→Indica→Ao Vivo→Amigos Vão→Perto→Semana→Pra Você→Feed. Saudação guest: "Descubra o que tá rolando" → afeta home, navegação
[2026-03-15] VANTA Indica expandido — 5+2 tipos: EVENTO(verde), PARCEIRO(âmbar), MAIS_VANTA(dourado), EXPERIENCIA(roxo), INFORMATIVO(cinza) + legados DESTAQUE_EVENTO/PUBLICIDADE. Badges coloridos no Highlights. Admin suporta todos os tipos → afeta home, admin, curadoria
[2026-03-15] Detalhe do Evento REDESIGN — Footer adaptativo: gratuito="Eu vou!" dourado, pago="Eu vou!"+Garantir, já comprou=ambos visíveis, lotando=Últimas vagas vermelho. Texto MV sutil: "Este evento tem vantagens pra membros" → afeta event-detail
[2026-03-15] Perfil SIMPLIFICADO — "Minha Carteira"→"Minha Experiência". Tela reorganizada: foto+badge→[Editar][Config]→Card Experiência+Card MV→Lista ações (perfil público, pendências, meia-entrada, bloqueados)→Configurações (dados, preferências, PIN, senha, ajuda)→Parceria→Sair → afeta perfil, navegação
[2026-03-15] Checkout REDESIGN — SuccessScreen: confete+Sparkles+"Presença garantida!"+"Ver meu ingresso" (dourado). "Tem um código?" (ex-cupom). Botão "Garantir X ingressos" dourado. "Garantindo..." no loading → afeta checkout
[2026-03-15] Busca REDESIGN — "Benefícios"→"Pra Você", tab visível pra todos (era só membros MV). Não-membros veem tela com lock+CTA "Saiba mais". Placeholder "Buscar lugares pra você..." → afeta busca
[2026-03-15] Camada MV IMPLEMENTADA — Home: saudação com Crown dourada + seção "Seus Benefícios" pra membros. EventCard: ícone dourado sem texto (era Crown+MV). Perfil público: Crown ao lado do nome de membros MV → afeta home, cards, perfil público
[2026-03-15] Radar com PARCEIROS — migration parceiros_coords (JSONB), pins âmbar no mapa pra parceiros MV com coords. Todos veem pins, só membros veem benefício. types/supabase.ts regenerado → afeta radar, banco, types
[2026-03-16] Minha Experiência COMPLETA — "Carteira"→"Minha Experiência", seção "Seus benefícios" pra membros MV no topo, subtítulo "Ingressos, presenças e benefícios" → afeta wallet/perfil
[2026-03-16] Auditoria de COPY — 8x "deals"→"benefícios" (AceitarConviteMV, ParceiroDashboard), "Grátis"→"Entrada livre" (EventLanding), 3x "estabelecimentos parceiros"→"lugares parceiros" (ClubeOptIn) → afeta convite, parceiro, landing, clube
[2026-03-16] Login REDESIGN — gradiente leve (foto aparece), card glass nos campos, slogan "a noite é sua", botão X com safe-area+44px, "Criar Conta" (era "Não tenho conta — Cadastrar") → afeta login

---

## Regras Novas ou Alteradas

<!-- Dan às vezes cria regras novas durante o trabalho. Registrar aqui pra ninguém esquecer -->
<!-- Formato: [DATA] REGRA — contexto -->

_Nenhuma regra nova ainda._

---

## Problemas Conhecidos

<!-- Bugs, warnings, issues que a equipe sabe que existem mas ainda não resolveram -->
<!-- Formato: [DATA] PROBLEMA — severidade 🟢🟡🔴 — quem está cuidando -->

_Nenhum problema registrado ainda._

---

## Próximas Prioridades

<!-- O que Dan quer que seja feito. Ordenado por prioridade -->
<!-- Formato: PRIORIDADE — quem cuida — status (pendente/em andamento/feito) -->

_Nenhuma prioridade definida ainda._

---

## Glossário do Dan

<!-- Termos que Dan usa e o que significam no contexto VANTA -->

| Dan fala | Significa |
|----------|----------|
| "dono do evento" | Sócio do evento |
| "dono da comunidade" | Gerente da comunidade |
| "tá quebrado" | Algo não funciona como deveria |
| "manda bala" | Pode executar |
| "segura" | NÃO executar, esperar |

---

## Como Usar Este Arquivo

### Todo agente DEVE:
1. **LER** este arquivo no início de qualquer trabalho
2. **ATUALIZAR** este arquivo quando fizer mudança que afeta outros
3. **NUNCA** apagar entradas — só adicionar novas ou marcar como resolvidas

### O que registrar aqui:
- Decisões do Dan que mudam como o projeto funciona
- Mudanças de schema, tabelas, colunas, RPCs
- Mudanças de fluxo (ex: "agora o checkout tem 3 passos ao invés de 2")
- Bugs encontrados que outros agentes precisam saber
- Regras novas que Dan definiu durante o trabalho
- Qualquer coisa que, se outro agente não souber, pode causar erro

### O que NÃO registrar aqui:
- Detalhes técnicos de implementação (isso vai no modulo_*.md)
- Código ou snippets (isso vai no código)
- Coisas que só afetam uma área (isso vai na memória do módulo)

### Conflito entre este arquivo e modulo_*.md:
Se houver conflito → **este arquivo tem prioridade** (decisão mais recente do Dan)
Se ainda tiver dúvida → **PARAR e perguntar ao Dan**

---

*Arquivo criado em 14 de março de 2026. Atualizado continuamente pela equipe.*
