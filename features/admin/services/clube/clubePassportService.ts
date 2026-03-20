import type { PassportAprovacao, TierMaisVanta } from '../../../../types';
import { supabase } from '../../../../services/supabaseClient';
import { comunidadesService } from '../comunidadesService';
import { notificationsService } from '../notificationsService';
import { tsBR } from '../../../../utils';
import { TIER_ORDER, _membros, _passports, bump, rowToPassport } from './clubeCache';

export function getPassportAprovacoes(userId: string): PassportAprovacao[] {
  return _passports.filter(p => p.userId === userId);
}

export function isPassportAprovado(userId: string, comunidadeId: string): boolean {
  const membro = _membros.get(userId);
  if (!membro?.ativo) return false;
  if (membro.comunidadeOrigem === comunidadeId) return true;
  const comunidade = comunidadesService.getAll().find((c: { id: string }) => c.id === comunidadeId);
  if (!comunidade?.cidade) return false;
  const passport = _passports.find(
    p => p.userId === userId && p.cidade === comunidade.cidade && p.status === 'APROVADO',
  );
  if (!passport) return false;
  const membroOrder = TIER_ORDER[membro.tier] ?? 0;
  const minOrder = TIER_ORDER[(comunidade.tierMinimoMaisVanta ?? 'lista') as TierMaisVanta] ?? 1;
  return membroOrder >= minOrder;
}

export function getPassportStatus(userId: string, cidade: string): 'APROVADO' | 'PENDENTE' | 'REJEITADO' | null {
  const membro = _membros.get(userId);
  if (membro?.comunidadeOrigem) {
    const com = comunidadesService.getAll().find((c: { id: string }) => c.id === membro.comunidadeOrigem);
    if (com?.cidade === cidade) return 'APROVADO';
  }
  const p = _passports.find(pp => pp.userId === userId && pp.cidade === cidade);
  return p?.status ?? null;
}

export function getCidadesDisponiveis(): string[] {
  const cidades = new Set<string>();
  for (const c of comunidadesService.getAll()) {
    if (c.cidade) cidades.add(c.cidade);
  }
  return Array.from(cidades).sort();
}

export async function solicitarPassport(userId: string, cidade: string): Promise<PassportAprovacao> {
  // V3: membro aprovado no clube ganha acesso automático à cidade (sem curadoria)
  const membro = _membros.get(userId);
  const autoAprovar = membro?.ativo === true;
  const now = tsBR();
  const row = {
    user_id: userId,
    cidade,
    status: autoAprovar ? 'APROVADO' : 'PENDENTE',
    solicitado_em: now,
    ...(autoAprovar ? { resolvido_em: now } : {}),
  };
  const { data, error } = await supabase.from('passport_aprovacoes').insert(row).select().single();
  if (error) throw error;
  const p = rowToPassport(data);
  _passports.push(p);
  // Atualizar cidades_ativas no membro
  if (autoAprovar) {
    const cidades = membro?.cidadesAtivas ?? [];
    if (!cidades.includes(cidade)) {
      const novasCidades = [...cidades, cidade];
      await supabase.from('membros_clube').update({ cidades_ativas: novasCidades }).eq('user_id', userId);
      if (membro) membro.cidadesAtivas = novasCidades;
    }
  }
  bump();
  return p;
}

export async function aprovarPassport(
  passportId: string,
  masterId: string,
  enviarNotificacaoClube?: (p: {
    userId: string;
    titulo: string;
    corpo: string;
    data?: Record<string, string>;
  }) => Promise<void>,
): Promise<void> {
  const now = tsBR();
  await supabase
    .from('passport_aprovacoes')
    .update({ status: 'APROVADO', resolvido_em: now, resolvido_por: masterId })
    .eq('id', passportId);
  const p = _passports.find(pp => pp.id === passportId);
  if (p) {
    p.status = 'APROVADO';
    p.resolvidoEm = now;
    p.resolvidoPor = masterId;
    const cidadeLabel = p.cidade ?? 'sua região';
    notificationsService
      .add(
        {
          titulo: 'Passaporte aprovado!',
          mensagem: `Seu passaporte para ${cidadeLabel} foi aprovado. Você já pode participar de eventos exclusivos.`,
          tipo: 'MAIS_VANTA',
          lida: false,
          link: 'CLUBE',
          timestamp: now,
        },
        p.userId,
      )
      .catch(() => {});
    enviarNotificacaoClube?.({
      userId: p.userId,
      titulo: 'Passaporte aprovado!',
      corpo: `Seu passaporte para ${cidadeLabel} foi aprovado. Você já pode participar de eventos exclusivos.`,
      data: { tipo: 'PASSPORT_APROVADO' },
    }).catch(() => {});
    // Atualizar cidades_ativas
    if (p.cidade) {
      const membro = _membros.get(p.userId);
      const cidades = membro?.cidadesAtivas ?? [];
      if (!cidades.includes(p.cidade)) {
        const novasCidades = [...cidades, p.cidade];
        await supabase.from('membros_clube').update({ cidades_ativas: novasCidades }).eq('user_id', p.userId);
        if (membro) membro.cidadesAtivas = novasCidades;
      }
    }
  }
  bump();
}

export async function rejeitarPassport(passportId: string, masterId: string): Promise<void> {
  const now = tsBR();
  await supabase
    .from('passport_aprovacoes')
    .update({ status: 'REJEITADO', resolvido_em: now, resolvido_por: masterId })
    .eq('id', passportId);
  const p = _passports.find(pp => pp.id === passportId);
  if (p) {
    p.status = 'REJEITADO';
    p.resolvidoEm = now;
    p.resolvidoPor = masterId;
    const cidadeLabelR = p.cidade ?? 'esta região';
    notificationsService
      .add(
        {
          titulo: 'Passaporte não aprovado',
          mensagem: `Seu passaporte para ${cidadeLabelR} não foi aprovado desta vez.`,
          tipo: 'MAIS_VANTA',
          lida: false,
          link: 'CLUBE',
          timestamp: now,
        },
        p.userId,
      )
      .catch(() => {});
  }
  bump();
}

export function getPassportsPendentes(): PassportAprovacao[] {
  return _passports.filter(p => p.status === 'PENDENTE');
}

export function getAllPassports(): PassportAprovacao[] {
  return [..._passports];
}
