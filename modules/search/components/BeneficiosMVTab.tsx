/**
 * BeneficiosMVTab — Tab unificada de benefícios para membros MAIS VANTA.
 * Mostra benefícios de eventos + deals de parceiros numa lista só.
 * Visível SOMENTE para membros ativos do clube.
 */
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Crown, MapPin, Calendar, Store, Ticket, RefreshCw, Gift, Sparkles } from 'lucide-react';
import { clubeService } from '../../../features/admin/services/clubeService';
import { clubeDealsService } from '../../../features/admin/services/clube/clubeDealsService';
import { clubeCidadesService } from '../../../features/admin/services/clube/clubeCidadesService';
import { supabase } from '../../../services/supabaseClient';
import type { BeneficioMV } from '../../../features/admin/services/clube/clubeLotesService';
import type { DealMaisVanta, Evento } from '../../../types';
import { tsBR } from '../../../utils';

// Item unificado para exibição
interface BeneficioUnificado {
  id: string;
  tipo: 'evento' | 'parceiro';
  titulo: string;
  subtitulo: string;
  descricao: string;
  cidade?: string;
  data?: string;
  vagasRestantes?: number;
  fotoUrl?: string;
  eventoId?: string;
  dealId?: string;
}

interface Props {
  userId: string;
  onEventClick?: (eventoId: string) => void;
}

const TIER_ORDER: Record<string, number> = { lista: 0, presenca: 1, social: 2, creator: 3, black: 4 };

export const BeneficiosMVTab: React.FC<Props> = ({ userId, onEventClick }) => {
  const [beneficios, setBeneficios] = useState<BeneficioUnificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'evento' | 'parceiro'>('todos');
  const [filtroCidade, setFiltroCidade] = useState('');
  const mounted = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    const membro = clubeService.getMembroClubeByUserId(userId);
    if (!membro) {
      setLoading(false);
      return;
    }

    const membroTierOrder = TIER_ORDER[membro.tier] ?? 0;
    const now = tsBR();
    const items: BeneficioUnificado[] = [];

    // ── 1. Benefícios de eventos futuros ──
    const { data: eventosFuturos } = await supabase
      .from('eventos_admin')
      .select('id, nome, local, cidade, data_inicio')
      .gte('data_inicio', now)
      .order('data_inicio')
      .limit(100);

    if (eventosFuturos) {
      // Buscar benefícios de cada evento
      for (const evt of eventosFuturos) {
        const row = evt as Record<string, unknown>;
        const eventoId = row.id as string;
        const benefsEvt = await clubeService.getBeneficiosEvento(eventoId);
        // Filtrar por elegibilidade do tier
        for (const b of benefsEvt) {
          if (!b.ativo) continue;
          const bTierOrder = TIER_ORDER[b.tierMinimo] ?? 0;
          // Membro elegível: tier do membro >= tier mínimo do benefício, E tier exato bate
          if (membroTierOrder < bTierOrder) continue;
          // Verificar sublevel creator se aplicável
          if (b.tierMinimo === 'creator' && b.creatorSublevelMinimo && membro.tier === 'creator') {
            const subOrder = ['creator_200k', 'creator_500k', 'creator_1m'];
            const reqIdx = subOrder.indexOf(b.creatorSublevelMinimo);
            const memIdx = subOrder.indexOf(membro.creatorSublevel ?? '');
            if (memIdx < reqIdx) continue;
          }
          // Vagas
          const vagasRestantes =
            b.vagasLimite != null && b.vagasLimite > 0 ? Math.max(0, b.vagasLimite - b.vagasResgatadas) : undefined;
          if (vagasRestantes === 0) continue;

          const tipoLabel = b.tipo === 'ingresso' ? 'Ingresso' : 'Lista';
          const descontoLabel = b.descontoPercentual ? ` · ${b.descontoPercentual}% off` : '';

          items.push({
            id: `evt-${b.id}`,
            tipo: 'evento',
            titulo: (row.nome as string) ?? 'Evento',
            subtitulo: `${tipoLabel}${descontoLabel}`,
            descricao: (row.local as string) ?? '',
            cidade: (row.cidade as string) ?? '',
            data: (row.data_inicio as string)?.split('T')[0],
            vagasRestantes,
            eventoId,
          });
        }
      }
    }

    // ── 2. Deals de parceiros (cidades ativas do membro) ──
    const passports = clubeService.getPassportAprovacoes(userId);
    const cidadesAprovadas = passports.filter(p => p.status === 'APROVADO' && p.cidade).map(p => p.cidade as string);

    // Incluir cidade principal do membro
    if (membro.cidadePrincipal && !cidadesAprovadas.includes(membro.cidadePrincipal)) {
      cidadesAprovadas.push(membro.cidadePrincipal);
    }

    if (cidadesAprovadas.length > 0) {
      const todasCidades = await clubeCidadesService.listarAtivas();
      const cidadesMV = todasCidades.filter(c => cidadesAprovadas.includes(c.nome));

      for (const cidade of cidadesMV) {
        const deals = await clubeDealsService.listarPorCidade(cidade.id);
        for (const d of deals) {
          if (d.status !== 'ATIVO') continue;
          const vagasRestantes = d.vagas > 0 ? Math.max(0, d.vagas - d.vagasPreenchidas) : undefined;
          if (vagasRestantes === 0) continue;

          items.push({
            id: `deal-${d.id}`,
            tipo: 'parceiro',
            titulo: d.titulo,
            subtitulo: d.parceiroNome ?? 'Parceiro',
            descricao: d.descricao ?? '',
            cidade: d.cidadeNome ?? cidade.nome,
            data: d.fim?.split('T')[0],
            vagasRestantes,
            fotoUrl: d.fotoUrl ?? d.parceiroFotoUrl,
            dealId: d.id,
          });
        }
      }
    }

    if (mounted.current) {
      setBeneficios(items);
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  // Cidades únicas para filtro
  const cidades = useMemo(
    () => [...new Set(beneficios.map(b => b.cidade).filter(Boolean) as string[])].sort(),
    [beneficios],
  );

  // Filtrar
  const filtrados = useMemo(() => {
    let lista = beneficios;
    if (filtroTipo !== 'todos') lista = lista.filter(b => b.tipo === filtroTipo);
    if (filtroCidade) lista = lista.filter(b => b.cidade === filtroCidade);
    return lista;
  }, [beneficios, filtroTipo, filtroCidade]);

  const formatDate = (d?: string) => {
    if (!d) return '';
    const [y, m, day] = d.split('-');
    return `${day}/${m}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw size={20} className="text-zinc-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-1.5 flex-wrap">
        {(['todos', 'evento', 'parceiro'] as const).map(t => (
          <button
            key={t}
            onClick={() => setFiltroTipo(t)}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all flex items-center gap-1 ${
              filtroTipo === t
                ? 'bg-[#FFD300] text-black border-transparent'
                : 'bg-zinc-900/60 text-zinc-400 border-white/5'
            }`}
          >
            {t === 'todos' && <Gift size={10} />}
            {t === 'evento' && <Calendar size={10} />}
            {t === 'parceiro' && <Store size={10} />}
            {t === 'todos' ? 'Todos' : t === 'evento' ? 'Eventos' : 'Parceiros'}
          </button>
        ))}
      </div>

      {cidades.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFiltroCidade('')}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all shrink-0 ${
              !filtroCidade
                ? 'bg-zinc-700 text-white border-transparent'
                : 'bg-zinc-900/60 text-zinc-400 border-white/5'
            }`}
          >
            Todas cidades
          </button>
          {cidades.map(c => (
            <button
              key={c}
              onClick={() => setFiltroCidade(filtroCidade === c ? '' : c)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all shrink-0 ${
                filtroCidade === c
                  ? 'bg-zinc-700 text-white border-transparent'
                  : 'bg-zinc-900/60 text-zinc-400 border-white/5'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="text-center py-16">
          <Sparkles size={32} className="text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">Nenhum benefício disponível no momento</p>
          <p className="text-zinc-600 text-[10px] mt-1">Novos benefícios aparecem conforme eventos são publicados</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtrados.map(b => (
            <button
              key={b.id}
              onClick={() => {
                if (b.eventoId && onEventClick) onEventClick(b.eventoId);
              }}
              className="w-full bg-zinc-900/60 border border-white/5 rounded-2xl p-4 text-left active:scale-[0.98] transition-all"
            >
              <div className="flex items-start gap-3">
                {/* Ícone/foto */}
                {b.fotoUrl ? (
                  <img src={b.fotoUrl} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" loading="lazy" />
                ) : (
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      b.tipo === 'evento' ? 'bg-[#FFD300]/10' : 'bg-purple-500/10'
                    }`}
                  >
                    {b.tipo === 'evento' ? (
                      <Ticket size={18} className="text-[#FFD300]" />
                    ) : (
                      <Store size={18} className="text-purple-400" />
                    )}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                        b.tipo === 'evento' ? 'bg-[#FFD300]/10 text-[#FFD300]' : 'bg-purple-500/10 text-purple-400'
                      }`}
                    >
                      {b.tipo === 'evento' ? 'Evento' : 'Parceiro'}
                    </span>
                    {b.vagasRestantes != null && (
                      <span className="text-zinc-500 text-[8px]">
                        {b.vagasRestantes} vaga{b.vagasRestantes !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-white text-sm font-bold truncate">{b.titulo}</p>
                  <p className="text-[#FFD300] text-[10px] font-bold truncate">{b.subtitulo}</p>
                  {b.descricao && <p className="text-zinc-400 text-[10px] truncate mt-0.5">{b.descricao}</p>}
                  <div className="flex items-center gap-2 mt-1.5">
                    {b.cidade && (
                      <span className="flex items-center gap-0.5 text-zinc-500 text-[9px]">
                        <MapPin size={8} /> {b.cidade}
                      </span>
                    )}
                    {b.data && (
                      <span className="flex items-center gap-0.5 text-zinc-500 text-[9px]">
                        <Calendar size={8} /> {formatDate(b.data)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
