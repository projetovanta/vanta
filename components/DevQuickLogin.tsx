import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import { useAuthStore } from '../stores/authStore';

// Prefixo VITE_ para o Vite expor — componente só monta em DEV (App.tsx: import.meta.env.DEV)
const SERVICE_ROLE_KEY = import.meta.env.VITE_DEV_ADMIN_KEY as string | undefined; // audit-ok dev-only
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

interface DevUser {
  id: string;
  email: string;
  nome: string;
  foto: string | null;
  role: string; // profiles.role (vanta_guest, vanta_member, vanta_masteradm)
  cargosRbac: string[]; // cargos ativos no RBAC (GERENTE, SOCIO, PROMOTER, etc.)
}

export function DevQuickLogin() {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<DevUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const currentId = useAuthStore(s => s.currentAccount?.id);

  // ── Drag state ──
  const [pos, setPos] = useState({ x: 12, y: window.innerHeight - 92 });
  const dragState = useRef<{
    dragging: boolean;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    moved: boolean;
  }>({
    dragging: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    moved: false,
  });

  const onDragStart = useCallback(
    (clientX: number, clientY: number) => {
      dragState.current = {
        dragging: true,
        startX: clientX,
        startY: clientY,
        origX: pos.x,
        origY: pos.y,
        moved: false,
      };
    },
    [pos],
  );

  const onDragMove = useCallback((clientX: number, clientY: number) => {
    const d = dragState.current;
    if (!d.dragging) return;
    const dx = clientX - d.startX;
    const dy = clientY - d.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) d.moved = true;
    if (!d.moved) return;
    const maxX = window.innerWidth - 48;
    const maxY = window.innerHeight - 48;
    setPos({
      x: Math.max(0, Math.min(maxX, d.origX + dx)),
      y: Math.max(0, Math.min(maxY, d.origY + dy)),
    });
  }, []);

  const onDragEnd = useCallback(() => {
    dragState.current.dragging = false;
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => onDragMove(e.clientX, e.clientY);
    const onMouseUp = () => onDragEnd();
    const onTouchMove = (e: TouchEvent) => {
      if (dragState.current.dragging) {
        e.preventDefault();
        onDragMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => onDragEnd();
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [onDragMove, onDragEnd]);

  // Fechar ao clicar fora
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Buscar usuários quando abre o painel
  useEffect(() => {
    if (!open || users.length > 0) return;
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function fetchUsers() {
    if (!SERVICE_ROLE_KEY) {
      setToast('Service role key não configurada');
      return;
    }
    setLoading(true);
    try {
      // Usa adminClient (service_role) para bypassar RLS da tabela profiles
      const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false, storageKey: 'vanta-dev-admin' },
      });
      // Buscar apenas profiles que existem em auth.users (ignorar imports sem auth)
      const { data: authUsers } = await adminClient.auth.admin.listUsers({ perPage: 200 });
      const authIds = new Set((authUsers?.users ?? []).map(u => u.id));

      const [profilesRes, rbacRes] = await Promise.all([
        adminClient
          .from('profiles')
          .select('id, email, nome, full_name, avatar_url, foto_perfil, role')
          .order('full_name', { ascending: true })
          .limit(200),
        adminClient.from('atribuicoes_rbac').select('user_id, cargo').eq('ativo', true),
      ]);

      if (profilesRes.error) throw profilesRes.error;

      // Mapa user_id → todos os cargos RBAC ativos (sem duplicatas)
      const rbacMap = new Map<string, Set<string>>();
      for (const r of rbacRes.data ?? []) {
        if (!rbacMap.has(r.user_id)) rbacMap.set(r.user_id, new Set());
        rbacMap.get(r.user_id)!.add(r.cargo);
      }

      const mapped: DevUser[] = (profilesRes.data ?? [])
        .filter((p: Record<string, unknown>) => authIds.has(p.id as string))
        .map((p: Record<string, unknown>) => ({
          id: p.id as string,
          email: (p.email as string) ?? '',
          nome: (p.full_name as string) || (p.nome as string) || (p.email as string)?.split('@')[0] || 'Sem nome',
          foto: (p.avatar_url as string) || (p.foto_perfil as string) || null,
          role: (p.role as string) || 'vanta_guest',
          cargosRbac: [...(rbacMap.get(p.id as string) ?? [])],
        }));

      // Sorting: conta atual > master > gerente > socio > promoter > member > guest
      const SORT_RANK: Record<string, number> = {
        vanta_masteradm: 100,
        vanta_member: 10,
        vanta_guest: 0,
      };
      const CARGO_SORT: Record<string, number> = {
        GERENTE: 50,
        SOCIO: 40,
        GER_PORTARIA_LISTA: 30,
        GER_PORTARIA_ANTECIPADO: 30,
        PORTARIA_LISTA: 20,
        PORTARIA_ANTECIPADO: 20,
        CAIXA: 20,
        PROMOTER: 15,
      };
      const userRank = (u: DevUser) => {
        const roleR = SORT_RANK[u.role] ?? 0;
        const cargoR = Math.max(0, ...u.cargosRbac.map(c => CARGO_SORT[c] ?? 0));
        return roleR + cargoR;
      };
      mapped.sort((a, b) => {
        if (a.id === currentId) return -1;
        if (b.id === currentId) return 1;
        return userRank(b) - userRank(a) || a.nome.localeCompare(b.nome);
      });

      setUsers(mapped);
    } catch (err) {
      console.error('[DevQuickLogin] Erro ao buscar usuários:', err);
      setToast('Erro ao buscar usuários');
    } finally {
      setLoading(false);
    }
  }

  async function switchAccount(user: DevUser) {
    if (user.id === currentId) return;
    if (!SERVICE_ROLE_KEY) return;
    setSwitching(user.id);
    try {
      // Gerar token via Admin API (funciona para qualquer user, não precisa de senha)
      const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false, storageKey: 'vanta-dev-admin' },
      });
      const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
        type: 'magiclink',
        email: user.email,
      });
      if (linkError || !linkData?.properties?.hashed_token) throw linkError ?? new Error('Sem token');

      // Sign out atual
      await supabase.auth.signOut();

      // Login com o token gerado
      const { error: verifyError } = await supabase.auth.verifyOtp({
        type: 'magiclink',
        token_hash: linkData.properties.hashed_token,
      });
      if (verifyError) throw verifyError;

      setToast(`Logado como ${user.nome}`);
      setOpen(false);
    } catch (err) {
      console.error('[DevQuickLogin] Erro ao trocar conta:', err);
      setToast('Erro ao trocar conta');
    } finally {
      setSwitching(null);
    }
  }

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const roleBadgeColor: Record<string, string> = {
    vanta_masteradm: 'bg-red-500/20 text-red-400',
    vanta_member: 'bg-blue-500/20 text-blue-400',
    vanta_guest: 'bg-gray-500/20 text-gray-400',
  };

  const roleLabel: Record<string, string> = {
    vanta_masteradm: 'Master',
    vanta_member: 'Membro',
    vanta_guest: 'Guest',
  };

  const cargoBadgeColor: Record<string, string> = {
    GERENTE: 'bg-purple-500/20 text-purple-400',
    SOCIO: 'bg-amber-500/20 text-amber-400',
    PROMOTER: 'bg-green-500/20 text-green-400',
    GER_PORTARIA_LISTA: 'bg-cyan-500/20 text-cyan-400',
    PORTARIA_LISTA: 'bg-cyan-500/20 text-cyan-400',
    GER_PORTARIA_ANTECIPADO: 'bg-teal-500/20 text-teal-400',
    PORTARIA_ANTECIPADO: 'bg-teal-500/20 text-teal-400',
    CAIXA: 'bg-orange-500/20 text-orange-400',
  };

  const cargoLabel: Record<string, string> = {
    GERENTE: 'Gerente',
    SOCIO: 'Sócio',
    PROMOTER: 'Promoter',
    GER_PORTARIA_LISTA: 'Ger.Port.Lista',
    PORTARIA_LISTA: 'Port.Lista',
    GER_PORTARIA_ANTECIPADO: 'Ger.Port.QR',
    PORTARIA_ANTECIPADO: 'Port.QR',
    CAIXA: 'Caixa',
  };

  return (
    <>
      {/* Botão flutuante draggable */}
      <button
        ref={btnRef}
        onMouseDown={e => {
          e.preventDefault();
          onDragStart(e.clientX, e.clientY);
        }}
        onTouchStart={e => onDragStart(e.touches[0].clientX, e.touches[0].clientY)}
        onClick={() => {
          if (!dragState.current.moved) setOpen(o => !o);
        }}
        style={{ left: pos.x, top: pos.y }}
        className="fixed z-[9999] w-10 h-10 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-lg hover:bg-yellow-500/30 transition-colors shadow-lg cursor-grab active:cursor-grabbing select-none touch-none"
        title="Dev Quick Login (arraste para mover)"
      >
        ⚡
      </button>

      {/* Painel */}
      {open && (
        <div
          ref={panelRef}
          style={{
            left: Math.min(pos.x, window.innerWidth - 288),
            top: pos.y > window.innerHeight / 2 ? undefined : pos.y + 48,
            bottom: pos.y > window.innerHeight / 2 ? window.innerHeight - pos.y + 8 : undefined,
          }}
          className="fixed z-[9999] w-72 max-h-[60vh] bg-[#1A1A1A] border border-[#333] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="px-3 py-2 border-b border-[#333] flex items-center justify-between">
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Dev Quick Login</span>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white text-sm">
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center text-gray-500 text-xs py-8">Nenhum usuário encontrado</div>
            ) : (
              users.map(u => {
                const isCurrent = u.id === currentId;
                const isSwitching = switching === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => switchAccount(u)}
                    disabled={isCurrent || !!switching}
                    className={`w-full px-3 py-2.5 flex items-center gap-2.5 text-left transition-colors ${
                      isCurrent
                        ? 'bg-yellow-500/10 border-l-2 border-yellow-400'
                        : 'hover:bg-white/5 border-l-2 border-transparent'
                    } ${switching && !isSwitching ? 'opacity-40' : ''}`}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center shrink-0 overflow-hidden">
                      {u.foto ? (
                        <img loading="lazy" src={u.foto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-gray-400">{u.nome.charAt(0).toUpperCase()}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-white truncate">{u.nome}</span>
                        {isCurrent && <span className="text-[0.625rem] text-yellow-400">●</span>}
                      </div>
                      <div className="text-[0.6875rem] text-gray-500 truncate">{u.email}</div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      <span
                        className={`text-[0.5625rem] px-1.5 py-0.5 rounded-full ${roleBadgeColor[u.role] ?? roleBadgeColor.vanta_guest}`}
                      >
                        {roleLabel[u.role] ?? u.role.replace('vanta_', '')}
                      </span>
                      {u.cargosRbac.map(c => (
                        <span
                          key={c}
                          className={`text-[0.5625rem] px-1.5 py-0.5 rounded-full ${cargoBadgeColor[c] ?? 'bg-gray-500/20 text-gray-400'}`}
                        >
                          {cargoLabel[c] ?? c}
                        </span>
                      ))}
                    </div>

                    {/* Loading spinner */}
                    {isSwitching && (
                      <div className="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{ left: pos.x, top: pos.y + 48 }}
          className="fixed z-[10000] bg-[#1A1A1A] border border-[#333] text-white text-xs px-3 py-2 rounded-lg shadow-lg animate-in fade-in duration-200"
        >
          {toast}
        </div>
      )}
    </>
  );
}
