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
