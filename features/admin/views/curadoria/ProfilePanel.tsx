import React, { useState } from 'react';
import { ArrowLeft, Edit2, Loader2, Activity } from 'lucide-react';
import { Membro } from '../../../../types';
import { auditService } from '../../services/auditService';
import { formatFollowers, formatDateM, ProfileTab } from './types';

export const ProfilePanel: React.FC<{
  membro: Membro;
  nota: string;
  onSaveNota: (nota: string) => Promise<void>;
  onClose: () => void;
  toastFn?: (tipo: 'sucesso' | 'erro', msg: string) => void;
}> = ({ membro, nota, onSaveNota, onClose, toastFn }) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('RESUMO');
  const [editNota, setEditNota] = useState(false);
  const [notaTemp, setNotaTemp] = useState(nota);
  const [savingNota, setSavingNota] = useState(false);

  const handleSaveNota = async () => {
    setSavingNota(true);
    try {
      await onSaveNota(notaTemp);
      toastFn?.('sucesso', 'Nota salva');
    } catch {
      toastFn?.('erro', 'Erro ao salvar nota');
    }
    setSavingNota(false);
    setEditNota(false);
  };

  const TABS: { id: ProfileTab; label: string }[] = [
    { id: 'RESUMO', label: 'Resumo' },
    { id: 'ATIVIDADES', label: 'Atividades' },
  ];

  return (
    <div className="absolute inset-0 z-50 bg-[#0A0A0A] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
      <div className="shrink-0 border-b border-white/5 px-5 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button aria-label="Voltar"
            onClick={onClose}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all shrink-0"
          >
            <ArrowLeft size={18} className="text-zinc-400" />
          </button>
          <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">Perfil do Membro</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 shrink-0">
            <img loading="lazy" src={membro.foto} alt={membro.nome} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-base leading-none mb-1 truncate">{membro.nome}</p>
            <p className="text-zinc-400 text-[11px] truncate">{membro.email}</p>
            {(membro.cidade || membro.estado) && (
              <p className="text-zinc-700 text-[10px] mt-0.5 truncate">
                {[membro.cidade, membro.estado].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        </div>
        {(membro.tagsCuradoria ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {(membro.tagsCuradoria ?? []).map(tag => (
              <span
                key={tag}
                className="text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#FFD300]/10 border border-[#FFD300]/20 text-[#FFD300]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {(() => {
          const logCuradoria = auditService.getByEntity('membro', membro.id).find(l => l.action === 'MEMBRO_APROVADO');
          if (!logCuradoria) return null;
          const por = logCuradoria.newValue?.curadoria_por as string | undefined;
          const em = logCuradoria.newValue?.curadoria_em as string | undefined;
          if (!por) return null;
          return (
            <p className="text-zinc-700 text-[9px] mt-2 italic truncate">
              Curadoria feita por <span className="text-zinc-400">{por}</span>
              {em ? ` em ${em}` : ''}
            </p>
          );
        })()}
      </div>

      <div className="shrink-0 flex border-b border-white/5 px-5">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-wider transition-all relative ${activeTab === tab.id ? 'text-[#FFD300]' : 'text-zinc-400'}`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[#FFD300] rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-5">
        {activeTab === 'RESUMO' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3">
                <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-1">Gênero</p>
                <p className="text-white text-sm font-bold">
                  {membro.genero === 'MASCULINO' ? 'Masculino' : membro.genero === 'FEMININO' ? 'Feminino' : '—'}
                </p>
              </div>
              <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3">
                <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-1">Cadastro</p>
                <p className="text-white text-sm font-bold truncate">
                  {membro.cadastradoEm ? formatDateM(membro.cadastradoEm) : '—'}
                </p>
              </div>
              {membro.instagram && (
                <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3 col-span-2">
                  <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-1">Instagram</p>
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="text-white text-sm font-bold truncate">@{membro.instagram.replace(/^@/, '')}</p>
                    {membro.seguidoresInstagram != null && (
                      <span className="shrink-0 text-[9px] font-black text-[#FFD300] bg-[#FFD300]/10 border border-[#FFD300]/20 px-1.5 py-0.5 rounded-full">
                        {formatFollowers(membro.seguidoresInstagram)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notas do Admin */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">Notas do Admin</p>
                {!editNota && (
                  <button
                    onClick={() => {
                      setNotaTemp(nota);
                      setEditNota(true);
                    }}
                    className="w-7 h-7 bg-zinc-800 border border-white/10 rounded-lg flex items-center justify-center active:scale-90 transition-all"
                  >
                    <Edit2 size={11} className="text-zinc-400" />
                  </button>
                )}
              </div>
              {!editNota ? (
                nota ? (
                  <p className="text-zinc-300 text-sm leading-relaxed">{nota}</p>
                ) : (
                  <p className="text-zinc-700 text-sm italic">Nenhuma nota adicionada.</p>
                )
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={notaTemp}
                    onChange={e => setNotaTemp(e.target.value)}
                    placeholder="Observações relevantes sobre este membro..."
                    rows={4}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditNota(false)}
                      className="flex-1 py-3 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => void handleSaveNota()}
                      disabled={savingNota}
                      className="flex-1 py-3 bg-[#FFD300] text-black rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-60 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      {savingNota ? (
                        <>
                          <Loader2 size={12} className="animate-spin" /> Salvando
                        </>
                      ) : (
                        'Salvar'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ATIVIDADES' && (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="w-14 h-14 bg-zinc-900 rounded-2xl border border-white/5 flex items-center justify-center">
              <Activity size={24} className="text-zinc-700" />
            </div>
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Histórico em breve</p>
            <p className="text-zinc-700 text-[9px] italic text-center leading-relaxed">
              Log de atividades será exibido
              <br />
              quando integrado ao Supabase.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
