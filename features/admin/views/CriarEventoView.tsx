import React, { useState, useRef, useMemo, useEffect } from 'react';
import { UnsavedChangesModal } from '../../../components/UnsavedChangesModal';
import { useToast, ToastContainer } from '../../../components/Toast';
import { ArrowLeft, Check, MapPin, Calendar, Users, ListChecks, Ticket, Search, Loader2, FileText } from 'lucide-react';
import { useDraft } from '../../../hooks/useDraft';
import { TYPOGRAPHY, FORMATOS_POR_TIPO_COMUNIDADE } from '../../../constants';
import type { Comunidade, LoteAdmin, MembroEquipeEvento } from '../../../types';
import { eventosAdminService } from '../services/eventosAdminService';
import { listasService } from '../services/listasService';
import { cortesiasService } from '../services/cortesiasService';
import { clubeService } from '../services/clubeService';
import { adminService } from '../services/adminService';
import { supabase } from '../../../services/supabaseClient';

import type {
  LoteForm,
  VarListaForm,
  EquipeForm,
  TipoFluxoEvento,
  SocioConviteForm,
  PermissaoToggle,
  SplitForm,
} from './criarEvento/types';
import type { MaisVantaEventoForm } from './criarEvento/Step2Ingressos';
import { AREA_LABELS } from './criarEvento/constants';
import { novoLote, novaVarLista, buildLabel } from './criarEvento/utils';

import { TipoEventoScreen } from './criarEvento/TipoEventoScreen';
import { Step1Evento } from './criarEvento/Step1Evento';
import { Step2Ingressos } from './criarEvento/Step2Ingressos';
import { Step3Listas } from './criarEvento/Step3Listas';
import { Step4EquipeSocio } from './criarEvento/Step4EquipeSocio';
import { Step4EquipeCasa } from './criarEvento/Step4EquipeCasa';
import { Step5Financeiro } from './criarEvento/Step5Financeiro';
import { CopiarModal } from './criarEvento/CopiarModal';
import { CapacidadeModal } from './criarEvento/CapacidadeModal';
import { TosAcceptModal, checkTosAccepted } from '../../../components/TosAcceptModal';
import CelebrationScreen from '../../../components/CelebrationScreen';
import AccordionSection from '../../../components/form/AccordionSection';

// ── Classificação inline (formato/estilo/experiência) para Step Ingressos ──
const ClassificacaoInline: React.FC<{
  formato: string;
  setFormato: (v: string) => void;
  estilos: string[];
  setEstilos: (v: string[]) => void;
  experiencias: string[];
  setExperiencias: (v: string[]) => void;
  tipoComunidade?: string | null;
}> = ({ formato, setFormato, estilos, setEstilos, experiencias, setExperiencias, tipoComunidade }) => {
  const [dbFormatos, setDbFormatos] = React.useState<string[]>([]);
  const [dbEstilos, setDbEstilos] = React.useState<string[]>([]);
  const [dbExperiencias, setDbExperiencias] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchFormato, setSearchFormato] = React.useState('');
  const [searchEstilo, setSearchEstilo] = React.useState('');
  const [searchExperiencia, setSearchExperiencia] = React.useState('');

  React.useEffect(() => {
    (async () => {
      const [f, e, x] = await Promise.all([
        supabase.from('formatos').select('label').eq('ativo', true).order('ordem', { ascending: true }),
        supabase.from('estilos').select('label').eq('ativo', true).order('ordem', { ascending: true }),
        supabase.from('experiencias').select('label').eq('ativo', true).order('ordem', { ascending: true }),
      ]);
      let fmts = (f.data ?? []).map((d: { label: string }) => d.label);
      // Filtrar formatos pelo tipo da comunidade
      if (tipoComunidade && tipoComunidade !== 'PRODUTORA') {
        const permitidos = FORMATOS_POR_TIPO_COMUNIDADE[tipoComunidade];
        if (permitidos) fmts = fmts.filter(fmt => permitidos.includes(fmt));
      }
      setDbFormatos(fmts);
      setDbEstilos((e.data ?? []).map((d: { label: string }) => d.label));
      setDbExperiencias((x.data ?? []).map((d: { label: string }) => d.label));
      setLoading(false);
    })().catch(() => setLoading(false));
  }, [tipoComunidade]);

  const filterItems = (items: string[], search: string) =>
    search ? items.filter(i => i.toLowerCase().includes(search.toLowerCase())) : items;

  const toggleMulti = (arr: string[], item: string, max: number): string[] | null => {
    if (arr.includes(item)) return arr.filter(x => x !== item);
    if (arr.length >= max) return null;
    return [...arr, item];
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <Loader2 size="0.875rem" className="text-zinc-400 animate-spin" />
        <span className="text-zinc-400 text-xs">Carregando classificações...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Formato */}
      <AccordionSection
        title="Formato"
        iconEmoji="🧱"
        badge={formato || 'Obrigatório'}
        badgeColor={formato ? 'text-[#FFD300]' : 'text-amber-500'}
        borderColor="border-[#FFD300]/20"
      >
        <p className="text-[0.625rem] text-zinc-400 font-black uppercase tracking-widest mb-2">
          O que é / Onde acontece · selecione 1
        </p>
        <div className="relative mb-2">
          <Search size="0.75rem" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={searchFormato}
            onChange={e => setSearchFormato(e.target.value)}
            placeholder="Buscar formato..."
            className="w-full pl-8 pr-3 py-2 bg-zinc-900/50 border border-white/5 rounded-xl text-xs text-white placeholder:text-zinc-700"
          />
        </div>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto no-scrollbar">
          {filterItems(dbFormatos, searchFormato).map(fmt => (
            <button
              key={fmt}
              type="button"
              onClick={() => setFormato(formato === fmt ? '' : fmt)}
              className={`px-3 py-2 rounded-xl text-[0.625rem] font-bold uppercase tracking-wider border transition-all active:scale-95 ${
                formato === fmt
                  ? 'bg-[#FFD300]/15 border-[#FFD300]/40 text-[#FFD300]'
                  : 'bg-zinc-900/50 border-white/5 text-zinc-400'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </AccordionSection>

      {/* Estilo */}
      <AccordionSection
        title="Estilo"
        iconEmoji="🎵"
        badge={estilos.length > 0 ? `${estilos.length}/5` : 'Obrigatório'}
        badgeColor={estilos.length > 0 ? 'text-purple-400' : 'text-amber-500'}
        borderColor="border-purple-500/20"
      >
        <p className="text-[0.625rem] text-zinc-400 font-black uppercase tracking-widest mb-2">
          Som / Vibe · min. 1, sem teto máximo
        </p>
        <div className="relative mb-2">
          <Search size="0.75rem" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={searchEstilo}
            onChange={e => setSearchEstilo(e.target.value)}
            placeholder="Buscar estilo..."
            className="w-full pl-8 pr-3 py-2 bg-zinc-900/50 border border-white/5 rounded-xl text-xs text-white placeholder:text-zinc-700"
          />
        </div>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto no-scrollbar">
          {filterItems(dbEstilos, searchEstilo).map(est => {
            const selected = estilos.includes(est);
            return (
              <button
                key={est}
                type="button"
                onClick={() => {
                  const r = toggleMulti(estilos, est, 999);
                  if (r) setEstilos(r);
                }}
                className={`px-3 py-2 rounded-xl text-[0.625rem] font-bold uppercase tracking-wider border transition-all active:scale-95 ${
                  selected
                    ? 'bg-purple-500/15 border-purple-500/40 text-purple-400'
                    : 'bg-zinc-900/50 border-white/5 text-zinc-400'
                }`}
              >
                {est}
              </button>
            );
          })}
        </div>
      </AccordionSection>

      {/* Experiência (opcional) */}
      <AccordionSection
        title="Experiência"
        iconEmoji="✨"
        badge={experiencias.length > 0 ? `${experiencias.length} sel.` : 'Opcional'}
        badgeColor={experiencias.length > 0 ? 'text-emerald-400' : 'text-zinc-500'}
        borderColor="border-emerald-500/20"
      >
        <p className="text-[0.625rem] text-zinc-400 font-black uppercase tracking-widest mb-2">
          Modelo / Diferencial · opcional, max. 5
        </p>
        <div className="relative mb-2">
          <Search size="0.75rem" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={searchExperiencia}
            onChange={e => setSearchExperiencia(e.target.value)}
            placeholder="Buscar experiência..."
            className="w-full pl-8 pr-3 py-2 bg-zinc-900/50 border border-white/5 rounded-xl text-xs text-white placeholder:text-zinc-700"
          />
        </div>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto no-scrollbar">
          {filterItems(dbExperiencias, searchExperiencia).map(exp => {
            const selected = experiencias.includes(exp);
            const limitReached = experiencias.length >= 5 && !selected;
            return (
              <button
                key={exp}
                type="button"
                disabled={limitReached}
                onClick={() => {
                  const r = toggleMulti(experiencias, exp, 5);
                  if (r) setExperiencias(r);
                }}
                className={`px-3 py-2 rounded-xl text-[0.625rem] font-bold uppercase tracking-wider border transition-all active:scale-95 ${
                  selected
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                    : limitReached
                      ? 'bg-zinc-900/30 border-white/3 text-zinc-700 opacity-40 cursor-not-allowed'
                      : 'bg-zinc-900/50 border-white/5 text-zinc-400'
                }`}
              >
                {exp}
              </button>
            );
          })}
        </div>
      </AccordionSection>
    </div>
  );
};

// ── Entry: CriarEventoView ──────────────────────────────────────────────────
export const CriarEventoView: React.FC<{
  comunidade: Comunidade;
  onBack: () => void;
  currentUserId?: string;
  currentUserNome?: string;
}> = ({ comunidade, onBack, currentUserId, currentUserNome }) => {
  // ── Fluxo ──
  const [vendaVanta, setVendaVanta] = useState<boolean>(true);
  const [tipoFluxo, setTipoFluxo] = useState<TipoFluxoEvento | null>(null);
  const [step, setStep] = useState(1);
  const [publicado, setPublicado] = useState(false);
  const [isPublicando, setIsPublicando] = useState(false);
  const { toasts, dismiss, toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [erro, setErro] = useState('');
  const [copiarOpen, setCopiarOpen] = useState(false);
  const [conviteEnviado, setConviteEnviado] = useState(false);
  const [capacidadeAviso, setCapacidadeAviso] = useState<{
    total: number;
    cap: number;
    tipo: 'ingressos' | 'lista';
    onConfirmar: () => void;
  } | null>(null);

  // ── Step 1 ──
  const [foto, setFoto] = useState('');
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');

  // dataFim calculado: se horaFim <= horaInicio, é dia seguinte
  const dataFim = React.useMemo(() => {
    if (!dataInicio || !horaInicio || !horaFim) return '';
    if (horaFim > horaInicio) return dataInicio;
    const d = new Date(dataInicio + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, [dataInicio, horaInicio, horaFim]);

  const [formato, setFormato] = useState('');
  const [estilos, setEstilos] = useState<string[]>([]);
  const [experiencias, setExperiencias] = useState<string[]>([]);
  const [recorrencia, setRecorrencia] = useState('UNICO');
  const [recorrenciaAte, setRecorrenciaAte] = useState('');
  const [classificacaoEtaria, setClassificacaoEtaria] = useState<'LIVRE' | '16+' | '18+'>('LIVRE');
  const [localNome, setLocalNome] = useState(comunidade.nome);
  const [localEndereco, setLocalEndereco] = useState(
    comunidade.endereco ? `${comunidade.endereco}, ${comunidade.cidade}` : comunidade.cidade,
  );
  const [localCidade, setLocalCidade] = useState(comunidade.cidade);

  // ── Step 2 ──
  const [lotes, setLotes] = useState<LoteForm[]>([novoLote()]);

  // ── MAIS VANTA ──
  const [maisVantaEvento, setMaisVantaEvento] = useState<MaisVantaEventoForm>({
    enabled: false,
    beneficios: [],
  });

  // ── Step 3 ──
  const [cortesiaEnabled, setCortesiaEnabled] = useState(false);
  const [cortesiaLimites, setCortesiaLimites] = useState<Record<string, string>>({});
  const [listasEnabled, setListasEnabled] = useState(false);
  const [varsLista, setVarsLista] = useState<VarListaForm[]>([]);

  // ── Step 4 ──
  const [equipe, setEquipe] = useState<EquipeForm[]>([]);

  // ── Com Sócio ──
  const [socio, setSocio] = useState<SocioConviteForm | null>(null);
  const [permissoes, setPermissoes] = useState<PermissaoToggle[]>([]);
  const [split, setSplit] = useState<SplitForm>({ percentSocio: '70', percentProdutor: '30' });

  // ── Festa da Casa ──
  const [gerente, setGerente] = useState<{ membroId: string; nome: string; email: string; foto: string } | null>(null);
  const [gerentePermissoes, setGerentePermissoes] = useState<string[]>([]);

  // ── UX ──
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // ── Draft auto-save ──
  const { draftLoaded, hasDraft, draftData, saveDraft, discardDraft } = useDraft('EVENTO', comunidade.id);

  const allDraftData = useMemo(
    () => ({
      nome,
      descricao,
      foto,
      dataInicio,
      horaInicio,
      horaFim,
      dataFim,
      formato,
      estilos,
      experiencias,
      recorrencia,
      recorrenciaAte,
      localNome,
      localEndereco,
      localCidade,
      lotes,
      cortesiaEnabled,
      cortesiaLimites,
      maisVantaEvento,
      listasEnabled,
      varsLista,
      equipe,
      gerente,
      gerentePermissoes,
      socio,
      permissoes,
      split,
      vendaVanta,
      tipoFluxo,
    }),
    [
      nome,
      descricao,
      foto,
      dataInicio,
      horaInicio,
      horaFim,
      dataFim,
      formato,
      estilos,
      experiencias,
      recorrencia,
      recorrenciaAte,
      localNome,
      localEndereco,
      localCidade,
      lotes,
      cortesiaEnabled,
      cortesiaLimites,
      maisVantaEvento,
      listasEnabled,
      varsLista,
      equipe,
      gerente,
      gerentePermissoes,
      socio,
      permissoes,
      split,
      vendaVanta,
      tipoFluxo,
    ],
  );

  // ── ToS gate ──
  const [tosChecked, setTosChecked] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);

  useEffect(() => {
    if (!currentUserId) return;
    checkTosAccepted(currentUserId).then(ok => {
      setTosAccepted(ok);
      setTosChecked(true);
    });
  }, [currentUserId]);

  const hasChanges = useMemo(() => {
    return !!(foto || nome.trim() || descricao.trim() || dataInicio || horaInicio);
  }, [foto, nome, descricao, dataInicio, horaInicio]);

  // Auto-save draft quando dados mudam (só após carregar draft existente e se tem mudanças)
  useEffect(() => {
    if (!draftLoaded || !hasChanges || !tipoFluxo) return;
    saveDraft(allDraftData, step);
  }, [draftLoaded, hasChanges, tipoFluxo, allDraftData, step, saveDraft]);

  const handleRestoreDraft = () => {
    if (!draftData) return;
    const d = draftData.dados as typeof allDraftData;
    setNome(d.nome || '');
    setDescricao(d.descricao || '');
    setFoto(d.foto || '');
    setDataInicio(d.dataInicio || '');
    setHoraInicio(d.horaInicio || '');
    setHoraFim(d.horaFim || '');
    setFormato(d.formato || '');
    setEstilos(d.estilos || []);
    setExperiencias(d.experiencias || []);
    setRecorrencia(d.recorrencia || 'UNICO');
    setRecorrenciaAte(d.recorrenciaAte || '');
    setLocalNome(d.localNome || comunidade.nome);
    setLocalEndereco(d.localEndereco || '');
    setLocalCidade(d.localCidade || comunidade.cidade);
    if (d.lotes) setLotes(d.lotes as LoteForm[]);
    setCortesiaEnabled(d.cortesiaEnabled || false);
    setCortesiaLimites((d.cortesiaLimites as Record<string, string>) || {});
    if (d.maisVantaEvento) setMaisVantaEvento(d.maisVantaEvento as MaisVantaEventoForm);
    setListasEnabled(d.listasEnabled || false);
    if (d.varsLista) setVarsLista(d.varsLista as VarListaForm[]);
    if (d.equipe) setEquipe(d.equipe as EquipeForm[]);
    if (d.gerente) setGerente(d.gerente as typeof gerente);
    if (d.gerentePermissoes) setGerentePermissoes(d.gerentePermissoes as string[]);
    if (d.socio) setSocio(d.socio as SocioConviteForm);
    if (d.permissoes) setPermissoes(d.permissoes as PermissaoToggle[]);
    if (d.split) setSplit(d.split as SplitForm);
    if (d.vendaVanta !== undefined) setVendaVanta(d.vendaVanta as boolean);
    if (d.tipoFluxo) setTipoFluxo(d.tipoFluxo as TipoFluxoEvento);
    setStep(draftData.step_atual);
  };

  const safeBack = () => {
    if (!tipoFluxo) {
      onBack();
      return;
    }
    if (step === 1 && !hasChanges) {
      setTipoFluxo(null);
      return;
    }
    if (hasChanges) setShowExitConfirm(true);
    else onBack();
  };

  // ── Dinâmico por fluxo (4 combinações → 4 steps ou 3 steps) ──
  const isComSocio = tipoFluxo === 'COM_SOCIO';
  const buildSteps = (): { labels: string[]; titles: string[] } => {
    if (vendaVanta)
      return {
        labels: ['Essencial', 'Ingressos', 'Equipe e Listas', 'Revisar'],
        titles: ['Essencial', 'Ingressos e Classificação', 'Equipe e Listas', 'Revisar e Publicar'],
      };
    // SEM VENDA (COM_SOCIO ou FESTA_DA_CASA)
    return {
      labels: ['Essencial', 'Equipe e Listas', 'Revisar'],
      titles: ['Essencial', 'Equipe e Listas', 'Revisar e Publicar'],
    };
  };
  const { labels: STEP_LABELS, titles: stepTitles } = buildSteps();
  const TOTAL_STEPS = STEP_LABELS.length;

  // Tipos de cortesia derivados dos lotes
  const varTipos = lotes
    .flatMap(l =>
      l.variacoes.map(v => {
        const area = AREA_LABELS.find(a => a.id === v.area)?.label || v.areaCustom || v.area;
        const gen = v.genero === 'MASCULINO' ? 'Masc.' : v.genero === 'FEMININO' ? 'Fem.' : 'Unissex';
        return `${area} · ${gen}` as string;
      }),
    )
    .filter((s, i, arr) => arr.indexOf(s) === i);

  const temEventosAnteriores = eventosAdminService.getEventos().length > 0;

  const handleCopiar = (d: {
    lotes?: LoteForm[];
    varsLista?: VarListaForm[];
    equipe?: EquipeForm[];
    step1?: {
      foto: string;
      nome: string;
      descricao: string;
      formato?: string;
      estilos?: string[];
      experiencias?: string[];
    };
  }) => {
    if (d.step1) {
      setFoto(d.step1.foto);
      setNome(d.step1.nome);
      setDescricao(d.step1.descricao);
      if (d.step1.formato) setFormato(d.step1.formato);
      if (d.step1.estilos) setEstilos(d.step1.estilos);
      if (d.step1.experiencias) setExperiencias(d.step1.experiencias);
    }
    if (d.lotes) setLotes(d.lotes);
    if (d.varsLista) {
      setVarsLista(d.varsLista);
      setListasEnabled(true);
    }
    if (d.equipe) setEquipe(d.equipe);
  };

  // ── Validações ──
  const validarEssencial = (): boolean => {
    if (!foto) {
      setErro('Foto do evento é obrigatória.');
      return false;
    }
    if (!nome.trim()) {
      setErro('Nome do evento é obrigatório.');
      return false;
    }
    if (!descricao.trim()) {
      setErro('Descrição é obrigatória.');
      return false;
    }
    if (!dataInicio || !horaInicio) {
      setErro('Data e hora de início são obrigatórias.');
      return false;
    }
    if (!horaFim) {
      setErro('Hora de encerramento é obrigatória.');
      return false;
    }
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const inicio = new Date(dataInicio + 'T00:00:00');
    if (inicio < hoje) {
      setErro('O evento deve ser criado para uma data futura.');
      return false;
    }
    if (horaInicio === horaFim) {
      setErro('Horário de início e encerramento não podem ser iguais.');
      return false;
    }
    return true;
  };

  const validarClassificacao = (): boolean => {
    if (!formato) {
      setErro('Selecione um formato.');
      return false;
    }
    if (estilos.length < 1) {
      setErro('Selecione pelo menos 1 estilo.');
      return false;
    }
    if (estilos.length > 5) {
      setErro('Máximo de 5 estilos.');
      return false;
    }
    return true;
  };

  const validarRevisar = (): boolean => {
    if (isComSocio) {
      const pS = parseInt(split.percentSocio) || 0;
      const pP = parseInt(split.percentProdutor) || 0;
      if (pS + pP !== 100) {
        setErro('O split deve somar 100%.');
        return false;
      }
      if (pS < 0 || pP < 0) {
        setErro('Percentuais não podem ser negativos.');
        return false;
      }
    }
    return true;
  };

  const validarStep2 = (): boolean => {
    for (const l of lotes) {
      if (l.variacoes.length === 0) {
        setErro('Cada lote precisa de ao menos uma variação.');
        return false;
      }
      for (const v of l.variacoes) {
        if (!v.limite || parseInt(v.limite) <= 0) {
          setErro('Informe o limite de cada variação.');
          return false;
        }
        if (!v.valor || parseFloat(v.valor) < 0) {
          setErro('Valor inválido em uma variação.');
          return false;
        }
        if (v.area === 'OUTRO' && !v.areaCustom.trim()) {
          setErro('Informe o nome da área personalizada.');
          return false;
        }
      }
    }
    if (cortesiaEnabled) {
      const tiposSelecionados = (Object.entries(cortesiaLimites) as [string, string][]).filter(
        ([, v]) => parseInt(v) > 0,
      );
      if (tiposSelecionados.length === 0) {
        setErro('Selecione pelo menos um tipo de cortesia e defina o limite.');
        return false;
      }
    }
    return true;
  };

  const validarStep3 = (): boolean => {
    if (!listasEnabled || varsLista.length === 0) return true;
    for (const v of varsLista) {
      if (v.validadeTipo === 'HORARIO' && !v.validadeHora) {
        setErro('Informe o horário limite da lista.');
        return false;
      }
      if (v.tipo !== 'VIP' && !v.valor) {
        setErro('Informe o valor para variações não-VIP.');
        return false;
      }
    }
    return true;
  };

  const validarStep4 = (): boolean => {
    if (tipoFluxo === 'COM_SOCIO' && !socio) {
      setErro('Selecione um sócio para o evento.');
      return false;
    }
    return true;
  };

  // ── Publicar ──
  const handlePublicar = async () => {
    if (isPublicando) return;
    setIsPublicando(true);
    setErro('');
    try {
      const iso = (date: string, hora: string) => `${date}T${hora}:00-03:00`;
      const isFestaDaCasa = tipoFluxo === 'FESTA_DA_CASA';

      const lotesAdmin: LoteAdmin[] = lotes.map((l, i) => {
        const variacoesAdmin = l.variacoes.map(v => ({
          id: v.id,
          area: v.area,
          areaCustom: v.areaCustom || undefined,
          genero: v.genero,
          valor: parseFloat(v.valor),
          limite: parseInt(v.limite),
          vendidos: 0,
          requerComprovante: v.requerComprovante ?? false,
          tipoComprovante: v.tipoComprovante || undefined,
        }));
        return {
          id: `lote_${Date.now()}_${i}`,
          nome: `Lote ${i + 1}`,
          limitTotal: variacoesAdmin.reduce((s, v) => s + v.limite, 0),
          dataValidade: l.dataValidade ? `${l.dataValidade}T${l.horaValidade || '23:59'}:00-03:00` : undefined,
          virarPct: l.virarPct ? parseInt(l.virarPct) : undefined,
          variacoes: variacoesAdmin,
          vendidos: 0,
          ativo: i === 0,
        };
      });

      const equipeAdmin: MembroEquipeEvento[] = equipe.map(m => ({ id: m.membroId, nome: m.nome, papel: m.papel }));

      // Adicionar gerente à equipe se Festa da Casa com gerente designado
      if (isFestaDaCasa && gerente) {
        equipeAdmin.push({
          id: gerente.membroId,
          nome: gerente.nome,
          papel: 'GERENTE',
          permissoes: gerentePermissoes.length > 0 ? gerentePermissoes : undefined,
        });
      }

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
      const cortesiaConfig =
        cortesiaEnabled && totalCortesias > 0
          ? { limite: totalCortesias, variacoes: Object.keys(limitesPorTipo), limitesPorTipo }
          : undefined;

      const eventoId = await eventosAdminService.criarEvento({
        comunidadeId: comunidade.id,
        foto,
        nome: nome.trim(),
        descricao: descricao.trim(),
        dataInicio: iso(dataInicio, horaInicio),
        dataFim: iso(dataFim, horaFim),
        local: comunidade.tipo_comunidade === 'PRODUTORA' ? localNome : comunidade.nome,
        endereco:
          comunidade.tipo_comunidade === 'PRODUTORA' ? localEndereco : `${comunidade.endereco}, ${comunidade.cidade}`,
        cidade: comunidade.tipo_comunidade === 'PRODUTORA' ? localCidade : comunidade.cidade,
        coords: comunidade.tipo_comunidade === 'PRODUTORA' ? undefined : comunidade.coords,
        lotes: lotesAdmin,
        equipe: equipeAdmin,
        comunidade: { id: comunidade.id, nome: comunidade.nome, foto: comunidade.foto },
        publicado: false,
        cortesia: cortesiaConfig,
        criadorId: currentUserId,
        criadorNome: currentUserNome,
        tipoFluxo: tipoFluxo ?? undefined,
        vendaVanta,
        statusEvento: 'PENDENTE',
        socioConvidadoId: socio?.membroId,
        splitProdutor: tipoFluxo === 'COM_SOCIO' ? parseInt(split.percentProdutor) || 0 : undefined,
        splitSocio: tipoFluxo === 'COM_SOCIO' ? parseInt(split.percentSocio) || 0 : undefined,
        permissoesProdutor: tipoFluxo === 'COM_SOCIO' ? permissoes : undefined,
        formato: formato || undefined,
        estilos: estilos.length > 0 ? estilos : undefined,
        experiencias: experiencias.length > 0 ? experiencias : undefined,
        recorrencia: (recorrencia as 'UNICO' | 'SEMANAL' | 'QUINZENAL' | 'MENSAL') || undefined,
        recorrenciaAte: recorrenciaAte || undefined,
        classificacaoEtaria: classificacaoEtaria || undefined,
      });

      if (!eventoId) {
        setErro('Erro ao criar evento. Tente novamente.');
        return;
      }

      if (cortesiaConfig) {
        await cortesiasService.initCortesia(eventoId, cortesiaConfig);
      }

      // Evento recorrente — gerar ocorrências futuras (copia lotes, equipe e listas)
      if (recorrencia !== 'UNICO' && recorrenciaAte) {
        const { error: errRec } = await supabase.rpc('gerar_ocorrencias_recorrente', {
          p_evento_id: eventoId,
          p_copiar_lotes: true,
          p_copiar_equipe: true,
          p_copiar_listas: true,
        });
        if (errRec) console.error('[CriarEventoView] gerar_ocorrencias_recorrente:', errRec);
      }

      // MAIS VANTA — salvar benefícios por tier (mais_vanta_config_evento)
      if (maisVantaEvento.enabled) {
        const ativos = maisVantaEvento.beneficios.filter(b => b.ativo && (b.loteId || b.listaVarId));
        if (ativos.length > 0) {
          await clubeService.salvarBeneficiosEvento(
            eventoId,
            ativos.map(b => ({
              tierMinimo: b.tierId,
              tipo: b.tipo,
              loteId: b.tipo === 'ingresso' ? b.loteId : null,
              listaId: b.tipo === 'lista' ? b.listaVarId : null,
              descontoPercentual: b.tierId === 'lista' ? parseInt(b.descontoPercentual) || null : null,
              creatorSublevelMinimo: b.tierId === 'creator' && b.creatorSublevelMinimo ? b.creatorSublevelMinimo : null,
              vagasLimite: b.vagasLimite ? parseInt(b.vagasLimite) || null : null,
              ativo: true,
            })),
          );
        }
      }

      // Auto-criar VANTA Indica card
      void adminService.addCard({
        tipo: 'DESTAQUE_EVENTO',
        ativo: false,
        badge: 'EVENTO',
        titulo: nome.trim(),
        subtitulo: descricao.trim().slice(0, 100) || comunidade.nome,
        imagem: foto || undefined,
        alvoLocalidades: comunidade.cidade ? [comunidade.cidade] : ['GLOBAL'],
        acaoLink: eventoId,
        acao: { tipo: 'evento', valor: eventoId },
        imgPosition: 'center',
        textAlign: 'end',
        layoutConfig: {},
        criadoPor: 'system',
      });

      if (listasEnabled) {
        const regrasValidas = varsLista;
        if (regrasValidas.length > 0) {
          const totalLimite = regrasValidas.reduce((s, v) => s + (parseInt(v.limite) || 0), 0);
          const listaId = await listasService.criarLista({
            eventoId,
            eventoNome: nome.trim(),
            eventoData: dataInicio,
            eventoDataFim: dataFim,
            eventoLocal: comunidade.tipo_comunidade === 'PRODUTORA' ? localNome : comunidade.nome,
            tetoGlobalTotal: totalLimite || null,
            regras: regrasValidas.map(v => ({
              label: buildLabel(v),
              tetoGlobal: v.limite ? parseInt(v.limite) : null,
              cor: v.cor,
              valor: v.tipo !== 'VIP' && v.valor ? parseFloat(v.valor) : undefined,
              horaCorte: v.validadeTipo === 'HORARIO' && v.validadeHora ? v.validadeHora : undefined,
              genero:
                v.genero === 'MASCULINO' ? ('M' as const) : v.genero === 'FEMININO' ? ('F' as const) : ('U' as const),
              area: v.area || 'PISTA',
            })),
          });

          if (cortesiaConfig && listaId) await cortesiasService.registerListaMapping(listaId, eventoId);

          const lista = listasService.getLista(listaId)!;
          if (lista) {
            const varToRegra = new Map<string, string>();
            regrasValidas.forEach((v, i) => {
              if (lista.regras[i]) varToRegra.set(v.id, lista.regras[i].id);
            });
            for (const e of equipe.filter(eq => eq.liberarLista)) {
              for (const q of e.quotas) {
                const regraId = varToRegra.get(q.varListaId);
                const qtd = parseInt(q.quantidade);
                if (regraId && qtd > 0) {
                  await listasService.distribuirCota(listaId, regraId, e.membroId, e.nome, qtd);
                }
              }
            }
          }
        }
      }

      toast({ title: 'Evento criado!', variant: 'success' });
      await discardDraft();
      setPublicado(true);
    } catch (e) {
      setErro('Erro ao publicar evento. Tente novamente.');
      toast({ title: 'Erro ao publicar evento', variant: 'error' });
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsPublicando(false);
    }
  };

  // ── Navegação ──
  const currentLabel = STEP_LABELS[step - 1];
  const avancar = () => {
    setErro('');
    if (currentLabel === 'Essencial' && !validarEssencial()) return;
    if (currentLabel === 'Ingressos') {
      if (!validarStep2()) return;
      if (!validarClassificacao()) return;
      const cap = comunidade.capacidadeMax;
      if (cap && cap > 0) {
        const totalLotes = lotes.reduce(
          (s, l) => s + l.variacoes.reduce((sv, v) => sv + (parseInt(v.limite) || 0), 0),
          0,
        );
        if (totalLotes > cap) {
          setCapacidadeAviso({
            total: totalLotes,
            cap,
            tipo: 'ingressos',
            onConfirmar: () => {
              setCapacidadeAviso(null);
              setStep(step + 1);
            },
          });
          return;
        }
      }
    }
    if (currentLabel === 'Equipe e Listas') {
      if (!validarStep4()) return;
      if (!validarStep3()) return;
      if (listasEnabled) {
        const cap = comunidade.capacidadeMax;
        if (cap && cap > 0) {
          const totalLista = varsLista.reduce((s, v) => s + (parseInt(v.limite) || 0), 0);
          if (totalLista > cap) {
            setCapacidadeAviso({
              total: totalLista,
              cap,
              tipo: 'lista',
              onConfirmar: () => {
                setCapacidadeAviso(null);
                setStep(step + 1);
              },
            });
            return;
          }
        }
      }
    }
    if (currentLabel === 'Revisar') {
      if (!validarRevisar()) return;
      handlePublicar();
      return;
    }
    setStep(s => s + 1);
  };

  const voltar = () => {
    setErro('');
    setStep(s => s - 1);
  };

  // ── Gate ToS ──
  if (tosChecked && !tosAccepted) {
    return (
      <TosAcceptModal
        userId={currentUserId ?? ''}
        userName={currentUserNome ?? ''}
        onAccepted={() => setTosAccepted(true)}
        onBack={onBack}
      />
    );
  }

  // ── Tela de escolha de tipo ──
  if (!tipoFluxo) {
    return (
      <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
        <div className="shrink-0 bg-[#0A0A0A] border-b border-white/5 px-6 pt-6 pb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0 mr-3">
              <p style={TYPOGRAPHY.sectionKicker} className="mb-1">
                Criar Evento · {comunidade.nome}
              </p>
              <h1 style={TYPOGRAPHY.screenTitle} className="text-xl">
                Tipo de Evento
              </h1>
            </div>
            <button
              aria-label="Voltar"
              onClick={onBack}
              className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all shrink-0 mt-1"
            >
              <ArrowLeft size="1.125rem" className="text-zinc-400" />
            </button>
          </div>
        </div>
        <TipoEventoScreen
          onSelect={(tipo, venda) => {
            setVendaVanta(venda);
            setTipoFluxo(tipo);
          }}
        />
      </div>
    );
  }

  // ── Tela de sucesso ──
  if (publicado) {
    const handleEnviarConvite = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token ?? '';
        const res = await supabase.functions.invoke('send-invite', {
          body: {
            nome: socio?.nome,
            email: socio?.email,
            masterNome: currentUserNome ?? 'Produtor',
            assunto: `Convite VANTA — ${nome}`,
            mensagem: `Você foi convidado(a) para ser sócio(a) do evento "${nome}".\n\nData: ${dataInicio} às ${horaInicio}\nLocal: ${comunidade.tipo_comunidade === 'PRODUTORA' ? localNome : comunidade.nome}\nSplit: ${split.percentSocio}% Sócio / ${split.percentProdutor}% Produtor\n\nAbra o app VANTA para aceitar ou recusar o convite.`,
            tipo: 'broadcast',
          },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.error || res.data?.error) {
          setErro(res.data?.error ?? res.error?.message ?? 'Falha ao enviar convite.');
        } else {
          setConviteEnviado(true);
        }
      } catch {
        setErro('Erro ao enviar convite.');
      }
    };

    const celebrationActions: { label: string; onClick: () => void; variant: 'primary' | 'secondary' }[] = [];
    if (isComSocio && socio?.email && !conviteEnviado) {
      celebrationActions.push({ label: 'Enviar convite por email', onClick: handleEnviarConvite, variant: 'primary' });
    }
    celebrationActions.push({
      label: 'Voltar para a Comunidade',
      onClick: onBack,
      variant: conviteEnviado || !isComSocio ? 'primary' : 'secondary',
    });

    return (
      <CelebrationScreen
        title={nome}
        subtitle={
          isComSocio
            ? 'Convite enviado ao sócio. Após aceite, o evento segue para aprovação do Master.'
            : 'Evento enviado para aprovação. Aguarde a análise do Master VANTA.'
        }
        icon="clock"
        actions={celebrationActions}
      />
    );
  }

  // ── Formulário principal ──
  const stepTitle = stepTitles[step - 1];

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 bg-[#0A0A0A] border-b border-white/5 px-6 pt-6 pb-4">
        <div className="flex justify-between items-start mb-5">
          <div className="flex-1 min-w-0 mr-3">
            <p style={TYPOGRAPHY.sectionKicker} className="mb-1">
              Criar Evento · {comunidade.nome}
              <span className="ml-2 text-zinc-700">
                {isComSocio ? '(Com Sócio)' : '(Festa da Casa)'}
                {!vendaVanta ? ' · Sem Venda' : ''}
              </span>
            </p>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-xl">
              {stepTitle}
            </h1>
          </div>
          <button
            aria-label="Voltar"
            onClick={safeBack}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all shrink-0 mt-1"
          >
            <ArrowLeft size="1.125rem" className="text-zinc-400" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[0.5625rem] font-black border transition-all shrink-0 ${
                  step === s
                    ? 'bg-[#FFD300] border-[#FFD300] text-black'
                    : step > s
                      ? 'bg-[#FFD300]/15 border-[#FFD300]/30 text-[#FFD300]'
                      : 'bg-zinc-900 border-white/10 text-zinc-400'
                }`}
              >
                {step > s ? <Check size="0.625rem" /> : s}
              </div>
              {i < TOTAL_STEPS - 1 && <div className={`flex-1 h-px ${step > s ? 'bg-[#FFD300]/20' : 'bg-white/5'}`} />}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          {STEP_LABELS.map((l, i) => (
            <p
              key={l}
              className={`text-[0.4375rem] font-black uppercase tracking-widest ${step === i + 1 ? 'text-[#FFD300]' : 'text-zinc-700'}`}
              style={{
                width: `${100 / TOTAL_STEPS}%`,
                textAlign: i === 0 ? 'left' : i === TOTAL_STEPS - 1 ? 'right' : 'center',
              }}
            >
              {l}
            </p>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar p-6 max-w-3xl mx-auto w-full">
        {hasDraft && draftData && (
          <div className="bg-[#FFD300]/10 border border-[#FFD300]/20 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <FileText size={20} className="text-[#FFD300] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm leading-snug">Você tem um rascunho não finalizado.</p>
                {draftData.updated_at && (
                  <p className="text-zinc-400 text-xs mt-0.5">
                    Salvo em{' '}
                    {new Date(draftData.updated_at).toLocaleString('pt-BR', {
                      timeZone: 'America/Sao_Paulo',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={handleRestoreDraft}
                    className="px-4 py-2 bg-[#FFD300] text-black text-[0.625rem] font-black uppercase tracking-widest rounded-lg active:scale-95 transition-all"
                  >
                    Continuar
                  </button>
                  <button
                    onClick={() => void discardDraft()}
                    className="px-4 py-2 text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest rounded-lg hover-real:text-zinc-300 active:scale-95 transition-all"
                  >
                    Descartar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* ── Step Essencial ── */}
        {currentLabel === 'Essencial' && (
          <Step1Evento
            foto={foto}
            setFoto={setFoto}
            nome={nome}
            setNome={setNome}
            descricao={descricao}
            setDescricao={setDescricao}
            dataInicio={dataInicio}
            setDataInicio={setDataInicio}
            horaInicio={horaInicio}
            setHoraInicio={setHoraInicio}
            horaFim={horaFim}
            setHoraFim={setHoraFim}
            formato={formato}
            setFormato={setFormato}
            estilos={estilos}
            setEstilos={setEstilos}
            experiencias={experiencias}
            setExperiencias={setExperiencias}
            recorrencia={recorrencia}
            setRecorrencia={setRecorrencia}
            recorrenciaAte={recorrenciaAte}
            setRecorrenciaAte={setRecorrenciaAte}
            comunidade={comunidade}
            localNome={localNome}
            setLocalNome={setLocalNome}
            localEndereco={localEndereco}
            setLocalEndereco={setLocalEndereco}
            localCidade={localCidade}
            setLocalCidade={setLocalCidade}
            onCopiar={() => setCopiarOpen(true)}
            temEventosAnteriores={temEventosAnteriores}
            showClassification={false}
          />
        )}

        {/* ── Step Ingressos + Classificação ── */}
        {currentLabel === 'Ingressos' && (
          <>
            <Step2Ingressos
              lotes={lotes}
              setLotes={setLotes}
              cortesiaEnabled={cortesiaEnabled}
              setCortesiaEnabled={setCortesiaEnabled}
              cortesiaLimites={cortesiaLimites}
              setCortesiaLimites={setCortesiaLimites}
              varTipos={varTipos}
              maisVantaEvento={maisVantaEvento}
              setMaisVantaEvento={setMaisVantaEvento}
              varsLista={varsLista}
              comunidadeId={comunidade.id}
            />

            {/* ── Classificação (formato/estilo/experiência) ── */}
            <div className="mt-6 space-y-3">
              <p className="text-white text-[0.625rem] font-black uppercase tracking-widest">Classificação do Evento</p>
              <p className="text-zinc-400 text-[0.625rem] leading-relaxed">
                Formato e estilo obrigatórios. Experiência é opcional.
              </p>
              <ClassificacaoInline
                formato={formato}
                setFormato={setFormato}
                estilos={estilos}
                setEstilos={setEstilos}
                experiencias={experiencias}
                setExperiencias={setExperiencias}
                tipoComunidade={comunidade.tipo_comunidade}
              />

              {/* ── Classificação Etária ── */}
              <div className="pt-4 space-y-2">
                <p className="text-white text-[0.625rem] font-black uppercase tracking-widest">Classificacao Etaria</p>
                <div className="flex gap-2">
                  {(['LIVRE', '16+', '18+'] as const).map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setClassificacaoEtaria(opt)}
                      className={`flex-1 py-2.5 rounded-xl text-[0.625rem] font-bold uppercase tracking-wider border transition-all active:scale-95 ${
                        classificacaoEtaria === opt
                          ? 'bg-[#FFD300]/15 border-[#FFD300]/40 text-[#FFD300]'
                          : 'bg-zinc-900/50 border-white/5 text-zinc-400'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Step Equipe e Listas (fundidos) ── */}
        {currentLabel === 'Equipe e Listas' && (
          <>
            {isComSocio ? (
              <Step4EquipeSocio
                socio={socio}
                setSocio={setSocio}
                permissoes={permissoes}
                setPermissoes={setPermissoes}
                equipe={equipe}
                setEquipe={setEquipe}
                varsLista={varsLista}
                listasEnabled={listasEnabled}
              />
            ) : (
              <Step4EquipeCasa
                gerente={gerente}
                setGerente={setGerente}
                gerentePermissoes={gerentePermissoes}
                setGerentePermissoes={setGerentePermissoes}
                equipe={equipe}
                setEquipe={setEquipe}
                varsLista={varsLista}
                listasEnabled={listasEnabled}
              />
            )}

            {/* Separador visual */}
            <div className="my-6 border-t border-white/5" />
            <p className="text-white text-[0.625rem] font-black uppercase tracking-widest mb-4">Listas de Convidados</p>

            <Step3Listas
              listasEnabled={listasEnabled}
              setListasEnabled={setListasEnabled}
              varsLista={varsLista}
              setVarsLista={setVarsLista}
              horaInicio={horaInicio}
              horaFim={horaFim}
              lotes={lotes}
            />
          </>
        )}

        {/* ── Step Revisar + Publicar ── */}
        {currentLabel === 'Revisar' && (
          <div className="space-y-5">
            {/* Mini preview card */}
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-zinc-900/60">
              {foto && (
                <img loading="lazy" src={foto} alt={nome} className="w-full aspect-[4/5] max-h-48 object-cover" />
              )}
              <div className="p-4 space-y-2">
                <h3
                  className="text-white font-bold text-lg italic truncate"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {nome || 'Nome do evento'}
                </h3>
                <div className="flex items-center gap-2 text-zinc-400 text-[0.625rem]">
                  <Calendar size="0.75rem" className="shrink-0" />
                  <span>
                    {dataInicio
                      ? new Date(dataInicio + 'T00:00:00').toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '—'}
                  </span>
                  <span className="text-zinc-700">·</span>
                  <span>
                    {horaInicio || '—'} - {horaFim || '—'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400 text-[0.625rem]">
                  <MapPin size="0.75rem" className="shrink-0" />
                  <span className="truncate">
                    {comunidade.tipo_comunidade === 'PRODUTORA' ? localNome : comunidade.nome}
                  </span>
                </div>
              </div>
            </div>

            {/* Resumo */}
            <div className="space-y-2">
              <p className="text-white text-[0.625rem] font-black uppercase tracking-widest">Resumo</p>
              <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 space-y-2.5">
                {vendaVanta && (
                  <div className="flex items-center gap-3">
                    <Ticket size="0.875rem" className="text-zinc-400 shrink-0" />
                    <span className="text-zinc-300 text-xs">
                      {lotes.length} lote{lotes.length !== 1 ? 's' : ''}
                      <span className="text-zinc-600 mx-1.5">·</span>
                      {lotes.reduce((s, l) => s + l.variacoes.length, 0)} variação(ões)
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Users size="0.875rem" className="text-zinc-400 shrink-0" />
                  <span className="text-zinc-300 text-xs">
                    {equipe.length} membro{equipe.length !== 1 ? 's' : ''} na equipe
                    {isComSocio && socio ? ` + sócio (${socio.nome})` : ''}
                  </span>
                </div>
                {listasEnabled && varsLista.length > 0 && (
                  <div className="flex items-center gap-3">
                    <ListChecks size="0.875rem" className="text-zinc-400 shrink-0" />
                    <span className="text-zinc-300 text-xs">
                      {varsLista.length} regra{varsLista.length !== 1 ? 's' : ''} de lista
                    </span>
                  </div>
                )}
                {formato && (
                  <div className="flex items-center gap-3 text-zinc-400">
                    <span className="text-[0.625rem] shrink-0">🧱</span>
                    <span className="text-zinc-300 text-xs truncate">{formato}</span>
                    {estilos.length > 0 && (
                      <>
                        <span className="text-zinc-700">·</span>
                        <span className="text-zinc-300 text-xs truncate">{estilos.join(', ')}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Split financeiro (só COM_SOCIO) */}
            {isComSocio && (
              <div className="space-y-2">
                <p className="text-white text-[0.625rem] font-black uppercase tracking-widest">Split Financeiro</p>
                <Step5Financeiro split={split} setSplit={setSplit} socio={socio} />
              </div>
            )}
          </div>
        )}

        {erro && <p className="mt-4 text-red-400 text-[0.625rem] font-black uppercase tracking-widest">{erro}</p>}
      </div>

      {/* Navegação */}
      <div className="shrink-0 px-6 py-4 border-t border-white/5 bg-[#0A0A0A] flex gap-3">
        {step > 1 && (
          <button
            onClick={voltar}
            className="flex-1 py-3.5 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            Anterior
          </button>
        )}
        <button
          onClick={avancar}
          disabled={isPublicando}
          className={`flex-1 py-3.5 ${isPublicando ? 'bg-zinc-700 text-zinc-400' : 'bg-[#FFD300] text-black'} rounded-xl text-[0.625rem] font-black uppercase tracking-widest active:scale-95 transition-all font-bold`}
        >
          {isPublicando
            ? 'Publicando...'
            : currentLabel === 'Revisar'
              ? tipoFluxo === 'COM_SOCIO'
                ? 'Enviar Convite'
                : 'Publicar'
              : 'Próximo'}
        </button>
      </div>

      {copiarOpen && <CopiarModal onCopiar={handleCopiar} onClose={() => setCopiarOpen(false)} />}
      {capacidadeAviso && (
        <CapacidadeModal
          total={capacidadeAviso.total}
          cap={capacidadeAviso.cap}
          tipo={capacidadeAviso.tipo}
          onConfirmar={capacidadeAviso.onConfirmar}
          onCancelar={() => setCapacidadeAviso(null)}
        />
      )}
      {showExitConfirm && <UnsavedChangesModal onStay={() => setShowExitConfirm(false)} onLeave={onBack} />}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};
