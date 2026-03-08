import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  Banknote,
  Check,
  X,
  Settings2,
  RotateCcw,
  CreditCard,
  Zap,
  AlertTriangle,
  Download,
  FileText,
} from 'lucide-react';
import { exportCSV, exportPDF } from '../../../../utils/exportUtils';
import { TYPOGRAPHY } from '../../../../constants';
import { Notificacao, EventoAdmin } from '../../../../types';
import {
  eventosAdminService,
  Reembolso,
  Chargeback,
  GATEWAY_CREDITO_PERCENT,
  GATEWAY_CREDITO_FIXO,
  GATEWAY_PIX_PERCENT,
  SolicitacaoSaque,
} from '../../services/eventosAdminService';
import { comunidadesService } from '../../services/comunidadesService';
import { fmtBRL, tsBR } from '../../../../utils';

import { SimuladorGateway } from './SimuladorGateway';
import { RaioXEvento } from './RaioXEvento';
import { LucroPorComunidade } from './LucroPorComunidade';

const PIE_COLORS = ['#FFD300', '#10b981', '#3b82f6', '#a78bfa', '#f472b6', '#f59e0b', '#ef4444', '#6366f1'];

interface Props {
  onBack: () => void;
  addNotification: (n: Omit<Notificacao, 'id'>) => void;
}

export const MasterFinanceiroView: React.FC<Props> = ({ onBack, addNotification }) => {
  const [svcVersion, setSvcVersion] = useState(() => eventosAdminService.getVersion());
  useEffect(() => {
    const id = setInterval(() => setSvcVersion(eventosAdminService.getVersion()), 2_000);
    return () => clearInterval(id);
  }, []);

  // ── Async data ──────────────────────────────────────────────────────────────
  const [saques, setSaques] = useState<SolicitacaoSaque[]>([]);
  const [reembolsos, setReembolsos] = useState<Reembolso[]>([]);
  const [chargebacks, setChargebacks] = useState<Chargeback[]>([]);
  const [gatewayCost, setGatewayCost] = useState({ totalCusto: 0, totalVendas: 0 });
  useEffect(() => {
    eventosAdminService.getSolicitacoesSaque().then(setSaques);
    eventosAdminService.getReembolsos().then(setReembolsos);
    eventosAdminService.getChargebacks().then(setChargebacks);
    eventosAdminService.getGatewayCostGlobal().then(setGatewayCost);
  }, [svcVersion]);

  // ── Derivados ───────────────────────────────────────────────────────────────
  const reembolsosManuais = reembolsos.filter(r => r.tipo === 'MANUAL');
  const totalReembolsado = reembolsos.reduce((s, r) => s + r.valor, 0);
  const totalChargebacks = chargebacks.reduce((s, c) => s + c.valor, 0);
  const chargebacksAbertos = chargebacks.filter(c => c.status === 'ABERTO');

  const pendentes = saques.filter(s => s.status === 'PENDENTE');
  const concluidos = saques.filter(s => s.status === 'CONCLUIDO');
  const historico = saques.filter(s => s.status !== 'PENDENTE');

  const lucroNoBolso = concluidos.reduce((s, sq) => s + sq.valorTaxa, 0);
  const lucroAReceber = pendentes.reduce((s, sq) => s + sq.valorTaxa, 0);
  const receitaTotalTaxas = lucroNoBolso + lucroAReceber;

  const allEventos = eventosAdminService.getEventos();

  const totalReembolsadoAprovado = reembolsos
    .filter(r => r.status === 'APROVADO' || r.status === 'AUTOMATICO')
    .reduce((s, r) => s + r.valor, 0);

  const totalVendasGlobal =
    allEventos.reduce(
      (sum, ev) => sum + ev.lotes.flatMap(l => l.variacoes).reduce((s, v) => s + v.vendidos * v.valor, 0),
      0,
    ) - totalReembolsadoAprovado;

  const totalIngressosGlobal = allEventos.reduce(
    (sum, ev) => sum + ev.lotes.flatMap(l => l.variacoes).reduce((s, v) => s + v.vendidos, 0),
    0,
  );
  const ticketMedioGlobal =
    totalIngressosGlobal > 0 ? Math.round((totalVendasGlobal / totalIngressosGlobal) * 100) / 100 : 0;
  const takeRateEfetiva = totalVendasGlobal > 0 ? Math.round((receitaTotalTaxas / totalVendasGlobal) * 10000) / 100 : 0;
  const margemLiquida = totalVendasGlobal > 0 ? ((receitaTotalTaxas / totalVendasGlobal) * 100).toFixed(2) : '0.00';
  const taxaChargeback = totalVendasGlobal > 0 ? ((totalChargebacks / totalVendasGlobal) * 100).toFixed(3) : '0.000';

  // ── Lucro por Comunidade ──────────────────────────────────────────────────
  const lucroPorComunidade = useMemo(() => {
    const result: { id: string; nome: string; lucro: number; eventos: EventoAdmin[] }[] = [];
    const coms = comunidadesService.getAll();
    for (const com of coms) {
      const evts = allEventos.filter(e => e.comunidadeId === com.id);
      let lucro = 0;
      for (const ev of evts) {
        const fees = eventosAdminService.getContractedFees(ev.id);
        if (fees.feePercent === 0 && fees.feeFixed === 0) continue;
        const gmv = ev.lotes.flatMap(l => l.variacoes).reduce((s, v) => s + v.vendidos * v.valor, 0);
        const ingressos = ev.lotes.flatMap(l => l.variacoes).reduce((s, v) => s + v.vendidos, 0);
        const reembolsosEvento = reembolsos
          .filter(r => r.eventoId === ev.id && (r.status === 'APROVADO' || r.status === 'AUTOMATICO'))
          .reduce((s, r) => s + r.valor, 0);
        lucro += (gmv - reembolsosEvento) * fees.feePercent + fees.feeFixed * ingressos;
      }
      if (lucro > 0) result.push({ id: com.id, nome: com.nome, lucro: Math.round(lucro * 100) / 100, eventos: evts });
    }
    return result.sort((a, b) => b.lucro - a.lucro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allEventos, svcVersion, reembolsos]);

  const pieSlices = useMemo(() => {
    const TOP = 5;
    const top = lucroPorComunidade.slice(0, TOP);
    const rest = lucroPorComunidade.slice(TOP);
    const restTotal = rest.reduce((s, c) => s + c.lucro, 0);
    const slices = top.map((c, i) => ({
      id: c.id,
      name: c.nome,
      value: c.lucro,
      color: PIE_COLORS[i % PIE_COLORS.length],
    }));
    if (restTotal > 0) {
      slices.push({ id: '__outros__', name: 'Outros', value: restTotal, color: '#52525b' });
    }
    return slices;
  }, [lucroPorComunidade]);

  // ── Raio-X do Evento ──────────────────────────────────────────────────────
  const [selectedComId, setSelectedComId] = useState<string | null>(null);
  const [selectedEventoId, setSelectedEventoId] = useState<string | null>(null);
  const selectedEvento = selectedEventoId ? allEventos.find(e => e.id === selectedEventoId) : null;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const confirmar = async (saqueId: string) => {
    const s = saques.find(sq => sq.id === saqueId);
    if (!s) return;
    await eventosAdminService.confirmarSaque(saqueId);
    addNotification({
      titulo: 'Saque Confirmado',
      mensagem: `Pagamento de ${fmtBRL(s.valorLiquido)} para ${s.produtorNome} confirmado.`,
      tipo: 'SISTEMA',
      lida: false,
      link: '',
      timestamp: tsBR(),
    });
  };
  const estornar = async (saqueId: string) => {
    const s = saques.find(sq => sq.id === saqueId);
    if (!s) return;
    await eventosAdminService.estornarSaque(saqueId);
    addNotification({
      titulo: 'Saque Estornado',
      mensagem: `Saque de ${fmtBRL(s.valor)} de ${s.produtorNome} foi estornado.`,
      tipo: 'SISTEMA',
      lida: false,
      link: '',
      timestamp: tsBR(),
    });
  };

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExportCSV = useCallback(() => {
    const headers = ['Evento', 'Comunidade', 'Receita Bruta', 'Lucro VANTA', 'Taxa %', 'Modo'];
    const rows = allEventos.map(ev => {
      const fees = eventosAdminService.getContractedFees(ev.id);
      const bruto = ev.lotes.flatMap(l => l.variacoes).reduce((s, v) => s + v.vendidos * v.valor, 0);
      const lucro = Math.round(bruto * fees.feePercent * 100) / 100;
      return [
        ev.nome,
        ev.comunidade.nome,
        fmtBRL(bruto),
        fmtBRL(lucro),
        `${(fees.feePercent * 100).toFixed(1)}%`,
        fees.gatewayMode,
      ];
    });
    exportCSV('financeiro_master', headers, rows);
  }, [allEventos]);

  const handleExportPDF = useCallback(() => {
    const headers = ['Evento', 'Comunidade', 'Bruto', 'Lucro VANTA', 'Gateway'];
    const rows = allEventos.map(ev => {
      const fees = eventosAdminService.getContractedFees(ev.id);
      const bruto = ev.lotes.flatMap(l => l.variacoes).reduce((s, v) => s + v.vendidos * v.valor, 0);
      const lucro = Math.round(bruto * fees.feePercent * 100) / 100;
      return [ev.nome, ev.comunidade.nome, fmtBRL(bruto), fmtBRL(lucro), fees.gatewayMode];
    });
    void exportPDF({
      titulo: 'Financeiro Global — VANTA',
      headers,
      rows,
      resumo: [
        { label: 'Lucro No Bolso', valor: fmtBRL(lucroNoBolso) },
        { label: 'Lucro A Receber', valor: fmtBRL(lucroAReceber) },
        { label: 'Ticket Médio Global', valor: fmtBRL(ticketMedioGlobal) },
        { label: 'Take Rate', valor: `${takeRateEfetiva}%` },
      ],
    });
  }, [allEventos, lucroNoBolso, lucroAReceber, ticketMedioGlobal, takeRateEfetiva]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-5 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <p style={TYPOGRAPHY.sectionKicker} className="mb-1">
              Master Admin
            </p>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic">
              Financeiro Global
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label="Baixar"
              onClick={handleExportCSV}
              title="CSV"
              className="w-9 h-9 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all shrink-0"
            >
              <Download size={14} className="text-zinc-400" />
            </button>
            <button
              aria-label="Documento"
              onClick={handleExportPDF}
              title="PDF"
              className="w-9 h-9 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all shrink-0"
            >
              <FileText size={14} className="text-zinc-400" />
            </button>
            <button
              aria-label="Voltar"
              onClick={onBack}
              className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all shrink-0"
            >
              <ArrowLeft size={18} className="text-zinc-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-5 max-w-3xl mx-auto w-full">
        {/* CAMADA 1 — Card Principal: Lucro Líquido */}
        <div className="bg-gradient-to-br from-zinc-900/60 to-zinc-900/30 border border-emerald-500/15 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Banknote size={14} className="text-emerald-400" />
            <p className="text-[8px] text-emerald-400/60 font-black uppercase tracking-widest">
              Lucro Líquido Real VANTA
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest">No Bolso</p>
              <p className="text-emerald-400 font-black text-2xl leading-none">{fmtBRL(Math.max(lucroNoBolso, 0))}</p>
              <p className="text-zinc-700 text-[8px]">liquidado no gateway</p>
            </div>
            <div className="space-y-1">
              <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest">A Receber</p>
              <p className="text-[#FFD300] font-black text-2xl leading-none">{fmtBRL(lucroAReceber)}</p>
              <p className="text-zinc-700 text-[8px]">processando</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5">
            <div className="flex items-center gap-2 bg-zinc-900/60 rounded-xl px-3 py-2">
              <Zap size={12} className="text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest">Pix · D+1</p>
                <p className="text-zinc-300 text-xs font-bold">{(GATEWAY_PIX_PERCENT * 100).toFixed(0)}% por venda</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-zinc-900/60 rounded-xl px-3 py-2">
              <CreditCard size={12} className="text-sky-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest">Cartão · D+30</p>
                <p className="text-zinc-300 text-xs font-bold">
                  {(GATEWAY_CREDITO_PERCENT * 100).toFixed(1)}% + R${GATEWAY_CREDITO_FIXO.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-[9px]">
              <span className="text-zinc-400">Total taxas VANTA</span>
              <span className="text-zinc-400 font-bold">{fmtBRL(receitaTotalTaxas)}</span>
            </div>
            {gatewayCost.totalCusto > 0 && (
              <div className="flex justify-between text-[9px]">
                <span className="text-zinc-400">Custo gateway plataforma (info)</span>
                <span className="text-zinc-400 font-bold">{fmtBRL(gatewayCost.totalCusto)}</span>
              </div>
            )}
            {totalChargebacks > 0 && (
              <div className="flex justify-between text-[9px]">
                <span className="text-zinc-400">Chargebacks (produtor)</span>
                <span className="text-red-400/50 font-bold">{fmtBRL(totalChargebacks)}</span>
              </div>
            )}
            {totalReembolsado > 0 && (
              <div className="flex justify-between text-[9px]">
                <span className="text-zinc-400">Reembolsos (produtor)</span>
                <span className="text-orange-400/50 font-bold">{fmtBRL(totalReembolsado)}</span>
              </div>
            )}
            <div className="flex justify-between text-[9px] pt-1.5 border-t border-white/5">
              <span className="text-emerald-400 font-black uppercase tracking-wider">Lucro VANTA</span>
              <span className="text-emerald-400 font-black">{fmtBRL(receitaTotalTaxas)}</span>
            </div>
          </div>
        </div>

        {/* KPIs Compactos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {[
            {
              label: 'Ticket Médio',
              value: fmtBRL(ticketMedioGlobal),
              sub: `${totalIngressosGlobal} ing.`,
              color: 'text-zinc-300',
            },
            { label: 'Take Rate', value: `${takeRateEfetiva.toFixed(1)}%`, sub: 'sobre GMV', color: 'text-[#FFD300]' },
            { label: 'Margem', value: `${margemLiquida}%`, sub: 'lucro/GMV', color: 'text-emerald-400' },
            {
              label: 'Chargeback',
              value: `${taxaChargeback}%`,
              sub: `${chargebacks.length} caso${chargebacks.length !== 1 ? 's' : ''}`,
              color: totalChargebacks > 0 ? 'text-red-400' : 'text-zinc-400',
            },
          ].map(kpi => (
            <div
              key={kpi.label}
              className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 text-center space-y-0.5"
            >
              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider truncate">{kpi.label}</p>
              <p className={`font-black text-base leading-none ${kpi.color}`}>{kpi.value}</p>
              <p className="text-zinc-400 text-[9px] truncate">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* CAMADA 2 — Pizza: Lucro por Comunidade */}
        <LucroPorComunidade
          pieSlices={pieSlices}
          lucroPorComunidade={lucroPorComunidade}
          selectedComId={selectedComId}
          selectedEventoId={selectedEventoId}
          onSelectCom={setSelectedComId}
          onSelectEvento={setSelectedEventoId}
        />

        {/* CAMADA 3 — Raio-X do Evento */}
        {selectedEvento && <RaioXEvento evento={selectedEvento} />}

        {/* Pedidos Pendentes de Saque */}
        <div>
          <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-3">
            Pedidos Pendentes ({pendentes.length})
          </p>
          {pendentes.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-2 opacity-40">
              <Check size={20} className="text-zinc-700" />
              <p className="text-zinc-700 text-[9px] font-black uppercase tracking-widest">Nenhum pedido pendente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendentes.map(s => {
                const data = new Date(s.solicitadoEm).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <div key={s.id} className="bg-zinc-900/40 border border-amber-500/15 rounded-2xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-base leading-none truncate">{s.produtorNome}</p>
                        <p className="text-zinc-400 text-[9px] mt-0.5 truncate">{s.eventoNome}</p>
                        <p className="text-zinc-400 text-[8px] font-black uppercase tracking-widest mt-0.5">
                          PIX {s.pixTipo}: <span className="text-zinc-400">{s.pixChave}</span>
                        </p>
                        <p className="text-zinc-700 text-[8px] mt-0.5">{data}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-white font-black text-xl leading-none">{fmtBRL(s.valor)}</p>
                        <p className="text-zinc-400 text-[8px] mt-0.5">Líquido: {fmtBRL(s.valorLiquido)}</p>
                        <p className="text-amber-400/70 text-[8px]">Taxa: {fmtBRL(s.valorTaxa)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => estornar(s.id)}
                        className="flex-1 py-2.5 bg-red-950/40 border border-red-500/20 text-red-400 rounded-xl text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5"
                      >
                        <X size={10} /> Estornar
                      </button>
                      <button
                        onClick={() => confirmar(s.id)}
                        className="flex-1 py-2.5 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 rounded-xl text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Check size={10} /> Confirmar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reembolsos */}
        <div className="space-y-4">
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw size={13} className="text-orange-400 shrink-0" />
                <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest">Histórico de Reembolsos</p>
              </div>
              {totalReembolsado > 0 && <p className="text-orange-400 font-black text-sm">{fmtBRL(totalReembolsado)}</p>}
            </div>
            {reembolsos.filter(r => r.status !== 'PENDENTE_APROVACAO').length > 0 ? (
              <div className="space-y-2">
                {reembolsos
                  .filter(r => r.status !== 'PENDENTE_APROVACAO')
                  .map(r => {
                    const data = new Date(r.solicitadoEm).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    const statusColor =
                      r.tipo === 'AUTOMATICO'
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : r.status === 'APROVADO'
                          ? 'text-orange-400 bg-orange-500/10 border-orange-500/20'
                          : 'text-red-400 bg-red-500/10 border-red-500/20';
                    return (
                      <div key={r.id} className="bg-orange-500/5 border border-orange-500/15 rounded-xl p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-orange-300 text-xs font-bold truncate">
                              {r.tipo === 'AUTOMATICO' ? 'Automático (CDC)' : 'Reembolso Manual'} — {r.eventoNome}
                            </p>
                            <p className="text-zinc-400 text-[9px] mt-0.5 truncate">
                              {r.tipo === 'AUTOMATICO' ? 'Sistema' : `Aprovado por ${r.aprovadoPor || 'master'}`} ·{' '}
                              {data}
                            </p>
                            <p className="text-zinc-400 text-[9px] mt-0.5 line-clamp-2">Motivo: {r.motivo}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-orange-400 font-black text-sm">{fmtBRL(r.valor)}</p>
                            <span
                              className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border block mt-1 ${statusColor}`}
                            >
                              {r.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="flex flex-col items-center py-5 gap-2 opacity-40">
                <Check size={16} className="text-zinc-700" />
                <p className="text-zinc-700 text-[9px] font-black uppercase tracking-widest">Nenhum reembolso</p>
              </div>
            )}
            {reembolsos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 pt-3 border-t border-white/5">
                <div className="text-center">
                  <p className="text-emerald-400 text-xs font-bold">
                    {reembolsos.filter(r => r.tipo === 'AUTOMATICO').length}
                  </p>
                  <p className="text-zinc-400 text-[9px] font-bold uppercase tracking-wider">Automáticos</p>
                </div>
                <div className="text-center">
                  <p className="text-orange-400 text-xs font-bold">
                    {reembolsos.filter(r => r.tipo === 'MANUAL' && r.status === 'APROVADO').length}
                  </p>
                  <p className="text-zinc-400 text-[9px] font-bold uppercase tracking-wider">Manuais OK</p>
                </div>
                <div className="text-center">
                  <p className="text-red-400 text-xs font-bold">
                    {reembolsos.filter(r => r.status === 'REJEITADO').length}
                  </p>
                  <p className="text-zinc-400 text-[9px] font-bold uppercase tracking-wider">Rejeitados</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chargebacks */}
        {chargebacks.length > 0 && (
          <div className="bg-zinc-900/40 border border-red-500/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={13} className="text-red-400 shrink-0" />
                <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest">Chargebacks</p>
              </div>
              <p className="text-red-400 font-black text-sm">{fmtBRL(totalChargebacks)}</p>
            </div>
            <div className="space-y-2">
              {chargebacks.map(cb => {
                const data = new Date(cb.criadoEm).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const statusCls =
                  cb.status === 'ABERTO'
                    ? 'text-red-400 bg-red-500/10 border-red-500/20'
                    : cb.status === 'DEDUZIDO'
                      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                      : 'text-zinc-400 bg-zinc-800/50 border-white/5';
                return (
                  <div key={cb.id} className="bg-red-500/5 border border-red-500/10 rounded-xl p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-zinc-300 text-xs font-bold truncate">{cb.eventoNome}</p>
                        <p className="text-zinc-400 text-[9px] mt-0.5 truncate">
                          {cb.comunidadeNome} · {data}
                        </p>
                        <p className="text-zinc-400 text-[9px] mt-0.5 truncate">Ref: {cb.gatewayRef}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-red-400 font-black text-sm">{fmtBRL(cb.valor)}</p>
                        <span
                          className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${statusCls}`}
                        >
                          {cb.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modo de Taxa por Evento */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Settings2 size={11} className="text-zinc-400" />
            <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest">Gateway por Evento</p>
          </div>
          <div className="space-y-2">
            {allEventos.map(ev => {
              const fees = eventosAdminService.getContractedFees(ev.id);
              const gwRepassar = fees.gatewayMode === 'REPASSAR';
              return (
                <div
                  key={ev.id}
                  className="flex items-center gap-3 px-4 py-3 bg-zinc-900/30 border border-white/5 rounded-xl"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-300 text-[11px] font-bold truncate">{ev.nome}</p>
                    <p className="text-zinc-700 text-[8px] font-black uppercase tracking-widest mt-0.5">
                      Serviço {(fees.feePercent * 100).toFixed(1)}%
                      {fees.feeFixed > 0 ? ` + R$${fees.feeFixed.toFixed(2)}/ing.` : ''}
                      {' · '}
                      {fees.fonte}
                    </p>
                  </div>
                  <span
                    className={`text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-full border shrink-0 ${
                      gwRepassar
                        ? 'text-sky-400 bg-sky-500/10 border-sky-500/20'
                        : 'text-zinc-400 bg-zinc-800/50 border-white/5'
                    }`}
                  >
                    {gwRepassar ? 'GW Cliente' : 'GW Absorvido'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Simulador */}
        <SimuladorGateway />

        {/* Histórico de Saques */}
        {historico.length > 0 && (
          <div>
            <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-3">Histórico</p>
            <div className="space-y-2">
              {[...historico].reverse().map(s => {
                const statusColor =
                  s.status === 'CONCLUIDO'
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    : 'text-red-400 bg-red-500/10 border-red-500/20';
                const data = new Date(s.solicitadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 p-4 bg-zinc-900/30 border border-white/5 rounded-2xl"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-300 font-bold text-sm truncate">{s.produtorNome}</p>
                      <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest">
                        {s.pixTipo} · {data}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-zinc-400 font-black text-sm">{fmtBRL(s.valor)}</p>
                      <p className="text-zinc-700 text-[7px]">Taxa: {fmtBRL(s.valorTaxa)}</p>
                    </div>
                    <span
                      className={`text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-full border shrink-0 ${statusColor}`}
                    >
                      {s.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
