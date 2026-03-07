// PADRÃO VANTA: Sempre usar ISO 8601 com Timezone (UTC-3)
// Exemplo: 2026-05-20T21:00:00-03:00

/** @deprecated Use Formato */
export type Categoria = string;

/** Formato do evento (Supabase: tabela `formatos`). */
export type Formato = string;

export type ContaVanta =
  | 'vanta_guest'
  | 'vanta_member'
  | 'vanta_masteradm'
  | 'vanta_gerente'
  | 'vanta_socio'
  | 'vanta_ger_portaria_lista'
  | 'vanta_portaria_lista'
  | 'vanta_ger_portaria_antecipado'
  | 'vanta_portaria_antecipado'
  | 'vanta_caixa'
  | 'vanta_promoter';

// Nó de acesso: instância concreta de cargo/papel em comunidade ou evento
export interface AccessNode {
  id: string; // `com-${comunidadeId}` | `ev-${eventoId}`
  tipo: 'COMUNIDADE' | 'EVENTO';
  contextId: string;
  contextNome: string;
  contextFoto?: string;
  portalRole:
    | 'vanta_gerente'
    | 'vanta_socio'
    | 'vanta_ger_portaria_lista'
    | 'vanta_portaria_lista'
    | 'vanta_ger_portaria_antecipado'
    | 'vanta_portaria_antecipado'
    | 'vanta_caixa'
    | 'vanta_promoter';
  cargoLabel: string; // 'Gerente', 'Host', 'Portaria Lista', etc.
}

// ── Selos de importância (controle interno masteradm) ──────────────────────
export type TipoSelo = 'VIP' | 'INFLUENCER' | 'PARCEIRO' | 'IMPRENSA';

export interface Selo {
  id: string;
  tipo: TipoSelo;
  label: string;
  concedidoPor: string; // ID do masteradm
  concedidoEm: string; // ISO 8601 -03:00
}

// ── Cargos dentro de uma Comunidade ────────────────────────────────────────
export type TipoCargo =
  | 'GERENTE'
  | 'GER_PORTARIA_LISTA'
  | 'PORTARIA_LISTA'
  | 'GER_PORTARIA_ANTECIPADO'
  | 'PORTARIA_ANTECIPADO'
  | 'CAIXA'
  | 'PROMOTER';

export interface Cargo {
  membroId: string;
  tipo: TipoCargo;
  comunidadeId: string;
  atribuidoPor: string; // ID do masteradm
  atribuidoEm: string; // ISO 8601 -03:00
}

// ── Log de atividades de uma Comunidade ────────────────────────────────────
export interface ComunidadeLog {
  id: string;
  atorNome: string;
  acao: string;
  timestamp: string; // ISO 8601 -03:00
}

export type PrivacidadeOpcao = 'TODOS' | 'AMIGOS' | 'NINGUEM' | 'AMIGOS_EM_COMUM';

export interface PrivacidadeConfig {
  adicionarAmigo: PrivacidadeOpcao;
  verEmail: PrivacidadeOpcao;
  verBio: PrivacidadeOpcao;
  verInstagram: PrivacidadeOpcao;
  verInteresses: PrivacidadeOpcao;
  verEventos: PrivacidadeOpcao;
  verAlbum: PrivacidadeOpcao;
  verAniversario: PrivacidadeOpcao;
  verConquistas: PrivacidadeOpcao;
  verTelefone: PrivacidadeOpcao;
  verCidade: PrivacidadeOpcao;
  verGenero: PrivacidadeOpcao;
  verMood: PrivacidadeOpcao;
}

// ── Notificação Administrativa ─────────────────────────────────────────────
export interface NotificacaoAdmin {
  id: string;
  titulo: string;
  mensagem: string;
  alvo: 'TODOS' | string[];
  criadoPor: string;
  enviadaEm: string; // ISO 8601 -03:00
  status: 'RASCUNHO' | 'ENVIADA';
}

export interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  tipo:
    | 'EVENTO'
    | 'AMIGO'
    | 'SISTEMA'
    | 'ANIVERSARIO'
    | 'FRIEND_REQUEST'
    | 'FRIEND_ACCEPTED'
    | 'CONVITE_SOCIO'
    | 'CORTESIA_PENDENTE'
    | 'REVIEW'
    | 'TRANSFERENCIA_PENDENTE'
    | 'MAIS_VANTA'
    | 'INGRESSO'
    | 'CARGO_ATRIBUIDO'
    | 'CARGO_REMOVIDO'
    | 'EVENTO_APROVADO'
    | 'EVENTO_RECUSADO'
    | 'EVENTO_PENDENTE'
    | 'EVENTO_CANCELADO'
    | 'EVENTO_FINALIZADO'
    | 'SAQUE_SOLICITADO'
    | 'SAQUE_AUTORIZADO'
    | 'SAQUE_APROVADO'
    | 'SAQUE_RECUSADO'
    | 'REEMBOLSO_SOLICITADO'
    | 'REEMBOLSO_APROVADO'
    | 'REEMBOLSO_RECUSADO'
    | 'COTA_RECEBIDA'
    | 'COMPRA_CONFIRMADA'
    | 'PEDIR_REVIEW'
    | 'ALERTA_LOTACAO'
    | 'PARCERIA_NOVA'
    | 'PARCERIA_APROVADA'
    | 'PARCERIA_REJEITADA'
    | 'EVENTO_PRIVADO_NOVA'
    | 'EVENTO_PRIVADO_APROVADO'
    | 'EVENTO_PRIVADO_RECUSADO'
    | 'COMEMORACAO_NOVA'
    | 'COMEMORACAO_APROVADA'
    | 'COMEMORACAO_RECUSADA'
    | 'COMEMORACAO_FAIXA_ATINGIDA';
  lida: boolean;
  link: string; // ID do evento, membro ou ação
  timestamp: string; // ISO 8601
}

export type TabState = 'INICIO' | 'RADAR' | 'BUSCAR' | 'MENSAGENS' | 'PERFIL' | 'ADMIN_HUB';
export type ProfileSubView =
  | 'MAIN'
  | 'EDIT_PROFILE'
  | 'PREFERENCES'
  | 'WALLET'
  | 'MY_TICKETS'
  | 'PUBLIC_PREVIEW'
  | 'CHAT_ROOM'
  | 'PREVIEW_PUBLIC'
  | 'PREVIEW_FRIENDS'
  | 'HISTORICO'
  | 'CLUBE'
  | 'MEIA_ENTRADA'
  | 'SOLICITAR_PARCERIA'
  | 'MINHAS_SOLICITACOES';
