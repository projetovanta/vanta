/**
 * DiagnosticoView — Unifica Health Check + Supabase Diagnostic
 * Abas internas: Health Check | Supabase
 */

import React, { useState } from 'react';
import { ArrowLeft, Activity, Database } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { DatabaseHealthView } from './DatabaseHealthView';
import { SupabaseDiagnosticView } from './SupabaseDiagnosticView';

type AbaDiag = 'HEALTH' | 'SUPABASE';

export const DiagnosticoView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [aba, setAba] = useState<AbaDiag>('HEALTH');

  const abas: { id: AbaDiag; label: string; icon: typeof Activity }[] = [
    { id: 'HEALTH', label: 'Health Check', icon: Activity },
    { id: 'SUPABASE', label: 'Supabase', icon: Database },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* lint-layout-ok — tab container, filhos gerenciam scroll */}
      {/* Header */}
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-4 shrink-0">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0 mr-3">
            <p style={TYPOGRAPHY.sectionKicker} className="mb-1">
              Configurações
            </p>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic">
              Diagnóstico
            </h1>
          </div>
          <button
            aria-label="Voltar"
            onClick={onBack}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
          >
            <ArrowLeft size="1.125rem" className="text-zinc-400" />
          </button>
        </div>

        {/* Abas */}
        <div className="flex flex-wrap gap-1.5">
          {abas.map(a => {
            const Icon = a.icon;
            return (
              <button
                key={a.id}
                onClick={() => setAba(a.id)}
                className={`px-3 py-1.5 rounded-lg text-[0.5625rem] font-black uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
                  aba === a.id
                    ? 'bg-[#FFD300] text-black border-transparent'
                    : 'bg-zinc-900/60 text-zinc-400 border-white/5 active:bg-zinc-800'
                }`}
              >
                <Icon size="0.75rem" />
                {a.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-hidden">
        {aba === 'HEALTH' && <DatabaseHealthView onBack={() => {}} />}
        {aba === 'SUPABASE' && <SupabaseDiagnosticView onBack={() => {}} />}
      </div>
    </div>
  );
};
