import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Users, ScanFace, UserPlus } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { Membro } from '../../../types';
import { adminService } from '../services/adminService';
import { auditService } from '../services/auditService';
import { clubeService } from '../services/clubeService';
import { supabase } from '../../../services/supabaseClient';
import { useToast, ToastContainer } from '../../../components/Toast';

import { CuradoriaTab } from './curadoria/types';
import { MembroCuradoriaDetalhe } from './curadoria/MembroCuradoriaDetalhe';
import { ConviteModal } from './curadoria/ConviteModal';
import { ConviteMaisVantaModal } from './curadoria/ConviteMaisVantaModal';
import { ProfilePanel } from './curadoria/ProfilePanel';
import { TabNovosMembros } from './curadoria/TabNovosMembros';
import { TabMembros } from './curadoria/TabMembros';
// ── CuradoriaView ────────────────────────────────────────────────────────────

export const CuradoriaView: React.FC<{
  onBack: () => void;
  adminNome: string;
  adminId?: string;
  comunidadeId?: string;
}> = ({ onBack, adminNome, adminId }) => {
  const { toasts, dismiss, toast } = useToast();
  const [activeTab, setActiveTab] = useState<CuradoriaTab>('NOVOS_MEMBROS');

  // ── Aba Novos Membros
  const [query, setQuery] = useState('');
  const [membros, setMembros] = useState<Membro[]>([]);
  const [loading, setLoading] = useState(true);
  const [detalheId, setDetalheId] = useState<string | null>(null);
  const [selfieUrls, setSelfieUrls] = useState<Record<string, string>>({});
  const [filterDestaqueNovos, setFilterDestaqueNovos] = useState(false);

  const loadMembros = useCallback(async () => {
    setLoading(true);
    const data = await adminService.getMembrosParaCuradoria();
    setMembros(data);
    setLoading(false);
  }, []);

  // Carrega URLs das selfies
  useEffect(() => {
    if (membros.length === 0) return;
    const loadSelfies = async () => {
      const urls: Record<string, string> = {};
      for (const m of membros) {
        if (m.biometriaFoto) {
          const { data } = supabase.storage.from('selfies').getPublicUrl(m.biometriaFoto);
          if (data?.publicUrl) {
            urls[m.id] = data.publicUrl;
            continue;
          }
          urls[m.id] = m.biometriaFoto;
        }
      }
      setSelfieUrls(urls);
    };
    void loadSelfies();
  }, [membros]);

  useEffect(() => {
    void loadMembros();
    const channel = supabase
      .channel('curadoria-profiles')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => {
        void loadMembros();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadMembros]);

  const filteredMembros = useMemo(() => {
    return membros.filter(m => {
      const matchQ =
        !query ||
        m.nome.toLowerCase().includes(query.toLowerCase()) ||
        m.email.toLowerCase().includes(query.toLowerCase());
      const matchD = !filterDestaqueNovos || m.destaque;
      return matchQ && matchD;
    });
  }, [membros, query, filterDestaqueNovos]);

  const destaqueCountNovos = useMemo(() => membros.filter(m => m.destaque).length, [membros]);

  const handleConcluir = async (membroId: string, selectedTagIds: string[]) => {
    try {
      await adminService.concluirCuradoriaComTags(membroId, selectedTagIds, selectedTagIds);

      const now = new Date();
      const dataHora =
        now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
        ' ' +
        now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      auditService.log(adminNome, 'MEMBRO_APROVADO', 'membro', membroId, undefined, {
        acao: 'curadoria_concluida',
        tags: selectedTagIds,
        curadoria_por: adminNome,
        curadoria_em: dataHora,
      });

      setDetalheId(null);
      await loadMembros();
      toast('sucesso', 'Curadoria concluída');
    } catch {
      toast('erro', 'Erro ao concluir curadoria');
    }
  };

  // ── Toggle destaque (optimistic update) ──
  const handleToggleDestaque = useCallback(
    async (membroId: string, valor: boolean) => {
      // Optimistic: atualiza local imediatamente
      setMembros(prev => prev.map(m => (m.id === membroId ? { ...m, destaque: valor } : m)));
      setMembrosM(prev => prev.map(m => (m.id === membroId ? { ...m, destaque: valor } : m)));
      try {
        await adminService.toggleDestaque(membroId, valor);
      } catch {
        // Reverter se falhar
        setMembros(prev => prev.map(m => (m.id === membroId ? { ...m, destaque: !valor } : m)));
        setMembrosM(prev => prev.map(m => (m.id === membroId ? { ...m, destaque: !valor } : m)));
        toast('erro', 'Erro ao salvar destaque');
      }
    },
    [toast],
  );

  // ── Aba Membros (classificados)
  const [queryM, setQueryM] = useState('');
  const [membrosM, setMembrosM] = useState<Membro[]>([]);
  const [loadingM, setLoadingM] = useState(false);
  const [selectedM, setSelectedM] = useState<Membro | null>(null);
  const [filterCidades, setFilterCidades] = useState<Set<string>>(new Set());
  const [showConvite, setShowConvite] = useState(false);
  const [conviteMVMembro, setConviteMVMembro] = useState<Membro | null>(null);
  const [filterDestaqueM, setFilterDestaqueM] = useState(false);

  // ── Sets de membros MV (para botão convidar) ──
  const mvMemberIds = useMemo(() => {
    const set = new Set<string>();
    for (const m of clubeService.getAllMembros()) {
      if (m.ativo) set.add(m.userId);
    }
    return set;
  }, [membrosM]);

  const mvPendingIds = useMemo(() => {
    const set = new Set<string>();
    for (const s of clubeService.getSolicitacoes()) {
      if (s.status === 'PENDENTE' || s.status === 'CONVIDADO') set.add(s.userId);
    }
    return set;
  }, [membrosM]);

  const loadMembrosM = useCallback(async () => {
    setLoadingM(true);
    const data = await adminService.getMembrosClassificados();
    setMembrosM(data);
    setLoadingM(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'MEMBROS') void loadMembrosM();
    const ch = supabase
      .channel('curadoria-membros-profiles')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => {
        if (activeTab === 'MEMBROS') void loadMembrosM();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [activeTab, loadMembrosM]);

  const refreshM = useCallback(async () => {
    const updated = await adminService.getMembrosClassificados();
    setMembrosM(updated);
    setSelectedM(prev => (prev ? (updated.find(m => m.id === prev.id) ?? null) : null));
  }, []);

  const cidadesM = useMemo(() => {
    const set = new Set<string>();
    membrosM.forEach(m => {
      if (m.cidade) set.add(m.cidade);
    });
    return Array.from(set).sort();
  }, [membrosM]);

  const filteredM = useMemo(() => {
    return membrosM.filter(m => {
      const matchQ =
        !queryM ||
        m.nome.toLowerCase().includes(queryM.toLowerCase()) ||
        m.email.toLowerCase().includes(queryM.toLowerCase());
      const matchC = filterCidades.size === 0 || (m.cidade && filterCidades.has(m.cidade));
      const matchD = !filterDestaqueM || m.destaque;
      return matchQ && matchC && matchD;
    });
  }, [membrosM, queryM, filterCidades, filterDestaqueM]);

  const destaqueCountM = useMemo(() => membrosM.filter(m => m.destaque).length, [membrosM]);

  const activeFilterCount = filterCidades.size;

  const membroDetalhe = detalheId ? membros.find(m => m.id === detalheId) : null;

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      {/* lint-layout-ok — tab container, filhos gerenciam scroll */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      {/* Header */}
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-0 shrink-0">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p style={TYPOGRAPHY.sectionKicker} className="mb-1.5">
              Portal Admin
            </p>
            <div className="flex items-center gap-3">
              <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic">
                Curadoria
              </h1>
              {activeTab === 'NOVOS_MEMBROS' && !loading && filteredMembros.length > 0 && (
                <span className="bg-[#FFD300] text-black text-[9px] font-black px-2.5 py-1 rounded-full">
                  {filteredMembros.length}
                </span>
              )}
              {activeTab === 'MEMBROS' && !loadingM && membrosM.length > 0 && (
                <span className="bg-zinc-800 text-zinc-400 text-[9px] font-black px-2.5 py-1 rounded-full">
                  {membrosM.length}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {activeTab === 'MEMBROS' && (
              <button
                onClick={() => setShowConvite(true)}
                className="flex items-center gap-1.5 px-3 h-10 bg-[#FFD300]/10 border border-[#FFD300]/20 rounded-full active:scale-90 transition-all"
              >
                <UserPlus size={14} className="text-[#FFD300]" />
                <span className="text-[#FFD300] text-[10px] font-black uppercase tracking-wider">Convidar</span>
              </button>
            )}
            <button
              onClick={onBack}
              className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
            >
              <ArrowLeft size={18} className="text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar border-b border-white/5 -mx-6 px-6 gap-1">
          {(
            [
              { id: 'NOVOS_MEMBROS', label: 'Novos', icon: ScanFace },
              { id: 'MEMBROS', label: 'Membros', icon: Users },
            ] as const
          ).map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`snap-start flex items-center gap-1.5 px-3 py-3 text-[10px] font-black uppercase tracking-wider transition-all relative shrink-0 whitespace-nowrap ${
                  activeTab === tab.id ? 'text-[#FFD300]' : 'text-zinc-600'
                }`}
              >
                <Icon size={12} />
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFD300] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Aba: Novos Membros ── */}
      {activeTab === 'NOVOS_MEMBROS' && (
        <TabNovosMembros
          query={query}
          onQueryChange={setQuery}
          loading={loading}
          filteredMembros={filteredMembros}
          selfieUrls={selfieUrls}
          onSelectMembro={setDetalheId}
          onToggleDestaque={handleToggleDestaque}
          filterDestaque={filterDestaqueNovos}
          onToggleFilterDestaque={() => setFilterDestaqueNovos(p => !p)}
          destaqueCount={destaqueCountNovos}
        />
      )}

      {/* ── Aba: Membros (classificados) ── */}
      {activeTab === 'MEMBROS' && (
        <TabMembros
          queryM={queryM}
          onQueryMChange={setQueryM}
          loadingM={loadingM}
          filteredM={filteredM}
          cidades={cidadesM}
          filterCidades={filterCidades}
          activeFilterCount={activeFilterCount}
          onSelectMembro={setSelectedM}
          onRemoveCidadeFilter={c =>
            setFilterCidades(prev => {
              const s = new Set(prev);
              s.delete(c);
              return s;
            })
          }
          onClearFilters={() => setFilterCidades(new Set())}
          mvMemberIds={mvMemberIds}
          mvPendingIds={mvPendingIds}
          onConvidarMV={setConviteMVMembro}
          onToggleDestaque={handleToggleDestaque}
          filterDestaque={filterDestaqueM}
          onToggleFilterDestaque={() => setFilterDestaqueM(p => !p)}
          destaqueCount={destaqueCountM}
        />
      )}

      {/* Detalhe Curadoria */}
      {membroDetalhe && (
        <MembroCuradoriaDetalhe
          membro={membroDetalhe}
          onClose={() => setDetalheId(null)}
          onConcluir={tags => handleConcluir(membroDetalhe.id, tags)}
        />
      )}

      {/* Profile Panel (aba Membros) */}
      {selectedM && (
        <ProfilePanel
          membro={selectedM}
          nota={selectedM.notas || ''}
          onSaveNota={async nota => {
            await adminService.setNota(selectedM.id, nota);
            await refreshM();
          }}
          onClose={() => setSelectedM(null)}
          toastFn={toast}
        />
      )}

      {/* Modal Convite */}
      {showConvite && <ConviteModal adminNome={adminNome} onClose={() => setShowConvite(false)} />}

      {/* Modal Convite MAIS VANTA */}
      {conviteMVMembro && adminId && (
        <ConviteMaisVantaModal
          membro={conviteMVMembro}
          adminId={adminId}
          onClose={() => setConviteMVMembro(null)}
          onSuccess={() => void loadMembrosM()}
          toastFn={toast}
        />
      )}
    </div>
  );
};
