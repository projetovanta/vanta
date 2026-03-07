import React, { useState, useEffect } from 'react';
import { UnsavedChangesModal } from '../../../components/UnsavedChangesModal';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import type { Comunidade, LoteAdmin, MembroEquipeEvento } from '../../../types';
import { eventosAdminService } from '../services/eventosAdminService';
import { listasService } from '../services/listasService';
import { cortesiasService } from '../services/cortesiasService';
import { clubeService } from '../services/clubeService';
import { comunidadesService } from '../services/comunidadesService';

import type {
  LoteForm,
  VarListaForm,
  EquipeForm,
  TipoFluxoEvento,
  SocioConviteForm,
  PermissaoToggle,
  SplitForm,
} from './criarEvento/types';
import type { LoteMaisVantaForm } from './criarEvento/Step2Ingressos';
import { AREA_LABELS } from './criarEvento/constants';
import { novoLote, novaVarLista, uid, buildLabel } from './criarEvento/utils';

import { Step1Evento } from './criarEvento/Step1Evento';
import { Step2Ingressos } from './criarEvento/Step2Ingressos';
import { Step3Listas } from './criarEvento/Step3Listas';
import { Step4EquipeSocio } from './criarEvento/Step4EquipeSocio';
import { Step4EquipeCasa } from './criarEvento/Step4EquipeCasa';
import { Step5Financeiro } from './criarEvento/Step5Financeiro';
import { CapacidadeModal } from './criarEvento/CapacidadeModal';

export const EditarEventoView: React.FC<{
  eventoId: string;
  onBack: () => void;
  currentUserId?: string;
}> = ({ eventoId, onBack, currentUserId }) => {
  const [loading, setLoading] = useState(true);
  const [tipoFluxo, setTipoFluxo] = useState<TipoFluxoEvento>('FESTA_DA_CASA');
  const [step, setStep] = useState(1);
  const [salvo, setSalvo] = useState(false);
  const [salvoMsg, setSalvoMsg] = useState('Evento atualizado com sucesso.');
  const [erro, setErro] = useState('');
  const [comunidade, setComunidade] = useState<Comunidade | null>(null);
  const [capacidadeAviso, setCapacidadeAviso] = useState<{
    total: number;
    cap: number;
    tipo: 'ingressos' | 'lista';
    onConfirmar: () => void;
  } | null>(null);

  // Step 1
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
  const [slug, setSlug] = useState('');
  const [politicaReembolso, setPoliticaReembolso] = useState('');
  const [prazoReembolsoDias, setPrazoReembolsoDias] = useState('7');
  const [isPublished, setIsPublished] = useState(false);

  // Step 2
  const [lotes, setLotes] = useState<LoteForm[]>([novoLote()]);

  // MAIS VANTA
  const [maisVanta, setMaisVanta] = useState<LoteMaisVantaForm>({
    enabled: false,
    tierMinimo: 'BRONZE',
    quantidade: '',
    prazo: '',
    descricao: '',
    comAcompanhante: false,
  });

  // Step 3
  const [cortesiaEnabled, setCortesiaEnabled] = useState(false);
  const [cortesiaLimites, setCortesiaLimites] = useState<Record<string, string>>({});
  const [listasEnabled, setListasEnabled] = useState(false);
  const [varsLista, setVarsLista] = useState<VarListaForm[]>([novaVarLista(0)]);

  // Step 4
  const [equipe, setEquipe] = useState<EquipeForm[]>([]);

  // Com Sócio
  const [socio, setSocio] = useState<SocioConviteForm | null>(null);
  const [permissoes, setPermissoes] = useState<PermissaoToggle[]>([]);
  const [split, setSplit] = useState<SplitForm>({ percentSocio: '70', percentProdutor: '30' });

  // Festa da Casa
  const [gerente, setGerente] = useState<{ membroId: string; nome: string; email: string; foto: string } | null>(null);
  const [gerentePermissoes, setGerentePermissoes] = useState<string[]>([]);

  // UX
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Hidratar dados do evento
  useEffect(() => {
    const ev = eventosAdminService.getEvento(eventoId);
    if (!ev) {
      setErro('Evento não encontrado.');
      setLoading(false);
      return;
    }

    const com = comunidadesService.getAll().find(c => c.id === ev.comunidadeId);
    if (com) setComunidade(com);

    setTipoFluxo(ev.tipoFluxo === 'COM_SOCIO' ? 'COM_SOCIO' : 'FESTA_DA_CASA');
    setIsPublished(ev.publicado === true);
    setFoto(ev.foto || '');
    setNome(ev.nome);
    setDescricao(ev.descricao);
    setFormato(ev.formato || ev.categoria || '');
    setEstilos(ev.estilos || []);
    setExperiencias(ev.experiencias || []);
    const evAny = ev as unknown as Record<string, unknown>;
    setSlug((evAny.slug as string) ?? '');
    setPoliticaReembolso((evAny.politica_reembolso as string) ?? '');
    setPrazoReembolsoDias(String(evAny.prazo_reembolso_dias ?? 7));

    // Datas — extrair de ISO
    if (ev.dataInicio) {
      setDataInicio(ev.dataInicio.slice(0, 10));
      setHoraInicio(ev.dataInicio.slice(11, 16));
    }
    if (ev.dataFim) {
      setHoraFim(ev.dataFim.slice(11, 16));
    }

    // Lotes
    if (ev.lotes?.length) {
      setLotes(
        ev.lotes.map(l => ({
          id: l.id,
          dataValidade: l.dataValidade ? l.dataValidade.slice(0, 10) : '',
          horaValidade: l.dataValidade ? l.dataValidade.slice(11, 16) : '',
          virarPct: l.virarPct != null ? String(l.virarPct) : '',
          variacoes: l.variacoes.map(v => ({
            id: v.id,
            area: v.area,
            areaCustom: v.areaCustom || '',
            genero: v.genero,
            valor: v.valor > 0 ? String(v.valor) : '',
            limite: v.limite > 0 ? String(v.limite) : '',
            requerComprovante: v.requerComprovante ?? false,
            tipoComprovante: v.tipoComprovante || '',
            vendidos: v.vendidos ?? 0,
          })),
          aberto: true,
        })),
      );
    }

    // Cortesias
    const cortCfg = cortesiasService.getCortesiaConfig(eventoId);
    if (cortCfg) {
      setCortesiaEnabled(true);
      if (cortCfg.limitesPorTipo && Object.keys(cortCfg.limitesPorTipo).length > 0) {
        const lim: Record<string, string> = {};
        for (const [k, v] of Object.entries(cortCfg.limitesPorTipo)) lim[k] = String(v);
        setCortesiaLimites(lim);
      } else {
        // fallback: distribuir limite total igualmente entre variacoes
        const lim: Record<string, string> = {};
        for (const v of cortCfg.variacoes) lim[v] = String(Math.ceil(cortCfg.limite / (cortCfg.variacoes.length || 1)));
        setCortesiaLimites(lim);
      }
    }

    // Listas
    const listas = listasService.getListasByEvento(eventoId);
    if (listas.length > 0) {
      setListasEnabled(true);
      const lista = listas[0];
      if (lista.regras?.length) {
        setVarsLista(
          lista.regras.map((r, i) => ({
            id: uid(),
            tipo: 'ENTRADA' as const,
            cor: r.cor || '#FFD300',
            genero: 'UNISEX' as const,
            validadeTipo: r.horaCorte ? ('HORARIO' as const) : ('NOITE_TODA' as const),
            validadeHora: r.horaCorte || '',
            ababoraAtivo: false,
            ababoraAlvoId: '',
            limite: String(r.tetoGlobal),
            valor: r.valor ? String(r.valor) : '',
          })),
        );
      }
    }

    // Equipe
    if (ev.equipe?.length) {
      setEquipe(
        ev.equipe
          .filter(m => m.papel !== 'GERENTE')
          .map(m => ({
            id: uid(),
            membroId: m.id,
            nome: m.nome,
            email: '',
            foto: '',
            papel: m.papel,
            liberarLista: m.papel === 'PROMOTER',
            quotas: [],
          })),
      );

      const gerenteM = ev.equipe.find(m => m.papel === 'GERENTE');
      if (gerenteM) setGerente({ membroId: gerenteM.id, nome: gerenteM.nome, email: '', foto: '' });
    }

    // MAIS VANTA
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

    // Split (Com Sócio)
    if (ev.splitSocio !== undefined)
      setSplit({ percentSocio: String(ev.splitSocio), percentProdutor: String(ev.splitProdutor || 0) });
    if (ev.permissoesProdutor?.length) setPermissoes(ev.permissoesProdutor as PermissaoToggle[]);

    setLoading(false);
  }, [eventoId]);

  const TOTAL_STEPS = tipoFluxo === 'COM_SOCIO' ? 5 : 4;
  const STEP_LABELS =
    tipoFluxo === 'COM_SOCIO'
      ? ['Evento', 'Ingressos', 'Listas', 'Equipe', 'Financeiro']
      : ['Evento', 'Ingressos', 'Listas', 'Equipe'];
  const stepTitles =
    tipoFluxo === 'COM_SOCIO'
      ? ['Sobre o Evento', 'Ingressos e Cortesias', 'Listas de Convidados', 'Equipe e Sócio', 'Split Financeiro']
      : ['Sobre o Evento', 'Ingressos e Cortesias', 'Listas de Convidados', 'Equipe'];

  const varTipos = lotes
    .flatMap(l =>
      l.variacoes.map(v => {
        const area = AREA_LABELS.find(a => a.id === v.area)?.label || v.areaCustom || v.area;
        const gen = v.genero === 'MASCULINO' ? 'Masc.' : v.genero === 'FEMININO' ? 'Fem.' : 'Unissex';
        return `${area} · ${gen}`;
      }),
    )
    .filter((s, i, arr) => arr.indexOf(s) === i);

  const safeBack = () => {
    if (isDirty) setShowExitConfirm(true);
    else onBack();
  };

  // Validações (mesmas do CriarEventoView)
  const validarStep1 = (): boolean => {
    if (!nome.trim()) {
      setErro('Nome é obrigatório.');
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
    if (experiencias.length < 1) {
      setErro('Selecione pelo menos 1 experiência.');
      return false;
    }
    if (experiencias.length > 5) {
      setErro('Máximo de 5 experiências.');
      return false;
    }
    if (horaInicio === horaFim) {
      setErro('Horário de início e encerramento não podem ser iguais.');
      return false;
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
    if (!listasEnabled) return true;
    for (const v of varsLista) {
      if (!v.limite || parseInt(v.limite) <= 0) {
        setErro('Informe o limite de cada variação.');
        return false;
      }
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

  const validarStep5 = (): boolean => {
    const pS = parseInt(split.percentSocio) || 0;
    const pP = parseInt(split.percentProdutor) || 0;
    if (pS + pP !== 100) {
      setErro('O split deve somar 100%.');
      return false;
    }
    return true;
  };

  // Salvar
  const handleSalvar = async () => {
    setErro('');
    try {
      const iso = (date: string, hora: string) => `${date}T${hora}:00-03:00`;
      const isFestaDaCasa = tipoFluxo === 'FESTA_DA_CASA';

      const lotesAdmin: LoteAdmin[] = lotes.map((l, i) => {
        const variacoes = l.variacoes.map(v => ({
          id: v.id,
          area: v.area,
          areaCustom: v.areaCustom || undefined,
          genero: v.genero,
          valor: parseFloat(v.valor),
          limite: parseInt(v.limite),
          vendidos: v.vendidos ?? 0,
          requerComprovante: v.requerComprovante ?? false,
          tipoComprovante: v.tipoComprovante || undefined,
        }));
        return {
          id: l.id || `lote_${Date.now()}_${i}`,
          nome: `Lote ${i + 1}`,
          limitTotal: variacoes.reduce((s, v) => s + v.limite, 0),
          dataValidade: l.dataValidade ? `${l.dataValidade}T${l.horaValidade || '23:59'}:00-03:00` : undefined,
          virarPct: l.virarPct ? parseInt(l.virarPct) : undefined,
          variacoes,
          vendidos: variacoes.reduce((s, v) => s + v.vendidos, 0),
          ativo: i === 0,
        };
      });

      const equipeAdmin: MembroEquipeEvento[] = equipe.map(m => ({ id: m.membroId, nome: m.nome, papel: m.papel }));
      if (isFestaDaCasa && gerente) {
        equipeAdmin.push({
          id: gerente.membroId,
          nome: gerente.nome,
          papel: 'GERENTE',
          permissoes: gerentePermissoes.length > 0 ? gerentePermissoes : undefined,
        });
      }

      const updates = {
        foto,
        nome: nome.trim(),
        descricao: descricao.trim(),
        dataInicio: iso(dataInicio, horaInicio),
        dataFim: iso(dataFim, horaFim),
        lotes: lotesAdmin,
        equipe: equipeAdmin,
        formato: formato || undefined,
        estilos: estilos.length > 0 ? estilos : undefined,
        experiencias: experiencias.length > 0 ? experiencias : undefined,
        splitProdutor: tipoFluxo === 'COM_SOCIO' ? parseInt(split.percentProdutor) || 0 : undefined,
        splitSocio: tipoFluxo === 'COM_SOCIO' ? parseInt(split.percentSocio) || 0 : undefined,
        permissoesProdutor: tipoFluxo === 'COM_SOCIO' ? permissoes : undefined,
        slug: slug.trim() || undefined,
        politica_reembolso: politicaReembolso.trim() || undefined,
        prazo_reembolso_dias: parseInt(prazoReembolsoDias) || 7,
      };

      // 9p: submeter para aprovação se evento publicado, senão salva direto
      const foiParaAprovacao = await eventosAdminService.submeterEdicao(eventoId, updates, currentUserId ?? '');
      setSalvoMsg(foiParaAprovacao ? 'Edição enviada para aprovação.' : 'Evento atualizado com sucesso.');

      // Atualizar cortesias
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
      if (cortesiaConfig) {
        await cortesiasService.initCortesia(eventoId, cortesiaConfig);
      }

      // Criar ou atualizar lista
      if (listasEnabled) {
        const regrasValidas = varsLista.filter(v => parseInt(v.limite) > 0);
        if (regrasValidas.length > 0) {
          const existingListas = listasService.getListasByEvento(eventoId);
          const regrasPayload = regrasValidas.map(v => ({
            label: buildLabel(v),
            tetoGlobal: parseInt(v.limite),
            cor: v.cor,
            valor: v.tipo !== 'VIP' && v.valor ? parseFloat(v.valor) : undefined,
            horaCorte: v.validadeTipo === 'HORARIO' && v.validadeHora ? v.validadeHora : undefined,
          }));
          if (existingListas.length === 0) {
            await listasService.criarLista({
              eventoId,
              eventoNome: nome.trim(),
              eventoData: dataInicio,
              eventoDataFim: dataFim,
              eventoLocal: comunidade?.nome ?? '',
              tetoGlobalTotal: regrasValidas.reduce((s, v) => s + parseInt(v.limite), 0),
              regras: regrasPayload,
            });
          } else {
            // Atualizar regras da lista existente
            await listasService.atualizarRegras(existingListas[0].id, regrasPayload);
          }
        }
      }

      // MAIS VANTA — upsert lotes por tier ou remover
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

      setSalvo(true);
    } catch (e) {
      setErro('Erro ao salvar evento. Tente novamente.');
    }
  };

  // Navegação
  const avancar = () => {
    setErro('');
    setIsDirty(true);
    if (step === 1 && !validarStep1()) return;
    if (step === 2) {
      if (!validarStep2()) return;
      if (comunidade?.capacidadeMax) {
        const total = lotes.reduce((s, l) => s + l.variacoes.reduce((sv, v) => sv + (parseInt(v.limite) || 0), 0), 0);
        if (total > comunidade.capacidadeMax) {
          setCapacidadeAviso({
            total,
            cap: comunidade.capacidadeMax,
            tipo: 'ingressos',
            onConfirmar: () => {
              setCapacidadeAviso(null);
              setStep(3);
            },
          });
          return;
        }
      }
    }
    if (step === 3) {
      if (!validarStep3()) return;
      if (listasEnabled && comunidade?.capacidadeMax) {
        const total = varsLista.reduce((s, v) => s + (parseInt(v.limite) || 0), 0);
        if (total > comunidade.capacidadeMax) {
          setCapacidadeAviso({
            total,
            cap: comunidade.capacidadeMax,
            tipo: 'lista',
            onConfirmar: () => {
              setCapacidadeAviso(null);
              setStep(4);
            },
          });
          return;
        }
      }
    }
    if (step === 4 && !validarStep4()) return;
    if (step === TOTAL_STEPS) {
      if (tipoFluxo === 'COM_SOCIO' && !validarStep5()) return;
      handleSalvar();
      return;
    }
    setStep(s => s + 1);
  };

  const voltar = () => {
    setErro('');
    setStep(s => s - 1);
  };

  if (loading) {
    return (
      <div className="absolute inset-0 bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 size={24} className="text-zinc-600 animate-spin" />
      </div>
    );
  }

  if (salvo) {
    return (
      <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center p-10 gap-6">
        <div className="w-20 h-20 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center">
          <Check size={36} className="text-emerald-400" />
        </div>
        <div className="text-center">
          <h2 style={TYPOGRAPHY.screenTitle} className="text-2xl italic mb-2">
            {nome}
          </h2>
          <p className="text-zinc-500 text-sm leading-relaxed">{salvoMsg}</p>
        </div>
        <button
          onClick={onBack}
          className="w-full max-w-xs py-4 bg-zinc-800 border border-white/10 text-zinc-300 font-bold text-[10px] uppercase tracking-[0.3em] rounded-2xl active:scale-[0.98] transition-all"
        >
          Voltar
        </button>
      </div>
    );
  }

  if (!comunidade) {
    return (
      <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center p-10 gap-4">
        <p className="text-red-400 text-sm font-bold">Comunidade não encontrada para este evento.</p>
        <button onClick={onBack} className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">
          Voltar
        </button>
      </div>
    );
  }

  const stepTitle = stepTitles[step - 1];

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-4 shrink-0">
        <div className="flex justify-between items-start mb-5">
          <div className="flex-1 min-w-0 mr-3">
            <p style={TYPOGRAPHY.sectionKicker} className="mb-1">
              Editar Evento · {comunidade.nome}
              <span className="ml-2 text-zinc-700">
                {tipoFluxo === 'COM_SOCIO' ? '(Com Sócio)' : '(Festa da Casa)'}
              </span>
            </p>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic">
              {stepTitle}
            </h1>
          </div>
          <button
            onClick={safeBack}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all shrink-0 mt-1"
          >
            <ArrowLeft size={18} className="text-zinc-400" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black border transition-all shrink-0 ${
                  step === s
                    ? 'bg-[#FFD300] border-[#FFD300] text-black'
                    : step > s
                      ? 'bg-[#FFD300]/15 border-[#FFD300]/30 text-[#FFD300]'
                      : 'bg-zinc-900 border-white/10 text-zinc-600'
                }`}
              >
                {step > s ? <Check size={10} /> : s}
              </div>
              {i < TOTAL_STEPS - 1 && <div className={`flex-1 h-px ${step > s ? 'bg-[#FFD300]/20' : 'bg-white/5'}`} />}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          {STEP_LABELS.map((l, i) => (
            <p
              key={l}
              className={`text-[7px] font-black uppercase tracking-widest ${step === i + 1 ? 'text-[#FFD300]' : 'text-zinc-700'}`}
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
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 max-w-3xl mx-auto w-full">
        {step === 1 && (
          <>
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
              comunidade={comunidade}
              onCopiar={() => {}}
              temEventosAnteriores={false}
            />
            {/* Campos extras — Slug + Reembolso (só no editar) */}
            <div className="mt-6 space-y-4">
              <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Link Público</p>
              <div>
                <label className="text-zinc-500 text-[10px] font-bold mb-1 block">
                  Slug (URL pública: /evento/slug)
                </label>
                <input
                  value={slug}
                  onChange={e => {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                    setIsDirty(true);
                  }}
                  placeholder="ex: festa-verao-2026"
                  className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-xl text-white text-sm placeholder:text-zinc-700 outline-none focus:border-[#FFD300]/30"
                />
                {slug && (
                  <p className="text-zinc-600 text-[9px] mt-1">
                    {window.location.origin}/evento/{slug}
                  </p>
                )}
              </div>
              <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mt-4">
                Política de Reembolso
              </p>
              <div>
                <label className="text-zinc-500 text-[10px] font-bold mb-1 block">Prazo (dias)</label>
                <input
                  value={prazoReembolsoDias}
                  onChange={e => {
                    setPrazoReembolsoDias(e.target.value);
                    setIsDirty(true);
                  }}
                  type="number"
                  min="0"
                  className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-xl text-white text-sm placeholder:text-zinc-700 outline-none focus:border-[#FFD300]/30"
                />
              </div>
              <div>
                <label className="text-zinc-500 text-[10px] font-bold mb-1 block">Condições (texto livre)</label>
                <textarea
                  value={politicaReembolso}
                  onChange={e => {
                    setPoliticaReembolso(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Descreva as condições de reembolso..."
                  rows={3}
                  className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-xl text-white text-sm placeholder:text-zinc-700 outline-none focus:border-[#FFD300]/30 resize-none"
                />
              </div>
            </div>
          </>
        )}
        {step === 2 && (
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
            comunidadeId={comunidade?.id}
            isPublished={isPublished}
          />
        )}
        {step === 3 && (
          <Step3Listas
            listasEnabled={listasEnabled}
            setListasEnabled={setListasEnabled}
            varsLista={varsLista}
            setVarsLista={setVarsLista}
          />
        )}
        {step === 4 && tipoFluxo === 'COM_SOCIO' && (
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
        )}
        {step === 4 && tipoFluxo === 'FESTA_DA_CASA' && (
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
        {step === 5 && tipoFluxo === 'COM_SOCIO' && <Step5Financeiro split={split} setSplit={setSplit} socio={socio} />}
        {erro && <p className="mt-4 text-red-400 text-[10px] font-black uppercase tracking-widest">{erro}</p>}
      </div>

      {/* Navegação */}
      <div className="shrink-0 px-6 py-4 border-t border-white/5 bg-[#0A0A0A] flex gap-3">
        {step > 1 && (
          <button
            onClick={voltar}
            className="flex-1 py-3.5 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            Anterior
          </button>
        )}
        <button
          onClick={avancar}
          className="flex-1 py-3.5 bg-[#FFD300] text-black rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all font-bold"
        >
          {step === TOTAL_STEPS ? 'Salvar Alterações' : 'Próximo'}
        </button>
      </div>

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
    </div>
  );
};
