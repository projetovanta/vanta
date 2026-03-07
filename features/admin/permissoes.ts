import { ContaVanta, AccessNode } from '../../types';
import { comunidadesService } from './services/comunidadesService';
import { eventosAdminService } from './services/eventosAdminService';
import { rbacService, CARGO_TO_PORTAL, CARGO_LABELS } from './services/rbacService';

// ── Access Nodes ────────────────────────────────────────────────────────────
// Consolida todos os contextos (comunidades + eventos) onde o membro tem acesso.
// Comunidades com cargo têm prioridade: eventos dessas comunidades não geram nó extra.
export const getAccessNodes = (userId: string): AccessNode[] => {
  const nodes: AccessNode[] = [];
  const coveredComIds = new Set<string>();

  for (const a of rbacService.getAtribuicoes(userId)) {
    if (a.tenant.tipo === 'COMUNIDADE') {
      nodes.push({
        id: `com-${a.tenant.id}`,
        tipo: 'COMUNIDADE',
        contextId: a.tenant.id,
        contextNome: a.tenant.nome,
        contextFoto: a.tenant.foto,
        portalRole: CARGO_TO_PORTAL[a.cargo],
        cargoLabel: CARGO_LABELS[a.cargo],
      });
      coveredComIds.add(a.tenant.id);
    }
  }

  // Eventos com qualquer cargo geram nó
  for (const a of rbacService.getAtribuicoes(userId)) {
    if (a.tenant.tipo === 'EVENTO') {
      const ev = eventosAdminService.getEvento(a.tenant.id);
      if (ev && coveredComIds.has(ev.comunidadeId)) continue;
      nodes.push({
        id: `ev-${a.tenant.id}`,
        tipo: 'EVENTO',
        contextId: a.tenant.id,
        contextNome: a.tenant.nome,
        contextFoto: a.tenant.foto,
        portalRole: CARGO_TO_PORTAL[a.cargo],
        cargoLabel: CARGO_LABELS[a.cargo],
      });
    }
  }

  return nodes;
};

// ── Acesso a comunidades ────────────────────────────────────────────────────
// masteradm → todas. Demais → onde tem cargo direto OU cargo em evento filho.
export const getAcessoComunidades = (userId: string, role: ContaVanta) => {
  if (role === 'vanta_masteradm') return comunidadesService.getAll();
  const atribs = rbacService.getAtribuicoes(userId);
  const ids = new Set<string>();
  for (const a of atribs) {
    if (a.tenant.tipo === 'COMUNIDADE') {
      ids.add(a.tenant.id);
    } else if (a.tenant.tipo === 'EVENTO') {
      // Evento pertence a uma comunidade → user vê a comunidade no gate
      const comId = rbacService.getComunidadeDoEvento(a.tenant.id);
      if (comId) ids.add(comId);
    }
  }
  return comunidadesService.getAll().filter(c => ids.has(c.id));
};

// ── Acesso a eventos ────────────────────────────────────────────────────────
// Qualquer cargo no evento dá acesso.
// Cargo na comunidade → todos os eventos da comunidade.
export const getAcessoEventos = (userId: string, role: ContaVanta) => {
  if (role === 'vanta_masteradm') return eventosAdminService.getEventos();

  // Comunidades onde o user tem cargo → acesso a todos os eventos dessas comunidades
  const commIds = new Set(getAcessoComunidades(userId, role).map(c => c.id));

  // Eventos onde o user tem atribuição direta (qualquer cargo)
  const eventoIds = new Set(
    rbacService
      .getAtribuicoes(userId)
      .filter(a => a.tenant.tipo === 'EVENTO')
      .map(a => a.tenant.id),
  );

  return eventosAdminService.getEventos().filter(e => commIds.has(e.comunidadeId) || eventoIds.has(e.id));
};

// ── Guards contextuais V2 ───────────────────────────────────────────────────
// Usados pelos AdminDashboardView para guards reais (não apenas hide button).

/** Verifica se o usuário pode acessar a rota financeira no contexto dado */
export const canAccessFinanceiro = (
  userId: string,
  role: ContaVanta,
  ctx?: { communityId?: string; eventId?: string },
): boolean => {
  if (role === 'vanta_masteradm' || role === 'vanta_socio') return true;
  return rbacService.temPermissaoCtx(userId, 'VER_FINANCEIRO', ctx);
};

/** Verifica se o usuário pode acessar o módulo de listas */
export const canAccessListas = (
  userId: string,
  role: ContaVanta,
  ctx?: { communityId?: string; eventId?: string },
): boolean => {
  if (role === 'vanta_masteradm' || role === 'vanta_socio') return true;
  return (
    rbacService.temPermissaoCtx(userId, 'GERIR_LISTAS', ctx) ||
    rbacService.temPermissaoCtx(userId, 'INSERIR_LISTA', ctx) ||
    rbacService.temPermissaoCtx(userId, 'CRIAR_REGRA_LISTA', ctx)
  );
};

/** Verifica se o usuário pode acessar check-in por lista */
export const canAccessCheckin = (
  userId: string,
  role: ContaVanta,
  ctx?: { communityId?: string; eventId?: string },
): boolean => {
  if (role === 'vanta_masteradm') return true;
  return rbacService.temPermissaoCtx(userId, 'CHECKIN_LISTA', ctx);
};

/** Verifica se o usuário pode acessar QR scanner */
export const canAccessQR = (
  userId: string,
  role: ContaVanta,
  ctx?: { communityId?: string; eventId?: string },
): boolean => {
  if (role === 'vanta_masteradm') return true;
  return rbacService.temPermissaoCtx(userId, 'VALIDAR_QR', ctx);
};

/** Verifica se o usuário pode acessar caixa (venda na porta) */
export const canAccessCaixa = (
  userId: string,
  role: ContaVanta,
  ctx?: { communityId?: string; eventId?: string },
): boolean => {
  if (role === 'vanta_masteradm') return true;
  return rbacService.temPermissaoCtx(userId, 'VENDER_PORTA', ctx);
};

/** Verifica se o usuário pode editar eventos no contexto */
export const canEditEvento = (
  userId: string,
  role: ContaVanta,
  ctx?: { communityId?: string; eventId?: string },
): boolean => {
  if (role === 'vanta_masteradm') return true;
  return rbacService.temPermissaoCtx(userId, 'GERIR_EQUIPE', ctx);
};

/** Verifica se o usuário pode gerenciar equipe */
export const canManageEquipe = (
  userId: string,
  role: ContaVanta,
  ctx?: { communityId?: string; eventId?: string },
): boolean => {
  if (role === 'vanta_masteradm') return true;
  return rbacService.temPermissaoCtx(userId, 'GERIR_EQUIPE', ctx);
};

// ── Guards master-only ───────────────────────────────────────────────────────

/** Guard estrito: somente vanta_masteradm */
export const isMasterOnly = (_userId: string, role: ContaVanta): boolean => role === 'vanta_masteradm';

// ── Guards contextuais adicionais ────────────────────────────────────────────

/** MEUS_EVENTOS: gerente_comunidade, socio_evento, dono_evento, master */
export const canAccessMeusEventos = (
  userId: string,
  role: ContaVanta,
  ctx?: { communityId?: string; eventId?: string },
): boolean => {
  if (role === 'vanta_masteradm') return true;
  // Sócio sempre pode ver seus eventos (o gateway já validou que é sócio nesta comunidade)
  if (role === 'vanta_socio') return true;
  return rbacService.temPermissaoCtx(userId, 'GERIR_EQUIPE', ctx);
};

/** PORTARIA_SCANNER: checkin lista ou QR, master */
export const canAccessPortariaScanner = (
  userId: string,
  role: ContaVanta,
  ctx?: { communityId?: string; eventId?: string },
): boolean => {
  if (role === 'vanta_masteradm') return true;
  return (
    rbacService.temPermissaoCtx(userId, 'CHECKIN_LISTA', ctx) || rbacService.temPermissaoCtx(userId, 'VALIDAR_QR', ctx)
  );
};

/** COMUNIDADES: gerente_comunidade, master */
export const canAccessComunidades = (userId: string, role: ContaVanta, ctx?: { communityId?: string }): boolean => {
  if (role === 'vanta_masteradm') return true;
  return rbacService.temPermissaoCtx(userId, 'GERIR_EQUIPE', ctx ? { communityId: ctx.communityId } : undefined);
};

/** CONVITES_SOCIO: sócio do evento atual ou gerente da comunidade atual */
export const canAccessConvitesSocio = (
  userId: string,
  role: ContaVanta,
  ctx?: { communityId?: string; eventId?: string },
): boolean => {
  if (role === 'vanta_masteradm' || role === 'vanta_socio') return true;
  if (!ctx) return false;
  const atribs = rbacService.getAtribuicoes(userId);
  return atribs.some(a => {
    // SOCIO: somente do evento atual
    if (a.cargo === 'SOCIO' && ctx.eventId && a.tenant.tipo === 'EVENTO' && a.tenant.id === ctx.eventId) return true;
    // GERENTE: da comunidade atual (ou comunidade do evento atual)
    if (a.cargo === 'GERENTE' && a.tenant.tipo === 'COMUNIDADE') {
      if (ctx.communityId && a.tenant.id === ctx.communityId) return true;
      if (ctx.eventId) {
        const ev = eventosAdminService.getEvento(ctx.eventId);
        if (ev && ev.comunidadeId === a.tenant.id) return true;
      }
    }
    return false;
  });
};

// ── Legado mantido para compat ──────────────────────────────────────────────

// Verifica se o usuário tem acesso analítico (aba Caixa/Resumo) a um evento específico.
export const isSocioEvento = (eventoAdminId: string, userId: string, role: ContaVanta): boolean => {
  if (role === 'vanta_masteradm') return true;
  // Checagem direta: SOCIO do evento ou GERENTE da comunidade do evento
  const atribs = rbacService.getAtribuicoes(userId);
  const isDono = atribs.some(a => {
    if (a.cargo === 'SOCIO' && a.tenant.tipo === 'EVENTO' && a.tenant.id === eventoAdminId) return true;
    if (a.cargo === 'GERENTE' && a.tenant.tipo === 'COMUNIDADE') {
      const ev = eventosAdminService.getEvento(eventoAdminId);
      return ev && ev.comunidadeId === a.tenant.id;
    }
    return false;
  });
  if (isDono) return true;
  // Fallback: comunidade do evento
  const ev = eventosAdminService.getEvento(eventoAdminId);
  if (!ev) return false;
  const commIds = new Set(getAcessoComunidades(userId, role).map(c => c.id));
  if (commIds.has(ev.comunidadeId)) return true;
  const a = rbacService.getAtribuicao(userId, 'EVENTO', eventoAdminId);
  return !!a && ['SOCIO', 'PROMOTER'].includes(a.cargo);
};
