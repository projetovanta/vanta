import React, { useState } from 'react';
import { ArrowLeft, Send, Loader2, CheckCircle, Cake } from 'lucide-react';
import { TYPOGRAPHY } from '../../constants';
import { comemoracaoService, ComemoracaoForm } from '../../services/comemoracaoService';
import { useAuthStore } from '../../stores/authStore';
import { VantaDropdown } from '../../components/VantaDropdown';

const MOTIVO_OPTS = [
  { value: 'ANIVERSARIO', label: 'Aniversário' },
  { value: 'DESPEDIDA', label: 'Despedida' },
  { value: 'OUTRO', label: 'Outro' },
];

interface Props {
  comunidadeId: string;
  comunidadeNome: string;
  eventoId?: string;
  eventoNome?: string;
  onBack: () => void;
}

export const ComemoracaoFormView: React.FC<Props> = ({
  comunidadeId,
  comunidadeNome,
  eventoId,
  eventoNome,
  onBack,
}) => {
  const profile = useAuthStore(s => s.profile);

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const [motivo, setMotivo] = useState('');
  const [motivoOutro, setMotivoOutro] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState(profile?.nome ?? '');
  const [dataAniversario, setDataAniversario] = useState('');
  const [dataComemoracao, setDataComemoracao] = useState('');
  const [celular, setCelular] = useState('');
  const [instagram, setInstagram] = useState('');

  const canSubmit =
    motivo &&
    (motivo !== 'OUTRO' || motivoOutro.trim()) &&
    nomeCompleto.trim() &&
    (motivo !== 'ANIVERSARIO' || dataAniversario) &&
    dataComemoracao &&
    celular.trim() &&
    instagram.trim();

  const handleSubmit = async () => {
    if (!canSubmit || sending) return;
    setSending(true);
    try {
      const form: ComemoracaoForm = {
        comunidade_id: comunidadeId,
        evento_id: eventoId,
        motivo: motivo as 'ANIVERSARIO' | 'DESPEDIDA' | 'OUTRO',
        motivo_outro: motivo === 'OUTRO' ? motivoOutro.trim() : undefined,
        nome_completo: nomeCompleto.trim(),
        data_aniversario: motivo === 'ANIVERSARIO' ? dataAniversario : undefined,
        data_comemoracao: dataComemoracao,
        celular: celular.trim(),
        instagram: instagram.trim(),
      };
      await comemoracaoService.solicitar(form);
      setSent(true);
    } catch {
      alert('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] px-8 gap-5">
        <div className="w-16 h-16 rounded-full bg-[#FFD300]/10 flex items-center justify-center">
          <Cake size={32} className="text-[#FFD300]" />
        </div>
        <h2 style={TYPOGRAPHY.screenTitle} className="text-xl text-white text-center">
          Solicitação enviada!
        </h2>
        <p className="text-zinc-400 text-sm text-center leading-relaxed max-w-xs">
          A equipe do {comunidadeNome} vai avaliar sua solicitação. Você receberá uma notificação com a resposta.
        </p>
        <button
          onClick={onBack}
          className="mt-4 px-8 py-3 bg-[#FFD300] text-black rounded-full text-xs font-black uppercase tracking-widest active:scale-95 transition-all"
        >
          Voltar
        </button>
      </div>
    );
  }

  const inputClass =
    'w-full bg-zinc-900/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#FFD300]/50 transition-colors';
  const labelClass = 'text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5';

  return (
    <div className="absolute inset-0 flex flex-col bg-[#050505] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 pt-[calc(env(safe-area-inset-top)+12px)] pb-3 border-b border-white/5">
        <button
          aria-label="Voltar"
          onClick={onBack}
          className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
        >
          <ArrowLeft size={18} className="text-zinc-400" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 style={TYPOGRAPHY.screenTitle} className="text-base text-white truncate">
            Comemorar aqui
          </h1>
          <p className="text-[10px] text-zinc-400 truncate">{eventoNome ?? comunidadeNome}</p>
        </div>
        <Cake size={20} className="text-[#FFD300] shrink-0" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-5 space-y-5">
        {/* Intro */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4">
          <p className="text-zinc-300 text-sm leading-relaxed">
            Quer comemorar seu aniversário ou despedida com a gente? Preencha o formulário abaixo e nossa equipe vai
            avaliar sua solicitação. Se aprovada, você receberá um link exclusivo de vendas com benefícios especiais!
          </p>
        </div>

        {/* Formulário */}
        <div className="space-y-4">
          <div>
            <p className={labelClass}>Motivo da comemoração *</p>
            <VantaDropdown value={motivo} options={MOTIVO_OPTS} onChange={setMotivo} placeholder="Selecione o motivo" />
          </div>

          {motivo === 'OUTRO' && (
            <div>
              <p className={labelClass}>Descreva o motivo *</p>
              <input
                type="text"
                value={motivoOutro}
                onChange={e => setMotivoOutro(e.target.value)}
                placeholder="Ex: Formatura, noivado, promoção..."
                className={inputClass}
              />
            </div>
          )}

          <div>
            <p className={labelClass}>Nome completo *</p>
            <input
              type="text"
              value={nomeCompleto}
              onChange={e => setNomeCompleto(e.target.value)}
              placeholder="Seu nome e sobrenome"
              className={inputClass}
            />
          </div>

          {motivo === 'ANIVERSARIO' && (
            <div>
              <p className={labelClass}>Data de aniversário *</p>
              <input
                type="date"
                value={dataAniversario}
                onChange={e => setDataAniversario(e.target.value)}
                className={inputClass}
              />
            </div>
          )}

          <div>
            <p className={labelClass}>Data da comemoração *</p>
            <input
              type="date"
              value={dataComemoracao}
              onChange={e => setDataComemoracao(e.target.value)}
              className={inputClass}
            />
            {!eventoId && (
              <p className="text-[9px] text-zinc-400 mt-1">
                Se ainda não tem evento nessa data, vincularemos quando ele for criado.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className={labelClass}>WhatsApp *</p>
              <input
                type="tel"
                value={celular}
                onChange={e => setCelular(e.target.value)}
                placeholder="+55 (21) 99999-9999"
                className={inputClass}
              />
            </div>
            <div>
              <p className={labelClass}>Instagram *</p>
              <input
                type="text"
                value={instagram}
                onChange={e => setInstagram(e.target.value)}
                placeholder="@seuinstagram"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+16px)] border-t border-white/5">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || sending}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
            canSubmit ? 'bg-[#FFD300] text-black' : 'bg-zinc-800 text-zinc-400'
          } disabled:opacity-50`}
        >
          {sending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <Send size={14} />
              Enviar Solicitação
            </>
          )}
        </button>
      </div>
    </div>
  );
};
