/**
 * offlineDB — IndexedDB unificado para operações offline do dia do evento.
 *
 * Stores: tickets, convidados, lotesCache, syncQueue.
 * Zero dependências externas.
 */

const DB_NAME = 'vanta_offline';
const DB_VERSION = 2;
const STORE_TICKETS = 'tickets';
const STORE_CONVIDADOS = 'convidados';
const STORE_LOTES = 'lotesCache';
const STORE_SYNC = 'syncQueue';

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface CachedTicket {
  id: string;
  eventoId: string;
  nomeTitular: string;
  email: string;
  variacaoLabel: string;
  status: 'DISPONIVEL' | 'USADO' | 'CANCELADO';
  usadoEm?: string;
}

export interface CachedConvidado {
  id: string;
  listaId: string;
  eventoId: string;
  regraId: string;
  nome: string;
  telefone: string;
  checkedIn: boolean;
  checkedInEm?: string;
  checkedInPorNome?: string;
  regraLabel?: string;
  regraCor?: string;
}

export interface CachedLoteVariacao {
  id: string; // variacaoId como keyPath
  eventoId: string;
  loteId: string;
  loteNome: string;
  area: string;
  areaCustom?: string;
  genero: string;
  valor: number;
  limite: number;
  vendidosLocal: number;
}

export type SyncType = 'CHECKIN_TICKET' | 'CHECKIN_LISTA' | 'VENDA_CAIXA' | 'CORTESIA';

export interface SyncQueueItem {
  id?: number;
  type: SyncType;
  eventoId: string;
  payload: Record<string, unknown>;
  timestamp: string;
  retries: number;
}

// ── DB Setup ─────────────────────────────────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_TICKETS)) {
        const store = db.createObjectStore(STORE_TICKETS, { keyPath: 'id' });
        store.createIndex('eventoId', 'eventoId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_CONVIDADOS)) {
        const store = db.createObjectStore(STORE_CONVIDADOS, { keyPath: 'id' });
        store.createIndex('eventoId', 'eventoId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_LOTES)) {
        const store = db.createObjectStore(STORE_LOTES, { keyPath: 'id' });
        store.createIndex('eventoId', 'eventoId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_SYNC)) {
        db.createObjectStore(STORE_SYNC, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txComplete(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function tsBR(): string {
  return new Date(Date.now() - 3 * 3600000).toISOString().replace('Z', '-03:00');
}

// ── Helper genérico: cache por eventoId ──────────────────────────────────────

async function cacheByEvento<T extends { eventoId: string }>(
  storeName: string,
  eventoId: string,
  items: T[],
): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  const index = store.index('eventoId');
  const cursorReq = index.openCursor(IDBKeyRange.only(eventoId));

  await new Promise<void>((resolve, reject) => {
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve();
      }
    };
    cursorReq.onerror = () => reject(cursorReq.error);
  });

  for (const item of items) store.put(item);
  await txComplete(tx);
  db.close();
}

async function getByEvento<T>(storeName: string, eventoId: string): Promise<T[]> {
  const db = await openDB();
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  const index = store.index('eventoId');

  return new Promise((resolve, reject) => {
    const req = index.getAll(IDBKeyRange.only(eventoId));
    req.onsuccess = () => {
      db.close();
      resolve(req.result as T[]);
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

async function updateItem<T>(storeName: string, id: string, updater: (item: T) => T): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  const getReq = store.get(id);

  await new Promise<void>((resolve, reject) => {
    getReq.onsuccess = () => {
      const item = getReq.result as T | undefined;
      if (item) store.put(updater(item));
      resolve();
    };
    getReq.onerror = () => reject(getReq.error);
  });
  await txComplete(tx);
  db.close();
}

// ── Tickets ──────────────────────────────────────────────────────────────────

export const cacheTickets = (eventoId: string, tickets: CachedTicket[]) =>
  cacheByEvento(STORE_TICKETS, eventoId, tickets);

export const getCachedTickets = (eventoId: string) => getByEvento<CachedTicket>(STORE_TICKETS, eventoId);

export async function markAsUsedLocally(ticketId: string, eventoId: string): Promise<void> {
  const now = tsBR();
  await updateItem<CachedTicket>(STORE_TICKETS, ticketId, t => ({
    ...t,
    status: 'USADO',
    usadoEm: now,
  }));
  await addToSyncQueue({
    type: 'CHECKIN_TICKET',
    eventoId,
    payload: { ticketId },
    timestamp: now,
    retries: 0,
  });
}

// ── Convidados (Lista) ───────────────────────────────────────────────────────

export const cacheConvidados = (eventoId: string, convidados: CachedConvidado[]) =>
  cacheByEvento(STORE_CONVIDADOS, eventoId, convidados);

export const getCachedConvidados = (eventoId: string) => getByEvento<CachedConvidado>(STORE_CONVIDADOS, eventoId);

export async function markConvidadoCheckedIn(
  convidadoId: string,
  eventoId: string,
  listaId: string,
  porteiroNome?: string,
): Promise<void> {
  const now = tsBR();
  await updateItem<CachedConvidado>(STORE_CONVIDADOS, convidadoId, c => ({
    ...c,
    checkedIn: true,
    checkedInEm: now,
    checkedInPorNome: porteiroNome,
  }));
  await addToSyncQueue({
    type: 'CHECKIN_LISTA',
    eventoId,
    payload: { listaId, convidadoId, porteiroNome: porteiroNome ?? '' },
    timestamp: now,
    retries: 0,
  });
}

// ── Lotes/Variações (Caixa) ─────────────────────────────────────────────────

export const cacheLotesVariacoes = (eventoId: string, lotes: CachedLoteVariacao[]) =>
  cacheByEvento(STORE_LOTES, eventoId, lotes);

export const getCachedLotesVariacoes = (eventoId: string) => getByEvento<CachedLoteVariacao>(STORE_LOTES, eventoId);

export async function incrementVendidoLocal(variacaoId: string): Promise<void> {
  await updateItem<CachedLoteVariacao>(STORE_LOTES, variacaoId, l => ({
    ...l,
    vendidosLocal: l.vendidosLocal + 1,
  }));
}

// ── Sync Queue (unificada) ───────────────────────────────────────────────────

export async function addToSyncQueue(item: Omit<SyncQueueItem, 'id'>): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_SYNC, 'readwrite');
  tx.objectStore(STORE_SYNC).add(item);
  await txComplete(tx);
  db.close();
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await openDB();
  const tx = db.transaction(STORE_SYNC, 'readonly');
  const store = tx.objectStore(STORE_SYNC);
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => {
      db.close();
      resolve(req.result as SyncQueueItem[]);
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

export async function removeSyncItem(id: number): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_SYNC, 'readwrite');
  tx.objectStore(STORE_SYNC).delete(id);
  await txComplete(tx);
  db.close();
}

export async function getSyncQueueCount(): Promise<number> {
  const db = await openDB();
  const tx = db.transaction(STORE_SYNC, 'readonly');
  const store = tx.objectStore(STORE_SYNC);
  return new Promise((resolve, reject) => {
    const req = store.count();
    req.onsuccess = () => {
      db.close();
      resolve(req.result);
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}
