import React, { useMemo, useState } from 'react';
import { Clock, ChevronDown } from 'lucide-react';
import type { HorarioSemanal, HorarioOverride } from '../types';

const DIAS_CURTO = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;
const DIAS_COMPLETO = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'] as const;

/** Retorna dia da semana atual (0-6) no horário BR */
const diaAtualBR = (): number => {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })).getDay();
};

/** Retorna "HH:MM" no horário BR */
const horaAtualBR = (): string => {
  const now = new Date();
  const br = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  return br.getHours().toString().padStart(2, '0') + ':' + br.getMinutes().toString().padStart(2, '0');
};

/** Retorna "YYYY-MM-DD" no horário BR */
const dataBR = (): string => {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
};

/** Verifica se horário atual está entre abertura e fechamento (suporta virada de meia-noite) */
const dentroDoHorario = (abertura: string, fechamento: string): boolean => {
  const agora = horaAtualBR();
  if (fechamento > abertura) {
    return agora >= abertura && agora < fechamento;
  }
  return agora >= abertura || agora < fechamento;
};

/**
 * Gera resumo compacto dos horários.
 * Ex: "Aberto de Quinta a Domingo, a partir das 19h"
 * Ex: "Aberto todos os dias, das 18h às 02h"
 * Ex: "Aberto Sexta e Sábado, a partir das 22h"
 */
const gerarResumo = (horarios: HorarioSemanal[]): string => {
  const abertos = horarios.filter(h => h.aberto).sort((a, b) => a.dia - b.dia);
  if (abertos.length === 0) return 'Fechado';
  if (abertos.length === 7) {
    const horarioUnico = new Set(abertos.map(h => h.abertura)).size === 1;
    if (horarioUnico) return `Todos os dias, a partir das ${formatHora(abertos[0].abertura)}`;
    return 'Todos os dias';
  }

  // Agrupar dias consecutivos
  const grupos: number[][] = [];
  let grupo: number[] = [abertos[0].dia];
  for (let i = 1; i < abertos.length; i++) {
    if (abertos[i].dia === abertos[i - 1].dia + 1) {
      grupo.push(abertos[i].dia);
    } else {
      grupos.push(grupo);
      grupo = [abertos[i].dia];
    }
  }
  grupos.push(grupo);

  // Formatar dias
  let diasStr: string;
  if (grupos.length === 1 && grupos[0].length >= 2) {
    diasStr = `${DIAS_CURTO[grupos[0][0]]} a ${DIAS_CURTO[grupos[0][grupos[0].length - 1]]}`;
  } else {
    const nomes = abertos.map(h => DIAS_CURTO[h.dia]);
    if (nomes.length === 2) {
      diasStr = `${nomes[0]} e ${nomes[1]}`;
    } else {
      diasStr = nomes.slice(0, -1).join(', ') + ' e ' + nomes[nomes.length - 1];
    }
  }

  // Horário mais cedo
  const horaMaisCedo = abertos.reduce((min, h) => (h.abertura < min ? h.abertura : min), abertos[0].abertura);
  return `${diasStr}, a partir das ${formatHora(horaMaisCedo)}`;
};

const formatHora = (hora: string): string => {
  const [h] = hora.split(':');
  const hNum = parseInt(h);
  return `${hNum}h`;
};

export const HorarioPublicDisplay: React.FC<{
  horarios: HorarioSemanal[];
  overrides?: HorarioOverride[];
}> = ({ horarios, overrides = [] }) => {
  const [modalAberto, setModalAberto] = useState(false);
  const diaHoje = diaAtualBR();
  const dataHoje = dataBR();

  const overrideHoje = useMemo(() => overrides.find(o => o.data === dataHoje), [overrides, dataHoje]);

  const abertoAgora = useMemo(() => {
    if (overrideHoje) {
      if (!overrideHoje.aberto) return false;
      return dentroDoHorario(overrideHoje.abertura ?? '00:00', overrideHoje.fechamento ?? '23:59');
    }
    const hoje = horarios.find(h => h.dia === diaHoje);
    if (!hoje?.aberto) return false;
    return dentroDoHorario(hoje.abertura, hoje.fechamento);
  }, [horarios, overrideHoje, diaHoje]);

  const resumo = useMemo(() => gerarResumo(horarios), [horarios]);

  if (!horarios.length) return null;

  return (
    <div className="px-5 border-t border-white/5">
      <button onClick={() => setModalAberto(p => !p)} className="w-full py-3 text-left">
        <div className="flex items-center gap-2">
          <Clock size={13} className="text-zinc-500 shrink-0" />
          <span className="text-[11px] text-zinc-400">{resumo}</span>
          <span
            className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0 ml-auto border ${
              abertoAgora
                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                : 'bg-red-950 text-red-400 border-red-800'
            }`}
          >
            {abertoAgora ? 'Aberto' : 'Fechado'}
          </span>
          <ChevronDown
            size={12}
            className={`text-zinc-600 shrink-0 transition-transform duration-200 ${modalAberto ? 'rotate-180' : ''}`}
          />
        </div>
        {overrideHoje && !modalAberto && (
          <p className="text-[9px] text-amber-400 mt-1 ml-[21px]">
            {overrideHoje.motivo ? overrideHoje.motivo : 'Horário especial hoje'}
            {overrideHoje.aberto && overrideHoje.abertura && ` · ${overrideHoje.abertura} – ${overrideHoje.fechamento}`}
          </p>
        )}
      </button>

      {/* Cascata inline com horários detalhados */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          modalAberto ? 'max-h-[400px] opacity-100 pb-3' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-0.5 ml-[21px]">
          {[0, 1, 2, 3, 4, 5, 6].map(dia => {
            const h = horarios.find(x => x.dia === dia);
            const isHoje = dia === diaHoje;
            return (
              <div
                key={dia}
                className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg ${isHoje ? 'bg-white/5' : ''}`}
              >
                <span className={`text-[10px] w-14 shrink-0 ${isHoje ? 'text-[#FFD300] font-bold' : 'text-zinc-400'}`}>
                  {DIAS_COMPLETO[dia]}
                </span>
                {h?.aberto ? (
                  <span className={`text-[10px] shrink-0 ${isHoje ? 'text-zinc-300' : 'text-zinc-500'}`}>
                    {h.abertura} – {h.fechamento}
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-700 shrink-0">Fechado</span>
                )}
              </div>
            );
          })}
        </div>
        {overrideHoje && (
          <p className="text-[9px] text-amber-400 mt-2 ml-[21px] px-2.5">
            {overrideHoje.motivo || 'Horário especial hoje'}
            {overrideHoje.aberto && overrideHoje.abertura && ` · ${overrideHoje.abertura} – ${overrideHoje.fechamento}`}
          </p>
        )}
      </div>
    </div>
  );
};
