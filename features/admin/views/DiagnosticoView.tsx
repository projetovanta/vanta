/**
 * DiagnosticoView — Hub de diagnóstico com 4 abas
 * Saúde (Health + Supabase) | Analytics | FAQ | Ferramentas (Links + Pendências)
 */

import React, { useState, lazy, Suspense } from 'react';
import { Activity, BarChart3, HelpCircle, Wrench, Database } from 'lucide-react';
import { AdminViewHeader } from '../components/AdminViewHeader';
import { DatabaseHealthView } from './DatabaseHealthView';
import { SupabaseDiagnosticView } from './SupabaseDiagnosticView';

const ProductAnalyticsView = lazy(() =>
  import('./ProductAnalyticsView').then(m => ({ default: m.ProductAnalyticsView })),
);
const FaqView = lazy(() => import('./FaqView').then(m => ({ default: m.FaqView })));
const LinksUteisView = lazy(() => import('./LinksUteisView').then(m => ({ default: m.LinksUteisView })));
const PendenciasAppView = lazy(() => import('./PendenciasAppView').then(m => ({ default: m.PendenciasAppView })));

type AbaDiag = 'SAUDE' | 'ANALYTICS' | 'FAQ' | 'FERRAMENTAS';
type SubSaude = 'HEALTH' | 'SUPABASE';
type SubFerramentas = 'LINKS' | 'PENDENCIAS';

const Loading = () => (
  <div className="flex-1 flex items-center justify-center text-zinc-600 text-xs">Carregando...</div>
);

export const DiagnosticoView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [aba, setAba] = useState<AbaDiag>('SAUDE');
  const [subSaude, setSubSaude] = useState<SubSaude>('HEALTH');
  const [subFerramentas, setSubFerramentas] = useState<SubFerramentas>('LINKS');

  const abas: { id: AbaDiag; label: string; icon: typeof Activity }[] = [
    { id: 'SAUDE', label: 'Saúde', icon: Activity },
    { id: 'ANALYTICS', label: 'Analytics', icon: BarChart3 },
    { id: 'FAQ', label: 'FAQ', icon: HelpCircle },
    { id: 'FERRAMENTAS', label: 'Ferramentas', icon: Wrench },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* lint-layout-ok — tab container, filhos gerenciam scroll */}
      <AdminViewHeader title="Diagnóstico" kicker="Plataforma" onBack={onBack} />

      {/* Abas principais */}
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

      {/* Sub-tabs para Saúde */}
      {aba === 'SAUDE' && (
        <div className="px-5 py-1.5 shrink-0 border-b border-white/5">
          <div className="flex gap-1">
            {[
              { id: 'HEALTH' as SubSaude, label: 'Health Check', icon: Activity },
              { id: 'SUPABASE' as SubSaude, label: 'Supabase', icon: Database },
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setSubSaude(s.id)}
                className={`px-2.5 py-1 rounded text-[0.5rem] font-bold uppercase tracking-wider transition-all ${
                  subSaude === s.id ? 'bg-white/10 text-zinc-200' : 'text-zinc-600 active:bg-white/5'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sub-tabs para Ferramentas */}
      {aba === 'FERRAMENTAS' && (
        <div className="px-5 py-1.5 shrink-0 border-b border-white/5">
          <div className="flex gap-1">
            {[
              { id: 'LINKS' as SubFerramentas, label: 'Links Úteis' },
              { id: 'PENDENCIAS' as SubFerramentas, label: 'Pendências App' },
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setSubFerramentas(s.id)}
                className={`px-2.5 py-1 rounded text-[0.5rem] font-bold uppercase tracking-wider transition-all ${
                  subFerramentas === s.id ? 'bg-white/10 text-zinc-200' : 'text-zinc-600 active:bg-white/5'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Conteúdo */}
      <div className="flex-1 overflow-hidden">
        <Suspense fallback={<Loading />}>
          {aba === 'SAUDE' && subSaude === 'HEALTH' && <DatabaseHealthView onBack={() => {}} />}
          {aba === 'SAUDE' && subSaude === 'SUPABASE' && <SupabaseDiagnosticView onBack={() => {}} />}
          {aba === 'ANALYTICS' && <ProductAnalyticsView onBack={() => {}} />}
          {aba === 'FAQ' && <FaqView onBack={() => {}} />}
          {aba === 'FERRAMENTAS' && subFerramentas === 'LINKS' && <LinksUteisView onBack={() => {}} />}
          {aba === 'FERRAMENTAS' && subFerramentas === 'PENDENCIAS' && <PendenciasAppView onBack={() => {}} />}
        </Suspense>
      </div>
    </div>
  );
};
