const FONTS = {
  serif: "'Playfair Display SC', ui-serif, Georgia, serif",
  sans: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
};
const COLORS = {
  textPrimary: 'rgba(255,255,255,0.92)',
  textMuted: 'rgba(255,255,255,0.58)',
  textFaint: 'rgba(255,255,255,0.38)',
  gold: '#FFD300',
};
export const TYPOGRAPHY = {
  screenTitle: { fontFamily: FONTS.serif, color: COLORS.textPrimary, fontWeight: 700 },
  cardTitle: { fontFamily: FONTS.serif, color: COLORS.textPrimary, fontWeight: 700 },
  sectionKicker: {
    fontFamily: FONTS.sans,
    color: COLORS.gold,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.28em',
    fontSize: '0.625rem',
  },
  uiLabel: {
    fontFamily: FONTS.sans,
    color: COLORS.textMuted,
    fontWeight: 900,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.22em',
    fontSize: '0.625rem',
  },
  uiBody: { fontFamily: FONTS.sans, color: COLORS.textPrimary },
};

// ── Classes de formulário reutilizáveis ─────────────────────────────────────
export const inputCls =
  'w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700';
export const labelCls = 'text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5 block';
