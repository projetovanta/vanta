import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  ListChecks,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { ContaVanta, EventoAdmin } from '../../../types';
import { getAcessoEventos } from '../permissoes';
import { eventosAdminService } from '../services/eventosAdminService';
import { EventoDashboard } from './eventoDashboard';

type AbaEventos = 'ativos' | 'passados' | 'em_revisao' | 'rejeitados';

export const MeusEventosView: React.FC<{
  onBack: () => void;
  currentUserId: string;
  currentUserRole: ContaVanta;
  comunidadeId?: string;
}> = ({ onBack, currentUserId, currentUserRole, comunidadeId }) => {
  const [eventoAberto, setEventoAberto] = useState<string | null>(null);
  const [aba, setAba] = useState<AbaEventos>('ativos');

  // Se comunidadeId fornecido, buscar direto por comunidade (guard já verificado antes)
  // Senão, usar acesso filtrado por permissões
  const eventos = comunidadeId
    ? eventosAdminService.getEventosByComunidade(comunidadeId)
    : getAcessoEventos(currentUserId, currentUserRole);

  const [buscaRejeitados, setBuscaRejeitados] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [paginaRejeitados, setPaginaRejeitados] = useState(0);
  const POR_PAGINA = 10;

  const { ativos, passados, emRevisao, rejeitados } = useMemo(() => {
    const agora = new Date();
    const a: typeof eventos = [];
    const p: typeof eventos = [];
    const rev: typeof eventos = [];
    const rej: typeof eventos = [];
    for (const ev of eventos) {
      if (ev.statusEvento === 'EM_REVISAO') {
        rev.push(ev);
        continue;
      }
      if (ev.statusEvento === 'CANCELADO' && (ev.rodadaRejeicao ?? 0) > 0) {
        rej.push(ev);
        continue;
      }
      const dFim = new Date(ev.dataFim);
      if (dFim > agora) a.push(ev);
      else p.push(ev);
    }
    a.sort((x, y) => new Date(x.dataInicio).getTime() - new Date(y.dataInicio).getTime());
    p.sort((x, y) => new Date(y.dataFim).getTime() - new Date(x.dataFim).getTime());
    rej.sort((x, y) => new Date(y.criadoEm).getTime() - new Date(x.criadoEm).getTime());
    return { ativos: a, passados: p, emRevisao: rev, rejeitados: rej };
  }, [eventos]);

  const rejeitadosFiltrados = useMemo(() => {
    let list = rejeitados;
    if (buscaRejeitados.trim()) {
      const q = buscaRejeitados.toLowerCase();
      list = list.filter(ev => ev.nome.toLowerCase().includes(q));
    }
    if (filtroMes) {
      list = list.filter(ev => ev.criadoEm.startsWith(filtroMes));
    }
    return list;
  }, [rejeitados, buscaRejeitados, filtroMes]);

  const rejeitadosPaginados = rejeitadosFiltrados.slice(
    paginaRejeitados * POR_PAGINA,
    (paginaRejeitados + 1) * POR_PAGINA,
  );
  const totalPaginas = Math.ceil(rejeitadosFiltrados.length / POR_PAGINA);

  const listaAtual =
    aba === 'ativos' ? ativos : aba === 'passados' ? passados : aba === 'em_revisao' ? emRevisao : rejeitadosPaginados;

  if (eventoAberto) {
    return (
      <EventoDashboard
        eventoId={eventoAberto}
        onBack={() => setEventoAberto(null)}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        onNavigateEvento={id => setEventoAberto(id)}
      />
    );
  }

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-5 flex justify-between items-start shrink-0">
        <div>
          <p style={TYPOGRAPHY.sectionKicker} className="mb-1.5">
            Eventos
          </p>
          <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic">
            Eventos da Comunidade
          </h1>
        </div>
        <button
          aria-label="Voltar"
          onClick={onBack}
          className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all mt-1"
        >
          <ArrowLeft size="1.125rem" className="text-zinc-400" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-white/5 shrink-0">
        {[
          { id: 'ativos' as AbaEventos, label: 'Ativos', count: ativos.length },
          { id: 'passados' as AbaEventos, label: 'Passados', count: passados.length },
          ...(emRevisao.length > 0
            ? [{ id: 'em_revisao' as AbaEventos, label: 'Correção', count: emRevisao.length }]
            : []),
          ...(rejeitados.length > 0
            ? [{ id: 'rejeitados' as AbaEventos, label: 'Rejeitados', count: rejeitados.length }]
            : []),
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setAba(t.id)}
            className={`flex-1 py-3 text-center text-[0.625rem] font-black uppercase tracking-widest transition-all ${
              aba === t.id
                ? 'text-[#FFD300] border-b-2 border-[#FFD300]'
                : 'text-zinc-400 border-b-2 border-transparent'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span
                className={`ml-1.5 text-[0.5rem] px-1.5 py-0.5 rounded-full ${
                  aba === t.id ? 'bg-[#FFD300]/15 text-[#FFD300]' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filtros da aba Rejeitados */}
      {aba === 'rejeitados' && rejeitados.length > 0 && (
        <div className="px-5 pt-3 pb-1 shrink-0 space-y-2">
          <div className="relative">
            <Search size="0.875rem" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={buscaRejeitados}
              onChange={e => {
                setBuscaRejeitados(e.target.value);
                setPaginaRejeitados(0);
              }}
              placeholder="Buscar por nome..."
              className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white outline-none focus:border-white/20 placeholder-zinc-700"
            />
          </div>
          <input
            type="month"
            value={filtroMes}
            onChange={e => {
              setFiltroMes(e.target.value);
              setPaginaRejeitados(0);
            }}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-400 outline-none focus:border-white/20"
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-3 max-w-3xl mx-auto w-full">
        {listaAtual.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
              <ListChecks size="1.75rem" className="text-zinc-700" />
            </div>
            <p className="text-zinc-700 text-[0.625rem] font-black uppercase tracking-widest text-center">
              {aba === 'ativos'
                ? 'Nenhum evento ativo'
                : aba === 'passados'
                  ? 'Nenhum evento passado'
                  : aba === 'em_revisao'
                    ? 'Nenhuma correção pendente'
                    : 'Nenhum evento rejeitado'}
            </p>
            <p className="text-zinc-800 text-[0.5625rem] text-center leading-relaxed">
              {aba === 'ativos'
                ? 'Crie eventos pelo painel da comunidade.'
                : aba === 'passados'
                  ? 'Eventos encerrados aparecerão aqui.'
                  : aba === 'em_revisao'
                    ? 'Eventos que precisam de correção aparecerão aqui.'
                    : 'Eventos cancelados após rejeições aparecerão aqui.'}
            </p>
          </div>
        ) : (
          listaAtual.map(ev => {
            const dataLabel = new Date(ev.dataInicio)
              .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
              .toUpperCase();
            const agora = new Date();
            const dInicio = new Date(ev.dataInicio);
            const dFim = new Date(ev.dataFim);
            const statusEvento =
              dInicio <= agora && dFim > agora ? 'ao_vivo' : dInicio > agora ? 'futuro' : 'encerrado';
            return (
              <button
                key={ev.id}
                onClick={() => setEventoAberto(ev.id)}
                className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden flex items-center gap-4 p-4 active:border-[#FFD300]/20 active:bg-[#FFD300]/5 transition-all text-left"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-zinc-900">
                  {ev.foto && <img loading="lazy" src={ev.foto} alt={ev.nome} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm leading-tight truncate mb-1">{ev.nome}</p>
                  <div className="flex items-center gap-1 mb-0.5">
                    <Calendar size="0.625rem" className="text-zinc-400 shrink-0" />
                    <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest">{dataLabel}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size="0.625rem" className="text-zinc-400 shrink-0" />
                    <p className="text-zinc-400 text-[0.5625rem] truncate">{ev.local}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {statusEvento === 'ao_vivo' && (
                    <span className="text-[0.4375rem] font-black uppercase tracking-widest px-1.5 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-full border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      ao vivo
                    </span>
                  )}
                  {statusEvento === 'futuro' && (
                    <span className="text-[0.4375rem] font-black uppercase tracking-widest px-1.5 py-0.5 bg-[#FFD300]/10 text-[#FFD300] rounded-full border border-[#FFD300]/20">
                      programado
                    </span>
                  )}
                  {statusEvento === 'encerrado' && (
                    <span className="text-[0.4375rem] font-black uppercase tracking-widest px-1.5 py-0.5 bg-zinc-800/60 text-zinc-400 rounded-full border border-white/5">
                      encerrado
                    </span>
                  )}
                  {ev.statusEvento === 'EM_REVISAO' && (
                    <span className="text-[0.4375rem] font-black uppercase tracking-widest px-1.5 py-0.5 bg-amber-500/15 text-amber-400 rounded-full border border-amber-500/30 flex items-center gap-1">
                      <AlertTriangle size="0.5rem" />
                      correção {ev.rodadaRejeicao ?? 0}/3
                    </span>
                  )}
                  {ev.statusEvento === 'CANCELADO' && (ev.rodadaRejeicao ?? 0) > 0 && (
                    <span className="text-[0.4375rem] font-black uppercase tracking-widest px-1.5 py-0.5 bg-red-500/15 text-red-400 rounded-full border border-red-500/30">
                      rejeitado
                    </span>
                  )}
                  {ev.socios?.some(s => s.status === 'PENDENTE' || s.status === 'NEGOCIANDO') && (
                    <span className="text-[0.4375rem] font-black uppercase tracking-widest px-1.5 py-0.5 bg-cyan-500/15 text-cyan-400 rounded-full border border-cyan-500/30">
                      {ev.socios.find(s => s.status === 'NEGOCIANDO') ? 'negociando' : 'aguardando sócio'}
                    </span>
                  )}
                  {ev.socios?.some(
                    s => s.status === 'RECUSADO' || s.status === 'CANCELADO' || s.status === 'EXPIRADO',
                  ) &&
                    !ev.socios.some(s => s.status === 'ACEITO') && (
                      <span className="text-[0.4375rem] font-black uppercase tracking-widest px-1.5 py-0.5 bg-orange-500/15 text-orange-400 rounded-full border border-orange-500/30">
                        {ev.socios.find(s => s.status === 'EXPIRADO')
                          ? 'expirado'
                          : ev.socios.find(s => s.status === 'CANCELADO')
                            ? 'cancelado'
                            : 'recusado'}
                      </span>
                    )}
                </div>
                {/* Campos de rejeição embaixo do card */}
                {ev.statusEvento === 'EM_REVISAO' && ev.rejeicaoCampos && (
                  <div className="mt-2 bg-red-500/5 border border-red-500/20 rounded-xl p-3 space-y-1.5">
                    {ev.motivoRejeicao && <p className="text-red-400 text-xs italic">{ev.motivoRejeicao}</p>}
                    {Object.entries(ev.rejeicaoCampos).map(([campo, comentario]) => (
                      <div key={campo} className="flex items-start gap-2">
                        <AlertTriangle size="0.625rem" className="text-red-400 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="text-red-400 text-[0.625rem] font-bold uppercase">
                            {campo.replace(/_/g, ' ')}
                          </span>
                          {comentario && <p className="text-zinc-400 text-[0.625rem]">{comentario}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </button>
            );
          })
        )}

        {/* Paginação rejeitados */}
        {aba === 'rejeitados' && totalPaginas > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setPaginaRejeitados(p => Math.max(0, p - 1))}
              disabled={paginaRejeitados === 0}
              className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 disabled:opacity-30"
            >
              <ChevronLeft size="0.875rem" />
            </button>
            <span className="text-zinc-400 text-xs">
              {paginaRejeitados + 1} / {totalPaginas}
            </span>
            <button
              onClick={() => setPaginaRejeitados(p => Math.min(totalPaginas - 1, p + 1))}
              disabled={paginaRejeitados >= totalPaginas - 1}
              className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 disabled:opacity-30"
            >
              <ChevronRight size="0.875rem" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
