# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-15
# Memória — Onboarding

## Fluxo (3 telas)
1. Novo user faz cadastro (AuthModal) → `showOnboarding = true`
2. **Step 1 — Cidade**: busca IBGE (5571 municípios), salva em profiles.cidade + profiles.estado
3. **Step 2 — Interesses** (opcional, pode pular): 19 chips musicais, salva em profiles.interesses (TEXT[])
4. **Step 3 — Boas-vindas**: "Pronto, [Nome]. Sua noite começa aqui." + botão "Explorar"
5. `handleOnboardingComplete()` → `localStorage.setItem('vanta_onboarding_done', '1')` → fecha

## Interesses disponíveis (19)
Funk, Sertanejo, Eletrônica, Pop, Rock, Pagode, Forró, Hip Hop/Rap, Reggaeton, MPB, Jazz, R&B, Trap, Techno, House, Indie, Axé, Brega Funk, Outro

## Arquivos
- `components/OnboardingView.tsx` (~260L) — 3 steps com StepDots indicator
- Renderizado via `components/AppModals.tsx` (lazy import)
- Cidade salva via `supabase.from('profiles').update()`
- Interesses salva via `supabase.from('profiles').update({ interesses })`

## Guest Modal (contextual)
- `GuestAreaModal` em `components/AppModals.tsx` — inline
- Ícone: Sparkles dourado. Título: "Crie sua conta"
- Texto adapta ao contexto (curtir, comprar, mensagem, perfil, notificação, genérico)
- State: `guestModalContext: string | null` em `hooks/useAppHandlers.ts`
- Botões: "Já tenho conta" (dourado) / "Criar Conta" (borda) / "Agora não" (texto)
- `RestrictedModal` (components/RestrictedModal.tsx) — mesmo visual, usado em ComunidadePublicView
