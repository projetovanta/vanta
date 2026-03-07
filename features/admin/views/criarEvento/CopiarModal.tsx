import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { TYPOGRAPHY } from '../../../../constants';
import { eventosAdminService } from '../../services/eventosAdminService';
import { listasService } from '../../services/listasService';
import type { LoteForm, VarListaForm, EquipeForm, TipoLista, GeneroLista, ValidadeTipo } from './types';
import { labelCls, COR_PALETTE } from './constants';
import { uid } from './utils';

interface Step1Data {
  foto: string;
  nome: string;
  descricao: string;
  formato?: string;
  estilos?: string[];
  experiencias?: string[];
}

interface Props {
  onCopiar: (d: { lotes?: LoteForm[]; varsLista?: VarListaForm[]; equipe?: EquipeForm[]; step1?: Step1Data }) => void;
  onClose: () => void;
}

export const CopiarModal: React.FC<Props> = ({ onCopiar, onClose }) => {
  const eventos = eventosAdminService.getEventos();
  const [sel, setSel] = useState<string | null>(null);
  const [copDados, setCopDados] = useState(false);
  const [copLotes, setCopLotes] = useState(true);
  const [copLista, setCopLista] = useState(true);
  const [copEquipe, setCopEquipe] = useState(false);

  const handleConfirmar = () => {
    const ev = eventos.find(e => e.id === sel);
    if (!ev) return;
    const result: { lotes?: LoteForm[]; varsLista?: VarListaForm[]; equipe?: EquipeForm[]; step1?: Step1Data } = {};
    if (copDados) {
      result.step1 = {
        foto: ev.foto,
        nome: ev.nome,
        descricao: ev.descricao,
        formato: ev.formato || ev.categoria,
        estilos: ev.estilos,
        experiencias: ev.experiencias,
      };
    }
    if (copLotes) {
      result.lotes = ev.lotes.map(l => ({
        id: uid(),
        dataValidade: l.dataValidade?.slice(0, 10) || '',
        horaValidade: '',
        virarPct: l.virarPct != null ? String(l.virarPct) : '',
        aberto: true,
        variacoes: l.variacoes.map(v => ({
          id: uid(),
          area: v.area,
          areaCustom: v.areaCustom || '',
          genero: v.genero,
          valor: v.valor.toString(),
          limite: v.limite.toString(),
          requerComprovante: v.requerComprovante ?? false,
          tipoComprovante: v.tipoComprovante ?? '',
        })),
      }));
    }
    if (copLista) {
      const lista = listasService.getListas().find(l => l.eventoId === ev.id);
      if (lista) {
        result.varsLista = lista.regras.map((r, i) => ({
          id: uid(),
          tipo: 'ENTRADA' as TipoLista,
          cor: r.cor || COR_PALETTE[i % COR_PALETTE.length],
          genero: (r.genero === 'M' ? 'MASCULINO' : r.genero === 'F' ? 'FEMININO' : 'UNISEX') as GeneroLista,
          area: r.area || 'PISTA',
          validadeTipo: (r.horaCorte && r.horaCorte !== '02:00' ? 'HORARIO' : 'NOITE_TODA') as ValidadeTipo,
          validadeHora: r.horaCorte && r.horaCorte !== '02:00' ? r.horaCorte : '',
          ababoraAtivo: false,
          ababoraAlvoId: '',
          limite: r.tetoGlobal.toString(),
          valor: r.valor?.toString() || '',
        }));
      }
    }
    if (copEquipe) {
      result.equipe = ev.equipe.map(m => ({
        id: uid(),
        membroId: m.id,
        nome: m.nome,
        email: '',
        foto: '',
        papel: m.papel,
        liberarLista: m.papel === 'PROMOTER',
        quotas: [],
      }));
    }
    onCopiar(result);
    onClose();
  };

  if (eventos.length === 0) return null;

  return (
    <div
      className="absolute inset-0 z-[60] flex items-end justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[#111111] border border-white/10 rounded-t-[2.5rem] overflow-hidden max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>
        <div className="px-6 pt-3 pb-4 border-b border-white/5 shrink-0">
          <h2 style={TYPOGRAPHY.screenTitle} className="text-lg italic">
            Importar de Evento
          </h2>
          <p className="text-zinc-600 text-[10px] mt-1">Selecione um evento e o que deseja copiar.</p>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-3">
          {eventos.map(ev => (
            <button
              key={ev.id}
              onClick={() => setSel(ev.id)}
              className={`w-full flex items-center gap-3 p-4 border rounded-2xl transition-all text-left ${sel === ev.id ? 'border-[#FFD300]/30 bg-[#FFD300]/5' : 'border-white/5 bg-zinc-900/40'}`}
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-zinc-900">
                {ev.foto && <img loading="lazy" src={ev.foto} alt={ev.nome} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm leading-none mb-1 truncate">{ev.nome}</p>
                <p className="text-zinc-600 text-[10px]">{ev.dataInicio.slice(0, 10)}</p>
              </div>
              {sel === ev.id && <Check size={14} className="text-[#FFD300] shrink-0" />}
            </button>
          ))}
          {sel && (
            <div className="pt-2 space-y-2">
              <p className={labelCls}>O que copiar</p>
              {(
                [
                  { label: 'Dados do Evento', val: copDados, set: setCopDados },
                  { label: 'Lotes de Ingressos', val: copLotes, set: setCopLotes },
                  { label: 'Variações de Lista', val: copLista, set: setCopLista },
                  { label: 'Equipe', val: copEquipe, set: setCopEquipe },
                ] as const
              ).map(opt => (
                <button
                  key={opt.label}
                  onClick={() => (opt.set as any)(!opt.val)}
                  className={`w-full flex items-center gap-3 p-3.5 border rounded-xl transition-all text-left ${opt.val ? 'border-[#FFD300]/25 bg-[#FFD300]/5' : 'border-white/5 bg-zinc-900/40'}`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${opt.val ? 'bg-[#FFD300] border-[#FFD300]' : 'border-zinc-600'}`}
                  >
                    {opt.val && <Check size={10} className="text-black" />}
                  </div>
                  <span className={`text-sm font-bold ${opt.val ? 'text-[#FFD300]' : 'text-white'}`}>{opt.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div
          className="px-5 pt-3 border-t border-white/5 shrink-0"
          style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 2rem))' }}
        >
          <button
            onClick={handleConfirmar}
            disabled={!sel}
            className="w-full py-4 bg-[#FFD300] text-black font-bold text-[10px] uppercase tracking-[0.3em] rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98] transition-all"
          >
            <Copy size={13} /> Importar Selecionado
          </button>
        </div>
      </div>
    </div>
  );
};
