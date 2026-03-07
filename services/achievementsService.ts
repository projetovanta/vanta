/**
 * achievementsService — Conquistas e badges baseados em participação real.
 */

import { supabase } from './supabaseClient';

// ── Tipos ────────────────────────────────────────────────────────────────────

export type NivelFrequencia = 'ESTREANTE' | 'FREQUENTADOR' | 'HABITUE' | 'LENDA';

export interface Achievement {
  id: string;
  tipo: 'FREQUENCIA';
  comunidadeId: string;
  comunidadeNome: string;
  comunidadeFoto: string;
  nivel: NivelFrequencia;
  totalEventos: number;
}

export interface Badge {
  id: string;
  nome: string;
  descricao: string;
  icone: string; // nome do ícone lucide-react
  conquistado: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const getNivel = (count: number): NivelFrequencia => {
  if (count >= 25) return 'LENDA';
  if (count >= 10) return 'HABITUE';
  if (count >= 3) return 'FREQUENTADOR';
  return 'ESTREANTE';
};

export const NIVEL_CONFIG: Record<NivelFrequencia, { label: string; cor: string }> = {
  ESTREANTE: { label: 'Estreante', cor: '#CD7F32' },
  FREQUENTADOR: { label: 'Frequentador', cor: '#C0C0C0' },
  HABITUE: { label: 'Habitué', cor: '#FFD300' },
  LENDA: { label: 'Lenda', cor: '#E5E4E2' },
};

// ── Service ──────────────────────────────────────────────────────────────────

export const achievementsService = {
  /** Conquistas de frequência por comunidade */
  async getAchievements(userId: string): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('tickets_caixa')
      .select('evento_id, eventos_admin ( comunidade_id, comunidades ( id, nome, foto ) )')
      .eq('owner_id', userId)
      .eq('status', 'USADO')
      .limit(1000);

    if (error || !data) return [];

    // Agrupar por comunidade, contar eventos distintos
    const map = new Map<string, { nome: string; foto: string; eventos: Set<string> }>();

    for (const row of data as any[]) {
      const ev = row.eventos_admin;
      if (!ev?.comunidade_id || !ev.comunidades) continue;
      const com = ev.comunidades;
      const comId = com.id as string;

      if (!map.has(comId)) {
        map.set(comId, { nome: com.nome, foto: com.foto ?? '', eventos: new Set() });
      }
      map.get(comId)!.eventos.add(row.evento_id);
    }

    return Array.from(map.entries()).map(([comId, val]) => ({
      id: `freq_${comId}`,
      tipo: 'FREQUENCIA' as const,
      comunidadeId: comId,
      comunidadeNome: val.nome,
      comunidadeFoto: val.foto,
      nivel: getNivel(val.eventos.size),
      totalEventos: val.eventos.size,
    }));
  },

  /** Badges globais do sistema */
  async getBadges(userId: string): Promise<Badge[]> {
    // Queries em paralelo
    const [ticketsRes, categoriasRes, amigosRes, reviewsRes] = await Promise.all([
      // Total de eventos distintos frequentados
      supabase.from('tickets_caixa').select('evento_id').eq('owner_id', userId).eq('status', 'USADO').limit(1000),
      // Categorias distintas
      supabase
        .from('tickets_caixa')
        .select('evento_id, eventos_admin ( categoria )')
        .eq('owner_id', userId)
        .eq('status', 'USADO')
        .limit(1000),
      // Amigos
      supabase
        .from('friendships')
        .select('id')
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .eq('status', 'ACCEPTED'),
      // Reviews
      supabase.from('reviews_evento').select('id').eq('user_id', userId),
    ]);

    const totalEventos = new Set((ticketsRes.data ?? []).map((r: any) => r.evento_id)).size;
    const categorias = new Set(
      (categoriasRes.data ?? [])
        .map((r: any) => r.eventos_admin?.formato ?? r.eventos_admin?.categoria)
        .filter(Boolean),
    );
    const totalAmigos = amigosRes.data?.length ?? 0;
    const totalReviews = reviewsRes.data?.length ?? 0;

    return [
      {
        id: 'primeira_festa',
        nome: 'Primeira Festa',
        descricao: 'Participou do primeiro evento',
        icone: 'PartyPopper',
        conquistado: totalEventos >= 1,
      },
      {
        id: 'explorador',
        nome: 'Explorador',
        descricao: 'Eventos em 3+ categorias',
        icone: 'Compass',
        conquistado: categorias.size >= 3,
      },
      {
        id: 'social',
        nome: 'Social',
        descricao: '5+ amigos na plataforma',
        icone: 'Users',
        conquistado: totalAmigos >= 5,
      },
      {
        id: 'critico',
        nome: 'Crítico',
        descricao: 'Deixou 5+ avaliações',
        icone: 'MessageSquare',
        conquistado: totalReviews >= 5,
      },
    ];
  },
};
