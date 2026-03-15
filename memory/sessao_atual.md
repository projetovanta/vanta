# Sessao Atual — Estado para Continuidade

## Branch: main
## Ultimo commit: `b80179a` — fix: recriar MEMORY.md
## Mudancas locais: SIM (redesign guest modal + onboarding 3 telas)

## Repositorio e Deploy
- **GitHub**: `projetovanta/vanta` (conta: projetovanta)
- **Vercel**: projeto `vanta-a2b3` (danloures-projects) conectado a projetovanta/vanta

## Preflight: 8/8

## O que foi feito nesta sessao

### 1. MEMORY.md recriado
- Nunca havia sido commitado no git — existia só localmente e se perdeu
- Recriado com 132 linhas, 86 memórias indexadas por categoria
- Commitado como `b80179a`

### 2. Auditoria Lia — últimos 4 commits
- 2 pendências encontradas e corrigidas (MEMORIA-COMPARTILHADA + sessao_atual)
- BRIEFING.md e protocolo de ativação de agentes registrados

### 3. Guest Modal Contextual
- GuestAreaModal: Shield→Sparkles, "Área Restrita"→"Crie sua conta"
- Texto contextual por ação (curtir, comprar, mensagem, perfil, notificação, genérico)
- State: showGuestModal boolean → guestModalContext string|null
- Botões: "Já tenho conta" / "Criar Conta" / "Agora não"
- RestrictedModal (ComunidadePublicView) também atualizado pro novo visual
- Arquivos: AppModals.tsx, useAppHandlers.ts, App.tsx, RestrictedModal.tsx

### 4. VANTA Indica expandido
- TipoIndicaCard: 5 novos tipos + 2 legados
- Badges coloridos por tipo no Highlights (Evento=verde, Parceiro=âmbar, MV=dourado, Experiência=roxo, Informativo=cinza)
- TIPO_CONFIG no admin VantaIndicaView com todos os 7 tipos
- Admin funciona com preenchimento manual (auto-preenchimento avançado = fase futura)

### 5. Detalhe do Evento Redesign
- Footer adaptativo: gratuito→"Eu vou!" dourado, pago→"Eu vou!"+Garantir, já comprou→ambos visíveis
- "Últimas vagas" vermelho quando >80% (capacityPct prop, opcional)
- Texto MV sutil: "Este evento tem vantagens pra membros — saiba mais"

### 6. Home Redesign
- Seções removidas: SavedEventsSection, NewOnPlatformSection, MaisVantaBanner
- Ordem nova: Saudação→Indica→Ao Vivo→Amigos Vão→Perto→Semana→Pra Você→Feed
- Saudação guest: "Descubra o que tá rolando" (sem nome)
- Teste E2E atualizado

### 5. Onboarding 3 Telas
- Step 1: Cidade (IBGE, já existia — copy ajustado "Onde você curte a noite?")
- Step 2: Interesses (19 chips musicais, opcional, salva em profiles.interesses)
- Step 3: Boas-vindas ("Pronto, [Nome]. Sua noite começa aqui." + Sparkles + glow)
- StepDots indicator (3 pontos animados)
- Arquivo: OnboardingView.tsx reescrito (~260L)

## Pendencias futuras

### Alta prioridade (pré-lançamento)
- Login social (Google/Apple) — 30-50% mais cadastros
- Rotas dedicadas por sub-view — cada tela com URL própria
- Configurar Stripe secrets no Supabase — pra cobrar produtores
- Testar app no celular real
- CNPJ da VANTA — substituir "[a definir]" nos Termos de Uso e Política de Privacidade (LegalView.tsx)
- Configurar emails suporte@vanta.app, dpo@vanta.app, privacidade@vanta.app

### Média prioridade
- Configurar Meta API token — verificação Instagram
- Classificação etária dos eventos (ECA Digital — lei em vigor)
- PIX no checkout

### Baixa prioridade
- Parceria etapa 3 (aprovação master)
- Parceria etapa 4 (onboarding tutorial novos donos)
- iOS: Info.plist + build nativo
- Internacionalização (app em inglês pra turistas)
