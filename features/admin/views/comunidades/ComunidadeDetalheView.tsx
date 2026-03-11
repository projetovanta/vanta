import React, { useState } from 'react';
import { ArrowLeft, MapPin, Edit3, ChevronRight } from 'lucide-react';
import { Comunidade, ContaVanta } from '../../../../types';
import { comunidadesService } from '../../services/comunidadesService';
import { useToast, ToastContainer } from '../../../../components/Toast';
import { EditarModal } from './EditarModal';
import { CentralEventosView } from './CentralEventosView';
import { EquipeTab } from './EquipeTab';
import { LogsTab } from './LogsTab';
import { CaixaTab } from './CaixaTab';
import { RelatorioComunidadeView } from '../relatorios';
import { EventosPrivadosTab } from './EventosPrivadosTab';
import { ComemoracoesTab } from './ComemoracoesTab';
import { addLog, DetalheTab } from './types';

export const ComunidadeDetalheView: React.FC<{
  comunidade: Comunidade;
  adminRole: ContaVanta;
  adminNome: string;
  adminId?: string;
  onBack: () => void;
}> = ({ comunidade: initial, adminRole, adminNome, adminId, onBack }) => {
  const [comunidade, setComunidade] = useState(initial);
  const [tab, setTab] = useState<DetalheTab>('EVENTOS');
  const [editando, setEditando] = useState(false);
  const [verCentral, setVerCentral] = useState(false);
  const { toasts, dismiss, toast } = useToast();

  if (verCentral) {
    return <CentralEventosView comunidade={comunidade} onBack={() => setVerCentral(false)} />;
  }

  const refreshComunidade = () => {
    const fresh = comunidadesService.get(comunidade.id);
    if (fresh) setComunidade({ ...fresh });
  };

  const handleSave = async (updates: Partial<Comunidade>) => {
    try {
      await comunidadesService.atualizar(comunidade.id, updates);
      addLog(comunidade.id, adminNome, 'editou as informações da comunidade');
      refreshComunidade();
      setEditando(false);
      toast('sucesso', 'Comunidade atualizada');
    } catch {
      toast('erro', 'Erro ao salvar comunidade');
    }
  };

  const fotoCapa = comunidade.fotoCapa || comunidade.foto;

  const TABS: { id: DetalheTab; label: string }[] = [
    { id: 'EVENTOS', label: 'Eventos' },
    { id: 'EQUIPE', label: 'Equipe Fixa' },
    { id: 'LOGS', label: 'Logs' },
    { id: 'CAIXA', label: 'Caixa' },
    { id: 'RELATORIO', label: 'Relatório' },
    { id: 'PRIVADOS', label: 'Privados' },
    { id: 'COMEMORACOES', label: 'Aniversários' },
  ];

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      {/* Hero cover */}
      <div className="relative shrink-0 aspect-[16/7] max-h-[15rem]">
        {fotoCapa && <img loading="lazy" src={fotoCapa} alt={comunidade.nome} className="w-full h-full object-cover" />}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, #0A0A0A 0%, rgba(10,10,10,0.2) 55%, transparent 100%)' }}
        />

        <button
          aria-label="Voltar"
          onClick={onBack}
          className="absolute left-6 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
          style={{ top: '2.5rem' }}
        >
          <ArrowLeft size="1.125rem" className="text-white" />
        </button>

        <button
          onClick={() => setEditando(true)}
          className="absolute right-6 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
          style={{ top: '2.5rem' }}
        >
          <Edit3 size="0.9375rem" className="text-white" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <MapPin size="0.5625rem" className="text-[#FFD300]/70" />
            <p className="text-[#FFD300]/70 text-[0.5625rem] font-black uppercase tracking-[0.2em]">
              {comunidade.cidade}
            </p>
          </div>
          <h1 className="text-white font-black text-2xl italic leading-none truncate">{comunidade.nome}</h1>
        </div>
      </div>

      {/* Corpo */}
      <div className="flex-1 overflow-y-auto no-scrollbar max-w-3xl mx-auto w-full">
        <div className="px-6 pt-4 pb-3">
          <p className="text-zinc-400 text-sm leading-relaxed mb-2 line-clamp-3">{comunidade.descricao}</p>
          <p className="text-zinc-700 text-[0.625rem] mb-4 truncate">{comunidade.endereco}</p>

          {/* 4 abas */}
          <div className="flex gap-1 p-1 bg-zinc-900/50 rounded-xl border border-white/5">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-2 rounded-lg text-[0.4375rem] font-black uppercase tracking-wide transition-all ${
                  tab === t.id ? 'bg-[#FFD300] text-black' : 'text-zinc-400 active:text-zinc-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo de cada aba */}
        <div className="px-6 pb-10">
          {tab === 'EVENTOS' && (
            <button
              onClick={() => setVerCentral(true)}
              className="w-full flex items-center justify-between p-5 bg-[#FFD300] rounded-2xl active:scale-[0.97] transition-all"
            >
              <div className="min-w-0">
                <p className="text-black font-black text-sm uppercase tracking-wider leading-none truncate">
                  Central de Eventos
                </p>
                <p className="text-black/50 text-[0.625rem] font-bold mt-1">Criar · Próximos · Encerrados</p>
              </div>
              <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center shrink-0">
                <ChevronRight size="1.125rem" className="text-black" />
              </div>
            </button>
          )}

          {tab === 'EQUIPE' && (
            <EquipeTab
              comunidade={comunidade}
              adminNome={adminNome}
              adminId={adminId}
              onUpdate={refreshComunidade}
              toast={toast}
            />
          )}

          {tab === 'LOGS' && <LogsTab comunidade={comunidade} />}

          {tab === 'CAIXA' && <CaixaTab comunidadeId={comunidade.id} />}

          {tab === 'RELATORIO' && (
            <RelatorioComunidadeView
              comunidadeId={comunidade.id}
              comunidadeNome={comunidade.nome}
              onBack={() => setTab('EVENTOS')}
            />
          )}

          {tab === 'PRIVADOS' && <EventosPrivadosTab comunidadeId={comunidade.id} />}

          {tab === 'COMEMORACOES' && <ComemoracoesTab comunidadeId={comunidade.id} />}
        </div>
      </div>

      {editando && (
        <EditarModal
          comunidade={comunidade}
          adminRole={adminRole}
          onSave={handleSave}
          onClose={() => setEditando(false)}
        />
      )}
    </div>
  );
};
