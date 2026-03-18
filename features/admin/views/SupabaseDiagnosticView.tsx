/**
 * SupabaseDiagnosticView — Diagnóstico completo do Supabase.
 *
 * Exclusivo para vanta_masteradm.
 * Verifica tabelas, colunas, policies, RPCs, buckets e realtime.
 * Permite criar o que falta com um clique.
 *
 * SEGURANÇA: nunca usar service_role_key no frontend.
 * Usa Vite proxy → Management API com PAT passado em runtime (campo input),
 * nunca embutido no bundle via import.meta.env.
 */

import React, { useState, useCallback } from 'react';
import {
  ArrowLeft,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  ChevronDown,
  ChevronUp,
  Database,
  Shield,
  Zap,
  HardDrive,
  Key,
} from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';

// SEGURANÇA: nunca embutir service_role_key, PAT ou project_ref no bundle.
// Credenciais são inseridas pelo master em runtime via inputs na UI.

import { EXPECTED_TABLES, EXPECTED_RPCS, EXPECTED_BUCKETS } from './supabaseDiagnosticSchema';
import type { ExpectedTable } from './supabaseDiagnosticSchema';
import { globalToast } from '../../../components/Toast';

// ── Tipos do diagnóstico ────────────────────────────────────────────────────

type DiagStatus = 'ok' | 'warning' | 'error';

interface DiagItem {
  category: 'table' | 'column' | 'rls' | 'rpc' | 'bucket' | 'realtime';
  status: DiagStatus;
  label: string;
  detail: string;
  fixSQL?: string;
}

// ── Helpers de query ────────────────────────────────────────────────────────

/** Query via Vite proxy → Management API (sem CORS). PAT e PROJECT_REF passados em runtime. */
const queryMgmt = async (sql: string, pat: string, projectRef: string): Promise<any[]> => {
  try {
    const resp = await fetch(`/api/supabase-mgmt/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pat}` },
      body: JSON.stringify({ query: sql }),
    });
    if (!resp.ok) return [];
    return await resp.json();
  } catch {
    return [];
  }
};

/** Executa DDL via Vite proxy → Management API */
const execDDL = async (sql: string, pat: string, projectRef: string): Promise<{ ok: boolean; error?: string }> => {
  try {
    const resp = await fetch(`/api/supabase-mgmt/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pat}` },
      body: JSON.stringify({ query: sql }),
    });
    if (resp.ok) return { ok: true };
    const text = await resp.text();
    return { ok: false, error: text };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Erro de rede' };
  }
};

// ── Componente ──────────────────────────────────────────────────────────────

export const SupabaseDiagnosticView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [diagItems, setDiagItems] = useState<DiagItem[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [executing, setExecuting] = useState<string | null>(null);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  // Credenciais em runtime — nunca embutidas no bundle
  const [pat, setPat] = useState('');
  const [projectRef, setProjectRef] = useState('');

  const runDiagnostic = useCallback(async () => {
    if (!pat || !projectRef) {
      setLastError('Preencha o PAT e o Project Ref antes de escanear.');
      setScanned(true);
      return;
    }
    setScanning(true);
    setDiagItems([]);
    setLastError(null);
    const results: DiagItem[] = [];

    try {
      // 1. Tabelas existentes
      const tables = await queryMgmt(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`,
        pat,
        projectRef,
      );
      if (tables.length === 0) {
        setLastError(
          'Não foi possível conectar à Management API. Verifique se o PAT e Project Ref estão corretos e o Vite proxy está ativo.',
        );
        setScanning(false);
        setScanned(true);
        return;
      }
      const existingTables = tables.map((r: any) => r.table_name);

      // 2. Colunas
      const cols = await queryMgmt(
        `SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, ordinal_position`,
        pat,
        projectRef,
      );
      const columnsMap: Record<string, { name: string; type: string }[]> = {};
      cols.forEach((r: any) => {
        if (!columnsMap[r.table_name]) columnsMap[r.table_name] = [];
        columnsMap[r.table_name].push({ name: r.column_name, type: r.data_type });
      });

      // 3. Policies
      const policies = await queryMgmt(
        `SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename`,
        pat,
        projectRef,
      );
      const policyMap: Record<string, string[]> = {};
      policies.forEach((r: any) => {
        if (!policyMap[r.tablename]) policyMap[r.tablename] = [];
        policyMap[r.tablename].push(r.policyname);
      });

      // 4. RLS status
      const rlsStatus = await queryMgmt(
        `SELECT relname, relrowsecurity FROM pg_class WHERE relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND relkind = 'r'`,
        pat,
        projectRef,
      );
      const rlsMap: Record<string, boolean> = {};
      rlsStatus.forEach((r: any) => {
        rlsMap[r.relname] = r.relrowsecurity;
      });

      // 5. Functions (RPCs)
      const funcs = await queryMgmt(
        `SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'`,
        pat,
        projectRef,
      );
      const existingFuncs = funcs.map((r: any) => r.routine_name);

      // 6. Buckets
      const buckets = await queryMgmt(`SELECT id, name FROM storage.buckets ORDER BY name`, pat, projectRef);
      const existingBuckets = buckets.map((r: any) => r.name || r.id);

      // 7. Realtime
      const realtimeTables = await queryMgmt(
        `SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime'`,
        pat,
        projectRef,
      );
      const realtimeSet = new Set(realtimeTables.map((r: any) => r.tablename));

      // ── Diagnosticar tabelas ──────────────────────────────────────
      for (const expected of EXPECTED_TABLES) {
        const exists = existingTables.includes(expected.name);
        if (!exists) {
          results.push({
            category: 'table',
            status: 'error',
            label: expected.name,
            detail: 'Tabela não existe no banco',
            fixSQL: expected.createSQL || undefined,
          });
          continue;
        }

        const existingCols = columnsMap[expected.name] || [];
        const existingColNames = existingCols.map(c => c.name);
        const missingCols: string[] = [];
        for (const col of expected.columns) {
          if (!existingColNames.includes(col.name)) missingCols.push(col.name);
        }

        if (missingCols.length > 0) {
          results.push({
            category: 'column',
            status: 'warning',
            label: expected.name,
            detail: `Colunas faltando: ${missingCols.join(', ')}`,
            fixSQL: missingCols
              .map(c => {
                const spec = expected.columns.find(ec => ec.name === c);
                const t = spec?.type === 'ARRAY' ? 'TEXT[]' : spec?.type || 'TEXT';
                const def =
                  t === 'boolean'
                    ? 'false'
                    : t === 'integer'
                      ? '0'
                      : t === 'numeric'
                        ? '0'
                        : t.includes('[]')
                          ? "'{}'"
                          : "''";
                return `ALTER TABLE ${expected.name} ADD COLUMN IF NOT EXISTS ${c} ${t} DEFAULT ${def};`;
              })
              .join('\n'),
          });
        }

        // RLS
        if (!rlsMap[expected.name]) {
          results.push({
            category: 'rls',
            status: 'warning',
            label: expected.name,
            detail: 'RLS desabilitado nesta tabela',
            fixSQL: `ALTER TABLE ${expected.name} ENABLE ROW LEVEL SECURITY;`,
          });
        }

        const tablePolicies = policyMap[expected.name] || [];
        if (tablePolicies.length === 0 && rlsMap[expected.name]) {
          results.push({
            category: 'rls',
            status: 'warning',
            label: expected.name,
            detail: 'RLS habilitado mas sem nenhuma policy (acesso bloqueado)',
          });
        }

        // Realtime
        if (expected.realtime && !realtimeSet.has(expected.name)) {
          results.push({
            category: 'realtime',
            status: 'warning',
            label: expected.name,
            detail: 'Deveria estar na publication supabase_realtime',
            fixSQL: `ALTER PUBLICATION supabase_realtime ADD TABLE ${expected.name};`,
          });
        }

        // Tudo OK
        if (
          missingCols.length === 0 &&
          rlsMap[expected.name] &&
          tablePolicies.length > 0 &&
          (!expected.realtime || realtimeSet.has(expected.name))
        ) {
          results.push({
            category: 'table',
            status: 'ok',
            label: expected.name,
            detail: `${existingCols.length} colunas · ${tablePolicies.length} policies${expected.realtime ? ' · Realtime' : ''}`,
          });
        }
      }

      // ── RPCs ──────────────────────────────────────────────────────
      for (const rpc of EXPECTED_RPCS) {
        if (existingFuncs.includes(rpc)) {
          results.push({ category: 'rpc', status: 'ok', label: rpc, detail: 'Função existe' });
        } else {
          results.push({ category: 'rpc', status: 'error', label: rpc, detail: 'Função não encontrada' });
        }
      }

      // ── Buckets ───────────────────────────────────────────────────
      for (const bucket of EXPECTED_BUCKETS) {
        if (existingBuckets.includes(bucket)) {
          results.push({ category: 'bucket', status: 'ok', label: bucket, detail: 'Bucket existe' });
        } else {
          results.push({
            category: 'bucket',
            status: 'error',
            label: bucket,
            detail: 'Bucket não existe',
            fixSQL: `INSERT INTO storage.buckets (id, name, public) VALUES ('${bucket}', '${bucket}', ${bucket === 'selfies' ? 'false' : 'true'}) ON CONFLICT DO NOTHING;`,
          });
        }
      }
    } catch (err: any) {
      results.push({
        category: 'table',
        status: 'error',
        label: 'Erro geral',
        detail: err?.message || 'Falha na conexão',
      });
    }

    setDiagItems(results);
    setScanning(false);
    setScanned(true);
  }, [pat, projectRef]);

  const executeFixSQL = async (sql: string, label: string) => {
    setExecuting(label);
    const res = await execDDL(sql, pat, projectRef);
    if (!res.ok) {
      globalToast('erro', `Erro ao executar: ${res.error}`);
    }
    setExecuting(null);
    await runDiagnostic();
  };

  // Agrupar por categoria
  const grouped = diagItems.reduce<Record<string, DiagItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const catLabels: Record<string, { label: string; icon: React.FC<any>; color: string }> = {
    table: { label: 'Tabelas', icon: Database, color: '#60a5fa' },
    column: { label: 'Colunas', icon: Database, color: '#f59e0b' },
    rls: { label: 'Row Level Security', icon: Shield, color: '#a78bfa' },
    rpc: { label: 'Funções (RPCs)', icon: Zap, color: '#10b981' },
    bucket: { label: 'Storage Buckets', icon: HardDrive, color: '#f472b6' },
    realtime: { label: 'Realtime', icon: Zap, color: '#22d3ee' },
  };

  const counts = {
    ok: diagItems.filter(i => i.status === 'ok').length,
    warning: diagItems.filter(i => i.status === 'warning').length,
    error: diagItems.filter(i => i.status === 'error').length,
  };

  const fixableItems = diagItems.filter(i => i.fixSQL && i.status !== 'ok');

  const executeAllFixes = async () => {
    if (fixableItems.length === 0) return;
    setExecuting('all');
    const allSQL = fixableItems.map(i => i.fixSQL!).join('\n');
    await execDDL(allSQL, pat, projectRef);
    setExecuting(null);
    await runDiagnostic();
  };

  const statusIcon = (s: DiagStatus) => {
    if (s === 'ok') return <CheckCircle2 size="0.875rem" className="text-emerald-400 shrink-0" />;
    if (s === 'warning') return <AlertTriangle size="0.875rem" className="text-amber-400 shrink-0" />;
    return <XCircle size="0.875rem" className="text-red-400 shrink-0" />;
  };

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-5 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <button
            aria-label="Voltar"
            onClick={onBack}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all shrink-0"
          >
            <ArrowLeft size="1.125rem" className="text-zinc-400" />
          </button>
          <div className="flex-1 min-w-0">
            <p style={TYPOGRAPHY.sectionKicker} className="mb-1">
              Master
            </p>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-xl">
              Diagnóstico Supabase
            </h1>
          </div>
        </div>

        {/* Credenciais runtime */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <label className="text-zinc-400 text-[0.5rem] font-black uppercase tracking-widest mb-1 flex items-center gap-1">
              <Key size="0.5rem" /> PAT
            </label>
            <input
              type="password"
              value={pat}
              onChange={e => setPat(e.target.value)}
              placeholder="sbp_..."
              className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white text-xs placeholder:text-zinc-700 focus:border-[#FFD300]/30 outline-none"
            />
          </div>
          <div className="flex-1 min-w-0">
            <label className="text-zinc-400 text-[0.5rem] font-black uppercase tracking-widest mb-1 block">
              Project Ref
            </label>
            <input
              type="text"
              value={projectRef}
              onChange={e => setProjectRef(e.target.value)}
              placeholder="abcdefghijkl"
              className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white text-xs placeholder:text-zinc-700 focus:border-[#FFD300]/30 outline-none"
            />
          </div>
        </div>

        {/* Botão scan */}
        <button
          aria-label="Carregando"
          onClick={runDiagnostic}
          disabled={scanning || !pat || !projectRef}
          className="w-full py-3.5 bg-[#FFD300] text-black font-black text-[0.625rem] uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-50"
        >
          {scanning ? <Loader2 size="0.875rem" className="animate-spin" /> : <RefreshCw size="0.875rem" />}
          {scanning ? 'Escaneando...' : scanned ? 'Escanear Novamente' : 'Iniciar Diagnóstico'}
        </button>

        {/* Resumo */}
        {scanned && !scanning && !lastError && (
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size="0.75rem" className="text-emerald-400" />
              <span className="text-emerald-400 text-[0.625rem] font-black">{counts.ok}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle size="0.75rem" className="text-amber-400" />
              <span className="text-amber-400 text-[0.625rem] font-black">{counts.warning}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <XCircle size="0.75rem" className="text-red-400" />
              <span className="text-red-400 text-[0.625rem] font-black">{counts.error}</span>
            </div>
            {fixableItems.length > 0 && (
              <button
                onClick={executeAllFixes}
                disabled={executing === 'all'}
                className="ml-auto px-4 py-2 bg-emerald-500/15 border border-emerald-500/25 rounded-xl text-emerald-400 text-[0.5625rem] font-black uppercase tracking-wider active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {executing === 'all' ? <Loader2 size="0.625rem" className="animate-spin" /> : <Plus size="0.625rem" />}
                Criar tudo ({fixableItems.length})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Resultados */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-3 max-w-3xl mx-auto w-full">
        {!scanned && !scanning && (
          <div className="flex flex-col items-center py-20 gap-4 text-center">
            <Database size="2.25rem" className="text-zinc-800" />
            <p className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest">
              Diagnóstico do Banco de Dados
            </p>
            <p className="text-zinc-700 text-xs max-w-[16.25rem] leading-relaxed">
              Verifica tabelas, colunas, policies RLS, funções, buckets e realtime. Mostra o que falta e permite criar
              automaticamente.
            </p>
          </div>
        )}

        {scanning && (
          <div className="flex flex-col items-center py-20 gap-4">
            <Loader2 size="1.75rem" className="text-[#FFD300] animate-spin" />
            <p className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest">
              Consultando information_schema...
            </p>
          </div>
        )}

        {lastError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-center">
            <XCircle size="1.5rem" className="text-red-400 mx-auto mb-3" />
            <p className="text-red-300 text-xs font-bold mb-2">Erro de Conexão</p>
            <p className="text-zinc-400 text-[0.625rem] leading-relaxed">{lastError}</p>
          </div>
        )}

        {scanned &&
          !scanning &&
          !lastError &&
          (Object.entries(grouped) as [string, DiagItem[]][]).map(([cat, items]) => {
            const catInfo = catLabels[cat] || { label: cat, icon: Database, color: '#999' };
            const CatIcon = catInfo.icon;
            const isExpanded = expandedCat === cat;
            const hasIssues = items.some(i => i.status !== 'ok');

            return (
              <div key={cat} className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedCat(isExpanded ? null : cat)}
                  className="w-full flex items-center gap-3 p-4 active:bg-white/5 transition-all"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${catInfo.color}15`, border: `1px solid ${catInfo.color}25` }}
                  >
                    <CatIcon size="0.875rem" style={{ color: catInfo.color }} />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-white text-sm font-bold">{catInfo.label}</p>
                    <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest">
                      {items.filter(i => i.status === 'ok').length}/{items.length} ok
                      {hasIssues &&
                        ` · ${items.filter(i => i.status !== 'ok').length} pendente${items.filter(i => i.status !== 'ok').length > 1 ? 's' : ''}`}
                    </p>
                  </div>
                  {hasIssues ? (
                    <AlertTriangle size="0.875rem" className="text-amber-400 shrink-0" />
                  ) : (
                    <CheckCircle2 size="0.875rem" className="text-emerald-400 shrink-0" />
                  )}
                  {isExpanded ? (
                    <ChevronUp size="0.875rem" className="text-zinc-400" />
                  ) : (
                    <ChevronDown size="0.875rem" className="text-zinc-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-white/5 p-3 space-y-1.5">
                    {items.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-900/60">
                        {statusIcon(item.status)}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-bold truncate">{item.label}</p>
                          <p className="text-zinc-400 text-[0.625rem] leading-relaxed mt-0.5">{item.detail}</p>
                        </div>
                        {item.fixSQL && item.status !== 'ok' && (
                          <button
                            onClick={() => executeFixSQL(item.fixSQL!, item.label)}
                            disabled={executing === item.label}
                            className="shrink-0 px-3 py-1.5 bg-[#FFD300]/10 border border-[#FFD300]/20 rounded-lg text-[#FFD300] text-[0.5rem] font-black uppercase tracking-wider active:scale-90 transition-all disabled:opacity-50 flex items-center gap-1"
                          >
                            {executing === item.label ? (
                              <Loader2 size="0.5rem" className="animate-spin" />
                            ) : (
                              <Plus size="0.5rem" />
                            )}
                            Criar
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

        {scanned && <div className="h-10" />}
      </div>
    </div>
  );
};
