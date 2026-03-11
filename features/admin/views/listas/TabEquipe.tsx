import React, { useState } from 'react';
import { Plus, Check, Users } from 'lucide-react';
import { TYPOGRAPHY } from '../../../../constants';
import type { ListaEvento } from '../../../../types';
import { listasService, PROMOTERS_CACHE } from '../../services/listasService';
import { inputCls } from './listasUtils';
import { VantaDropdown } from '../../../../components/VantaDropdown';

export const TabEquipe: React.FC<{
  lista: ListaEvento;
  onRefresh: () => void;
}> = ({ lista, onRefresh }) => {
  const [distModal, setDistModal] = useState(false);
  const [selPromoter, setSelPromoter] = useState('');
  const [selRegra, setSelRegra] = useState('');
  const [qtd, setQtd] = useState('');
  const [erro, setErro] = useState('');

  const promoterIds = [...new Set(lista.cotas.map(c => c.promoterId))];

  const handleDistribuir = async () => {
    setErro('');
    const q = parseInt(qtd);
    if (!selPromoter || !selRegra || !q || q <= 0) {
      setErro('Preencha todos os campos.');
      return;
    }
    const promoter = PROMOTERS_CACHE.find(p => p.id === selPromoter);
    const ok = await listasService.distribuirCota(lista.id, selRegra, selPromoter, promoter?.nome ?? selPromoter, q);
    if (!ok) {
      setErro('Saldo no banco insuficiente.');
      return;
    }
    onRefresh();
    setDistModal(false);
    setSelPromoter('');
    setSelRegra('');
    setQtd('');
    setErro('');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar space-y-4">
      <button
        onClick={() => setDistModal(true)}
        className="w-full flex items-center justify-between p-5 bg-[#FFD300] rounded-2xl active:scale-[0.97] transition-all shrink-0"
      >
        <div>
          <p className="text-black font-black text-sm uppercase tracking-wider leading-none">Distribuir Cota</p>
          <p className="text-black/50 text-[0.625rem] font-bold mt-1">Alocar vagas aos promoters</p>
        </div>
        <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center shrink-0">
          <Plus size="1.125rem" className="text-black" />
        </div>
      </button>

      {promoterIds.length === 0 && (
        <div className="flex flex-col items-center py-12 gap-3">
          <Users size="1.75rem" className="text-zinc-800" />
          <p className="text-zinc-700 text-[0.625rem] font-black uppercase tracking-widest">
            Nenhum promoter com cota ainda
          </p>
        </div>
      )}

      {promoterIds.map(pid => {
        const promoter = PROMOTERS_CACHE.find(p => p.id === pid);
        const cotas = lista.cotas.filter(c => c.promoterId === pid);
        const totalSaldo = cotas.reduce((a, c) => a + (c.alocado - c.usado), 0);
        return (
          <div key={pid} className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden shrink-0">
            <div className="flex items-center gap-3 p-4 border-b border-white/5">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-zinc-800">
                {promoter?.foto && (
                  <img loading="lazy" src={promoter.foto} alt={promoter.nome} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm leading-none truncate">{promoter?.nome ?? pid}</p>
                <p className="text-[#FFD300]/70 text-[0.625rem] mt-0.5 font-black">{totalSaldo} vagas disponíveis</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-white font-black text-xl leading-none">{cotas.reduce((a, c) => a + c.usado, 0)}</p>
                <p className="text-zinc-400 text-[0.5rem] font-black uppercase tracking-widest">usadas</p>
              </div>
            </div>
            <div className="p-3 space-y-2">
              {cotas.map(c => {
                const regra = lista.regras.find(r => r.id === c.regraId);
                const cor = regra?.cor || '#71717a';
                const saldo = c.alocado - c.usado;
                const pctC = c.alocado > 0 ? Math.round((c.usado / c.alocado) * 100) : 0;
                return (
                  <div key={c.regraId} className="p-3 bg-zinc-900 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cor }} />
                        <p className="text-zinc-300 text-[0.625rem] font-bold truncate">{regra?.label}</p>
                      </div>
                      <div className="flex items-center gap-2 text-[0.5625rem] font-black uppercase tracking-widest shrink-0">
                        <span className="text-zinc-400">Usado: {c.usado}</span>
                        <span className={saldo > 0 ? 'text-[#FFD300]' : 'text-zinc-700'}>Saldo: {saldo}</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pctC}%`, backgroundColor: cor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Modal distribuir cota */}
      {distModal && (
        <div
          className="absolute inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => {
            setDistModal(false);
            setErro('');
          }}
        >
          <div
            className="w-full bg-[#111111] border border-white/10 rounded-t-[2.5rem] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-zinc-700" />
            </div>
            <div className="px-6 pt-3 pb-4 border-b border-white/5">
              <h2 style={TYPOGRAPHY.screenTitle} className="text-base italic">
                Distribuir Cota
              </h2>
            </div>
            <div className="p-6 space-y-3" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 2rem))' }}>
              <VantaDropdown
                value={selPromoter}
                onChange={setSelPromoter}
                placeholder="Selecione o promoter..."
                options={PROMOTERS_CACHE.map(p => ({ value: p.id, label: p.nome }))}
              />
              <VantaDropdown
                value={selRegra}
                onChange={setSelRegra}
                placeholder="Selecione a categoria..."
                options={lista.regras.map(r => ({ value: r.id, label: `${r.label} (banco: ${r.saldoBanco})` }))}
              />
              <input
                value={qtd}
                onChange={e => setQtd(e.target.value)}
                type="number"
                min="1"
                placeholder="Quantidade de vagas"
                className={inputCls}
              />
              {erro && <p className="text-red-400 text-[0.625rem] font-black uppercase tracking-widest">{erro}</p>}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setDistModal(false);
                    setErro('');
                  }}
                  className="flex-1 py-3.5 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest active:scale-95 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDistribuir}
                  className="flex-1 py-3.5 bg-[#FFD300] text-black rounded-xl text-[0.625rem] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <Check size="0.75rem" /> Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
