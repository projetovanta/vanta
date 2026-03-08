import React, { useState } from 'react';
import { UserPlus, Loader2, Send, Mail } from 'lucide-react';
import { supabase } from '../../../../services/supabaseClient';

export const ConviteModal: React.FC<{ onClose: () => void; adminNome: string }> = ({ onClose, adminNome }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [erro, setErro] = useState('');

  const handleEnviar = async () => {
    if (!email.trim() || !nome.trim()) return;
    setSending(true);
    setErro('');
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token ?? '';
      const res = await supabase.functions.invoke('send-invite', {
        body: { nome: nome.trim(), email: email.trim(), masterNome: adminNome },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.error || res.data?.error) {
        setErro(res.data?.error ?? res.error?.message ?? 'Erro ao enviar convite.');
      } else {
        setSent(true);
      }
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao enviar convite.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full bg-[#111111] border border-white/10 rounded-t-[2.5rem] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>
        <div className="px-6 pt-4" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 2rem))' }}>
          {!sent ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#FFD300]/10 border border-[#FFD300]/20 rounded-xl flex items-center justify-center shrink-0">
                  <UserPlus size={16} className="text-[#FFD300]" />
                </div>
                <div>
                  <p className="text-white font-bold text-base leading-none">Convidar Membro</p>
                  <p className="text-zinc-400 text-[10px] mt-0.5">Envia link de cadastro por e-mail</p>
                </div>
              </div>
              <div className="space-y-3 mb-5">
                <div>
                  <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-1.5">Nome</p>
                  <input
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    placeholder="Nome completo do convidado"
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
                  />
                </div>
                <div>
                  <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-1.5">E-mail</p>
                  <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') void handleEnviar();
                    }}
                    placeholder="email@exemplo.com"
                    type="email"
                    inputMode="email"
                    autoCapitalize="none"
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
                  />
                </div>
              </div>
              {erro && (
                <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-400 text-xs">{erro}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-4 bg-zinc-900 border border-white/10 text-zinc-400 font-black text-[10px] uppercase tracking-widest rounded-2xl active:scale-95 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => void handleEnviar()}
                  disabled={sending || !nome.trim() || !email.trim()}
                  className="flex-1 py-4 bg-[#FFD300] text-black font-black text-[10px] uppercase tracking-widest rounded-2xl active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Enviando...
                    </>
                  ) : (
                    <>
                      <Send size={14} /> Enviar Convite
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center py-6 gap-4">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
                <Mail size={28} className="text-emerald-400" />
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-lg leading-none mb-2">Convite Enviado!</p>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Um link de acesso foi enviado para
                  <br />
                  <span className="text-white font-bold">{email}</span>
                </p>
                <p className="text-zinc-700 text-[10px] mt-3">{nome} receberá um link para criar a conta VANTA.</p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-4 bg-[#FFD300] text-black font-black text-[10px] uppercase tracking-widest rounded-2xl active:scale-95 transition-all mt-2"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
