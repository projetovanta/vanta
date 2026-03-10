/**
 * clubeReservasService — STUB
 * reservas_mais_vanta foi dropada.
 * Exports mantidos como stubs para não quebrar consumers.
 * TODO: reimplementar sobre mais_vanta_lotes_evento na Fase 2.
 */
import type { ReservaMaisVanta } from '../../../../types';

/** @deprecated */
export function getReservasUsuario(_userId: string): ReservaMaisVanta[] {
  return [];
}

/** @deprecated */
export function getReservasEvento(_eventoId: string): ReservaMaisVanta[] {
  return [];
}

/** @deprecated */
export function getReservasPendentePost(): ReservaMaisVanta[] {
  return [];
}

/** @deprecated */
export async function reservar(_loteId: string, _eventoId: string, _userId: string): Promise<ReservaMaisVanta | null> {
  return null;
}

/** @deprecated */
export async function cancelarReserva(_reservaId: string): Promise<boolean> {
  return false;
}

/** @deprecated */
export async function confirmarPost(_reservaId: string, _postUrl: string): Promise<void> {}

/** @deprecated */
export async function verificarPost(_reservaId: string, _masterId: string): Promise<void> {}

/** @deprecated */
export function getEventosComBeneficio(_userId: string): string[] {
  return [];
}

/** @deprecated */
export function temBeneficio(_eventoId: string): boolean {
  return false;
}
