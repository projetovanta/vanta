/**
 * IVantaService — contrato público da camada de dados VANTA.
 *
 * Qualquer implementação (SupabaseVantaService) deve satisfazer esta
 * interface. A UI nunca importa implementações diretamente.
 *
 * Regras de taxa:
 *   valorLiquido = valor × (1 − (taxaOverride || VANTA_FEE))
 *   VANTA_FEE = 0.05 (5%) — constante padrão
 *
 * Vínculo de produtor:
 *   Toda venda persiste `produtorId` derivado de EventoAdmin.equipe
 *   (papel SOCIO do evento). Nunca depende de parâmetro externo.
 */

import { TicketCaixa, ValidacaoIngresso, SolicitacaoSaque, SaldoFinanceiro, VendaLog } from './eventosAdminService';
import { Evento, ListaEvento } from '../../../types';

// ── I/O types ────────────────────────────────────────────────────────────────

export interface RegistrarVendaInput {
  eventoId: string;
  loteId: string;
  variacaoId: string;
  email: string;
}

export interface RegistrarVendaResult {
  ok: boolean;
  ticketId: string;
  produtorId: string; // ID do SOCIO do evento — para rastreabilidade financeira
  erro?: string;
}

export interface ValidarIngressoInput {
  ticketId: string;
  eventoId: string;
}

export interface ValidarIngressoResult {
  resultado: ValidacaoIngresso;
  ticket?: TicketCaixa;
}

export interface SolicitarSaqueInput {
  produtorId: string;
  produtorNome: string;
  eventoId: string;
  eventoNome: string;
  valor: number; // valor bruto solicitado
  pixTipo: string;
  pixChave: string;
}

export interface SolicitarSaqueResult {
  ok: boolean;
  saqueId: string;
  valorLiquido: number; // valor × (1 − taxa)
  valorTaxa: number; // valor × taxa
  taxaAplicada: number; // taxa efetiva (override ou VANTA_FEE)
  erro?: string;
}

// ── Checkout público ──────────────────────────────────────────────────────────

export interface CheckoutInput {
  eventoId: string;
  loteId: string;
  variacaoId: string;
  quantidade: number;
  email: string;
  valorUnit: number; // valor unitário — necessário para eventos sem EventoAdmin
  compradorId?: string; // userId do comprador logado (owner_id no Supabase)
}

export interface CheckoutResult {
  ok: boolean;
  tickets: Array<{ ticketId: string }>;
  totalBruto: number;
  totalLiquido: number;
  taxaAplicada: number;
  erro?: string;
}

// ── Carteira do usuário ───────────────────────────────────────────────────────

/**
 * Ticket enriquecido com dados do evento — retornado por getMyTickets().
 * Supabase: JOIN tickets_caixa ⇔ eventos_admin.
 */
export interface MyTicket {
  id: string;
  eventoId: string;
  eventoNome: string;
  eventoDataInicio: string; // ISO 8601
  eventoDataFim?: string; // ISO 8601
  eventoLocal: string;
  eventoImagem?: string;
  variacaoLabel: string;
  valor: number;
  email: string;
  nomeTitular: string;
  cpf: string;
  status: 'DISPONIVEL' | 'USADO' | 'CANCELADO' | 'TRANSFERIDO' | 'EXPIRADO' | 'REEMBOLSADO';
  emitidoEm: string; // ISO 8601
  usadoEm?: string; // ISO 8601
}

// ── Guestlist ─────────────────────────────────────────────────────────────────

export interface AdicionarNomesResult {
  ok: boolean;
  adicionados: number; // quantos nomes foram inseridos com sucesso
  erro?: string;
}

// ── Interface de contrato ────────────────────────────────────────────────────

export interface IVantaService {
  /**
   * Registra venda de ingresso na porta.
   * Persiste produtorId derivado do equipe do evento (papel SOCIO).
   * Salva ticket no localStorage via saveTicketsToLS.
   */
  registrarVenda(input: RegistrarVendaInput): Promise<RegistrarVendaResult>;

  /**
   * Valida e queima um ingresso atomicamente.
   * Imutável: status USADO nunca reverte.
   */
  validarIngresso(input: ValidarIngressoInput): Promise<ValidarIngressoResult>;

  /**
   * Solicita saque para o produtor.
   * Aplica taxaOverride do evento ou VANTA_FEE (0.05) como fallback.
   */
  solicitarSaque(input: SolicitarSaqueInput): Promise<SolicitarSaqueResult>;

  getSaldoFinanceiro(produtorId: string): Promise<SaldoFinanceiro>;
  getVendasLog(eventoId: string): Promise<VendaLog[]>;
  getSaquesByProdutor(produtorId: string): Promise<SolicitacaoSaque[]>;
  confirmarSaque(saqueId: string, operadorId?: string, comprovanteFile?: File): Promise<void>;
  uploadComprovanteSaque(saqueId: string, file: File): Promise<string>;
  estornarSaque(saqueId: string, operadorId?: string): Promise<void>;
  getTicketsByEvento(eventoId: string): Promise<TicketCaixa[]>;

  /**
   * Retorna eventos públicos para o Radar.
   * Supabase: publicado=true + data_inicio >= now().
   * Fallback: [] quando banco inacessível.
   */
  getEventos(): Promise<Evento[]>;

  /** Versão paginada de getEventos. */
  getEventosPaginated(from: number, to: number): Promise<Evento[]>;

  /** Busca um evento por ID (para notificações quando não está no cache). */
  getEventoById(id: string): Promise<Evento | null>;

  /** Busca eventos por região geográfica (Haversine server-side). */
  getEventosPorRegiao(lat: number, lng: number, raioKm?: number): Promise<Evento[]>;

  /** Busca server-side de eventos por nome/local/cidade. */
  searchEventos(query: string, limit?: number): Promise<Evento[]>;

  /**
   * Processa compra de ingressos no checkout público.
   * Ação atômica: INSERT transactions + INSERT tickets_caixa (owner_id = compradorId).
   * Fórmula: totalLiquido = totalBruto × (1 − taxaAplicada)
   */
  processarCompra(input: CheckoutInput): Promise<CheckoutResult>;

  /**
   * Retorna os ingressos do usuário logado.
   * Supabase: tickets_caixa WHERE owner_id = userId JOIN eventos_admin(nome, data_inicio, local).
   */
  getMyTickets(userId: string): Promise<MyTicket[]>;

  /**
   * Retorna as listas de um evento acessíveis ao promoter/admin.
   * Supabase: listas_evento WHERE evento_id = eventoId E (inserido_por = userId OR role = masteradm).
   */
  getMinhasListas(eventoId: string, userId: string): Promise<ListaEvento[]>;

  /**
   * Insere múltiplos nomes em uma lista de forma atômica.
   * Nomes são recebidos como array (um por item), sem RG/CPF.
   * Supabase: batch INSERT em convidados_lista.
   */
  adicionarNomesLista(
    listaId: string,
    regraId: string,
    nomes: string[],
    promoterId: string,
  ): Promise<AdicionarNomesResult>;

  /**
   * Marca um convidado como presente (check-in).
   * Supabase: UPDATE convidados_lista SET checked_in=true, checked_in_em=now() WHERE id=convidadoId.
   */
  checkinLista(
    convidadoId: string,
    porteiroNome?: string,
  ): Promise<{ ok: boolean; checkedInEm?: string; abobora?: boolean; bloqueado?: boolean; horaCorte?: string }>;

  /**
   * Atualiza nome e CPF do titular de um ingresso.
   * Supabase: UPDATE tickets_caixa SET nome_titular, cpf WHERE id = ticketId AND owner_id = userId.
   */
  updateTicketTitular(ticketId: string, nomeTitular: string, cpf: string): Promise<{ ok: boolean; erro?: string }>;
}
