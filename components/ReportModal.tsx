import React, { useState } from 'react';
import { AlertTriangle, X, Flag, Ban, Shield } from 'lucide-react';
import { criarDenuncia, bloquearUsuario } from '../services/reportBlockService';

type TipoDenuncia = 'USUARIO' | 'EVENTO' | 'COMUNIDADE' | 'CHAT';
type Motivo = 'OFENSIVO' | 'SPAM' | 'PERFIL_FALSO' | 'ASSEDIO' | 'OUTRO';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipo: TipoDenuncia;
  alvoUserId?: string;
  alvoEventoId?: string;
  alvoComunidadeId?: string;
  alvoNome?: string;
  onSuccess?: (msg: string) => void;
  /** Se true, mostra opção de bloquear (só faz sentido para tipo USUARIO ou CHAT) */
  showBlockOption?: boolean;
}

const MOTIVOS: { key: Motivo; label: string; icon: React.ReactNode }[] = [
  {
    key: 'OFENSIVO',
    label: 'Conteúdo ofensivo ou inadequado',
    icon: <AlertTriangle size="0.875rem" className="text-red-400" />,
  },
  { key: 'SPAM', label: 'Spam ou propaganda', icon: <Flag size="0.875rem" className="text-orange-400" /> },
  { key: 'PERFIL_FALSO', label: 'Perfil falso ou golpe', icon: <Shield size="0.875rem" className="text-yellow-400" /> },
  { key: 'ASSEDIO', label: 'Assédio ou ameaça', icon: <Ban size="0.875rem" className="text-red-500" /> },
  { key: 'OUTRO', label: 'Outro motivo', icon: <Flag size="0.875rem" className="text-zinc-400" /> },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  tipo,
  alvoUserId,
  alvoEventoId,
  alvoComunidadeId,
  alvoNome,
  onSuccess,
  showBlockOption,
}) => {
  const [motivo, setMotivo] = useState<Motivo | null>(null);
  const [descricao, setDescricao] = useState('');
  const [bloquearTambem, setBloquearTambem] = useState(false);
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const canShowBlock = showBlockOption && alvoUserId && (tipo === 'USUARIO' || tipo === 'CHAT');

  const handleSubmit = async () => {
    if (!motivo) return;
    if (motivo === 'OUTRO' && !descricao.trim()) return;

    setSending(true);
    try {
      const res = await criarDenuncia({
        tipo,
        alvoUserId,
        alvoEventoId,
        alvoComunidadeId,
        motivo,
        descricao: motivo === 'OUTRO' ? descricao.trim() : undefined,
      });

      if (canShowBlock && bloquearTambem && alvoUserId) {
        await bloquearUsuario(alvoUserId);
      }

      if (res.success) {
        onSuccess?.(bloquearTambem ? 'Denúncia enviada e usuário bloqueado' : 'Denúncia enviada');
      } else {
        onSuccess?.('Erro ao enviar denúncia');
      }
    } catch {
      onSuccess?.('Erro ao enviar denúncia');
    } finally {
      setSending(false);
      setMotivo(null);
      setDescricao('');
      setBloquearTambem(false);
      onClose();
    }
  };

  const tipoLabel =
    tipo === 'USUARIO' ? 'usuário' : tipo === 'EVENTO' ? 'evento' : tipo === 'COMUNIDADE' ? 'comunidade' : 'conversa';

  return (
    <div className="absolute inset-0 z-[400] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-900 border border-white/10 rounded-3xl p-5 w-full max-w-sm animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flag size="1rem" className="text-red-400" />
            <h3 className="text-white font-bold text-sm">Denunciar {tipoLabel}</h3>
          </div>
          <button
            onClick={onClose}
            className="min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center text-zinc-400 active:opacity-70 transition-opacity -mr-2"
          >
            <X size="1rem" />
          </button>
        </div>

        {alvoNome && (
          <p className="text-zinc-400 text-[0.625rem] mb-3 truncate">
            {tipo === 'USUARIO' || tipo === 'CHAT' ? 'Usuário' : tipo === 'EVENTO' ? 'Evento' : 'Comunidade'}:{' '}
            <span className="text-white font-bold">{alvoNome}</span>
          </p>
        )}

        {/* Motivos */}
        <div className="space-y-2 mb-4">
          {MOTIVOS.map(m => (
            <button
              key={m.key}
              onClick={() => setMotivo(m.key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all active:scale-[0.98] ${
                motivo === m.key
                  ? 'bg-red-500/10 border-red-500/30 text-white'
                  : 'bg-zinc-800/40 border-white/5 text-zinc-300'
              }`}
            >
              {m.icon}
              <span className="text-[0.6875rem] font-semibold">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Campo de texto para OUTRO */}
        {motivo === 'OUTRO' && (
          <textarea
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            placeholder="Descreva o motivo..."
            rows={3}
            maxLength={500}
            className="w-full bg-zinc-800/40 border border-white/5 rounded-xl px-3 py-2 text-zinc-300 text-[0.625rem] placeholder-zinc-600 resize-none focus:outline-none focus:border-red-500/30 mb-4"
          />
        )}

        {/* Bloquear também */}
        {canShowBlock && (
          <label className="flex items-center gap-2.5 mb-4 cursor-pointer">
            <div
              className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                bloquearTambem ? 'bg-red-500 border-red-500' : 'bg-zinc-800 border-white/10'
              }`}
              onClick={() => setBloquearTambem(!bloquearTambem)}
            >
              {bloquearTambem && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-zinc-300 text-[0.625rem] font-semibold">Bloquear este usuário também</span>
          </label>
        )}

        {/* Botões */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-zinc-800 border border-white/5 rounded-xl text-zinc-400 text-[0.625rem] font-bold uppercase tracking-wider active:scale-95 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!motivo || (motivo === 'OUTRO' && !descricao.trim()) || sending}
            className="flex-1 py-2.5 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-[0.625rem] font-bold uppercase tracking-wider active:scale-95 transition-all disabled:opacity-40"
          >
            {sending ? 'Enviando...' : 'Denunciar'}
          </button>
        </div>
      </div>
    </div>
  );
};
