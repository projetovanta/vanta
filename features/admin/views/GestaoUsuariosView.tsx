/**
 * GestaoUsuariosView — Buscar, visualizar e gerenciar qualquer usuário do app.
 */
import React, { useState, useEffect } from 'react';
import { Search, Loader2, User, Shield, Ban, Clock, RefreshCw } from 'lucide-react';
import { AdminViewHeader } from '../components/AdminViewHeader';
import { useToast, ToastContainer } from '../../../components/Toast';
import { supabase } from '../../../services/supabaseClient';

interface UserResult {
  id: string;
  nome: string;
  email: string;
  foto: string | null;
  role: string;
  cidade: string | null;
  criado_em: string;
  ultimo_acesso: string | null;
}

export const GestaoUsuariosView: React.FC<{
  onBack: () => void;
}> = ({ onBack }) => {
  const { toasts, dismiss, toast } = useToast();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<UserResult | null>(null);

  const searchUsers = async (q: string) => {
    setLoading(true);
    const { data, error } = await supabase.rpc('search_users', { p_query: q, p_limit: 50, p_offset: 0 });
    if (error) {
      console.error('[gestaoUsuarios] search:', error);
      toast('erro', 'Erro na busca');
    }
    setUsers((data ?? []) as UserResult[]);
    setTotal((data ?? []).length);
    setLoading(false);
  };

  useEffect(() => {
    void searchUsers('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    void searchUsers(query);
  };

  const fmtDate = (iso: string | null) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '—';
    }
  };

  const roleLabel = (role: string) => {
    const map: Record<string, string> = {
      vanta_masteradm: 'Master',
      vanta_gerente: 'Gerente',
      vanta_socio: 'Sócio',
      vanta_promoter: 'Promoter',
      vanta_member: 'Membro',
      guest: 'Visitante',
    };
    return map[role] ?? role;
  };

  const roleColor = (role: string) => {
    if (role === 'vanta_masteradm') return 'text-[#FFD300]';
    if (role === 'vanta_gerente') return 'text-emerald-400';
    if (role === 'vanta_socio') return 'text-purple-400';
    return 'text-zinc-400';
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AdminViewHeader
        title="Usuários"
        kicker={`${total} encontrados`}
        onBack={onBack}
        actions={[{ icon: RefreshCw, label: 'Atualizar', onClick: () => searchUsers(query) }]}
      />

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3 max-w-3xl mx-auto w-full">
        {/* Busca */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size="0.75rem" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              placeholder="Buscar por nome ou email..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="w-full bg-zinc-800/60 border border-white/5 rounded-xl pl-8 pr-3 py-2.5 text-white text-xs"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2.5 bg-[#FFD300] text-black rounded-xl text-xs font-bold active:scale-95 transition-all"
          >
            Buscar
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size="1.25rem" className="text-zinc-400 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <User size="1.5rem" className="text-zinc-800 mx-auto mb-3" />
            <p className="text-zinc-400 text-xs">Nenhum usuário encontrado</p>
          </div>
        ) : (
          users.map(u => (
            <button
              key={u.id}
              onClick={() => setSelected(selected?.id === u.id ? null : u)}
              className={`w-full text-left p-4 rounded-2xl border transition-all active:scale-[0.98] ${
                selected?.id === u.id ? 'bg-zinc-800/80 border-[#FFD300]/20' : 'bg-zinc-900/50 border-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-800 border border-white/10 shrink-0">
                  {u.foto ? (
                    <img src={u.foto} alt="" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size="1rem" className="text-zinc-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate">{u.nome || 'Sem nome'}</p>
                  <p className="text-zinc-500 text-xs truncate">{u.email}</p>
                </div>
                <span className={`text-[0.5rem] font-black uppercase ${roleColor(u.role)}`}>{roleLabel(u.role)}</span>
              </div>

              {selected?.id === u.id && (
                <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-zinc-600 text-[0.5rem] uppercase">Cidade</p>
                      <p className="text-zinc-300">{u.cidade || '—'}</p>
                    </div>
                    <div>
                      <p className="text-zinc-600 text-[0.5rem] uppercase">Cadastro</p>
                      <p className="text-zinc-300">{fmtDate(u.criado_em)}</p>
                    </div>
                    <div>
                      <p className="text-zinc-600 text-[0.5rem] uppercase">Último acesso</p>
                      <p className="text-zinc-300">{fmtDate(u.ultimo_acesso)}</p>
                    </div>
                    <div>
                      <p className="text-zinc-600 text-[0.5rem] uppercase">ID</p>
                      <p className="text-zinc-500 text-[0.5rem] font-mono truncate">{u.id}</p>
                    </div>
                  </div>
                </div>
              )}
            </button>
          ))
        )}
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};
