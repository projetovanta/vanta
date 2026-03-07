import type { RegraLista } from '../../../../types';

import { todayBR } from '../../../../utils';

export const TODAY_STR = todayBR();

export const formatData = (dataStr: string): string => {
  const [y, m, d] = dataStr.split('-');
  return `${d}/${m}/${y}`;
};

export const isRegraAbobora = (regra: RegraLista): boolean => {
  if (regra.valor && regra.valor > 0) return true;
  if (regra.horaCorte) {
    const [hh, mm] = regra.horaCorte.split(':').map(Number);
    const now = new Date();
    const corte = new Date();
    corte.setHours(hh, mm, 0, 0);
    if (now >= corte) return true;
  }
  return false;
};

export { inputCls } from '../../../../constants';

export type RoleListaNova = 'gerente' | 'promoter' | 'portaria_lista' | 'portaria_antecipado';
