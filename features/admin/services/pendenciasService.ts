import { supabase } from '../../../services/supabaseClient';
import { eventosAdminService } from './eventosAdminService';
import { getReembolsosPendentes } from './reembolsoService';
import { parceriaService } from './parceriaService';
import type { ContaVanta } from '../../../types';

export interface PendenciaItem {
  id: string;
  tipo: PendenciaTipo;
  titulo: string;
  descricao: string;
  criadoEm: string;
  /** AdminSubView para navegar ao clicar */
  destino: string;
}

export type PendenciaTipo =
  | 'CURADORIA'
  | 'EVENTO_PENDENTE'
  | 'EDICAO_PENDENTE'
  | 'REEMBOLSO_MANUAL'
  | 'SAQUE_PENDENTE'
  | 'PARCERIA_PENDENTE'
  | 'COMEMORACAO_PENDENTE'
  | 'CONVITE_SOCIO'
  | 'PROPOSTA_VANTA'
  | 'EVENTO_PRIVADO';

/** Busca todas as pendências para o cargo do usuário */
export async function getPendencias(
  userId: string,
  role: ContaVanta,
  comunidadeIds: string[],
  eventoIds: string[],
): Promise<PendenciaItem[]> {
  const items: PendenciaItem[] = [];

  const promises: Promise<void>[] = [];

  // ── MASTER ──────────────────────────────────────────────────────────────
  if (role === 'vanta_masteradm') {
    // Curadoria MAIS VANTA — solicitações pendentes
    promises.push(
      import('./clubeService').then(({ clubeService }) => {
        const solicitacoes = clubeService.getSolicitacoesPendentes();
        if (solicitacoes.length > 0) {
          items.push({
            id: 'curadoria',
            tipo: 'CURADORIA',
            titulo: 'Curadoria MAIS VANTA',
            descricao: `${solicitacoes.length} solicitaç${solicitacoes.length > 1 ? 'ões' : 'ão'} pendente${solicitacoes.length > 1 ? 's' : ''}`,
            criadoEm: solicitacoes[0]?.criadoEm ?? '',
            destino: 'CURADORIA_MV',
          });
        }
      }),
    );

    // Eventos pendentes de aprovação
    promises.push(
      Promise.resolve().then(() => {
        const pendentes = eventosAdminService.getEventosPendentes();
        if (pendentes.length > 0) {
          items.push({
            id: 'eventos-pendentes',
            tipo: 'EVENTO_PENDENTE',
            titulo: 'Eventos aguardando aprovação',
            descricao: `${pendentes.length} evento${pendentes.length > 1 ? 's' : ''} pendente${pendentes.length > 1 ? 's' : ''}`,
            criadoEm: pendentes[0]?.criadoEm ?? '',
            destino: 'PENDENTES',
          });
        }
      }),
    );

    // Edições pendentes
    promises.push(
      Promise.resolve().then(() => {
        const edicoes = eventosAdminService.getEventos().filter(e => e.edicaoStatus === 'PENDENTE');
        if (edicoes.length > 0) {
          items.push({
            id: 'edicoes-pendentes',
            tipo: 'EDICAO_PENDENTE',
            titulo: 'Edições aguardando aprovação',
            descricao: `${edicoes.length} edição${edicoes.length > 1 ? 'ões' : ''} pendente${edicoes.length > 1 ? 's' : ''}`,
            criadoEm: '',
            destino: 'PENDENTES',
          });
        }
      }),
    );

    // Reembolsos manuais
    promises.push(
      getReembolsosPendentes().then(reembolsos => {
        if (reembolsos.length > 0) {
          items.push({
            id: 'reembolsos',
            tipo: 'REEMBOLSO_MANUAL',
            titulo: 'Reembolsos aguardando aprovação',
            descricao: `${reembolsos.length} reembolso${reembolsos.length > 1 ? 's' : ''} manual${reembolsos.length > 1 ? 'is' : ''}`,
            criadoEm: '',
            destino: 'FINANCEIRO_MASTER',
          });
        }
      }),
    );

    // Saques pendentes
    promises.push(
      eventosAdminService.getSolicitacoesSaque().then(saques => {
        const pendentes = saques.filter(s => s.status === 'PENDENTE');
        if (pendentes.length > 0) {
          items.push({
            id: 'saques',
            tipo: 'SAQUE_PENDENTE',
            titulo: 'Saques aguardando aprovação',
            descricao: `${pendentes.length} saque${pendentes.length > 1 ? 's' : ''} pendente${pendentes.length > 1 ? 's' : ''}`,
            criadoEm: pendentes[0]?.solicitadoEm ?? '',
            destino: 'FINANCEIRO_MASTER',
          });
        }
      }),
    );

    // Parcerias pendentes
    promises.push(
      parceriaService.listarPendentes().then(parcerias => {
        if (parcerias.length > 0) {
          items.push({
            id: 'parcerias',
            tipo: 'PARCERIA_PENDENTE',
            titulo: 'Solicitações de parceria',
            descricao: `${parcerias.length} solicitação${parcerias.length > 1 ? 'ões' : ''} pendente${parcerias.length > 1 ? 's' : ''}`,
            criadoEm: '',
            destino: 'SOLICITACOES_PARCERIA',
          });
        }
      }),
    );
  }

  // ── SÓCIO ───────────────────────────────────────────────────────────────
  if (role === 'vanta_socio') {
    // Convites de negociação
    promises.push(
      Promise.resolve().then(() => {
        const convites = eventosAdminService.getConvitesPendentes(userId);
        if (convites.length > 0) {
          items.push({
            id: 'convites-socio',
            tipo: 'CONVITE_SOCIO',
            titulo: 'Convites para evento',
            descricao: `${convites.length} convite${convites.length > 1 ? 's' : ''} aguardando resposta`,
            criadoEm: '',
            destino: 'CONVITES_SOCIO',
          });
        }
      }),
    );

    // Propostas VANTA pendentes
    promises.push(
      Promise.resolve().then(() => {
        const propostas = eventosAdminService.getPropostasPendentes(userId);
        if (propostas.length > 0) {
          items.push({
            id: 'propostas-vanta',
            tipo: 'PROPOSTA_VANTA',
            titulo: 'Propostas VANTA',
            descricao: `${propostas.length} proposta${propostas.length > 1 ? 's' : ''} aguardando resposta`,
            criadoEm: '',
            destino: 'CONVITES_SOCIO',
          });
        }
      }),
    );
  }

  // ── SÓCIO — comemoração no evento ───────────────────────────────────────
  if ((role === 'vanta_socio' || role === 'vanta_masteradm') && eventoIds.length > 0) {
    promises.push(
      Promise.resolve(
        supabase
          .from('comemoracoes')
          .select('id, nome_completo, motivo, created_at')
          .in('evento_id', eventoIds)
          .in('status', ['ENVIADA', 'VISUALIZADA', 'EM_ANALISE'])
          .order('created_at', { ascending: false }),
      ).then(({ data }) => {
        if (data?.length) {
          items.push({
            id: 'comemoracao-evento',
            tipo: 'COMEMORACAO_PENDENTE',
            titulo: 'Comemoração aguardando aprovação',
            descricao: `${data.length} solicitação${data.length > 1 ? 'ões' : ''} de comemoração`,
            criadoEm: data[0]?.created_at ?? '',
            destino: 'MEUS_EVENTOS',
          });
        }
      }),
    );
  }

  // ── GERENTE — comemoração na comunidade + evento privado ────────────────
  if ((role === 'vanta_gerente' || role === 'vanta_masteradm') && comunidadeIds.length > 0) {
    // Comemoração na comunidade (sem evento_id = solicitou na comunidade)
    promises.push(
      Promise.resolve(
        supabase
          .from('comemoracoes')
          .select('id, nome_completo, motivo, created_at')
          .in('comunidade_id', comunidadeIds)
          .is('evento_id', null)
          .in('status', ['ENVIADA', 'VISUALIZADA', 'EM_ANALISE'])
          .order('created_at', { ascending: false }),
      ).then(({ data }) => {
        if (data?.length) {
          items.push({
            id: 'comemoracao-comunidade',
            tipo: 'COMEMORACAO_PENDENTE',
            titulo: 'Comemoração aguardando aprovação',
            descricao: `${data.length} solicitação${data.length > 1 ? 'ões' : ''} na comunidade`,
            criadoEm: data[0]?.created_at ?? '',
            destino: 'COMUNIDADES',
          });
        }
      }),
    );

    // Evento privado pendente
    promises.push(
      Promise.resolve(
        supabase
          .from('eventos_privados')
          .select('id, nome_completo, created_at')
          .in('comunidade_id', comunidadeIds)
          .in('status', ['ENVIADA', 'VISUALIZADA', 'EM_ANALISE'])
          .order('created_at', { ascending: false }),
      ).then(({ data }) => {
        if (data?.length) {
          items.push({
            id: 'evento-privado',
            tipo: 'EVENTO_PRIVADO',
            titulo: 'Evento privado aguardando aprovação',
            descricao: `${data.length} solicitação${data.length > 1 ? 'ões' : ''} de evento privado`,
            criadoEm: data[0]?.created_at ?? '',
            destino: 'COMUNIDADES',
          });
        }
      }),
    );
  }

  await Promise.all(promises);

  // Ordenar por data (mais recente primeiro)
  items.sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || ''));

  return items;
}

/** Conta total de pendências (para badge) */
export async function countPendencias(
  userId: string,
  role: ContaVanta,
  comunidadeIds: string[],
  eventoIds: string[],
): Promise<number> {
  const items = await getPendencias(userId, role, comunidadeIds, eventoIds);
  return items.reduce((total, item) => {
    const match = item.descricao.match(/^(\d+)/);
    return total + (match ? parseInt(match[1], 10) : 1);
  }, 0);
}
