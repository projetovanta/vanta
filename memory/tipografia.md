# Memória — Tipografia VANTA

## Tokens definidos em constants.ts

### FONTS
- `serif`: Playfair Display, ui-serif, Georgia, serif
- `sans`: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif

### COLORS (usados na tipografia)
- `textPrimary`: rgba(255,255,255,0.92)
- `textMuted`: rgba(255,255,255,0.58)
- `textFaint`: rgba(255,255,255,0.38)
- `gold`: #FFD300

### TYPOGRAPHY (5 tokens — style inline)
| Token | Fonte | Peso | Cor | Caixa | Tracking | Tamanho |
|-------|-------|------|-----|-------|----------|---------|
| `screenTitle` | Playfair | 700 | textPrimary | normal | — | definido via className |
| `cardTitle` | Playfair | 700 | textPrimary | normal | — | definido via className |
| `sectionKicker` | Inter | 600 | gold | UPPER | 0.28em | 0.625rem |
| `uiLabel` | Inter | 900 | textMuted | UPPER | 0.22em | 0.625rem |
| `uiBody` | Inter | — | textPrimary | normal | — | definido via className |

## Classes CSS (app.css)
- `.font-serif`: Playfair Display, font-weight 700

## Padrões de uso

### Títulos de tela (tabs principais)
- `style={TYPOGRAPHY.screenTitle} className="text-3xl"` + font-serif + text-[#FFD300]
- Padding: pt-6 px-6 pb-4

### Títulos de sub-view (headers internos)
- `style={TYPOGRAPHY.screenTitle} className="text-xl"`
- Padding: pt-6 px-6 pb-4
- Container: shrink-0 bg-[#0A0A0A] border-b border-white/5

### Kickers de seção (Home)
- `style={TYPOGRAPHY.sectionKicker} className="text-sm"`
- Ícone dourado à esquerda (Lucide, 0.875rem)

### Labels caps
- `style={TYPOGRAPHY.uiLabel}`
- Ou via className: text-[0.5625rem] font-black uppercase tracking-[0.2em]

### Corpo de texto
- Inter (padrão do Tailwind), sem style inline necessário
- Primário: text-white ou text-zinc-100
- Secundário: text-zinc-400 ou text-zinc-500
- Terciário: text-zinc-600 ou text-zinc-700

## Regras
- Playfair Display Bold 700 — SEMPRE. Sem SC, sem italic, sem Regular
- 700 = peso (weight), não tamanho
- font-bold/font-semibold NUNCA junto com font-serif (CSS já aplica 700)
- Italic de Inter preservado onde faz sentido (subtítulos auxiliares)
- 190 usos de TYPOGRAPHY em 113 arquivos
