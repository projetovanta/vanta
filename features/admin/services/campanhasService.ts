/**
 * campanhasService — Disparo de campanhas multi-canal (In-App, Push, Email).
 * Acesso: somente vanta_masteradm.
 */
import { supabase } from '../../../services/supabaseClient';
import { notificationsService } from './notificationsService';

import { tsBR } from '../../../utils';

export type CanalCampanha = 'IN_APP' | 'PUSH' | 'EMAIL';

export type SegmentoAlvo =
  | { tipo: 'TODOS' }
  | { tipo: 'TAG'; tag: string }
  | { tipo: 'COMUNIDADE'; comunidadeId: string }
  | { tipo: 'EVENTO'; eventoId: string }
  | { tipo: 'CIDADE'; cidade: string };

interface CampanhaPayload {
  titulo: string;
  mensagem: string;
  canais: CanalCampanha[];
  segmento: SegmentoAlvo;
  tipoNotif?:
    | 'EVENTO'
    | 'AMIGO'
    | 'SISTEMA'
    | 'ANIVERSARIO'
    | 'FRIEND_REQUEST'
    | 'FRIEND_ACCEPTED'
    | 'SOCIO_ADICIONADO'
    | 'CORTESIA_PENDENTE'
    | 'REVIEW'
    | 'TRANSFERENCIA_PENDENTE';
  linkNotif?: string;
}

export interface CampanhaResultado {
  inApp: { enviados: number; erros: number };
  push: { enviados: number; erros: number };
  email: { enviados: number; erros: number };
}

interface Destinatario {
  userId: string;
  email: string;
  nome: string;
}

export const campanhasService = {
  /** Resolve lista de destinatários com base no segmento */
  async resolverDestinatarios(segmento: SegmentoAlvo): Promise<Destinatario[]> {
    switch (segmento.tipo) {
      case 'TODOS': {
        const { data } = await supabase.from('profiles').select('id, email, nome').limit(2000);
        return (data ?? []).map(r => ({
          userId: r.id,
          email: r.email ?? '',
          nome: r.nome ?? '',
        }));
      }
      case 'TAG': {
        const { data } = await supabase
          .from('membros_clube')
          .select('user_id, profiles!inner(email, nome)')
          .contains('tags', [segmento.tag])
          .limit(2000);
        return (data ?? []).map((r: Record<string, unknown>) => {
          const p = r.profiles as Record<string, unknown> | null;
          return {
            userId: r.user_id as string,
            email: (p?.email as string) ?? '',
            nome: (p?.nome as string) ?? '',
          };
        });
      }
      case 'COMUNIDADE': {
        // FK para profiles dropada — buscar user_ids e depois profiles
        const { data: follows } = await supabase
          .from('community_follows')
          .select('user_id')
          .eq('comunidade_id', segmento.comunidadeId)
          .limit(2000);
        const userIds = (follows ?? []).map(r => r.user_id);
        if (!userIds.length) return [];
        const { data: profs } = await supabase.from('profiles').select('id, email, nome').in('id', userIds);
        return (profs ?? []).map(p => ({
          userId: p.id,
          email: p.email ?? '',
          nome: p.nome ?? '',
        }));
      }
      case 'EVENTO': {
        // FK para profiles dropada — buscar owner_ids e depois profiles
        const { data: tickets } = await supabase
          .from('tickets_caixa')
          .select('owner_id')
          .eq('evento_id', segmento.eventoId)
          .limit(2000);
        const ownerIds = [...new Set((tickets ?? []).map(r => r.owner_id))];
        if (!ownerIds.length) return [];
        const { data: profs } = await supabase.from('profiles').select('id, email, nome').in('id', ownerIds);
        return (profs ?? []).map(p => ({
          userId: p.id,
          email: p.email ?? '',
          nome: p.nome ?? '',
        }));
      }
      case 'CIDADE': {
        const { data } = await supabase
          .from('profiles')
          .select('id, email, nome')
          .eq('cidade', segmento.cidade)
          .limit(2000);
        return (data ?? []).map(r => ({
          userId: r.id,
          email: r.email ?? '',
          nome: r.nome ?? '',
        }));
      }
      default:
        return [];
    }
  },

  /** Conta destinatários sem buscar todos os dados */
  async contarDestinatarios(segmento: SegmentoAlvo): Promise<number> {
    switch (segmento.tipo) {
      case 'TODOS': {
        const { count } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
        return count ?? 0;
      }
      case 'TAG': {
        const { count } = await supabase
          .from('membros_clube')
          .select('id', { count: 'exact', head: true })
          .contains('tags', [segmento.tag]);
        return count ?? 0;
      }
      case 'COMUNIDADE': {
        const { count } = await supabase
          .from('community_follows')
          .select('id', { count: 'exact', head: true })
          .eq('comunidade_id', segmento.comunidadeId);
        return count ?? 0;
      }
      case 'EVENTO': {
        const { data } = await supabase
          .from('tickets_caixa')
          .select('owner_id')
          .eq('evento_id', segmento.eventoId)
          .limit(2000);
        return new Set((data ?? []).map(r => r.owner_id)).size;
      }
      case 'CIDADE': {
        const { count } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('cidade', segmento.cidade);
        return count ?? 0;
      }
      default:
        return 0;
    }
  },

  /** Busca lista de comunidades para dropdown */
  async getComunidades(): Promise<{ id: string; nome: string }[]> {
    const { data } = await supabase.from('comunidades').select('id, nome').order('nome').limit(1000);
    return (data ?? []).map(r => ({ id: r.id, nome: r.nome }));
  },

  /** Busca lista de eventos para dropdown */
  async getEventos(): Promise<{ id: string; nome: string }[]> {
    const { data } = await supabase
      .from('eventos_admin')
      .select('id, nome')
      .order('data_inicio', { ascending: false })
      .limit(50);
    return (data ?? []).map(r => ({ id: r.id, nome: r.nome }));
  },

  /** Busca cidades distintas dos profiles */
  async getCidades(): Promise<string[]> {
    const { data } = await supabase.from('profiles').select('cidade').not('cidade', 'is', null).limit(2000);
    const cidades = new Set<string>();
    (data ?? []).forEach(r => {
      const c = r.cidade;
      if (c?.trim()) cidades.add(c.trim());
    });
    return [...cidades].sort();
  },

  /** Dispara campanha nos canais selecionados */
  async disparar(payload: CampanhaPayload): Promise<CampanhaResultado> {
    const resultado: CampanhaResultado = {
      inApp: { enviados: 0, erros: 0 },
      push: { enviados: 0, erros: 0 },
      email: { enviados: 0, erros: 0 },
    };

    const destinatarios = await campanhasService.resolverDestinatarios(payload.segmento);
    if (destinatarios.length === 0) return resultado;

    // In-App — processa sequencialmente para detectar RLS block cedo
    if (payload.canais.includes('IN_APP')) {
      let rlsBlocked = false;
      for (const d of destinatarios) {
        if (rlsBlocked) {
          resultado.inApp.erros++;
          continue;
        }
        try {
          await notificationsService.add(
            {
              titulo: payload.titulo,
              mensagem: payload.mensagem,
              tipo: payload.tipoNotif ?? 'SISTEMA',
              lida: false,
              link: payload.linkNotif ?? '',
              timestamp: tsBR(),
            },
            d.userId,
          );
          resultado.inApp.enviados++;
        } catch (err: unknown) {
          resultado.inApp.erros++;
          // Se é RLS block, para de tentar os demais
          if (err && typeof err === 'object' && 'code' in err && (err as Record<string, unknown>).code === '42501') {
            rlsBlocked = true;
            resultado.inApp.erros += destinatarios.length - resultado.inApp.enviados - resultado.inApp.erros;
            break;
          }
        }
      }
    }

    // Push
    if (payload.canais.includes('PUSH')) {
      try {
        const userIds = destinatarios.map(d => d.userId);
        const res = await supabase.functions.invoke('send-push', {
          body: {
            userIds,
            title: payload.titulo,
            body: payload.mensagem,
            data: { link: payload.linkNotif ?? '', tipo: payload.tipoNotif ?? 'SISTEMA' },
          },
        });
        const body = res.data as Record<string, unknown> | null;
        if (res.error) {
          resultado.push.erros = destinatarios.length;
        } else {
          resultado.push.enviados = (body?.sent as number) ?? 0;
          const total = (body?.total as number) ?? 0;
          // Erros reais = tokens que falharam, não usuários sem token
          resultado.push.erros = total > 0 ? total - resultado.push.enviados : 0;
        }
      } catch {
        resultado.push.erros = destinatarios.length;
      }
    }

    // Email
    if (payload.canais.includes('EMAIL')) {
      let emailAborted = false;
      const BATCH = 5;
      for (let i = 0; i < destinatarios.length; i += BATCH) {
        if (emailAborted) {
          resultado.email.erros += Math.min(BATCH, destinatarios.length - i);
          continue;
        }
        const batch = destinatarios.slice(i, i + BATCH);
        const promises = batch.map(async d => {
          if (emailAborted) {
            resultado.email.erros++;
            return;
          }
          try {
            const res = await supabase.functions.invoke('send-invite', {
              body: { nome: d.nome, email: d.email, mensagem: payload.mensagem, tipo: 'broadcast' },
            });
            const body = res.data as Record<string, unknown> | null;
            if (res.error || !body?.ok) {
              resultado.email.erros++;
              // Qualquer erro de auth/server → abortar restante
              if (res.error) emailAborted = true;
            } else {
              resultado.email.enviados++;
            }
          } catch {
            resultado.email.erros++;
            emailAborted = true;
          }
        });
        await Promise.all(promises);
      }
    }

    return resultado;
  },
};
