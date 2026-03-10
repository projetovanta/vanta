/**
 * authService — autenticação real via Supabase Auth.
 *
 * Responsabilidades:
 *   - signIn / signOut / signUp usando supabase.auth
 *   - Mapeamento de profile Supabase → Membro (interface do app)
 *   - onAuthStateChange → callback para sincronizar estado no React
 *
 * Todas as buscas são feitas via Supabase (zero mocks).
 */

import { supabase } from './supabaseClient';
import { Membro, ContaVanta } from '../types';
import type { Database } from '../types/supabase';
import { DEFAULT_AVATARS } from '../data/avatars';
import { logger } from './logger';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

// ── Avatares padrão por gênero ─────────────────────────────────────────────
const AVATAR_FEMININO = 'https://i.imgur.com/XY8rZZf.png';
const AVATAR_MASCULINO = 'https://i.imgur.com/kXFU8vy.png';

// ── Tipos ──────────────────────────────────────────────────────────────────

export interface SignInResult {
  ok: boolean;
  membro?: Membro;
  erro?: string;
}

export interface SignUpResult {
  ok: boolean;
  membro?: Membro;
  erro?: string;
  needsConfirmation?: boolean;
}

// ── Mapeador de row profiles → Membro ────────────────────────────────────

export const profileToMembro = (row: ProfileRow | Record<string, unknown>): Membro => {
  const r = row as ProfileRow;
  const genero = (r.genero as 'MASCULINO' | 'FEMININO' | undefined) ?? 'MASCULINO';
  const fotoUrl = r.avatar_url ?? r.foto_perfil ?? r.foto ?? DEFAULT_AVATARS[genero];
  const dataNasc = r.data_nascimento ?? r.nascimento ?? r.birth_date ?? '';
  return {
    id: r.id,
    nome: r.full_name || r.nome || 'Usuário VANTA',
    email: r.email || '',
    instagram: r.instagram?.replace(/^@/, '') ?? '',
    seguidoresInstagram: r.instagram_followers ?? undefined,
    dataNascimento: dataNasc,
    telefone: {
      ddd: r.telefone_ddd ?? '11',
      numero: r.telefone_numero ?? '',
    },
    estado: r.estado || r.state || '',
    cidade: r.cidade || r.city || '',
    genero,
    biografia: r.biografia ?? '',
    foto: fotoUrl,
    biometriaFoto: r.biometria_url ?? undefined,
    biometriaCaptured: r.biometria_url ? true : false,
    interesses: r.interesses ?? [],
    fotos: r.album_urls ?? [],
    privacidade: (r.privacidade as unknown as import('../types').PrivacidadeConfig | undefined) ?? undefined,
    role: (() => {
      const role = (r.role as ContaVanta) ?? 'vanta_guest';
      if (role === 'vanta_guest' && r.email) return 'vanta_member' as ContaVanta;
      return role;
    })(),
    destaque: r.destaque_curadoria ?? false,
  };
};

// ── authService ───────────────────────────────────────────────────────────

export const authService = {
  /**
   * Login com e-mail + senha.
   * Retorna Membro mapeado do profiles ou erro.
   */
  signIn: async (email: string, senha: string): Promise<SignInResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error || !data.user) {
        return { ok: false, erro: error?.message ?? 'Credenciais inválidas.' };
      }

      // Busca profile completo com role real — evita delay de onAuthStateChange
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();

      const membro: Membro = profile
        ? profileToMembro(profile)
        : {
            id: data.user.id,
            nome: data.user.user_metadata?.nome ?? data.user.email?.split('@')[0] ?? 'Usuário',
            email: data.user.email ?? email,
            instagram: '',
            dataNascimento: '',
            telefone: { ddd: '11', numero: '' },
            estado: '',
            cidade: '',
            genero: 'MASCULINO',
            biografia: '',
            foto: DEFAULT_AVATARS.MASCULINO,
            interesses: [],
            role: 'vanta_member' as ContaVanta,
          };

      return { ok: true, membro };
    } catch (e: unknown) {
      logger.error('[auth] login failed', e);
      return { ok: false, erro: e instanceof Error ? e.message : 'Erro ao conectar.' };
    }
  },

  /**
   * Cadastro: cria usuário no Supabase Auth e insere profile.
   * Retorna Membro ou erro.
   */
  signUp: async (params: {
    email: string;
    senha: string;
    nome: string;
    instagram: string;
    dataNascimento: string; // ISO YYYY-MM-DD
    genero: 'MASCULINO' | 'FEMININO';
    estado: string;
    cidade: string;
    telefoneDdd: string;
    telefoneNumero: string;
    selfieUrl?: string;
  }): Promise<SignUpResult> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: params.email,
        password: params.senha,
        options: { data: { nome: params.nome } },
      });

      if (error || !data.user) {
        return { ok: false, erro: error?.message ?? 'Erro ao criar conta.' };
      }

      const userId = data.user.id;

      const avatarUrl = params.genero === 'FEMININO' ? AVATAR_FEMININO : AVATAR_MASCULINO;

      // Upsert profile — o trigger já criou o row básico; atualizamos com os dados completos
      // Inclui tanto os nomes novos quanto os legados para máxima compatibilidade
      const { error: pErr } = await supabase.from('profiles').upsert(
        {
          id: userId,
          // Colunas novas (migration v7→v8)
          nome: params.nome,
          email: params.email,
          data_nascimento: params.dataNascimento,
          genero: params.genero,
          estado: params.estado,
          cidade: params.cidade,
          telefone_ddd: params.telefoneDdd,
          telefone_numero: params.telefoneNumero,
          avatar_url: avatarUrl,
          biografia: '',
          interesses: [],
          // Colunas legadas (schema v5-v6) para compatibilidade
          full_name: params.nome,
          foto: avatarUrl,
          instagram: params.instagram,
          // 'vanta_member' não existe no CHECK CONSTRAINT do banco — usar 'vanta_guest'
          // O app trata vanta_guest como membro comum quando logado
          role: 'vanta_guest',
          biometria_url: params.selfieUrl ?? null,
        },
        { onConflict: 'id' },
      );

      if (pErr) {
        console.error('[AUTH] Erro ao salvar profile:', pErr.message, pErr.details, pErr.hint);
        // Não bloqueia — o usuário já foi criado no Auth
      }

      // Enriquecimento de seguidores Instagram roda em background via enrichInstagramFollowers()

      const nowBR = (): string => {
        const d = new Date();
        return new Date(d.getTime() - 3 * 60 * 60 * 1000).toISOString().replace('Z', '-03:00');
      };

      const membro: Membro = {
        id: userId,
        nome: params.nome,
        email: params.email,
        instagram: params.instagram,
        dataNascimento: params.dataNascimento,
        telefone: { ddd: params.telefoneDdd, numero: params.telefoneNumero },
        estado: params.estado,
        cidade: params.cidade,
        genero: params.genero,
        biografia: '',
        foto: avatarUrl,
        biometriaFoto: params.selfieUrl,
        biometriaCaptured: !!params.selfieUrl,
        interesses: [],
        role: 'vanta_member',
        curadoriaConcluida: false,
        tagsCuradoria: [],
        cadastradoEm: nowBR(),
      };

      // Notifica o master sobre novo membro para curadoria
      try {
        const { notificationsService } = await import('../features/admin/services/notificationsService');
        void notificationsService.add({
          tipo: 'SISTEMA',
          titulo: 'Novo membro para curadoria',
          mensagem: `${params.nome} acabou de se cadastrar`,
          link: userId,
          lida: false,
          timestamp: membro.cadastradoEm!,
        });
      } catch {
        // silencioso — não bloqueia o cadastro
      }

      // Supabase pode exigir confirmação de e-mail dependendo das configs
      const needsConfirmation = !data.session;
      return { ok: true, membro, needsConfirmation };
    } catch (e: unknown) {
      logger.error('[auth] signUp failed', e);
      return { ok: false, erro: e instanceof Error ? e.message : 'Erro ao criar conta.' };
    }
  },

  /** Busca sessão ativa (persiste entre reloads). */
  getSession: async (): Promise<Membro | null> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return null;

      // Timeout de 4s — evita trava em rede lenta
      const profilePromise = supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
      const result = await Promise.race([
        profilePromise,
        new Promise<{ data: null }>(resolve => setTimeout(() => resolve({ data: null }), 4000)),
      ]);
      const profile = result.data as any;

      if (!profile) return null;
      return profileToMembro(profile);
    } catch (err) {
      logger.error('[auth] getSession failed', err);
      return null;
    }
  },

  /** Logout — invalida sessão no Supabase. */
  signOut: async (): Promise<void> => {
    await supabase.auth.signOut();
  },

  /**
   * Busca membros por nome ou email — combina Supabase (profiles) + fallback local.
   * Usado nas caixas de pesquisa de usuário do painel admin.
   * @param q Texto de busca (mínimo 2 chars)
   * @param limit Máximo de resultados (default: 8)
   */
  buscarMembros: async (q: string, limit = 20): Promise<Membro[]> => {
    const sanitized = q.replace(/[%_(),."'\\]/g, '').trim();

    try {
      // Usa RPC SECURITY DEFINER para bypassar RLS da tabela profiles
      const { data, error } = await supabase.rpc('buscar_membros', {
        search_query: sanitized,
        max_results: limit,
      });

      if (error) {
        console.error('[buscarMembros] RPC erro:', error.code, error.message, error.details, error.hint);
        return [];
      }
      return (data ?? []).map((row: Record<string, unknown>) => profileToMembro(row));
    } catch (e) {
      console.error('[buscarMembros] exceção não tratada:', e);
      return [];
    }
  },

  /**
   * Escuta mudanças de sessão (login, logout, token refresh).
   * Retorna unsubscribe para usar no useEffect cleanup.
   */
  onAuthStateChange: (callback: (membro: Membro | null) => void): (() => void) => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // PASSWORD_RECOVERY: Supabase redireciona com tokens na URL após reset
      if (event === 'PASSWORD_RECOVERY') {
        window.dispatchEvent(new CustomEvent('vanta:password-recovery'));
      }
      if (!session?.user) {
        // Logout real (SIGNED_OUT) ou sessão expirada sem refresh
        callback(null);
        return;
      }

      // Token refresh ou sign-in: buscar profile
      const isRefresh = event === 'TOKEN_REFRESHED';
      try {
        const profilePromise = supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
        const result = await Promise.race([
          profilePromise,
          new Promise<{ data: null }>(resolve => setTimeout(() => resolve({ data: null }), 4000)),
        ]);
        const profile = result.data;

        if (profile) {
          callback(profileToMembro(profile as any));
        } else if (!isRefresh) {
          // Só faz logout se NÃO for token refresh — evita kickar usuário por rede lenta
          callback(null);
        }
        // Se isRefresh e profile=null: ignora silenciosamente, mantém sessão anterior
      } catch {
        // Erro de rede/timeout: só faz logout se não for refresh
        if (!isRefresh) {
          callback(null);
        }
      }
    });
    return () => subscription.unsubscribe();
  },
};

/**
 * Enriquecimento background — busca seguidores do Instagram e salva no profile.
 * Roda 1x após login se o campo ainda está vazio. Não bloqueia nada.
 */
export const enrichInstagramFollowers = (userId: string, instagram: string | undefined): void => {
  if (!instagram) return;
  // Checa se já tem o dado salvo (evita chamada desnecessária)
  supabase
    .from('profiles')
    .select('instagram_followers')
    .eq('id', userId)
    .maybeSingle()
    .then(({ data }) => {
      if (data?.instagram_followers != null) return; // já enriquecido
      supabase.functions
        .invoke('instagram-followers', { body: { username: instagram } })
        .then(({ data: igData }) => {
          if (igData?.followers != null) {
            supabase
              .from('profiles')
              .update({ instagram_followers: igData.followers })
              .eq('id', userId)
              .then(({ error: errIg }) => {
                if (errIg) console.error('[authService] instagram_followers update:', errIg);
              });
          }
        })
        .catch(() => {
          /* silencioso */
        });
    });
};
