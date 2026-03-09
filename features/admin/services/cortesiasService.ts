/**
 * cortesiasService — gestão de cortesias via Supabase.
 * Cache local + refresh async (mesmo padrão dos demais services).
 */
import { Ingresso, Notificacao, CortesiaEvento, TransferenciaCortesiaLog } from '../../../types';
import { supabase } from '../../../services/supabaseClient';
import { eventosAdminService } from './eventosAdminService';

type AddTicketCb = (ticket: Ingresso) => void;
type RemoveTicketCb = (ticketId: string) => void;
type AddNotifCb = (notif: Notificacao) => void;

let _addTicket: AddTicketCb | null = null;
let _removeTicket: RemoveTicketCb | null = null;
let _addNotif: AddNotifCb | null = null;

// Cache local
const _configs: Map<string, CortesiaEvento & { listaId?: string }> = new Map();
const _logs: Map<string, TransferenciaCortesiaLog[]> = new Map();
const _saldos: Map<string, number> = new Map();
// lista_id → evento_id mapping
const _listaMap: Map<string, string> = new Map();

import { tsBR } from '../../../utils';

const calcSaldo = (eventoId: string): number => {
  const config = _configs.get(eventoId);
  if (!config) return 0;
  const logs = _logs.get(eventoId) ?? [];
  const usado = logs.reduce((sum, l) => sum + l.quantidade, 0);
  return Math.max(0, config.limite - usado);
};

export const cortesiasService = {
  /** Carrega configs e logs do Supabase para cache local */
  async refresh(): Promise<void> {
    const [cfgRes, logRes] = await Promise.all([
      supabase.from('cortesias_config').select('*').limit(1000),
      supabase.from('cortesias_log').select('*').order('created_at', { ascending: false }).limit(2000),
    ]);

    _configs.clear();
    _listaMap.clear();
    _logs.clear();
    _saldos.clear();

    if (cfgRes.data) {
      for (const row of cfgRes.data) {
        const eventoId = row.evento_id as string;
        _configs.set(eventoId, {
          limite: (row.limite as number) ?? 0,
          variacoes: (row.variacoes as string[]) ?? [],
          limitesPorTipo: (row.limites_por_tipo as Record<string, number>) ?? undefined,
          listaId: (row.lista_id as string) ?? undefined,
        });
        if (row.lista_id) _listaMap.set(row.lista_id as string, eventoId);
      }
    }

    if (logRes.data) {
      for (const row of logRes.data) {
        const eventoId = row.evento_id as string;
        const log: TransferenciaCortesiaLog = {
          id: row.id as string,
          remetenteNome: (row.remetente_nome as string) ?? '',
          destinatarioNome: (row.destinatario_nome as string) ?? '',
          variacaoLabel: (row.variacao_label as string) ?? '',
          quantidade: (row.quantidade as number) ?? 1,
          ts: (row.created_at as string) ?? '',
        };
        const arr = _logs.get(eventoId) ?? [];
        arr.push(log);
        _logs.set(eventoId, arr);
      }
    }

    // Recalcula saldos
    for (const [eventoId] of _configs) {
      _saldos.set(eventoId, calcSaldo(eventoId));
    }
  },

  registerCallbacks: (addTicket: AddTicketCb, removeTicket: RemoveTicketCb, addNotif: AddNotifCb) => {
    _addTicket = addTicket;
    _removeTicket = removeTicket;
    _addNotif = addNotif;
  },

  devolverCortesia: async (
    eventoAdminId: string,
    ticketId: string,
    tituloEvento: string,
    membroNome: string,
  ): Promise<void> => {
    _removeTicket?.(ticketId);

    // Log de devolução
    const logRow = {
      evento_id: eventoAdminId,
      remetente_nome: `${membroNome} (devolveu)`,
      destinatario_nome: 'Pool de Cortesias',
      variacao_label: 'DEVOLUÇÃO',
      quantidade: -1, // negativo = devolução (restaura saldo)
    };
    const { error: errLog } = await supabase.from('cortesias_log').insert(logRow);
    if (errLog) console.error('[cortesiasService] devolver log:', errLog);

    // Atualiza cache
    const arr = _logs.get(eventoAdminId) ?? [];
    arr.unshift({
      id: `ctlog_${Date.now()}`,
      remetenteNome: logRow.remetente_nome,
      destinatarioNome: logRow.destinatario_nome,
      variacaoLabel: logRow.variacao_label,
      quantidade: -1,
      ts: tsBR(),
    });
    _logs.set(eventoAdminId, arr);
    _saldos.set(eventoAdminId, calcSaldo(eventoAdminId));

    _addNotif?.({
      id: `notif_devolucao_${Date.now()}`,
      titulo: 'Cortesia Devolvida',
      mensagem: `${membroNome} devolveu uma cortesia para ${tituloEvento}. Saldo restaurado ao pool.`,
      tipo: 'SISTEMA',
      lida: false,
      link: 'ADMIN_HUB',
      timestamp: tsBR(),
    });
  },

  initCortesia: async (eventoAdminId: string, config: CortesiaEvento): Promise<void> => {
    if (_configs.has(eventoAdminId)) {
      // Upsert: atualizar config existente
      const row: Record<string, unknown> = {
        limite: config.limite,
        variacoes: config.variacoes,
      };
      if (config.limitesPorTipo) row.limites_por_tipo = config.limitesPorTipo;
      const { error: errUpd } = await supabase.from('cortesias_config').update(row).eq('evento_id', eventoAdminId);
      if (errUpd) {
        console.error('[cortesiasService] initCortesia update:', errUpd);
        return;
      }
      _configs.set(eventoAdminId, { ...config, listaId: _configs.get(eventoAdminId)?.listaId });
      _saldos.set(eventoAdminId, calcSaldo(eventoAdminId));
      return;
    }

    const row: Record<string, unknown> = {
      evento_id: eventoAdminId,
      limite: config.limite,
      variacoes: config.variacoes,
    };
    if (config.limitesPorTipo) row.limites_por_tipo = config.limitesPorTipo;
    const { error } = await supabase.from('cortesias_config').insert(row as any);
    if (error) {
      console.error('[cortesiasService] initCortesia:', error);
      return;
    }

    _configs.set(eventoAdminId, { ...config });
    _saldos.set(eventoAdminId, config.limite);
    _logs.set(eventoAdminId, []);
  },

  registerListaMapping: async (listaId: string, eventoAdminId: string): Promise<void> => {
    _listaMap.set(listaId, eventoAdminId);
    const { error: errMap } = await supabase
      .from('cortesias_config')
      .update({ lista_id: listaId })
      .eq('evento_id', eventoAdminId);
    if (errMap) console.error('[cortesiasService] registerListaMapping:', errMap);
  },

  getEventoAdminId: (listaId: string): string | undefined => _listaMap.get(listaId),

  getCortesiaConfig: (eventoAdminId: string): CortesiaEvento | undefined => _configs.get(eventoAdminId),

  getSaldoGlobal: (eventoAdminId: string): number => _saldos.get(eventoAdminId) ?? 0,

  /** Saldo por tipo: limite configurado - enviados daquele tipo */
  getSaldoPorTipo: (eventoAdminId: string): Record<string, { limite: number; usado: number; saldo: number }> => {
    const config = _configs.get(eventoAdminId);
    if (!config?.limitesPorTipo) return {};
    const logs = _logs.get(eventoAdminId) ?? [];
    const result: Record<string, { limite: number; usado: number; saldo: number }> = {};
    for (const [tipo, limite] of Object.entries(config.limitesPorTipo) as [string, number][]) {
      const usado = logs
        .filter(l => l.variacaoLabel === tipo && l.quantidade > 0)
        .reduce((s, l) => s + l.quantidade, 0);
      result[tipo] = { limite, usado, saldo: Math.max(0, limite - usado) };
    }
    return result;
  },

  getLogs: (eventoAdminId: string): TransferenciaCortesiaLog[] => _logs.get(eventoAdminId) ?? [],

  enviarParaDestinatario: async (params: {
    eventoAdminId: string;
    eventoNome: string;
    eventoData: string;
    remetenteNome: string;
    destinatarioId: string;
    destinatarioNome: string;
    variacaoLabel: string;
    quantidade: number;
  }): Promise<boolean> => {
    const {
      eventoAdminId,
      eventoNome,
      eventoData,
      remetenteNome,
      destinatarioId,
      destinatarioNome,
      variacaoLabel,
      quantidade,
    } = params;

    const saldo = _saldos.get(eventoAdminId) ?? 0;
    if (quantidade > saldo) return false;

    // Log no Supabase
    const logRow = {
      evento_id: eventoAdminId,
      remetente_nome: remetenteNome,
      destinatario_nome: destinatarioNome,
      variacao_label: variacaoLabel,
      quantidade,
    };
    const { error } = await supabase.from('cortesias_log').insert(logRow);
    if (error) {
      console.error('[cortesiasService] enviarParaDestinatario log:', error);
      return false;
    }

    // Atualiza cache
    const logEntry: TransferenciaCortesiaLog = {
      id: `ctlog_${Date.now()}`,
      remetenteNome,
      destinatarioNome,
      variacaoLabel,
      quantidade,
      ts: tsBR(),
    };
    const arr = _logs.get(eventoAdminId) ?? [];
    arr.unshift(logEntry);
    _logs.set(eventoAdminId, arr);
    _saldos.set(eventoAdminId, calcSaldo(eventoAdminId));

    eventosAdminService.registrarCortesia(eventoAdminId);

    // Criar cortesia PENDENTE (destinatário precisa aceitar)
    const { error: errPend } = await supabase.from('cortesias_pendentes').insert({
      evento_id: eventoAdminId,
      destinatario_id: destinatarioId,
      remetente_nome: remetenteNome,
      evento_nome: eventoNome,
      evento_data: eventoData,
      variacao_label: variacaoLabel,
      quantidade,
      status: 'PENDENTE',
    });
    if (errPend) console.error('[cortesiasService] enviarParaDestinatario pendente:', errPend);

    // Notificar destinatário (in-app)
    try {
      const { notificationsService } = await import('./notificationsService');
      void notificationsService.add(
        {
          titulo: 'Cortesia pendente!',
          mensagem: `${remetenteNome} te enviou ${quantidade > 1 ? `${quantidade} cortesias` : 'uma cortesia'} para ${eventoNome}. Aceite na sua carteira!`,
          tipo: 'CORTESIA_PENDENTE' as Notificacao['tipo'],
          lida: false,
          link: eventoAdminId,
          timestamp: tsBR(),
        },
        destinatarioId,
      );
    } catch {
      /* silencioso */
    }

    return true;
  },

  /** Lista cortesias pendentes de um usuário */
  getCortesiasPendentes: async (userId: string): Promise<CortesiaPendente[]> => {
    const { data } = await supabase
      .from('cortesias_pendentes')
      .select('*')
      .eq('destinatario_id', userId)
      .eq('status', 'PENDENTE')
      .order('created_at', { ascending: false });
    return (data ?? []).map(rowToCortesiaPendente);
  },

  /** Aceitar cortesia → RPC server-side cria ingresso na wallet */
  aceitarCortesia: async (cortesiaId: string, _userId: string): Promise<Ingresso | null> => {
    const { data, error } = await supabase.rpc('aceitar_cortesia_rpc', {
      p_cortesia_id: cortesiaId,
    });

    if (error || !data) {
      console.error('[cortesiasService] aceitarCortesia RPC:', error);
      return null;
    }

    const result = data as Record<string, unknown>;
    const ticket: Ingresso = {
      id: result.id as string,
      eventoId: result.evento_id as string,
      tituloEvento: (result.evento_nome as string) ?? '',
      dataEvento: (result.evento_data as string) ?? '',
      status: 'DISPONIVEL',
      codigoQR: (result.codigo_qr as string) ?? '',
      tipo: 'CORTESIA',
      variacaoLabel: (result.variacao_label as string) ?? '',
    };

    _addTicket?.(ticket);
    return ticket;
  },

  /** Recusar cortesia → restaura saldo */
  recusarCortesia: async (cortesiaId: string, userId: string): Promise<boolean> => {
    const { data: row } = await supabase
      .from('cortesias_pendentes')
      .select('*')
      .eq('id', cortesiaId)
      .eq('destinatario_id', userId)
      .eq('status', 'PENDENTE')
      .maybeSingle();

    if (!row) return false;

    const { error: errRecusa } = await supabase
      .from('cortesias_pendentes')
      .update({ status: 'RECUSADO' })
      .eq('id', cortesiaId);
    if (errRecusa) {
      console.error('[cortesiasService] recusar status:', errRecusa);
      return false;
    }

    const cp = rowToCortesiaPendente(row);

    // Log de devolução (quantidade negativa restaura saldo)
    const { error: errRecLog } = await supabase.from('cortesias_log').insert({
      evento_id: cp.eventoId,
      remetente_nome: 'Sistema (recusa)',
      destinatario_nome: 'Pool de Cortesias',
      variacao_label: cp.variacaoLabel,
      quantidade: -cp.quantidade,
    });
    if (errRecLog) console.error('[cortesiasService] recusar log:', errRecLog);

    // Atualiza cache
    const logArr = _logs.get(cp.eventoId) ?? [];
    logArr.unshift({
      id: `ctlog_${Date.now()}`,
      remetenteNome: 'Sistema (recusa)',
      destinatarioNome: 'Pool de Cortesias',
      variacaoLabel: cp.variacaoLabel,
      quantidade: -cp.quantidade,
      ts: tsBR(),
    });
    _logs.set(cp.eventoId, logArr);
    _saldos.set(cp.eventoId, calcSaldo(cp.eventoId));

    return true;
  },

  /** Atribui nome ao convidado da cortesia — trava transferência */
  atribuirNomeConvidado: async (cortesiaId: string, nomeConvidado: string): Promise<boolean> => {
    const { error } = await supabase
      .from('cortesias_pendentes')
      .update({ nome_convidado: nomeConvidado.trim() })
      .eq('id', cortesiaId)
      .eq('status', 'PENDENTE');

    if (error) {
      console.error('[cortesiasService] atribuirNomeConvidado erro:', error);
      return false;
    }
    return true;
  },

  /** Verifica se a cortesia pode ser transferida (sem nome atribuído) */
  podeTransferir: (cortesia: CortesiaPendente): boolean => {
    return !cortesia.nomeConvidado;
  },
};

// ── Tipo e helper para cortesias pendentes ──────────────────────────────────
export interface CortesiaPendente {
  id: string;
  eventoId: string;
  destinatarioId: string;
  remetenteNome: string;
  eventoNome: string;
  eventoData: string;
  variacaoLabel: string;
  quantidade: number;
  status: 'PENDENTE' | 'ACEITO' | 'RECUSADO';
  criadoEm: string;
  /** Nome atribuído — quando preenchido, transferência é travada (só aceitar/devolver) */
  nomeConvidado?: string;
  /** userId de quem delegou a cortesia (se transferida) */
  delegadoPor?: string;
}

const rowToCortesiaPendente = (row: Record<string, unknown>): CortesiaPendente => ({
  id: row.id as string,
  eventoId: (row.evento_id as string) ?? '',
  destinatarioId: (row.destinatario_id as string) ?? '',
  remetenteNome: (row.remetente_nome as string) ?? '',
  eventoNome: (row.evento_nome as string) ?? '',
  eventoData: (row.evento_data as string) ?? '',
  variacaoLabel: (row.variacao_label as string) ?? '',
  quantidade: (row.quantidade as number) ?? 1,
  status: (row.status as CortesiaPendente['status']) ?? 'PENDENTE',
  criadoEm: (row.created_at as string) ?? '',
  nomeConvidado: (row.nome_convidado as string) ?? undefined,
  delegadoPor: (row.delegado_por as string) ?? undefined,
});
