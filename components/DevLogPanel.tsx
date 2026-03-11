/**
 * DevLogPanel — Painel flutuante de debug logs, visível apenas em localhost.
 *
 * Mostra: contador erros/warnings, último evento, log expandível,
 * botões limpar e exportar (clipboard).
 */

import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { devLogger } from '../services/devLogger';
import type { DevLogEntry } from '../services/devLogger';

const isDev = import.meta.env.DEV;

function useDevLogState() {
  const entries = useSyncExternalStore(
    devLogger.subscribe,
    () => devLogger.getEntries(),
    () => [] as readonly DevLogEntry[],
  );
  const errorCount = useSyncExternalStore(
    devLogger.subscribe,
    () => devLogger.errorCount,
    () => 0,
  );
  const warnCount = useSyncExternalStore(
    devLogger.subscribe,
    () => devLogger.warnCount,
    () => 0,
  );
  return { entries, errorCount, warnCount };
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('pt-BR', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

const LEVEL_BG: Record<string, string> = {
  error: 'bg-red-500/20 border-l-2 border-red-500',
  warn: 'bg-yellow-500/10 border-l-2 border-yellow-500',
  info: '',
};

const LogEntry: React.FC<{ entry: DevLogEntry }> = ({ entry }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className={`px-2 py-1 text-[11px] font-mono cursor-pointer hover:bg-white/5 ${LEVEL_BG[entry.level] || ''}`}
      onClick={() => setExpanded(!expanded)}
    >
      <span className="text-gray-500">{formatTime(entry.timestamp)}</span> <span>{entry.emoji}</span>{' '}
      <span className="text-gray-300">[{entry.category}]</span> <span className="text-gray-100">{entry.message}</span>
      {expanded && entry.data && (
        <pre className="mt-1 text-[10px] text-gray-400 whitespace-pre-wrap break-all">
          {JSON.stringify(entry.data, null, 2)}
        </pre>
      )}
    </div>
  );
};

export function DevLogPanel() {
  const { entries, errorCount, warnCount } = useDevLogState();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll quando novas entries chegam
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries.length, autoScroll]);

  if (!isDev) return null;

  const filtered = filter ? entries.filter(e => e.category === filter || e.level === filter) : entries;

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {
      // Fallback: HTTP sem HTTPS não suporta clipboard API
      // eslint-disable-next-line no-console
      console.log('[DevLog] Clipboard indisponível (HTTP). Log no console:\n', text);
    });
  };

  const handleExport = () => copyToClipboard(devLogger.exportText());
  const handleExportReport = () => copyToClipboard(devLogger.exportReport());

  // Pill flutuante (minimizado)
  if (!isOpen) {
    const hasProblems = errorCount > 0 || warnCount > 0;
    return (
      <div className="fixed bottom-20 right-2 z-[9999] flex items-center gap-1">
        {hasProblems && (
          <button
            onClick={e => {
              e.stopPropagation();
              handleExportReport();
            }}
            className="rounded-full bg-red-600/90 border border-red-500 px-2 py-1 text-[10px] font-mono text-white shadow-lg backdrop-blur-sm animate-pulse"
            title="Copiar erros pro clipboard"
          >
            📋 {errorCount + warnCount} erros
          </button>
        )}
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-full bg-gray-900/90 border border-gray-700 px-2 py-1 text-[10px] font-mono shadow-lg backdrop-blur-sm flex items-center gap-1"
          title="Abrir DevLog"
        >
          <span>🔍</span>
          {errorCount > 0 && (
            <span className="bg-red-500 text-white rounded-full px-1.5 min-w-[16px] text-center">{errorCount}</span>
          )}
          {warnCount > 0 && (
            <span className="bg-yellow-500 text-black rounded-full px-1.5 min-w-[16px] text-center">{warnCount}</span>
          )}
          {!hasProblems && <span className="text-green-400">{entries.length}</span>}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 z-[9999] w-full max-w-md h-[50vh] flex flex-col bg-gray-950/95 border-t border-l border-gray-700 rounded-tl-lg shadow-2xl backdrop-blur-sm font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">DevLog</span>
          {errorCount > 0 && (
            <span className="bg-red-500 text-white rounded-full px-1.5 text-[10px]">{errorCount} erros</span>
          )}
          {warnCount > 0 && (
            <span className="bg-yellow-500 text-black rounded-full px-1.5 text-[10px]">{warnCount} warns</span>
          )}
          <span className="text-gray-500">{entries.length} total</span>
        </div>
        <div className="flex items-center gap-1">
          {(errorCount > 0 || warnCount > 0) && (
            <button
              onClick={handleExportReport}
              className="bg-red-600 text-white rounded px-1.5 py-0.5 text-[10px] hover:bg-red-500"
              title="Copiar só erros (pra colar no Claude)"
            >
              📋 Erros
            </button>
          )}
          <button onClick={handleExport} className="text-gray-400 hover:text-white px-1" title="Copiar log completo">
            📋
          </button>
          <button onClick={() => devLogger.clear()} className="text-gray-400 hover:text-white px-1" title="Limpar">
            🗑
          </button>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white px-1" title="Fechar">
            ✕
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-gray-800 overflow-x-auto no-scrollbar shrink-0">
        {['', 'NAV', 'API', 'STORE', 'ERRO', 'RT', 'LIFECYCLE', 'CLICK', 'FORM', 'MODAL'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2 py-0.5 rounded text-[10px] shrink-0 ${
              filter === f ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {f || 'Todos'}
          </button>
        ))}
        <label className="flex items-center gap-1 text-[10px] text-gray-500 ml-auto shrink-0">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={e => setAutoScroll(e.target.checked)}
            className="w-3 h-3"
          />
          Auto-scroll
        </label>
      </div>

      {/* Entries */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-600">Nenhum log ainda</div>
        ) : (
          filtered.map(entry => <LogEntry key={entry.id} entry={entry} />)
        )}
      </div>
    </div>
  );
}
