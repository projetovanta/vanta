import React from 'react';
import { Ticket, UserPlus, Star, Clock, Globe } from 'lucide-react';
import { TierMaisVanta, BeneficioId } from '../../../../../types';
import { clubeService } from '../../../services/clubeService';

// Tiers dinâmicos (labels/cores) com fallback legado
const TIER_LABELS_LEGACY: Record<string, string> = {
  desconto: 'Desconto',
  convidado: 'Convidado',
  presenca: 'Presença',
  creator: 'Creator',
  vanta_black: 'VANTA Black',
};
const TIER_COLORS_LEGACY: Record<string, string> = {
  desconto: '#888888',
  convidado: '#CD7F32',
  presenca: '#C0C0C0',
  creator: '#FFD300',
  vanta_black: '#1a1a1a',
};

export const getTierLabel = (id: string): string => {
  const def = clubeService.getTierDef(id);
  return def?.nome ?? TIER_LABELS_LEGACY[id] ?? id;
};
export const getTierColor = (id: string): string => {
  const def = clubeService.getTierDef(id);
  return def?.cor ?? TIER_COLORS_LEGACY[id] ?? '#666';
};
export const getTierOptions = (): TierMaisVanta[] => {
  const dynamic = clubeService.getTiers();
  if (dynamic.length > 0) return dynamic.map(t => t.id as TierMaisVanta);
  return ['desconto', 'convidado', 'presenca', 'creator', 'vanta_black'];
};

// Compat accessors
export const TIER_LABELS = new Proxy({} as Record<TierMaisVanta, string>, {
  get: (_, k) => getTierLabel(k as string),
});
export const TIER_COLORS = new Proxy({} as Record<TierMaisVanta, string>, {
  get: (_, k) => getTierColor(k as string),
});

/** Benefícios selecionáveis — integrados com features reais do app */
export const BENEFICIOS_DISPONIVEIS: { id: BeneficioId; label: string; desc: string; icon: React.ElementType }[] = [
  {
    id: 'INGRESSO_CORTESIA',
    label: 'Ingresso Cortesia',
    desc: 'Permuta — ingresso custo zero no evento',
    icon: Ticket,
  },
  { id: 'ACOMPANHANTE', label: 'Acompanhante (+1)', desc: 'Pode levar 1 acompanhante na reserva', icon: UserPlus },
  { id: 'PRIORIDADE', label: 'Prioridade na Reserva', desc: 'Reserva antes de tiers inferiores', icon: Star },
  {
    id: 'RESERVA_ANTECIPADA',
    label: 'Reserva Antecipada',
    desc: 'Acesso à reserva antes da abertura geral',
    icon: Clock,
  },
  { id: 'PASSPORT_GLOBAL', label: 'Passport Global', desc: 'Acesso a eventos de outras comunidades', icon: Globe },
];

/** Dados enriquecidos do perfil para exibição nos cards */
export interface PerfilEnriquecido {
  nome: string;
  email: string;
  cidade?: string;
  estado?: string;
  telefone?: string;
  foto?: string;
  biometriaUrl?: string;
  selfieSignedUrl?: string;
  cadastradoEm?: string;
  instagram?: string;
}

export type SubTab =
  | 'SOLICITACOES'
  | 'MEMBROS_CLUBE'
  | 'EVENTOS'
  | 'POSTS'
  | 'PASSAPORTES'
  | 'ASSINATURA'
  | 'NOTIFICACOES';
