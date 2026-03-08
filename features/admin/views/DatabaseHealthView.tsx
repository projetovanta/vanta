/**
 * DatabaseHealthView — Painel Health Check + Broadcast Master
 *
 * Exclusivo para vanta_masteradm.
 * Permite executar filtros dinâmicos sobre profiles no Supabase,
 * selecionar usuários resultantes e enviar broadcast (in-app + email).
 */

import React, { useState, useCallback } from 'react';
import {
  ArrowLeft,
  ActivitySquare,
  Instagram,
  MapPin,
  Image,
  Fingerprint,
  Calendar,
  Phone,
  Clock,
  UserX,
  RefreshCw,
  CheckSquare,
  Square,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Users,
} from 'lucide-react';
import { supabase } from '../../../services/supabaseClient';
import { notificationsService } from '../services/notificationsService';
import { TYPOGRAPHY } from '../../../constants';
import { tsBR } from '../../../utils';

// ── Tipos ──────────────────────────────────────────────────────────────────

interface HealthUser {
  id: string;
  nome: string;
  email: string;
  cidade?: string | null;
  estado?: string | null;
  instagram?: string | null;
  avatar_url?: string | null;
}

type CheckId =
  | 'sem_instagram'
  | 'sem_cidade'
  | 'sem_foto'
  | 'sem_biometria'
  | 'sem_data_nasc'
  | 'sem_telefone'
  | 'curadoria_antiga'
  | 'role_guest';

interface CheckConfig {
  id: CheckId;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  color: string;
}

// ── Definição dos checks ───────────────────────────────────────────────────

const CHECKS: CheckConfig[] = [
  {
    id: 'sem_instagram',
    label: 'Instagram vazio/inválido',
    sublabel: 'Perfis sem @instagram cadastrado',
    icon: Instagram,
    color: '#a855f7',
  },
  {
    id: 'sem_cidade',
    label: 'Cidade não preenchida',
    sublabel: 'Perfis sem localização registrada',
    icon: MapPin,
    color: '#f97316',
  },
  { id: 'sem_foto', label: 'Sem foto de perfil', sublabel: 'Perfis sem avatar ou foto', icon: Image, color: '#3b82f6' },
  {
    id: 'sem_biometria',
    label: 'Selfie biométrica ausente',
    sublabel: 'Biometria facial não capturada',
    icon: Fingerprint,
    color: '#10b981',
  },
  {
    id: 'sem_data_nasc',
    label: 'Data de nascimento vazia',
    sublabel: 'Perfis sem data de nascimento',
    icon: Calendar,
    color: '#ec4899',
  },
  {
    id: 'sem_telefone',
    label: 'Telefone incompleto',
    sublabel: 'Número de telefone não preenchido',
    icon: Phone,
    color: '#eab308',
  },
  {
    id: 'curadoria_antiga',
    label: 'Pendente há mais de 7 dias',
    sublabel: 'Aguardando curadoria por > 7 dias',
    icon: Clock,
    color: '#f43f5e',
  },
  {
    id: 'role_guest',
    label: 'Ainda com role guest',
    sublabel: 'Membros que nunca foram aprovados',
    icon: UserX,
    color: '#6b7280',
  },
];

// ── Funções auxiliares ─────────────────────────────────────────────────────

const BASE_SELECT = 'id, nome, email, cidade, estado, instagram, avatar_url';

async function runCheck(check: CheckConfig): Promise<HealthUser[]> {
  try {
    let q: any = supabase.from('profiles').select(BASE_SELECT).not('email', 'is', null);

    switch (check.id) {
      case 'sem_instagram':
        q = q.or('instagram.is.null,instagram.eq.');
        break;
      case 'sem_cidade':
        q = q.or('cidade.is.null,cidade.eq.');
        break;
      case 'sem_foto':
        q = q.is('avatar_url', null);
        break;
      case 'sem_biometria':
        q = q.is('biometria_url', null);
        break;
      case 'sem_data_nasc':
        q = q.is('data_nascimento', null);
        break;
      case 'sem_telefone':
        q = q.or('telefone_numero.is.null,telefone_numero.eq.');
        break;
      case 'curadoria_antiga': {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 7);
        q = q.eq('curadoria_concluida', false).lt('created_at', cutoff.toISOString());
        break;
      }
      case 'role_guest':
        q = q.eq('role', 'vanta_guest');
        break;
    }

    const { data, error } = await q.limit(200);
    if (error) throw error;
    return (data as HealthUser[]) ?? [];
  } catch {
    return [];
  }
}

async function sendBroadcastEmail(users: HealthUser[], mensagem: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) return;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;

  await Promise.allSettled(
    users.map(u =>
      fetch(`${supabaseUrl}/functions/v1/send-invite`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: u.nome,
          email: u.email,
          mensagem,
          tipo: 'broadcast',
        }),
      }),
    ),
  );
}

async function insertNotificationsSupabase(users: HealthUser[], titulo: string, mensagem: string): Promise<void> {
  try {
    const rows = users.map(u => ({
      user_id: u.id,
      titulo,
      mensagem,
      tipo: 'SISTEMA',
      lida: false,
    }));
    await supabase.from('notifications').insert(rows);
  } catch {
    // fire-and-forget
  }
}

// ── Componente principal ───────────────────────────────────────────────────

interface Props {
  onBack: () => void;
}

export const DatabaseHealthView: React.FC<Props> = ({ onBack }) => {
  const [activeCheckId, setActiveCheckId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<HealthUser[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [resultsOpen, setResultsOpen] = useState(true);

  // Broadcast state
  const [message, setMessage] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [sending, setSending] = useState(false);
  const [sentOk, setSentOk] = useState(false);
  const [sendError, setSendError] = useState('');

  const activeCheck = CHECKS.find(c => c.id === activeCheckId);

  const executeCheck = useCallback(async (check: CheckConfig) => {
    setLoading(true);
    setActiveCheckId(check.id);
    setResults([]);
    setSelected(new Set());
    setSentOk(false);
    setSendError('');
    setResultsOpen(true);

    const users = await runCheck(check);
    setResults(users);
    setLoading(false);
  }, []);

  const toggleUser = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === results.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(results.map(u => u.id)));
    }
  };

  const selectedUsers = results.filter(u => selected.has(u.id));

  const handleSend = async () => {
    if (!message.trim() || selectedUsers.length === 0) return;
    setSending(true);
    setSendError('');

    const titulo = broadcastTitle.trim() || 'Mensagem da VANTA';

    try {
      // 1. In-app: notificação local para o admin ver (representando o broadcast)
      void notificationsService.add({
        titulo: `Broadcast enviado para ${selectedUsers.length} usuário(s)`,
        mensagem: message.trim(),
        tipo: 'SISTEMA',
        lida: false,
        link: '',
        timestamp: tsBR(),
      });

      // 2. In-app: INSERT em notifications no Supabase para cada usuário
      await insertNotificationsSupabase(selectedUsers, titulo, message.trim());

      // 3. Email via Edge Function (fire-and-forget com Promise.allSettled)
      void sendBroadcastEmail(selectedUsers, message.trim());

      setSentOk(true);
      setMessage('');
      setBroadcastTitle('');
      setSelected(new Set());
    } catch {
      setSendError('Erro ao enviar. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  const allSelected = results.length > 0 && selected.size === results.length;

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-4 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <button aria-label="Voltar"
            onClick={onBack}
            className="w-9 h-9 bg-zinc-900 rounded-xl flex items-center justify-center border border-white/8 active:scale-90 transition-all shrink-0"
          >
            <ArrowLeft size={16} className="text-zinc-400" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <ActivitySquare size={12} color="#10b981" />
              <p className="text-[#10b981]/70 text-[8px] font-black uppercase tracking-[0.25em]">
                Master · Diagnóstico
              </p>
            </div>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-lg italic leading-none text-white truncate">
              Health Check
            </h1>
          </div>
        </div>
      </div>

      {/* Conteúdo scrollável */}
      <div className="flex-1 overflow-y-auto no-scrollbar max-w-3xl mx-auto w-full">
        {/* Grid de checks */}
        <div className="p-4 grid grid-cols-2 gap-2.5">
          {CHECKS.map(check => {
            const Icon = check.icon;
            const isActive = activeCheckId === check.id;
            const isLoading = loading && isActive;

            return (
              <button
                key={check.id}
                onClick={() => executeCheck(check)}
                disabled={loading}
                className={`flex flex-col gap-2 p-3.5 rounded-2xl border text-left transition-all active:scale-95 ${
                  isActive ? 'border-white/15 bg-zinc-900/80' : 'border-white/5 bg-zinc-900/30 active:bg-zinc-900/60'
                } ${loading && !isActive ? 'opacity-40' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${check.color}20`, border: `1px solid ${check.color}30` }}
                  >
                    {isLoading ? (
                      <Loader2 size={14} style={{ color: check.color }} className="animate-spin" />
                    ) : (
                      <Icon size={14} style={{ color: check.color }} />
                    )}
                  </div>
                  {isActive && !loading && results.length > 0 && (
                    <span
                      className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: `${check.color}25`, color: check.color }}
                    >
                      {results.length}
                    </span>
                  )}
                  {isActive && !loading && results.length === 0 && (
                    <CheckCircle2 size={12} className="text-emerald-400" />
                  )}
                </div>
                <div>
                  <p className="text-white text-[11px] font-bold leading-tight line-clamp-2">{check.label}</p>
                  <p className="text-zinc-400 text-[9px] mt-0.5 leading-tight line-clamp-1">{check.sublabel}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Resultados */}
        {activeCheck && !loading && (
          <div className="px-4 pb-4">
            <div className="border border-white/8 rounded-2xl overflow-hidden">
              {/* Cabeçalho da lista */}
              <button
                onClick={() => setResultsOpen(p => !p)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-900/60 active:bg-zinc-900 transition-all"
              >
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${activeCheck.color}20` }}
                >
                  <Users size={12} style={{ color: activeCheck.color }} />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-white text-xs font-bold truncate">{activeCheck.label}</p>
                  <p className="text-zinc-400 text-[9px]">
                    {results.length === 0
                      ? 'Nenhum resultado — banco OK ✓'
                      : `${results.length} usuário(s) encontrado(s)`}
                  </p>
                </div>
                {results.length > 0 && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleAll();
                    }}
                    className="shrink-0 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border border-white/10 text-zinc-400 active:bg-white/5"
                  >
                    {allSelected ? 'Desmarcar' : 'Todos'}
                  </button>
                )}
                {resultsOpen ? (
                  <ChevronUp size={14} className="text-zinc-400 shrink-0" />
                ) : (
                  <ChevronDown size={14} className="text-zinc-400 shrink-0" />
                )}
              </button>

              {/* Lista de usuários */}
              {resultsOpen && results.length > 0 && (
                <div className="divide-y divide-white/5">
                  {results.map(user => {
                    const isSelected = selected.has(user.id);
                    return (
                      <button
                        key={user.id}
                        onClick={() => toggleUser(user.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                          isSelected ? 'bg-[#10b981]/5' : 'active:bg-white/3'
                        }`}
                      >
                        {isSelected ? (
                          <CheckSquare size={16} className="text-emerald-400 shrink-0" />
                        ) : (
                          <Square size={16} className="text-zinc-700 shrink-0" />
                        )}

                        {/* Avatar inicial */}
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border border-white/8">
                          <span className="text-zinc-400 text-[10px] font-bold uppercase">
                            {user.nome?.charAt(0) ?? '?'}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-semibold truncate">{user.nome}</p>
                          <p className="text-zinc-400 text-[9px] truncate">{user.email}</p>
                          {user.cidade && (
                            <p className="text-zinc-700 text-[8px] truncate">
                              {user.cidade}
                              {user.estado ? `, ${user.estado}` : ''}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Estado vazio */}
              {resultsOpen && results.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-8 px-4">
                  <CheckCircle2 size={24} className="text-emerald-400" />
                  <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest text-center">
                    Nenhum problema encontrado
                  </p>
                  <p className="text-zinc-700 text-[9px] text-center">Todos os perfis passaram neste filtro</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-10 px-4">
            <Loader2 size={22} className="text-zinc-400 animate-spin" />
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Consultando banco...</p>
          </div>
        )}

        {/* Painel de Broadcast */}
        {selected.size > 0 && (
          <div className="px-4 pb-6">
            <div className="bg-zinc-900/60 border border-white/10 rounded-2xl overflow-hidden">
              {/* Cabeçalho do broadcast */}
              <div className="px-4 py-3 border-b border-white/8 flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#10b981]/15 border border-[#10b981]/25 flex items-center justify-center shrink-0">
                  <Send size={11} className="text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-bold">Broadcast</p>
                  <p className="text-zinc-400 text-[9px]">{selected.size} usuário(s) selecionado(s) · in-app + email</p>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {/* Título da notificação */}
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">
                    Título
                  </label>
                  <input
                    type="text"
                    value={broadcastTitle}
                    onChange={e => setBroadcastTitle(e.target.value)}
                    maxLength={80}
                    placeholder="Ex: Atualização importante"
                    className="w-full bg-zinc-800/60 border border-white/8 rounded-xl px-3 py-2.5 text-white text-xs placeholder-zinc-600 focus:outline-none focus:border-white/20 transition-all"
                  />
                </div>

                {/* Mensagem */}
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">
                    Mensagem
                  </label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder="Digite a mensagem para os membros selecionados..."
                    className="w-full bg-zinc-800/60 border border-white/8 rounded-xl px-3 py-2.5 text-white text-xs placeholder-zinc-600 focus:outline-none focus:border-white/20 transition-all resize-none leading-relaxed"
                  />
                  <p className="text-right text-zinc-700 text-[9px] mt-1">{message.length}/500</p>
                </div>

                {/* Feedback de envio */}
                {sentOk && (
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <p className="text-emerald-400 text-[10px] font-semibold">Broadcast enviado com sucesso!</p>
                  </div>
                )}

                {sendError && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                    <AlertCircle size={13} className="text-red-400 shrink-0" />
                    <p className="text-red-400 text-[10px] font-semibold">{sendError}</p>
                  </div>
                )}

                {/* Botão de envio */}
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || sending || sentOk}
                  className="w-full flex items-center justify-center gap-2 bg-[#10b981] text-black font-black text-xs py-3 rounded-xl active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Enviando...
                    </>
                  ) : sentOk ? (
                    <>
                      <CheckCircle2 size={14} />
                      Enviado
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Enviar para {selected.size} usuário{selected.size !== 1 ? 's' : ''}
                    </>
                  )}
                </button>

                {sentOk && (
                  <button
                    onClick={() => {
                      setSentOk(false);
                      setSelected(new Set());
                    }}
                    className="w-full flex items-center justify-center gap-2 border border-white/10 text-zinc-400 font-bold text-xs py-2.5 rounded-xl active:bg-white/5 transition-all"
                  >
                    <RefreshCw size={12} />
                    Nova seleção
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Espaço inferior */}
        <div className="h-6" />
      </div>
    </div>
  );
};
