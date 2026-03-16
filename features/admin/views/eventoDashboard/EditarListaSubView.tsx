/**
 * EditarListaSubView — ativar/editar Lista inline no painel do evento.
 *
 * Renderiza Step3Listas com botão Salvar. Cria lista se não existe.
 * Acessível via badge "Ativar" de Lista ou atalho "Editar Lista".
 */
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Check } from 'lucide-react';
import { TYPOGRAPHY } from '../../../../constants';
import type { VarListaForm } from '../criarEvento/types';
import { Step3Listas } from '../criarEvento/Step3Listas';
import { novaVarLista, buildLabel } from '../criarEvento/utils';
import { eventosAdminService } from '../../services/eventosAdminService';
import { listasService } from '../../services/listasService';
import { useToast, ToastContainer } from '../../../../components/Toast';

interface Props {
  eventoId: string;
  onBack: () => void;
}

export const EditarListaSubView: React.FC<Props> = ({ eventoId, onBack }) => {
  const { toasts, dismiss, toast } = useToast();
  const [listasEnabled, setListasEnabled] = useState(false);
  const [varsLista, setVarsLista] = useState<VarListaForm[]>([novaVarLista(0)]);
  const [saving, setSaving] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState('');

  const ev = eventosAdminService.getEvento(eventoId);

  // Hidratar dados existentes
  useEffect(() => {
    const listas = listasService.getListasByEvento(eventoId);
    if (listas.length > 0) {
      setListasEnabled(true);
      const lista = listas[0];
      if (lista.regras?.length) {
        setVarsLista(
          lista.regras.map(r => ({
            id: String(Math.random()).slice(2, 10),
            tipo: 'ENTRADA' as const,
            cor: r.cor || '#FFD300',
            genero: 'UNISEX' as const,
            validadeTipo: r.horaCorte ? ('HORARIO' as const) : ('NOITE_TODA' as const),
            validadeHora: r.horaCorte || '',
            ababoraAtivo: false,
            ababoraAlvoId: '',
            limite: String(r.tetoGlobal),
            valor: r.valor ? String(r.valor) : '',
          })),
        );
      }
    } else {
      // Sem lista: abrir já com toggle ativado para facilitar ativação
      setListasEnabled(true);
    }
  }, [eventoId]);

  const handleSalvar = async () => {
    setErro('');
    if (!listasEnabled) {
      // Desativar não precisa salvar nada novo
      setSalvo(true);
      return;
    }

    const regrasValidas = varsLista.filter(v => parseInt(v.limite) > 0);
    if (regrasValidas.length === 0) {
      setErro('Defina pelo menos uma variação com limite.');
      return;
    }

    for (const v of regrasValidas) {
      if (v.validadeTipo === 'HORARIO' && !v.validadeHora) {
        setErro('Informe o horário limite para variações com horário.');
        return;
      }
    }

    setSaving(true);

    const existingListas = listasService.getListasByEvento(eventoId);
    if (existingListas.length === 0) {
      // Criar nova lista
      await listasService.criarLista({
        eventoId,
        eventoNome: ev?.nome ?? '',
        eventoData: ev?.dataInicio ?? '',
        eventoDataFim: ev?.dataFim,
        eventoLocal: ev?.local ?? '',
        tetoGlobalTotal: regrasValidas.reduce((s, v) => s + parseInt(v.limite), 0),
        regras: regrasValidas.map(v => ({
          label: buildLabel(v),
          tetoGlobal: parseInt(v.limite),
          cor: v.cor,
          valor: v.tipo !== 'VIP' && v.valor ? parseFloat(v.valor) : undefined,
          horaCorte: v.validadeTipo === 'HORARIO' && v.validadeHora ? v.validadeHora : undefined,
          genero: v.genero === 'MASCULINO' ? ('M' as const) : v.genero === 'FEMININO' ? ('F' as const) : ('U' as const),
          area: v.area || 'PISTA',
        })),
      });
    }
    // Se lista já existe, edição de regras é feita na TabLista

    setSaving(false);
    setSalvo(true);
  };

  if (salvo) {
    return (
      <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center p-10 gap-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <Check size="1.75rem" className="text-emerald-400" />
        </div>
        <p className="text-white font-bold text-lg">{listasEnabled ? 'Lista ativada' : 'Configuração salva'}</p>
        <button
          onClick={onBack}
          className="mt-4 px-8 py-3 bg-[#FFD300] text-black rounded-xl text-[0.625rem] font-black uppercase tracking-widest"
        >
          Voltar ao Painel
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-4 shrink-0">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 mr-3">
            <p style={TYPOGRAPHY.sectionKicker} className="mb-1">
              {ev?.nome ?? 'Evento'}
            </p>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-lg italic">
              Ativar Lista
            </h1>
          </div>
          <button
            aria-label="Voltar"
            onClick={onBack}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all shrink-0 mt-1"
          >
            <ArrowLeft size="1.125rem" className="text-zinc-400" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 max-w-3xl mx-auto w-full">
        <Step3Listas
          listasEnabled={listasEnabled}
          setListasEnabled={setListasEnabled}
          varsLista={varsLista}
          setVarsLista={setVarsLista}
        />
        {erro && <p className="mt-4 text-red-400 text-[0.625rem] font-black uppercase tracking-widest">{erro}</p>}
      </div>
      <div className="px-6 pb-8 safe-bottom pt-3 border-t border-white/5 shrink-0">
        <button
          aria-label="Carregando"
          onClick={handleSalvar}
          disabled={saving}
          className="w-full py-3.5 bg-[#FFD300] text-black rounded-xl text-[0.625rem] font-black uppercase tracking-widest active:scale-95 transition-all font-bold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 size="0.875rem" className="animate-spin" /> : null}
          {listasEnabled ? 'Salvar Lista' : 'Desativar Lista'}
        </button>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};
