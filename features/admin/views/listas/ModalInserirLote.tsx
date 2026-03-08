import React, { useState, useMemo } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { TYPOGRAPHY } from '../../../../constants';
import type { ListaEvento } from '../../../../types';
import { listasService } from '../../services/listasService';
import { inputCls, type RoleListaNova } from './listasUtils';

export const ModalInserirLote: React.FC<{
  lista: ListaEvento;
  role: RoleListaNova;
  userId: string;
  userNome: string;
  onClose: () => void;
  onConfirm: (count: number) => void;
}> = ({ lista, role, userId, userNome, onClose, onConfirm }) => {
  const regrasDisponiveis = useMemo(() => {
    if (role === 'gerente') return lista.regras.filter(r => r.saldoBanco > 0);
    return lista.regras.filter(r => listasService.getSaldoDisponivel(lista.id, userId, r.id) > 0);
  }, [lista, role, userId]);

  const [regraId, setRegraId] = useState<string>(regrasDisponiveis[0]?.id ?? '');
  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState('');

  const nomes = texto
    .split('\n')
    .map(n => n.trim())
    .filter(n => n.length > 0);
  const count = nomes.length;

  const handleConfirmar = async () => {
    setErro('');
    if (!regraId) {
      setErro('Selecione uma categoria.');
      return;
    }
    if (count === 0) {
      setErro('Digite ao menos um nome.');
      return;
    }
    if (count > 20) {
      setErro('Máximo de 20 nomes por vez.');
      return;
    }
    const { ok, erros } = await listasService.inserirLote(
      lista.id,
      regraId,
      nomes,
      userId,
      userNome,
      role === 'gerente',
    );
    if (ok === 0 && erros.length > 0) {
      setErro('Sem saldo suficiente para todos os nomes.');
      return;
    }
    onConfirm(ok);
  };

  return (
    <div
      className="absolute inset-0 z-[100] flex flex-col bg-black/80 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="mt-auto w-full bg-[#111111] border-t border-white/10 rounded-t-[2.5rem] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>
        <div className="flex items-center justify-between px-6 pt-3 pb-4 border-b border-white/5">
          <h2 style={TYPOGRAPHY.screenTitle} className="text-base italic">
            Adicionar Nomes
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-900 border border-white/10 active:scale-90 transition-all"
          >
            <X size={14} className="text-zinc-400" />
          </button>
        </div>

        <div className="p-6 space-y-4" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 2rem))' }}>
          {/* Pills de regra */}
          <div>
            <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest mb-2">Categoria</p>
            {regrasDisponiveis.length === 0 ? (
              <p className="text-zinc-400 text-xs">Sem saldo disponível em nenhuma categoria.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {regrasDisponiveis.map(r => {
                  const saldo =
                    role === 'gerente' ? r.saldoBanco : listasService.getSaldoDisponivel(lista.id, userId, r.id);
                  const ativa = regraId === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setRegraId(r.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        ativa
                          ? 'border-transparent text-black'
                          : 'border-white/10 bg-zinc-900 text-zinc-400 active:bg-zinc-800'
                      }`}
                      style={ativa ? { backgroundColor: r.cor ?? '#FFD300' } : undefined}
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: r.cor ?? '#71717a' }} />
                      {r.label}
                      <span className={`text-[9px] font-black ${ativa ? 'opacity-70' : 'text-zinc-400'}`}>
                        ({saldo})
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Textarea */}
          <div>
            <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest mb-2">
              Nomes <span className="text-zinc-700">(um por linha, máx. 20)</span>
            </p>
            <textarea
              value={texto}
              onChange={e => setTexto(e.target.value)}
              placeholder={'Lucas Andrade\nMariana Costa\nFernanda Lima'}
              rows={5}
              className={inputCls + ' resize-none leading-relaxed'}
            />
          </div>

          {erro && (
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle size={12} />
              <p className="text-[10px] font-black uppercase tracking-widest">{erro}</p>
            </div>
          )}

          {/* Botão confirmar */}
          <button
            onClick={handleConfirmar}
            disabled={count === 0 || !regraId}
            className="w-full py-4 bg-[#FFD300] text-black font-black text-sm uppercase tracking-wider rounded-2xl active:scale-[0.97] transition-all disabled:opacity-30 disabled:active:scale-100"
          >
            {count > 0 ? `Confirmar ${count} nome${count > 1 ? 's' : ''}` : 'Confirmar nomes'}
          </button>
        </div>
      </div>
    </div>
  );
};
