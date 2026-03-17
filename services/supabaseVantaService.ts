/**
 * SupabaseVantaService — implementação Supabase de IVantaService.
 *
 * Delega para eventosAdminService / listasService / rbacService,
 * que já fazem queries Supabase reais. Zero mock intermediário.
 *
 * Fórmula de lucro líquido (invariante):
 *   valorLiquido = valor × (1 − taxa)   onde taxa = taxaOverride ?? VANTA_FEE (0.05)
 */

import { supabase } from './supabaseClient';
import {
  IVantaService,
  RegistrarVendaInput,
  RegistrarVendaResult,
  ValidarIngressoInput,
  ValidarIngressoResult,
  SolicitarSaqueInput,
  SolicitarSaqueResult,
  CheckoutInput,
  CheckoutResult,
  MyTicket,
  AdicionarNomesResult,
} from '../features/admin/services/IVantaService';
import {
  SolicitacaoSaque,
  SaldoFinanceiro,
  VendaLog,
  TicketCaixa,
  VANTA_FEE,
} from '../features/admin/services/eventosAdminService';
import { eventosAdminService } from '../features/admin/services/eventosAdminService';
import { Evento, Categoria, ListaEvento } from '../types';
import { tsBR } from '../utils';
import { clubeService } from '../features/admin/services/clubeService';

// Lazy import para evitar ciclo de inicialização entre services
const getRbacService = async () => {
  const { rbacService } = await import('../features/admin/services/rbacService');
  return rbacService;
};

const getListasService = async () => {
  const { listasService } = await import('../features/admin/services/listasService');
  return listasService;
};

export class SupabaseVantaService implements IVantaService {
  // ── registrarVenda ──────────────────────────────────────────────────────────
  async registrarVenda(input: RegistrarVendaInput): Promise<RegistrarVendaResult> {
    const ticketId = await eventosAdminService.registrarVendaEfetiva(
      input.eventoId,
      input.loteId,
      input.variacaoId,
      input.email,
    );
    if (!ticketId) {
      return { ok: false, ticketId: '', produtorId: '', erro: 'Evento, lote ou variação inválidos.' };
    }
    const rbac = await getRbacService();
    const produtorId = rbac.getAtribuicoesTenant('EVENTO', input.eventoId).find(a => a.cargo === 'SOCIO')?.userId ?? '';
    return { ok: true, ticketId, produtorId };
  }

  // ── validarIngresso ─────────────────────────────────────────────────────────
  async validarIngresso(input: ValidarIngressoInput): Promise<ValidarIngressoResult> {
    return eventosAdminService.validarEQueimarIngresso(input.ticketId, input.eventoId);
  }

  // ── solicitarSaque ──────────────────────────────────────────────────────────
  async solicitarSaque(input: SolicitarSaqueInput): Promise<SolicitarSaqueResult> {
    const ev = eventosAdminService.getEvento(input.eventoId);
    const taxaAplicada = ev?.taxaOverride ?? VANTA_FEE;
    const valorLiquido = Math.round(input.valor * (1 - taxaAplicada) * 100) / 100;
    const valorTaxa = Math.round(input.valor * taxaAplicada * 100) / 100;
    const saqueId = await eventosAdminService.solicitarSaque(input);
    return { ok: true, saqueId, valorLiquido, valorTaxa, taxaAplicada };
  }

  // ── getSaldoFinanceiro ──────────────────────────────────────────────────────
  async getSaldoFinanceiro(produtorId: string): Promise<SaldoFinanceiro> {
    return eventosAdminService.getSaldoFinanceiro(produtorId);
  }

  // ── getVendasLog ────────────────────────────────────────────────────────────
  async getVendasLog(eventoId: string): Promise<VendaLog[]> {
    return eventosAdminService.getVendasLog(eventoId);
  }

  // ── getSaquesByProdutor ─────────────────────────────────────────────────────
  async getSaquesByProdutor(produtorId: string): Promise<SolicitacaoSaque[]> {
    return eventosAdminService.getSaquesByProdutor(produtorId);
  }

  // ── confirmarSaque ──────────────────────────────────────────────────────────
  async confirmarSaque(saqueId: string, operadorId?: string, comprovanteFile?: File): Promise<void> {
    await eventosAdminService.confirmarSaque(saqueId, operadorId, comprovanteFile);
  }

  // ── uploadComprovanteSaque ─────────────────────────────────────────────────
  async uploadComprovanteSaque(saqueId: string, file: File): Promise<string> {
    return eventosAdminService.uploadComprovanteSaque(saqueId, file);
  }

  // ── estornarSaque ───────────────────────────────────────────────────────────
  async estornarSaque(saqueId: string, operadorId?: string): Promise<void> {
    await eventosAdminService.estornarSaque(saqueId, operadorId);
  }

  // ── getTicketsByEvento ──────────────────────────────────────────────────────
  async getTicketsByEvento(eventoId: string): Promise<TicketCaixa[]> {
    return eventosAdminService.getTicketsCaixaByEvento(eventoId);
  }

  // ── getEventos ──────────────────────────────────────────────────────────────
  /**
   * Busca eventos públicos para o Radar.
   *   - Filtra: publicado = true  +  data_inicio >= now (UTC)
   *   - Mapeia colunas do banco → interface Evento (labels amigáveis, coords JSONB)
   *   - Fallback: [] quando banco vazio ou inacessível
   */
  async getEventos(): Promise<Evento[]> {
    try {
      const now = tsBR();
      const { data, error } = await supabase
        .from('eventos_admin')
        .select(
          'id, slug, nome, descricao, data_inicio, data_fim, local, endereco, cidade, foto, formato, estilos, experiencias, categoria, subcategorias, coords, comunidade_id, venda_vanta, link_externo, comunidades(id, nome, foto, cidade, endereco), lotes(id, nome, ativo, variacoes_ingresso(valor))',
        )
        .eq('publicado', true)
        .gte('data_inicio', now)
        .order('data_inicio', { ascending: true })
        .limit(1000);

      if (error || !data || data.length === 0) {
        return [];
      }

      return this._mapEventos(data);
    } catch {
      return [];
    }
  }

  /** Mapeia rows brutos do Supabase → interface Evento */
  _mapEventos(data: any[]): Evento[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return data.map(row => {
      const dataInicio = new Date(row.data_inicio);
      const eventDay = new Date(dataInicio);
      eventDay.setHours(0, 0, 0, 0);

      let dataLabel: string;
      if (eventDay.getTime() === today.getTime()) dataLabel = 'Hoje';
      else if (eventDay.getTime() === tomorrow.getTime()) dataLabel = 'Amanhã';
      else dataLabel = eventDay.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');

      const dataReal = dataInicio.toISOString().split('T')[0];
      const horario = dataInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const horarioFim = row.data_fim
        ? new Date(row.data_fim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        : undefined;

      const id = row.id;
      const nome = row.nome;
      const foto = row.foto ?? undefined;
      const descr = row.descricao ?? '';
      const comunidadeId = row.comunidade_id ?? undefined;
      const comData = row.comunidades as {
        id: string;
        nome: string;
        foto: string;
        cidade: string;
        endereco: string;
      } | null;

      // Herdar local/endereco/cidade da comunidade se o evento não tiver próprio
      const local = row.local || comData?.nome || '';
      const cidade = row.cidade || comData?.cidade || '';
      const enderecoVal = row.endereco || comData?.endereco || undefined;

      return {
        id,
        titulo: nome,
        descricao: descr,
        data: dataLabel,
        dataReal,
        horario,
        horarioFim,
        local,
        cidade,
        coords: row.coords ?? undefined,
        lotes: (row.lotes ?? [])
          .filter((l: any) => l.ativo !== false)
          .flatMap((l: any) => {
            const vars = l.variacoes_ingresso ?? [];
            if (vars.length === 0) return [];
            const minVal = Math.min(...vars.map((v: any) => Number(v.valor) || 0));
            return [{ nome: l.nome, preco: minVal }];
          }),
        imagem: foto ?? '/icon-192.png',
        formato: row.formato ?? row.categoria ?? 'Festa',
        estilos: row.estilos ?? undefined,
        experiencias: row.experiencias ?? undefined,
        categoria: row.categoria ?? row.formato ?? 'Festa',
        subcategorias: row.subcategorias ?? undefined,
        membrosConfirmados: 0,
        comunidade:
          comunidadeId && comData ? { id: comData.id, nome: comData.nome, foto: comData.foto ?? '' } : undefined,
        endereco: enderecoVal,
        dataInicioISO: row.data_inicio ?? undefined,
        dataFimISO: row.data_fim ?? undefined,
        temBeneficioMaisVanta: clubeService.temBeneficio(id),
        slug: row.slug ?? undefined,
        ocultarValor: row.venda_vanta === false ? true : undefined,
        urlIngressos: row.venda_vanta === false ? (row.link_externo ?? undefined) : undefined,
      } satisfies Evento;
    });
  }

  // ── getEventosPaginated ────────────────────────────────────────────────────
  /**
   * Versão paginada de getEventos. Usa .range(from, to) do Supabase.
   */
  async getEventosPaginated(from: number, to: number): Promise<Evento[]> {
    try {
      const now = tsBR();
      const { data, error } = await supabase
        .from('eventos_admin')
        .select(
          'id, slug, nome, descricao, data_inicio, data_fim, local, endereco, cidade, foto, formato, estilos, experiencias, categoria, subcategorias, coords, comunidade_id, venda_vanta, link_externo, comunidades(id, nome, foto, cidade, endereco), lotes(id, nome, ativo, variacoes_ingresso(valor))',
        )
        .eq('publicado', true)
        .gte('data_inicio', now)
        .order('data_inicio', { ascending: true })
        .range(from, to);

      if (error || !data || data.length === 0) return [];
      return this._mapEventos(data);
    } catch {
      return [];
    }
  }

  // ── getEventoById ─────────────────────────────────────────────────────────
  /**
   * Busca um evento por ID. Usado para abrir detalhe de notificações
   * quando o evento não está no cache local (allEvents).
   */
  async getEventoById(id: string): Promise<Evento | null> {
    try {
      const { data, error } = await supabase
        .from('eventos_admin')
        .select(
          'id, slug, nome, descricao, data_inicio, data_fim, local, endereco, cidade, foto, formato, estilos, experiencias, categoria, subcategorias, coords, comunidade_id, venda_vanta, link_externo, comunidades(id, nome, foto, cidade, endereco), lotes(id, nome, ativo, variacoes_ingresso(valor))',
        )
        .eq('id', id)
        .maybeSingle();

      if (error || !data) return null;
      const mapped = this._mapEventos([data]);
      return mapped[0] ?? null;
    } catch {
      return null;
    }
  }

  // ── searchEventos (server-side) ─────────────────────────────────────────
  /**
   * Busca server-side de eventos por nome/local/cidade com .ilike().
   */
  async searchEventos(query: string, limit = 20): Promise<Evento[]> {
    try {
      const now = tsBR();
      const pattern = `%${query}%`;
      const { data, error } = await supabase
        .from('eventos_admin')
        .select(
          'id, slug, nome, descricao, data_inicio, data_fim, local, endereco, cidade, foto, formato, estilos, experiencias, categoria, subcategorias, coords, comunidade_id, venda_vanta, link_externo, comunidades(id, nome, foto, cidade, endereco), lotes(id, nome, ativo, variacoes_ingresso(valor))',
        )
        .eq('publicado', true)
        .gte('data_inicio', now)
        .or(`nome.ilike.${pattern},local.ilike.${pattern},cidade.ilike.${pattern}`)
        .order('data_inicio', { ascending: true })
        .limit(limit);

      if (error || !data || data.length === 0) return [];
      return this._mapEventos(data);
    } catch {
      return [];
    }
  }

  // ── getEventosPorRegiao (server-side via RPC) ──────────────────────────────
  async getEventosPorRegiao(lat: number, lng: number, raioKm = 50): Promise<Evento[]> {
    try {
      const { data, error } = await supabase.rpc('get_eventos_por_regiao', {
        p_lat: lat,
        p_lng: lng,
        p_raio_km: raioKm,
      });

      if (error || !data || data.length === 0) return [];
      return this._mapEventos(data);
    } catch {
      return [];
    }
  }

  // ── processarCompra ─────────────────────────────────────────────────────────
  async processarCompra(input: CheckoutInput): Promise<CheckoutResult> {
    const ev = eventosAdminService.getEvento(input.eventoId);
    const taxaAplicada = ev?.taxaOverride ?? VANTA_FEE;

    let valorUnit = input.valorUnit;
    if (ev) {
      ev.lotes.forEach(l =>
        l.variacoes.forEach(v => {
          if (v.id === input.variacaoId) valorUnit = v.valor;
        }),
      );
    }

    const tickets: Array<{ ticketId: string }> = [];

    if (ev) {
      for (let i = 0; i < input.quantidade; i++) {
        const ticketId = await eventosAdminService.registrarVendaEfetiva(
          input.eventoId,
          input.loteId,
          input.variacaoId,
          input.email,
        );
        if (!ticketId) {
          return {
            ok: false,
            tickets: [],
            totalBruto: 0,
            totalLiquido: 0,
            taxaAplicada,
            erro: 'Ingresso indisponível ou esgotado.',
          };
        }
        tickets.push({ ticketId });
      }
    } else {
      for (let i = 0; i < input.quantidade; i++) {
        const ticketId = `tck_${Date.now().toString(36)}_${i}`;
        tickets.push({ ticketId });
      }
    }

    const totalBruto = Math.round(valorUnit * input.quantidade * 100) / 100;
    const totalLiquido = Math.round(totalBruto * (1 - taxaAplicada) * 100) / 100;

    return { ok: true, tickets, totalBruto, totalLiquido, taxaAplicada };
  }

  // ── getMinhasListas ─────────────────────────────────────────────────────────
  async getMinhasListas(eventoId: string, _userId: string): Promise<ListaEvento[]> {
    const svc = await getListasService();
    const byEvento = svc.getListasByEvento(eventoId);
    return byEvento.length > 0 ? byEvento : svc.getListas();
  }

  // ── adicionarNomesLista ─────────────────────────────────────────────────────
  async adicionarNomesLista(
    listaId: string,
    regraId: string,
    nomes: string[],
    promoterId: string,
  ): Promise<AdicionarNomesResult> {
    const svc = await getListasService();
    let adicionados = 0;
    for (const nome of nomes) {
      const nome_ = nome.trim();
      if (!nome_) continue;
      const ok = await svc.inserirForce(listaId, regraId, nome_, '', promoterId, promoterId);
      if (ok) adicionados++;
    }
    return { ok: true, adicionados };
  }

  // ── checkinLista ────────────────────────────────────────────────────────────
  async checkinLista(
    convidadoId: string,
    porteiroNome?: string,
  ): Promise<{ ok: boolean; checkedInEm?: string; abobora?: boolean; bloqueado?: boolean; horaCorte?: string }> {
    const svc = await getListasService();
    return svc.checkInGlobal(convidadoId, porteiroNome);
  }

  // ── getMyTickets ────────────────────────────────────────────────────────────
  async getMyTickets(userId: string): Promise<MyTicket[]> {
    const { data, error } = await supabase
      .from('tickets_caixa')
      .select(
        `
        id, evento_id, variacao_id, valor, email, nome_titular, cpf, status, criado_em, usado_em, origem,
        eventos_admin ( nome, data_inicio, data_fim, local, foto ),
        variacoes_ingresso ( area, area_custom, genero )
      `,
      )
      .eq('owner_id', userId)
      .order('criado_em', { ascending: false })
      .limit(200);

    if (error || !data) {
      console.warn('[SUPABASE] getMyTickets falhou:', error?.message);
      return [];
    }

    return data.map(row => {
      const ev = (row as any).eventos_admin as {
        nome?: string;
        data_inicio?: string;
        data_fim?: string;
        local?: string;
        foto?: string;
      } | null;
      const vi = (row as any).variacoes_ingresso as { area?: string; area_custom?: string; genero?: string } | null;
      const area = vi ? (vi.area === 'OUTRO' ? (vi.area_custom ?? 'Outro') : (vi.area ?? '')) : '';
      const genero = vi ? (vi.genero === 'MASCULINO' ? 'Masc.' : vi.genero === 'FEMININO' ? 'Fem.' : 'Unisex') : '';
      const variacaoLabel = area && genero ? `${area} · ${genero}` : '';
      return {
        id: row.id,
        eventoId: row.evento_id,
        eventoNome: ev?.nome ?? 'Evento',
        eventoDataInicio: ev?.data_inicio ?? row.criado_em,
        eventoDataFim: ev?.data_fim ?? undefined,
        eventoLocal: ev?.local ?? '',
        eventoImagem: ev?.foto ?? undefined,
        variacaoLabel,
        valor: row.valor ?? 0,
        email: row.email ?? '',
        nomeTitular: row.nome_titular ?? '',
        cpf: row.cpf ?? '',
        status: row.status as 'DISPONIVEL' | 'USADO',
        emitidoEm: row.criado_em,
        usadoEm: row.usado_em ?? undefined,
      };
    });
  }

  // ── updateTicketTitular ───────────────────────────────────────────────────────
  async updateTicketTitular(
    ticketId: string,
    nomeTitular: string,
    cpf: string,
  ): Promise<{ ok: boolean; erro?: string }> {
    const { error } = await supabase
      .from('tickets_caixa')
      .update({ nome_titular: nomeTitular.trim(), cpf: cpf.trim() })
      .eq('id', ticketId);

    if (error) return { ok: false, erro: error.message };
    return { ok: true };
  }
}
