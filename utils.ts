import { Evento } from './types';

/**
 * Timestamp Brasil (São Paulo) no formato ISO 8601 com offset -03:00.
 * Usa toLocaleString('sv-SE') que produz formato YYYY-MM-DD HH:mm:ss.
 * Correto inclusive durante horário de verão.
 */
export const tsBR = (): string =>
  new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';

/**
 * Data de hoje em São Paulo no formato YYYY-MM-DD.
 * Evita bug de new Date().toISOString() que usa UTC (entre 21h-00h mostra dia seguinte).
 */
export const todayBR = (): string => new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });

/**
 * Formata número como moeda BRL (ex: R$ 1.234,56)
 */
export const fmtBRL = (n: number): string => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/**
 * Formata número como moeda BRL — compacta SOMENTE para milhões (R$ 1,20M).
 * Abaixo de 1M: valor completo via fmtBRL.
 */
export const fmtBRLCompact = (n: number): string => {
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(2).replace('.', ',')}M`;
  return fmtBRL(n);
};

/**
 * Retorna as datas de início e fim completas de um evento como objetos Date
 */
const getEventBounds = (evento: Evento) => {
  const [year, month, day] = evento.dataReal.split('-').map(Number);
  const startDateTime = new Date(year, month - 1, day);
  const [startH, startM] = evento.horario.split(':').map(Number);
  startDateTime.setHours(startH, startM, 0, 0);

  let endDateTime = new Date(startDateTime);
  if (evento.horarioFim) {
    const [endH, endM] = evento.horarioFim.split(':').map(Number);
    // Se o fim é numericamente menor que o início (ex: 08:00 < 23:00),
    // o evento termina no dia seguinte.
    if (endH < startH || (endH === startH && endM < startM)) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }
    endDateTime.setHours(endH, endM, 0, 0);
  } else {
    // Fallback: se não houver fim, assume 4 horas de duração
    endDateTime.setHours(startDateTime.getHours() + 4);
  }

  return { start: startDateTime, end: endDateTime };
};

/**
 * Verifica se um evento começa em breve (próximos 60 minutos)
 */
export const isEventStartingSoon = (evento: Evento): boolean => {
  const now = new Date();
  const { start } = getEventBounds(evento);
  const diffInMinutes = (start.getTime() - now.getTime()) / (1000 * 60);
  // Se faltam entre 0 e 60 minutos para começar
  return diffInMinutes > 0 && diffInMinutes <= 60;
};

/**
 * Verifica se um evento acaba em breve (últimos 60 minutos de duração)
 */
export const isEventEndingSoon = (evento: Evento): boolean => {
  const now = new Date();
  const { start, end } = getEventBounds(evento);
  const diffToEnd = (end.getTime() - now.getTime()) / (1000 * 60);

  // Deve estar acontecendo (agora > start) e faltar menos de 60 min para o fim
  return now >= start && diffToEnd > 0 && diffToEnd <= 60;
};

/**
 * Verifica se um evento está acontecendo EXATAMENTE AGORA
 */
export const isEventHappeningNow = (evento: Evento): boolean => {
  const now = new Date();
  const { start, end } = getEventBounds(evento);
  return now >= start && now <= end;
};

/**
 * Ordena eventos de forma cronológica real
 * Prioridade:
 * 1. Eventos Acontecendo Agora (Live) ou Começando em Breve
 * 2. Ordem cronológica por data e hora de início
 */
export const sortEvents = (events: Evento[]): Evento[] => {
  return [...events].sort((a, b) => {
    const aUrgent = isEventHappeningNow(a) || isEventStartingSoon(a);
    const bUrgent = isEventHappeningNow(b) || isEventStartingSoon(b);

    // Regra de Ouro: O que é LIVE ou SOON sempre fica no topo
    if (aUrgent && !bUrgent) return -1;
    if (!aUrgent && bUrgent) return 1;

    // Se ambos são urgentes ou ambos não são, cronologia real
    const fullStartA = `${a.dataReal}T${a.horario}`;
    const fullStartB = `${b.dataReal}T${b.horario}`;

    return fullStartA.localeCompare(fullStartB);
  });
};

/**
 * Converte um data URL (base64) em Blob sem usar fetch().
 * Compatível com iOS Safari + CSP restritivo.
 */
export function dataURLtoBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const binary = atob(data);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

export const getMinPrice = (evento: Evento): number => {
  if (!evento.lotes || evento.lotes.length === 0) return 0;
  return Math.min(...evento.lotes.map(l => l.preco));
};

/**
 * Verifica se um evento já expirou (mais de 1 hora após o horário de término)
 */
export const isEventExpired = (evento: Evento): boolean => {
  const now = new Date();
  const { end } = getEventBounds(evento);
  const thresholdTime = new Date(end.getTime() + 60 * 60 * 1000);
  return now > thresholdTime;
};
