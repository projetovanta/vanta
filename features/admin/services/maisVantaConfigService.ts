/**
 * maisVantaConfigService — Configuração global MAIS VANTA.
 * Singleton: 1 registro na tabela `mais_vanta_config` (id='global').
 * Cache local síncrono + refresh async.
 */

import { supabase } from '../../../services/supabaseClient';
import type { Database } from '../../../types/supabase';

import { tsBR } from '../../../utils';

type ConfigRow = Database['public']['Tables']['mais_vanta_config']['Row'];

export interface VantagemTexto {
  titulo: string;
  descricao: string;
}

export interface BeneficioConfig {
  id: string;
  label: string;
  descricao: string;
}

export interface MaisVantaConfig {
  // Branding
  nomePrograma: string;
  descricaoPrograma: string;
  emailContato: string;
  // Regras
  prazoPostHoras: number;
  mencoesObrigatorias: string[];
  hashtagsObrigatorias: string[];
  infracoesLimite: number;
  bloqueio1Dias: number;
  bloqueio2Dias: number;
  // Textos
  vantagensMembro: VantagemTexto[];
  vantagensVenue: VantagemTexto[];
  termosCustomizados: string | null;
  // Benefícios
  beneficiosDisponiveis: BeneficioConfig[];
}

const DEFAULTS: MaisVantaConfig = {
  nomePrograma: 'MAIS VANTA',
  descricaoPrograma: 'Experiências exclusivas em troca de visibilidade nas redes sociais',
  emailContato: 'contato@maisvanta.com',
  prazoPostHoras: 12,
  mencoesObrigatorias: ['@maisvanta'],
  hashtagsObrigatorias: ['#publi', '#parceria'],
  infracoesLimite: 3,
  bloqueio1Dias: 30,
  bloqueio2Dias: 60,
  vantagensMembro: [
    { titulo: 'Acesso Exclusivo', descricao: 'Entrada gratuita em eventos selecionados da sua cidade' },
    { titulo: 'Rede de Influência', descricao: 'Conecte-se com outros criadores e amplie seu alcance' },
    { titulo: 'Prioridade VIP', descricao: 'Reservas antecipadas e tratamento diferenciado' },
    { titulo: 'Acompanhantes', descricao: 'Leve amigos para viver a experiência com você' },
    { titulo: 'Multicicidade', descricao: 'Passaporte regional para explorar eventos em outras cidades' },
  ],
  vantagensVenue: [
    { titulo: 'Influenciadores Reais', descricao: 'Atraia criadores verificados para seus eventos' },
    { titulo: 'Visibilidade Orgânica', descricao: 'Posts garantidos com menção e hashtags' },
    { titulo: 'Zero Risco', descricao: 'Pague apenas pelo plano, sem custos extras por membro' },
    { titulo: 'Curadoria VANTA', descricao: 'Membros verificados e rankeados por alcance' },
    { titulo: 'Dashboard Completo', descricao: 'Métricas de alcance, posts e ROI em tempo real' },
  ],
  termosCustomizados: null,
  beneficiosDisponiveis: [
    { id: 'INGRESSO_CORTESIA', label: 'Ingresso Cortesia', descricao: 'Entrada gratuita no evento' },
    { id: 'ACOMPANHANTE', label: 'Acompanhante', descricao: 'Levar acompanhante(s)' },
    { id: 'PRIORIDADE', label: 'Prioridade', descricao: 'Fila prioritária e acesso antecipado' },
    { id: 'RESERVA_ANTECIPADA', label: 'Reserva Antecipada', descricao: 'Reservar antes da abertura geral' },
    { id: 'PASSPORT_GLOBAL', label: 'Passport Regional', descricao: 'Acesso a eventos em outras cidades' },
  ],
};

let _config: MaisVantaConfig = { ...DEFAULTS };
let _ready = false;

const rowToConfig = (r: ConfigRow): MaisVantaConfig => ({
  nomePrograma: r.nome_programa ?? DEFAULTS.nomePrograma,
  descricaoPrograma: r.descricao_programa ?? DEFAULTS.descricaoPrograma,
  emailContato: r.email_contato ?? DEFAULTS.emailContato,
  prazoPostHoras: r.prazo_post_horas ?? DEFAULTS.prazoPostHoras,
  mencoesObrigatorias: r.mencoes_obrigatorias ?? DEFAULTS.mencoesObrigatorias,
  hashtagsObrigatorias: r.hashtags_obrigatorias ?? DEFAULTS.hashtagsObrigatorias,
  infracoesLimite: r.infracoes_limite ?? DEFAULTS.infracoesLimite,
  bloqueio1Dias: r.bloqueio1_dias ?? DEFAULTS.bloqueio1Dias,
  bloqueio2Dias: r.bloqueio2_dias ?? DEFAULTS.bloqueio2Dias,
  vantagensMembro: (r.vantagens_membro as unknown as VantagemTexto[]) ?? DEFAULTS.vantagensMembro,
  vantagensVenue: (r.vantagens_venue as unknown as VantagemTexto[]) ?? DEFAULTS.vantagensVenue,
  termosCustomizados: r.termos_customizados ?? null,
  beneficiosDisponiveis: (r.beneficios_disponiveis as unknown as BeneficioConfig[]) ?? DEFAULTS.beneficiosDisponiveis,
});

export const maisVantaConfigService = {
  get isReady(): boolean {
    return _ready;
  },

  getConfig(): MaisVantaConfig {
    return _config;
  },

  async refresh(): Promise<void> {
    try {
      const { data, error } = await supabase.from('mais_vanta_config').select('*').eq('id', 'global').maybeSingle();

      if (error || !data) {
        console.warn('[maisVantaConfigService] refresh: usando defaults', error);
        _config = { ...DEFAULTS };
      } else {
        _config = rowToConfig(data);
      }
      _ready = true;
    } catch (err) {
      console.error('[maisVantaConfigService] refresh falhou:', err);
      _config = { ...DEFAULTS };
      _ready = true;
    }
  },

  async updateConfig(updates: Partial<MaisVantaConfig>): Promise<boolean> {
    const dbUpdates: Record<string, unknown> = { atualizado_em: tsBR() };

    if (updates.nomePrograma !== undefined) dbUpdates.nome_programa = updates.nomePrograma;
    if (updates.descricaoPrograma !== undefined) dbUpdates.descricao_programa = updates.descricaoPrograma;
    if (updates.emailContato !== undefined) dbUpdates.email_contato = updates.emailContato;
    if (updates.prazoPostHoras !== undefined) dbUpdates.prazo_post_horas = updates.prazoPostHoras;
    if (updates.mencoesObrigatorias !== undefined) dbUpdates.mencoes_obrigatorias = updates.mencoesObrigatorias;
    if (updates.hashtagsObrigatorias !== undefined) dbUpdates.hashtags_obrigatorias = updates.hashtagsObrigatorias;
    if (updates.infracoesLimite !== undefined) dbUpdates.infracoes_limite = updates.infracoesLimite;
    if (updates.bloqueio1Dias !== undefined) dbUpdates.bloqueio1_dias = updates.bloqueio1Dias;
    if (updates.bloqueio2Dias !== undefined) dbUpdates.bloqueio2_dias = updates.bloqueio2Dias;
    if (updates.vantagensMembro !== undefined) dbUpdates.vantagens_membro = updates.vantagensMembro;
    if (updates.vantagensVenue !== undefined) dbUpdates.vantagens_venue = updates.vantagensVenue;
    if (updates.termosCustomizados !== undefined) dbUpdates.termos_customizados = updates.termosCustomizados;
    if (updates.beneficiosDisponiveis !== undefined) dbUpdates.beneficios_disponiveis = updates.beneficiosDisponiveis;

    const { error } = await supabase
      .from('mais_vanta_config')
      .upsert({ id: 'global', ...dbUpdates }, { onConflict: 'id' });

    if (error) {
      console.error('[maisVantaConfigService] updateConfig erro:', error);
      return false;
    }

    // Atualizar cache local
    _config = { ..._config, ...updates };
    return true;
  },
};
