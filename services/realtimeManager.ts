import { supabase } from './supabaseClient';
import type { RealtimeChannel, RealtimeChannelOptions } from '@supabase/supabase-js';

/**
 * Realtime Manager — gerencia subscriptions do Supabase Realtime.
 *
 * - Max N subscriptions simultâneas (default 5)
 * - Prioridade: channels mais recentes têm prioridade
 * - Unsubscribe automático de channels inativos quando excede o limite
 * - Cleanup global no logout
 * - Reconexão automática em CHANNEL_ERROR / TIMED_OUT (max 5 tentativas, backoff exponencial)
 */

type SetupFn = (channel: RealtimeChannel) => void | true;

interface ManagedChannel {
  name: string;
  channel: RealtimeChannel;
  priority: number; // maior = mais prioritário
  createdAt: number;
  setup: SetupFn;
  channelOpts?: RealtimeChannelOptions;
  reconnectTimer?: ReturnType<typeof setTimeout>;
  reconnectAttempts: number;
}

const MAX_CHANNELS = 5;
const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY = 2000; // 2s

const channels = new Map<string, ManagedChannel>();
let priorityCounter = 0;

function enforceLimit(): void {
  if (channels.size <= MAX_CHANNELS) return;

  // Remove o channel com menor prioridade
  let lowestKey: string | null = null;
  let lowestPriority = Infinity;

  for (const [key, entry] of channels) {
    if (entry.priority < lowestPriority) {
      lowestPriority = entry.priority;
      lowestKey = key;
    }
  }

  if (lowestKey) {
    const entry = channels.get(lowestKey);
    if (entry) {
      clearTimeout(entry.reconnectTimer);
      supabase.removeChannel(entry.channel);
      channels.delete(lowestKey);
    }
  }
}

function scheduleReconnect(entry: ManagedChannel): void {
  if (entry.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error(
      `[realtimeManager] ${entry.name}: max reconnect attempts (${MAX_RECONNECT_ATTEMPTS}) reached, giving up`,
    );
    channels.delete(entry.name);
    return;
  }

  const delay = BASE_RECONNECT_DELAY * Math.pow(2, entry.reconnectAttempts);
  const attempt = entry.reconnectAttempts + 1;
  console.warn(`[realtimeManager] ${entry.name}: scheduling reconnect #${attempt} in ${delay}ms`);

  entry.reconnectTimer = setTimeout(() => {
    // Guard: se já foi removido (unsubscribe chamado entre schedule e fire), não reconectar
    if (!channels.has(entry.name)) return;

    // Remover o channel morto sem limpar do map (vamos recriar)
    try {
      supabase.removeChannel(entry.channel);
    } catch {
      /* já removido */
    }
    channels.delete(entry.name);

    // Recriar via subscribe normal (mantém setup e opts originais)
    console.debug(`[realtimeManager] ${entry.name}: reconnecting (attempt #${attempt})`);
    const cleanup = realtimeManager.subscribe(entry.name, entry.setup, entry.channelOpts);

    // Propagar o contador de tentativas para o novo entry
    const newEntry = channels.get(entry.name);
    if (newEntry) {
      newEntry.reconnectAttempts = attempt;
    }

    // cleanup não é usado aqui — o consumer já tem o cleanup original
    void cleanup;
  }, delay);
}

function createStatusHandler(entry: ManagedChannel) {
  return (status: string) => {
    if (status === 'SUBSCRIBED') {
      // Sucesso — resetar contador de reconexão
      if (entry.reconnectAttempts > 0) {
        console.debug(`[realtimeManager] ${entry.name}: reconnected successfully`);
      }
      entry.reconnectAttempts = 0;
      return;
    }

    if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
      console.warn(`[realtimeManager] ${entry.name}: ${status}`);
      // Só agendar se ainda estiver no map (não foi unsubscribed)
      if (channels.has(entry.name)) {
        scheduleReconnect(entry);
      }
    }
    // CLOSED = intencional (unsubscribe), não reconectar
  };
}

export const realtimeManager = {
  /**
   * Cria ou reutiliza um channel gerenciado.
   *
   * @param name     Nome único do channel
   * @param setup    Função que configura o channel (on, subscribe)
   * @returns        Cleanup function
   */
  subscribe(name: string, setup: SetupFn, channelOpts?: RealtimeChannelOptions): () => void {
    // Se já existe, bump priority
    const existing = channels.get(name);
    if (existing) {
      existing.priority = ++priorityCounter;
      return () => realtimeManager.unsubscribe(name);
    }

    const channel = channelOpts ? supabase.channel(name, channelOpts) : supabase.channel(name);
    const entry: ManagedChannel = {
      name,
      channel,
      priority: ++priorityCounter,
      createdAt: Date.now(),
      setup,
      channelOpts,
      reconnectAttempts: 0,
    };

    channels.set(name, entry);
    enforceLimit();

    const skipAutoSubscribe = setup(channel);
    if (!skipAutoSubscribe) {
      channel.subscribe(createStatusHandler(entry));
    }

    return () => realtimeManager.unsubscribe(name);
  },

  /** Remove um channel específico */
  unsubscribe(name: string): void {
    const entry = channels.get(name);
    if (entry) {
      clearTimeout(entry.reconnectTimer);
      supabase.removeChannel(entry.channel);
      channels.delete(name);
    }
  },

  /** Remove todos os channels (chamado no logout) */
  unsubscribeAll(): void {
    for (const [, entry] of channels) {
      clearTimeout(entry.reconnectTimer);
      supabase.removeChannel(entry.channel);
    }
    channels.clear();
    priorityCounter = 0;
  },

  /** Número de channels ativos */
  get activeCount(): number {
    return channels.size;
  },

  /** Lista de channels ativos (para debug) */
  get activeChannels(): string[] {
    return Array.from(channels.keys());
  },
};
