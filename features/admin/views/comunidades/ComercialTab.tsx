/**
 * ComercialTab — Aba "Comercial" dentro do detalhe da comunidade.
 * Master define condições, vê status de aceite e histórico.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Send,
  Check,
  Clock,
  X,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Banknote,
  Users,
  Star,
  Shield,
  ListChecks,
} from 'lucide-react';
import { condicoesService, type DefinirCondicoesInput } from '../../services/condicoesService';
import type { CondicaoComercial, Comunidade } from '../../../../types/eventos';
import { useAuthStore } from '../../../../stores/authStore';

// ── Helpers ─────────────────────────────────────────────────────────────────

const pct = (v: number | null | undefined) => (v != null ? `${(v * 100).toFixed(1)}%` : '—');
const moeda = (v: number | null | undefined) => (v != null ? `R$ ${v.toFixed(2)}` : '—');
const num = (v: number | null | undefined) => (v != null ? String(v) : '—');

const STATUS_MAP: Record<string, { label: string; color: string; icon: typeof Check }> = {
  SEM_CONDICOES: { label: 'Sem condições', color: 'text-zinc-500', icon: AlertCircle },
  PENDENTE: { label: 'Aguardando aceite', color: 'text-amber-400', icon: Clock },
  ACEITO: { label: 'Aceito', color: 'text-emerald-400', icon: Check },
  EXPIRADO: { label: 'Expirado', color: 'text-red-400', icon: X },
  RECUSADO: { label: 'Recusado', color: 'text-red-400', icon: X },
  PAUSADO: { label: 'Pausado', color: 'text-red-400', icon: AlertCircle },
};

// ── Formulário inline ───────────────────────────────────────────────────────

interface FeeField {
  key: keyof DefinirCondicoesInput;
  label: string;
  icon: typeof Banknote;
  format: 'percent' | 'money' | 'number';
  placeholder: string;
}

const FIELDS: FeeField[] = [
  { key: 'taxaServicoPercent', label: 'Taxa Serviço', icon: Banknote, format: 'percent', placeholder: '10' },
  { key: 'taxaProcessamentoPercent', label: 'Taxa Processamento', icon: Shield, format: 'percent', placeholder: '2.5' },
  { key: 'taxaPortaPercent', label: 'Taxa Porta', icon: Shield, format: 'percent', placeholder: '0' },
  { key: 'taxaMinima', label: 'Mínimo/ingresso', icon: Banknote, format: 'money', placeholder: '2.00' },
  { key: 'taxaFixaEvento', label: 'Taxa Fixa/evento', icon: Banknote, format: 'money', placeholder: '0' },
  { key: 'cotaNomesLista', label: 'Nomes grátis na lista', icon: ListChecks, format: 'number', placeholder: '500' },
  { key: 'taxaNomeExcedente', label: 'R$/nome excedente', icon: Users, format: 'money', placeholder: '0.50' },
  { key: 'cotaCortesias', label: 'Cortesias grátis', icon: Star, format: 'number', placeholder: '50' },
  { key: 'taxaCortesiaExcedentePct', label: '% cortesia excedente', icon: Star, format: 'percent', placeholder: '5' },
  { key: 'prazoPagamentoDias', label: 'Prazo pagamento (dias)', icon: Clock, format: 'number', placeholder: '15' },
];

// ── Componente ──────────────────────────────────────────────────────────────

interface Props {
  comunidade: Comunidade;
  onToast: (msg: string) => void;
}

export const ComercialTab: React.FC<Props> = ({ comunidade, onToast }) => {
  const currentUserId = useAuthStore(s => s.currentAccount.id);
  const [historico, setHistorico] = useState<CondicaoComercial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);
  const [obs, setObs] = useState('');

  // Form state — inicializa com taxas atuais da comunidade
  const [form, setForm] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    init.taxaServicoPercent = comunidade.vanta_fee_percent != null ? String(comunidade.vanta_fee_percent * 100) : '';
    init.taxaProcessamentoPercent =
      comunidade.taxa_processamento_percent != null ? String(comunidade.taxa_processamento_percent * 100) : '';
    init.taxaPortaPercent = comunidade.taxa_porta_percent != null ? String(comunidade.taxa_porta_percent * 100) : '';
    init.taxaMinima = comunidade.taxa_minima != null ? String(comunidade.taxa_minima) : '';
    init.taxaFixaEvento = '';
    init.cotaNomesLista = comunidade.cota_nomes_lista != null ? String(comunidade.cota_nomes_lista) : '';
    init.taxaNomeExcedente = comunidade.taxa_nome_excedente != null ? String(comunidade.taxa_nome_excedente) : '';
    init.cotaCortesias = comunidade.cota_cortesias != null ? String(comunidade.cota_cortesias) : '';
    init.taxaCortesiaExcedentePct =
      comunidade.taxa_cortesia_excedente_pct != null ? String(comunidade.taxa_cortesia_excedente_pct * 100) : '';
    init.prazoPagamentoDias = '';
    return init;
  });

  const loadHistorico = useCallback(async () => {
    setLoading(true);
    const h = await condicoesService.getHistorico(comunidade.id);
    setHistorico(h);
    setLoading(false);
  }, [comunidade.id]);

  useEffect(() => {
    loadHistorico();
  }, [loadHistorico]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const input: DefinirCondicoesInput = {};
      const v = (key: string) => {
        const raw = form[key];
        if (!raw || raw.trim() === '') return undefined;
        return parseFloat(raw);
      };
      // Percentuais: converter de display (10%) pra decimal (0.10)
      const taxaServico = v('taxaServicoPercent');
      if (taxaServico != null) input.taxaServicoPercent = taxaServico / 100;
      const taxaProc = v('taxaProcessamentoPercent');
      if (taxaProc != null) input.taxaProcessamentoPercent = taxaProc / 100;
      const taxaPorta = v('taxaPortaPercent');
      if (taxaPorta != null) input.taxaPortaPercent = taxaPorta / 100;
      const taxaCortExc = v('taxaCortesiaExcedentePct');
      if (taxaCortExc != null) input.taxaCortesiaExcedentePct = taxaCortExc / 100;

      // Valores diretos
      const txMin = v('taxaMinima');
      if (txMin != null) input.taxaMinima = txMin;
      const txFixa = v('taxaFixaEvento');
      if (txFixa != null) input.taxaFixaEvento = txFixa;
      const cotaN = v('cotaNomesLista');
      if (cotaN != null) input.cotaNomesLista = cotaN;
      const txNome = v('taxaNomeExcedente');
      if (txNome != null) input.taxaNomeExcedente = txNome;
      const cotaC = v('cotaCortesias');
      if (cotaC != null) input.cotaCortesias = cotaC;
      const prazo = v('prazoPagamentoDias');
      if (prazo != null) input.prazoPagamentoDias = prazo;

      await condicoesService.definirCondicoes(comunidade.id, input, currentUserId, obs || undefined);
      onToast('Condições definidas — aguardando aceite do responsável');
      setObs('');
      await loadHistorico();
    } catch (err) {
      onToast(`Erro: ${err instanceof Error ? err.message : 'desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  const status = comunidade.condicoes_status ?? 'SEM_CONDICOES';
  const statusInfo = STATUS_MAP[status] ?? STATUS_MAP.SEM_CONDICOES;
  const StatusIcon = statusInfo.icon;
  const pendente = historico.find(h => h.status === 'PENDENTE');

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-5">
      {/* Status atual */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-900/50 border border-white/5">
        <StatusIcon size="1.25rem" className={statusInfo.color} />
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-bold">Condições Comerciais</p>
          <p className={`text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</p>
        </div>
        {pendente && (
          <div className="text-right">
            <p className="text-[0.625rem] text-zinc-500">Expira em</p>
            <p className="text-xs text-amber-400 font-bold">
              {new Date(pendente.expiraEm).toLocaleDateString('pt-BR')}
            </p>
          </div>
        )}
      </div>

      {/* Formulário de taxas */}
      <div className="space-y-3">
        <p className="text-[0.625rem] font-black uppercase tracking-wider text-zinc-500">Definir Condições</p>
        <div className="grid grid-cols-2 gap-2">
          {FIELDS.map(field => {
            const Icon = field.icon;
            return (
              <div
                key={field.key}
                className="flex items-center gap-2 p-3 rounded-xl bg-zinc-900/30 border border-white/5"
              >
                <Icon size="0.875rem" className="text-zinc-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[0.5rem] text-zinc-500 font-bold uppercase truncate">{field.label}</p>
                  <input
                    type="number"
                    step="any"
                    value={form[field.key] ?? ''}
                    onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full bg-transparent text-white text-sm outline-none placeholder:text-zinc-700 mt-0.5"
                  />
                </div>
                <span className="text-[0.5rem] text-zinc-600 shrink-0">
                  {field.format === 'percent' ? '%' : field.format === 'money' ? 'R$' : ''}
                </span>
              </div>
            );
          })}
        </div>

        {/* Observações */}
        <textarea
          value={obs}
          onChange={e => setObs(e.target.value)}
          placeholder="Observações (opcional)"
          rows={2}
          className="w-full p-3 bg-zinc-900/30 border border-white/5 rounded-xl text-white text-sm outline-none placeholder:text-zinc-600 resize-none"
        />

        {/* Botão enviar */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#FFD300] text-black font-bold text-sm rounded-xl active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <Send size="0.875rem" />
          {saving ? 'Enviando...' : pendente ? 'Atualizar Condições' : 'Definir Condições'}
        </button>
        <p className="text-[0.5625rem] text-zinc-600 text-center">
          O responsável será notificado e terá 7 dias para aceitar.
        </p>
      </div>

      {/* Histórico */}
      <div className="space-y-2">
        <button
          onClick={() => setShowHistorico(p => !p)}
          className="flex items-center gap-2 text-zinc-400 text-xs font-bold"
        >
          {showHistorico ? <ChevronUp size="0.875rem" /> : <ChevronDown size="0.875rem" />}
          Histórico ({historico.length})
        </button>

        {showHistorico && (
          <div className="space-y-2">
            {loading ? (
              <p className="text-zinc-600 text-xs">Carregando...</p>
            ) : historico.length === 0 ? (
              <p className="text-zinc-600 text-xs">Nenhuma condição definida ainda.</p>
            ) : (
              historico.map(h => {
                const si = STATUS_MAP[h.status] ?? STATUS_MAP.SEM_CONDICOES;
                const SIcon = si.icon;
                return (
                  <div key={h.id} className="p-3 rounded-xl bg-zinc-900/20 border border-white/5 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <SIcon size="0.75rem" className={si.color} />
                      <span className={`text-xs font-bold ${si.color}`}>{si.label}</span>
                      <span className="text-[0.5rem] text-zinc-600 ml-auto">
                        {new Date(h.definidoEm).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-[0.5rem] text-zinc-400">
                      <span>Serviço: {pct(h.taxaServicoPercent)}</span>
                      <span>Mínimo: {moeda(h.taxaMinima)}</span>
                      <span>Lista: {num(h.cotaNomesLista)}</span>
                      <span>Porta: {pct(h.taxaPortaPercent)}</span>
                      <span>Cortesias: {num(h.cotaCortesias)}</span>
                      <span>Prazo: {h.prazoPagamentoDias ? `${h.prazoPagamentoDias}d` : '—'}</span>
                    </div>
                    {h.observacoes && <p className="text-[0.5rem] text-zinc-500 italic">{h.observacoes}</p>}
                    {h.motivoRecusa && <p className="text-[0.5rem] text-red-400">Motivo: {h.motivoRecusa}</p>}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
