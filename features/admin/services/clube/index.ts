/**
 * clubeService — Clube de Influência (MAIS VANTA).
 * Facade que compõe todos os sub-services.
 */
import { supabase } from '../../../../services/supabaseClient';
import {
  _membros,
  _lotes,
  _reservas,
  _solicitacoes,
  _passports,
  _tiersDef,
  bump,
  getCacheVersion,
  rowToMembro,
  rowToLote,
  rowToReserva,
  rowToSolicitacao,
  rowToPassport,
  rowToTierDef,
} from './clubeCache';

// Sub-services
import * as membros from './clubeMembrosService';
import * as tiers from './clubeTiersService';
import * as solicitacoes from './clubeSolicitacoesService';
import * as lotes from './clubeLotesService';
import * as reservas from './clubeReservasService';
import * as infracoes from './clubeInfracoesService';
import * as passport from './clubePassportService';
import * as instagram from './clubeInstagramService';
import * as config from './clubeConfigService';
import { clubeConvitesService } from './clubeConvitesService';

// ── Service ──────────────────────────────────────────────────────────────────
export const clubeService = {
  getVersion: () => getCacheVersion(),

  // ── Refresh ────────────────────────────────────────────────────────────────
  async refresh(): Promise<void> {
    const [membrosRes, solRes, passRes, tiersRes] = await Promise.all([
      supabase.from('membros_clube').select('*').limit(2000),
      supabase.from('solicitacoes_clube').select('*').order('criado_em', { ascending: false }).limit(2000),
      supabase.from('passport_aprovacoes').select('*').order('solicitado_em', { ascending: false }).limit(2000),
      supabase.from('tiers_mais_vanta').select('*').order('ordem').limit(100),
    ]);

    _membros.clear();
    _lotes.length = 0;
    _reservas.length = 0;
    _solicitacoes.length = 0;
    _passports.length = 0;
    _tiersDef.clear();

    if (membrosRes.data) {
      for (const r of membrosRes.data) {
        const m = rowToMembro(r);
        _membros.set(m.userId, m);
      }
    }
    if (solRes.data) {
      for (const r of solRes.data) _solicitacoes.push(rowToSolicitacao(r));
    }
    if (passRes.data) {
      for (const r of passRes.data) _passports.push(rowToPassport(r));
    }
    if (tiersRes.data) {
      for (const r of tiersRes.data) {
        const t = rowToTierDef(r);
        _tiersDef.set(t.id, t);
      }
    }
    bump();
  },

  // ── Membros ─────────────────────────────────────────────────────────────
  getMembroClubeByUserId: membros.getMembroClubeByUserId,
  isMembro: membros.isMembro,
  getTier: membros.getTier,
  tierSuficiente: membros.tierSuficiente,
  getAllMembros: membros.getAllMembros,
  getAlcanceEstimado: membros.getAlcanceEstimado,
  alterarTier: membros.alterarTier,

  // ── Tiers ───────────────────────────────────────────────────────────────
  getTiers: tiers.getTiers,
  getTodosTiers: tiers.getTodosTiers,
  getTierDef: tiers.getTierDef,
  getTierOrdem: tiers.getTierOrdem,
  refreshTiers: tiers.refreshTiers,
  criarTier: tiers.criarTier,
  editarTier: tiers.editarTier,

  // ── Solicitações ────────────────────────────────────────────────────────
  getSolicitacoesPendentes: solicitacoes.getSolicitacoesPendentes,
  getSolicitacoes: solicitacoes.getSolicitacoes,
  getAllSolicitacoes: solicitacoes.getAllSolicitacoes,
  getSolicitacaoByUserId: solicitacoes.getSolicitacaoByUserId,
  solicitarEntrada: solicitacoes.solicitarEntrada,
  convidarAmigo: solicitacoes.convidarAmigo,
  convidarParaMaisVanta(masterId: string, membroUserId: string, tier: import('../../../../types').TierMaisVanta) {
    return solicitacoes.convidarParaMaisVanta(masterId, membroUserId, tier, this.enviarNotificacaoClube.bind(this));
  },
  aceitarConviteMaisVanta(
    solId: string,
    instagramHandle: string,
    verificacao?: { verificado: boolean; verificadoEm?: string; codigo?: string },
  ) {
    return solicitacoes.aceitarConviteMaisVanta(
      solId,
      instagramHandle,
      verificacao,
      this.enviarNotificacaoClube.bind(this),
    );
  },
  aprovarSolicitacao(
    solId: string,
    tier: import('../../../../types').TierMaisVanta,
    masterId: string,
    comunidadeId?: string,
  ) {
    return solicitacoes.aprovarSolicitacao(solId, tier, masterId, comunidadeId, this.enviarNotificacaoClube.bind(this));
  },
  rejeitarSolicitacao: solicitacoes.rejeitarSolicitacao,

  // ── Lotes ───────────────────────────────────────────────────────────────
  getLoteMaisVanta: lotes.getLoteMaisVanta,
  getLotesEvento: lotes.getLotesEvento,
  getLoteParaTier: lotes.getLoteParaTier,
  getAllLotes: lotes.getAllLotes,
  upsertLotesMaisVanta: lotes.upsertLotesMaisVanta,
  upsertLoteMaisVanta: lotes.upsertLoteMaisVanta,
  removeLotesMaisVanta: lotes.removeLotesMaisVanta,
  removeLoteMaisVanta: lotes.removeLoteMaisVanta,

  // ── Reservas ────────────────────────────────────────────────────────────
  getReservasUsuario: reservas.getReservasUsuario,
  getReservasEvento: reservas.getReservasEvento,
  getReservasPendentePost: reservas.getReservasPendentePost,
  temDividaSocial: infracoes.temDividaSocial,
  reservar: reservas.reservar,
  cancelarReserva: reservas.cancelarReserva,
  confirmarPost: reservas.confirmarPost,
  verificarPost: reservas.verificarPost,
  getEventosComBeneficio: reservas.getEventosComBeneficio,
  temBeneficio: reservas.temBeneficio,

  // ── Infrações ───────────────────────────────────────────────────────────
  estaBloqueado: infracoes.estaBloqueado,
  isBanidoPermanente: infracoes.isBanidoPermanente,
  getFlagReincidencia: infracoes.getFlagReincidencia,
  getBloqueioAte: infracoes.getBloqueioAte,
  getInfracoes: infracoes.getInfracoes,
  getInfracoesCount: infracoes.getInfracoesCount,
  registrarInfracao: infracoes.registrarInfracao,
  temCastigoNoShow: infracoes.temCastigoNoShow,
  aplicarCastigoNoShow: infracoes.aplicarCastigoNoShow,
  getCastigoAte: infracoes.getCastigoAte,

  // ── Instagram ───────────────────────────────────────────────────────────
  verificarPerfilInstagram: instagram.verificarPerfilInstagram,
  verificarBioInstagram: instagram.verificarBioInstagram,
  _fetchAndUpdateFollowers: instagram._fetchAndUpdateFollowers,
  verificarPostAutomatico: instagram.verificarPostAutomatico,
  atualizarSeguidores: instagram.atualizarSeguidores,

  // ── Passport ────────────────────────────────────────────────────────────
  getPassportAprovacoes: passport.getPassportAprovacoes,
  isPassportAprovado: passport.isPassportAprovado,
  getPassportStatus: passport.getPassportStatus,
  getCidadesDisponiveis: passport.getCidadesDisponiveis,
  solicitarPassport: passport.solicitarPassport,
  aprovarPassport(passportId: string, masterId: string) {
    return passport.aprovarPassport(passportId, masterId, this.enviarNotificacaoClube.bind(this));
  },
  rejeitarPassport: passport.rejeitarPassport,
  getPassportsPendentes: passport.getPassportsPendentes,
  getAllPassports: passport.getAllPassports,

  // ── Config ──────────────────────────────────────────────────────────────
  getConfig: config.getConfig,
  saveConfig: config.saveConfig,

  // ── Notificações ────────────────────────────────────────────────────────
  async enviarNotificacaoClube(payload: {
    userId: string;
    titulo: string;
    corpo: string;
    eventoId?: string;
    data?: Record<string, string>;
  }): Promise<void> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
      await fetch(`${supabaseUrl}/functions/v1/send-push`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: [payload.userId],
          title: payload.titulo,
          body: payload.corpo,
          data: payload.data,
        }),
      });
    } catch (e) {
      console.warn('[clubeService] Erro ao enviar notificação:', e);
    }
  },

  // ── Convites (link externo) ────────────────────────────────────────────────
  convites: clubeConvitesService,
};
