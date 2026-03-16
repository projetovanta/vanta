/**
 * DiagnosticoView — Unifica Health Check + Supabase Diagnostic
 * Abas internas: Health Check | Supabase
 */

import React, { useState } from 'react';
import { ArrowLeft, Activity, Database } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { AdminViewHeader } from '../components/AdminViewHeader';
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
      <AdminViewHeader title="Diagnóstico" kicker="Configurações" onBack={onBack} />

      {/* Abas */}
      <div className="px-5 py-2 shrink-0 border-b border-white/5">
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
