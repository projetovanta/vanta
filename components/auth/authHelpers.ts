export { inputCls } from '../../constants';

export const isValidDate = (d: string): boolean => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(d)) return false;
  const [day, month, year] = d.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

export const isAdult = (d: string): boolean => {
  if (!isValidDate(d)) return false;
  const [day, month, year] = d.split('/').map(Number);
  const birth = new Date(year, month - 1, day);
  const today = new Date();
  const age =
    today.getFullYear() -
    birth.getFullYear() -
    (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
  return age >= 16;
};

export const isValidEmail = (e: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export const fmtDataNasc = (raw: string): string => {
  const d = raw.replace(/\D/g, '').slice(0, 8);
  if (d.length >= 5) return d.slice(0, 2) + '/' + d.slice(2, 4) + '/' + d.slice(4);
  if (d.length >= 3) return d.slice(0, 2) + '/' + d.slice(2);
  return d;
};

export const fmtTelefone = (raw: string): string => {
  const d = raw.replace(/\D/g, '').slice(0, 9);
  if (d.length > 5) return d.slice(0, 5) + '-' + d.slice(5);
  return d;
};
