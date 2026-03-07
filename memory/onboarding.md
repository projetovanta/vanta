# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Memória — Onboarding

## Fluxo
1. Novo user faz login → `showOnboarding = true` no App.tsx
2. Onboarding multi-step → selecionar interesses, cidade, etc
3. `handleOnboardingComplete()` → marca como completo

## Arquivos
- Componente de onboarding dentro de `components/` (renderizado via AppModals)
- `InterestSelector` usado no onboarding e no EditProfile
