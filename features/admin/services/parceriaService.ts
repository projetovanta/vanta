import { supabase } from '../../../services/supabaseClient';
import { notify } from '../../../services/notifyService';
import { Database } from '../../../types/supabase';

type SolicitacaoParceriaRow = Database['public']['Tables']['solicitacoes_parceria']['Row'];

export interface SolicitacaoParceria {
  id: string;
  userId: string;
  tipo: 'ESPACO_FIXO' | 'PRODUTORA';
  nome: string;
  cidade: string;
  categoria: string;
  capacidadeMedia?: string;
  tempoMercado?: string;
  instagram: string;
  emailContato?: string;
  telefone?: string;
  site?: string;
  fotos: string[];
  googleMaps?: string;
  intencoes: string[];
  publicoAlvo: string[];
  estilos: string[];
  frequencia?: string;
  mediaPublico?: string;
  aceiteTermos: boolean;
  aceiteTermosEm?: string;
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA';
  motivoRejeicao?: string;
  analisadoPor?: string;
  analisadoEm?: string;
  comunidadeCriadaId?: string;
  criadoEm: string;
  // Join
  userName?: string;
  userFoto?: string;
  userInstagram?: string;
}

const mapRow = (
  row: SolicitacaoParceriaRow,
  profile?: { nome: string | null; foto: string | null; instagram: string | null },
): SolicitacaoParceria => ({
  id: row.id,
  userId: row.user_id,
  tipo: row.tipo as SolicitacaoParceria['tipo'],
  nome: row.nome,
  cidade: row.cidade,
  categoria: row.categoria,
  capacidadeMedia: row.capacidade_media ?? undefined,
  tempoMercado: row.tempo_mercado ?? undefined,
  instagram: row.instagram,
  emailContato: row.email_contato ?? undefined,
  telefone: row.telefone ?? undefined,
  site: row.site ?? undefined,
  fotos: row.fotos ?? [],
  googleMaps: row.google_maps ?? undefined,
  intencoes: row.intencoes ?? [],
  publicoAlvo: row.publico_alvo ?? [],
  estilos: row.estilos ?? [],
  frequencia: row.frequencia ?? undefined,
  mediaPublico: row.media_publico ?? undefined,
  aceiteTermos: row.aceite_termos,
  aceiteTermosEm: row.aceite_termos_em ?? undefined,
  status: row.status as SolicitacaoParceria['status'],
  motivoRejeicao: row.motivo_rejeicao ?? undefined,
  analisadoPor: row.analisado_por ?? undefined,
  analisadoEm: row.analisado_em ?? undefined,
  comunidadeCriadaId: row.comunidade_criada_id ?? undefined,
  criadoEm: row.criado_em,
  userName: profile?.nome ?? undefined,
  userFoto: profile?.foto ?? undefined,
  userInstagram: profile?.instagram ?? undefined,
});

// Timestamp BRT
const nowBRT = () => new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';

export const parceriaService = {
  /** Criar solicitação (usuário logado) */
  async criar(data: {
    tipo: 'ESPACO_FIXO' | 'PRODUTORA';
    nome: string;
    cidade: string;
    categoria: string;
    capacidadeMedia?: string;
    tempoMercado?: string;
    instagram: string;
    emailContato?: string;
    telefone?: string;
    site?: string;
    fotos?: string[];
    googleMaps?: string;
    intencoes: string[];
    publicoAlvo?: string[];
    estilos?: string[];
    frequencia?: string;
    mediaPublico?: string;
  }): Promise<string | null> {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return null;

    const { data: inserted, error } = await supabase
      .from('solicitacoes_parceria')
      .insert({
        user_id: authData.user.id,
        tipo: data.tipo,
        nome: data.nome,
        cidade: data.cidade,
        categoria: data.categoria,
        capacidade_media: data.capacidadeMedia ?? null,
        tempo_mercado: data.tempoMercado ?? null,
        instagram: data.instagram,
        email_contato: data.emailContato ?? null,
        telefone: data.telefone ?? null,
        site: data.site ?? null,
        fotos: data.fotos ?? [],
        google_maps: data.googleMaps ?? null,
        intencoes: data.intencoes,
        publico_alvo: data.publicoAlvo ?? [],
        estilos: data.estilos ?? [],
        frequencia: data.frequencia ?? null,
        media_publico: data.mediaPublico ?? null,
        aceite_termos: true,
        aceite_termos_em: nowBRT(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('[parceriaService] criar erro:', error);
      return null;
    }

    // Notificar master sobre nova solicitação
    try {
      const { data: masters } = await supabase.from('profiles').select('id').eq('role', 'vanta_masteradm');
      for (const m of masters ?? []) {
        notify({
          userId: m.id,
          titulo: 'Nova solicitação de parceria',
          mensagem: `${data.nome} (${data.cidade}) enviou uma solicitação de parceria.`,
          tipo: 'PARCERIA_NOVA',
          link: `/admin/solicitacoes`,
        });
      }
    } catch (e) {
      console.error('[parceriaService] notif master falhou:', e);
    }

    return inserted?.id ?? null;
  },

  /** Listar solicitações do usuário logado */
  async minhasSolicitacoes(): Promise<SolicitacaoParceria[]> {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return [];

    const { data, error } = await supabase
      .from('solicitacoes_parceria')
      .select('*')
      .eq('user_id', authData.user.id)
      .order('criado_em', { ascending: false });

    if (error) {
      console.error('[parceriaService] minhasSolicitacoes erro:', error);
      return [];
    }
    return (data ?? []).map(r => mapRow(r));
  },

  /** Listar pendentes (master) */
  async listarPendentes(): Promise<SolicitacaoParceria[]> {
    const { data, error } = await supabase
      .from('solicitacoes_parceria')
      .select('*, profiles!solicitacoes_parceria_user_id_fkey(nome, foto, instagram)')
      .eq('status', 'PENDENTE')
      .order('criado_em', { ascending: true });

    if (error) {
      console.error('[parceriaService] listarPendentes erro:', error);
      return [];
    }
    return (data ?? []).map((r: Record<string, unknown>) => {
      const profile = r.profiles as { nome: string | null; foto: string | null; instagram: string | null } | null;
      const row = r as unknown as SolicitacaoParceriaRow;
      return mapRow(row, profile ?? undefined);
    });
  },

  /** Listar todas (master, com filtro) */
  async listarTodas(status?: string): Promise<SolicitacaoParceria[]> {
    let query = supabase
      .from('solicitacoes_parceria')
      .select('*, profiles!solicitacoes_parceria_user_id_fkey(nome, foto, instagram)')
      .order('criado_em', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) {
      console.error('[parceriaService] listarTodas erro:', error);
      return [];
    }
    return (data ?? []).map((r: Record<string, unknown>) => {
      const profile = r.profiles as { nome: string | null; foto: string | null; instagram: string | null } | null;
      const row = r as unknown as SolicitacaoParceriaRow;
      return mapRow(row, profile ?? undefined);
    });
  },

  /** Aprovar solicitação (master) */
  async aprovar(solicitacaoId: string, comunidadeId: string): Promise<boolean> {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return false;

    // Buscar user_id e nome antes de atualizar
    const { data: sol } = await supabase
      .from('solicitacoes_parceria')
      .select('user_id, nome')
      .eq('id', solicitacaoId)
      .maybeSingle();

    const { error } = await supabase
      .from('solicitacoes_parceria')
      .update({
        status: 'APROVADA',
        analisado_por: authData.user.id,
        analisado_em: nowBRT(),
        comunidade_criada_id: comunidadeId,
      })
      .eq('id', solicitacaoId);

    if (error) {
      console.error('[parceriaService] aprovar erro:', error);
      return false;
    }

    // Notificar solicitante (3 canais)
    if (sol?.user_id) {
      notify({
        userId: sol.user_id,
        titulo: 'Parceria aprovada!',
        mensagem: `Sua solicitação para "${sol.nome}" foi aprovada. Bem-vindo à rede VANTA!`,
        tipo: 'PARCERIA_APROVADA',
        link: `/admin`,
      });
    }

    return true;
  },

  /** Rejeitar solicitação (master) */
  async rejeitar(solicitacaoId: string, motivo: string): Promise<boolean> {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return false;

    // Buscar user_id e nome antes de atualizar
    const { data: sol } = await supabase
      .from('solicitacoes_parceria')
      .select('user_id, nome')
      .eq('id', solicitacaoId)
      .maybeSingle();

    const { error } = await supabase
      .from('solicitacoes_parceria')
      .update({
        status: 'REJEITADA',
        motivo_rejeicao: motivo,
        analisado_por: authData.user.id,
        analisado_em: nowBRT(),
      })
      .eq('id', solicitacaoId);

    if (error) {
      console.error('[parceriaService] rejeitar erro:', error);
      return false;
    }

    // Notificar solicitante (3 canais)
    if (sol?.user_id) {
      notify({
        userId: sol.user_id,
        titulo: 'Solicitação de parceria analisada',
        mensagem: `Sua solicitação para "${sol.nome}" não foi aprovada neste momento. Motivo: ${motivo}`,
        tipo: 'PARCERIA_REJEITADA',
        link: `/perfil`,
      });
    }

    return true;
  },

  /** Upload de fotos para o bucket parceria-fotos. Retorna array de URLs públicas. */
  async uploadFotos(files: File[]): Promise<string[]> {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return [];

    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${authData.user.id}/${Date.now()}_${i}.${ext}`;

      const { error } = await supabase.storage
        .from('parceria-fotos')
        .upload(path, file, { upsert: true, contentType: file.type });

      if (error) {
        console.error('[parceriaService] upload foto erro:', error);
        continue;
      }

      const { data: urlData } = supabase.storage.from('parceria-fotos').getPublicUrl(path);
      urls.push(urlData.publicUrl);
    }
    return urls;
  },

  /** Verificar se o usuário já tem solicitação pendente */
  async temSolicitacaoPendente(): Promise<boolean> {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return false;

    const { count, error } = await supabase
      .from('solicitacoes_parceria')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', authData.user.id)
      .eq('status', 'PENDENTE');

    if (error) return false;
    return (count ?? 0) > 0;
  },
};
