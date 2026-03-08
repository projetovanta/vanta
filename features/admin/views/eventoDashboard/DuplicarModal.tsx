import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import type { EventoAdmin } from '../../../../types';
import { eventosAdminService } from '../../services/eventosAdminService';

export const DuplicarModal: React.FC<{
  evento: EventoAdmin;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ evento, onClose, onSuccess }) => {
  const [dataInicio, setDataInicio] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [copEquipe, setCopEquipe] = useState(false);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState('');

  const handleDuplicar = async () => {
    if (!dataInicio || !horaInicio || !dataFim || !horaFim) {
      setErro('Preencha todas as datas e horários.');
      return;
    }
    const dtInicio = new Date(`${dataInicio}T${horaInicio}:00-03:00`);
    const dtFim = new Date(`${dataFim}T${horaFim}:00-03:00`);
    if (dtFim <= dtInicio) {
      setErro('Data de fim deve ser após o início.');
      return;
    }

    setSaving(true);
    const lotes = evento.lotes.map((l, i) => ({
      ...l,
      id: `lote_dup_${Date.now()}_${i}`,
      vendidos: 0,
      ativo: i === 0,
      variacoes: l.variacoes.map((v, j) => ({
        ...v,
        id: `var_dup_${Date.now()}_${i}_${j}`,
        vendidos: 0,
      })),
    }));

    const novo: Omit<EventoAdmin, 'id' | 'criadoEm' | 'cortesiasEnviadas'> = {
      comunidadeId: evento.comunidadeId,
      foto: evento.foto,
      nome: evento.nome,
      descricao: evento.descricao,
      dataInicio: dtInicio.toISOString().replace('Z', '-03:00'),
      dataFim: dtFim.toISOString().replace('Z', '-03:00'),
      local: evento.local,
      endereco: evento.endereco,
      cidade: evento.cidade,
      coords: evento.coords,
      lotes,
      equipe: copEquipe ? [...evento.equipe] : [],
      comunidade: { ...evento.comunidade },
      publicado: false,
      caixaAtivo: evento.caixaAtivo,
      cortesia: evento.cortesia,
      criadorId: evento.criadorId,
      tipoFluxo: evento.tipoFluxo,
      statusEvento: 'PENDENTE',
      formato: evento.formato,
      estilos: evento.estilos ? [...evento.estilos] : [],
      experiencias: evento.experiencias ? [...evento.experiencias] : [],
      categoria: evento.formato ?? evento.categoria,
      subcategorias: evento.subcategorias ? [...evento.subcategorias] : undefined,
      vanta_fee_percent: evento.vanta_fee_percent,
      vanta_fee_fixed: evento.vanta_fee_fixed,
      gateway_fee_mode: evento.gateway_fee_mode,
      mesasAtivo: false,
    };

    const id = await eventosAdminService.criarEvento(novo);
    setSaving(false);
    if (id) {
      onSuccess();
    } else {
      setErro('Erro ao duplicar evento.');
    }
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-end bg-black/80 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full bg-[#111] border-t border-white/10 rounded-t-3xl p-6 space-y-4"
        style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom, 2.5rem))' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-zinc-400 text-[8px] font-black uppercase tracking-widest">Duplicar</p>
            <p className="text-white font-bold text-base truncate">{evento.nome}</p>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400">
            <X size={14} />
          </button>
        </div>

        {erro && (
          <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{erro}</p>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-zinc-400 text-[8px] font-black uppercase tracking-widest mb-1">Data Início</p>
            <input
              type="date"
              value={dataInicio}
              onChange={e => setDataInicio(e.target.value)}
              className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30"
            />
          </div>
          <div>
            <p className="text-zinc-400 text-[8px] font-black uppercase tracking-widest mb-1">Hora Início</p>
            <input
              type="time"
              value={horaInicio}
              onChange={e => setHoraInicio(e.target.value)}
              className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30"
            />
          </div>
          <div>
            <p className="text-zinc-400 text-[8px] font-black uppercase tracking-widest mb-1">Data Fim</p>
            <input
              type="date"
              value={dataFim}
              onChange={e => setDataFim(e.target.value)}
              className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30"
            />
          </div>
          <div>
            <p className="text-zinc-400 text-[8px] font-black uppercase tracking-widest mb-1">Hora Fim</p>
            <input
              type="time"
              value={horaFim}
              onChange={e => setHoraFim(e.target.value)}
              className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30"
            />
          </div>
        </div>

        <button
          onClick={() => setCopEquipe(!copEquipe)}
          className={`w-full flex items-center gap-3 p-3.5 border rounded-xl transition-all text-left ${copEquipe ? 'border-[#FFD300]/25 bg-[#FFD300]/5' : 'border-white/5 bg-zinc-900/40'}`}
        >
          <div
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${copEquipe ? 'bg-[#FFD300] border-[#FFD300]' : 'border-zinc-600'}`}
          >
            {copEquipe && <Check size={10} className="text-black" />}
          </div>
          <span className={`text-sm font-bold ${copEquipe ? 'text-[#FFD300]' : 'text-white'}`}>Copiar Equipe</span>
        </button>

        <button
          onClick={handleDuplicar}
          disabled={saving}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] text-white active:scale-95 transition-all disabled:opacity-30"
        >
          {saving ? 'Criando...' : 'Criar Evento Duplicado'}
        </button>
      </div>
    </div>
  );
};
