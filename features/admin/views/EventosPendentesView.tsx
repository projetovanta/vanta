import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ClipboardList,
  Check,
  X,
  Clock,
  Image,
  Ticket,
  Banknote,
  Gavel,
  AlertTriangle,
  Info,
  Send,
  Link,
  Percent,
  MessageSquare,
} from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { AdminViewHeader } from '../components/AdminViewHeader';
import { EventoAdmin } from '../../../types';
import { eventosAdminService } from '../services/eventosAdminService';
import { useToast, ToastContainer } from '../../../components/Toast';

// ── Utils ─────────────────────────────────────────────────────────────────────
const formatDateTime = (iso: string): string => {
  try {
    const d = new Date(iso);
    return (
      d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' às ' +
      d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    );
  } catch {
    return iso;
  }
};

// ── Campos apontáveis na rejeição ─────────────────────────────────────────────
// Rejeição/edição inline — checkboxes nos próprios campos da análise

// ── Bloco de Seção ────────────────────────────────────────────────────────────
const SectionBlock: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  borderColor?: string;
}> = ({ icon, title, children, borderColor }) => (
  <div
    className="bg-zinc-900/50 border rounded-2xl p-4 space-y-3"
    style={{ borderColor: borderColor ?? 'rgba(255,255,255,0.05)' }}
  >
    <div className="flex items-center gap-2">
      {icon}
      <p className="text-[0.5625rem] text-zinc-400 font-black uppercase tracking-widest">{title}</p>
    </div>
    {children}
  </div>
);

// ── Campo com checkbox de edição inline ──────────────────────────────────────
const CampoEditavel: React.FC<{
  campoKey: string;
  label: string;
  children: React.ReactNode;
  selecionados: Record<string, string>;
  onToggle: (key: string) => void;
  onComentario: (key: string, val: string) => void;
}> = ({ campoKey, label, children, selecionados, onToggle, onComentario }) => {
  const ativo = campoKey in selecionados;
  return (
    <div className={`rounded-xl transition-all ${ativo ? 'bg-red-500/5 border border-red-500/20 p-2.5' : ''}`}>
      <button type="button" onClick={() => onToggle(campoKey)} className="w-full text-left flex items-start gap-2">
        <span
          className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
            ativo ? 'border-red-500 bg-red-500' : 'border-zinc-700 hover-real:border-zinc-500'
          }`}
        >
          {ativo && <Check size="0.5rem" className="text-white" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-0.5">{label}</p>
          {children}
        </div>
      </button>
      {ativo && (
        <input
          type="text"
          value={selecionados[campoKey]}
          onChange={e => onComentario(campoKey, e.target.value)}
          onClick={e => e.stopPropagation()}
          placeholder="O que precisa mudar..."
          className="w-full mt-2 ml-6 bg-zinc-900/50 border border-red-500/20 rounded-lg px-3 py-1.5 text-[0.6875rem] text-zinc-300 outline-none focus:border-red-500/40 placeholder-zinc-700"
          style={{ width: 'calc(100% - 1.5rem)' }}
        />
      )}
    </div>
  );
};

// ── Detalhe de Evento Pendente (Auditoria) ───────────────────────────────────
const EventoDetalheView: React.FC<{
  evento: EventoAdmin;
  masterUserId: string;
  onBack: () => void;
  onAprovado: () => void;
  onRejeitado: () => void;
}> = ({ evento, masterUserId, onBack, onAprovado, onRejeitado }) => {
  const isSemVenda = evento.vendaVanta === false;

  const [feePercent, setFeePercent] = useState(
    evento.vanta_fee_percent != null ? (evento.vanta_fee_percent * 100).toFixed(1) : '5',
  );
  const [feeFixed, setFeeFixed] = useState(evento.vanta_fee_fixed != null ? evento.vanta_fee_fixed.toFixed(2) : '0');
  const [gatewayMode, setGatewayMode] = useState<'ABSORVER' | 'REPASSAR'>(evento.gateway_fee_mode ?? 'ABSORVER');
  const [taxaProc, setTaxaProc] = useState(
    evento.taxa_processamento_percent != null ? (evento.taxa_processamento_percent * 100).toFixed(1) : '2.5',
  );
  const [taxaPorta, setTaxaPorta] = useState(
    evento.taxa_porta_percent != null ? (evento.taxa_porta_percent * 100).toFixed(1) : feePercent,
  );
  const [taxaMinima, setTaxaMinima] = useState(evento.taxa_minima != null ? evento.taxa_minima.toFixed(2) : '2.00');
  const [taxaFixaEvento, setTaxaFixaEvento] = useState(
    evento.taxa_fixa_evento != null ? evento.taxa_fixa_evento.toFixed(2) : '0',
  );
  const [cotaNomes, setCotaNomes] = useState(evento.cota_nomes_lista?.toString() ?? '500');
  const [taxaNomeExc, setTaxaNomeExc] = useState(
    evento.taxa_nome_excedente != null ? evento.taxa_nome_excedente.toFixed(2) : '0.50',
  );
  const [cotaCortesias, setCotaCortesias] = useState(evento.cota_cortesias?.toString() ?? '50');
  const [taxaCortExc, setTaxaCortExc] = useState(
    evento.taxa_cortesia_excedente_pct != null ? (evento.taxa_cortesia_excedente_pct * 100).toFixed(1) : '5',
  );
  const [prazoPgto, setPrazoPgto] = useState(evento.prazo_pagamento_dias?.toString() ?? '7');

  // Proposta VANTA (sem venda)
  const [comissaoVanta, setComissaoVanta] = useState(evento.comissaoVanta?.toString() ?? '5');
  const [codigoAfiliado, setCodigoAfiliado] = useState(evento.codigoAfiliado ?? '');
  const [propostaMensagem, setPropostaMensagem] = useState(evento.propostaMensagem ?? '');

  const [aprovando, setAprovando] = useState(false);
  const [erroMsg, setErroMsg] = useState('');
  const [camposSelecionados, setCamposSelecionados] = useState<Record<string, string>>({});
  const [motivoRejeicao, setMotivoRejeicao] = useState('');

  const toggleCampoRejeicao = (key: string) => {
    setCamposSelecionados(prev => {
      const next = { ...prev };
      if (key in next) delete next[key];
      else next[key] = '';
      return next;
    });
  };

  const setComentarioCampoRejeicao = (key: string, val: string) => {
    setCamposSelecionados(prev => ({ ...prev, [key]: val }));
  };

  const handleAprovar = async () => {
    setAprovando(true);
    setErroMsg('');
    try {
      if (isSemVenda) {
        // Sem venda: envia proposta VANTA em vez de aprovar direto
        if (!codigoAfiliado.trim()) {
          setErroMsg('Informe o código/link de comissário.');
          setAprovando(false);
          return;
        }
        const ok = await eventosAdminService.enviarPropostaVanta(evento.id, masterUserId, {
          comissao: parseFloat(comissaoVanta) || 0,
          codigoAfiliado: codigoAfiliado.trim(),
          mensagem: propostaMensagem.trim() || undefined,
        });
        if (ok) onAprovado();
        else setErroMsg('Erro ao enviar proposta. Tente novamente.');
      } else {
        await eventosAdminService.aprovarEvento(evento.id, masterUserId, {
          feePercent: parseFloat(feePercent) / 100,
          feeFixed: parseFloat(feeFixed),
          gatewayMode,
          taxaProcessamento: parseFloat(taxaProc) / 100,
          taxaPorta: parseFloat(taxaPorta) / 100,
          taxaMinima: parseFloat(taxaMinima),
          taxaFixaEvento: parseFloat(taxaFixaEvento),
          cotaNomesLista: parseInt(cotaNomes, 10),
          taxaNomeExcedente: parseFloat(taxaNomeExc),
          cotaCortesias: parseInt(cotaCortesias, 10),
          taxaCortesiaExcedentePct: parseFloat(taxaCortExc) / 100,
          prazoPagamentoDias: parseInt(prazoPgto, 10) || null,
        });
        onAprovado();
      }
    } catch (err) {
      console.error('[EventosPendentesView] aprovar/proposta falhou:', err);
      setErroMsg('Erro ao processar. Tente novamente.');
    } finally {
      setAprovando(false);
    }
  };

  const handleRejeitar = async () => {
    setErroMsg('');
    try {
      const temCampos = Object.keys(camposSelecionados).length > 0;
      await eventosAdminService.rejeitarEvento(
        evento.id,
        masterUserId,
        motivoRejeicao,
        temCampos ? camposSelecionados : undefined,
      );
      onRejeitado();
    } catch (err) {
      console.error('[EventosPendentesView] rejeitar falhou:', err);
      setErroMsg('Erro ao rejeitar/solicitar edições. Tente novamente.');
    }
  };

  const todasVariacoes = evento.lotes.flatMap(l => l.variacoes);
  const totalCapacidade = evento.lotes.reduce((s, l) => s + l.limitTotal, 0);

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      {/* Header com foto */}
      <div className="relative shrink-0 h-48">
        {evento.foto ? (
          <img loading="lazy" src={evento.foto} alt={evento.nome} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
            <Image size="2rem" className="text-zinc-800" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/30 to-transparent" />
        <button
          aria-label="Voltar"
          onClick={onBack}
          className="absolute top-8 left-4 w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
        >
          <ArrowLeft size="1.125rem" className="text-white" />
        </button>
        <div className="absolute bottom-4 left-5 right-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[0.4375rem] font-black uppercase tracking-[0.2em] text-amber-400 bg-amber-400/15 border border-amber-400/20 px-2.5 py-1 rounded-full inline-block">
              Aguardando Aprovação
            </span>
            {isSemVenda && (
              <span className="text-[0.4375rem] font-black uppercase tracking-[0.2em] text-blue-400 bg-blue-400/15 border border-blue-400/20 px-2.5 py-1 rounded-full inline-block">
                Sem Venda
              </span>
            )}
          </div>
          <p className="text-white font-bold text-xl leading-tight truncate">{evento.nome}</p>
          <p className="text-zinc-400 text-[0.625rem] mt-1 truncate">
            {evento.comunidade.nome} · {evento.cidade}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-3 max-w-3xl mx-auto w-full">
        {/* 🖼️ 1. Validação de Conteúdo — campos com checkbox inline */}
        <SectionBlock icon={<Image size="0.875rem" className="text-blue-400" />} title="Validação de Conteúdo">
          {Object.keys(camposSelecionados).length > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/15 rounded-xl px-3 py-1.5 mb-1">
              <AlertTriangle size="0.625rem" className="text-amber-400 shrink-0" />
              <p className="text-amber-400 text-[0.5625rem]">
                {Object.keys(camposSelecionados).length} campo(s) selecionado(s) para edição
              </p>
            </div>
          )}
          <div className="space-y-2">
            <CampoEditavel
              campoKey="nome"
              label="Nome do Evento"
              selecionados={camposSelecionados}
              onToggle={toggleCampoRejeicao}
              onComentario={setComentarioCampoRejeicao}
            >
              <p className="text-white text-xs font-bold leading-tight truncate">{evento.nome}</p>
            </CampoEditavel>
            <CampoEditavel
              campoKey="data_inicio"
              label="Data / Hora"
              selecionados={camposSelecionados}
              onToggle={toggleCampoRejeicao}
              onComentario={setComentarioCampoRejeicao}
            >
              <p className="text-white text-xs font-bold leading-tight">{formatDateTime(evento.dataInicio)}</p>
            </CampoEditavel>
            <CampoEditavel
              campoKey="data_fim"
              label="Data de Fim"
              selecionados={camposSelecionados}
              onToggle={toggleCampoRejeicao}
              onComentario={setComentarioCampoRejeicao}
            >
              <p className="text-white text-xs font-bold leading-tight">{formatDateTime(evento.dataFim)}</p>
            </CampoEditavel>
            <CampoEditavel
              campoKey="local"
              label="Local"
              selecionados={camposSelecionados}
              onToggle={toggleCampoRejeicao}
              onComentario={setComentarioCampoRejeicao}
            >
              <p className="text-white text-xs font-bold truncate">{evento.local}</p>
            </CampoEditavel>
            <CampoEditavel
              campoKey="descricao"
              label="Descrição"
              selecionados={camposSelecionados}
              onToggle={toggleCampoRejeicao}
              onComentario={setComentarioCampoRejeicao}
            >
              <p className="text-zinc-400 text-xs leading-relaxed line-clamp-4">{evento.descricao || '—'}</p>
            </CampoEditavel>
            <CampoEditavel
              campoKey="foto"
              label="Foto de Capa"
              selecionados={camposSelecionados}
              onToggle={toggleCampoRejeicao}
              onComentario={setComentarioCampoRejeicao}
            >
              {evento.foto ? (
                <p className="text-emerald-400 text-xs">Foto presente</p>
              ) : (
                <p className="text-amber-400 text-xs">Sem arte de capa</p>
              )}
            </CampoEditavel>
            <CampoEditavel
              campoKey="categoria"
              label="Categoria"
              selecionados={camposSelecionados}
              onToggle={toggleCampoRejeicao}
              onComentario={setComentarioCampoRejeicao}
            >
              <p className="text-white text-xs font-bold truncate">{evento.categoria ?? '—'}</p>
            </CampoEditavel>
            <CampoEditavel
              campoKey="estilos"
              label="Estilos Musicais"
              selecionados={camposSelecionados}
              onToggle={toggleCampoRejeicao}
              onComentario={setComentarioCampoRejeicao}
            >
              <p className="text-white text-xs truncate">{evento.estilos?.join(', ') || '—'}</p>
            </CampoEditavel>
            <CampoEditavel
              campoKey="experiencias"
              label="Experiências"
              selecionados={camposSelecionados}
              onToggle={toggleCampoRejeicao}
              onComentario={setComentarioCampoRejeicao}
            >
              <p className="text-white text-xs truncate">{evento.experiencias?.join(', ') || '—'}</p>
            </CampoEditavel>
          </div>
          <div className="pt-1">
            <p className="text-zinc-700 text-[0.5rem] italic">
              Criador: {evento.criadorNome ?? '—'} · {evento.comunidade.nome}
            </p>
          </div>
        </SectionBlock>

        {/* 🎟️ 2. Configuração de Ingressos (só COM VENDA) */}
        {!isSemVenda && (
          <SectionBlock icon={<Ticket size="0.875rem" className="text-purple-400" />} title="Configuração de Ingressos">
            {evento.lotes.length === 0 ? (
              <div className="flex items-center gap-2 bg-red-500/5 border border-red-500/15 rounded-xl px-3 py-2">
                <AlertTriangle size="0.75rem" className="text-red-400 shrink-0" />
                <p className="text-red-400 text-[0.625rem] font-semibold">Nenhum lote configurado</p>
              </div>
            ) : (
              <div className="space-y-3">
                <CampoEditavel
                  campoKey="lotes"
                  label="Lotes (nome/validade)"
                  selecionados={camposSelecionados}
                  onToggle={toggleCampoRejeicao}
                  onComentario={setComentarioCampoRejeicao}
                >
                  <div className="space-y-1 mt-1">
                    {evento.lotes.map(l => (
                      <p key={l.id} className="text-zinc-300 text-xs">
                        {l.nome} — {l.limitTotal} ingressos
                        {l.dataValidade
                          ? ` (até ${new Date(l.dataValidade).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })})`
                          : ''}
                      </p>
                    ))}
                  </div>
                </CampoEditavel>
                <CampoEditavel
                  campoKey="variacoes"
                  label="Variações (área/gênero/valor/limite)"
                  selecionados={camposSelecionados}
                  onToggle={toggleCampoRejeicao}
                  onComentario={setComentarioCampoRejeicao}
                >
                  <div className="text-zinc-300 text-xs mt-1">
                    {todasVariacoes.length} variações · Capacidade: {totalCapacidade}
                  </div>
                </CampoEditavel>
              </div>
            )}
            {/* Tabela detalhada de variações (somente leitura) */}
            {evento.lotes.length > 0 &&
              evento.lotes.map(lote => (
                <div key={lote.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-zinc-300 text-xs font-bold truncate">{lote.nome}</p>
                    <span
                      className={`text-[0.4375rem] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${lote.ativo ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}
                    >
                      {lote.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="bg-zinc-950/50 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-3 py-1.5 border-b border-white/5">
                      <p className="text-[0.4375rem] text-zinc-700 font-black uppercase tracking-widest">Tipo</p>
                      <p className="text-[0.4375rem] text-zinc-700 font-black uppercase tracking-widest text-right">
                        Preço
                      </p>
                      <p className="text-[0.4375rem] text-zinc-700 font-black uppercase tracking-widest text-right">
                        Qtd
                      </p>
                    </div>
                    {lote.variacoes.map(v => (
                      <div
                        key={v.id}
                        className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-3 py-2 border-b border-white/[0.02] last:border-0"
                      >
                        <p className="text-zinc-300 text-xs truncate">
                          {v.area === 'OUTRO' ? v.areaCustom : v.area} ·{' '}
                          {v.genero === 'MASCULINO' ? 'Masc.' : v.genero === 'FEMININO' ? 'Fem.' : 'Unisex'}
                        </p>
                        <p className="text-white text-xs font-bold text-right tabular-nums">
                          R$ {v.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-zinc-400 text-xs text-right tabular-nums w-12">{v.limite}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </SectionBlock>
        )}

        {/* 🔗 2b. Info Sem Venda */}
        {isSemVenda && (
          <SectionBlock icon={<Link size="0.875rem" className="text-blue-400" />} title="Evento Sem Venda">
            <div className="space-y-2">
              <div className="flex items-start gap-2 bg-blue-500/5 border border-blue-500/15 rounded-xl px-3 py-2">
                <Info size="0.75rem" className="text-blue-400 shrink-0 mt-0.5" />
                <p className="text-zinc-400 text-[0.625rem] leading-relaxed">
                  Este evento vende ingressos fora do VANTA.{' '}
                  {evento.linkExterno && <span className="text-blue-300">Link: {evento.linkExterno}</span>}
                  {evento.plataformaExterna && <span className="text-zinc-400"> · {evento.plataformaExterna}</span>}
                </p>
              </div>
            </div>
          </SectionBlock>
        )}

        {/* 💰 3. Acordo Financeiro (COM VENDA) */}
        {!isSemVenda && (
          <SectionBlock
            icon={<Banknote size="0.875rem" className="text-emerald-400" />}
            title="Acordo Financeiro"
            borderColor="rgba(16,185,129,0.15)"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5 block">
                  Taxa VANTA %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={feePercent}
                    onChange={e => setFeePercent(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-emerald-500/30 pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">%</span>
                </div>
              </div>
              <div>
                <label className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5 block">
                  Taxa Fixa / Ingresso
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={feeFixed}
                    onChange={e => setFeeFixed(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-emerald-500/30 pl-7"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">R$</span>
                </div>
              </div>
            </div>

            {/* Info: taxa VANTA sempre do cliente */}
            <div className="bg-[#FFD300]/5 border border-[#FFD300]/15 rounded-xl px-3 py-2">
              <p className="text-[0.5rem] text-[#FFD300]/70 font-black uppercase tracking-widest">Taxa de Serviço</p>
              <p className="text-zinc-400 text-[0.5625rem] leading-relaxed mt-0.5">
                Sempre cobrada do cliente no checkout.
              </p>
            </div>

            <div>
              <label className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-2 block">
                Quem paga o Gateway?
              </label>
              <div className="flex gap-2">
                {(['ABSORVER', 'REPASSAR'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setGatewayMode(m)}
                    className={`flex-1 py-2.5 rounded-xl text-[0.625rem] font-black uppercase tracking-wider border transition-all ${
                      gatewayMode === m
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-zinc-900/60 border-white/5 text-zinc-400'
                    }`}
                  >
                    {m === 'ABSORVER' ? 'Organizador absorve' : 'Repassa ao cliente'}
                  </button>
                ))}
              </div>
              <div className="flex items-start gap-2 mt-2 bg-zinc-950/50 rounded-xl px-3 py-2">
                <Info size="0.6875rem" className="text-zinc-400 shrink-0 mt-0.5" />
                <p className="text-zinc-400 text-[0.5625rem] leading-relaxed">
                  {gatewayMode === 'ABSORVER'
                    ? 'O custo de processamento é descontado do repasse ao organizador.'
                    : 'O custo de processamento é cobrado do cliente no checkout.'}
                </p>
              </div>
            </div>

            {/* ── Taxas detalhadas ── */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5 block">
                  Processamento %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={taxaProc}
                    onChange={e => setTaxaProc(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-emerald-500/30 pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">%</span>
                </div>
              </div>
              <div>
                <label className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5 block">
                  Taxa Porta %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={taxaPorta}
                    onChange={e => setTaxaPorta(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-emerald-500/30 pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">%</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5 block">
                  Mínimo / Ingresso
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={taxaMinima}
                    onChange={e => setTaxaMinima(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-emerald-500/30 pl-7"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">R$</span>
                </div>
              </div>
              <div>
                <label className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5 block">
                  Fixo Evento
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={taxaFixaEvento}
                    onChange={e => setTaxaFixaEvento(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-emerald-500/30 pl-7"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">R$</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5 block">
                  Cota Nomes Lista
                </label>
                <input
                  type="number"
                  min="0"
                  value={cotaNomes}
                  onChange={e => setCotaNomes(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-emerald-500/30"
                />
              </div>
              <div>
                <label className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5 block">
                  R$ / Nome Excedente
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={taxaNomeExc}
                    onChange={e => setTaxaNomeExc(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-emerald-500/30 pl-7"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">R$</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5 block">
                  Cota Cortesias
                </label>
                <input
                  type="number"
                  min="0"
                  value={cotaCortesias}
                  onChange={e => setCotaCortesias(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-emerald-500/30"
                />
              </div>
              <div>
                <label className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5 block">
                  Cortesia Exc. %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={taxaCortExc}
                    onChange={e => setTaxaCortExc(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-emerald-500/30 pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">%</span>
                </div>
              </div>
            </div>
            <div>
              <label className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5 block">
                Prazo Pagamento (dias pós-evento)
              </label>
              <input
                type="number"
                min="0"
                value={prazoPgto}
                onChange={e => setPrazoPgto(e.target.value)}
                className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-emerald-500/30"
              />
            </div>

            {/* Simulação rápida */}
            {todasVariacoes.length > 0 &&
              (() => {
                const pct = parseFloat(feePercent) / 100 || 0;
                const fix = parseFloat(feeFixed) || 0;
                const exemplar = todasVariacoes[0];
                const taxaServico = exemplar.valor * pct + fix;
                return (
                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-3 py-2.5">
                    <p className="text-[0.5rem] text-emerald-400/60 font-black uppercase tracking-widest mb-1">
                      Simulação
                    </p>
                    <p className="text-zinc-300 text-[0.625rem] leading-relaxed">
                      Ingresso de <span className="text-white font-bold">R$ {exemplar.valor.toFixed(2)}</span> → taxa
                      serviço <span className="text-emerald-400 font-bold">R$ {taxaServico.toFixed(2)}</span> (cliente)
                      · organizador recebe <span className="text-white font-bold">R$ {exemplar.valor.toFixed(2)}</span>
                    </p>
                  </div>
                );
              })()}
          </SectionBlock>
        )}

        {/* 💼 3b. Proposta VANTA (SEM VENDA) */}
        {isSemVenda && (
          <SectionBlock
            icon={<Percent size="0.875rem" className="text-[#FFD300]" />}
            title="Proposta VANTA"
            borderColor="rgba(255,211,0,0.15)"
          >
            <p className="text-zinc-400 text-[0.625rem] leading-relaxed">
              Configure a proposta de afiliado para este evento. O organizador receberá e poderá aceitar, recusar ou
              negociar (até 3 rodadas).
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5 block">
                  Comissão %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={comissaoVanta}
                    onChange={e => setComissaoVanta(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#FFD300]/30 pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">%</span>
                </div>
              </div>
              <div>
                <label className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5 block">
                  Código Afiliado
                </label>
                <input
                  type="text"
                  value={codigoAfiliado}
                  onChange={e => setCodigoAfiliado(e.target.value)}
                  placeholder="VANTA-XYZ..."
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
                />
              </div>
            </div>
            <div>
              <label className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5 block">
                Mensagem ao organizador
              </label>
              <textarea
                value={propostaMensagem}
                onChange={e => setPropostaMensagem(e.target.value)}
                placeholder="Ex: Parceria de divulgação no app. Link de afiliado rastreável..."
                rows={3}
                className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700 resize-none"
              />
            </div>
            <div className="flex items-start gap-2 bg-[#FFD300]/5 border border-[#FFD300]/15 rounded-xl px-3 py-2">
              <MessageSquare size="0.6875rem" className="text-[#FFD300] shrink-0 mt-0.5" />
              <p className="text-zinc-400 text-[0.5625rem] leading-relaxed">
                O organizador poderá aceitar ou negociar em até 3 rodadas. Se recusar todas, o evento é publicado sem
                acordo.
              </p>
            </div>
          </SectionBlock>
        )}
      </div>

      {/* Comentário geral (aparece quando há campos selecionados) */}
      {Object.keys(camposSelecionados).length > 0 && (
        <div className="mx-5 mb-3">
          <textarea
            value={motivoRejeicao}
            onChange={e => setMotivoRejeicao(e.target.value)}
            placeholder="Comentário geral para o organizador (opcional)..."
            rows={2}
            className="w-full bg-zinc-900 border border-red-500/20 rounded-xl px-3 py-2.5 text-white text-xs outline-none focus:border-red-500/30 placeholder-zinc-700 resize-none"
          />
        </div>
      )}

      {/* Ação Final */}
      <div
        className="shrink-0 px-5 pt-3 border-t border-white/5 flex gap-3"
        style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 2rem))' }}
      >
        {Object.keys(camposSelecionados).length > 0 ? (
          <>
            <button
              onClick={() => {
                setCamposSelecionados({});
                setMotivoRejeicao('');
              }}
              className="flex-1 py-4 bg-zinc-900 border border-white/10 text-zinc-400 font-bold text-[0.625rem] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              Limpar
            </button>
            <button
              onClick={handleRejeitar}
              className="flex-1 py-4 bg-amber-500 text-black font-bold text-[0.625rem] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              <Send size="0.875rem" /> Solicitar Edições ({Object.keys(camposSelecionados).length})
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleRejeitar}
              disabled={aprovando}
              className="flex-1 py-4 bg-zinc-900 border border-red-500/20 text-red-400 font-bold text-[0.625rem] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40"
            >
              <X size="0.875rem" /> Rejeitar
            </button>
            <button
              onClick={handleAprovar}
              disabled={aprovando}
              className="flex-1 py-4 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {aprovando ? (
                <Clock size="0.875rem" className="animate-spin" />
              ) : isSemVenda ? (
                <Send size="0.875rem" />
              ) : (
                <Check size="0.875rem" />
              )}
              {aprovando ? (isSemVenda ? 'Enviando...' : 'Aprovando...') : isSemVenda ? 'Enviar Proposta' : 'Aprovar'}
            </button>
          </>
        )}
      </div>

      {erroMsg && (
        <div className="mx-6 mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-red-400 text-xs font-bold text-center">{erroMsg}</p>
        </div>
      )}
    </div>
  );
};

// ── Modal de Rejeição de Edição ──────────────────────────────────────────────
const ModalRejeicaoEdicao: React.FC<{
  eventoNome: string;
  onConfirmar: (motivo: string) => void;
  onCancelar: () => void;
}> = ({ eventoNome, onConfirmar, onCancelar }) => {
  const [motivo, setMotivo] = useState('');
  return (
    <div
      className="absolute inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
      onClick={onCancelar}
    >
      <div
        className="w-full max-w-sm bg-[#111111] border border-white/10 rounded-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-2">
          <p className="text-white font-bold text-base mb-1">Rejeitar edição</p>
          <p className="text-zinc-400 text-sm mb-4">Rejeitar edição de &ldquo;{eventoNome}&rdquo;.</p>
          <textarea
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            placeholder="Motivo da rejeição..."
            rows={4}
            autoFocus
            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-red-500/30 placeholder-zinc-700 resize-none"
          />
        </div>
        <div className="px-6 pt-2 pb-6 flex gap-3">
          <button
            onClick={onCancelar}
            className="flex-1 py-4 bg-zinc-900 border border-white/10 text-zinc-400 font-black text-[0.625rem] uppercase tracking-widest rounded-xl active:scale-95 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => motivo.trim() && onConfirmar(motivo.trim())}
            disabled={!motivo.trim()}
            className="flex-1 py-4 bg-red-500 text-white font-bold text-[0.625rem] uppercase tracking-widest rounded-xl disabled:opacity-40 active:scale-95 transition-all"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

// ── EventosPendentesView ───────────────────────────────────────────────────────
export const EventosPendentesView: React.FC<{
  onBack: () => void;
  masterUserId: string;
}> = ({ onBack, masterUserId }) => {
  const [pendentes, setPendentes] = useState<EventoAdmin[]>(() => eventosAdminService.getEventosPendentes());
  const [edicoesPendentes, setEdicoesPendentes] = useState<EventoAdmin[]>(() =>
    eventosAdminService.getEventos().filter(e => e.edicaoStatus === 'PENDENTE'),
  );
  const [selecionado, setSelecionado] = useState<EventoAdmin | null>(null);
  const [rejeicaoEdicao, setRejeicaoEdicao] = useState<EventoAdmin | null>(null);
  const { toasts, dismiss, toast } = useToast();

  const refreshAll = () => {
    setPendentes(eventosAdminService.getEventosPendentes());
    setEdicoesPendentes(eventosAdminService.getEventos().filter(e => e.edicaoStatus === 'PENDENTE'));
    setSelecionado(null);
  };

  const handleAprovarEdicao = async (ev: EventoAdmin) => {
    try {
      await eventosAdminService.aprovarEdicao(ev.id, masterUserId);
      refreshAll();
      toast('sucesso', `Edição de "${ev.nome}" aprovada`);
    } catch (err) {
      console.error('[EventosPendentesView] aprovarEdicao falhou:', err);
      toast('erro', 'Erro ao aprovar edição');
    }
  };

  const handleRejeitarEdicao = async (ev: EventoAdmin, motivo: string) => {
    try {
      await eventosAdminService.rejeitarEdicao(ev.id, masterUserId, motivo);
      setRejeicaoEdicao(null);
      refreshAll();
      toast('sucesso', `Edição de "${ev.nome}" rejeitada`);
    } catch (err) {
      console.error('[EventosPendentesView] rejeitarEdicao falhou:', err);
      toast('erro', 'Erro ao rejeitar edição');
    }
  };

  // Polling leve para detectar novos pendentes
  useEffect(() => {
    const timer = setInterval(() => {
      setPendentes(eventosAdminService.getEventosPendentes());
      setEdicoesPendentes(eventosAdminService.getEventos().filter(e => e.edicaoStatus === 'PENDENTE'));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  if (selecionado) {
    return (
      <EventoDetalheView
        evento={selecionado}
        masterUserId={masterUserId}
        onBack={() => setSelecionado(null)}
        onAprovado={() => {
          refreshAll();
          toast('sucesso', 'Evento aprovado');
        }}
        onRejeitado={() => {
          refreshAll();
          toast('sucesso', 'Evento rejeitado');
        }}
      />
    );
  }

  return (
    <div className="flex-1 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <AdminViewHeader
        title="Pendentes"
        kicker="Portal Admin"
        onBack={onBack}
        badge={pendentes.length > 0 ? pendentes.length : undefined}
        badgeColor="#f59e0b"
      />

      {/* Lista */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-3">
        {pendentes.length === 0 && (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
              <ClipboardList size="1.75rem" className="text-zinc-700" />
            </div>
            <p className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest text-center">
              Nenhum evento aguardando aprovação.
            </p>
          </div>
        )}

        {pendentes.map(ev => {
          const menorPreco = ev.lotes
            .flatMap(l => l.variacoes.map(v => v.valor))
            .reduce((min, v) => Math.min(min, v), Infinity);
          return (
            <button
              key={ev.id}
              onClick={() => setSelecionado(ev)}
              className="w-full flex gap-4 p-0 bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden text-left active:bg-white/3 transition-all"
            >
              {ev.foto ? (
                <div className="w-24 shrink-0 overflow-hidden">
                  <img loading="lazy" src={ev.foto} alt={ev.nome} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 shrink-0 bg-zinc-800 flex items-center justify-center aspect-square">
                  <Clock size="1.5rem" className="text-zinc-700" />
                </div>
              )}
              <div className="flex-1 min-w-0 py-4 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[0.4375rem] font-black uppercase tracking-widest text-amber-400 bg-amber-400/15 border border-amber-400/20 px-2 py-0.5 rounded-full">
                    Pendente
                  </span>
                  {ev.vendaVanta === false && (
                    <span className="text-[0.4375rem] font-black uppercase tracking-widest text-blue-400 bg-blue-400/15 border border-blue-400/20 px-2 py-0.5 rounded-full">
                      Sem Venda
                    </span>
                  )}
                </div>
                <p className="text-white font-bold text-sm leading-tight truncate mb-0.5">{ev.nome}</p>
                <p className="text-zinc-400 text-[0.625rem] truncate mb-1">
                  {ev.comunidade.nome} · {ev.cidade}
                </p>
                <p className="text-zinc-700 text-[0.5625rem]">{formatDateTime(ev.dataInicio)}</p>
                {menorPreco < Infinity && (
                  <p className="text-[#FFD300] text-[0.625rem] font-black uppercase tracking-widest mt-1">
                    a partir de R$ {menorPreco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                )}
              </div>
            </button>
          );
        })}

        {/* ── 9p: Edições Pendentes ─────────────────────────────────────── */}
        {edicoesPendentes.length > 0 && (
          <>
            <div className="flex items-center gap-2 pt-4 pb-1">
              <Gavel size="0.875rem" className="text-blue-400" />
              <p className="text-[0.5625rem] text-zinc-400 font-black uppercase tracking-widest">Edições Pendentes</p>
              <span className="bg-blue-500 text-white text-[0.5625rem] font-black px-2 py-0.5 rounded-full">
                {edicoesPendentes.length}
              </span>
            </div>
            {edicoesPendentes.map(ev => {
              const campos = ev.edicaoPendente ? Object.keys(ev.edicaoPendente) : [];
              return (
                <div key={`ed-${ev.id}`} className="bg-zinc-900/40 border border-blue-500/15 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[0.4375rem] font-black uppercase tracking-widest text-blue-400 bg-blue-400/15 border border-blue-400/20 px-2 py-0.5 rounded-full">
                      Edição
                    </span>
                    <p className="text-white font-bold text-sm truncate flex-1">{ev.nome}</p>
                  </div>
                  <p className="text-zinc-400 text-[0.625rem] truncate">
                    {ev.comunidade.nome} · {campos.length} campo(s) alterado(s)
                  </p>
                  {campos.length > 0 && (
                    <p className="text-zinc-700 text-[0.5625rem] truncate">Campos: {campos.join(', ')}</p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setRejeicaoEdicao(ev)}
                      className="flex-1 py-2.5 bg-zinc-900 border border-red-500/20 text-red-400 font-bold text-[0.5625rem] uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
                    >
                      <X size="0.75rem" /> Rejeitar
                    </button>
                    <button
                      onClick={() => handleAprovarEdicao(ev)}
                      className="flex-1 py-2.5 bg-blue-500 text-white font-bold text-[0.5625rem] uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
                    >
                      <Check size="0.75rem" /> Aprovar
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Modal rejeição edição */}
      {rejeicaoEdicao && (
        <ModalRejeicaoEdicao
          eventoNome={rejeicaoEdicao.nome}
          onConfirmar={motivo => handleRejeitarEdicao(rejeicaoEdicao, motivo)}
          onCancelar={() => setRejeicaoEdicao(null)}
        />
      )}
    </div>
  );
};
