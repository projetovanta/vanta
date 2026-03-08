/**
 * listasService — CRUD de listas de convidados via Supabase.
 *
 * Padrão: cache local síncrono + refresh async do Supabase.
 * Mutações vão direto para o Supabase e atualizam o cache local.
 */

import { ListaEvento, RegraLista, CotaPromoter, ConvidadoLista } from '../../../types';
import { supabase } from '../../../services/supabaseClient';
import type { Database } from '../../../types/supabase';

type ListaRow = Database['public']['Tables']['listas_evento']['Row'];
type RegraRow = Database['public']['Tables']['regras_lista']['Row'];
type CotaRow = Database['public']['Tables']['cotas_promoter']['Row'];
type ConvidadoRow = Database['public']['Tables']['convidados_lista']['Row'];
import { notify } from '../../../services/notifyService';

const ts = (): string => {
  const d = new Date();
  return new Date(d.getTime() - 3 * 60 * 60 * 1000).toISOString().replace('Z', '-03:00');
};

// ── Cache local ──────────────────────────────────────────────────────────────

export const PROMOTERS_CACHE: { id: string; nome: string; foto: string }[] = [];

let LISTAS: ListaEvento[] = [];
let _refreshed = false;

/** Converte rows do Supabase para ListaEvento com regras, cotas e convidados */
const buildListas = (
  listasRows: ListaRow[],
  regrasRows: RegraRow[],
  cotasRows: CotaRow[],
  convidadosRows: ConvidadoRow[],
  eventosLookup: Map<string, { nome: string; data: string; dataFim?: string; local: string }>,
  nomesLookup: Map<string, string>,
): ListaEvento[] => {
  return listasRows.map(row => {
    const listaId = row.id;
    const eventoId = row.evento_id;
    const evInfo = eventosLookup.get(eventoId);

    const regras: RegraLista[] = regrasRows
      .filter(r => r.lista_id === listaId)
      .map(r => ({
        id: r.id,
        label: r.label ?? '',
        tetoGlobal: Number(r.teto_global ?? 0),
        saldoBanco: Number(r.saldo_banco ?? 0),
        cor: r.cor ?? undefined,
        valor: r.valor != null ? Number(r.valor) : undefined,
        horaCorte: r.hora_corte ?? undefined,
        aboboraRegraId: r.abobora_regra_id ?? undefined,
        genero: (r.genero as 'M' | 'F' | 'U') ?? 'U',
        area: r.area ?? undefined,
      }));

    const cotas: CotaPromoter[] = cotasRows
      .filter(c => c.lista_id === listaId)
      .map(c => ({
        promoterId: c.promoter_id,
        promoterNome: nomesLookup.get(c.promoter_id) ?? '',
        regraId: c.regra_id,
        alocado: Number(c.alocado ?? 0),
        usado: Number(c.usado ?? 0),
      }));

    const convidados: ConvidadoLista[] = convidadosRows
      .filter(c => c.lista_id === listaId)
      .map(c => ({
        id: c.id,
        nome: c.nome ?? '',
        telefone: c.telefone ?? '',
        regraId: c.regra_id,
        regraLabel: regras.find(r => r.id === c.regra_id)?.label ?? '',
        inseridoPor: c.inserido_por ?? '',
        inseridoPorNome: c.inserido_por_nome ?? nomesLookup.get(c.inserido_por ?? '') ?? '',
        inseridoEm: c.created_at ?? '',
        checkedIn: c.checked_in ?? false,
        checkedInEm: c.checked_in_em ?? undefined,
        checkedInPorNome: c.checked_in_por_nome ?? undefined,
      }));

    return {
      id: listaId,
      eventoId,
      eventoNome: evInfo?.nome ?? '',
      eventoData: evInfo?.data ?? '',
      eventoDataFim: evInfo?.dataFim,
      eventoLocal: evInfo?.local ?? '',
      tetoGlobalTotal: Number(row.teto_global_total ?? 0),
      regras,
      cotas,
      convidados,
    };
  });
};

// ── Tipos de resultado do check-in ───────────────────────────────────────────

export interface CheckInResult {
  ok: boolean;
  checkedInEm?: string;
  abobora?: boolean;         // true se migrou para regra pagante (após confirmação)
  bloqueado?: boolean;       // true se passou do hora_corte sem abóbora → check-in negado
  horaCorte?: string;        // 'HH:MM' para exibir no aviso ao porteiro
  pendente?: boolean;        // true se precisa de confirmação do porteiro (abóbora)
  valorAbobora?: number;     // valor a cobrar se confirmar
  regraDestinoLabel?: string; // label da regra pagante destino
  convidadoId?: string;      // ID do convidado para confirmar depois
  listaId?: string;          // ID da lista para confirmar depois
}

// ── Hora de corte — verifica se passou do horário limite da regra ─────────────

const toMin = (s: string) => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Verifica se o horário do check-in já passou do hora_corte da regra.
 * Trata eventos noturnos: madrugada (00:00-05:59) conta como "passou"
 * quando hora_corte >= 12:00.
 */
const passouDoCorte = (horaCorte: string, checkedInEm: string): boolean => {
  const hhmm = checkedInEm.slice(11, 16); // 'HH:MM' do ISO string
  const checkinMin = toMin(hhmm);
  const corteMin = toMin(horaCorte);

  if (corteMin >= 720) {
    // Evento noturno: passou se check-in >= corte OU madrugada (< 06:00)
    return checkinMin >= corteMin || checkinMin < 360;
  }
  // Evento diurno: passou se check-in >= corte
  return checkinMin >= corteMin;
};

/**
 * Resultado da verificação de hora_corte no check-in.
 * - 'ok': sem restrição, check-in normal
 * - 'abobora': passou do corte, migrar para regra pagante (retorna novo regraId)
 * - 'bloqueado': passou do corte, SEM regra pagante → check-in BLOQUEADO
 */
type ResultadoCorte =
  | { tipo: 'ok' }
  | { tipo: 'abobora'; novaRegraId: string }
  | { tipo: 'bloqueado'; horaCorte: string };

const verificarHoraCorte = (lista: ListaEvento, regraId: string, checkedInEm: string): ResultadoCorte => {
  const regra = lista.regras.find(r => r.id === regraId);

  // Sem hora_corte ou hora_corte = '02:00' (convenção para "noite toda") → ok
  if (!regra?.horaCorte || regra.horaCorte === '02:00') return { tipo: 'ok' };

  // Regra já é pagante (valor > 0) → não se aplica corte
  if (regra.valor && regra.valor > 0) return { tipo: 'ok' };

  if (!passouDoCorte(regra.horaCorte, checkedInEm)) return { tipo: 'ok' };

  // Passou do corte — tem abóbora?
  if (regra.aboboraRegraId) {
    const regraAbobora = lista.regras.find(r => r.id === regra.aboboraRegraId);
    if (regraAbobora) return { tipo: 'abobora', novaRegraId: regra.aboboraRegraId };
  }

  // Passou do corte SEM abóbora → BLOQUEADO
  return { tipo: 'bloqueado', horaCorte: regra.horaCorte };
};

// ── Serviço público ───────────────────────────────────────────────────────────

export const listasService = {
  get isReady(): boolean {
    return _refreshed;
  },

  async refresh(): Promise<void> {
    try {
      const [listasRes, regrasRes, cotasRes, evRes] = await Promise.all([
        supabase.from('listas_evento').select('*').limit(1000),
        supabase.from('regras_lista').select('*').limit(1000),
        supabase.from('cotas_promoter').select('*').limit(2000),
        supabase.from('eventos_admin').select('id, nome, data_inicio, data_fim, local').limit(1000),
      ]);

      // Paginação para convidados_lista (>1000 registros)
      const PAGE = 1000;
      const allConv: ConvidadoRow[] = [];
      let from = 0;

      while (true) {
        const { data: page } = await supabase
          .from('convidados_lista')
          .select('*')
          .range(from, from + PAGE - 1);
        if (!page || page.length === 0) break;
        allConv.push(...page);
        if (page.length < PAGE) break;
        from += PAGE;
      }

      const eventosLookup = new Map<string, { nome: string; data: string; dataFim?: string; local: string }>();
      for (const e of evRes.data ?? []) {
        eventosLookup.set(e.id, {
          nome: e.nome,
          data: (e.data_inicio ?? '').slice(0, 10),
          dataFim: e.data_fim ? e.data_fim.slice(0, 10) : undefined,
          local: e.local ?? '',
        });
      }

      // Lookup de nomes de promoters/inseridores
      const userIds = new Set<string>();
      for (const c of allConv) {
        if (c.inserido_por) userIds.add(c.inserido_por);
      }
      for (const c of cotasRes.data ?? []) {
        if (c.promoter_id) userIds.add(c.promoter_id);
      }
      const nomesLookup = new Map<string, string>();
      if (userIds.size > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, nome, foto')
          .in('id', [...userIds]);
        for (const p of profiles ?? []) {
          nomesLookup.set(p.id, p.nome ?? '');
        }
        // Popular PROMOTERS_CACHE
        PROMOTERS_CACHE.length = 0;
        for (const p of profiles ?? []) {
          PROMOTERS_CACHE.push({ id: p.id, nome: p.nome ?? '', foto: p.foto ?? '' });
        }
      }

      LISTAS = buildListas(
        listasRes.data ?? [],
        regrasRes.data ?? [],
        cotasRes.data ?? [],
        allConv,
        eventosLookup,
        nomesLookup,
      );

      _refreshed = true;
    } catch (err) {
      console.error('[listasService] refresh falhou:', err);
    }
  },

  getListas: (): ListaEvento[] => LISTAS,

  getLista: (id: string): ListaEvento | undefined => LISTAS.find(l => l.id === id),

  getListasByEvento: (eventoId: string): ListaEvento[] => LISTAS.filter(l => l.eventoId === eventoId),

  getListasByPromoter: (promoterId: string): ListaEvento[] =>
    LISTAS.filter(l => l.cotas.some(c => c.promoterId === promoterId)),

  getCotasPromoter: (listaId: string, promoterId: string): CotaPromoter[] =>
    LISTAS.find(l => l.id === listaId)?.cotas.filter(c => c.promoterId === promoterId) ?? [],

  getSaldoDisponivel: (listaId: string, promoterId: string, regraId: string): number => {
    const lista = LISTAS.find(l => l.id === listaId);
    if (!lista) return 0;
    const cota = lista.cotas.find(c => c.promoterId === promoterId && c.regraId === regraId);
    return cota ? cota.alocado - cota.usado : 0;
  },

  distribuirCota: async (
    listaId: string,
    regraId: string,
    promoterId: string,
    promoterNome: string,
    quantidade: number,
  ): Promise<boolean> => {
    const lista = LISTAS.find(l => l.id === listaId);
    if (!lista) return false;
    const regra = lista.regras.find(r => r.id === regraId);
    if (!regra || regra.saldoBanco < quantidade) return false;

    // Atualiza saldo_banco da regra no Supabase
    await supabase
      .from('regras_lista')
      .update({ saldo_banco: regra.saldoBanco - quantidade })
      .eq('id', regraId);

    // Upsert cota no Supabase
    const cotaExistente = lista.cotas.find(c => c.promoterId === promoterId && c.regraId === regraId);
    const novoAlocado = (cotaExistente?.alocado ?? 0) + quantidade;

    await supabase.from('cotas_promoter').upsert(
      {
        lista_id: listaId,
        regra_id: regraId,
        promoter_id: promoterId,
        alocado: novoAlocado,
        usado: cotaExistente?.usado ?? 0,
      },
      { onConflict: 'lista_id,regra_id,promoter_id' },
    );

    // Atualiza cache local
    regra.saldoBanco -= quantidade;
    if (cotaExistente) {
      cotaExistente.alocado += quantidade;
    } else {
      lista.cotas.push({ promoterId, promoterNome, regraId, alocado: quantidade, usado: 0 });
    }

    try {
      const { auditService } = await import('./auditService');
      auditService.log(promoterId, 'COTA_DISTRIBUIDA', 'lista', listaId, undefined, {
        regraId,
        quantidade,
        promoterNome,
      });
    } catch {
      /* silencioso */
    }

    // Notificação ao promoter (3 canais)
    void notify({
      userId: promoterId,
      titulo: 'Nova cota recebida',
      mensagem: `Você recebeu ${quantidade} vaga(s) na lista. Acesse o painel para inserir nomes.`,
      tipo: 'COTA_RECEBIDA',
    });

    return true;
  },

  inserirConvidado: async (
    listaId: string,
    regraId: string,
    nome: string,
    telefone: string,
    promoterId: string,
    promoterNome: string,
  ): Promise<boolean> => {
    const lista = LISTAS.find(l => l.id === listaId);
    if (!lista) return false;
    const cota = lista.cotas.find(c => c.promoterId === promoterId && c.regraId === regraId);
    if (!cota || cota.alocado - cota.usado <= 0) return false;
    const regra = lista.regras.find(r => r.id === regraId);

    // Insere convidado no Supabase
    const { data: inserted } = await supabase
      .from('convidados_lista')
      .insert({
        lista_id: listaId,
        regra_id: regraId,
        nome: nome.trim(),
        telefone: telefone.trim(),
        inserido_por: promoterId,
        inserido_por_nome: promoterNome,
      })
      .select('id')
      .single();

    if (!inserted) return false;

    // Atualiza cota no Supabase
    const novoUsado = cota.usado + 1;
    const { error: cotaErr } = await supabase
      .from('cotas_promoter')
      .update({ usado: novoUsado })
      .eq('lista_id', listaId)
      .eq('regra_id', regraId)
      .eq('promoter_id', promoterId);

    if (cotaErr) return false;

    // Cache só atualiza após Supabase confirmar
    cota.usado = novoUsado;

    lista.convidados.push({
      id: inserted.id as string,
      nome: nome.trim(),
      telefone: telefone.trim(),
      regraId,
      regraLabel: regra?.label ?? regraId,
      inseridoPor: promoterId,
      inseridoPorNome: promoterNome,
      inseridoEm: ts(),
      checkedIn: false,
    });

    return true;
  },

  inserirForce: async (
    listaId: string,
    regraId: string,
    nome: string,
    telefone: string,
    userId: string,
    userNome: string,
  ): Promise<boolean> => {
    const lista = LISTAS.find(l => l.id === listaId);
    const regra = lista?.regras.find(r => r.id === regraId);
    if (!lista || !regra || regra.saldoBanco <= 0) return false;

    let cota = lista.cotas.find(c => c.promoterId === userId && c.regraId === regraId);
    if (!cota) {
      lista.cotas.push({ promoterId: userId, promoterNome: userNome, regraId, alocado: 0, usado: 0 });
      cota = lista.cotas[lista.cotas.length - 1];
    }

    const novoSaldo = regra.saldoBanco - 1;
    const novoAlocado = cota.alocado + 1;
    const novoUsado = cota.usado + 1;

    // Supabase updates primeiro — cache só depois de confirmar
    const { error: regraErr } = await supabase
      .from('regras_lista')
      .update({ saldo_banco: novoSaldo })
      .eq('id', regraId);
    if (regraErr) return false;

    const { error: cotaErr } = await supabase.from('cotas_promoter').upsert(
      {
        lista_id: listaId,
        regra_id: regraId,
        promoter_id: userId,
        alocado: novoAlocado,
        usado: novoUsado,
      },
      { onConflict: 'lista_id,regra_id,promoter_id' },
    );
    if (cotaErr) return false;

    const { data: inserted } = await supabase
      .from('convidados_lista')
      .insert({
        lista_id: listaId,
        regra_id: regraId,
        nome: nome.trim(),
        telefone: telefone.trim(),
        inserido_por: userId,
        inserido_por_nome: userNome,
      })
      .select('id')
      .single();

    if (!inserted) return false;

    // Cache atualiza só após Supabase confirmar tudo
    regra.saldoBanco = novoSaldo;
    cota.alocado = novoAlocado;
    cota.usado = novoUsado;

    lista.convidados.push({
      id: inserted.id as string,
      nome: nome.trim(),
      telefone: telefone.trim(),
      regraId,
      regraLabel: regra.label,
      inseridoPor: userId,
      inseridoPorNome: userNome,
      inseridoEm: ts(),
      checkedIn: false,
    });

    return true;
  },

  checkIn: async (listaId: string, convidadoId: string, porteiroNome?: string): Promise<CheckInResult> => {
    const lista = LISTAS.find(l => l.id === listaId);
    if (!lista) return { ok: false };
    const c = lista.convidados.find(c => c.id === convidadoId);
    if (!c || c.checkedIn) return { ok: false };

    const checkedInEm = new Date(Date.now() - 3 * 3600000).toISOString().replace('Z', '-03:00');
    const corte = verificarHoraCorte(lista, c.regraId, checkedInEm);

    if (corte.tipo === 'bloqueado') {
      return { ok: false, bloqueado: true, horaCorte: corte.horaCorte };
    }

    // Abóbora: NÃO faz check-in — retorna pendente para porteiro confirmar
    if (corte.tipo === 'abobora') {
      const regraDestino = lista.regras.find(r => r.id === corte.novaRegraId);
      const regra = lista.regras.find(r => r.id === c.regraId);
      return {
        ok: false,
        pendente: true,
        horaCorte: regra?.horaCorte,
        valorAbobora: regraDestino?.valor ?? 0,
        regraDestinoLabel: regraDestino?.label,
        convidadoId,
        listaId,
      };
    }

    // Check-in normal (sem restrição)
    c.checkedIn = true;
    c.checkedInEm = checkedInEm;
    c.checkedInPorNome = porteiroNome;

    const { error } = await supabase
      .from('convidados_lista')
      .update({ checked_in: true, checked_in_em: checkedInEm, checked_in_por_nome: porteiroNome ?? null })
      .eq('id', convidadoId);

    if (error) {
      console.error('[listasService] checkIn falhou no Supabase — cache local mantém check-in:', error);
    }

    return { ok: true, checkedInEm };
  },

  /** Confirma check-in com abóbora — porteiro já confirmou que cobrou o valor */
  confirmarCheckInAbobora: async (listaId: string, convidadoId: string, porteiroNome?: string): Promise<CheckInResult> => {
    const lista = LISTAS.find(l => l.id === listaId);
    if (!lista) return { ok: false };
    const c = lista.convidados.find(c => c.id === convidadoId);
    if (!c || c.checkedIn) return { ok: false };

    const checkedInEm = new Date(Date.now() - 3 * 3600000).toISOString().replace('Z', '-03:00');
    const corte = verificarHoraCorte(lista, c.regraId, checkedInEm);
    const novaRegraId = corte.tipo === 'abobora' ? corte.novaRegraId : undefined;

    c.checkedIn = true;
    c.checkedInEm = checkedInEm;
    c.checkedInPorNome = porteiroNome;
    if (novaRegraId) {
      c.regraId = novaRegraId;
      c.regraLabel = lista.regras.find(r => r.id === novaRegraId)?.label ?? c.regraLabel;
    }

    const update: Database['public']['Tables']['convidados_lista']['Update'] = {
      checked_in: true,
      checked_in_em: checkedInEm,
      checked_in_por_nome: porteiroNome ?? null,
    };
    if (novaRegraId) update.regra_id = novaRegraId;

    const { error } = await supabase
      .from('convidados_lista')
      .update(update)
      .eq('id', convidadoId);

    if (error) {
      console.error('[listasService] confirmarCheckInAbobora falhou:', error);
    }

    return { ok: true, checkedInEm, abobora: true };
  },

  checkInGlobal: async (convidadoId: string, porteiroNome?: string): Promise<CheckInResult> => {
    for (const lista of LISTAS) {
      const c = lista.convidados.find(cv => cv.id === convidadoId);
      if (c) {
        if (c.checkedIn) return { ok: false };
        const checkedInEm = new Date(Date.now() - 3 * 3600000).toISOString().replace('Z', '-03:00');
        const corte = verificarHoraCorte(lista, c.regraId, checkedInEm);

        if (corte.tipo === 'bloqueado') {
          return { ok: false, bloqueado: true, horaCorte: corte.horaCorte };
        }

        // Abóbora: retorna pendente para porteiro confirmar
        if (corte.tipo === 'abobora') {
          const regraDestino = lista.regras.find(r => r.id === corte.novaRegraId);
          const regra = lista.regras.find(r => r.id === c.regraId);
          return {
            ok: false,
            pendente: true,
            horaCorte: regra?.horaCorte,
            valorAbobora: regraDestino?.valor ?? 0,
            regraDestinoLabel: regraDestino?.label,
            convidadoId,
            listaId: lista.id,
          };
        }

        // Check-in normal
        const { error } = await supabase
          .from('convidados_lista')
          .update({ checked_in: true, checked_in_em: checkedInEm, checked_in_por_nome: porteiroNome ?? null })
          .eq('id', convidadoId);

        if (error) {
          console.error('[listasService] checkInGlobal falhou:', error);
        }

        c.checkedIn = true;
        c.checkedInEm = checkedInEm;
        c.checkedInPorNome = porteiroNome;
        return { ok: true, checkedInEm };
      }
    }
    return { ok: false };
  },

  criarLista: async (data: {
    eventoId?: string;
    eventoNome: string;
    eventoData: string;
    eventoDataFim?: string;
    eventoLocal: string;
    tetoGlobalTotal: number;
    regras: {
      label: string;
      tetoGlobal: number;
      cor?: string;
      valor?: number;
      horaCorte?: string;
      genero?: 'M' | 'F' | 'U';
      area?: string;
    }[];
  }): Promise<string> => {
    // Insere lista no Supabase
    const { data: inserted, error } = await supabase
      .from('listas_evento')
      .insert({
        evento_id: data.eventoId,
        teto_global_total: data.tetoGlobalTotal,
      })
      .select('id')
      .single();

    if (error || !inserted) {
      console.error('[listasService] criarLista erro:', error);
      return '';
    }

    const listaId = inserted.id as string;

    // Insere regras
    const regrasInsert = data.regras.map(r => ({
      lista_id: listaId,
      label: r.label,
      teto_global: r.tetoGlobal,
      saldo_banco: r.tetoGlobal,
      cor: r.cor ?? null,
      valor: r.valor ?? null,
      genero: r.genero ?? 'U',
      area: r.area ?? 'PISTA',
    }));

    const { data: regrasData } = await supabase
      .from('regras_lista')
      .insert(regrasInsert)
      .select('id, label, teto_global, saldo_banco, cor, valor, genero, area');

    // Atualiza cache local
    const regras: RegraLista[] = (regrasData ?? []).map(r => ({
      id: r.id as string,
      label: r.label as string,
      tetoGlobal: Number(r.teto_global),
      saldoBanco: Number(r.saldo_banco),
      cor: r.cor as string | undefined,
      valor: r.valor != null ? Number(r.valor) : undefined,
      genero: (r.genero as 'M' | 'F' | 'U') ?? 'U',
    }));

    LISTAS.push({
      id: listaId,
      eventoId: data.eventoId,
      eventoNome: data.eventoNome,
      eventoData: data.eventoData,
      eventoDataFim: data.eventoDataFim,
      eventoLocal: data.eventoLocal,
      tetoGlobalTotal: data.tetoGlobalTotal,
      regras,
      cotas: [],
      convidados: [],
    });

    return listaId;
  },

  /** Atualiza regras de uma lista existente (valores, limites, labels) */
  atualizarRegras: async (
    listaId: string,
    regras: { label: string; tetoGlobal: number; cor?: string; valor?: number; horaCorte?: string }[],
  ): Promise<void> => {
    const lista = LISTAS.find(l => l.id === listaId);
    if (!lista) return;

    // Atualizar regras existentes pelo índice (ordem preservada)
    for (let i = 0; i < regras.length; i++) {
      const r = regras[i];
      const existing = lista.regras[i];
      if (existing) {
        // Update existente
        await supabase
          .from('regras_lista')
          .update({
            label: r.label,
            teto_global: r.tetoGlobal,
            cor: r.cor ?? null,
            valor: r.valor ?? null,
            hora_corte: r.horaCorte ?? null,
          })
          .eq('id', existing.id);
        // Atualiza cache
        existing.label = r.label;
        existing.tetoGlobal = r.tetoGlobal;
        existing.cor = r.cor;
        existing.valor = r.valor;
      } else {
        // Nova regra — inserir
        const { data: inserted } = await supabase
          .from('regras_lista')
          .insert({
            lista_id: listaId,
            label: r.label,
            teto_global: r.tetoGlobal,
            saldo_banco: r.tetoGlobal,
            cor: r.cor ?? null,
            valor: r.valor ?? null,
            hora_corte: r.horaCorte ?? null,
          })
          .select('id')
          .single();
        if (inserted) {
          lista.regras.push({
            id: inserted.id as string,
            label: r.label,
            tetoGlobal: r.tetoGlobal,
            saldoBanco: r.tetoGlobal,
            cor: r.cor,
            valor: r.valor,
            horaCorte: r.horaCorte,
            genero: 'U',
          });
        }
      }
    }

    // Atualiza teto global total
    lista.tetoGlobalTotal = lista.regras.reduce((s, r) => s + r.tetoGlobal, 0);
  },

  /** Criar uma nova regra na lista (sem editar existentes). Para CRIAR_REGRA_LISTA. */
  criarRegra: async (
    listaId: string,
    regra: {
      label: string;
      tetoGlobal: number;
      cor?: string;
      valor?: number;
      horaCorte?: string;
      genero?: 'M' | 'F' | 'U';
      area?: string;
      aboboraValor?: number;
    },
  ): Promise<string | null> => {
    const lista = LISTAS.find(l => l.id === listaId);
    if (!lista) return null;

    const { data: inserted, error } = await supabase
      .from('regras_lista')
      .insert({
        lista_id: listaId,
        label: regra.label,
        teto_global: regra.tetoGlobal,
        saldo_banco: regra.tetoGlobal,
        cor: regra.cor ?? null,
        valor: regra.valor ?? null,
        hora_corte: regra.horaCorte ?? null,
        genero: regra.genero ?? 'U',
        area: regra.area ?? 'PISTA',
      })
      .select('id')
      .single();

    if (error || !inserted) {
      console.error('[listasService] criarRegra erro:', error);
      return null;
    }

    const regraId = inserted.id as string;

    // Se VIP com hora de corte e valor pós-horário → criar regra abóbora automaticamente
    if (regra.horaCorte && regra.aboboraValor && regra.aboboraValor > 0 && (!regra.valor || regra.valor === 0)) {
      const aboboraLabel = `${regra.label} (após ${regra.horaCorte} R$${regra.aboboraValor})`;
      const { data: abIns } = await supabase
        .from('regras_lista')
        .insert({
          lista_id: listaId,
          label: aboboraLabel,
          teto_global: regra.tetoGlobal,
          saldo_banco: regra.tetoGlobal,
          cor: regra.cor ?? null,
          valor: regra.aboboraValor,
          hora_corte: '02:00',
          genero: regra.genero ?? 'U',
          area: regra.area ?? 'PISTA',
          tipo: 'PAGO',
        })
        .select('id')
        .single();

      if (abIns) {
        // Linkar regra VIP → abóbora
        await supabase.from('regras_lista').update({ abobora_regra_id: abIns.id }).eq('id', regraId);

        lista.regras.push({
          id: abIns.id as string,
          label: aboboraLabel,
          tetoGlobal: regra.tetoGlobal,
          saldoBanco: regra.tetoGlobal,
          cor: regra.cor,
          valor: regra.aboboraValor,
          genero: regra.genero ?? 'U',
          area: regra.area,
        });

        // Atualizar cache: regra VIP agora aponta para abóbora
        lista.regras.push({
          id: regraId,
          label: regra.label,
          tetoGlobal: regra.tetoGlobal,
          saldoBanco: regra.tetoGlobal,
          cor: regra.cor,
          valor: regra.valor,
          horaCorte: regra.horaCorte,
          aboboraRegraId: abIns.id as string,
          genero: regra.genero ?? 'U',
          area: regra.area,
        });
      } else {
        lista.regras.push({
          id: regraId,
          label: regra.label,
          tetoGlobal: regra.tetoGlobal,
          saldoBanco: regra.tetoGlobal,
          cor: regra.cor,
          valor: regra.valor,
          horaCorte: regra.horaCorte,
          genero: regra.genero ?? 'U',
          area: regra.area,
        });
      }
    } else {
      lista.regras.push({
        id: regraId,
        label: regra.label,
        tetoGlobal: regra.tetoGlobal,
        saldoBanco: regra.tetoGlobal,
        cor: regra.cor,
        valor: regra.valor,
        horaCorte: regra.horaCorte,
        genero: regra.genero ?? 'U',
        area: regra.area,
      });
    }
    lista.tetoGlobalTotal = lista.regras.reduce((s, r) => s + r.tetoGlobal, 0);

    return regraId;
  },

  inserirLote: async (
    listaId: string,
    regraId: string,
    nomes: string[],
    userId: string,
    userNome: string,
    isForce: boolean,
  ): Promise<{ ok: number; erros: string[] }> => {
    const nomesValidos = nomes.map(n => n.trim()).filter(n => n.length > 0);
    let ok = 0;
    const erros: string[] = [];
    for (const nome of nomesValidos) {
      const sucesso = isForce
        ? await listasService.inserirForce(listaId, regraId, nome, '', userId, userNome)
        : await listasService.inserirConvidado(listaId, regraId, nome, '', userId, userNome);
      if (sucesso) ok++;
      else erros.push(nome);
    }
    if (ok > 0) {
      try {
        const { auditService } = await import('./auditService');
        auditService.log(userId, 'LISTA_INSERIDA', 'lista', listaId, undefined, { regraId, quantidade: ok });
      } catch {
        /* silencioso */
      }
    }
    return { ok, erros };
  },

  totalInscritos: (lista: ListaEvento): number => lista.convidados.length,

  totalPorRegra: (lista: ListaEvento, regraId: string): number =>
    lista.convidados.filter(c => c.regraId === regraId).length,
};
