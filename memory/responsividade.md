# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 18:08
# Memória — Responsividade

## Regras (CLAUDE.md)
- Mobile-first (iOS, Android, browser mobile)
- ZERO scroll horizontal
- ZERO valores fixos de largura → usar %, flex, w-full, min-w-0, truncate
- Textos longos: truncate ou line-clamp-N
- Modais: absolute inset-0 (NUNCA fixed inset-0)
- Exceção: páginas standalone podem usar `h-[100dvh]` e fixed inset-0 (NUNCA `h-screen`)
- Safe area PWA: `style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}` no header, `pb-safe` / `env(safe-area-inset-bottom)` no footer
- `-webkit-tap-highlight-color: transparent` no CSS global (index.html)
- Tap targets interativos: `min-h-[44px]` (Apple HIG)
- Páginas standalone: `h-[100dvh]` em vez de `h-screen` (respeita barra de endereço mobile)
- Views fullscreen (absolute inset-0) com header próprio: `style={{ paddingTop: 'max(Nrem, env(safe-area-inset-top, Nrem))' }}`

## Contêiner Master (App.tsx)
- Outer: fixed inset-0 flex flex-col items-center overflow-hidden bg-[#050505]
- Inner: w-full flex-1 overflow-hidden flex flex-col bg-[#0A0A0A]
- App normal: max-w-md
- Admin: desktop sem max-w, mobile max-w-4xl
- Desktop ≥768px: sidebar w-56 fixa. Mobile: sidebar colapsável w-14/w-48

## FocusView (scroll)
```
✅ <div className="absolute inset-0 flex flex-col overflow-hidden">
     <div className="flex-1 overflow-y-auto no-scrollbar">
❌ <div className="min-h-full">  ← scroll travado
```

## Scroll horizontal tabs
overflow-x-auto snap-x no-scrollbar + shrink-0

## Novos Bottom-Sheets — Regra Obrigatória
- **SEMPRE usar `<BottomSheet>` de `components/BottomSheet.tsx`** para novos bottom-sheets
- O componente já inclui: backdrop, animação, pill handle, safe-area-inset-bottom
- Se não puder usar o componente, DEVE ter `style={{ paddingBottom: 'max(Nrem, env(safe-area-inset-bottom, Nrem))' }}`
- lint:layout bloqueia `pb-8/10/12` em `rounded-t-*` e avisa se falta `safe-area-inset-bottom`

## Tipografia
Playfair Display SC Bold 700, clamp responsivo
