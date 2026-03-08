import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { auditService, AuditLog, AuditAction, formatAuditLog } from '../services/auditService';

// ── Categorias de filtro ───────────────────────────────────────────────────────
type FiltroCategoria = 'TODOS' | 'EVENTOS' | 'MEMBROS' | 'INGRESSOS' | 'SAQUES' | 'CARGOS' | 'LISTAS';

const FILTROS: { id: FiltroCategoria; label: string }[] = [
  { id: 'TODOS', label: 'Todos' },
  { id: 'EVENTOS', label: 'Eventos' },
  { id: 'MEMBROS', label: 'Membros' },
  { id: 'INGRESSOS', label: 'Ingressos' },
  { id: 'SAQUES', label: 'Saques' },
  { id: 'CARGOS', label: 'Cargos' },
  { id: 'LISTAS', label: 'Listas' },
];

// Mapeamento de action → categoria
const ACTION_CATEGORIA: Partial<Record<AuditAction, FiltroCategoria>> = {
  EVENTO_APROVADO: 'EVENTOS',
  EVENTO_REJEITADO: 'EVENTOS',
  MEMBRO_APROVADO: 'MEMBROS',
  MEMBRO_REJEITADO: 'MEMBROS',
  TAG_ADICIONADA: 'MEMBROS',
  TICKET_VENDIDO: 'INGRESSOS',
  TICKET_QUEIMADO: 'INGRESSOS',
  TICKET_TITULAR_EDITADO: 'INGRESSOS',
  TICKET_REENVIADO: 'INGRESSOS',
  TICKET_CANCELADO: 'INGRESSOS',
  SAQUE_SOLICITADO: 'SAQUES',
  SAQUE_CONFIRMADO: 'SAQUES',
  SAQUE_ESTORNADO: 'SAQUES',
  CARGO_ATRIBUIDO: 'CARGOS',
  CARGO_REMOVIDO: 'CARGOS',
  COTA_DISTRIBUIDA: 'LISTAS',
  LISTA_INSERIDA: 'LISTAS',
  REEMBOLSO_AUTOMATICO: 'SAQUES',
  REEMBOLSO_MANUAL: 'SAQUES',
  CHARGEBACK_REGISTRADO: 'SAQUES',
};

// Cor do dot por categoria
const DOT_CORES: Record<FiltroCategoria, string> = {
  TODOS: '#71717a',
  EVENTOS: '#fb923c',
  MEMBROS: '#60a5fa',
  INGRESSOS: '#34d399',
  SAQUES: '#FFD300',
  CARGOS: '#a78bfa',
  LISTAS: '#f472b6',
};

const getCategoria = (action: AuditAction): FiltroCategoria => ACTION_CATEGORIA[action] ?? 'TODOS';

const getDotCor = (action: AuditAction): string => DOT_CORES[getCategoria(action)];

// ── Timestamp formatado ────────────────────────────────────────────────────────
const formatTs = (iso: string): string => {
  try {
    const d = new Date(iso);
    const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const dia = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    return `${hora} · ${dia}`;
  } catch {
    return iso;
  }
};

// ── Action label humanizado ────────────────────────────────────────────────────
const ACTION_LABELS: Record<AuditAction, string> = {
  TICKET_VENDIDO: 'vendeu ingresso',
  TICKET_QUEIMADO: 'validou ingresso',
  TICKET_TITULAR_EDITADO: 'editou titular de ingresso',
  TICKET_REENVIADO: 'reenviou ingresso',
  TICKET_CANCELADO: 'cancelou ingresso',
  SAQUE_SOLICITADO: 'solicitou saque',
  SAQUE_CONFIRMADO: 'confirmou saque',
  SAQUE_ESTORNADO: 'estornou saque',
  CARGO_ATRIBUIDO: 'atribuiu cargo',
  CARGO_REMOVIDO: 'removeu cargo',
  MEMBRO_APROVADO: 'aprovou membro na curadoria',
  MEMBRO_REJEITADO: 'rejeitou membro',
  INTERVENCAO_MASTER: 'interveio como administrador',
  EVENTO_APROVADO: 'aprovou evento',
  EVENTO_REJEITADO: 'rejeitou evento',
  TAG_ADICIONADA: 'adicionou tag a membro',
  CARD_CRIADO: 'criou card VANTA Indica',
  CARD_EDITADO: 'editou card VANTA Indica',
  NIVEL_CRIADO: 'criou nível de prestígio',
  NIVEL_EDITADO: 'editou nível de prestígio',
  COTA_DISTRIBUIDA: 'distribuiu cota de lista',
  LISTA_INSERIDA: 'inseriu nomes em lista',
  REEMBOLSO_AUTOMATICO: 'processou reembolso automático (CDC)',
  REEMBOLSO_MANUAL: 'aprovou reembolso manual',
  CHARGEBACK_REGISTRADO: 'chargeback registrado pelo gateway',
  CHECKIN_LISTA: 'deu check-in em convidado',
  CHECKIN_LISTA_OFFLINE: 'deu check-in offline em convidado',
  TICKET_QUEIMADO_OFFLINE: 'queimou ingresso offline',
  TICKET_DUPLICATA_DETECTADA: 'duplicata detectada no sync',
  PROPOSTA_VANTA_ENVIADA: 'enviou proposta VANTA',
  PROPOSTA_VANTA_ACEITA: 'aceitou proposta VANTA',
  PROPOSTA_VANTA_RECUSADA: 'recusou proposta VANTA',
  PROPOSTA_VANTA_REENVIADA: 'reenviou proposta VANTA',
  EVENTO_CORRECAO_ENVIADA: 'enviou correções de evento',
};

// ── Item de log ────────────────────────────────────────────────────────────────
const LogItem: React.FC<{ log: AuditLog }> = ({ log }) => {
  const [expanded, setExpanded] = useState(false);
  const dotCor = getDotCor(log.action);
  const actionLabel = ACTION_LABELS[log.action] ?? log.action;
  const temDetalhes = !!(log.newValue && Object.keys(log.newValue).length > 0);

  return (
    <div className="border-b border-white/5 py-3 px-5">
      <div className="flex items-start gap-3">
        {/* Dot colorido */}
        <div className="flex flex-col items-center shrink-0 pt-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dotCor }} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Linha principal */}
          <p className="text-white text-sm leading-snug">
            <span className="text-zinc-400 font-bold">{log.userId}</span>{' '}
            <span className="text-zinc-300">{actionLabel}</span>
          </p>

          {/* Linha secundária */}
          <p className="text-zinc-700 text-[10px] mt-0.5 truncate">
            {log.entityType}/{log.entityId}
          </p>

          {/* Timestamp */}
          <p className="text-zinc-400 text-[9px] mt-0.5 font-black uppercase tracking-widest">
            {formatTs(log.timestamp)}
          </p>

          {/* Detalhes expandíveis */}
          {temDetalhes && (
            <div className="mt-2">
              <button
                onClick={() => setExpanded(p => !p)}
                className="flex items-center gap-1 text-zinc-400 text-[9px] font-black uppercase tracking-widest active:text-zinc-400 transition-colors"
              >
                {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                Ver detalhes
              </button>
              {expanded && (
                <pre className="mt-2 p-3 bg-zinc-900/60 border border-white/5 rounded-xl text-zinc-400 text-[9px] font-mono overflow-x-auto leading-relaxed">
                  {JSON.stringify(log.newValue, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── AuditLogView ───────────────────────────────────────────────────────────────
export const AuditLogView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [filtro, setFiltro] = useState<FiltroCategoria>('TODOS');
  const [allLogs, setAllLogs] = useState<AuditLog[]>(() => auditService.getLogs());

  useEffect(() => {
    auditService.refresh().then(() => setAllLogs(auditService.getLogs()));
  }, []);

  const filtered = useMemo(() => {
    if (filtro === 'TODOS') return allLogs;
    return allLogs.filter(l => getCategoria(l.action) === filtro);
  }, [allLogs, filtro]);

  // suprime aviso de formatAuditLog não usado neste arquivo (usado no auditService)
  void formatAuditLog;

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-4 shrink-0">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p style={TYPOGRAPHY.sectionKicker} className="mb-1.5">
              Portal Admin
            </p>
            <div className="flex items-center gap-3">
              <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic">
                Atividades
              </h1>
              <Shield size={16} className="text-[#34d399]" />
              {filtered.length > 0 && (
                <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                  {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          <button aria-label="Voltar"
            onClick={onBack}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all mt-1"
          >
            <ArrowLeft size={18} className="text-zinc-400" />
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {FILTROS.map(f => {
            const isActive = filtro === f.id;
            const cor = DOT_CORES[f.id];
            return (
              <button
                key={f.id}
                onClick={() => setFiltro(f.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all ${
                  isActive ? 'border-transparent text-black' : 'bg-zinc-900/60 text-zinc-400 border-white/5'
                }`}
                style={isActive ? { backgroundColor: cor } : {}}
              >
                {f.id !== 'TODOS' && (
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: isActive ? 'black' : cor }}
                  />
                )}
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto no-scrollbar max-w-3xl mx-auto w-full">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
              <Shield size={28} className="text-zinc-700" />
            </div>
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest text-center">
              {filtro === 'TODOS' ? 'Nenhuma atividade registrada.' : `Nenhum log de ${filtro.toLowerCase()}.`}
            </p>
          </div>
        )}

        {filtered.map(log => (
          <LogItem key={log.id} log={log} />
        ))}
      </div>
    </div>
  );
};
