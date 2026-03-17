# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-11 06:45
# Memória — Responsividade

## Scaling Fluido Proporcional (CRÍTICO)
- **ResizeObserver** em App.tsx (useEffect com `[authLoading]`) ajusta `html font-size`
- Fórmula: `fs = (Math.max(320, Math.min(el.offsetWidth, 500)) / 375) * 16`
- 375px = 16px (referência design). 320px = 13.65px (mínimo). 500px = 21.33px (máximo)
- **Admin panel mobile**: scaling fluido igual ao app (320-500px). Admin desktop: font-size 16px (conteúdo 500px + sidebar)
- **Tudo em rem**: 2546 `text-[Npx]` convertidos, 1635 `size={N}` (Lucide icons) convertidos
- Container app: `max-w-[500px]` em px literal (NÃO escala com rem — intencional)
- Valores NÃO convertidos: `w-[1-2px]`, `h-[1-2px]` (decorativos), `rounded-[2px]`, `borderLeftWidth: '3px'`
- **Virtualizers**: devem usar `getItemHeight()` dinâmico baseado no font-size, não px fixo

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
- Inner (id="vanta-app"): w-full flex-1 overflow-hidden flex flex-col bg-[#0A0A0A]
- App normal: max-w-[500px]
- Admin: conteúdo max-w-[500px] (igual app) + sidebar ao lado no desktop
- Desktop ≥768px: sidebar fixa + conteúdo 500px. Mobile: sidebar fechada, conteúdo 320-500px
- Regra universal: TUDO cabe em 320px sem cortar. Escala proporcionalmente até 500px

## FocusView (scroll)
```
✅ <div className="absolute inset-0 flex flex-col overflow-hidden">
     <div className="flex-1 overflow-y-auto no-scrollbar">
❌ <div className="min-h-full">  ← scroll travado
```

## Scroll horizontal tabs
overflow-x-auto snap-x no-scrollbar + shrink-0

## Admin tabs/pills — flex-wrap
- Quando muitos itens: `flex-wrap` no container (sem overflow-x-auto, sem shrink-0)
- Fontes mínimas: 6px (0.375rem)
- Espaçamento: `gap-1.5` ou `gap-2` entre pills

## Centralização vertical em scroll views
- Pattern: scroll container `display: flex; flex-direction: column` + inner div `margin: auto 0`
- Quando conteúdo < viewport: centraliza com espaço igual acima/abaixo
- Quando conteúdo > viewport: scroll normal (margin auto colapsa para 0)
- Usado em: ClubeOptInView

## Novos Bottom-Sheets — Regra Obrigatória
- **SEMPRE usar `<BottomSheet>` de `components/BottomSheet.tsx`** para novos bottom-sheets
- O componente já inclui: backdrop, animação, pill handle, safe-area-inset-bottom
- Se não puder usar o componente, DEVE ter `style={{ paddingBottom: 'max(Nrem, env(safe-area-inset-bottom, Nrem))' }}`
- lint:layout bloqueia `pb-8/10/12` em `rounded-t-*` e avisa se falta `safe-area-inset-bottom`

## Tipografia
Playfair Display SC Bold 700, clamp responsivo

## Filter Modals (Busca)
- Backdrop: bg-black/80 backdrop-blur-md (escuro)
