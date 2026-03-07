import { Ingresso } from '../types';

const STORAGE_KEY = 'vanta_reminders';

class ReminderService {
  private timers: number[] = [];
  private scheduled = new Set<string>();

  /** Agenda notificações 24h e 2h antes do evento para cada ticket DISPONIVEL */
  scheduleReminders(tickets: Ingresso[]) {
    // Carrega já agendados do localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) this.scheduled = new Set(JSON.parse(stored) as string[]);
    } catch {
      /* ignore */
    }

    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

    const now = Date.now();

    for (const t of tickets) {
      if (t.status !== 'DISPONIVEL' || !t.eventoDataInicioISO) continue;

      const eventoTime = new Date(t.eventoDataInicioISO).getTime();
      const offsets = [
        { key: `${t.eventoId}_24h`, ms: 24 * 60 * 60 * 1000, label: 'amanhã' },
        { key: `${t.eventoId}_2h`, ms: 2 * 60 * 60 * 1000, label: 'em 2 horas' },
      ];

      for (const { key, ms, label } of offsets) {
        if (this.scheduled.has(key)) continue;
        const fireAt = eventoTime - ms;
        const diff = fireAt - now;
        if (diff <= 0) continue; // já passou

        const timer = window.setTimeout(() => {
          new Notification(`${t.tituloEvento}`, {
            body: `Seu evento começa ${label}!`,
            icon: '/icons/icon-192.png',
          });
          this.scheduled.add(key);
          this.persist();
        }, diff);

        this.timers.push(timer);
        this.scheduled.add(key);
      }
    }

    this.persist();
  }

  /** Cancela todos os timers pendentes */
  cancelAll() {
    this.timers.forEach(id => clearTimeout(id));
    this.timers = [];
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.scheduled]));
    } catch {
      /* ignore */
    }
  }
}

export const reminderService = new ReminderService();
