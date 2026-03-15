# Sessao Atual — Estado para Continuidade

## Branch: main
## Ultimo commit: `a90a825` — docs: memórias pendentes
## Mudancas locais: NÃO (tudo commitado e pushed)

## Repositorio e Deploy
- **GitHub**: `projetovanta/vanta` (conta: projetovanta)
- **Vercel**: projeto `vanta-a2b3` (danloures-projects) conectado a projetovanta/vanta

## Preflight: 8/8

## O que foi feito nesta sessao (13 commits)

### 1. MEMORY.md recriado
- Nunca havia sido commitado no git — recriado com 132 linhas, 86 memórias indexadas

### 2. Guest Modal Contextual
- Shield→Sparkles, "Área Restrita"→"Crie sua conta"
- Texto contextual por ação (curtir, comprar, mensagem, perfil, notificação)
- Glass morphism, overlay 60%, borda dourada
- RestrictedModal (ComunidadePublicView) também atualizado

### 3. Onboarding 3 Telas
- Cidade (IBGE) → Interesses (19 chips, opcional) → Boas-vindas ("Pronto, [Nome]")
- StepDots animados

### 4. Cadastro Redesign
- Glass morphism, Sparkles, labels 10px, botão "Cadastrar"
- Validação isValidNome() (2 palavras, anti-fake)
- Fix notificationsService (INSERT via RPC, corrigiu erro 403)
- Selfie biométrica removida dos Termos e Política
- "Deals"→"Benefícios Exclusivos" nos Termos

### 5. Home Redesign
- Seções removidas: SavedEvents, NewOnPlatform, MaisVantaBanner
- Ordem: Saudação→Indica→Ao Vivo→Amigos Vão→Perto→Semana→Pra Você→Feed
- Saudação guest: "Descubra o que tá rolando"

### 6. VANTA Indica Expandido
- 5+2 tipos: EVENTO(verde), PARCEIRO(âmbar), MAIS_VANTA(dourado), EXPERIENCIA(roxo), INFORMATIVO(cinza)
- Badges coloridos no Highlights
- TIPO_CONFIG no admin VantaIndicaView

### 7. Detalhe do Evento Redesign
- Footer adaptativo: gratuito="Eu vou!" dourado, pago="Eu vou!"+Garantir, já comprou=ambos
- "Últimas vagas" vermelho (capacityPct)
- Texto MV sutil: "Este evento tem vantagens pra membros"

### 8. Perfil Simplificado + Reorganizado
- "Minha Carteira"→"Minha Experiência" (MINHA_EXPERIENCIA)
- [Editar][Config] no header
- Lista ações: perfil público, pendências, meia-entrada, bloqueados
- Configurações separadas: dados, preferências, PIN, senha, ajuda

### 9. Checkout Redesign
- SuccessScreen: confete + Sparkles + "Presença garantida!" + "Ver meu ingresso"
- "Tem um código?" (ex-cupom), "Garantir X ingressos" dourado

### 10. Busca Redesign
- "Benefícios"→"Pra Você", tab visível pra todos
- Não-membros: tela lock com CTA "Saiba mais"

### 11. Camada MV
- Home: saudação com Crown + seção "Seus Benefícios"
- EventCard: ícone Crown dourado mínimo (sem texto)
- Perfil público: Crown ao lado do nome

### 12. Radar com Parceiros
- Migration: coluna coords JSONB em parceiros_mais_vanta (aplicada)
- Pins âmbar no mapa, createPartnerIcon
- types/supabase.ts regenerado

## Redesign — Status

### Implementado
- ✅ Guest Modal contextual
- ✅ Onboarding (3 telas)
- ✅ Cadastro (glass + validação)
- ✅ Home (seções + guest + camada MV)
- ✅ VANTA Indica (5 tipos + badges)
- ✅ Detalhe do Evento (footer adaptativo)
- ✅ Perfil (simplificado + reorganizado)
- ✅ Checkout (confirmação limpa)
- ✅ Busca (3 tabs, "Pra Você")
- ✅ Radar (pins parceiros)

### Fase futura
- VANTA Indica auto-preenchimento avançado no admin
- Regra "primeiro card nunca mesmo tipo duas vezes"
- Mensagens v2 (grupos, status/mood)
- Convites (mecânica completa)
- Tooltip diferente pra membros nos pins de parceiros

## Pendencias pré-lançamento

### Alta prioridade
- Login social (Google/Apple) — 30-50% mais cadastros
- Rotas dedicadas por sub-view — cada tela com URL própria
- Configurar Stripe secrets no Supabase — pra cobrar produtores
- Testar app no celular real
- CNPJ da VANTA — substituir "[a definir]" nos Termos e Política (LegalView.tsx)
- Configurar emails suporte@vanta.app, dpo@vanta.app, privacidade@vanta.app
- Deep links: SHA-256 (Android) + TEAMID (iOS)
- Info.plist — primeiro build iOS

### Média prioridade
- Configurar Meta API token — verificação Instagram
- Classificação etária dos eventos (ECA Digital)
- PIX no checkout
- Registro INPI (VANTA + MAIS VANTA)

### Baixa prioridade
- Parceria etapa 3 (aprovação master)
- Parceria etapa 4 (onboarding tutorial novos donos)
- Internacionalização (app em inglês pra turistas)

## Como estamos trabalhando

### Fluxo de agentes
- Alex coordena, NUNCA faz trabalho de outro agente
- Cada agente responde por si (Iris, Rio, Luna, Kai, Théo, Zara, Val, Lia)
- Rio SEMPRE presente em toda conversa
- Chatão + Lia rodam automaticamente antes de cada entrega ao Dan
- NUNCA repetir perguntas sobre algo já decidido — consultar memórias ANTES

### Regras do Dan
- SEMPRE usar AskUserQuestion (nunca texto normal)
- Mínimo 4 opções, primeira recomendada
- Linguagem de produto, zero termos técnicos
- Granularidade máxima: 1 decisão = 1 pergunta
- Consultar projeto_redesign_app.md ANTES de qualquer pergunta
