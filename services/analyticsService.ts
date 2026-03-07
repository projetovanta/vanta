import { supabase } from './supabaseClient';

/** Fire-and-forget: registra APP_OPEN */
export function trackAppOpen(userId: string) {
  if (!userId) return;
  void supabase
    .from('analytics_events')
    .insert({ user_id: userId, event_type: 'APP_OPEN' })
    .then(null, () => {});
}

/** Batch buffer — acumula IDs e faz 1 INSERT a cada 3s */
const viewBuffer = { userId: '', ids: new Set<string>(), timer: null as ReturnType<typeof setTimeout> | null };

function flushViewBuffer() {
  const { userId, ids } = viewBuffer;
  if (!userId || ids.size === 0) return;
  const rows = [...ids].map(id => ({ user_id: userId, event_type: 'EVENT_VIEW' as const, event_id: id }));
  ids.clear();
  void supabase
    .from('analytics_events')
    .insert(rows)
    .then(null, () => {});
}

/** Fire-and-forget: registra EVENT_VIEW (impressão no feed). Acumula e envia em batch a cada 3s. */
export function trackEventView(userId: string, eventoId: string) {
  if (!userId || !eventoId) return;
  viewBuffer.userId = userId;
  viewBuffer.ids.add(eventoId);
  if (!viewBuffer.timer) {
    viewBuffer.timer = setTimeout(() => {
      viewBuffer.timer = null;
      flushViewBuffer();
    }, 3000);
  }
}

/** Fire-and-forget: registra EVENT_OPEN (abriu detalhe do evento) */
export function trackEventOpen(userId: string, eventoId: string) {
  if (!userId) return;
  void supabase
    .from('analytics_events')
    .insert({ user_id: userId, event_type: 'EVENT_OPEN', event_id: eventoId })
    .then(null, () => {});
}

/** Checa se user é elegível para PMF survey: 3+ tickets e sem resposta anterior */
export async function checkPmfEligible(userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const [tickets, pmf] = await Promise.all([
      supabase.from('tickets_caixa').select('id', { count: 'exact', head: true }).eq('owner_id', userId),
      supabase.from('pmf_responses').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    ]);
    return (tickets.count ?? 0) >= 3 && (pmf.count ?? 0) === 0;
  } catch {
    return false;
  }
}

/** Registra resposta PMF — retorna true se sucesso */
export async function submitPmfResponse(userId: string, response: string): Promise<boolean> {
  const { error } = await supabase.from('pmf_responses').insert({ user_id: userId, response });
  return !error;
}
