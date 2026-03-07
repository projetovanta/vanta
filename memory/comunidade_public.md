# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Memória — Comunidade Pública

## Arquivo
- `modules/community/ComunidadePublicView.tsx` (407L)

## Props
```ts
comunidadeId: string, onBack, onEventClick, onMemberClick
```

## Funcionalidades
- Exibe info da comunidade (nome, foto, descrição, horário funcionamento)
- Lista eventos da comunidade
- Lista membros
- Reviews da comunidade
- Follow/unfollow via `communityFollowService`
- Usa `vantaService`, `supabaseClient`, `authService`, `reviewsService`
- Componente `HorarioPublicDisplay` para horário de funcionamento
