/**
 * CaixaHome — "Venda ingressos na porta. Simples e rápido."
 * Botões grandes pra vender, zero distração.
 */

import React, { useMemo } from 'react';
import { ShoppingCart, Clock } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { fmtBRL } from '../../../utils';
import { eventosAdminService } from '../../admin/services/eventosAdminService';

interface Props {
  adminNome: string;
  comunidadeId?: string;
  onNavigate: (v: string) => void;
}

export const CaixaHome: React.FC<Props> = ({ adminNome, comunidadeId, onNavigate }) => {
  // Pegar evento ativo (ao vivo ou próximo) da comunidade
  const eventoAtivo = useMemo(() => {
    if (!comunidadeId) return null;
    const eventos = eventosAdminService.getEventosByComunidade(comunidadeId);
    const now = new Date();
    // Evento ao vivo
    const aoVivo = eventos.find(e => e.publicado && new Date(e.dataInicio) <= now && new Date(e.dataFim) >= now);
    if (aoVivo) return aoVivo;
    // Próximo evento
    const futuros = eventos
      .filter(e => e.publicado && new Date(e.dataInicio) > now)
      .sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime());
    return futuros[0] ?? null;
  }, [comunidadeId]);

  // Variações disponíveis pra venda
  const variacoes = useMemo(() => {
    if (!eventoAtivo) return [];
    return eventoAtivo.lotes
      .filter(l => l.ativo)
      .flatMap(l => l.variacoes)
      .filter(v => v.limite - v.vendidos > 0)
      .map(v => ({
        id: v.id,
        label: v.area_custom || v.area || 'Pista',
        genero: v.genero === 'UNISEX' ? '' : v.genero === 'MASCULINO' ? ' (Masc)' : ' (Fem)',
        valor: v.valor,
        restantes: v.limite - v.vendidos,
      }));
  }, [eventoAtivo]);

  return (
    <div className="flex-1 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5 max-w-3xl mx-auto w-full">
        {/* Saudação */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
            <p className="text-[#f59e0b]/60 text-[0.5625rem] font-black uppercase tracking-[0.25em]">Caixa</p>
          </div>
          <p className="text-zinc-500 text-[0.625rem] font-black uppercase tracking-widest">Venda ingressos na porta</p>
        </div>
        {!eventoAtivo ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Clock size="1.75rem" className="text-zinc-700" />
            <p className="text-zinc-400 text-sm font-bold">Nenhum evento ativo</p>
            <p className="text-zinc-600 text-xs">O caixa abre quando tiver evento acontecendo.</p>
          </div>
        ) : (
          <>
            {/* Nome do evento */}
            <div className="text-center">
              <p className="text-white font-bold text-sm">{eventoAtivo.nome}</p>
              <p className="text-zinc-500 text-xs mt-1">{eventoAtivo.local}</p>
            </div>

            {/* Botões de venda — GRANDES */}
            <div>
              <p className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-[0.2em] mb-3">
                Escolha o Ingresso
              </p>
              <div className="grid grid-cols-2 gap-3">
                {variacoes.map(v => (
                  <button
                    key={v.id}
                    onClick={() => onNavigate('CAIXA')}
                    className="bg-zinc-900/60 border border-white/5 rounded-2xl p-5 flex flex-col items-center gap-2 active:bg-[#f59e0b]/10 active:border-[#f59e0b]/30 transition-all min-h-[7.5rem]"
                  >
                    <p className="text-white font-black text-sm text-center">
                      {v.label}
                      {v.genero}
                    </p>
                    <p className="text-[#FFD300] font-black text-xl">{v.valor === 0 ? 'Grátis' : fmtBRL(v.valor)}</p>
                    <p className="text-zinc-500 text-[0.5625rem] font-bold">{v.restantes} restantes</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Ação principal */}
            <button
              onClick={() => onNavigate('CAIXA')}
              className="w-full py-4 bg-[#f59e0b] rounded-2xl text-black font-black text-sm uppercase tracking-wider active:scale-[0.98] transition-all"
            >
              <ShoppingCart size="1rem" className="inline mr-2" />
              Abrir Caixa Completo
            </button>
          </>
        )}
      </div>
    </div>
  );
};
