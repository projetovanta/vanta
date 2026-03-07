/**
 * vantaService — singleton que expõe a implementação ativa de IVantaService.
 *
 * A UI importa apenas `vantaService` e os tipos de `IVantaService.ts`.
 * Implementação: SupabaseVantaService → eventosAdminService/listasService → Supabase.
 */

import { SupabaseVantaService } from './supabaseVantaService';
import {
  IVantaService,
  RegistrarVendaInput,
  RegistrarVendaResult,
  ValidarIngressoInput,
  ValidarIngressoResult,
  SolicitarSaqueInput,
  SolicitarSaqueResult,
  AdicionarNomesResult,
} from '../features/admin/services/IVantaService';
import {
  SolicitacaoSaque,
  SaldoFinanceiro,
  VendaLog,
  TicketCaixa,
} from '../features/admin/services/eventosAdminService';

// ── Singleton ─────────────────────────────────────────────────────────────────

export const vantaService: IVantaService = new SupabaseVantaService();
export type {
  IVantaService,
  RegistrarVendaInput,
  RegistrarVendaResult,
  ValidarIngressoInput,
  ValidarIngressoResult,
  SolicitarSaqueInput,
  SolicitarSaqueResult,
  AdicionarNomesResult,
  SolicitacaoSaque,
  SaldoFinanceiro,
  VendaLog,
  TicketCaixa,
};
