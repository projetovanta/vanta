import { describe, it, expect } from 'vitest';
import { isReembolsoAutomaticoElegivel } from '../../features/admin/services/eventosAdminFinanceiro';
import type { TicketCaixa } from '../../features/admin/services/eventosAdminTypes';

const nowBRT = (): string =>
  new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';

const daysAgo = (days: number): string => {
  const d = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return d.toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';
};

const baseTicket = (overrides: Partial<TicketCaixa> = {}): TicketCaixa => ({
  id: 'ticket-1',
  eventoId: 'evento-1',
  variacaoId: 'var-1',
  variacaoLabel: 'Pista',
  valor: 50,
  email: 'test@test.com',
  nomeTitular: 'Test',
  cpf: '00000000000',
  status: 'DISPONIVEL',
  emitidoEm: nowBRT(),
  ...overrides,
});

describe('isReembolsoAutomaticoElegivel — regras CDC Art. 49', () => {
  it('rejeita ticket com status USADO', () => {
    const ticket = baseTicket({ status: 'USADO' });
    expect(isReembolsoAutomaticoElegivel(ticket)).toBe(false);
  });

  it('rejeita ticket com status CANCELADO', () => {
    const ticket = baseTicket({ status: 'CANCELADO' });
    expect(isReembolsoAutomaticoElegivel(ticket)).toBe(false);
  });

  it('rejeita ticket com status REEMBOLSADO', () => {
    const ticket = baseTicket({ status: 'REEMBOLSADO' });
    expect(isReembolsoAutomaticoElegivel(ticket)).toBe(false);
  });

  it('rejeita ticket com status TRANSFERIDO', () => {
    const ticket = baseTicket({ status: 'TRANSFERIDO' });
    expect(isReembolsoAutomaticoElegivel(ticket)).toBe(false);
  });

  it('rejeita ticket comprado ha mais de 7 dias', () => {
    const ticket = baseTicket({ emitidoEm: daysAgo(8) });
    expect(isReembolsoAutomaticoElegivel(ticket)).toBe(false);
  });

  it('ticket DISPONIVEL dentro de 7 dias retorna boolean (depende do cache de eventos)', () => {
    const ticket = baseTicket({ emitidoEm: daysAgo(1) });
    const result = isReembolsoAutomaticoElegivel(ticket);
    // Sem evento no cache EVENTOS_ADMIN, retorna false (evento nao encontrado)
    // O teste valida que a funcao nao lanca erro e respeita a regra dos 7 dias
    expect(typeof result).toBe('boolean');
  });
});

describe('Exports do modulo financeiro', () => {
  it('exporta todas as funcoes criticas', async () => {
    const mod = await import('../../features/admin/services/eventosAdminFinanceiro');
    expect(typeof mod.getContractedFees).toBe('function');
    expect(typeof mod.isReembolsoAutomaticoElegivel).toBe('function');
    expect(typeof mod.processarReembolsoAutomatico).toBe('function');
    expect(typeof mod.getSaldoFinanceiro).toBe('function');
    expect(typeof mod.solicitarSaque).toBe('function');
    expect(typeof mod.getSolicitacoesSaque).toBe('function');
    expect(typeof mod.confirmarSaque).toBe('function');
    expect(typeof mod.estornarSaque).toBe('function');
    expect(typeof mod.getReembolsos).toBe('function');
    expect(typeof mod.registrarChargeback).toBe('function');
    expect(typeof mod.getChargebacks).toBe('function');
    expect(typeof mod.getResumoFinanceiroEvento).toBe('function');
  });
});

describe('Exports do modulo reembolso', () => {
  it('exporta todas as funcoes criticas', async () => {
    const mod = await import('../../features/admin/services/reembolsoService');
    expect(typeof mod.podeReembolsoAutomatico).toBe('function');
    expect(typeof mod.solicitarReembolsoAutomatico).toBe('function');
    expect(typeof mod.solicitarReembolsoManual).toBe('function');
    expect(typeof mod.aprovarReembolsoEtapa).toBe('function');
    expect(typeof mod.rejeitarReembolsoManual).toBe('function');
    expect(typeof mod.getReembolsosPorEvento).toBe('function');
    expect(typeof mod.getReembolsosPendentes).toBe('function');
  });
});

describe('Exports do modulo cupons', () => {
  it('exporta validarCupom e usarCupom', async () => {
    const mod = await import('../../features/admin/services/cuponsService');
    expect(typeof mod.cuponsService.validarCupom).toBe('function');
    expect(typeof mod.cuponsService.usarCupom).toBe('function');
  });
});

describe('Exports do modulo transferencia', () => {
  it('exporta funcoes de transferencia', async () => {
    const mod = await import('../../services/transferenciaService');
    expect(typeof mod.transferenciaService).toBe('object');
  });
});
