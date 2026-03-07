/**
 * eventosAdminCrud — CRUD de eventos (criar, listar, buscar, atualizar).
 */

import { EventoAdmin } from '../../../types';
import type { Json } from '../../../types/supabase';
import { supabase } from '../../../services/supabaseClient';
import { notify, notifyMany } from '../../../services/notifyService';
import { auditService } from './auditService';
import { EVENTOS_ADMIN, bumpVersion, ts, refresh } from './eventosAdminCore';

export const getEventos = (): EventoAdmin[] => [...EVENTOS_ADMIN];

export const getEvento = (id: string): EventoAdmin | undefined => EVENTOS_ADMIN.find(e => e.id === id);

export const getEventosByComunidade = (comunidadeId: string): EventoAdmin[] =>
  EVENTOS_ADMIN.filter(e => e.comunidadeId === comunidadeId);

/** Notifica membro que foi escalado para equipe de evento (3 canais). */
export const notificarEscalacao = async (membroId: string, papel: string, eventoId: string, eventoNome: string) => {
  try {
    const papelLabel = papel.charAt(0).toUpperCase() + papel.slice(1).toLowerCase();
    void notify({
      userId: membroId,
      titulo: `Você foi escalado como ${papelLabel}`,
      mensagem: `Você foi adicionado à equipe do evento "${eventoNome}" como ${papelLabel}. Acesse o Painel Administrativo para mais detalhes.`,
      tipo: 'CARGO_ATRIBUIDO',
      link: eventoId,
    });
  } catch {
    /* silencioso */
  }
};

export const criarEvento = async (
  data: Omit<EventoAdmin, 'id' | 'criadoEm' | 'cortesiasEnviadas'>,
): Promise<string> => {
  // RLS exige created_by = auth.uid() — SEMPRE usar o user logado
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const createdBy = user?.id || data.criadorId || null;

  // Insere evento no Supabase
  const { data: inserted, error } = await supabase
    .from('eventos_admin')
    .insert({
      comunidade_id: data.comunidadeId,
      nome: data.nome,
      descricao: data.descricao,
      data_inicio: data.dataInicio,
      data_fim: data.dataFim,
      local: data.local,
      endereco: data.endereco,
      cidade: data.cidade,
      foto: data.foto,
      coords: data.coords ?? null,
      publicado: false,
      caixa_ativo: data.caixaAtivo ?? false,
      gateway_fee_mode: data.gateway_fee_mode ?? 'ABSORVER',
      taxa_processamento_percent: data.taxa_processamento_percent ?? null,
      taxa_porta_percent: data.taxa_porta_percent ?? null,
      taxa_minima: data.taxa_minima ?? null,
      taxa_fixa_evento: data.taxa_fixa_evento ?? 0,
      quem_paga_servico: data.quem_paga_servico ?? 'PRODUTOR_ESCOLHE',
      cota_nomes_lista: data.cota_nomes_lista ?? null,
      taxa_nome_excedente: data.taxa_nome_excedente ?? null,
      cota_cortesias: data.cota_cortesias ?? null,
      taxa_cortesia_excedente_pct: data.taxa_cortesia_excedente_pct ?? null,
      prazo_pagamento_dias: data.prazo_pagamento_dias ?? null,
      created_by: createdBy,
      tipo_fluxo: data.tipoFluxo ?? null,
      status_evento: data.statusEvento ?? 'PENDENTE',
      socio_convidado_id: data.socioConvidadoId ?? null,
      split_produtor: data.splitProdutor ?? null,
      split_socio: data.splitSocio ?? null,
      permissoes_produtor: data.permissoesProdutor ?? null,
      rodada_negociacao: data.tipoFluxo === 'COM_SOCIO' ? 1 : null,
      formato: data.formato ?? null,
      estilos: data.estilos ?? [],
      experiencias: data.experiencias ?? [],
      categoria: data.formato ?? data.categoria ?? null,
      subcategorias: data.subcategorias ?? [],
      venda_vanta: data.vendaVanta ?? true,
      link_externo: data.linkExterno ?? null,
      plataforma_externa: data.plataformaExterna ?? null,
      recorrencia: data.recorrencia ?? 'UNICO',
      recorrencia_ate: data.recorrenciaAte ?? null,
    })
    .select('id')
    .single();

  if (error || !inserted) {
    console.error('[eventosAdminService] criarEvento erro:', error);
    return '';
  }

  const eventoId = inserted.id as string;

  // Insere socios (multi-socio) — se tiver socios[] usa array, senao fallback pro socio unico legado
  if (data.socios?.length) {
    for (const s of data.socios) {
      await supabase.from('socios_evento').insert({
        evento_id: eventoId,
        socio_id: s.socioId,
        split_percentual: s.splitPercentual,
        permissoes: s.permissoes ?? [],
        status: 'PENDENTE',
        rodada_negociacao: 1,
      });
    }
  } else if (data.tipoFluxo === 'COM_SOCIO' && data.socioConvidadoId) {
    await supabase.from('socios_evento').insert({
      evento_id: eventoId,
      socio_id: data.socioConvidadoId,
      split_percentual: data.splitSocio ?? 70,
      permissoes: [],
      status: 'PENDENTE',
      rodada_negociacao: 1,
    });
  }

  // Insere lotes e variacoes
  for (const lote of data.lotes) {
    const { data: loteInserted } = await supabase
      .from('lotes')
      .insert({
        evento_id: eventoId,
        nome: lote.nome,
        data_validade: lote.dataValidade ?? null,
        ativo: lote.ativo,
        ordem: 0,
        virar_pct: lote.virarPct ?? null,
      })
      .select('id')
      .single();

    if (loteInserted) {
      const loteId = loteInserted.id as string;
      for (const v of lote.variacoes) {
        await supabase.from('variacoes_ingresso').insert({
          lote_id: loteId,
          area: v.area,
          area_custom: v.areaCustom ?? null,
          genero: v.genero,
          valor: v.valor,
          limite: v.limite,
          vendidos: 0,
          requer_comprovante: v.requerComprovante ?? false,
          tipo_comprovante: v.tipoComprovante ?? null,
        });
      }
    }
  }

  // Insere equipe (com permissoes 10p) + notifica cada membro
  for (const m of data.equipe) {
    const { error: eqErr } = await supabase.from('equipe_evento').insert({
      evento_id: eventoId,
      membro_id: m.id,
      papel: m.papel,
      permissoes: m.permissoes ?? [],
    });
    if (!eqErr) void notificarEscalacao(m.id, m.papel, eventoId, data.nome);
  }

  // ── Atribuir criador como SOCIO/GERENTE via RBAC ──────────────────────────
  if (data.criadorId) {
    try {
      const { rbacService, CARGO_PERMISSOES } = await import('./rbacService');
      await rbacService.atribuir({
        userId: data.criadorId,
        tenant: { tipo: 'EVENTO', id: eventoId, nome: data.nome },
        cargo: 'SOCIO',
        permissoes: CARGO_PERMISSOES.SOCIO,
        atribuidoPor: data.criadorId,
        ativo: true,
      });
    } catch {
      /* silencioso — não bloquear criação do evento */
    }
  }

  // Notifica o master SEMPRE (B2: masteradmin aprova tudo)
  try {
    const { data: masters } = await supabase.from('profiles').select('id').eq('role', 'vanta_masteradm');
    const masterIds = (masters ?? []).map((m: { id: string }) => m.id);
    if (masterIds.length > 0) {
      void notifyMany(masterIds, {
        titulo: 'Novo evento aguardando aprovação',
        mensagem: `${data.criadorNome ?? 'Um produtor'} enviou "${data.nome}" para aprovação.`,
        tipo: 'EVENTO_PENDENTE',
        link: 'ADMIN_HUB',
      });
    }
  } catch {
    /* silencioso */
  }

  // Notifica socios convidados (fluxo COM_SOCIO)
  if (data.tipoFluxo === 'COM_SOCIO') {
    const socioIds = data.socios?.map(s => s.socioId) ?? (data.socioConvidadoId ? [data.socioConvidadoId] : []);
    for (const socioId of socioIds) {
      void notify({
        userId: socioId,
        titulo: 'Novo convite de evento',
        mensagem: `${data.criadorNome ?? 'Um produtor'} quer fazer "${data.nome}" na sua casa. Avalie a proposta.`,
        tipo: 'CONVITE_SOCIO',
        link: eventoId,
      });
    }
  }

  // Notifica seguidores da comunidade
  try {
    const { communityFollowService } = await import('../../../services/communityFollowService');
    const { notificationsService } = await import('./notificationsService');
    const followers = await communityFollowService.getFollowers(data.comunidadeId);
    for (const followerId of followers) {
      // Não notificar o próprio criador
      if (followerId === data.criadorId) continue;
      void notificationsService.add(
        {
          tipo: 'EVENTO',
          titulo: 'Novo evento na comunidade',
          mensagem: `"${data.nome}" foi criado em ${data.comunidade?.nome ?? 'uma comunidade que você segue'}. Confira!`,
          link: eventoId,
          lida: false,
          timestamp: ts(),
        },
        followerId,
      );
    }
  } catch {
    /* silencioso */
  }

  // Refresh cache
  await refresh();
  return eventoId;
};

export const updateEvento = async (
  id: string,
  updates: Partial<Omit<EventoAdmin, 'id' | 'criadoEm'>>,
): Promise<void> => {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.nome !== undefined) dbUpdates.nome = updates.nome;
  if (updates.descricao !== undefined) dbUpdates.descricao = updates.descricao;
  if (updates.dataInicio !== undefined) dbUpdates.data_inicio = updates.dataInicio;
  if (updates.dataFim !== undefined) dbUpdates.data_fim = updates.dataFim;
  if (updates.local !== undefined) dbUpdates.local = updates.local;
  if (updates.endereco !== undefined) dbUpdates.endereco = updates.endereco;
  if (updates.cidade !== undefined) dbUpdates.cidade = updates.cidade;
  if (updates.foto !== undefined) dbUpdates.foto = updates.foto;
  if (updates.publicado !== undefined) dbUpdates.publicado = updates.publicado;
  if (updates.caixaAtivo !== undefined) dbUpdates.caixa_ativo = updates.caixaAtivo;
  if (updates.vanta_fee_percent !== undefined) dbUpdates.vanta_fee_percent = updates.vanta_fee_percent;
  if (updates.vanta_fee_fixed !== undefined) dbUpdates.vanta_fee_fixed = updates.vanta_fee_fixed;
  if (updates.gateway_fee_mode !== undefined) dbUpdates.gateway_fee_mode = updates.gateway_fee_mode;
  if (updates.taxa_processamento_percent !== undefined)
    dbUpdates.taxa_processamento_percent = updates.taxa_processamento_percent;
  if (updates.taxa_porta_percent !== undefined) dbUpdates.taxa_porta_percent = updates.taxa_porta_percent;
  if (updates.taxa_minima !== undefined) dbUpdates.taxa_minima = updates.taxa_minima;
  if (updates.taxa_fixa_evento !== undefined) dbUpdates.taxa_fixa_evento = updates.taxa_fixa_evento;
  if (updates.quem_paga_servico !== undefined) dbUpdates.quem_paga_servico = updates.quem_paga_servico;
  if (updates.cota_nomes_lista !== undefined) dbUpdates.cota_nomes_lista = updates.cota_nomes_lista;
  if (updates.taxa_nome_excedente !== undefined) dbUpdates.taxa_nome_excedente = updates.taxa_nome_excedente;
  if (updates.cota_cortesias !== undefined) dbUpdates.cota_cortesias = updates.cota_cortesias;
  if (updates.taxa_cortesia_excedente_pct !== undefined)
    dbUpdates.taxa_cortesia_excedente_pct = updates.taxa_cortesia_excedente_pct;
  if (updates.prazo_pagamento_dias !== undefined) dbUpdates.prazo_pagamento_dias = updates.prazo_pagamento_dias;
  if (updates.tipoFluxo !== undefined) dbUpdates.tipo_fluxo = updates.tipoFluxo;
  if (updates.statusEvento !== undefined) dbUpdates.status_evento = updates.statusEvento;
  if (updates.socioConvidadoId !== undefined) dbUpdates.socio_convidado_id = updates.socioConvidadoId;
  if (updates.splitProdutor !== undefined) dbUpdates.split_produtor = updates.splitProdutor;
  if (updates.splitSocio !== undefined) dbUpdates.split_socio = updates.splitSocio;
  if (updates.permissoesProdutor !== undefined) dbUpdates.permissoes_produtor = updates.permissoesProdutor;
  if (updates.motivoRejeicao !== undefined) dbUpdates.motivo_rejeicao = updates.motivoRejeicao;
  if (updates.rodadaNegociacao !== undefined) dbUpdates.rodada_negociacao = updates.rodadaNegociacao;
  if (updates.formato !== undefined) {
    dbUpdates.formato = updates.formato;
    dbUpdates.categoria = updates.formato;
  }
  if (updates.estilos !== undefined) dbUpdates.estilos = updates.estilos;
  if (updates.experiencias !== undefined) dbUpdates.experiencias = updates.experiencias;
  if (updates.categoria !== undefined) dbUpdates.categoria = updates.categoria;
  if (updates.subcategorias !== undefined) dbUpdates.subcategorias = updates.subcategorias;

  if (Object.keys(dbUpdates).length > 0) {
    const { error } = await supabase.from('eventos_admin').update(dbUpdates).eq('id', id);
    if (error) throw new Error(`Erro ao atualizar evento: ${error.message}`);
  }

  // Upsert inteligente de lotes + variações
  if (updates.lotes) {
    // Buscar lotes existentes no DB
    const { data: dbLotes } = await supabase.from('lotes').select('id').eq('evento_id', id);
    const dbLoteIds = new Set((dbLotes ?? []).map((l: { id: string }) => l.id));
    const newLoteIds = new Set(updates.lotes.map(l => l.id));

    // Deletar lotes removidos (cascade deleta variacoes_ingresso via FK)
    const lotesToDelete = [...dbLoteIds].filter(lid => !newLoteIds.has(lid));
    if (lotesToDelete.length > 0) {
      const { error: errVarDel } = await supabase.from('variacoes_ingresso').delete().in('lote_id', lotesToDelete);
      if (errVarDel) console.error('[updateEvento] delete variações:', errVarDel);
      const { error: errLotDel } = await supabase.from('lotes').delete().in('id', lotesToDelete);
      if (errLotDel) console.error('[updateEvento] delete lotes:', errLotDel);
    }

    for (let i = 0; i < updates.lotes.length; i++) {
      const lote = updates.lotes[i];
      if (dbLoteIds.has(lote.id)) {
        // Update lote existente
        await supabase
          .from('lotes')
          .update({
            nome: lote.nome,
            data_validade: lote.dataValidade ?? null,
            ativo: lote.ativo,
            ordem: i,
            virar_pct: lote.virarPct ?? null,
          })
          .eq('id', lote.id);
      } else {
        // Insert novo lote
        const { data: loteInserted } = await supabase
          .from('lotes')
          .insert({
            evento_id: id,
            nome: lote.nome,
            data_validade: lote.dataValidade ?? null,
            ativo: lote.ativo,
            ordem: i,
            virar_pct: lote.virarPct ?? null,
          })
          .select('id')
          .single();
        if (loteInserted) lote.id = loteInserted.id as string;
      }

      // Upsert variações do lote
      const { data: dbVars } = await supabase.from('variacoes_ingresso').select('id').eq('lote_id', lote.id);
      const dbVarIds = new Set((dbVars ?? []).map((v: { id: string }) => v.id));
      const newVarIds = new Set(lote.variacoes.map(v => v.id));

      // Deletar variações removidas
      const varsToDelete = [...dbVarIds].filter(vid => !newVarIds.has(vid));
      if (varsToDelete.length > 0) {
        await supabase.from('variacoes_ingresso').delete().in('id', varsToDelete);
      }

      for (const v of lote.variacoes) {
        if (dbVarIds.has(v.id)) {
          await supabase
            .from('variacoes_ingresso')
            .update({
              area: v.area,
              area_custom: v.areaCustom ?? null,
              genero: v.genero,
              valor: v.valor,
              limite: v.limite,
              requer_comprovante: v.requerComprovante ?? false,
              tipo_comprovante: v.tipoComprovante ?? null,
            })
            .eq('id', v.id);
        } else {
          await supabase.from('variacoes_ingresso').insert({
            lote_id: lote.id,
            area: v.area,
            area_custom: v.areaCustom ?? null,
            genero: v.genero,
            valor: v.valor,
            limite: v.limite,
            vendidos: 0,
            requer_comprovante: v.requerComprovante ?? false,
            tipo_comprovante: v.tipoComprovante ?? null,
          });
        }
      }
    }
  }

  // Upsert inteligente de equipe + notifica novos membros
  if (updates.equipe) {
    // Snapshot da equipe antes (para detectar novos)
    const equipeAnterior = new Set((EVENTOS_ADMIN.find(e => e.id === id)?.equipe ?? []).map(e => e.id));
    const eventoNome = EVENTOS_ADMIN.find(e => e.id === id)?.nome ?? '';

    // Deletar equipe antiga e reinserir
    const { error: errEquipeDel } = await supabase.from('equipe_evento').delete().eq('evento_id', id);
    if (errEquipeDel) console.error('[updateEvento] delete equipe:', errEquipeDel);
    for (const m of updates.equipe) {
      const { error: errEquipeIns } = await supabase.from('equipe_evento').insert({
        evento_id: id,
        membro_id: m.id,
        papel: m.papel,
        permissoes: m.permissoes ?? [],
      });
      if (errEquipeIns) console.error('[updateEvento] insert equipe:', errEquipeIns);
      // Notifica apenas membros novos
      if (!errEquipeIns && !equipeAnterior.has(m.id)) {
        void notificarEscalacao(m.id, m.papel, id, eventoNome);
      }
    }
  }

  // Atualiza cache local imediato
  const idx = EVENTOS_ADMIN.findIndex(e => e.id === id);
  if (idx !== -1) EVENTOS_ADMIN[idx] = { ...EVENTOS_ADMIN[idx], ...updates };
  bumpVersion();
};

// ── 9p: Aprovação de edição em eventos publicados ───────────────────────────

/**
 * Submete edição para aprovação (evento ATIVO) ou salva direto (rascunho).
 * Retorna true se foi para fila de aprovação, false se salvou direto.
 */
export const submeterEdicao = async (
  eventoId: string,
  updates: Partial<Omit<EventoAdmin, 'id' | 'criadoEm'>>,
  userId: string,
): Promise<boolean> => {
  const ev = EVENTOS_ADMIN.find(e => e.id === eventoId);
  if (!ev) return false;

  // Se evento está ATIVO (publicado), vai para fila de aprovação
  if (ev.statusEvento === 'ATIVO' || ev.publicado) {
    // Salva snapshot das mudanças como JSONB
    const snapshot: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(updates)) {
      if (v !== undefined) snapshot[k] = v;
    }

    await supabase
      .from('eventos_admin')
      .update({
        edicao_pendente: snapshot as unknown as Json,
        edicao_status: 'PENDENTE',
        edicao_motivo: null,
      })
      .eq('id', eventoId);

    // Atualiza cache local
    const idx = EVENTOS_ADMIN.findIndex(e => e.id === eventoId);
    if (idx !== -1) {
      EVENTOS_ADMIN[idx].edicaoPendente = snapshot;
      EVENTOS_ADMIN[idx].edicaoStatus = 'PENDENTE';
      EVENTOS_ADMIN[idx].edicaoMotivo = undefined;
    }
    bumpVersion();

    // Notifica master/sócio
    try {
      const { notificationsService } = await import('./notificationsService');
      void notificationsService.add({
        tipo: 'SISTEMA',
        titulo: 'Edição pendente de aprovação',
        mensagem: `Edição em "${ev.nome}" aguardando aprovação`,
        link: eventoId,
        lida: false,
        timestamp: ts(),
      });
    } catch {
      /* silencioso */
    }

    return true; // foi para fila
  }

  // Evento não publicado: salva direto
  await updateEvento(eventoId, updates);
  return false;
};

/**
 * Aprova edição pendente: aplica as mudanças e limpa campos de edição.
 */
export const aprovarEdicao = async (eventoId: string, aprovadorId: string): Promise<void> => {
  const ev = EVENTOS_ADMIN.find(e => e.id === eventoId);
  if (!ev?.edicaoPendente) return;

  // Aplica as mudanças do snapshot
  await updateEvento(eventoId, ev.edicaoPendente as Partial<Omit<EventoAdmin, 'id' | 'criadoEm'>>);

  // Limpa campos de edição
  await supabase
    .from('eventos_admin')
    .update({
      edicao_pendente: null,
      edicao_status: 'APROVADA',
      edicao_motivo: null,
    })
    .eq('id', eventoId);

  const idx = EVENTOS_ADMIN.findIndex(e => e.id === eventoId);
  if (idx !== -1) {
    EVENTOS_ADMIN[idx].edicaoPendente = undefined;
    EVENTOS_ADMIN[idx].edicaoStatus = 'APROVADA';
    EVENTOS_ADMIN[idx].edicaoMotivo = undefined;
  }
  bumpVersion();

  // Notifica produtor
  try {
    const { notificationsService } = await import('./notificationsService');
    if (ev.criadorId) {
      void notificationsService.add(
        {
          tipo: 'SISTEMA',
          titulo: 'Edição aprovada',
          mensagem: `Suas edições em "${ev.nome}" foram aprovadas`,
          link: eventoId,
          lida: false,
          timestamp: ts(),
        },
        ev.criadorId,
      );
    }
  } catch {
    /* silencioso */
  }
};

/**
 * Rejeita edição pendente com motivo.
 */
export const rejeitarEdicao = async (eventoId: string, rejeitadorId: string, motivo: string): Promise<void> => {
  await supabase
    .from('eventos_admin')
    .update({
      edicao_pendente: null,
      edicao_status: 'REJEITADA',
      edicao_motivo: motivo,
    })
    .eq('id', eventoId);

  const ev = EVENTOS_ADMIN.find(e => e.id === eventoId);
  const idx = EVENTOS_ADMIN.findIndex(e => e.id === eventoId);
  if (idx !== -1) {
    EVENTOS_ADMIN[idx].edicaoPendente = undefined;
    EVENTOS_ADMIN[idx].edicaoStatus = 'REJEITADA';
    EVENTOS_ADMIN[idx].edicaoMotivo = motivo;
  }
  bumpVersion();

  // Notifica produtor
  try {
    const { notificationsService } = await import('./notificationsService');
    if (ev?.criadorId) {
      void notificationsService.add(
        {
          tipo: 'SISTEMA',
          titulo: 'Edição rejeitada',
          mensagem: `Suas edições em "${ev.nome}" foram rejeitadas: ${motivo}`,
          link: eventoId,
          lida: false,
          timestamp: ts(),
        },
        ev.criadorId,
      );
    }
  } catch {
    /* silencioso */
  }
};

export const getNomeById = async (userId: string): Promise<string> => {
  const { data } = await supabase.from('profiles').select('nome').eq('id', userId).single();
  return (data?.nome as string) ?? 'Produtor';
};

/**
 * Solicita cancelamento de evento — hierarquia: sócio→gerente→master.
 * Cada etapa notifica o próximo nível e gera log.
 */
export const solicitarCancelamento = async (
  eventoId: string,
  motivo: string,
  solicitanteId: string,
  solicitanteNome: string,
): Promise<boolean> => {
  const ev = EVENTOS_ADMIN.find(e => e.id === eventoId);
  if (!ev) return false;

  // Atualiza no banco
  const { error } = await supabase
    .from('eventos_admin')
    .update({
      status_evento: 'CANCELADO',
      cancelamento_solicitado_por: solicitanteId,
      cancelamento_motivo: motivo,
      updated_at: ts(),
    })
    .eq('id', eventoId);

  if (error) {
    console.error('[eventosAdminCrud] solicitarCancelamento erro:', error);
    return false;
  }

  // Cache
  const idx = EVENTOS_ADMIN.findIndex(e => e.id === eventoId);
  if (idx !== -1) {
    EVENTOS_ADMIN[idx] = { ...EVENTOS_ADMIN[idx], statusEvento: 'CANCELADO' };
  }
  bumpVersion();

  // Audit log
  auditService.log(
    solicitanteId,
    'INTERVENCAO_MASTER',
    'evento',
    eventoId,
    { eventoNome: ev.nome, acao: 'CANCELAMENTO', motivo },
    undefined,
    solicitanteNome,
  );

  // Notificar toda a cadeia
  const notifyIds: string[] = [];

  // Criador (gerente)
  if (ev.criadorId && ev.criadorId !== solicitanteId) {
    notifyIds.push(ev.criadorId);
  }

  // Sócio do evento (via RBAC — cargo SOCIO na comunidade)
  const { data: socios } = await supabase
    .from('atribuicoes_rbac')
    .select('user_id')
    .eq('tenant_type', 'COMUNIDADE')
    .eq('tenant_id', ev.comunidadeId)
    .eq('cargo', 'SOCIO')
    .eq('ativo', true);
  if (socios) {
    for (const s of socios) {
      const sid = s.user_id as string;
      if (sid !== solicitanteId && !notifyIds.includes(sid)) notifyIds.push(sid);
    }
  }

  // Masters
  const { data: masters } = await supabase.from('profiles').select('id').eq('role', 'vanta_masteradm');
  if (masters) {
    for (const m of masters) {
      const mid = m.id as string;
      if (mid !== solicitanteId && !notifyIds.includes(mid)) notifyIds.push(mid);
    }
  }

  if (notifyIds.length > 0) {
    void notifyMany(notifyIds, {
      tipo: 'EVENTO_CANCELADO',
      titulo: 'Evento cancelado',
      mensagem: `O evento "${ev.nome}" foi cancelado. Motivo: ${motivo}`,
      link: eventoId,
    });
  }

  return true;
};
