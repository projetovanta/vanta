/**
 * PromoterHome — "Sua lista, seus convidados."
 * Mostra cotas com barra de progresso + resultados.
 */

import React, { useState, useEffect } from 'react';
import { UserPlus, Users, Check, Loader2 } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { listasService } from '../../admin/services/listasService';

interface Props {
  adminNome: string;
  currentUserId: string;
  comunidadeId?: string;
  onNavigate: (v: string) => void;
}

interface CotaResumo {
  listaId: string;
  listaNome: string;
  tipo: string;
  total: number;
  usados: number;
}

export const PromoterHome: React.FC<Props> = ({ adminNome, currentUserId, comunidadeId, onNavigate }) => {
  const [cotas, setCotas] = useState<CotaResumo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        await listasService.refresh();
        const minhasListas = listasService.getListasByPromoter(currentUserId);
        const resumo: CotaResumo[] = minhasListas.map(lista => {
          const minhaCota = listasService.getCotasPromoter(lista.id, currentUserId);
          const cota = minhaCota.find(c => c.promoterId === currentUserId);
          return {
            listaId: lista.id,
            listaNome: lista.eventoNome || 'Lista',
            tipo: lista.regras?.[0]?.label || 'VIP',
            total: cota?.alocado ?? 0,
            usados: cota?.usado ?? 0,
          };
        });
        setCotas(resumo);
      } catch {
        setCotas([]);
      }
      setLoading(false);
    };
    load();
  }, [currentUserId]);

  const totalNomes = cotas.reduce((s, c) => s + c.usados, 0);
  const totalCotas = cotas.reduce((s, c) => s + c.total, 0);
  const confirmados = cotas.reduce((s, c) => s + c.usados, 0);

  return (
    <div className="flex-1 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5 max-w-3xl mx-auto w-full">
        {/* Saudação */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#60a5fa] animate-pulse" />
            <p className="text-[#60a5fa]/60 text-[0.5625rem] font-black uppercase tracking-[0.25em]">Promoter</p>
          </div>
          <h1 style={TYPOGRAPHY.screenTitle} className="text-xl leading-none text-white">
            Olá, {adminNome?.split(' ')[0]}
          </h1>
          <p className="text-zinc-500 text-[0.625rem] font-black uppercase tracking-widest mt-1.5">
            Sua lista, seus convidados
          </p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size="1.25rem" className="text-[#60a5fa] animate-spin" />
          </div>
        ) : cotas.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Users size="1.75rem" className="text-zinc-700" />
            <p className="text-zinc-400 text-sm font-bold">Nenhuma cota atribuída</p>
            <p className="text-zinc-600 text-xs">Quando o gerente distribuir cotas pra você, elas aparecem aqui.</p>
          </div>
        ) : (
          <>
            {/* Cotas */}
            <div>
              <p className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-[0.2em] mb-3">Suas Cotas</p>
              <div className="space-y-3">
                {cotas.map((cota, i) => {
                  const pct = cota.total > 0 ? Math.round((cota.usados / cota.total) * 100) : 0;
                  return (
                    <button
                      key={i}
                      onClick={() => onNavigate('LISTAS')}
                      className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl p-4 active:bg-white/5 transition-all text-left"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-bold text-sm">{cota.listaNome}</p>
                        <p className="text-zinc-400 text-xs font-bold">
                          {cota.usados}/{cota.total}
                        </p>
                      </div>
                      {/* Barra de progresso */}
                      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: pct >= 90 ? '#ef4444' : pct >= 60 ? '#f59e0b' : '#60a5fa',
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-zinc-600 text-[0.5625rem] font-bold">{pct}% preenchido</p>
                        <div className="flex items-center gap-1 text-[#60a5fa]">
                          <UserPlus size="0.75rem" />
                          <span className="text-[0.5625rem] font-black uppercase">Adicionar nome</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resultados */}
            <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4">
              <p className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-[0.2em] mb-3">
                Seus Resultados
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Check size="0.875rem" className="text-emerald-400" />
                  <p className="text-white text-sm font-bold">{confirmados} confirmados</p>
                </div>
              </div>
              <p className="text-zinc-500 text-xs mt-2">
                {confirmados > 0 ? 'Seus convidados estão chegando!' : 'Adicione nomes às suas cotas pra começar.'}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
