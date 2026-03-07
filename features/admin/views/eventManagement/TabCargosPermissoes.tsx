import React, { useState } from 'react';
import { Trash2, Check, Settings2 } from 'lucide-react';
import { TYPOGRAPHY } from '../../../../constants';
import { DefinicaoCargoCustom, PermissaoVanta } from '../../../../types';
import { comunidadesService } from '../../services/comunidadesService';
import { inputCls } from './types';

const PERMISSAO_LABELS: Record<PermissaoVanta, string> = {
  VER_FINANCEIRO: 'Ver Financeiro',
  VENDER_PORTA: 'Vender na Porta',
  VALIDAR_ENTRADA: 'Validar Entrada',
  CHECKIN_LISTA: 'Check-in por Lista',
  VALIDAR_QR: 'Validar QR Code',
  GERIR_LISTAS: 'Gerir Listas',
  GERIR_EQUIPE: 'Gerir Equipe',
  INSERIR_LISTA: 'Inserir na Lista',
  CRIAR_REGRA_LISTA: 'Criar Variações',
  VER_LISTA: 'Ver Lista',
};
const TODAS_PERMISSOES: PermissaoVanta[] = [
  'VER_FINANCEIRO',
  'VENDER_PORTA',
  'VALIDAR_ENTRADA',
  'CHECKIN_LISTA',
  'VALIDAR_QR',
  'GERIR_LISTAS',
  'GERIR_EQUIPE',
  'INSERIR_LISTA',
  'CRIAR_REGRA_LISTA',
];

/** Extrai array de PermissaoVanta de uma DefinicaoCargoCustom (nova estrutura com modulos) */
function cargoToPermissoes(cargo: DefinicaoCargoCustom): PermissaoVanta[] {
  const perms: PermissaoVanta[] = [];
  if (cargo.modulos.listas.ativo) perms.push('INSERIR_LISTA');
  if (cargo.modulos.portaria) {
    perms.push('CHECKIN_LISTA');
    perms.push('VALIDAR_QR');
  }
  if (cargo.modulos.financeiro) perms.push('VER_FINANCEIRO');
  if (cargo.modulos.caixa) perms.push('VENDER_PORTA');
  return perms;
}

interface FuncaoModalProps {
  onClose: () => void;
  onSave: (nome: string, permissoes: PermissaoVanta[]) => void;
}
const FuncaoModal: React.FC<FuncaoModalProps> = ({ onClose, onSave }) => {
  const [nome, setNome] = useState('');
  const [sel, setSel] = useState<Set<PermissaoVanta>>(new Set());
  const [erro, setErro] = useState('');

  const toggle = (p: PermissaoVanta) =>
    setSel(prev => {
      const n = new Set(prev);
      n.has(p) ? n.delete(p) : n.add(p);
      return n;
    });

  const handleSave = () => {
    if (!nome.trim()) {
      setErro('Informe o nome do cargo.');
      return;
    }
    if (sel.size === 0) {
      setErro('Selecione ao menos uma permissão.');
      return;
    }
    onSave(nome.trim(), [...sel]);
  };

  return (
    <div
      className="absolute inset-0 z-[60] flex items-end justify-center bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[#111111] border border-white/10 rounded-t-[2.5rem] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>
        <div className="px-6 pt-3 pb-4 border-b border-white/5">
          <h2 style={TYPOGRAPHY.screenTitle} className="text-base italic">
            Nova Função
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <input
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Ex: Segurança VIP, Financeiro Junior…"
            className={inputCls}
          />
          <div>
            <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-2">Permissões</p>
            <div className="space-y-2">
              {TODAS_PERMISSOES.map(p => (
                <button
                  key={p}
                  onClick={() => toggle(p)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                    sel.has(p)
                      ? 'bg-[#FFD300]/10 border-[#FFD300]/30 text-[#FFD300]'
                      : 'bg-zinc-900/40 border-white/5 text-zinc-400'
                  }`}
                >
                  <span className="text-xs font-bold">{PERMISSAO_LABELS[p]}</span>
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                      sel.has(p) ? 'bg-[#FFD300] border-[#FFD300]' : 'border-zinc-700'
                    }`}
                  >
                    {sel.has(p) && <Check size={10} className="text-black" />}
                  </span>
                </button>
              ))}
            </div>
          </div>
          {erro && <p className="text-red-400 text-[10px] font-black uppercase tracking-widest">{erro}</p>}
          <div className="flex gap-2 pt-1" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            <button
              onClick={onClose}
              className="flex-1 py-3.5 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3.5 bg-[#FFD300] text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Check size={12} /> Criar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TabCargosPermissoes: React.FC<{
  comunidadeId: string;
  toastFn?: (t: 'sucesso' | 'erro', m: string) => void;
}> = ({ comunidadeId, toastFn }) => {
  const comunidade = comunidadesService.getAll().find(c => c.id === comunidadeId);
  const [cargos, setCargos] = useState<DefinicaoCargoCustom[]>(() => comunidade?.cargosCustomizados ?? []);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSave = (nome: string, permissoes: PermissaoVanta[]) => {
    const novo: DefinicaoCargoCustom = {
      id: Date.now().toString(36),
      nome,
      modulos: {
        listas: { ativo: permissoes.includes('INSERIR_LISTA'), cotas: [] },
        portaria: permissoes.includes('CHECKIN_LISTA') || permissoes.includes('VALIDAR_QR'),
        financeiro: permissoes.includes('VER_FINANCEIRO'),
        caixa: permissoes.includes('VENDER_PORTA'),
      },
    };
    if (comunidade) {
      comunidade.cargosCustomizados = [...(comunidade.cargosCustomizados ?? []), novo];
    }
    setCargos(prev => [...prev, novo]);
    setModalOpen(false);
    toastFn?.('sucesso', `Função "${nome}" criada`);
  };

  const handleDelete = (id: string) => {
    if (comunidade) {
      comunidade.cargosCustomizados = (comunidade.cargosCustomizados ?? []).filter(c => c.id !== id);
    }
    setCargos(prev => prev.filter(c => c.id !== id));
    toastFn?.('sucesso', 'Função removida');
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => setModalOpen(true)}
        className="w-full flex items-center justify-between p-5 bg-[#FFD300] rounded-2xl active:scale-[0.97] transition-all"
      >
        <div>
          <p className="text-black font-black text-sm uppercase tracking-wider leading-none">+ Nova Função</p>
          <p className="text-black/50 text-[10px] font-bold mt-1">Crie cargos customizados com permissões</p>
        </div>
        <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center shrink-0">
          <Settings2 size={18} className="text-black" />
        </div>
      </button>

      {cargos.length === 0 && (
        <div className="flex flex-col items-center py-12 gap-3">
          <Settings2 size={28} className="text-zinc-800" />
          <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest text-center">
            Nenhuma função criada ainda
          </p>
          <p className="text-zinc-800 text-[9px] text-center leading-relaxed">
            Crie funções customizadas para sua equipe
          </p>
        </div>
      )}

      {cargos.map(cargo => (
        <div key={cargo.id} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4">
          <div className="flex items-start justify-between mb-3">
            <p className="text-white font-bold text-sm truncate">{cargo.nome}</p>
            <button
              onClick={() => handleDelete(cargo.id)}
              className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 active:scale-90 transition-all ml-2"
            >
              <Trash2 size={13} className="text-red-400" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {cargoToPermissoes(cargo).map(p => (
              <span
                key={p}
                className="px-2.5 py-1 rounded-lg bg-[#FFD300]/10 border border-[#FFD300]/20 text-[#FFD300] text-[8px] font-black uppercase tracking-wider"
              >
                {PERMISSAO_LABELS[p]}
              </span>
            ))}
          </div>
        </div>
      ))}

      {modalOpen && <FuncaoModal onClose={() => setModalOpen(false)} onSave={handleSave} />}
    </div>
  );
};
