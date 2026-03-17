import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Check, Globe, Building2, ChevronDown } from 'lucide-react';
import { TYPOGRAPHY } from '../../constants';
import { ContaVantaLegacy } from '../../types';
import { rbacService, CARGO_TO_PORTAL } from './services/rbacService';
import { comunidadesService } from './services/comunidadesService';
import { AdminDashboardView } from './AdminDashboardView';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../services/supabaseClient';
import { adminDeepLink } from '../../hooks/useAppHandlers';

// ── Tipos ────────────────────────────────────────────────────────────────────

interface AdminAccessComunidade {
  id: string;
  nome: string;
  foto: string | null;
  cargo: string;
  direto: boolean;
}

interface AdminAccessData {
  role: string;
  comunidades: AdminAccessComunidade[];
  eventos: { id: string; nome: string; foto: string | null; comunidade_id: string; cargo: string }[];
}

interface GatewayDestino {
  id: string;
  tipo: 'COMUNIDADE' | 'MASTER';
  tenantId: string;
  nome: string;
  foto?: string;
}

interface Props {
  onBack: () => void;
}

// ── Componente Principal ─────────────────────────────────────────────────────

export const AdminGateway: React.FC<Props> = ({ onBack }) => {
  const adminNome = useAuthStore(s => s.profile.nome);
  const currentUserId = useAuthStore(s => s.currentAccount.id);
  const currentUserRole = useAuthStore(s => s.currentAccount.role) || 'vanta_member';
  const addNotification = useAuthStore(s => s.addNotification);
  const [selecionadoId, setSelecionadoId] = useState<string>('');
  const [listaAberta, setListaAberta] = useState(false);
  const [confirmado, _setConfirmado] = useState<GatewayDestino | null>(() => {
    try {
      const saved = sessionStorage.getItem('vanta_admin_destino');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const setConfirmado = (v: GatewayDestino | null) => {
    if (v) sessionStorage.setItem('vanta_admin_destino', JSON.stringify(v));
    else {
      sessionStorage.removeItem('vanta_admin_destino');
      sessionStorage.removeItem('vanta_admin_subview');
    }
    _setConfirmado(v);
  };

  // Detectar desktop para max-w-4xl
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Fase 1: RPC get_admin_access — 1 query retorna tudo pro gate
  // Fase 2: services carregam em background após o gate resolver
  const [accessData, setAccessData] = useState<AdminAccessData | null>(null);
  useEffect(() => {
    supabase.rpc('get_admin_access', { p_user_id: currentUserId }).then(({ data, error }) => {
      if (error) {
        console.error('[AdminGateway] RPC get_admin_access falhou:', error);
        setAccessData({ role: currentUserRole, comunidades: [], eventos: [] });
        return;
      }
      setAccessData(data as unknown as AdminAccessData);
      // Fase 2 — só essencial pro gateway (menu + RBAC)
      rbacService.refresh();
      comunidadesService.refresh();
      // Demais services carregam sob demanda quando a view abre
    });
  }, [currentUserId, currentUserRole]);

  const isMaster = accessData?.role === 'vanta_masteradm' || currentUserRole === 'vanta_masteradm';
  const role = (currentUserRole ?? 'vanta_member') as ContaVantaLegacy;

  // Comunidades acessíveis — direto da RPC, zero cache
  const destinos: GatewayDestino[] = (accessData?.comunidades ?? []).map(com => ({
    id: `com-${com.id}`,
    tipo: 'COMUNIDADE' as const,
    tenantId: com.id,
    nome: com.nome,
    foto: com.foto || undefined,
  }));

  // Pré-selecionar se veio deep link de notificação
  useEffect(() => {
    if (adminDeepLink.tenantId && destinos.length > 0) {
      const match = destinos.find(d => d.tenantId === adminDeepLink.tenantId);
      if (match) {
        setSelecionadoId(match.id);
        setListaAberta(true);
      }
      // Consumir o deep link (one-shot)
      adminDeepLink.tenantId = null;
      adminDeepLink.tenantTipo = null;
    }
  }, [destinos]);

  const destinoSelecionado = destinos.find(d => d.id === selecionadoId) ?? null;

  // Sempre exigir seleção na tela de entrada
  const bypassDireto = false;
  const destinoEfetivo = confirmado;

  // ── Destino confirmado → AdminDashboardView ────────────────────────────────
  if (destinoEfetivo) {
    const isMasterGlobal = destinoEfetivo.tipo === 'MASTER';
    // Resolver adminRole pelo cargo da RPC (zero dependência de cache)
    // IMPORTANTE: masteradm NUNCA é rebaixado — mantém acesso total mesmo entrando via comunidade
    let resolvedRole: ContaVantaLegacy = isMaster ? 'vanta_masteradm' : role;
    if (!isMaster && !isMasterGlobal && destinoEfetivo.tenantId && accessData) {
      const comData = accessData.comunidades.find(c => c.id === destinoEfetivo.tenantId);
      if (comData?.cargo) {
        const cargoKey = comData.cargo as keyof typeof CARGO_TO_PORTAL;
        resolvedRole = CARGO_TO_PORTAL[cargoKey] ?? role;
      }
    }
    return (
      <AdminDashboardView
        onClose={
          bypassDireto
            ? onBack
            : () => {
                setConfirmado(null);
                setSelecionadoId('');
              }
        }
        adminNome={adminNome}
        adminRole={resolvedRole}
        currentUserId={currentUserId}
        addNotification={addNotification}
        initialTenantId={isMasterGlobal ? undefined : destinoEfetivo.tenantId || undefined}
        initialTenantTipo={isMasterGlobal ? undefined : 'COMUNIDADE'}
      />
    );
  }

  // ── Tela de seleção ────────────────────────────────────────────────────────
  const temOpcoes = destinos.length > 0 || isMaster;

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] z-[150] flex items-center justify-center">
      <div className="w-full h-full max-w-4xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-10 pb-6 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FFD300] animate-pulse" />
                <p className="text-[#FFD300]/60 text-[0.5625rem] font-black uppercase tracking-[0.25em]">
                  Painel Administrativo
                </p>
              </div>
              <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic leading-none text-white">
                Bem-vindo, {adminNome}
              </h1>
            </div>
            <button
              aria-label="Voltar"
              onClick={onBack}
              className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all shrink-0"
            >
              <ArrowLeft size="1.125rem" className="text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col gap-5 justify-center max-w-[500px] mx-auto w-full">
          {!accessData ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <div className="w-10 h-10 border-2 border-[#FFD300]/30 border-t-[#FFD300] rounded-full animate-spin" />
              <p className="text-zinc-400 text-xs font-semibold">Carregando comunidades...</p>
            </div>
          ) : !temOpcoes ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
                <Shield size="1.5rem" className="text-zinc-700" />
              </div>
              <div className="text-center">
                <p className="text-zinc-400 text-sm font-semibold">Sem atribuições ativas</p>
                <p className="text-zinc-700 text-[0.625rem] font-black uppercase tracking-widest mt-1">
                  Solicite acesso ao administrador
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Label */}
              <p className="text-zinc-300 text-sm font-semibold text-center">Onde você gostaria de entrar?</p>

              {/* Caixa de seleção (fechada) — clica para abrir lista */}
              <div className="relative">
                <button
                  onClick={() => setListaAberta(prev => !prev)}
                  className="w-full flex items-center justify-between bg-zinc-900/60 border border-white/10 rounded-2xl px-5 py-4 active:bg-zinc-800/60 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {destinoSelecionado?.foto ? (
                      <img
                        src={destinoSelecionado.foto}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <Building2 size="0.875rem" className={destinoSelecionado ? 'text-[#FFD300]' : 'text-zinc-400'} />
                    )}
                    <span
                      className={`text-sm font-semibold truncate ${destinoSelecionado ? 'text-white' : 'text-zinc-400'}`}
                    >
                      {destinoSelecionado ? destinoSelecionado.nome : 'Selecione uma comunidade...'}
                    </span>
                  </div>
                  <ChevronDown
                    size="1rem"
                    className={`text-zinc-400 shrink-0 transition-transform ${listaAberta ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Lista dropdown — estilo CitySelector VANTA */}
                {listaAberta && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-10 bg-zinc-900/40 backdrop-blur-2xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
                    <div className="p-4">
                      <h4 style={TYPOGRAPHY.uiLabel} className="text-[0.5625rem] text-center opacity-40 mb-3">
                        Selecionar Comunidade
                      </h4>
                      <div className="space-y-0.5">
                        {destinos.map(d => (
                          <button
                            key={d.id}
                            onClick={() => {
                              setSelecionadoId(d.id);
                              setListaAberta(false);
                            }}
                            className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl transition-all ${
                              selecionadoId === d.id
                                ? 'bg-[#FFD300]/10 text-[#FFD300]'
                                : 'text-zinc-400 active:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center min-w-0">
                              {d.foto ? (
                                <img
                                  src={d.foto}
                                  alt=""
                                  className="w-5 h-5 rounded-full object-cover mr-2.5 shrink-0"
                                />
                              ) : (
                                <Building2 size="0.75rem" className="mr-2.5 shrink-0" />
                              )}
                              <span className="text-[0.6875rem] font-bold uppercase truncate">{d.nome}</span>
                            </div>
                            {selecionadoId === d.id && <Check size="0.75rem" className="shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Botão Visão Global — exclusivo master */}
              {isMaster && (
                <button
                  onClick={() =>
                    setConfirmado({ id: 'visao-global', tipo: 'MASTER', tenantId: '', nome: 'Visão Global' })
                  }
                  className="w-full flex items-center gap-2.5 bg-[#FFD300]/10 border border-[#FFD300]/20 rounded-xl px-4 py-2.5 active:bg-[#FFD300]/20 transition-all"
                >
                  <Globe size="0.875rem" className="text-[#FFD300] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[#FFD300] text-xs font-bold">Visão Global</p>
                    <p className="text-[#FFD300]/50 text-[0.5625rem] font-black uppercase tracking-widest">
                      Acesso completo à plataforma
                    </p>
                  </div>
                </button>
              )}

              {/* Botão Confirmar — logo abaixo */}
              {destinoSelecionado && (
                <button
                  onClick={() => setConfirmado(destinoSelecionado)}
                  className="w-full py-2.5 rounded-xl bg-[#FFD300] text-black text-[0.625rem] font-black uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                >
                  <Check size="0.8125rem" strokeWidth={3} />
                  Confirmar
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
