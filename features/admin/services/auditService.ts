/**
 * auditService — registro e leitura de ações administrativas via Supabase.
 *
 * Escrita: INSERT direto na tabela `audit_logs` (fire-and-forget).
 * Leitura: cache local populado via refresh() do Supabase.
 *
 * Actions cobertas:
 *   TICKET_VENDIDO | TICKET_QUEIMADO | SAQUE_SOLICITADO | SAQUE_CONFIRMADO
 *   SAQUE_ESTORNADO | CARGO_ATRIBUIDO | CARGO_REMOVIDO | INTERVENCAO_MASTER
 */

import { supabase } from '../../../services/supabaseClient';
import type { Database, Json } from '../../../types/supabase';

type AuditRow = Database['public']['Tables']['audit_logs']['Row'];

export interface AuditLog {
  id: string;
  userId: string;
  actorName?: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  timestamp: string; // ISO 8601 -03:00
}

export type AuditAction =
  | 'TICKET_VENDIDO'
  | 'TICKET_QUEIMADO'
  | 'TICKET_TITULAR_EDITADO'
  | 'TICKET_REENVIADO'
  | 'TICKET_CANCELADO'
  | 'SAQUE_SOLICITADO'
  | 'SAQUE_CONFIRMADO'
  | 'SAQUE_ESTORNADO'
  | 'CARGO_ATRIBUIDO'
  | 'CARGO_REMOVIDO'
  | 'MEMBRO_APROVADO'
  | 'MEMBRO_REJEITADO'
  | 'INTERVENCAO_MASTER'
  | 'EVENTO_APROVADO'
  | 'EVENTO_REJEITADO'
  | 'TAG_ADICIONADA'
  | 'CARD_CRIADO'
  | 'CARD_EDITADO'
  | 'NIVEL_CRIADO'
  | 'NIVEL_EDITADO'
  | 'COTA_DISTRIBUIDA'
  | 'LISTA_INSERIDA'
  | 'REEMBOLSO_AUTOMATICO'
  | 'REEMBOLSO_MANUAL'
  | 'CHARGEBACK_REGISTRADO'
  | 'CHECKIN_LISTA'
  | 'CHECKIN_LISTA_OFFLINE'
  | 'TICKET_QUEIMADO_OFFLINE'
  | 'TICKET_DUPLICATA_DETECTADA'
  | 'PROPOSTA_VANTA_ENVIADA'
  | 'PROPOSTA_VANTA_ACEITA'
  | 'PROPOSTA_VANTA_RECUSADA'
  | 'PROPOSTA_VANTA_REENVIADA'
  | 'EVENTO_CORRECAO_ENVIADA'
  | 'COMUNIDADE_EDITADA';

// ── Cache local ──────────────────────────────────────────────────────────────
let _logs: AuditLog[] = [];
let _ready = false;

const rowToAuditLog = (row: AuditRow): AuditLog => ({
  id: row.id,
  userId: row.user_id ?? '',
  actorName: row.actor_name ?? undefined,
  action: row.action as AuditAction,
  entityType: row.entity_type ?? '',
  entityId: row.entity_id ?? '',
  oldValue: row.old_value as Record<string, unknown> | undefined,
  newValue: row.new_value as Record<string, unknown> | undefined,
  timestamp: row.created_at ?? '',
});

export const auditService = {
  get isReady(): boolean {
    return _ready;
  },

  /** Carrega logs do Supabase para cache local (mais recentes primeiro, limit 500) */
  async refresh(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        console.error('[auditService] refresh erro:', error);
        return;
      }

      _logs = (data ?? []).map(row => rowToAuditLog(row));
      _ready = true;
    } catch (err) {
      console.error('[auditService] refresh falhou:', err);
    }
  },

  /**
   * Registra uma ação administrativa.
   * INSERT fire-and-forget no Supabase + atualiza cache local.
   */
  log: (
    userId: string,
    action: AuditAction,
    entityType: string,
    entityId: string,
    oldValue?: Record<string, unknown>,
    newValue?: Record<string, unknown>,
    actorName?: string,
  ): void => {
    // Fire-and-forget: insere no Supabase sem bloquear
    void (async () => {
      try {
        // RLS exige user_id = auth.uid() — usar UUID real do Supabase Auth
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const realUserId = user?.id;
        if (!realUserId) return; // não autenticado — skip silencioso

        const { data } = await supabase
          .from('audit_logs')
          .insert({
            user_id: realUserId,
            action,
            entity_type: entityType,
            entity_id: entityId,
            old_value: { ...(oldValue ?? {}), actor: userId } as unknown as Json,
            new_value: (newValue ?? null) as unknown as Json,
            actor_name: actorName ?? null,
          })
          .select('*')
          .single();

        if (data) {
          _logs = [rowToAuditLog(data), ..._logs];
        }
      } catch {
        // fire-and-forget — falha silenciosa
      }
    })();
  },

  /** Retorna todos os logs em cache (mais recentes primeiro) */
  getLogs: (): AuditLog[] => [..._logs],

  /** Filtra por ação */
  getByAction: (action: AuditAction): AuditLog[] => _logs.filter(l => l.action === action),

  /** Filtra por entidade */
  getByEntity: (entityType: string, entityId: string): AuditLog[] =>
    _logs.filter(l => l.entityType === entityType && l.entityId === entityId),
};

// ── Helper de formatação humanizada ─────────────────────────────────────────

const ACTION_LABELS: Record<AuditAction, string> = {
  TICKET_VENDIDO: 'vendeu ingresso',
  TICKET_QUEIMADO: 'validou ingresso',
  TICKET_TITULAR_EDITADO: 'editou titular de ingresso',
  TICKET_REENVIADO: 'reenviu ingresso',
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
  COMUNIDADE_EDITADA: 'editou comunidade',
};

/**
 * Retorna string humanizada para um log de auditoria.
 * Ex: "dev_master aprovou evento em evento/ev_adm_123 às 21:30 do dia 24/fev/2026"
 */
export const formatAuditLog = (log: AuditLog): string => {
  const actionLabel = ACTION_LABELS[log.action] ?? log.action;
  const ts = new Date(log.timestamp);
  const hora = ts.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dia = ts.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  return `${log.userId} ${actionLabel} em ${log.entityType}/${log.entityId} às ${hora} do dia ${dia}`;
};
