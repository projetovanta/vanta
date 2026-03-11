/**
 * devLogger — Sistema centralizado de debug logging para desenvolvimento.
 *
 * Ativo APENAS em localhost (import.meta.env.DEV).
 * Em produção: ZERO logs, ZERO impacto na performance.
 *
 * Categorias:
 *   🧭 [NAV]       — navegação (tabs, rotas, sub-views)
 *   🧭 [MODAL]     — abrir/fechar modais
 *   👆 [CLICK]     — cliques em botões
 *   📝 [FORM]      — submits de formulários
 *   ✅ [API]       — chamadas Supabase (sucesso)
 *   🔴 [API]       — chamadas Supabase (erro)
 *   🟡 [API]       — chamadas Supabase (lento >3s)
 *   🔄 [STORE]     — mudanças de estado Zustand
 *   🔴 [ERRO]      — erros capturados
 *   📡 [RT]        — realtime subscriptions
 *   ♻️ [LIFECYCLE] — mount/unmount de componentes
 */

const isDev = import.meta.env.DEV;

export type LogCategory = 'NAV' | 'MODAL' | 'CLICK' | 'FORM' | 'API' | 'STORE' | 'ERRO' | 'RT' | 'LIFECYCLE';
export type LogLevel = 'info' | 'warn' | 'error';

export interface DevLogEntry {
  id: number;
  timestamp: number;
  category: LogCategory;
  level: LogLevel;
  emoji: string;
  message: string;
  data?: unknown;
}

const EMOJI_MAP: Record<LogCategory, string> = {
  NAV: '🧭',
  MODAL: '🧭',
  CLICK: '👆',
  FORM: '📝',
  API: '✅',
  STORE: '🔄',
  ERRO: '🔴',
  RT: '📡',
  LIFECYCLE: '♻️',
};

const COLOR_MAP: Record<LogLevel, string> = {
  info: 'color: #8B5CF6; font-weight: bold', // roxo
  warn: 'color: #F59E0B; font-weight: bold', // amarelo
  error: 'color: #EF4444; font-weight: bold', // vermelho
};

let _idCounter = 0;
const _entries: DevLogEntry[] = [];
const MAX_ENTRIES = 500;
const _listeners = new Set<() => void>();

// Contadores
let _errorCount = 0;
let _warnCount = 0;

function _emit() {
  for (const fn of _listeners) fn();
}

function _addEntry(category: LogCategory, level: LogLevel, message: string, data?: unknown) {
  if (!isDev) return;

  const emoji = level === 'error' ? '🔴' : level === 'warn' ? '🟡' : EMOJI_MAP[category];
  const entry: DevLogEntry = {
    id: ++_idCounter,
    timestamp: Date.now(),
    category,
    level,
    emoji,
    message,
    data,
  };

  _entries.push(entry);
  if (_entries.length > MAX_ENTRIES) _entries.shift();

  if (level === 'error') _errorCount++;
  if (level === 'warn') _warnCount++;

  // Console output formatado
  const tag = `${emoji} [${category}]`;
  const style = COLOR_MAP[level];

  if (level === 'error') {
    // eslint-disable-next-line no-console
    console.error(`%c${tag} ${message}`, style, data ?? '');
  } else if (level === 'warn') {
    // eslint-disable-next-line no-console
    console.warn(`%c${tag} ${message}`, style, data ?? '');
  } else {
    // eslint-disable-next-line no-console
    console.log(`%c${tag} ${message}`, style, data ?? '');
  }

  _emit();
}

export const devLogger = {
  /** Está ativo? */
  get enabled() {
    return isDev;
  },

  // ── Navegação ──────────────────────────────────────────────
  nav(message: string) {
    _addEntry('NAV', 'info', message);
  },

  modal(message: string) {
    _addEntry('MODAL', 'info', message);
  },

  // ── Interações ─────────────────────────────────────────────
  click(message: string) {
    _addEntry('CLICK', 'info', message);
  },

  form(message: string, data?: unknown) {
    _addEntry('FORM', 'info', message, data);
  },

  // ── API / Supabase ─────────────────────────────────────────
  apiSuccess(message: string, data?: unknown) {
    _addEntry('API', 'info', message, data);
  },

  apiError(message: string, data?: unknown) {
    _addEntry('API', 'error', message, data);
  },

  apiSlow(message: string, data?: unknown) {
    _addEntry('API', 'warn', message, data);
  },

  // ── Store ──────────────────────────────────────────────────
  store(message: string, data?: unknown) {
    _addEntry('STORE', 'info', message, data);
  },

  // ── Erros ──────────────────────────────────────────────────
  error(message: string, data?: unknown) {
    _addEntry('ERRO', 'error', message, data);
  },

  // ── Realtime ───────────────────────────────────────────────
  rt(message: string) {
    _addEntry('RT', 'info', message);
  },

  rtError(message: string, data?: unknown) {
    _addEntry('RT', 'error', message, data);
  },

  // ── Lifecycle ──────────────────────────────────────────────
  lifecycle(message: string) {
    _addEntry('LIFECYCLE', 'info', message);
  },

  // ── Acesso ao state ────────────────────────────────────────
  getEntries(): readonly DevLogEntry[] {
    return _entries;
  },

  get errorCount() {
    return _errorCount;
  },

  get warnCount() {
    return _warnCount;
  },

  get lastEntry(): DevLogEntry | undefined {
    return _entries[_entries.length - 1];
  },

  clear() {
    _entries.length = 0;
    _errorCount = 0;
    _warnCount = 0;
    _emit();
  },

  subscribe(fn: () => void): () => void {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },

  /** Exportar log completo como texto */
  exportText(): string {
    return _entries
      .map(e => {
        const ts = new Date(e.timestamp).toLocaleTimeString('pt-BR', { hour12: false });
        const dataStr = e.data ? ` | ${JSON.stringify(e.data)}` : '';
        return `[${ts}] ${e.emoji} [${e.category}] ${e.message}${dataStr}`;
      })
      .join('\n');
  },

  /** Exportar APENAS erros e warnings — formato compacto pra colar no Claude */
  exportReport(): string {
    const problems = _entries.filter(e => e.level === 'error' || e.level === 'warn');
    if (problems.length === 0) return '✅ ZERO erros ou warnings no DevLog.';

    const lines = problems.map(e => {
      const ts = new Date(e.timestamp).toLocaleTimeString('pt-BR', { hour12: false });
      const dataStr = e.data ? ` | ${JSON.stringify(e.data)}` : '';
      return `${e.emoji} [${e.category}] ${e.message}${dataStr}`;
    });

    // Deduplicar mensagens repetidas (StrictMode) — mostrar contagem
    const counts = new Map<string, number>();
    for (const line of lines) {
      counts.set(line, (counts.get(line) || 0) + 1);
    }

    const deduped = Array.from(counts.entries()).map(([line, count]) => (count > 1 ? `${line} (×${count})` : line));

    return [`── DevLog Report (${problems.length} problemas) ──`, ...deduped].join('\n');
  },
};
