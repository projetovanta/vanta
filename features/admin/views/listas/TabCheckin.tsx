import React, { useState, useMemo } from 'react';
import { Search, Check, Users, X } from 'lucide-react';
import type { ListaEvento, ConvidadoLista } from '../../../../types';
import { listasService } from '../../services/listasService';
import { isRegraAbobora } from './listasUtils';

export const TabCheckin: React.FC<{
  lista: ListaEvento;
  onRefresh: () => void;
  userNome: string;
}> = ({ lista, onRefresh, userNome }) => {
  const [busca, setBusca] = useState('');

  const convidados: ConvidadoLista[] = useMemo(() => {
    const q = busca.toLowerCase();
    const todos = q ? lista.convidados.filter(c => c.nome.toLowerCase().includes(q)) : lista.convidados;
    return [...todos].sort((a, b) => {
      if (a.checkedIn === b.checkedIn) return 0;
      return a.checkedIn ? 1 : -1;
    });
  }, [lista.convidados, busca]);

  const [avisoCorte, setAvisoCorte] = useState<{ nome: string; hora: string } | null>(null);
  const [avisoPagamento, setAvisoPagamento] = useState<{
    nome: string;
    valor: number;
    regraLabel: string;
    convidadoId: string;
    listaId: string;
    isAbobora?: boolean;
    horaCorte?: string;
  } | null>(null);

  const handleCheckin = async (convidadoId: string) => {
    const convidado = lista.convidados.find(c => c.id === convidadoId);
    const result = await listasService.checkIn(lista.id, convidadoId, userNome);
    if (result.bloqueado) {
      setAvisoCorte({ nome: convidado?.nome ?? '', hora: result.horaCorte ?? '' });
      return;
    }
    if (result.pendente) {
      setAvisoPagamento({
        nome: convidado?.nome ?? '',
        valor: result.valorAbobora ?? 0,
        regraLabel: result.regraDestinoLabel ?? '',
        convidadoId,
        listaId: lista.id,
        isAbobora: true,
        horaCorte: result.horaCorte,
      });
      return;
    }
    if (result.pendentePagamento) {
      setAvisoPagamento({
        nome: convidado?.nome ?? '',
        valor: result.valorRegra ?? 0,
        regraLabel: result.regraLabel ?? '',
        convidadoId,
        listaId: lista.id,
      });
      return;
    }
    onRefresh();
  };

  const confirmarPagamento = async (forma: 'DINHEIRO' | 'CARTAO' | 'PIX') => {
    if (!avisoPagamento) return;
    if (avisoPagamento.isAbobora) {
      await listasService.confirmarCheckInAbobora(avisoPagamento.listaId, avisoPagamento.convidadoId, forma, userNome);
    } else {
      await listasService.confirmarCheckInPago(avisoPagamento.listaId, avisoPagamento.convidadoId, forma, userNome);
    }
    setAvisoPagamento(null);
    onRefresh();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center gap-2 bg-zinc-900/60 border border-white/5 rounded-xl px-3 py-2.5 focus-within:border-[#FFD300]/30 mb-4 shrink-0">
        <Search size={13} className="text-zinc-400 shrink-0" />
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome..."
          className="flex-1 bg-transparent text-white text-sm outline-none placeholder-zinc-700"
        />
        {busca && (
          <button onClick={() => setBusca('')}>
            <X size={12} className="text-zinc-400" />
          </button>
        )}
      </div>

      <div className="flex gap-3 mb-4 shrink-0">
        <div className="flex-1 bg-zinc-900/40 border border-white/5 rounded-xl p-3 text-center">
          <p className="text-white font-black text-xl">{lista.convidados.filter(c => !c.checkedIn).length}</p>
          <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest mt-0.5">Aguardando</p>
        </div>
        <div className="flex-1 bg-zinc-900/40 border border-white/5 rounded-xl p-3 text-center">
          <p className="text-emerald-400 font-black text-xl">{lista.convidados.filter(c => c.checkedIn).length}</p>
          <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest mt-0.5">Dentro</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
        {convidados.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-3">
            <Users size={28} className="text-zinc-800" />
            <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest">
              {busca ? 'Nenhum resultado' : 'Nenhum convidado'}
            </p>
          </div>
        )}
        {convidados.map(c => {
          const regra = lista.regras.find(r => r.id === c.regraId);
          const abobora = regra ? isRegraAbobora(regra) : false;
          return (
            <div
              key={c.id}
              className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                c.checkedIn ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-zinc-900/30 border-white/5'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0">
                <span className="text-zinc-400 text-xs font-black">{c.nome.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-bold truncate">{c.nome}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {regra && (
                    <span className="flex items-center gap-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: regra.cor ?? '#71717a' }}
                      />
                      <span className="text-zinc-400 text-[9px] font-black truncate">{regra.label}</span>
                    </span>
                  )}
                  {abobora && !c.checkedIn && (
                    <span className="text-amber-400 text-[8px] font-black">
                      {regra?.valor ? `R$${regra.valor}` : `⚠ ${regra?.horaCorte}`}
                    </span>
                  )}
                </div>
              </div>
              {c.checkedIn ? (
                <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1 shrink-0">
                  <Check size={10} className="text-emerald-400" />
                  <span className="text-emerald-400 text-[9px] font-black">Dentro</span>
                </div>
              ) : (
                <button
                  onClick={() => handleCheckin(c.id)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-zinc-300 text-[10px] font-black uppercase tracking-wider active:bg-[#FFD300]/10 active:border-[#FFD300]/30 active:text-[#FFD300] transition-all shrink-0"
                >
                  <Check size={11} />
                  Confirmar
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Aviso de hora de corte — check-in bloqueado */}
      {avisoCorte && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-zinc-900 border border-red-500/30 rounded-2xl p-5 max-w-xs w-full text-center space-y-3">
            <div className="text-red-400 text-sm font-bold">Check-in bloqueado</div>
            <p className="text-zinc-300 text-xs">
              <span className="font-semibold text-white">{avisoCorte.nome}</span> está na lista VIP até às{' '}
              <span className="font-semibold text-[#FFD300]">{avisoCorte.hora}</span>. O horário já passou e esta lista
              não tem valor após o corte.
            </p>
            <button
              onClick={() => setAvisoCorte(null)}
              className="w-full py-2.5 bg-zinc-800 border border-white/10 rounded-xl text-zinc-300 text-xs font-bold uppercase tracking-wider"
            >
              Entendi
            </button>
          </div>
        </div>
      )}

      {/* Modal de pagamento — lista paga ou abóbora */}
      {avisoPagamento && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-zinc-900 border border-[#FFD300]/30 rounded-2xl p-5 max-w-xs w-full text-center space-y-4">
            {avisoPagamento.isAbobora && (
              <div className="text-[#FFD300] text-sm font-bold">VIP até às {avisoPagamento.horaCorte} encerrado</div>
            )}
            <p className="text-zinc-300 text-xs">
              <span className="font-semibold text-white">{avisoPagamento.nome}</span>
              {avisoPagamento.regraLabel ? ` (${avisoPagamento.regraLabel})` : ''} — cobrar{' '}
              <span className="font-black text-[#FFD300] text-base">
                R${avisoPagamento.valor.toFixed(2).replace('.', ',')}
              </span>
            </p>
            <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Como vai pagar?</p>
            <div className="flex gap-2">
              {(['DINHEIRO', 'CARTAO', 'PIX'] as const).map(forma => (
                <button
                  key={forma}
                  onClick={() => confirmarPagamento(forma)}
                  className="flex-1 py-3 bg-[#FFD300]/10 border border-[#FFD300]/30 rounded-xl text-[#FFD300] text-[10px] font-bold uppercase tracking-wider active:scale-95 transition-transform"
                >
                  {forma === 'DINHEIRO' ? 'Dinheiro' : forma === 'CARTAO' ? 'Cartão' : 'Pix'}
                </button>
              ))}
            </div>
            <button
              onClick={() => setAvisoPagamento(null)}
              className="w-full py-2 bg-zinc-800 border border-white/10 rounded-xl text-zinc-400 text-[10px] font-bold uppercase tracking-wider"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
