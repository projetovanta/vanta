import { supabase } from './supabaseClient';
import type { RealtimeChannel, RealtimeChannelOptions } from '@supabase/supabase-js';

/**
 * Realtime Manager — gerencia subscriptions do Supabase Realtime.
 *
 * - Max N subscriptions simultâneas (default 5)
 * - Prioridade: channels mais recentes têm prioridade
 * - Unsubscribe automático de channels inativos quando excede o limite
 * - Cleanup global no logout
 */

interface ManagedChannel {
  name: string;
  channel: RealtimeChannel;
  priority: number; // maior = mais prioritário
  createdAt: number;
}

const MAX_CHANNELS = 5;
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
      supabase.removeChannel(entry.channel);
      channels.delete(lowestKey);
    }
  }
}

export const realtimeManager = {
  /**
   * Cria ou reutiliza um channel gerenciado.
   *
   * @param name     Nome único do channel
   * @param setup    Função que configura o channel (on, subscribe)
   * @returns        Cleanup function
   */
  subscribe(
    name: string,
    setup: (channel: RealtimeChannel) => void | true,
    channelOpts?: RealtimeChannelOptions,
  ): () => void {
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
    };

    channels.set(name, entry);
    enforceLimit();

    const skipAutoSubscribe = setup(channel);
    if (!skipAutoSubscribe) channel.subscribe();

    return () => realtimeManager.unsubscribe(name);
  },

  /** Remove um channel específico */
  unsubscribe(name: string): void {
    const entry = channels.get(name);
    if (entry) {
      supabase.removeChannel(entry.channel);
      channels.delete(name);
    }
  },

  /** Remove todos os channels (chamado no logout) */
  unsubscribeAll(): void {
    for (const [, entry] of channels) {
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
