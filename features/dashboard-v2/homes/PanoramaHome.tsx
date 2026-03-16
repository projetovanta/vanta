/**
 * PanoramaHome — "Caixa de entrada inteligente"
 * Mostra TUDO que é do usuário: pendências consolidadas + cards por contexto.
 * Toque num card → entra no contexto com sidebar filtrada pelo cargo.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronRight,
  Banknote,
  Users,
  Calendar,
  ListChecks,
  QrCode,
  ShoppingCart,
  Crown,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { fmtBRL } from '../../../utils';
import { eventosAdminService } from '../../admin/services/eventosAdminService';
import { getPendencias, type PendenciaItem } from '../../admin/services/pendenciasService';
import type { ContaVantaLegacy } from '../../../types';
import { CARGO_TO_PORTAL } from '../../admin/services/rbacService';

// ── Tipos ──────────────────────────────────────────────────────────────────

interface AdminAccessComunidade {
  id: string;
  nome: string;
  foto: string | null;
  cargo: string;
  direto: boolean;
}

interface AdminAccessEvento {
  id: string;
  nome: string;
  foto: string | null;
  comunidade_id: string;
  cargo: string;
}

interface ContextoCard {
  id: string;
  tipo: 'COMUNIDADE' | 'EVENTO';
  tenantId: string;
  nome: string;
  foto?: string;
  cargo: string;
  cargoLabel: string;
  // KPIs
  faturamento: number;
  totalEventos: number;
  totalVendidos: number;
  temPendencia: boolean;
  // Evento-specific
  proximoEvento?: string;
  proximoEventoData?: string;
  splitPct?: number;
}

interface OperacaoCard {
  id: string;
  tipo: 'PROMOTER' | 'PORTARIA' | 'CAIXA';
  tenantId: string;
  comunidadeId: string;
  nome: string;
  cargo: string;
  cargoLabel: string;
  detalhe: string;
}

const CARGO_LABEL: Record<string, string> = {
  GERENTE: 'Gerente',
  SOCIO: 'Sócio',
  PROMOTER: 'Promoter',
  GER_PORTARIA_LISTA: 'Portaria Lista',
  PORTARIA_LISTA: 'Portaria Lista',
  GER_PORTARIA_ANTECIPADO: 'Portaria QR',
  PORTARIA_ANTECIPADO: 'Portaria QR',
  CAIXA: 'Caixa',
};

const CARGO_COR: Record<string, string> = {
  GERENTE: '#10b981',
  SOCIO: '#a78bfa',
  PROMOTER: '#60a5fa',
  GER_PORTARIA_LISTA: '#22d3ee',
  PORTARIA_LISTA: '#22d3ee',
  GER_PORTARIA_ANTECIPADO: '#22d3ee',
  PORTARIA_ANTECIPADO: '#22d3ee',
  CAIXA: '#f59e0b',
};

interface Props {
  adminNome: string;
  currentUserId: string;
  isMaster: boolean;
  comunidades: AdminAccessComunidade[];
  eventos: AdminAccessEvento[];
  onEnterContext: (tenantId: string, tenantTipo: 'COMUNIDADE' | 'EVENTO' | 'MASTER', cargo: string) => void;
}

export const PanoramaHome: React.FC<Props> = ({
  adminNome,
  currentUserId,
  isMaster,
  comunidades,
  eventos,
  onEnterContext,
}) => {
  const [pendencias, setPendencias] = useState<PendenciaItem[]>([]);
  const [pendenciasLoading, setPendenciasLoading] = useState(true);

  // Carregar pendências consolidadas
  useEffect(() => {
    const comunidadeIds = comunidades.map(c => c.id);
    const eventoIds = eventos.map(e => e.id);
    const role = isMaster
      ? ('vanta_masteradm' as ContaVantaLegacy)
      : (CARGO_TO_PORTAL[comunidades[0]?.cargo as keyof typeof CARGO_TO_PORTAL] ?? 'vanta_gerente');

    getPendencias(currentUserId, role, comunidadeIds, eventoIds)
      .then(items => {
        setPendencias(items);
        setPendenciasLoading(false);
      })
      .catch(() => setPendenciasLoading(false));
  }, [currentUserId, isMaster, comunidades, eventos]);

  // Cards de negócio (comunidades onde sou gerente/sócio)
  const negocioCards = useMemo((): ContextoCard[] => {
    const cards: ContextoCard[] = [];

    // Comunidades onde sou gerente
    for (const com of comunidades) {
      if (com.cargo !== 'GERENTE' && com.cargo !== 'SOCIO') continue;
      const evts = eventosAdminService.getEventosByComunidade(com.id);
      const totalVendidos = evts.flatMap(e => e.lotes.flatMap(l => l.variacoes)).reduce((s, v) => s + v.vendidos, 0);
      const faturamento = evts
        .flatMap(e => e.lotes.flatMap(l => l.variacoes))
        .reduce((s, v) => s + v.vendidos * v.valor, 0);

      // Próximo evento
      const now = new Date();
      const futuros = evts
        .filter(e => e.publicado && new Date(e.dataInicio) > now)
        .sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime());
      const proximo = futuros[0];

      cards.push({
        id: `com-${com.id}`,
        tipo: 'COMUNIDADE',
        tenantId: com.id,
        nome: com.nome,
        foto: com.foto || undefined,
        cargo: com.cargo,
        cargoLabel: CARGO_LABEL[com.cargo] || com.cargo,
        faturamento,
        totalEventos: evts.length,
        totalVendidos,
        temPendencia: false,
        proximoEvento: proximo?.nome,
        proximoEventoData: proximo?.dataInicio,
      });
    }

    // Eventos onde sou sócio (se não já coberto pela comunidade)
    for (const evt of eventos) {
      if (evt.cargo !== 'SOCIO') continue;
      // Pular se a comunidade já tá na lista como gerente
      if (cards.some(c => c.tipo === 'COMUNIDADE' && c.tenantId === evt.comunidade_id && c.cargo === 'GERENTE'))
        continue;

      const evtData = eventosAdminService.getEvento(evt.id);
      const vendidos = evtData ? evtData.lotes.flatMap(l => l.variacoes).reduce((s, v) => s + v.vendidos, 0) : 0;
      const fat = evtData ? evtData.lotes.flatMap(l => l.variacoes).reduce((s, v) => s + v.vendidos * v.valor, 0) : 0;

      cards.push({
        id: `evt-${evt.id}`,
        tipo: 'EVENTO',
        tenantId: evt.comunidade_id,
        nome: evt.nome,
        foto: evt.foto || undefined,
        cargo: evt.cargo,
        cargoLabel: CARGO_LABEL[evt.cargo] || evt.cargo,
        faturamento: fat,
        totalEventos: 1,
        totalVendidos: vendidos,
        temPendencia: false,
        splitPct: 40, // TODO: pegar do socios_evento
      });
    }

    return cards;
  }, [comunidades, eventos]);

  // Cards operacionais (promoter, portaria, caixa)
  const operacaoCards = useMemo((): OperacaoCard[] => {
    const cards: OperacaoCard[] = [];

    for (const evt of eventos) {
      if (evt.cargo === 'SOCIO' || evt.cargo === 'GERENTE') continue;
      cards.push({
        id: `op-${evt.id}`,
        tipo: evt.cargo === 'PROMOTER' ? 'PROMOTER' : evt.cargo === 'CAIXA' ? 'CAIXA' : 'PORTARIA',
        tenantId: evt.id,
        comunidadeId: evt.comunidade_id,
        nome: evt.nome,
        cargo: evt.cargo,
        cargoLabel: CARGO_LABEL[evt.cargo] || evt.cargo,
        detalhe:
          evt.cargo === 'PROMOTER'
            ? 'Inserir nomes na lista'
            : evt.cargo === 'CAIXA'
              ? 'Vender ingressos na porta'
              : 'Validar entradas',
      });
    }

    // Comunidades operacionais (portaria/caixa/promoter no nível comunidade)
    for (const com of comunidades) {
      if (com.cargo === 'GERENTE' || com.cargo === 'SOCIO') continue;
      cards.push({
        id: `op-com-${com.id}`,
        tipo: com.cargo === 'PROMOTER' ? 'PROMOTER' : com.cargo === 'CAIXA' ? 'CAIXA' : 'PORTARIA',
        tenantId: com.id,
        comunidadeId: com.id,
        nome: com.nome,
        cargo: com.cargo,
        cargoLabel: CARGO_LABEL[com.cargo] || com.cargo,
        detalhe:
          com.cargo === 'PROMOTER'
            ? 'Inserir nomes na lista'
            : com.cargo === 'CAIXA'
              ? 'Vender ingressos na porta'
              : 'Validar entradas',
      });
    }

    return cards;
  }, [comunidades, eventos]);

  // Faturamento total
  const faturamentoTotal = negocioCards.reduce((s, c) => s + c.faturamento, 0);

  const fmtData = (iso: string) => {
    const d = new Date(iso);
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return `${dias[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
  };

  const diasAte = (iso: string) => Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);

  const getOperacaoIcon = (tipo: string) => {
    if (tipo === 'PROMOTER') return ListChecks;
    if (tipo === 'CAIXA') return ShoppingCart;
    return QrCode;
  };

  return (
    <div className="flex-1 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5 max-w-3xl mx-auto w-full">
        {/* Saudação */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FFD300] animate-pulse" />
            <p className="text-[#FFD300]/60 text-[0.5625rem] font-black uppercase tracking-[0.25em]">
              {isMaster ? 'Master Admin' : 'Painel'}
            </p>
          </div>
          <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic leading-none text-white">
            Olá, {adminNome?.split(' ')[0]}
          </h1>
          {negocioCards.length > 0 && (
            <p className="text-zinc-500 text-[0.625rem] font-black uppercase tracking-widest mt-1.5">
              {negocioCards.length} {negocioCards.length === 1 ? 'negócio' : 'negócios'} · {fmtBRL(faturamentoTotal)}{' '}
              total
            </p>
          )}
        </div>

        {/* ═══ PRECISA DE VOCÊ ═══ */}
        {pendenciasLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 size="1rem" className="text-zinc-700 animate-spin" />
          </div>
        ) : pendencias.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-[0.2em]">Precisa de Você</p>
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[0.5625rem] font-black animate-pulse">
                {pendencias.length}
              </span>
            </div>
            <div className="space-y-1.5">
              {pendencias.slice(0, 5).map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    // Pendências master → entrar na visão global
                    if (isMaster) onEnterContext('', 'MASTER', 'vanta_masteradm');
                  }}
                  className="w-full flex items-center gap-3 bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-3 active:opacity-80 transition-all text-left"
                >
                  <AlertCircle size="0.9375rem" className="text-red-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-300 text-xs font-semibold truncate">{p.titulo}</p>
                    <p className="text-zinc-600 text-[0.5625rem] truncate">{p.descricao}</p>
                  </div>
                  <ChevronRight size="0.8125rem" className="text-zinc-700 shrink-0" />
                </button>
              ))}
              {pendencias.length > 5 && (
                <p className="text-zinc-600 text-[0.5625rem] text-center">+{pendencias.length - 5} pendências</p>
              )}
            </div>
          </div>
        ) : null}

        {/* ═══ VISÃO GLOBAL (só master) ═══ */}
        {isMaster && (
          <button
            onClick={() => onEnterContext('', 'MASTER', 'vanta_masteradm')}
            className="w-full bg-[#FFD300]/5 border border-[#FFD300]/20 rounded-2xl p-4 active:bg-[#FFD300]/10 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#FFD300]/15 border border-[#FFD300]/25 flex items-center justify-center shrink-0">
                <Crown size="1.25rem" className="text-[#FFD300]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">Visão Global</p>
                <p className="text-zinc-400 text-[0.625rem] mt-0.5">Toda a plataforma · Dashboard Master</p>
              </div>
              <ChevronRight size="0.875rem" className="text-zinc-700 shrink-0" />
            </div>
          </button>
        )}

        {/* ═══ SEUS NEGÓCIOS ═══ */}
        {negocioCards.length > 0 && (
          <div>
            <p className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-[0.2em] mb-2.5">Seus Negócios</p>
            <div className="space-y-3">
              {negocioCards.map(card => {
                const cor = CARGO_COR[card.cargo] || '#8b8b8b';
                return (
                  <button
                    key={card.id}
                    onClick={() => onEnterContext(card.tenantId, card.tipo, card.cargo)}
                    className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl p-4 active:bg-white/5 active:border-white/10 transition-all text-left"
                  >
                    <div className="flex items-start gap-3">
                      {/* Foto ou ícone */}
                      {card.foto ? (
                        <img src={card.foto} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${cor}15`, border: `1px solid ${cor}25` }}
                        >
                          <Calendar size="1.125rem" style={{ color: cor }} />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-bold text-sm truncate">{card.nome}</p>
                          <span
                            className="shrink-0 px-1.5 py-0.5 rounded-full text-[0.4375rem] font-black uppercase tracking-wider"
                            style={{ backgroundColor: `${cor}20`, color: cor }}
                          >
                            {card.cargoLabel}
                          </span>
                        </div>

                        {/* KPIs inline */}
                        <div className="flex items-center gap-3 text-zinc-400 text-[0.625rem]">
                          <span className="font-bold text-[#FFD300]">{fmtBRL(card.faturamento)}</span>
                          <span>·</span>
                          <span>
                            {card.totalEventos} evento{card.totalEventos !== 1 ? 's' : ''}
                          </span>
                          <span>·</span>
                          <span>{card.totalVendidos} vendidos</span>
                        </div>

                        {/* Próximo evento */}
                        {card.proximoEvento && card.proximoEventoData && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <Calendar size="0.625rem" className="text-zinc-600" />
                            <p className="text-zinc-500 text-[0.5625rem]">
                              Próximo: {card.proximoEvento} · {fmtData(card.proximoEventoData)}
                              {diasAte(card.proximoEventoData) <= 3 && (
                                <span className="text-amber-400 font-bold ml-1">
                                  {diasAte(card.proximoEventoData) === 0
                                    ? 'Hoje!'
                                    : diasAte(card.proximoEventoData) === 1
                                      ? 'Amanhã!'
                                      : `${diasAte(card.proximoEventoData)} dias`}
                                </span>
                              )}
                            </p>
                          </div>
                        )}

                        {/* Split (sócio) */}
                        {card.splitPct != null && (
                          <p className="text-zinc-500 text-[0.5625rem] mt-1">
                            Seu split: {card.splitPct}% · {fmtBRL(card.faturamento * (card.splitPct / 100))}
                          </p>
                        )}
                      </div>

                      <ChevronRight size="0.875rem" className="text-zinc-700 shrink-0 mt-1" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ OPERAÇÃO HOJE ═══ */}
        {operacaoCards.length > 0 && (
          <div>
            <p className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-[0.2em] mb-2.5">Operação Hoje</p>
            <div className="space-y-2">
              {operacaoCards.map(card => {
                const cor = CARGO_COR[card.cargo] || '#8b8b8b';
                const Icon = getOperacaoIcon(card.tipo);
                return (
                  <button
                    key={card.id}
                    onClick={() => onEnterContext(card.comunidadeId, 'COMUNIDADE', card.cargo)}
                    className="w-full flex items-center gap-3 bg-zinc-900/40 border border-white/5 rounded-2xl p-4 active:bg-white/5 transition-all text-left"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cor}15`, border: `1px solid ${cor}25` }}
                    >
                      <Icon size="1rem" style={{ color: cor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-bold text-sm truncate">{card.nome}</p>
                        <span
                          className="shrink-0 px-1.5 py-0.5 rounded-full text-[0.4375rem] font-black uppercase tracking-wider"
                          style={{ backgroundColor: `${cor}20`, color: cor }}
                        >
                          {card.cargoLabel}
                        </span>
                      </div>
                      <p className="text-zinc-500 text-[0.625rem] mt-0.5">{card.detalhe}</p>
                    </div>
                    <ChevronRight size="0.875rem" className="text-zinc-700 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sem nada */}
        {negocioCards.length === 0 && operacaoCards.length === 0 && !isMaster && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Calendar size="1.75rem" className="text-zinc-700" />
            <p className="text-zinc-400 text-sm font-bold">Nenhuma atribuição</p>
            <p className="text-zinc-600 text-xs">
              Quando você for adicionado a uma equipe, seus negócios aparecem aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
