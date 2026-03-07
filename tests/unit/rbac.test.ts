import { describe, it, expect } from 'vitest';
import { CARGO_LABELS, CARGO_PERMISSOES, CARGO_TO_PORTAL } from '../../features/admin/services/rbacService';

const ALL_CARGOS = [
  'GERENTE',
  'SOCIO',
  'PROMOTER',
  'GER_PORTARIA_LISTA',
  'PORTARIA_LISTA',
  'GER_PORTARIA_ANTECIPADO',
  'PORTARIA_ANTECIPADO',
  'CAIXA',
] as const;

describe('RBAC — mappings estaticos', () => {
  it('todos os cargos tem label', () => {
    for (const cargo of ALL_CARGOS) {
      expect(CARGO_LABELS[cargo]).toBeTruthy();
    }
  });

  it('todos os cargos tem portal role', () => {
    for (const cargo of ALL_CARGOS) {
      expect(CARGO_TO_PORTAL[cargo]).toBeTruthy();
    }
  });

  it('todos os cargos tem permissoes definidas', () => {
    for (const cargo of ALL_CARGOS) {
      expect(Array.isArray(CARGO_PERMISSOES[cargo])).toBe(true);
    }
  });

  it('GERENTE tem VER_FINANCEIRO e GERIR_EQUIPE', () => {
    expect(CARGO_PERMISSOES.GERENTE).toContain('VER_FINANCEIRO');
    expect(CARGO_PERMISSOES.GERENTE).toContain('GERIR_EQUIPE');
  });

  it('SOCIO tem VER_FINANCEIRO', () => {
    expect(CARGO_PERMISSOES.SOCIO).toContain('VER_FINANCEIRO');
  });

  it('PROMOTER tem INSERIR_LISTA, mas NAO tem GERIR_LISTAS nem VER_FINANCEIRO', () => {
    expect(CARGO_PERMISSOES.PROMOTER).toContain('INSERIR_LISTA');
    expect(CARGO_PERMISSOES.PROMOTER).not.toContain('GERIR_LISTAS');
    expect(CARGO_PERMISSOES.PROMOTER).not.toContain('VER_FINANCEIRO');
  });

  it('PORTARIA_LISTA tem CHECKIN_LISTA, mas NAO tem VER_FINANCEIRO', () => {
    expect(CARGO_PERMISSOES.PORTARIA_LISTA).toContain('CHECKIN_LISTA');
    expect(CARGO_PERMISSOES.PORTARIA_LISTA).not.toContain('VER_FINANCEIRO');
  });

  it('PORTARIA_ANTECIPADO tem VALIDAR_QR, mas NAO tem GERIR_LISTAS', () => {
    expect(CARGO_PERMISSOES.PORTARIA_ANTECIPADO).toContain('VALIDAR_QR');
    expect(CARGO_PERMISSOES.PORTARIA_ANTECIPADO).not.toContain('GERIR_LISTAS');
  });

  it('CAIXA tem VENDER_PORTA, mas NAO tem GERIR_EQUIPE', () => {
    expect(CARGO_PERMISSOES.CAIXA).toContain('VENDER_PORTA');
    expect(CARGO_PERMISSOES.CAIXA).not.toContain('GERIR_EQUIPE');
  });

  it('GER_PORTARIA_LISTA tem CHECKIN_LISTA e GERIR_EQUIPE', () => {
    expect(CARGO_PERMISSOES.GER_PORTARIA_LISTA).toContain('CHECKIN_LISTA');
    expect(CARGO_PERMISSOES.GER_PORTARIA_LISTA).toContain('GERIR_EQUIPE');
  });

  it('GER_PORTARIA_ANTECIPADO tem VALIDAR_QR e GERIR_EQUIPE', () => {
    expect(CARGO_PERMISSOES.GER_PORTARIA_ANTECIPADO).toContain('VALIDAR_QR');
    expect(CARGO_PERMISSOES.GER_PORTARIA_ANTECIPADO).toContain('GERIR_EQUIPE');
  });

  it('nenhum cargo tem permissao vazia', () => {
    for (const cargo of ALL_CARGOS) {
      expect(CARGO_PERMISSOES[cargo].length).toBeGreaterThan(0);
    }
  });
});
