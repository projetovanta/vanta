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

/** Valida nome completo: mínimo 2 palavras reais, sem padrões fake */
export const isValidNome = (nome: string): { ok: boolean; erro?: string } => {
  const trimmed = nome.trim();
  const words = trimmed.split(/\s+/).filter(w => w.length >= 2);
  if (words.length < 2) return { ok: false, erro: 'Informe nome e sobrenome' };
  // Bloqueia sequências sem vogais (ex: "uigaIUGA", "xzxzxz", "bbbbb")
  const vowels = /[aeiouáéíóúâêîôûãõ]/i;
  for (const w of words) {
    if (!vowels.test(w)) return { ok: false, erro: 'Nome parece inválido' };
  }
  // Bloqueia caracteres repetidos demais (ex: "aaaa", "Jooooao")
  if (/(.)\1{3,}/i.test(trimmed)) return { ok: false, erro: 'Nome parece inválido' };
  // Bloqueia se tem números
  if (/\d/.test(trimmed)) return { ok: false, erro: 'Nome não pode ter números' };
  // Bloqueia se tem caracteres especiais (exceto acentos, espaço, apóstrofo, hífen)
  if (/[^a-záàâãéèêíïóôõúüçñ'\-\s]/i.test(trimmed)) return { ok: false, erro: 'Nome contém caracteres inválidos' };
  return { ok: true };
};

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

export const fmtCPF = (raw: string): string => {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length > 9) return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6, 9) + '-' + d.slice(9);
  if (d.length > 6) return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6);
  if (d.length > 3) return d.slice(0, 3) + '.' + d.slice(3);
  return d;
};

export const isValidCPF = (cpf: string): boolean => {
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  if (rest !== parseInt(d[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  return rest === parseInt(d[10]);
};
