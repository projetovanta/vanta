/**
 * BeneficiosMVTab — Tab unificada de benefícios para membros MAIS VANTA.
 * Mostra eventos com benefício + deals de parceiros.
 * Recebe eventos já filtrados (mesmos filtros da busca normal).
 * Visível SOMENTE para membros ativos do clube.
 */
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  MapPin,
  Calendar,
  Store,
  Ticket,
  RefreshCw,
  Sparkles,
  Gift,
  X,
  CheckCircle,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { clubeService } from '../../../features/admin/services/clubeService';
import { clubeDealsService } from '../../../features/admin/services/clube/clubeDealsService';
import { clubeResgatesService } from '../../../features/admin/services/clube/clubeResgatesService';
import { clubeCidadesService } from '../../../features/admin/services/clube/clubeCidadesService';
import { supabase } from '../../../services/supabaseClient';
import type { Evento, ResgateMaisVanta } from '../../../types';

const TIER_ORDER: Record<string, number> = { lista: 0, presenca: 1, social: 2, creator: 3, black: 4 };

const CATEGORIAS_PARCEIRO: { key: string; label: string }[] = [
  { key: 'RESTAURANTE', label: 'Restaurante' },
  { key: 'BAR', label: 'Bar' },
  { key: 'CLUB', label: 'Club' },
  { key: 'GYM', label: 'Academia' },
  { key: 'SALAO', label: 'Salão' },
  { key: 'HOTEL', label: 'Hotel' },
  { key: 'LOJA', label: 'Loja' },
  { key: 'OUTRO', label: 'Outro' },
];

interface DealUnificado {
  id: string;
  titulo: string;
  subtitulo: string;
  descricao: string;
  cidade?: string;
  data?: string;
  vagasRestantes?: number;
  fotoUrl?: string;
  dealId: string;
  parceiroId: string;
  parceiroTipo?: string;
}

interface Props {
  userId: string;
  filteredEvents: Evento[];
  onEventClick?: (evento: Evento) => void;
  query?: string;
}

export const BeneficiosMVTab: React.FC<Props> = ({ userId, filteredEvents, onEventClick, query }) => {
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'eventos' | 'parceiros'>('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null);
  const [eventosComBeneficio, setEventosComBeneficio] = useState<Set<string>>(new Set());
  const [deals, setDeals] = useState<DealUnificado[]>([]);
  const [meusResgates, setMeusResgates] = useState<ResgateMaisVanta[]>([]);
  const [meuResgate, setMeuResgate] = useState<ResgateMaisVanta | null>(null);
  const [aplicando, setAplicando] = useState(false);
  const [postUrl, setPostUrl] = useState('');
  const [showQr, setShowQr] = useState(false);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    const membro = clubeService.getMembroClubeByUserId(userId);
    if (!membro) {
      setLoading(false);
      return;
    }

    const membroTierOrder = TIER_ORDER[membro.tier] ?? 0;
    const eventoIds = new Set<string>();
    const dealItems: DealUnificado[] = [];

    // ── 1. Buscar TODOS os benefícios MV de eventos futuros numa única query ──
    const { data: allBeneficios } = await supabase
      .from('mais_vanta_config_evento')
      .select('evento_id, tier_minimo, creator_sublevel_minimo, vagas_limite, vagas_resgatadas, ativo')
      .eq('ativo', true);

    if (allBeneficios) {
      for (const b of allBeneficios) {
        const row = b as Record<string, unknown>;
        const tierMinimo = row.tier_minimo as string;
        const bTierOrder = TIER_ORDER[tierMinimo] ?? 0;
        if (membroTierOrder < bTierOrder) continue;

        // Creator sublevel check
        if (tierMinimo === 'creator' && row.creator_sublevel_minimo && membro.tier === 'creator') {
          const subOrder = ['creator_200k', 'creator_500k', 'creator_1m'];
          const reqIdx = subOrder.indexOf(row.creator_sublevel_minimo as string);
          const memIdx = subOrder.indexOf(membro.creatorSublevel ?? '');
          if (memIdx < reqIdx) continue;
        }

        // Vagas check
        const vagasLimite = row.vagas_limite as number | null;
        const vagasResgatadas = row.vagas_resgatadas as number | null;
        if (vagasLimite != null && vagasLimite > 0) {
          if ((vagasResgatadas ?? 0) >= vagasLimite) continue;
        }

        eventoIds.add(row.evento_id as string);
      }
    }

    // ── 2. Deals de parceiros (cidades do membro) ──
    const passports = clubeService.getPassportAprovacoes(userId);
    const cidadesAprovadas = passports.filter(p => p.status === 'APROVADO' && p.cidade).map(p => p.cidade as string);
    if (membro.cidadePrincipal && !cidadesAprovadas.includes(membro.cidadePrincipal)) {
      cidadesAprovadas.push(membro.cidadePrincipal);
    }

    if (cidadesAprovadas.length > 0) {
      const todasCidades = await clubeCidadesService.listarAtivas();
      const cidadesMV = todasCidades.filter(c => cidadesAprovadas.includes(c.nome));

      for (const cidade of cidadesMV) {
        const dealsArr = await clubeDealsService.listarPorCidade(cidade.id);
        for (const d of dealsArr) {
          if (d.status !== 'ATIVO') continue;
          const vagasRestantes = d.vagas > 0 ? Math.max(0, d.vagas - d.vagasPreenchidas) : undefined;
          if (vagasRestantes === 0) continue;

          // Filtro por query se tiver
          if (query && query.length >= 2) {
            const lower = query.toLowerCase();
            const matchText =
              `${d.titulo} ${d.parceiroNome ?? ''} ${d.descricao ?? ''} ${d.cidadeNome ?? cidade.nome}`.toLowerCase();
            if (!matchText.includes(lower)) continue;
          }

          dealItems.push({
            id: `deal-${d.id}`,
            titulo: d.titulo,
            subtitulo: d.parceiroNome ?? 'Parceiro',
            descricao: d.descricao ?? '',
            cidade: d.cidadeNome ?? cidade.nome,
            data: d.fim?.split('T')[0],
            vagasRestantes,
            fotoUrl: d.fotoUrl ?? d.parceiroFotoUrl,
            dealId: d.id,
            parceiroId: d.parceiroId,
            parceiroTipo: d.parceiroTipo,
          });
        }
      }
    }

    // Buscar resgates do membro
    const resgates = await clubeResgatesService.listarPorUsuario(userId);
    const ativo = resgates.find(r => ['APLICADO', 'SELECIONADO', 'CHECK_IN', 'PENDENTE_POST'].includes(r.status));

    if (mounted.current) {
      setEventosComBeneficio(eventoIds);
      setDeals(dealItems);
      setMeusResgates(resgates);
      setMeuResgate(ativo ?? null);
      setLoading(false);
    }
  }, [userId, query]);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  // Filtrar eventos que têm benefício pro membro
  const eventosBeneficio = useMemo(
    () => filteredEvents.filter(e => eventosComBeneficio.has(e.id)),
    [filteredEvents, eventosComBeneficio],
  );

  const dealsVisiveis = useMemo(() => {
    if (filtroTipo === 'eventos') return [];
    let lista = deals;
    if (filtroCategoria) lista = lista.filter(d => d.parceiroTipo === filtroCategoria);
    return lista;
  }, [deals, filtroTipo, filtroCategoria]);

  const getResgateParaDeal = (dealId: string) => meusResgates.find(r => r.dealId === dealId);

  const handleAplicar = async (dealId: string, parceiroId: string) => {
    setAplicando(true);
    const { ok, erro } = await clubeResgatesService.aplicar(dealId, userId, parceiroId);
    if (!ok) {
      // TODO: toast feedback
      console.warn(erro);
    }
    await load();
    setAplicando(false);
  };

  const handleCancelar = async (resgateId: string) => {
    await clubeResgatesService.cancelar(resgateId, userId);
    load();
  };

  const handleEnviarPost = async (resgateId: string) => {
    if (!postUrl.trim()) return;
    await clubeResgatesService.enviarPost(resgateId, postUrl.trim());
    setPostUrl('');
    load();
  };

  const statusLabel = (status: string) => {
    const map: Record<string, { text: string; color: string; bg: string }> = {
      APLICADO: { text: 'Aguardando seleção', color: 'text-blue-400', bg: 'bg-blue-500/15' },
      SELECIONADO: { text: 'Selecionado!', color: 'text-[#FFD300]', bg: 'bg-[#FFD300]/15' },
      RECUSADO: { text: 'Não selecionado', color: 'text-zinc-400', bg: 'bg-zinc-700/50' },
      CHECK_IN: { text: 'Check-in feito', color: 'text-purple-400', bg: 'bg-purple-500/15' },
      PENDENTE_POST: { text: 'Post pendente', color: 'text-orange-400', bg: 'bg-orange-500/15' },
      CONCLUIDO: { text: 'Concluído', color: 'text-green-400', bg: 'bg-green-500/15' },
      NO_SHOW: { text: 'No-show', color: 'text-red-400', bg: 'bg-red-500/15' },
      CANCELADO: { text: 'Cancelado', color: 'text-zinc-400', bg: 'bg-zinc-700/50' },
    };
    return map[status] ?? { text: status, color: 'text-zinc-400', bg: 'bg-zinc-700/50' };
  };

  const formatDate = (d?: string) => {
    if (!d) return '';
    const [, m, day] = d.split('-');
    return `${day}/${m}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw size="1.25rem" className="text-zinc-500 animate-spin" />
      </div>
    );
  }

  const eventosVisiveis = filtroTipo === 'parceiros' ? [] : eventosBeneficio;
  const temResultados = eventosVisiveis.length > 0 || dealsVisiveis.length > 0;

  if (!temResultados && !loading) {
    return (
      <div>
        {/* Chips de tipo */}
        <div className="flex gap-1.5 mb-6">
          {(
            [
              { key: 'todos', label: 'Todos', icon: Gift },
              { key: 'eventos', label: 'Eventos', icon: Calendar },
              { key: 'parceiros', label: 'Parceiros', icon: Store },
            ] as const
          ).map(t => (
            <button
              key={t.key}
              onClick={() => setFiltroTipo(t.key)}
              className={`px-3 py-1.5 rounded-lg text-[0.5625rem] font-black uppercase tracking-wider border transition-all flex items-center gap-1 ${
                filtroTipo === t.key
                  ? 'bg-[#FFD300] text-black border-transparent'
                  : 'bg-zinc-900/60 text-zinc-400 border-white/5'
              }`}
            >
              <t.icon size="0.625rem" />
              {t.label}
            </button>
          ))}
        </div>
        <div className="text-center py-12">
          <Sparkles size="2rem" className="text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">Novos benefícios chegando. Fique de olho.</p>
          <p className="text-zinc-600 text-[0.625rem] mt-1">Benefícios aparecem conforme eventos são publicados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chips de tipo */}
      <div className="flex gap-1.5">
        {(
          [
            { key: 'todos', label: 'Todos', icon: Gift },
            { key: 'eventos', label: 'Eventos', icon: Calendar },
            { key: 'parceiros', label: 'Parceiros', icon: Store },
          ] as const
        ).map(t => (
          <button
            key={t.key}
            onClick={() => setFiltroTipo(t.key)}
            className={`px-3 py-1.5 rounded-lg text-[0.5625rem] font-black uppercase tracking-wider border transition-all flex items-center gap-1 ${
              filtroTipo === t.key
                ? 'bg-[#FFD300] text-black border-transparent'
                : 'bg-zinc-900/60 text-zinc-400 border-white/5'
            }`}
          >
            <t.icon size="0.625rem" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Chips de categoria do parceiro — só quando tipo inclui parceiros */}
      {filtroTipo !== 'eventos' && deals.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFiltroCategoria(null)}
            className={`px-3 py-1.5 rounded-lg text-[0.5625rem] font-black uppercase tracking-wider border transition-all shrink-0 ${
              !filtroCategoria
                ? 'bg-zinc-700 text-white border-transparent'
                : 'bg-zinc-900/60 text-zinc-400 border-white/5'
            }`}
          >
            Todas
          </button>
          {CATEGORIAS_PARCEIRO.filter(cat => deals.some(d => d.parceiroTipo === cat.key)).map(cat => (
            <button
              key={cat.key}
              onClick={() => setFiltroCategoria(filtroCategoria === cat.key ? null : cat.key)}
              className={`px-3 py-1.5 rounded-lg text-[0.5625rem] font-black uppercase tracking-wider border transition-all shrink-0 ${
                filtroCategoria === cat.key
                  ? 'bg-zinc-700 text-white border-transparent'
                  : 'bg-zinc-900/60 text-zinc-400 border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Eventos com benefício */}
      {eventosVisiveis.length > 0 && (
        <div>
          <p className="text-[0.5rem] font-black uppercase tracking-widest text-[#FFD300]/70 mb-3">
            Eventos com benefício ({eventosVisiveis.length})
          </p>
          <div className="space-y-3">
            {eventosVisiveis.map(e => (
              <button
                key={e.id}
                onClick={() => onEventClick?.(e)}
                className="w-full flex items-center gap-3 bg-zinc-900/60 border border-white/5 rounded-2xl p-3 text-left active:scale-[0.98] transition-all"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-zinc-800">
                  {e.imagem && (
                    <img loading="lazy" src={e.imagem} className="w-full h-full object-cover" alt={e.titulo} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[0.4375rem] font-black uppercase tracking-widest bg-[#FFD300]/10 text-[#FFD300] px-1.5 py-0.5 rounded">
                      Benefício MV
                    </span>
                  </div>
                  <p className="text-white text-sm font-bold truncate">{e.titulo}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {e.cidade && (
                      <span className="flex items-center gap-0.5 text-zinc-500 text-[0.5625rem]">
                        <MapPin size="0.5rem" /> {e.cidade}
                      </span>
                    )}
                    {e.data && (
                      <span className="flex items-center gap-0.5 text-zinc-500 text-[0.5625rem]">
                        <Calendar size="0.5rem" /> {e.data}
                      </span>
                    )}
                    {e.horario && <span className="text-zinc-500 text-[0.5625rem]">· {e.horario}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Deal ativo do membro */}
      {meuResgate && (
        <div className="bg-[#FFD300]/5 border border-[#FFD300]/20 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size="0.75rem" className="text-[#FFD300]" />
            <span className="text-[#FFD300] text-[0.625rem] font-black uppercase tracking-wider">Deal Ativo</span>
          </div>
          <p className="text-white text-sm font-bold truncate">{meuResgate.dealTitulo ?? 'Deal'}</p>
          <p className="text-zinc-400 text-[0.625rem]">{meuResgate.parceiroNome}</p>

          {(() => {
            const s = statusLabel(meuResgate.status);
            return (
              <span
                className={`inline-block px-2 py-0.5 rounded text-[0.5625rem] font-bold uppercase ${s.bg} ${s.color}`}
              >
                {s.text}
              </span>
            );
          })()}

          {meuResgate.status === 'APLICADO' && (
            <button onClick={() => handleCancelar(meuResgate.id)} className="text-[0.625rem] text-red-400 underline">
              Cancelar candidatura
            </button>
          )}

          {meuResgate.status === 'PENDENTE_POST' && (
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                placeholder="Cole o link do post..."
                value={postUrl}
                onChange={e => setPostUrl(e.target.value)}
                className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 min-w-0"
              />
              <button
                onClick={() => handleEnviarPost(meuResgate.id)}
                className="bg-[#FFD300] text-black px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1"
              >
                <Send size="0.625rem" /> Enviar
              </button>
            </div>
          )}

          {meuResgate.status === 'SELECIONADO' && meuResgate.qrToken && (
            <button
              onClick={() => setShowQr(true)}
              className="w-full bg-[#FFD300] text-black py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <CheckCircle size="0.75rem" /> Ver QR Code
            </button>
          )}
        </div>
      )}

      {/* Benefícios de parceiros */}
      {dealsVisiveis.length > 0 && (
        <div>
          <p className="text-[0.5rem] font-black uppercase tracking-widest text-purple-400/70 mb-3">
            Benefícios de parceiros ({dealsVisiveis.length})
          </p>
          <div className="space-y-3">
            {dealsVisiveis.map(b => {
              const resgate = getResgateParaDeal(b.dealId);
              const temDealAtivo = !!meuResgate;
              const jaAplicou = !!resgate;

              return (
                <div key={b.id} className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    {b.fotoUrl ? (
                      <img
                        src={b.fotoUrl}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-purple-500/10">
                        <Store size="1.125rem" className="text-purple-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[0.4375rem] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">
                          Parceiro
                        </span>
                        {b.vagasRestantes != null && (
                          <span className="text-zinc-500 text-[0.5rem]">
                            {b.vagasRestantes} vaga{b.vagasRestantes !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <p className="text-white text-sm font-bold truncate">{b.titulo}</p>
                      <p className="text-purple-400 text-[0.625rem] font-bold truncate">{b.subtitulo}</p>
                      {b.descricao && <p className="text-zinc-400 text-[0.625rem] truncate mt-0.5">{b.descricao}</p>}
                      <div className="flex items-center gap-2 mt-1.5">
                        {b.cidade && (
                          <span className="flex items-center gap-0.5 text-zinc-500 text-[0.5625rem]">
                            <MapPin size="0.5rem" /> {b.cidade}
                          </span>
                        )}
                        {b.data && (
                          <span className="flex items-center gap-0.5 text-zinc-500 text-[0.5625rem]">
                            <Calendar size="0.5rem" /> {formatDate(b.data)}
                          </span>
                        )}
                      </div>

                      {/* Botão de resgate */}
                      {jaAplicou ? (
                        (() => {
                          const s = statusLabel(resgate.status);
                          return (
                            <span
                              className={`inline-block mt-2 px-2 py-0.5 rounded text-[0.5625rem] font-bold uppercase ${s.bg} ${s.color}`}
                            >
                              {s.text}
                            </span>
                          );
                        })()
                      ) : !temDealAtivo ? (
                        <button
                          onClick={() => handleAplicar(b.dealId, b.parceiroId)}
                          disabled={aplicando}
                          className="mt-2 bg-purple-500/20 text-purple-400 px-3 py-1 rounded-lg text-[0.625rem] font-bold uppercase tracking-wider active:scale-95 transition-all disabled:opacity-50"
                        >
                          {aplicando ? '...' : 'Quero resgatar'}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQr && meuResgate?.qrToken && (
        <div className="absolute inset-0 z-[200] bg-black/90 flex items-center justify-center p-8">
          <div className="bg-zinc-900 rounded-2xl p-6 max-w-xs w-full space-y-4 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-white text-sm font-bold">Seu QR Code</span>
              <button onClick={() => setShowQr(false)} className="active:scale-90 transition-all">
                <X size="1.25rem" className="text-zinc-400" />
              </button>
            </div>
            <div className="flex justify-center">
              <QRCodeSVG value={meuResgate.qrToken} size={200} bgColor="transparent" fgColor="#FFD300" level="H" />
            </div>
            <p className="text-center text-zinc-400 text-xs">Mostre este QR code no local parceiro</p>
          </div>
        </div>
      )}
    </div>
  );
};
