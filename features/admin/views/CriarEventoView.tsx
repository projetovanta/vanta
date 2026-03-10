import React, { useState, useMemo, useEffect } from 'react';
import { UnsavedChangesModal } from '../../../components/UnsavedChangesModal';
import { ArrowLeft, Check, Clock, Mail } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
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
import type { LoteMaisVantaForm } from './criarEvento/Step2Ingressos';
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

  // ── Step 2 ──
  const [lotes, setLotes] = useState<LoteForm[]>([novoLote()]);

  // ── MAIS VANTA ──
  const [maisVanta, setMaisVanta] = useState<LoteMaisVantaForm>({
    enabled: false,
    tierMinimo: 'CONVIDADO',
    quantidade: '',
    prazo: '',
    descricao: '',
    comAcompanhante: false,
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

  // ── Dinâmico por fluxo (4 combinações) ──
  const isComSocio = tipoFluxo === 'COM_SOCIO';
  const buildSteps = (): { labels: string[]; titles: string[] } => {
    if (vendaVanta && isComSocio)
      return {
        labels: ['Evento', 'Ingressos', 'Listas', 'Equipe', 'Financeiro'],
        titles: [
          'Sobre o Evento',
          'Ingressos e Cortesias',
          'Listas de Convidados',
          'Equipe e Sócio',
          'Split Financeiro',
        ],
      };
    if (vendaVanta && !isComSocio)
      return {
        labels: ['Evento', 'Ingressos', 'Listas', 'Equipe'],
        titles: ['Sobre o Evento', 'Ingressos e Cortesias', 'Listas de Convidados', 'Equipe'],
      };
    if (!vendaVanta && isComSocio)
      return {
        labels: ['Evento', 'Listas', 'Equipe', 'Financeiro'],
        titles: ['Sobre o Evento', 'Listas de Convidados', 'Equipe e Sócio', 'Split Financeiro'],
      };
    // SEM VENDA + FESTA DA CASA
    return {
      labels: ['Evento', 'Listas', 'Equipe'],
      titles: ['Sobre o Evento', 'Listas de Convidados', 'Equipe'],
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
  const validarStep1 = (): boolean => {
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
    if (pS < 0 || pP < 0) {
      setErro('Percentuais não podem ser negativos.');
      return false;
    }
    return true;
  };

  // ── Publicar ──
  const handlePublicar = async () => {
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
        local: comunidade.nome,
        endereco: `${comunidade.endereco}, ${comunidade.cidade}`,
        cidade: comunidade.cidade,
        coords: comunidade.coords,
        lotes: lotesAdmin,
        equipe: equipeAdmin,
        comunidade: { id: comunidade.id, nome: comunidade.nome, foto: comunidade.foto },
        publicado: false,
        cortesia: cortesiaConfig,
        criadorId: currentUserId,
        criadorNome: currentUserNome,
        tipoFluxo: tipoFluxo ?? undefined,
        vendaVanta,
        statusEvento: isFestaDaCasa ? 'PENDENTE' : 'NEGOCIANDO',
        socioConvidadoId: socio?.membroId,
        splitProdutor: tipoFluxo === 'COM_SOCIO' ? parseInt(split.percentProdutor) || 0 : undefined,
        splitSocio: tipoFluxo === 'COM_SOCIO' ? parseInt(split.percentSocio) || 0 : undefined,
        permissoesProdutor: tipoFluxo === 'COM_SOCIO' ? permissoes : undefined,
        formato: formato || undefined,
        estilos: estilos.length > 0 ? estilos : undefined,
        experiencias: experiencias.length > 0 ? experiencias : undefined,
        recorrencia: (recorrencia as 'UNICO' | 'SEMANAL' | 'QUINZENAL' | 'MENSAL') || undefined,
        recorrenciaAte: recorrenciaAte || undefined,
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

      // MAIS VANTA — criar lotes por tier se habilitado
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
          // Fallback legado: lote único
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
        const regrasValidas = varsLista.filter(v => parseInt(v.limite) > 0);
        if (regrasValidas.length > 0) {
          const listaId = await listasService.criarLista({
            eventoId,
            eventoNome: nome.trim(),
            eventoData: dataInicio,
            eventoDataFim: dataFim,
            eventoLocal: comunidade.nome,
            tetoGlobalTotal: regrasValidas.reduce((s, v) => s + parseInt(v.limite), 0),
            regras: regrasValidas.map(v => ({
              label: buildLabel(v),
              tetoGlobal: parseInt(v.limite),
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

      setPublicado(true);
    } catch (e) {
      setErro('Erro ao publicar evento. Tente novamente.');
    }
  };

  // ── Navegação ──
  const currentLabel = STEP_LABELS[step - 1];
  const avancar = () => {
    setErro('');
    if (currentLabel === 'Evento' && !validarStep1()) return;
    if (currentLabel === 'Ingressos') {
      if (!validarStep2()) return;
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
    if (currentLabel === 'Listas') {
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
    if (currentLabel === 'Equipe' && !validarStep4()) return;
    if (step === TOTAL_STEPS) {
      if (isComSocio && !validarStep5()) return;
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
        <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-4 shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0 mr-3">
              <p style={TYPOGRAPHY.sectionKicker} className="mb-1">
                Criar Evento · {comunidade.nome}
              </p>
              <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic">
                Tipo de Evento
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
    return (
      <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center p-10 gap-6">
        <div className="w-20 h-20 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center">
          <Clock size={36} className="text-zinc-400" />
        </div>
        <div className="text-center">
          <h2 style={TYPOGRAPHY.screenTitle} className="text-2xl italic mb-2">
            {nome}
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            {isComSocio ? (
              <>
                Convite enviado ao sócio.
                <br />
                Após aceite, o evento segue para aprovação do Master.
              </>
            ) : (
              <>
                Evento enviado para aprovação.
                <br />
                Aguarde a análise do Master VANTA.
              </>
            )}
          </p>
        </div>
        <div className="w-full max-w-xs bg-zinc-900/60 border border-white/5 rounded-2xl p-4 text-center">
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">Status</p>
          <p className="font-bold text-sm text-amber-400">{isComSocio ? 'Aguardando sócio' : 'Aguardando aprovação'}</p>
        </div>
        {isComSocio && socio?.email && (
          <button
            onClick={async () => {
              try {
                const {
                  data: { session },
                } = await supabase.auth.getSession();
                const token = session?.access_token ?? '';
                const res = await supabase.functions.invoke('send-invite', {
                  body: {
                    nome: socio.nome,
                    email: socio.email,
                    masterNome: currentUserNome ?? 'Produtor',
                    assunto: `Convite VANTA — ${nome}`,
                    mensagem: `Você foi convidado(a) para ser sócio(a) do evento "${nome}".\n\nData: ${dataInicio} às ${horaInicio}\nLocal: ${comunidade.nome}\nSplit: ${split.percentSocio}% Sócio / ${split.percentProdutor}% Produtor\n\nAbra o app VANTA para aceitar ou recusar o convite.`,
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
            }}
            disabled={conviteEnviado}
            className={`w-full max-w-xs py-4 font-bold text-[10px] uppercase tracking-[0.3em] rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${conviteEnviado ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-[#FFD300] text-black'}`}
          >
            {conviteEnviado ? (
              <>
                <Check size={14} /> Convite enviado!
              </>
            ) : (
              <>
                <Mail size={14} /> Enviar convite por email
              </>
            )}
          </button>
        )}
        <button
          onClick={onBack}
          className="w-full max-w-xs py-4 bg-zinc-800 border border-white/10 text-zinc-300 font-bold text-[10px] uppercase tracking-[0.3em] rounded-2xl active:scale-[0.98] transition-all"
        >
          Voltar para a Comunidade
        </button>
      </div>
    );
  }

  // ── Formulário principal ──
  const stepTitle = stepTitles[step - 1];

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-4 shrink-0">
        <div className="flex justify-between items-start mb-5">
          <div className="flex-1 min-w-0 mr-3">
            <p style={TYPOGRAPHY.sectionKicker} className="mb-1">
              Criar Evento · {comunidade.nome}
              <span className="ml-2 text-zinc-700">
                {isComSocio ? '(Com Sócio)' : '(Festa da Casa)'}
                {!vendaVanta ? ' · Sem Venda' : ''}
              </span>
            </p>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic">
              {stepTitle}
            </h1>
          </div>
          <button
            aria-label="Voltar"
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
                      : 'bg-zinc-900 border-white/10 text-zinc-400'
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
            onCopiar={() => setCopiarOpen(true)}
            temEventosAnteriores={temEventosAnteriores}
          />
        )}
        {STEP_LABELS[step - 1] === 'Ingressos' && (
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
            comunidadeId={comunidade.id}
          />
        )}
        {STEP_LABELS[step - 1] === 'Listas' && (
          <Step3Listas
            listasEnabled={listasEnabled}
            setListasEnabled={setListasEnabled}
            varsLista={varsLista}
            setVarsLista={setVarsLista}
            horaInicio={horaInicio}
            horaFim={horaFim}
            lotes={lotes}
          />
        )}
        {STEP_LABELS[step - 1] === 'Equipe' && isComSocio && (
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
        {STEP_LABELS[step - 1] === 'Equipe' && !isComSocio && (
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
        {STEP_LABELS[step - 1] === 'Financeiro' && <Step5Financeiro split={split} setSplit={setSplit} socio={socio} />}
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
          {step === TOTAL_STEPS ? (tipoFluxo === 'COM_SOCIO' ? 'Enviar Convite' : 'Enviar para Aprovação') : 'Próximo'}
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
    </div>
  );
};
