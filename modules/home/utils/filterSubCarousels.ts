/**
 * Regras de relevância para sub-carrosséis na Home.
 *
 * - Mínimo dinâmico: totalEventos <15 → min 2, <30 → min 3, ≥30 → min 5
 * - Máximo 4 sub-carrosséis por grupo (top 4 por quantidade de itens)
 */

const MAX_SUB_CAROUSELS = 4;

function getMinItems(totalEventos: number): number {
  if (totalEventos < 15) return 2;
  if (totalEventos < 30) return 3;
  return 5;
}

export interface SubGroup<T> {
  label: string;
  items: T[];
}

/** Filtra e ordena sub-grupos: remove os com poucos itens, pega top 4 por tamanho */
export function filterTopGroups<T>(groups: SubGroup<T>[], totalEventos: number): SubGroup<T>[] {
  const min = getMinItems(totalEventos);
  return groups
    .filter(g => g.items.length >= min)
    .sort((a, b) => b.items.length - a.items.length)
    .slice(0, MAX_SUB_CAROUSELS);
}
