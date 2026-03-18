import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  ArrowLeft,
  Banknote,
  Clock,
  TrendingUp,
  Check,
  Percent,
  Tag,
  Flag,
  Building2,
  PieChart as PieChartIcon,
  Download,
  FileText,
} from 'lucide-react';
import { exportCSV, exportPDF } from '../../../../utils/exportUtils';
import { TYPOGRAPHY } from '../../../../constants';
import { AdminViewHeader } from '../../components/AdminViewHeader';
import { Notificacao } from '../../../../types';
import { eventosAdminService, ContractedFees, SolicitacaoSaque } from '../../services/eventosAdminService';
import { getResumoFinanceiroComunidade, getResumoFinanceiroEvento } from '../../services/eventosAdminFinanceiro';
import { rbacService } from '../../services/rbacService';
import { useAuthStore } from '../../../../stores/authStore';
import { supabase } from '../../../../services/supabaseClient';
import { VantaPieChart } from '../../components/VantaPieChart';
import { getReembolsosPorEvento, solicitarReembolsoManual } from '../../services/reembolsoService';
import type { Reembolso } from '../../services/eventosAdminTypes';
import { fmtBRL, tsBR } from '../../../../utils';
import { PeriodSelector } from '../../components/dashboard/PeriodSelector';
import type { Periodo } from '../../services/analytics/types';
import { VendasTimelineChart } from '../../../dashboard-v2/VendasTimelineChart';
import { ExtratoFinanceiro } from '../../components/ExtratoFinanceiro';
import {
  dashboardAnalyticsService,
  getDateRanges,
  type VendasTimelinePoint,
} from '../../services/dashboardAnalyticsService';

import { ModalReembolsoManual } from './ModalReembolsoManual';
import { ModalFechamento } from './ModalFechamento';
import { useModalBack } from '../../../../hooks/useModalStack';
import { ModalSaque } from './ModalSaque';
import { ReembolsosSection } from './ReembolsosSection';
import { HistoricoSaques } from './HistoricoSaques';
import { useToast, ToastContainer } from '../../../../components/Toast';

type PixTipo = 'CPF/CNPJ' | 'Email' | 'Celular' | 'Aleatória';
const PIX_TIPOS: PixTipo[] = ['CPF/CNPJ', 'Email', 'Celular', 'Aleatória'];

interface Props {
  onBack: () => void;
  currentUserId: string;
  addNotification: (n: Omit<Notificacao, 'id'>) => void;
  comunidadeId?: string;
  onNavigate?: (view: string) => void;
}

export const FinanceiroView: React.FC<Props> = ({
  onBack,
  currentUserId,
  addNotification,
  comunidadeId,
  onNavigate,
}) => {
  // Polling de versão para re-calcular após mudanças externas (master aprova saque)
  const { toasts, dismiss, toast } = useToast();
  const [svcVersion, setSvcVersion] = useState(() => eventosAdminService.getVersion());
  useEffect(() => {
    const id = setInterval(() => setSvcVersion(eventosAdminService.getVersion()), 2_000);
    return () => clearInterval(id);
  }, []);

  const [pixTipo, setPixTipo] = useState<PixTipo>('Email');
  const [pixChave, setPixChave] = useState('');
  const [pixSaved, setPixSaved] = useState(false);
  const [reembolsos, setReembolsos] = useState<Reembolso[]>([]);
  const [showReembolsoModal, setShowReembolsoModal] = useState(false);
  useModalBack(showReembolsoModal, () => setShowReembolsoModal(false), 'reembolso-modal');
  const [reembolsoMotivo, setReembolsoMotivo] = useState('');
  const [reembolsoLoadingId, setReembolsoLoadingId] = useState<string | null>(null);
  const financialActionRef = useRef(false);

  // Carregar PIX persistido do Supabase
  useEffect(() => {
    if (!currentUserId) return;
    void (async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('pix_tipo, pix_chave')
          .eq('id', currentUserId)
          .maybeSingle();
        if (data?.pix_tipo) setPixTipo(data.pix_tipo as PixTipo);
        if (data?.pix_chave) {
          setPixChave(data.pix_chave as string);
          setPixSaved(true);
        }
      } catch {
        /* silencioso */
      }
    })();
  }, [currentUserId]);
  const [showModal, setShowModal] = useState(false);
  useModalBack(showModal, () => setShowModal(false), 'saque-modal');
  const [valorSaque, setValorSaque] = useState('');
  const [saqueOk, setSaqueOk] = useState(false);
  const [showFechaModal, setShowFechaModal] = useState(false);
  useModalBack(showFechaModal, () => setShowFechaModal(false), 'fechamento-modal');

  const [periodo, setPeriodo] = useState<Periodo>('MES');

  // Taxas efetivas do primeiro evento do produtor (resolvidas no momento de abrir o modal)
  const meusEventos = useMemo(
    () => {
      const [inicio] = getDateRanges(periodo);
      const all = eventosAdminService
        .getEventos()
        .filter(e =>
          rbacService
            .getAtribuicoes(currentUserId)
            .some(a => a.ativo && a.tenant.tipo === 'EVENTO' && a.tenant.id === e.id && a.cargo === 'SOCIO'),
        )
        .filter(e => e.dataInicio >= inicio);
      return comunidadeId ? all.filter(e => e.comunidadeId === comunidadeId) : all;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUserId, svcVersion, comunidadeId, periodo],
  );

  const eventoSaque = meusEventos[0];
  const eventoEncerrado = eventoSaque?.statusEvento === 'FINALIZADO' || eventoSaque?.statusEvento === 'CANCELADO';

  const encerrarEvento = async () => {
    if (!eventoSaque) return;
    const { error } = await supabase
      .from('eventos_admin')
      .update({ status_evento: 'FINALIZADO' })
      .eq('id', eventoSaque.id);
    if (error) {
      console.error('[Financeiro] encerrar evento:', error);
      return;
    }
    await eventosAdminService.refresh();
    setShowFechaModal(false);
  };

  const contractedFees = useMemo(
    (): ContractedFees =>
      eventoSaque
        ? eventosAdminService.getContractedFees(eventoSaque.id)
        : {
            feePercent: 0.05,
            feeFixed: 0,
            gatewayMode: 'ABSORVER',
            fonte: 'padrao',
            taxaProcessamento: 0.025,
            taxaPorta: 0.05,
            taxaMinima: 2,
            taxaFixaEvento: 0,
            quemPagaServico: 'PRODUTOR_ESCOLHE',
            cotaNomesLista: 500,
            taxaNomeExcedente: 0.5,
            cotaCortesias: 50,
            taxaCortesiaExcedentePct: 0.05,
            prazoPagamentoDias: null,
          },
    [eventoSaque],
  );

  // Total de ingressos vendidos no evento para calcular taxa fixa
  const totalIngressosEvento = useMemo(
    () => eventoSaque?.lotes.flatMap(l => l.variacoes).reduce((s, v) => s + v.vendidos, 0) ?? 0,
    [eventoSaque],
  );

  const produtorNome = useMemo(() => eventosAdminService.getNomeById(currentUserId), [currentUserId]);

  // Detecta se o usuário é GE-E (SOCIO num evento) ou GG-C (GERENTE numa comunidade)
  const isGEE = useMemo(
    () =>
      rbacService.getAtribuicoes(currentUserId).some(a => a.ativo && a.tenant.tipo === 'EVENTO' && a.cargo === 'SOCIO'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUserId, svcVersion],
  );

  const isGGC = useMemo(
    () =>
      rbacService
        .getAtribuicoes(currentUserId)
        .some(a => a.ativo && a.tenant.tipo === 'COMUNIDADE' && a.cargo === 'GERENTE'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUserId, svcVersion],
  );

  const currentAccount = useAuthStore(s => s.currentAccount);
  const reembolsoRole = useMemo(() => {
    if (currentAccount?.role === 'vanta_masteradm') return 'MASTER';
    if (isGGC) return 'GERENTE';
    if (isGEE) return 'SOCIO';
    return 'SOCIO';
  }, [currentAccount, isGEE, isGGC]);

  // Saldo consolidado GG-C — usa getResumoFinanceiroComunidade para dados corretos
  const [saldoConsolidado, setSaldoConsolidado] = useState<{
    totalBruto: number;
    totalLiquido: number;
    totalEventos: number;
    detalhe: { nome: string; liquido: number }[];
  } | null>(null);
  useEffect(() => {
    if (!isGGC) {
      setSaldoConsolidado(null);
      return;
    }
    const comunidades = rbacService
      .getAtribuicoes(currentUserId)
      .filter(a => a.ativo && a.tenant.tipo === 'COMUNIDADE' && a.cargo === 'GERENTE')
      .map(a => a.tenant.id);
    let cancelled = false;
    (async () => {
      let totalBruto = 0;
      let totalLiquido = 0;
      let totalEventos = 0;
      const detalhe: { nome: string; liquido: number }[] = [];
      for (const comId of comunidades) {
        const resumo = await getResumoFinanceiroComunidade(comId);
        const eventos = eventosAdminService.getEventos().filter(e => e.comunidadeId === comId);
        for (const ev of eventos) {
          const evResumo = await getResumoFinanceiroEvento(ev.id);
          totalEventos++;
          detalhe.push({ nome: ev.nome, liquido: evResumo.receitaLiquida });
        }
        totalBruto += resumo.receitaBruta;
        totalLiquido += resumo.receitaLiquida;
      }
      if (!cancelled) setSaldoConsolidado({ totalBruto, totalLiquido, totalEventos, detalhe });
    })();
    return () => {
      cancelled = true;
    };
  }, [currentUserId, svcVersion, isGGC]);

  const [saldo, setSaldo] = useState({ totalVendas: 0, saldoDisponivel: 0, aReceber: 0, saquesProcessados: 0 });
  const [timeline, setTimeline] = useState<VendasTimelinePoint[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setTimelineLoading(true);
    dashboardAnalyticsService
      .getVendasTimeline(periodo, comunidadeId)
      .then(d => {
        if (!cancelled) {
          setTimeline(d);
          setTimelineLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setTimelineLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [periodo, comunidadeId]);
  useEffect(() => {
    eventosAdminService
      .getSaldoFinanceiro(currentUserId)
      .then(setSaldo)
      .catch(() => {});
  }, [currentUserId, svcVersion]);

  const [historico, setHistorico] = useState<SolicitacaoSaque[]>([]);
  useEffect(() => {
    eventosAdminService
      .getSaquesByProdutor(currentUserId)
      .then(setHistorico)
      .catch(() => {});
  }, [currentUserId, svcVersion]);

  // Carregar reembolsos do evento ativo
  useEffect(() => {
    if (!eventoSaque) return;
    getReembolsosPorEvento(eventoSaque.id)
      .then(setReembolsos)
      .catch(() => {});
  }, [eventoSaque, svcVersion]);

  // ── KPIs de Performance ───────────────────────────────────────────────────
  const totalIngressosTodos = useMemo(
    () => meusEventos.flatMap(ev => ev.lotes.flatMap(l => l.variacoes)).reduce((s, v) => s + v.vendidos, 0),
    [meusEventos],
  );
  const ticketMedio = totalIngressosTodos > 0 ? Math.round((saldo.totalVendas / totalIngressosTodos) * 100) / 100 : 0;
  // Taxa VANTA calculada via service (já desconta reembolsos/chargebacks)
  const [receitaVanta, setReceitaVanta] = useState(0);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let total = 0;
      for (const ev of meusEventos) {
        const resumo = await getResumoFinanceiroEvento(ev.id);
        total += resumo.taxaVanta;
      }
      if (!cancelled) setReceitaVanta(Math.round(total * 100) / 100);
    })();
    return () => {
      cancelled = true;
    };
  }, [meusEventos, svcVersion]);

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExportCSV = useCallback(() => {
    const headers = ['Evento', 'Receita Bruta', 'Taxa Serviço (cliente)', 'Modo Gateway'];
    const rows = meusEventos.map(ev => {
      const fees = eventosAdminService.getContractedFees(ev.id);
      const bruto = ev.lotes.flatMap(l => l.variacoes).reduce((s, v) => s + v.vendidos * v.valor, 0);
      const taxa = Math.round(bruto * fees.feePercent * 100) / 100;
      return [ev.nome, fmtBRL(bruto), fmtBRL(taxa), fees.gatewayMode];
    });
    exportCSV('financeiro_produtor', headers, rows);
  }, [meusEventos]);

  const handleExportPDF = useCallback(() => {
    const headers = ['Evento', 'Receita Bruta', 'Taxa (cliente)', 'Gateway'];
    const rows = meusEventos.map(ev => {
      const fees = eventosAdminService.getContractedFees(ev.id);
      const bruto = ev.lotes.flatMap(l => l.variacoes).reduce((s, v) => s + v.vendidos * v.valor, 0);
      const taxa = Math.round(bruto * fees.feePercent * 100) / 100;
      return [ev.nome, fmtBRL(bruto), fmtBRL(taxa), fees.gatewayMode];
    });
    void exportPDF({
      titulo: 'Relatório Financeiro — Produtor',
      headers,
      rows,
      resumo: [
        { label: 'Total Vendas', valor: fmtBRL(saldo.totalVendas) },
        { label: 'Saldo Disponível', valor: fmtBRL(saldo.saldoDisponivel) },
        { label: 'Ticket Médio', valor: fmtBRL(ticketMedio) },
      ],
    });
  }, [meusEventos, saldo, ticketMedio]);

  // Dados de fechamento para GE-E
  const checkinsEvento = useMemo(
    () => (eventoSaque ? eventosAdminService.getCheckinsIngresso(eventoSaque.id) : 0),
    [eventoSaque],
  );
  const receitaBrutaEvento = useMemo(
    () => (eventoSaque ? eventoSaque.lotes.flatMap(l => l.variacoes).reduce((s, v) => s + v.vendidos * v.valor, 0) : 0),
    [eventoSaque],
  );
  // Taxa VANTA sempre do cliente — produtor recebe bruto integral
  const saldoTransferir = useMemo(() => {
    if (!eventoSaque) return 0;
    return receitaBrutaEvento;
  }, [eventoSaque, receitaBrutaEvento]);

  const valorNum = parseFloat(valorSaque.replace(',', '.')) || 0;
  const valorMax = saldo.saldoDisponivel;
  const podeConfirmar = valorNum > 0 && valorNum <= valorMax && pixChave.trim().length >= 3;

  // Taxa de serviço VANTA = informativa (sempre cobrada do cliente, não sai do produtor)
  const taxaPercentValor = valorNum > 0 ? Math.round(valorNum * contractedFees.feePercent * 100) / 100 : 0;
  const taxaFixaValor = valorNum > 0 ? Math.round(contractedFees.feeFixed * totalIngressosEvento * 100) / 100 : 0;
  const totalTaxaValor = Math.round((taxaPercentValor + taxaFixaValor) * 100) / 100;
  // Produtor recebe bruto integral (taxa VANTA é do cliente)
  const liquidoValor = valorNum;

  const confirmarSaque = async () => {
    if (!podeConfirmar || financialActionRef.current) return;
    financialActionRef.current = true;
    try {
      await eventosAdminService.solicitarSaque({
        produtorId: currentUserId,
        produtorNome,
        eventoId: eventoSaque?.id ?? '',
        eventoNome: eventoSaque?.nome ?? 'Evento',
        valor: valorNum,
        pixTipo,
        pixChave,
      });
      addNotification({
        titulo: 'Saque Solicitado',
        mensagem: `Pedido de ${fmtBRL(valorNum)} enviado ao Master Admin. Processamento em até 2 dias úteis.`,
        tipo: 'SISTEMA',
        lida: false,
        link: '',
        timestamp: tsBR(),
      });
      setShowModal(false);
      setSaqueOk(true);
      setValorSaque('');
      setTimeout(() => setSaqueOk(false), 4000);
    } finally {
      financialActionRef.current = false;
    }
  };

  const solicitarReembolsoManualHandler = async (ticketId: string) => {
    if (!eventoSaque || !reembolsoMotivo.trim()) return;
    setReembolsoLoadingId(ticketId);
    try {
      const result = await solicitarReembolsoManual(ticketId, eventoSaque.id, reembolsoMotivo, currentUserId);
      if (result.success) {
        addNotification({
          titulo: 'Reembolso Manual Solicitado',
          mensagem: `Solicitação criada e aguardando aprovação.`,
          tipo: 'SISTEMA',
          lida: false,
          link: '',
          timestamp: tsBR(),
        });
        setReembolsoMotivo('');
        setShowReembolsoModal(false);
        // Recarregar reembolsos
        getReembolsosPorEvento(eventoSaque.id).then(setReembolsos);
      } else {
        addNotification({
          titulo: 'Erro ao Solicitar Reembolso',
          mensagem: result.error || 'Erro desconhecido',
          tipo: 'ERRO',
          lida: false,
          link: '',
          timestamp: tsBR(),
        });
      }
    } catch (e) {
      addNotification({
        titulo: 'Erro ao Solicitar Reembolso',
        mensagem: 'Erro ao processar solicitação',
        tipo: 'ERRO',
        lida: false,
        link: '',
        timestamp: tsBR(),
      });
    }
    setReembolsoLoadingId(null);
  };

  const aprovarReembolsoHandler = async (reembolsoId: string) => {
    if (!eventoSaque || financialActionRef.current) return;
    financialActionRef.current = true;
    setReembolsoLoadingId(reembolsoId);
    try {
      const { aprovarReembolsoEtapa } = await import('../../services/reembolsoService');
      const result = await aprovarReembolsoEtapa(reembolsoId, currentUserId);
      if (result.success) {
        addNotification({
          titulo: 'Reembolso Aprovado',
          mensagem: `Reembolso aprovado com sucesso. Email enviado.`,
          tipo: 'SISTEMA',
          lida: false,
          link: '',
          timestamp: tsBR(),
        });
        // Recarregar reembolsos
        getReembolsosPorEvento(eventoSaque.id).then(setReembolsos);
      } else {
        addNotification({
          titulo: 'Erro ao Aprovar Reembolso',
          mensagem: result.error || 'Erro desconhecido',
          tipo: 'ERRO',
          lida: false,
          link: '',
          timestamp: tsBR(),
        });
      }
    } catch (e) {
      addNotification({
        titulo: 'Erro ao Aprovar Reembolso',
        mensagem: 'Erro ao processar',
        tipo: 'ERRO',
        lida: false,
        link: '',
        timestamp: tsBR(),
      });
    } finally {
      financialActionRef.current = false;
    }
    setReembolsoLoadingId(null);
  };

  const rejeitarReembolsoHandler = async (reembolsoId: string) => {
    if (!eventoSaque || financialActionRef.current) return;
    financialActionRef.current = true;
    setReembolsoLoadingId(reembolsoId);
    try {
      const { rejeitarReembolsoManual } = await import('../../services/reembolsoService');
      const result = await rejeitarReembolsoManual(reembolsoId, currentUserId, 'Rejeitado pelo produtor');
      if (result.success) {
        addNotification({
          titulo: 'Reembolso Rejeitado',
          mensagem: `Reembolso rejeitado. Email enviado ao solicitante.`,
          tipo: 'SISTEMA',
          lida: false,
          link: '',
          timestamp: tsBR(),
        });
        // Recarregar reembolsos
        getReembolsosPorEvento(eventoSaque.id).then(setReembolsos);
      } else {
        addNotification({
          titulo: 'Erro ao Rejeitar Reembolso',
          mensagem: result.error || 'Erro desconhecido',
          tipo: 'ERRO',
          lida: false,
          link: '',
          timestamp: tsBR(),
        });
      }
    } catch (e) {
      addNotification({
        titulo: 'Erro ao Rejeitar Reembolso',
        mensagem: 'Erro ao processar',
        tipo: 'ERRO',
        lida: false,
        link: '',
        timestamp: tsBR(),
      });
    } finally {
      financialActionRef.current = false;
    }
    setReembolsoLoadingId(null);
  };

  return (
    <div className="flex-1 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <AdminViewHeader
        title="Finanças"
        kicker="Produtor"
        onBack={onBack}
        breadcrumbs={[{ label: 'Dashboard', onClick: onBack }, { label: 'Finanças' }]}
        actions={[
          { icon: Clock, label: 'Histórico', onClick: () => onNavigate?.('AUDIT_LOG') },
          { icon: Download, label: 'CSV', onClick: handleExportCSV },
          { icon: FileText, label: 'PDF', onClick: handleExportPDF },
        ]}
      />

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-5 max-w-3xl mx-auto w-full">
        {/* Seletor de período */}
        <PeriodSelector value={periodo} onChange={setPeriodo} />

        {/* Evolução de vendas */}
        <VendasTimelineChart data={timeline} loading={timelineLoading} />

        {/* Extrato detalhado */}
        <ExtratoFinanceiro eventoIds={meusEventos.map(e => e.id)} comunidadeId={comunidadeId} />

        {/* Banner de sucesso */}
        {saqueOk && (
          <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl animate-in slide-in-from-top duration-300">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Check size="0.875rem" className="text-emerald-400" />
            </div>
            <p className="text-emerald-300 text-xs font-bold flex-1 min-w-0">
              Saque solicitado com sucesso! Processamento em até 2 dias úteis.
            </p>
          </div>
        )}

        {/* Cards de saldo */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4">
            <div className="w-9 h-9 rounded-xl bg-[#FFD300]/10 border border-[#FFD300]/20 flex items-center justify-center mb-3">
              <Banknote size="1rem" className="text-[#FFD300]" />
            </div>
            <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-1">Saldo Disponível</p>
            <p className="text-white font-black text-lg leading-none">{fmtBRL(saldo.saldoDisponivel)}</p>
          </div>
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
              <Clock size="1rem" className="text-amber-400" />
            </div>
            <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-1">A Receber</p>
            <p className="text-amber-300 font-black text-lg leading-none">{fmtBRL(saldo.aReceber)}</p>
          </div>
        </div>

        {/* ── Saldo Consolidado GG-C ───────────────────────────────────────────── */}
        {isGGC && saldoConsolidado && saldoConsolidado.totalEventos > 0 && (
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Building2 size="0.75rem" className="text-purple-400 shrink-0" />
              <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">
                Saldo Consolidado — Comunidade
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-0.5">
                <p className="text-[0.5rem] text-zinc-700 font-black uppercase tracking-widest">Receita Bruta</p>
                <p className="text-white font-black text-base leading-none">{fmtBRL(saldoConsolidado.totalBruto)}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[0.5rem] text-zinc-700 font-black uppercase tracking-widest">Líquido Total</p>
                <p className="text-emerald-400 font-black text-base leading-none">
                  {fmtBRL(saldoConsolidado.totalLiquido)}
                </p>
              </div>
            </div>
            {saldoConsolidado.detalhe.length > 1 && (
              <div className="space-y-3 pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <PieChartIcon size="0.6875rem" className="text-purple-400" />
                  <p className="text-[0.5rem] text-zinc-700 font-black uppercase tracking-widest">Receita por Evento</p>
                </div>
                <VantaPieChart
                  data={saldoConsolidado.detalhe
                    .filter(d => d.liquido > 0)
                    .map((d, i) => ({
                      name: d.nome,
                      value: d.liquido,
                      color: ['#a78bfa', '#10b981', '#3b82f6', '#f59e0b', '#f472b6', '#FFD300', '#ef4444', '#6366f1'][
                        i % 8
                      ],
                    }))}
                  formatValue={fmtBRL}
                  height={150}
                />
              </div>
            )}
            {saldoConsolidado.totalEventos === 0 && (
              <p className="text-zinc-700 text-[0.625rem] font-black uppercase tracking-widest">
                Nenhum evento autorizado ainda.
              </p>
            )}
          </div>
        )}

        {/* ── KPIs de Performance ─────────────────────────────────────────── */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
          <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">Performance</p>

          {/* Receita Vanta + Ticket Médio */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Percent size="0.625rem" className="text-[#FFD300] shrink-0" />
                <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest truncate">
                  Receita Vanta
                </p>
              </div>
              <p className="text-[#FFD300] font-black text-base leading-none">{fmtBRL(receitaVanta)}</p>
              <p className="text-zinc-700 text-[0.5rem]">taxas sobre vendas</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Tag size="0.625rem" className="text-zinc-400 shrink-0" />
                <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest truncate">
                  Ticket Médio
                </p>
              </div>
              <p className="text-zinc-300 font-black text-base leading-none">{fmtBRL(ticketMedio)}</p>
              <p className="text-zinc-700 text-[0.5rem]">{totalIngressosTodos} ingressos</p>
            </div>
          </div>
        </div>

        {/* Total bruto + selo de modo de taxa */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/20 border border-white/5 rounded-xl">
          <div className="flex items-center gap-2">
            <TrendingUp size="0.8125rem" className="text-zinc-400" />
            <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest">Total Bruto de Vendas</p>
          </div>
          <p className="text-zinc-400 text-sm font-bold">{fmtBRL(saldo.totalVendas)}</p>
        </div>

        {/* Selo do modo de taxa contratado */}
        {eventoSaque && (
          <>
            {/* Selo taxa serviço */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-[#FFD300]/5 border-[#FFD300]/15">
              <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#FFD300]" />
              <p className="text-[0.5625rem] font-black uppercase tracking-wider text-[#FFD300]/70">
                Taxa Serviço: Sempre no checkout
              </p>
            </div>
            {/* Selo gateway */}
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                contractedFees.gatewayMode === 'REPASSAR'
                  ? 'bg-sky-500/10 border-sky-500/20'
                  : 'bg-zinc-900/30 border-white/5'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  contractedFees.gatewayMode === 'REPASSAR' ? 'bg-sky-400' : 'bg-zinc-600'
                }`}
              />
              <p
                className={`text-[0.5625rem] font-black uppercase tracking-wider ${
                  contractedFees.gatewayMode === 'REPASSAR' ? 'text-sky-400' : 'text-zinc-400'
                }`}
              >
                Gateway: {contractedFees.gatewayMode === 'REPASSAR' ? 'Cliente paga' : 'Organizador absorve'}
              </p>
            </div>
          </>
        )}

        {/* Dados para recebimento */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
          <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">Dados para Recebimento</p>

          <div className="space-y-1.5">
            <p className="text-[0.5rem] text-zinc-700 font-black uppercase tracking-widest">Tipo de Chave PIX</p>
            <div className="grid grid-cols-2 gap-1.5">
              {PIX_TIPOS.map(tipo => (
                <button
                  key={tipo}
                  onClick={() => {
                    setPixTipo(tipo);
                    setPixSaved(false);
                  }}
                  className={`py-2.5 rounded-xl text-[0.5625rem] font-black uppercase tracking-wider transition-all border ${
                    pixTipo === tipo
                      ? 'bg-[#FFD300]/10 border-[#FFD300]/30 text-[#FFD300]'
                      : 'bg-zinc-900/40 border-white/5 text-zinc-400 active:border-white/20'
                  }`}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[0.5rem] text-zinc-700 font-black uppercase tracking-widest">Chave PIX</p>
            <input
              value={pixChave}
              onChange={e => {
                setPixChave(e.target.value);
                setPixSaved(false);
              }}
              placeholder={
                pixTipo === 'Email'
                  ? 'seu@email.com'
                  : pixTipo === 'Celular'
                    ? '(11) 99999-9999'
                    : pixTipo === 'CPF/CNPJ'
                      ? '000.000.000-00'
                      : 'Chave aleatória UUID...'
              }
              className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
            />
          </div>

          <button
            onClick={() => {
              setPixSaved(true);
              void supabase
                .from('profiles')
                .update({ pix_tipo: pixTipo, pix_chave: pixChave.trim() })
                .eq('id', currentUserId)
                .then(({ error }) => {
                  if (error) console.error('[Financeiro] salvar PIX:', error);
                });
            }}
            disabled={pixChave.trim().length < 3}
            className="w-full py-3 bg-zinc-800 border border-white/5 rounded-xl text-[0.5625rem] font-black uppercase tracking-widest text-zinc-400 active:text-white active:bg-zinc-700 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
          >
            {pixSaved ? (
              <>
                <Check size="0.75rem" className="text-emerald-400" />
                <span className="text-emerald-400">Salvo</span>
              </>
            ) : (
              'Salvar Dados'
            )}
          </button>
        </div>

        {/* ── Fechamento de Evento (GE-E) ─────────────────────────────────────── */}
        {isGEE &&
          eventoSaque &&
          (eventoEncerrado ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Check size="0.875rem" className="text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-emerald-300 text-xs font-bold leading-none mb-0.5">Evento encerrado</p>
                  <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest">
                    {eventoSaque.nome}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(true)}
                disabled={saldo.saldoDisponivel <= 0 || pixChave.trim().length < 3}
                className="w-full py-3 rounded-2xl font-black text-[0.625rem] uppercase tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none border border-emerald-500/20 text-emerald-400"
                style={{ background: 'rgba(16,185,129,0.08)' }}
              >
                Solicitar Saque para Comunidade
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowFechaModal(true)}
              className="w-full py-4 rounded-2xl font-black text-[0.625rem] uppercase tracking-[0.25em] transition-all active:scale-[0.98] flex items-center justify-center gap-2 border border-white/10 text-white/70"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <Flag size="0.875rem" className="text-white/40" /> Fechar Evento
            </button>
          ))}

        {/* Botão saque (não-GEE ou sem evento) */}
        {!isGEE && (
          <button
            onClick={() => setShowModal(true)}
            disabled={saldo.saldoDisponivel <= 0 || pixChave.trim().length < 3}
            className="w-full py-4 rounded-2xl font-black text-[0.625rem] uppercase tracking-[0.25em] transition-all active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', color: '#fff' }}
          >
            Solicitar Saque
          </button>
        )}

        {/* Histórico */}
        <HistoricoSaques historico={historico} />

        {/* ═══ Reembolsos ═══ */}
        {isGEE && eventoSaque && (
          <ReembolsosSection
            reembolsos={reembolsos}
            onAprovar={aprovarReembolsoHandler}
            onRejeitar={rejeitarReembolsoHandler}
            onSolicitarManual={() => setShowReembolsoModal(true)}
            currentUserRole={reembolsoRole}
          />
        )}
      </div>

      {/* Modais extraídos */}
      {showReembolsoModal && eventoSaque && (
        <ModalReembolsoManual
          eventoNome={eventoSaque.nome}
          reembolsoMotivo={reembolsoMotivo}
          setReembolsoMotivo={setReembolsoMotivo}
          onClose={() => setShowReembolsoModal(false)}
          onSolicitar={() => {
            if (reembolsoMotivo.trim()) {
              solicitarReembolsoManualHandler(eventoSaque.id);
            }
          }}
          loading={reembolsoLoadingId !== null}
        />
      )}

      {showFechaModal && eventoSaque && (
        <ModalFechamento
          eventoNome={eventoSaque.nome}
          checkinsEvento={checkinsEvento}
          receitaBrutaEvento={receitaBrutaEvento}
          saldoTransferir={saldoTransferir}
          onClose={() => setShowFechaModal(false)}
          onEncerrar={encerrarEvento}
        />
      )}

      {showModal && (
        <ModalSaque
          valorSaque={valorSaque}
          setValorSaque={setValorSaque}
          valorMax={valorMax}
          valorNum={valorNum}
          podeConfirmar={podeConfirmar}
          pixTipo={pixTipo}
          pixChave={pixChave}
          contractedFees={contractedFees}
          totalIngressosEvento={totalIngressosEvento}
          taxaPercentValor={taxaPercentValor}
          taxaFixaValor={taxaFixaValor}
          liquidoValor={liquidoValor}
          onClose={() => setShowModal(false)}
          onConfirmar={confirmarSaque}
        />
      )}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};
