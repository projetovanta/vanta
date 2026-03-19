/**
 * CompletarPerfilSocial — Tela pós-login social.
 * Pede data de nascimento + aceitar termos (obrigatórios LGPD).
 * Exibida quando profile.data_nascimento é NULL.
 */

import React, { useState } from 'react';
import { Loader2, Check } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { isValidDate, isAdult, fmtDataNasc } from './auth/authHelpers';
import { legalService } from '../features/admin/services/legalService';

interface Props {
  userId: string;
  userName: string;
  onComplete: () => void;
}

export const CompletarPerfilSocial: React.FC<Props> = ({ userId, userName, onComplete }) => {
  const [dataNasc, setDataNasc] = useState('');
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const dataFormatada = fmtDataNasc(dataNasc);
  const dataValida = isValidDate(dataFormatada);
  const adulto = dataValida && isAdult(dataFormatada);
  const canSubmit = adulto && aceitouTermos && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setErro('');

    try {
      // Converter DD/MM/YYYY pra YYYY-MM-DD
      const parts = dataFormatada.split('/');
      const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

      const tsBR = new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';

      const { error: updErr } = await supabase
        .from('profiles')
        .update({ data_nascimento: isoDate, updated_at: tsBR })
        .eq('id', userId);

      if (updErr) {
        setErro('Erro ao salvar. Tente novamente.');
        setLoading(false);
        return;
      }

      // Registrar consentimento LGPD
      await legalService.registrarConsentimento(userId, 'termos_uso', 1);
      await legalService.registrarConsentimento(userId, 'politica_privacidade', 1);

      onComplete();
    } catch {
      setErro('Erro inesperado. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] px-6">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-serif text-white text-2xl">Bem-vindo, {userName?.split(' ')[0] ?? 'você'}!</h1>
          <p className="text-zinc-400 text-sm">Só precisamos de mais uma informação pra completar seu perfil.</p>
        </div>

        {/* Data de nascimento */}
        <div>
          <p className="text-[0.6875rem] text-white/70 font-black uppercase tracking-widest mb-1.5">
            Data de nascimento
          </p>
          <input
            type="text"
            inputMode="numeric"
            value={dataFormatada}
            onChange={e => setDataNasc(e.target.value)}
            placeholder="DD/MM/AAAA"
            maxLength={10}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/50 placeholder-white/30 transition-colors"
          />
          {dataNasc.length >= 10 && !dataValida && <p className="text-red-400 text-xs mt-1">Data inválida</p>}
          {dataValida && !adulto && <p className="text-red-400 text-xs mt-1">Você precisa ter pelo menos 16 anos</p>}
        </div>

        {/* Termos */}
        <label className="flex items-start gap-3 cursor-pointer">
          <div
            className={`w-5 h-5 shrink-0 mt-0.5 rounded border flex items-center justify-center transition-colors ${
              aceitouTermos ? 'bg-[#FFD300] border-[#FFD300]' : 'border-white/20 bg-transparent'
            }`}
            onClick={() => setAceitouTermos(!aceitouTermos)}
          >
            {aceitouTermos && <Check size="0.75rem" className="text-black" />}
          </div>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Li e aceito os <span className="text-[#FFD300] underline">Termos de Uso</span> e a{' '}
            <span className="text-[#FFD300] underline">Política de Privacidade</span>
          </p>
        </label>

        {/* Erro */}
        {erro && <p className="text-red-400 text-xs text-center">{erro}</p>}

        {/* Botão */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full min-h-[2.75rem] bg-[#FFD300] text-black font-bold text-[0.6875rem] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size="0.875rem" className="animate-spin" /> Salvando...
            </>
          ) : (
            'Continuar'
          )}
        </button>
      </div>
    </div>
  );
};
