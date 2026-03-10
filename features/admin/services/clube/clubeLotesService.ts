/**
 * clubeLotesService — STUB
 * lotes_mais_vanta foi dropada e substituída por mais_vanta_lotes_evento.
 * Exports mantidos como stubs para não quebrar consumers.
 * TODO: reimplementar sobre mais_vanta_lotes_evento na Fase 2.
 */
import type { LoteMaisVanta } from '../../../../types';

/** @deprecated */
export function getLoteMaisVanta(_eventoId: string): LoteMaisVanta | null {
  return null;
}

/** @deprecated */
export function getLotesEvento(_eventoId: string): LoteMaisVanta[] {
  return [];
}

/** @deprecated */
export function getLoteParaTier(_eventoId: string, _userId: string): LoteMaisVanta | null {
  return null;
}

/** @deprecated */
export function getAllLotes(): LoteMaisVanta[] {
  return [];
}

/** @deprecated */
export async function upsertLotesMaisVanta(
  _eventoId: string,
  _lotes: Array<Omit<LoteMaisVanta, 'id' | 'eventoId' | 'reservados'>>,
): Promise<LoteMaisVanta[]> {
  return [];
}

/** @deprecated */
export async function upsertLoteMaisVanta(
  _eventoId: string,
  _lote: Omit<LoteMaisVanta, 'id' | 'eventoId' | 'reservados'>,
): Promise<LoteMaisVanta> {
  throw new Error('lotes_mais_vanta foi substituída por mais_vanta_lotes_evento');
}

/** @deprecated */
export async function removeLotesMaisVanta(_eventoId: string): Promise<void> {}

/** @deprecated */
export async function removeLoteMaisVanta(_eventoId: string): Promise<void> {}
