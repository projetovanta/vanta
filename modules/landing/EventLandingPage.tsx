import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, MapPin, Clock, Ticket, Loader2 } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { fmtBRL } from '../../utils';

interface LotePublico {
  id: string;
  nome: string;
  variacoes: {
    id: string;
    label: string;
    preco: number;
    limite: number;
    vendidos: number;
  }[];
}

interface EventoPublico {
  id: string;
  nome: string;
  descricao: string;
  foto: string;
  dataInicio: string;
  dataFim: string;
  local: string;
  endereco: string;
  cidade: string;
  comunidade: { nome: string; foto: string };
  lotes: LotePublico[];
}

const ref = new URLSearchParams(window.location.search).get('ref') ?? '';

// Salvar ref do promoter para tracking
if (ref) {
  try {
    localStorage.setItem('vanta_promoter_ref', ref);
  } catch {
    /* ignore */
  }
}

const fmtData = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
};

const fmtHora = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export const EventLandingPage: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const [evento, setEvento] = useState<EventoPublico | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetch = async () => {
      const { data, error } = await supabase
        .from('eventos_admin')
        .select(
          `
          id, nome, descricao, foto, data_inicio, data_fim, local, endereco, cidade,
          comunidades(nome, foto),
          lotes(id, nome, variacoes_ingresso(id, area, area_custom, valor, limite, vendidos))
        `,
        )
        .eq('slug', slug)
        .eq('publicado', true)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const com = data.comunidades as unknown as { nome: string; foto: string };
      const lotes = (
        (data.lotes ?? []) as unknown as {
          id: string;
          nome: string;
          variacoes_ingresso: {
            id: string;
            area: string;
            area_custom: string | null;
            valor: number;
            limite: number;
            vendidos: number;
          }[];
        }[]
      ).map(l => ({
        id: l.id,
        nome: l.nome,
        variacoes: (l.variacoes_ingresso ?? []).map(v => ({
          id: v.id,
          label: v.area_custom || v.area,
          preco: v.valor,
          limite: v.limite,
          vendidos: v.vendidos ?? 0,
        })),
      }));

      setEvento({
        id: data.id as string,
        nome: data.nome as string,
        descricao: data.descricao as string,
        foto: data.foto as string,
        dataInicio: data.data_inicio as string,
        dataFim: data.data_fim as string,
        local: data.local as string,
        endereco: data.endereco as string,
        cidade: data.cidade as string,
        comunidade: { nome: com.nome, foto: com.foto },
        lotes,
      });
      setLoading(false);
    };

    fetch().catch(console.error);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const status = useMemo(() => {
    if (!evento) return 'desconhecido';
    const agora = new Date();
    const dInicio = new Date(evento.dataInicio);
    const dFim = new Date(evento.dataFim);
    if (dInicio <= agora && dFim > agora) return 'ao_vivo';
    if (dInicio > agora) return 'futuro';
    return 'encerrado';
  }, [evento]);

  const handleComprar = (variacaoId: string) => {
    const params = new URLSearchParams();
    if (ref) params.set('ref', ref);
    params.set('variacao', variacaoId);
    window.location.href = `/checkout/${evento?.id}?${params.toString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-[#050505] flex items-center justify-center">
        <Loader2 size="2rem" className="text-[#FFD300] animate-spin" />
      </div>
    );
  }

  if (notFound || !evento) {
    return (
      <div className="min-h-dvh bg-[#050505] flex flex-col items-center justify-center gap-4 p-6">
        <Ticket size="3rem" className="text-zinc-800" />
        <p className="text-zinc-400 text-sm">Evento não encontrado</p>
        <a href="/" className="text-[#FFD300] text-xs underline">
          Voltar ao início
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#050505] text-white" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <Helmet>
        <title>{evento.nome} — VANTA</title>
        <meta property="og:title" content={evento.nome} />
        <meta property="og:description" content={evento.descricao?.slice(0, 160) || ''} />
        {evento.foto && <meta property="og:image" content={evento.foto} />}
        <meta property="og:url" content={`https://vfronta.com/evento/${slug}`} />
        <meta property="og:type" content="event" />
      </Helmet>
      {/* Hero */}
      <div className="relative">
        <div className="aspect-[16/9] max-h-[25rem] w-full">
          {evento.foto ? (
            <img loading="lazy" src={evento.foto} alt={evento.nome} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
              <Calendar size="3rem" className="text-zinc-800" />
            </div>
          )}
        </div>
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, #050505 0%, rgba(5,5,5,0.5) 50%, rgba(5,5,5,0.1) 100%)' }}
        />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            {evento.comunidade.foto && (
              <img
                loading="lazy"
                src={evento.comunidade.foto}
                alt=""
                className="w-6 h-6 rounded-full border border-white/20"
              />
            )}
            <span className="text-zinc-400 text-[0.625rem] font-bold uppercase tracking-widest">
              {evento.comunidade.nome}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">{evento.nome}</h1>
          <div className="flex items-center gap-4 flex-wrap text-sm">
            <div className="flex items-center gap-1.5">
              <Clock size="0.875rem" className="text-[#FFD300]/70" />
              <span className="text-zinc-300">
                {fmtData(evento.dataInicio)} · {fmtHora(evento.dataInicio)}
              </span>
            </div>
            {evento.local && (
              <div className="flex items-center gap-1.5">
                <MapPin size="0.875rem" className="text-zinc-400" />
                <span className="text-zinc-400">{evento.local}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Descrição */}
        {evento.descricao && (
          <div className="mb-8">
            <h2 className="text-[0.625rem] text-zinc-400 font-black uppercase tracking-widest mb-3">Sobre o evento</h2>
            <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">{evento.descricao}</p>
          </div>
        )}

        {/* Ingressos */}
        <div className="mb-8">
          <h2 className="text-[0.625rem] text-zinc-400 font-black uppercase tracking-widest mb-4">Ingressos</h2>
          {status === 'encerrado' ? (
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 text-center">
              <p className="text-zinc-400 text-sm">Evento encerrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {evento.lotes.map(lote => (
                <div key={lote.id}>
                  {evento.lotes.length > 1 && (
                    <p className="text-[0.5625rem] text-zinc-400 font-bold uppercase tracking-widest mb-2">
                      {lote.nome}
                    </p>
                  )}
                  <div className="space-y-2">
                    {lote.variacoes.map(v => {
                      const esgotado = v.vendidos >= v.limite;
                      return (
                        <div
                          key={v.id}
                          className="flex items-center justify-between p-4 bg-zinc-900/50 border border-white/5 rounded-xl"
                        >
                          <div className="min-w-0">
                            <p className="text-white text-sm font-bold truncate">{v.label}</p>
                            {!esgotado && v.limite > 0 && (
                              <p className="text-[0.5625rem] text-zinc-400 mt-0.5">{v.limite - v.vendidos} restantes</p>
                            )}
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <p className="text-[#FFD300] font-bold">{v.preco > 0 ? fmtBRL(v.preco) : 'Entrada VIP'}</p>
                            <button
                              onClick={() => handleComprar(v.id)}
                              disabled={esgotado}
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                                esgotado
                                  ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                                  : 'bg-[#FFD300] text-black hover:bg-[#FFD300]/90'
                              }`}
                            >
                              {esgotado ? 'Esgotado' : 'Comprar'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info extra */}
        {evento.endereco && (
          <div className="mb-8">
            <h2 className="text-[0.625rem] text-zinc-400 font-black uppercase tracking-widest mb-3">Local</h2>
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
              <p className="text-white text-sm font-bold">{evento.local}</p>
              <p className="text-zinc-400 text-xs mt-1">{evento.endereco}</p>
              {evento.cidade && <p className="text-zinc-400 text-xs mt-0.5">{evento.cidade}</p>}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-8 border-t border-white/5">
          <p className="text-zinc-700 text-[0.5625rem] font-bold uppercase tracking-widest">Powered by VANTA</p>
        </div>
      </div>
    </div>
  );
};
