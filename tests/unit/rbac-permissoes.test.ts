import { describe, it, expect } from 'vitest';
import {
  CARGO_LABELS,
  CARGO_PERMISSOES,
  CARGO_TO_PORTAL,
  CARGO_DESCRICOES,
} from '../../features/admin/services/rbacService';

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

describe('RBAC — integridade dos mappings', () => {
  it('todos os cargos tem label, descricao, portal role e permissoes', () => {
    for (const cargo of ALL_CARGOS) {
      expect(CARGO_LABELS[cargo]).toBeTruthy();
      expect(CARGO_DESCRICOES[cargo]).toBeTruthy();
      expect(CARGO_TO_PORTAL[cargo]).toBeTruthy();
      expect(Array.isArray(CARGO_PERMISSOES[cargo])).toBe(true);
      expect(CARGO_PERMISSOES[cargo].length).toBeGreaterThan(0);
    }
  });

  it('GERENTE tem todas as permissoes criticas', () => {
    const perms = CARGO_PERMISSOES.GERENTE;
    expect(perms).toContain('VER_FINANCEIRO');
    expect(perms).toContain('GERIR_EQUIPE');
    expect(perms).toContain('GERIR_LISTAS');
    expect(perms).toContain('VALIDAR_QR');
    expect(perms).toContain('VALIDAR_ENTRADA');
  });

  it('SOCIO tem financeiro e equipe mas nao tem QR', () => {
    const perms = CARGO_PERMISSOES.SOCIO;
    expect(perms).toContain('VER_FINANCEIRO');
    expect(perms).toContain('GERIR_EQUIPE');
    expect(perms).not.toContain('VALIDAR_QR');
  });

  it('PROMOTER so tem INSERIR_LISTA', () => {
    expect(CARGO_PERMISSOES.PROMOTER).toEqual(['INSERIR_LISTA']);
  });

  it('CAIXA so tem VENDER_PORTA', () => {
    expect(CARGO_PERMISSOES.CAIXA).toEqual(['VENDER_PORTA']);
  });

  it('PORTARIA_LISTA tem CHECKIN_LISTA mas nao tem financeiro', () => {
    const perms = CARGO_PERMISSOES.PORTARIA_LISTA;
    expect(perms).toContain('CHECKIN_LISTA');
    expect(perms).not.toContain('VER_FINANCEIRO');
  });

  it('PORTARIA_ANTECIPADO tem VALIDAR_QR mas nao tem financeiro', () => {
    const perms = CARGO_PERMISSOES.PORTARIA_ANTECIPADO;
    expect(perms).toContain('VALIDAR_QR');
    expect(perms).not.toContain('VER_FINANCEIRO');
  });

  it('gerentes de portaria tem GERIR_EQUIPE (podem coordenar)', () => {
    expect(CARGO_PERMISSOES.GER_PORTARIA_LISTA).toContain('GERIR_EQUIPE');
    expect(CARGO_PERMISSOES.GER_PORTARIA_ANTECIPADO).toContain('GERIR_EQUIPE');
  });

  it('nenhum cargo tem permissoes duplicadas', () => {
    for (const cargo of ALL_CARGOS) {
      const perms = CARGO_PERMISSOES[cargo];
      const unique = new Set(perms);
      expect(unique.size).toBe(perms.length);
    }
  });

  it('portal roles tem prefixo vanta_', () => {
    for (const cargo of ALL_CARGOS) {
      expect(CARGO_TO_PORTAL[cargo]).toMatch(/^vanta_/);
    }
  });
});
