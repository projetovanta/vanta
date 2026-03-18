import React, { useState, useEffect } from 'react';
import { Gift, Check, Search, X } from 'lucide-react';
import { TYPOGRAPHY } from '../../../../constants';
import { Membro, ListaEvento } from '../../../../types';
import { authService } from '../../../../services/authService';
import { cortesiasService } from '../../services/cortesiasService';
import { inputCls } from './types';

// ── Modal: Transferir Cortesia ───────────────────────────────────────────────
const TransferirCortesiaModal: React.FC<{
  eventoAdminId: string;
  eventoNome: string;
  eventoData: string;
  adminNome: string;
  onClose: () => void;
}> = ({ eventoAdminId, eventoNome, eventoData, adminNome, onClose }) => {
  const config = cortesiasService.getCortesiaConfig(eventoAdminId);
  const saldo = cortesiasService.getSaldoGlobal(eventoAdminId);

  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [destinatario, setDestinatario] = useState<{ id: string; nome: string; foto: string } | null>(null);
  const [variacaoLabel, setVariacaoLabel] = useState(config?.variacoes[0] ?? '');
  const [quantidade, setQuantidade] = useState('1');
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState('');

  const [resultados, setResultados] = useState<Membro[]>([]);
  useEffect(() => {
    if (query.length < 2) {
      setResultados([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      if (cancelled) return;
      try {
        const r = await authService.buscarMembros(query, 5);
        if (cancelled) return;
        setResultados(r);
      } catch (err) {
        console.error('[TabCortesias] busca:', err);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  const handleEnviar = async () => {
    setErro('');
    const qtd = parseInt(quantidade);
    if (!destinatario) {
      setErro('Selecione o destinatário.');
      return;
    }
    if (!variacaoLabel) {
      setErro('Selecione o tipo de ingresso.');
      return;
    }
    if (!qtd || qtd <= 0) {
      setErro('Quantidade inválida.');
      return;
    }
    if (qtd > saldo) {
      setErro(`Saldo insuficiente (${saldo} disponíveis).`);
      return;
    }

    const ok = await cortesiasService.enviarParaDestinatario({
      eventoAdminId,
      eventoNome,
      eventoData,
      remetenteNome: adminNome,
      destinatarioId: destinatario.id,
      destinatarioNome: destinatario.nome,
      variacaoLabel,
      quantidade: qtd,
    });

    if (!ok) {
      setErro('Falha ao enviar. Verifique o saldo.');
      return;
    }
    setEnviado(true);
    setTimeout(() => onClose(), 1800);
  };

  return (
    <div
      className="absolute inset-0 z-[60] flex items-end justify-center bg-black/85 backdrop-blur-sm"
      onClick={!enviado ? onClose : undefined}
    >
      <div
        className="w-full max-w-sm bg-[#111111] border border-white/10 rounded-t-[2.5rem] overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>

        {enviado ? (
          <div className="flex flex-col items-center justify-center py-14 px-6 gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Check size="1.75rem" className="text-emerald-400" />
            </div>
            <p className="text-white font-bold text-lg text-center">Cortesia enviada!</p>
            <p className="text-zinc-400 text-[0.6875rem] text-center leading-relaxed">
              {destinatario?.nome} receberá o ingresso na carteira em instantes.
            </p>
          </div>
        ) : (
          <>
            <div className="px-6 pt-3 pb-4 border-b border-white/5 shrink-0">
              <h2 style={TYPOGRAPHY.screenTitle} className="text-lg italic">
                Transferir Cortesia
              </h2>
              <p className="text-zinc-400 text-[0.625rem] mt-1">
                Saldo disponível: <span className="text-[#FFD300] font-black">{saldo}</span> cortesia
                {saldo !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
              {/* Tipo de ingresso */}
              {config && config.variacoes.length > 0 && (
                <div>
                  <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-2">
                    Tipo de ingresso
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {config.variacoes.map(v => (
                      <button
                        key={v}
                        onClick={() => setVariacaoLabel(v)}
                        className={`px-3.5 py-2 rounded-xl border text-[0.5625rem] font-black uppercase tracking-wider transition-all ${
                          variacaoLabel === v
                            ? 'bg-[#FFD300] text-black border-transparent'
                            : 'bg-zinc-900/60 text-zinc-400 border-white/5 active:bg-zinc-800'
                        }`}
                      >
                        <span className="truncate">{v}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Destinatário */}
              <div>
                <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-2">Destinatário</p>
                {destinatario ? (
                  <div className="flex items-center gap-3 p-3.5 bg-zinc-900/60 border border-[#FFD300]/20 rounded-xl">
                    <img
                      src={destinatario.foto}
                      alt={destinatario.nome}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <p className="text-white font-bold text-sm flex-1 min-w-0 truncate">{destinatario.nome}</p>
                    <button
                      onClick={() => {
                        setDestinatario(null);
                        setQuery('');
                      }}
                      className="text-zinc-400 active:text-red-400 transition-colors shrink-0"
                    >
                      <X size="0.875rem" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="flex items-center gap-3 bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-2.5 focus-within:border-[#FFD300]/30">
                      <Search size="0.875rem" className="text-zinc-400 shrink-0" />
                      <input
                        value={query}
                        onChange={e => {
                          setQuery(e.target.value);
                          setShowResults(true);
                        }}
                        placeholder="Buscar por nome ou email..."
                        className="flex-1 bg-transparent text-white text-sm outline-none placeholder-zinc-700"
                      />
                    </div>
                    {showResults && resultados.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-10 bg-zinc-900 border border-white/10 rounded-xl mt-1 overflow-hidden shadow-2xl">
                        {resultados.map(m => (
                          <button
                            key={m.id}
                            onClick={() => {
                              setDestinatario({ id: m.id, nome: m.nome, foto: m.foto });
                              setShowResults(false);
                              setQuery('');
                            }}
                            className="w-full flex items-center gap-3 p-3.5 border-b border-white/5 last:border-0 active:bg-white/5 transition-all text-left"
                          >
                            <img
                              loading="lazy"
                              src={m.foto}
                              alt={m.nome}
                              className="w-9 h-9 rounded-full object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-white font-bold text-sm leading-none truncate">{m.nome}</p>
                              <p className="text-zinc-400 text-[0.625rem] mt-0.5 truncate">{m.email}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quantidade */}
              <div>
                <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-2">Quantidade</p>
                <input
                  value={quantidade}
                  onChange={e => setQuantidade(e.target.value)}
                  type="number"
                  min="1"
                  max={String(saldo)}
                  placeholder="1"
                  className={inputCls}
                />
              </div>

              {erro && <p className="text-red-400 text-[0.625rem] font-black uppercase tracking-widest">{erro}</p>}
            </div>

            <div
              className="px-5 pt-3 border-t border-white/5 shrink-0 flex gap-2"
              style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 2rem))' }}
            >
              <button
                onClick={onClose}
                className="flex-1 py-4 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest active:scale-95 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleEnviar}
                disabled={!destinatario || !variacaoLabel || !quantidade || parseInt(quantidade) <= 0}
                className="flex-1 py-4 bg-[#FFD300] text-black rounded-xl text-[0.625rem] font-black uppercase tracking-widest disabled:opacity-40 active:scale-95 transition-all font-bold flex items-center justify-center gap-2"
              >
                <Gift size="0.75rem" /> Enviar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Aba: Cortesias ──────────────────────────────────────────────────────────
export const TabCortesias: React.FC<{
  listaId: string;
  lista: ListaEvento;
  adminNome: string;
}> = ({ listaId, lista, adminNome }) => {
  const eventoAdminId = cortesiasService.getEventoAdminId(listaId);
  const [transferirOpen, setTransferirOpen] = useState(false);
  const [tick, setTick] = useState(0);

  if (!eventoAdminId || !cortesiasService.getCortesiaConfig(eventoAdminId)) {
    return (
      <div className="flex flex-col items-center py-16 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
          <Gift size="1.75rem" className="text-zinc-700" />
        </div>
        <div className="text-center">
          <p className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest">
            Sem cortesias configuradas.
          </p>
          <p className="text-zinc-700 text-[0.625rem] italic mt-1">
            Ative cortesias ao criar o evento no próximo evento.
          </p>
        </div>
      </div>
    );
  }

  const config = cortesiasService.getCortesiaConfig(eventoAdminId)!;
  const saldo = cortesiasService.getSaldoGlobal(eventoAdminId);
  const logs = cortesiasService.getLogs(eventoAdminId);
  const usados = config.limite - saldo;
  const pct = config.limite > 0 ? Math.round((usados / config.limite) * 100) : 0;
  const temPerTipo = config.limitesPorTipo && Object.keys(config.limitesPorTipo).length > 0;

  return (
    <div className="space-y-4">
      {/* Saldo hero */}
      <div className="p-6 bg-zinc-900/40 border border-white/5 rounded-3xl">
        <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest mb-4">Cortesias do Evento</p>
        <div className="flex items-end justify-between mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-white font-black text-5xl leading-none">{saldo}</span>
            <span className="text-zinc-400 text-xl font-normal">/{config.limite}</span>
          </div>
          <div className="text-right pb-1">
            <p className="text-[#FFD300] font-black text-3xl leading-none">{usados}</p>
            <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest">enviadas</p>
          </div>
        </div>
        <div className="w-full h-4 bg-zinc-800 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-[#FFD300] rounded-full transition-all"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <p className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest">
          {saldo} disponíve{saldo !== 1 ? 'is' : 'l'}
        </p>
        {temPerTipo &&
          (() => {
            const saldoTipo = cortesiasService.getSaldoPorTipo(eventoAdminId);
            return (
              <div className="mt-4 space-y-1.5">
                {Object.entries(saldoTipo).map(([tipo, { limite, usado, saldo: s }]) => (
                  <div key={tipo} className="flex items-center justify-between gap-2">
                    <p className="text-zinc-400 text-[0.625rem] font-bold truncate flex-1 min-w-0">{tipo}</p>
                    <p className="text-zinc-400 text-[0.5625rem] shrink-0">
                      {usado}/{limite}
                    </p>
                    <p className={`text-[0.625rem] font-black shrink-0 ${s > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {s}
                    </p>
                  </div>
                ))}
              </div>
            );
          })()}
      </div>

      {/* Botão transferir */}
      {saldo > 0 && (
        <button
          onClick={() => setTransferirOpen(true)}
          className="w-full flex items-center justify-between p-5 bg-[#FFD300] rounded-2xl active:scale-[0.97] transition-all"
        >
          <div>
            <p className="text-black font-black text-sm uppercase tracking-wider leading-none">Transferir Cortesias</p>
            <p className="text-black/50 text-[0.625rem] font-bold mt-1">Enviar ingressos para equipe ou convidados</p>
          </div>
          <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center shrink-0">
            <Gift size="1.125rem" className="text-black" />
          </div>
        </button>
      )}

      {/* Histórico */}
      {logs.length > 0 && (
        <>
          <p className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-widest px-1">Histórico</p>
          <div className="space-y-0">
            {logs.map((log, i) => (
              <div key={log.id} className="flex gap-3 relative">
                {i < logs.length - 1 && <div className="absolute left-[0.375rem] top-4 bottom-0 w-px bg-zinc-800" />}
                <div className="w-3 h-3 rounded-full bg-[#FFD300]/20 border border-[#FFD300]/40 shrink-0 mt-1" />
                <div className="pb-5 flex-1 min-w-0">
                  <p className="text-zinc-200 text-[0.6875rem] leading-snug">
                    <span className="text-zinc-300 font-bold">{log.remetenteNome}</span> enviou{' '}
                    <span className="text-[#FFD300] font-bold">{log.quantidade}</span> cortesia
                    {log.quantidade > 1 ? 's' : ''} ({log.variacaoLabel}) para{' '}
                    <span className="text-zinc-300 font-bold">{log.destinatarioNome}</span>
                  </p>
                  <p className="text-zinc-700 text-[0.5625rem] mt-1 font-black">
                    {new Date(log.ts).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {logs.length === 0 && (
        <p className="text-zinc-700 text-[0.625rem] font-black uppercase tracking-widest text-center py-6">
          Nenhuma cortesia enviada ainda
        </p>
      )}

      {transferirOpen && (
        <TransferirCortesiaModal
          eventoAdminId={eventoAdminId}
          eventoNome={lista.eventoNome}
          eventoData={lista.eventoData}
          adminNome={adminNome}
          onClose={() => {
            setTransferirOpen(false);
            setTick(t => t + 1);
          }}
        />
      )}
    </div>
  );
};
