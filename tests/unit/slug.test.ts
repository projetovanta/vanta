import { describe, it, expect } from 'vitest';
import { generateSlug } from '../../utils/slug';

describe('generateSlug', () => {
  it('converte texto simples para slug', () => {
    expect(generateSlug('Meu Evento')).toBe('meu-evento');
  });

  it('remove acentos', () => {
    expect(generateSlug('São Paulo é ótimo')).toBe('sao-paulo-e-otimo');
  });

  it('remove caracteres especiais', () => {
    expect(generateSlug('Festa @#$ Top!')).toBe('festa-top');
  });

  it('remove hifens do inicio e fim', () => {
    expect(generateSlug('---teste---')).toBe('teste');
  });

  it('converte multiplos espacos em um unico hifen', () => {
    expect(generateSlug('muitos    espacos   aqui')).toBe('muitos-espacos-aqui');
  });

  it('string vazia retorna vazia', () => {
    expect(generateSlug('')).toBe('');
  });

  it('preserva numeros', () => {
    expect(generateSlug('Evento 2026 VIP')).toBe('evento-2026-vip');
  });

  it('trata emojis e unicode', () => {
    const result = generateSlug('Festa 🎉 Top');
    expect(result).toBe('festa-top');
  });

  it('trata cedilha e til', () => {
    expect(generateSlug('Ação Verão Coração')).toBe('acao-verao-coracao');
  });
});
