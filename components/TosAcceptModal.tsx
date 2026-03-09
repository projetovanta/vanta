import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { TYPOGRAPHY } from '../constants';
import { supabase } from '../services/supabaseClient';

const TOS_VERSION = '1.0';

interface TosAcceptModalProps {
  userId: string;
  userName: string;
  onAccepted: () => void;
  onBack: () => void;
}

export const TosAcceptModal: React.FC<TosAcceptModalProps> = ({ userId, userName, onAccepted, onBack }) => {
  const [aceito, setAceito] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const handleAceitar = async () => {
    if (!aceito) return;
    setSalvando(true);
    try {
      const now = new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';
      const { error } = await supabase
        .from('profiles')
        .update({
          tos_accepted_at: now,
          tos_version: TOS_VERSION,
          tos_ip: 'client', // IP real seria capturado server-side
        })
        .eq('id', userId);
      if (error) {
        console.error('[TosAcceptModal] aceitar TOS:', error);
        setSalvando(false);
        return;
      }

      onAccepted();
    } catch {
      setSalvando(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-[#111] border border-white/10 rounded-2xl max-w-md w-full max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/5 text-center">
          <div className="w-14 h-14 bg-[#FFD300]/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Shield size={24} className="text-[#FFD300]" />
          </div>
          <h2 style={TYPOGRAPHY.screenTitle} className="text-lg italic mb-1">
            Termos de Serviço
          </h2>
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">
            Aceite obrigatório para criar eventos
          </p>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4 text-zinc-400 text-xs leading-relaxed">
          <p>Ao criar eventos na plataforma VANTA, você ({userName}) concorda com os seguintes termos:</p>
          <ul className="list-disc pl-4 space-y-2">
            <li>Responsabilidade total sobre o evento criado, incluindo segurança, alvarás e licenças necessárias.</li>
            <li>
              Aceite da taxa VANTA conforme configurada pela sua comunidade, que será cobrada de cada ingresso vendido.
            </li>
            <li>
              Obrigação de reembolso integral para compras canceladas dentro do prazo legal (CDC Art. 49 — 7 dias
              corridos).
            </li>
            <li>
              Compromisso de não utilizar a plataforma para atividades ilegais, discriminatórias ou que violem direitos
              de terceiros.
            </li>
            <li>Aceite de que a VANTA pode suspender eventos que violem estes termos, após notificação.</li>
            <li>
              Dados financeiros são transparentes e acessíveis pela hierarquia administrativa (Sócio → Gerente →
              Master).
            </li>
          </ul>
          <p className="text-zinc-400 text-[9px]">
            Versão {TOS_VERSION} — Estes termos podem ser atualizados. Você será notificado de mudanças significativas.
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={aceito}
              onChange={e => setAceito(e.target.checked)}
              className="mt-0.5 accent-[#FFD300]"
            />
            <span className="text-zinc-300 text-[10px] font-bold">Li e aceito os Termos de Serviço da VANTA</span>
          </label>

          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 py-3 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
            >
              Voltar
            </button>
            <button
              onClick={handleAceitar}
              disabled={!aceito || salvando}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all ${
                aceito ? 'bg-[#FFD300] text-black' : 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
              }`}
            >
              {salvando ? 'Salvando...' : 'Aceitar e Continuar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Verifica se o usuário já aceitou o ToS atual */
export async function checkTosAccepted(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('tos_accepted_at, tos_version')
    .eq('id', userId)
    .maybeSingle();

  if (!data) return false;
  return data.tos_version === TOS_VERSION && !!data.tos_accepted_at;
}
