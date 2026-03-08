/**
 * EditarLotesSubView — edição inline de Lotes + Cortesias do evento.
 *
 * Renderiza Step2Ingressos com botão Salvar, sem wizard multi-step.
 * Acessível via atalho no painel ou badge "Ativar" de Lotação.
 */
import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Loader2, Check } from 'lucide-react';
import { TYPOGRAPHY } from '../../../../constants';
import type { LoteForm } from '../criarEvento/types';
import type { LoteMaisVantaForm } from '../criarEvento/Step2Ingressos';
import { Step2Ingressos } from '../criarEvento/Step2Ingressos';
import { AREA_LABELS } from '../criarEvento/constants';
import { novoLote } from '../criarEvento/utils';
import { eventosAdminService } from '../../services/eventosAdminService';
import { cortesiasService } from '../../services/cortesiasService';
import { clubeService } from '../../services/clubeService';
import type { LoteAdmin } from '../../../../types';

interface Props {
  eventoId: string;
  onBack: () => void;
  currentUserId?: string;
}

export const EditarLotesSubView: React.FC<Props> = ({ eventoId, onBack, currentUserId }) => {
  const [lotes, setLotes] = useState<LoteForm[]>([novoLote()]);
  const [cortesiaEnabled, setCortesiaEnabled] = useState(false);
  const [cortesiaLimites, setCortesiaLimites] = useState<Record<string, string>>({});
  const [maisVanta, setMaisVanta] = useState<LoteMaisVantaForm>({
    enabled: false,
    tierMinimo: 'BRONZE',
    quantidade: '',
    prazo: '',
    descricao: '',
    comAcompanhante: false,
  });
  const [saving, setSaving] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState('');

  const ev = useMemo(() => eventosAdminService.getEvento(eventoId), [eventoId]);
  const comunidadeId = ev?.comunidade?.id;

  // Hidratar dados existentes
  useEffect(() => {
    if (!ev) return;
    if (ev.lotes?.length) {
      setLotes(
        ev.lotes.map(l => ({
          id: l.id,
          dataValidade: l.dataValidade?.slice(0, 10) || '',
          horaValidade: '',
          virarPct: l.virarPct != null ? String(l.virarPct) : '',
          aberto: l.ativo ?? true,
          variacoes: l.variacoes.map(v => ({
            id: v.id,
            area: v.area,
            areaCustom: v.areaCustom || '',
            genero: v.genero,
            valor: String(v.valor),
            limite: String(v.limite),
            requerComprovante: v.requerComprovante ?? false,
            tipoComprovante: v.tipoComprovante ?? '',
          })),
        })),
      );
    }
    const cortCfg = cortesiasService.getCortesiaConfig(eventoId);
    if (cortCfg) {
      setCortesiaEnabled(true);
      if (cortCfg.limitesPorTipo && Object.keys(cortCfg.limitesPorTipo).length > 0) {
        const lim: Record<string, string> = {};
        for (const [k, v] of Object.entries(cortCfg.limitesPorTipo)) lim[k] = String(v);
        setCortesiaLimites(lim);
      }
    }
    if (ev.loteMaisVanta) {
      setMaisVanta({
        enabled: true,
        tierMinimo: ev.loteMaisVanta.tierMinimo,
        quantidade: String(ev.loteMaisVanta.quantidade),
        prazo: ev.loteMaisVanta.prazo ? ev.loteMaisVanta.prazo.slice(0, 10) : '',
        descricao: ev.loteMaisVanta.descricao || '',
        comAcompanhante: ev.loteMaisVanta.comAcompanhante ?? false,
      });
    }
  }, [eventoId, ev]);

  const varTipos = lotes
    .flatMap(l =>
      l.variacoes.map(v => {
        const area = AREA_LABELS.find(a => a.id === v.area)?.label || v.areaCustom || v.area;
        const gen = v.genero === 'MASCULINO' ? 'Masc.' : v.genero === 'FEMININO' ? 'Fem.' : '';
        return gen ? `${area} ${gen}` : area;
      }),
    )
    .filter((v, i, a) => a.indexOf(v) === i);

  const handleSalvar = async () => {
    setErro('');
    if (lotes.length === 0 || lotes.every(l => l.variacoes.length === 0)) {
      setErro('Defina pelo menos um lote com variações.');
      return;
    }

    setSaving(true);
    const lotesAdmin: LoteAdmin[] = lotes.map((l, i) => ({
      id: l.id || `lote_${Date.now()}_${i}`,
      nome: `Lote ${i + 1}`,
      limitTotal: l.variacoes.reduce((s, v) => s + (parseInt(v.limite) || 0), 0),
      dataValidade: l.dataValidade ? `${l.dataValidade}T${l.horaValidade || '23:59'}:00-03:00` : undefined,
      virarPct: l.virarPct ? parseInt(l.virarPct) : undefined,
      variacoes: l.variacoes.map(v => ({
        id: v.id,
        area: v.area,
        areaCustom: v.areaCustom || undefined,
        genero: v.genero,
        valor: parseFloat(v.valor),
        limite: parseInt(v.limite),
        vendidos: 0,
      })),
      vendidos: 0,
      ativo: i === 0,
    }));

    await eventosAdminService.submeterEdicao(eventoId, { lotes: lotesAdmin }, currentUserId ?? '');

    // Cortesias
    const limitesPorTipo: Record<string, number> = {};
    let totalCortesias = 0;
    if (cortesiaEnabled) {
      for (const [tipo, val] of Object.entries(cortesiaLimites) as [string, string][]) {
        const n = parseInt(val);
        if (n > 0) {
          limitesPorTipo[tipo] = n;
          totalCortesias += n;
        }
      }
    }
    if (cortesiaEnabled && totalCortesias > 0) {
      await cortesiasService.initCortesia(eventoId, {
        limite: totalCortesias,
        variacoes: Object.keys(limitesPorTipo),
        limitesPorTipo,
      });
    }

    // MAIS VANTA
    if (maisVanta.enabled) {
      const tiersAtivos = (maisVanta.tiers ?? []).filter(t => t.ativo && parseInt(t.quantidade) > 0);
      if (tiersAtivos.length > 0) {
        await clubeService.upsertLotesMaisVanta(
          eventoId,
          tiersAtivos.map(t => ({
            tierMinimo: t.tierId as any,
            tierId: t.tierId,
            quantidade: parseInt(t.quantidade) || 0,
            prazo: maisVanta.prazo ? `${maisVanta.prazo}T23:59:00-03:00` : undefined,
            descricao: maisVanta.descricao || undefined,
            comAcompanhante: (parseInt(t.acompanhantes) || 0) > 0,
            acompanhantes: parseInt(t.acompanhantes) || 0,
            tipoAcesso: t.tipoAcesso || 'Pista',
          })),
        );
      } else if (parseInt(maisVanta.quantidade) > 0) {
        await clubeService.upsertLoteMaisVanta(eventoId, {
          tierMinimo: maisVanta.tierMinimo,
          quantidade: parseInt(maisVanta.quantidade),
          prazo: maisVanta.prazo ? `${maisVanta.prazo}T23:59:00-03:00` : undefined,
          descricao: maisVanta.descricao || undefined,
          comAcompanhante: maisVanta.comAcompanhante,
          acompanhantes: 0,
          tipoAcesso: 'Pista',
        });
      }
    } else {
      await clubeService.removeLotesMaisVanta(eventoId);
    }

    setSaving(false);
    setSalvo(true);
  };

  if (salvo) {
    return (
      <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center p-10 gap-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <Check size={28} className="text-emerald-400" />
        </div>
        <p className="text-white font-bold text-lg">Lotes atualizados</p>
        <button
          onClick={onBack}
          className="mt-4 px-8 py-3 bg-[#FFD300] text-black rounded-xl text-[10px] font-black uppercase tracking-widest"
        >
          Voltar ao Painel
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-4 shrink-0">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 mr-3">
            <p style={TYPOGRAPHY.sectionKicker} className="mb-1">
              Editar · {ev?.nome ?? 'Evento'}
            </p>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-lg italic">
              Lotes e Cortesias
            </h1>
          </div>
          <button
            aria-label="Voltar"
            onClick={onBack}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all shrink-0 mt-1"
          >
            <ArrowLeft size={18} className="text-zinc-400" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 max-w-3xl mx-auto w-full">
        <Step2Ingressos
          lotes={lotes}
          setLotes={setLotes}
          cortesiaEnabled={cortesiaEnabled}
          setCortesiaEnabled={setCortesiaEnabled}
          cortesiaLimites={cortesiaLimites}
          setCortesiaLimites={setCortesiaLimites}
          varTipos={varTipos}
          maisVanta={maisVanta}
          setMaisVanta={setMaisVanta}
          comunidadeId={comunidadeId}
        />
        {erro && <p className="mt-4 text-red-400 text-[10px] font-black uppercase tracking-widest">{erro}</p>}
      </div>
      <div className="px-6 pb-8 safe-bottom pt-3 border-t border-white/5 shrink-0">
        <button
          onClick={handleSalvar}
          disabled={saving}
          className="w-full py-3.5 bg-[#FFD300] text-black rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all font-bold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : null}
          Salvar Lotes
        </button>
      </div>
    </div>
  );
};
