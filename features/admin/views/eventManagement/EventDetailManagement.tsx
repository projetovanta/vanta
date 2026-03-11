import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Users,
  BarChart2,
  List,
  Clock,
  TrendingUp,
  Gift,
  Settings2,
  ShieldAlert,
  FileText,
  LayoutGrid,
} from 'lucide-react';
import { TYPOGRAPHY } from '../../../../constants';
import { ContaVanta, ListaEvento } from '../../../../types';
import { listasService } from '../../services/listasService';
import { cortesiasService } from '../../services/cortesiasService';
import { eventosAdminService } from '../../services/eventosAdminService';
import { rbacService } from '../../services/rbacService';
import { SovereigntyGuard } from '../../components/SovereigntyGuard';
import { useToast, ToastContainer } from '../../../../components/Toast';
import { Tab } from './types';
import { TabLotacao } from './TabLotacao';
import { TabEquipePromoter } from './TabEquipePromoter';
import { TabEquipeSocio } from './TabEquipeSocio';
import { TabLista } from './TabLista';
import { TabLogs } from './TabLogs';
import { TabResumoCaixa } from './TabResumoCaixa';
import { TabCortesias } from './TabCortesias';
import { TabCargosPermissoes } from './TabCargosPermissoes';
import { TabRelatorio } from './TabRelatorio';
import { TabMesas } from './TabMesas';

export const EventDetailManagement: React.FC<{
  listaId: string | null;
  eventoId?: string;
  onBack: () => void;
  defaultTab?: Tab;
  isSocio: boolean;
  adminNome: string;
  currentUserId: string;
  currentUserNome: string;
  currentUserRole?: ContaVanta;
}> = ({
  listaId,
  eventoId: eventoIdProp,
  onBack,
  defaultTab = 'LOTACAO',
  isSocio,
  adminNome,
  currentUserId,
  currentUserNome,
  currentUserRole = 'vanta_masteradm',
}) => {
  const [lista, setLista] = useState(() => (listaId ? listasService.getLista(listaId) : null));
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [logTick, setLogTick] = useState(0);
  const [showSovModal, setShowSovModal] = useState(false);
  const [sovTick, setSovTick] = useState(0);
  const { toasts, dismiss, toast } = useToast();
  const refresh = () => {
    if (listaId) setLista({ ...listasService.getLista(listaId)! });
    setLogTick(t => t + 1);
  };

  const checkedIn = lista?.convidados.filter(c => c.checkedIn).length ?? 0;
  const total = lista?.convidados.length ?? 0;

  const eventoAdminId = eventoIdProp ?? (listaId ? cortesiasService.getEventoAdminId(listaId) : null) ?? null;
  const comunidadeId = eventoAdminId ? (eventosAdminService.getEvento(eventoAdminId)?.comunidadeId ?? '') : '';
  const hasCortesias = !!cortesiasService.getCortesiaConfig(eventoAdminId ?? '');
  const eventoAdmin = eventoAdminId ? eventosAdminService.getEvento(eventoAdminId) : null;
  const [mesasAtivo, setMesasAtivo] = useState(() => eventoAdmin?.mesasAtivo ?? false);
  // Indica se o usuário tem acesso soberano à lista (para mostrar cadeado na aba)
  const temAcessoLista = !eventoAdminId || rbacService.temAcessoSoberano(currentUserId, eventoAdminId);

  // Soberania: GE-E (isSocio) vê pendências de acesso do GG-C
  const sovPendentes = isSocio && eventoAdminId ? rbacService.getSolicitacoesPendentes(eventoAdminId) : [];

  // Resolver nomes dos sovPendentes via Supabase
  const [sovMembros, setSovMembros] = useState<Record<string, { nome: string; foto: string }>>({});
  useEffect(() => {
    if (sovPendentes.length === 0) return;
    import('../../../../services/supabaseClient')
      .then(({ supabase }) => {
        supabase
          .from('profiles')
          .select('id, nome, avatar_url')
          .in('id', sovPendentes)
          .then(
            ({ data }) => {
              const map: Record<string, { nome: string; foto: string }> = {};
              (data ?? []).forEach((r: any) => {
                map[r.id] = { nome: r.nome ?? r.id, foto: r.avatar_url ?? '' };
              });
              setSovMembros(map);
            },
            () => {
              /* audit-ok */
            },
          );
      })
      .catch(() => {
        /* audit-ok */
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sovPendentes.join()]);

  const handleAutorizarSov = async (requesterId: string) => {
    if (!eventoAdminId) return;
    await rbacService.autorizarAcesso(eventoAdminId, requesterId);
    setSovTick(t => t + 1);
    if (rbacService.getSolicitacoesPendentes(eventoAdminId).length === 0) setShowSovModal(false);
  };

  type TabDef = { id: Tab; label: string; icon: React.FC<any> };
  const TABS: TabDef[] = isSocio
    ? [
        { id: 'LOTACAO', label: 'Lotação', icon: BarChart2 },
        { id: 'EQUIPE', label: 'Equipe', icon: Users },
        { id: 'LISTA', label: 'Lista', icon: List },
        ...(hasCortesias ? [{ id: 'CORTESIAS' as Tab, label: 'Cortesias', icon: Gift }] : []),
        { id: 'LOGS', label: 'Logs', icon: Clock },
        { id: 'RESUMO', label: 'Caixa', icon: TrendingUp },
        { id: 'CARGOS_PERM', label: 'Funções', icon: Settings2 },
        ...(mesasAtivo ? [{ id: 'MESAS' as Tab, label: 'Mesas', icon: LayoutGrid }] : []),
        { id: 'RELATORIO', label: 'Relatório', icon: FileText },
      ]
    : [
        { id: 'LOTACAO', label: 'Lotação', icon: BarChart2 },
        { id: 'EQUIPE', label: 'Equipe', icon: Users },
        { id: 'LISTA', label: 'Lista', icon: List },
      ];

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-4 shrink-0">
        <div className="flex justify-between items-start mb-1">
          <div className="flex-1 min-w-0 mr-3">
            <p style={TYPOGRAPHY.sectionKicker} className="mb-1">
              Gestão do Evento
            </p>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-lg italic truncate">
              {lista?.eventoNome ?? eventoAdmin?.nome ?? 'Evento'}
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
        <div className="flex items-center gap-3 mb-4 mt-2 flex-wrap">
          <span className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest">
            {lista?.eventoLocal ?? eventoAdmin?.local ?? ''}
          </span>
          <span className="w-1 h-1 rounded-full bg-zinc-700 shrink-0" />
          <span className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest">{total} inscritos</span>
          {checkedIn > 0 && (
            <>
              <span className="w-1 h-1 rounded-full bg-zinc-700 shrink-0" />
              <span className="text-emerald-500 text-[0.5625rem] font-black uppercase tracking-widest">
                {checkedIn} entraram
              </span>
            </>
          )}
          {isSocio && (
            <span className="ml-auto px-2 py-0.5 bg-[#FFD300]/10 border border-[#FFD300]/20 rounded-full text-[#FFD300] text-[0.5rem] font-black uppercase tracking-widest shrink-0">
              Meu Evento
            </span>
          )}
        </div>
        {/* Tabs — horizontal scroll para sócio (5 tabs) */}
        <div className="flex flex-wrap gap-1 p-1 bg-zinc-900/50 rounded-xl border border-white/5">
          {TABS.map(t => {
            const isLocked = t.id === 'LISTA' && !temAcessoLista;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center justify-center gap-1 px-3.5 py-2.5 rounded-lg text-[0.5625rem] font-black uppercase tracking-wide transition-all ${
                  tab === t.id ? 'bg-[#FFD300] text-black' : 'text-zinc-400 active:text-zinc-300'
                }`}
              >
                <t.icon size="0.625rem" /> {t.label}
                {isLocked && ' 🔒'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Banner de Soberania — visível apenas para o GE-E quando há solicitações pendentes */}
      {sovPendentes.length > 0 && (
        <div
          key={sovTick}
          className="mx-4 mb-1 px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-white/10 flex items-center justify-between gap-3 shrink-0"
        >
          <div className="flex items-center gap-2 min-w-0">
            <ShieldAlert size="0.8125rem" className="text-amber-400 shrink-0" />
            <p className="text-xs text-white/55 truncate">
              {sovPendentes.length === 1
                ? 'Há 1 solicitação de acesso da Comunidade.'
                : `Há ${sovPendentes.length} solicitações de acesso da Comunidade.`}
            </p>
          </div>
          <button
            onClick={() => setShowSovModal(true)}
            className="text-[0.625rem] font-bold text-amber-400/80 hover:text-amber-400 whitespace-nowrap shrink-0 active:scale-95 transition-all"
          >
            Revisar
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 max-w-3xl mx-auto w-full">
        {tab === 'LOTACAO' && lista && <TabLotacao lista={lista} />}
        {tab === 'EQUIPE' && lista && (
          <>
            <TabEquipeSocio listaId={listaId ?? ''} lista={lista} onUpdate={refresh} toastFn={toast} />
            {!isSocio && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <TabEquipePromoter
                  lista={lista}
                  onRefresh={refresh}
                  toastFn={toast}
                  eventoId={eventoAdminId ?? undefined}
                  currentUserId={currentUserId}
                />
              </div>
            )}
          </>
        )}
        {tab === 'LISTA' && lista && eventoAdminId ? (
          <SovereigntyGuard
            eventoId={eventoAdminId}
            userId={currentUserId}
            permissao="GERIR_LISTAS"
            currentUserRole={currentUserRole as ContaVanta}
          >
            <TabLista
              lista={lista}
              isSocio={isSocio}
              currentUserId={currentUserId}
              currentUserNome={currentUserNome}
              refresh={refresh}
            />
          </SovereigntyGuard>
        ) : tab === 'LISTA' && lista ? (
          <TabLista
            lista={lista}
            isSocio={isSocio}
            currentUserId={currentUserId}
            currentUserNome={currentUserNome}
            refresh={refresh}
          />
        ) : null}
        {tab === 'CORTESIAS' && lista && listaId && (
          <TabCortesias listaId={listaId} lista={lista} adminNome={adminNome} key={logTick} />
        )}
        {tab === 'LOGS' && <TabLogs listaId={listaId ?? ''} eventoAdminId={eventoAdminId ?? undefined} key={logTick} />}
        {tab === 'RESUMO' && lista && eventoAdminId ? (
          <SovereigntyGuard
            eventoId={eventoAdminId}
            userId={currentUserId}
            permissao="VER_FINANCEIRO"
            currentUserRole={currentUserRole as ContaVanta}
          >
            <TabResumoCaixa lista={lista} toastFn={toast} />
          </SovereigntyGuard>
        ) : tab === 'RESUMO' && lista ? (
          <TabResumoCaixa lista={lista} toastFn={toast} />
        ) : null}
        {tab === 'CARGOS_PERM' && <TabCargosPermissoes comunidadeId={comunidadeId} toastFn={toast} />}
        {tab === 'MESAS' && eventoAdminId && (
          <TabMesas
            eventoId={eventoAdminId}
            mesasAtivo={mesasAtivo}
            plantaMesas={eventoAdmin?.plantaMesas}
            onToggle={setMesasAtivo}
          />
        )}
        {tab === 'RELATORIO' && eventoAdminId ? (
          <SovereigntyGuard
            eventoId={eventoAdminId}
            userId={currentUserId}
            permissao="VER_FINANCEIRO"
            currentUserRole={currentUserRole as ContaVanta}
          >
            <TabRelatorio eventoAdminId={eventoAdminId} />
          </SovereigntyGuard>
        ) : null}
      </div>

      {/* Modal de Revisão de Soberania */}
      {showSovModal && (
        <div
          className="absolute inset-0 z-[60] bg-black/70 flex items-end"
          role="presentation"
          onClick={() => setShowSovModal(false)}
        >
          <div
            className="w-full bg-zinc-900 rounded-t-2xl border border-white/5 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-zinc-700" />
            </div>
            <div className="px-6 pt-3 pb-4 border-b border-white/5 flex items-center gap-2">
              <ShieldAlert size="0.875rem" className="text-amber-400 shrink-0" />
              <h2 style={TYPOGRAPHY.screenTitle} className="text-base italic">
                Solicitações de Acesso
              </h2>
            </div>
            <div className="p-6 space-y-3 max-h-[50vh] overflow-y-auto no-scrollbar">
              <p className="text-[0.625rem] text-zinc-400 font-black uppercase tracking-widest mb-4">
                Gerentes da Comunidade
              </p>
              {rbacService.getSolicitacoesPendentes(eventoAdminId!).map(uid => {
                const membro = sovMembros[uid];
                return (
                  <div
                    key={uid}
                    className="flex items-center gap-3 p-4 bg-zinc-900/60 border border-white/5 rounded-xl"
                  >
                    <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/10 overflow-hidden shrink-0">
                      {membro?.foto ? (
                        <img
                          loading="lazy"
                          src={membro.foto}
                          alt={membro.nome}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs font-bold">
                          {membro?.nome?.[0] ?? '?'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{membro?.nome ?? uid}</p>
                      <p className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest">
                        Produtor · Comunidade
                      </p>
                    </div>
                    <button
                      onClick={() => handleAutorizarSov(uid)}
                      className="px-3 py-1.5 rounded-lg bg-[#FFD300]/10 border border-[#FFD300]/20 text-[#FFD300] text-[0.625rem] font-black uppercase tracking-wider hover:bg-[#FFD300]/20 active:scale-95 transition-all shrink-0"
                    >
                      Autorizar
                    </button>
                  </div>
                );
              })}
            </div>
            <div
              className="p-4 border-t border-white/5"
              style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}
            >
              <button
                onClick={() => setShowSovModal(false)}
                className="w-full py-3 rounded-xl bg-zinc-800 border border-white/5 text-zinc-400 text-sm font-bold active:scale-[0.97] transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
