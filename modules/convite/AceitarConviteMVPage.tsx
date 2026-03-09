import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Crown, Store, Loader2, CheckCircle, XCircle, LogIn } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { useAuthStore } from '../../stores/authStore';

const AuthModal = lazy(() => import('../../components/AuthModal').then(m => ({ default: m.AuthModal })));

interface ConviteInfo {
  id: string;
  tipo: 'MEMBRO' | 'PARCEIRO';
  tier?: string;
  parceiro_nome?: string;
  status: string;
  expira_em: string;
}

type PageState = 'loading' | 'show' | 'needLogin' | 'accepting' | 'success' | 'error';

export const AceitarConviteMVPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const currentAccount = useAuthStore(s => s.currentAccount);

  const [state, setState] = useState<PageState>('loading');
  const [convite, setConvite] = useState<ConviteInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [resultTipo, setResultTipo] = useState('');
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (!token) {
      setErrorMsg('Link inválido');
      setState('error');
      return;
    }

    let cancelled = false;

    const fetchConvite = async () => {
      const { data, error } = await supabase
        .from('convites_mais_vanta')
        .select('id, tipo, tier, parceiro_nome, status, expira_em')
        .eq('token', token)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        setErrorMsg('Convite não encontrado');
        setState('error');
        return;
      }

      const c = data as ConviteInfo;

      if (c.status !== 'PENDENTE') {
        setErrorMsg(c.status === 'ACEITO' ? 'Este convite já foi aceito' : 'Este convite não está mais disponível');
        setState('error');
        return;
      }

      if (new Date(c.expira_em) < new Date()) {
        setErrorMsg('Este convite expirou');
        setState('error');
        return;
      }

      setConvite(c);

      if (!currentAccount?.id) {
        setState('needLogin');
      } else {
        setState('show');
      }
    };

    void fetchConvite();
    return () => {
      cancelled = true;
    };
  }, [token, currentAccount?.id]);

  const handleAceitar = async () => {
    if (!token) return;
    setState('accepting');
    try {
      const { data, error } = await supabase.rpc('aceitar_convite_mv', { p_token: token });
      if (error) throw error;
      const result = data as { tipo: string; tier?: string };
      setResultTipo(result.tipo);
      setState('success');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao aceitar convite';
      setErrorMsg(msg);
      setState('error');
    }
  };

  const handleLogin = () => {
    setShowAuth(true);
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    // Após login, refaz o check — o useEffect vai re-rodar com currentAccount atualizado
  };

  return (
    <div className="absolute inset-0 bg-[#050505] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Loading */}
        {state === 'loading' && (
          <div className="text-center">
            <Loader2 size={32} className="mx-auto text-[#FFD300] animate-spin mb-4" />
            <p className="text-zinc-400 text-sm">Carregando convite...</p>
          </div>
        )}

        {/* Mostrar convite */}
        {state === 'show' && convite && (
          <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-6 text-center">
            <div
              className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
                convite.tipo === 'MEMBRO' ? 'bg-[#FFD300]/10' : 'bg-purple-500/10'
              }`}
            >
              {convite.tipo === 'MEMBRO' ? (
                <Crown size={28} className="text-[#FFD300]" />
              ) : (
                <Store size={28} className="text-purple-400" />
              )}
            </div>

            <h1 className="text-white font-bold text-lg mb-2">
              {convite.tipo === 'MEMBRO' ? 'Convite MAIS VANTA' : 'Convite de Parceiro'}
            </h1>

            <p className="text-zinc-400 text-sm mb-1">
              {convite.tipo === 'MEMBRO'
                ? `Você foi convidado como membro ${convite.tier ?? 'BRONZE'}`
                : `Você foi convidado como parceiro${convite.parceiro_nome ? ` (${convite.parceiro_nome})` : ''}`}
            </p>

            <p className="text-zinc-400 text-[10px] mb-6">
              Ao aceitar, você terá acesso a benefícios exclusivos do MAIS VANTA.
            </p>

            <button
              onClick={() => void handleAceitar()}
              className="w-full py-4 bg-[#FFD300] text-black font-black text-xs uppercase tracking-widest rounded-2xl active:scale-95 transition-all"
            >
              Aceitar Convite
            </button>
          </div>
        )}

        {/* Precisa fazer login */}
        {state === 'needLogin' && convite && (
          <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-6 text-center">
            <div
              className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
                convite.tipo === 'MEMBRO' ? 'bg-[#FFD300]/10' : 'bg-purple-500/10'
              }`}
            >
              <LogIn size={28} className="text-[#FFD300]" />
            </div>

            <h1 className="text-white font-bold text-lg mb-2">Convite MAIS VANTA</h1>

            <p className="text-zinc-400 text-sm mb-6">Faça login ou crie sua conta para aceitar o convite.</p>

            <button
              onClick={handleLogin}
              className="w-full py-4 bg-[#FFD300] text-black font-black text-xs uppercase tracking-widest rounded-2xl active:scale-95 transition-all"
            >
              Entrar / Criar Conta
            </button>
          </div>
        )}

        {/* Aceitando */}
        {state === 'accepting' && (
          <div className="text-center">
            <Loader2 size={32} className="mx-auto text-[#FFD300] animate-spin mb-4" />
            <p className="text-zinc-400 text-sm">Aceitando convite...</p>
          </div>
        )}

        {/* Sucesso */}
        {state === 'success' && (
          <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle size={28} className="text-green-500" />
            </div>

            <h1 className="text-white font-bold text-lg mb-2">Bem-vindo!</h1>

            <p className="text-zinc-400 text-sm mb-6">
              {resultTipo === 'MEMBRO'
                ? 'Você agora é membro do MAIS VANTA. Explore os deals exclusivos!'
                : 'Você agora é parceiro MAIS VANTA. Gerencie seus deals!'}
            </p>

            <button
              onClick={() => navigate('/')}
              className="w-full py-4 bg-[#FFD300] text-black font-black text-xs uppercase tracking-widest rounded-2xl active:scale-95 transition-all"
            >
              Ir para o App
            </button>
          </div>
        )}

        {/* Erro */}
        {state === 'error' && (
          <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
              <XCircle size={28} className="text-red-400" />
            </div>

            <h1 className="text-white font-bold text-lg mb-2">Ops!</h1>
            <p className="text-zinc-400 text-sm mb-6">{errorMsg}</p>

            <button
              onClick={() => navigate('/')}
              className="w-full py-4 bg-zinc-800 border border-white/10 text-zinc-300 font-black text-xs uppercase tracking-widest rounded-2xl active:scale-95 transition-all"
            >
              Voltar ao App
            </button>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <Suspense fallback={null}>
          <AuthModal isOpen onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} />
        </Suspense>
      )}
    </div>
  );
};
