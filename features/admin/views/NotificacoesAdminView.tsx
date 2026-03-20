import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Send,
  Loader2,
  Check,
  Bell,
  Users,
  Mail,
  Smartphone,
  Building2,
  Calendar,
  MapPin,
  Tag,
  ChevronDown,
  UserCog,
  Crown,
  Wallet,
  Target,
} from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { AdminViewHeader } from '../components/AdminViewHeader';
import { useToast, ToastContainer } from '../../../components/Toast';
import { supabase } from '../../../services/supabaseClient';
import {
  campanhasService,
  type CanalCampanha,
  type SegmentoAlvo,
  type CampanhaResultado,
} from '../services/campanhasService';
import {
  pushTemplatesService,
  pushAgendadosService,
  type PushTemplate,
  type PushAgendado,
} from '../services/pushTemplatesService';
import { useAuthStore } from '../../../stores/authStore';

type SegmentoTipo = 'TODOS' | 'TAG' | 'COMUNIDADE' | 'EVENTO' | 'CIDADE';
type TipoAcao = 'AVISO' | 'NOVO_EVENTO' | 'COMPLETAR_CADASTRO' | 'VER_COMUNIDADE' | 'CONVITE_CLUBE' | 'IR_CARTEIRA';

const ACOES: { id: TipoAcao; label: string; icon: React.ElementType; needsValue: boolean }[] = [
  { id: 'AVISO', label: 'Aviso Geral', icon: Bell, needsValue: false },
  { id: 'NOVO_EVENTO', label: 'Novo Evento', icon: Calendar, needsValue: true },
  { id: 'COMPLETAR_CADASTRO', label: 'Completar Cadastro', icon: UserCog, needsValue: false },
  { id: 'VER_COMUNIDADE', label: 'Ver Comunidade', icon: Building2, needsValue: true },
  { id: 'CONVITE_CLUBE', label: 'Convite Clube', icon: Crown, needsValue: false },
  { id: 'IR_CARTEIRA', label: 'Ir para Carteira', icon: Wallet, needsValue: false },
];

type ActiveTab = 'ENVIAR' | 'TEMPLATES' | 'AGENDADOS';

export const NotificacoesAdminView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const userId = useAuthStore(s => s.currentAccount?.id);
  const { toasts, dismiss, toast } = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTab>('ENVIAR');
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [canais, setCanais] = useState<CanalCampanha[]>(['IN_APP']);
  const [acao, setAcao] = useState<TipoAcao>('AVISO');
  const [acaoValor, setAcaoValor] = useState('');
  const [acaoDropdownOpen, setAcaoDropdownOpen] = useState(false);
  const [segTipo, setSegTipo] = useState<SegmentoTipo>('TODOS');
  const [segValor, setSegValor] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'SENDING' | 'SENT'>('IDLE');
  const [resultado, setResultado] = useState<CampanhaResultado | null>(null);
  const [destCount, setDestCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(false);

  // Agendamento
  const [agendarPara, setAgendarPara] = useState('');

  // Templates
  const [templates, setTemplates] = useState<PushTemplate[]>([]);
  const [templateNome, setTemplateNome] = useState('');
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateMsg, setTemplateMsg] = useState('');

  // Agendados
  const [agendados, setAgendados] = useState<PushAgendado[]>([]);
  const [loadingAgendados, setLoadingAgendados] = useState(false);

  // Carregar templates e agendados
  useEffect(() => {
    pushTemplatesService.listar().then(setTemplates).catch(console.error);
  }, []);

  useEffect(() => {
    if (activeTab === 'AGENDADOS') {
      setLoadingAgendados(true);
      pushAgendadosService
        .listar()
        .then(setAgendados)
        .catch(console.error)
        .finally(() => setLoadingAgendados(false));
    }
  }, [activeTab]);

  const loadTemplate = (t: PushTemplate) => {
    setTitulo(t.titulo);
    setMensagem(t.mensagem);
    setCanais(t.canais);
    setAcao((t.tipo_acao || 'AVISO') as TipoAcao);
    setAcaoValor(t.acao_valor || '');
    setActiveTab('ENVIAR');
  };

  const saveAsTemplate = async () => {
    if (!userId || !templateNome.trim() || !titulo.trim()) return;
    setSavingTemplate(true);
    try {
      const t = await pushTemplatesService.criar(
        { nome: templateNome.trim(), titulo, mensagem, canais, tipo_acao: acao, acao_valor: acaoValor },
        userId,
      );
      setTemplates(prev => [t, ...prev]);
      setTemplateNome('');
      setTemplateMsg('Template salvo!');
      setTimeout(() => setTemplateMsg(''), 3000);
    } catch (err) {
      console.error('[NotificacoesAdmin] salvar template:', err);
      setTemplateMsg('Erro ao salvar');
    } finally {
      setSavingTemplate(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      await pushTemplatesService.deletar(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('[NotificacoesAdmin] deletar template:', err);
    }
  };

  const cancelarAgendado = async (id: string) => {
    try {
      await pushAgendadosService.cancelar(id);
      setAgendados(prev => prev.map(a => (a.id === id ? { ...a, status: 'CANCELADO' as const } : a)));
    } catch (err) {
      console.error('[NotificacoesAdmin] cancelar agendado:', err);
    }
  };

  // Dados para dropdowns
  const [tags, setTags] = useState<string[]>([]);
  const [comunidades, setComunidades] = useState<{ id: string; nome: string }[]>([]);
  const [eventos, setEventos] = useState<{ id: string; nome: string }[]>([]);
  const [cidades, setCidades] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    // Tags distintas de membros_clube.tags
    Promise.resolve(supabase.from('membros_clube').select('tags').not('tags', 'is', null))
      .then(({ data }) => {
        const set = new Set<string>();
        (data ?? []).forEach((r: Record<string, unknown>) => {
          const arr = r.tags as string[] | null;
          arr?.forEach(t => set.add(t));
        });
        setTags(Array.from(set).sort());
      })
      .catch(console.error);
    campanhasService.getComunidades().then(setComunidades).catch(console.error);
    campanhasService.getEventos().then(setEventos).catch(console.error);
    campanhasService.getCidades().then(setCidades).catch(console.error);
  }, []);

  // Construir segmento a partir do estado
  const buildSegmento = useCallback((): SegmentoAlvo => {
    switch (segTipo) {
      case 'TAG':
        return { tipo: 'TAG', tag: segValor };
      case 'COMUNIDADE':
        return { tipo: 'COMUNIDADE', comunidadeId: segValor };
      case 'EVENTO':
        return { tipo: 'EVENTO', eventoId: segValor };
      case 'CIDADE':
        return { tipo: 'CIDADE', cidade: segValor };
      default:
        return { tipo: 'TODOS' };
    }
  }, [segTipo, segValor]);

  // Atualizar contagem de destinatários
  useEffect(() => {
    if (segTipo !== 'TODOS' && !segValor) {
      setDestCount(null);
      return;
    }
    setCountLoading(true);
    const seg = buildSegmento();
    campanhasService
      .contarDestinatarios(seg)
      .then(c => setDestCount(c))
      .catch(() => setDestCount(null))
      .finally(() => setCountLoading(false));
  }, [segTipo, segValor, buildSegmento]);

  const toggleCanal = (c: CanalCampanha) => {
    setCanais(prev => {
      if (prev.includes(c)) {
        const next = prev.filter(x => x !== c);
        return next.length > 0 ? next : prev; // pelo menos 1
      }
      return [...prev, c];
    });
  };

  const acaoNeedsValue = ACOES.find(a => a.id === acao)?.needsValue ?? false;
  const acaoReady = !acaoNeedsValue || acaoValor.length > 0;

  const resolveAcao = (): {
    tipo:
      | 'EVENTO'
      | 'AMIGO'
      | 'SISTEMA'
      | 'ANIVERSARIO'
      | 'FRIEND_REQUEST'
      | 'FRIEND_ACCEPTED'
      | 'SOCIO_ADICIONADO'
      | 'CORTESIA_PENDENTE'
      | 'REVIEW'
      | 'TRANSFERENCIA_PENDENTE';
    link: string;
  } => {
    switch (acao) {
      case 'NOVO_EVENTO':
        return { tipo: 'EVENTO', link: acaoValor };
      case 'COMPLETAR_CADASTRO':
        return { tipo: 'SISTEMA', link: 'EDIT_PROFILE' };
      case 'VER_COMUNIDADE':
        return { tipo: 'SISTEMA', link: `comunidade:${acaoValor}` };
      case 'CONVITE_CLUBE':
        return { tipo: 'SISTEMA', link: 'CLUBE' };
      case 'IR_CARTEIRA':
        return { tipo: 'SISTEMA', link: 'WALLET' };
      default:
        return { tipo: 'SISTEMA', link: '' };
    }
  };

  const getAcaoLabel = (): string => {
    switch (acao) {
      case 'NOVO_EVENTO': {
        const ev = eventos.find(e => e.id === acaoValor);
        return ev ? `→ Evento: ${ev.nome}` : '→ Novo Evento';
      }
      case 'VER_COMUNIDADE': {
        const com = comunidades.find(c => c.id === acaoValor);
        return com ? `→ Comunidade: ${com.nome}` : '→ Comunidade';
      }
      case 'COMPLETAR_CADASTRO':
        return '→ Completar Cadastro';
      case 'CONVITE_CLUBE':
        return '→ Convite Clube';
      case 'IR_CARTEIRA':
        return '→ Carteira';
      default:
        return '';
    }
  };

  const canSend =
    titulo.trim().length > 0 &&
    mensagem.trim().length > 0 &&
    canais.length > 0 &&
    (segTipo === 'TODOS' || segValor) &&
    acaoReady;

  // Label do segmento para preview
  const getSegLabel = (): string => {
    switch (segTipo) {
      case 'TODOS':
        return 'Todos os membros';
      case 'TAG':
        return segValor ? `Tag: ${segValor}` : 'Tag';
      case 'COMUNIDADE':
        return comunidades.find(c => c.id === segValor)?.nome
          ? `Seguidores: ${comunidades.find(c => c.id === segValor)!.nome}`
          : 'Comunidade';
      case 'EVENTO':
        return eventos.find(e => e.id === segValor)?.nome
          ? `Evento: ${eventos.find(e => e.id === segValor)!.nome}`
          : 'Evento';
      case 'CIDADE':
        return segValor ? `Cidade: ${segValor}` : 'Cidade';
      default:
        return 'Todos';
    }
  };

  const handleSend = async () => {
    if (!canSend) return;
    setStatus('SENDING');
    setResultado(null);

    const { tipo: tipoNotif, link: linkNotif } = resolveAcao();

    // Se tem data de agendamento → salvar como agendado
    if (agendarPara && userId) {
      try {
        const seg = buildSegmento();
        const agendado = await pushAgendadosService.agendar(
          {
            titulo: titulo.trim(),
            mensagem: mensagem.trim(),
            canais,
            segmento_tipo: seg.tipo,
            segmento_valor:
              'tag' in seg
                ? seg.tag
                : 'comunidadeId' in seg
                  ? seg.comunidadeId
                  : 'eventoId' in seg
                    ? seg.eventoId
                    : 'cidade' in seg
                      ? seg.cidade
                      : '',
            tipo_acao: acao,
            acao_valor: acaoValor,
            link_notif: linkNotif,
            agendar_para: agendarPara,
          },
          userId,
        );
        setAgendados(prev => [agendado, ...prev]);
        setStatus('SENT');
      } catch (err) {
        console.error('[NotificacoesAdminView] erro agendar:', err);
        setStatus('SENT');
      }
    } else {
      // Enviar agora
      try {
        const res = await campanhasService.disparar({
          titulo: titulo.trim(),
          mensagem: mensagem.trim(),
          canais,
          segmento: buildSegmento(),
          tipoNotif,
          linkNotif,
        });
        setResultado(res);
        setStatus('SENT');
      } catch (err) {
        console.error('[NotificacoesAdminView] erro:', err);
        setStatus('SENT');
      }
    }

    setTimeout(() => {
      setStatus('IDLE');
      setTitulo('');
      setMensagem('');
      setCanais(['IN_APP']);
      setAcao('AVISO');
      setAcaoValor('');
      setSegTipo('TODOS');
      setSegValor('');
      setAgendarPara('');
      setResultado(null);
    }, 5000);
  };

  const SEGMENTOS: { tipo: SegmentoTipo; label: string; icon: React.ElementType; needsValue: boolean }[] = [
    { tipo: 'TODOS', label: 'Todos', icon: Users, needsValue: false },
    { tipo: 'TAG', label: 'Tag', icon: Tag, needsValue: true },
    { tipo: 'COMUNIDADE', label: 'Comunidade', icon: Building2, needsValue: true },
    { tipo: 'EVENTO', label: 'Evento', icon: Calendar, needsValue: true },
    { tipo: 'CIDADE', label: 'Cidade', icon: MapPin, needsValue: true },
  ];

  // Opções do dropdown com base no segmento selecionado
  const getDropdownOptions = (): { value: string; label: string }[] => {
    switch (segTipo) {
      case 'TAG':
        return tags.map(t => ({ value: t, label: t }));
      case 'COMUNIDADE':
        return comunidades.map(c => ({ value: c.id, label: c.nome }));
      case 'EVENTO':
        return eventos.map(e => ({ value: e.id, label: e.nome }));
      case 'CIDADE':
        return cidades.map(c => ({ value: c, label: c }));
      default:
        return [];
    }
  };

  const dropdownOptions = getDropdownOptions();

  return (
    <div className="flex-1 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <AdminViewHeader title="Campanhas" kicker="Portal Admin" onBack={onBack} />

      {/* Tabs */}
      <div className="flex gap-1 px-5 py-3 border-b border-white/5 shrink-0 overflow-x-auto no-scrollbar">
        {(['ENVIAR', 'TEMPLATES', 'AGENDADOS'] as ActiveTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-[0.5625rem] font-bold uppercase tracking-wider transition-all shrink-0 ${
              activeTab === tab
                ? 'bg-[#FFD300]/15 text-[#FFD300] border border-[#FFD300]/20'
                : 'text-zinc-400 active:bg-white/5'
            }`}
          >
            {tab === 'ENVIAR' ? 'Enviar' : tab === 'TEMPLATES' ? 'Templates' : 'Agendados'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar max-w-3xl mx-auto w-full">
        {/* ── Tab: Templates ── */}
        {activeTab === 'TEMPLATES' && (
          <div className="p-5 space-y-4">
            {templates.length === 0 ? (
              <div className="text-center py-12">
                <Bell size={32} className="text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400 text-sm">Nenhum template salvo</p>
                <p className="text-zinc-500 text-xs mt-1">Crie uma campanha e salve como template</p>
              </div>
            ) : (
              templates.map(t => (
                <div key={t.id} className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[#FFD300] text-[0.5rem] font-black uppercase tracking-widest mb-1">{t.nome}</p>
                      <p className="text-white text-sm font-bold truncate">{t.titulo}</p>
                      <p className="text-zinc-400 text-xs line-clamp-2 mt-0.5">{t.mensagem}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => loadTemplate(t)}
                        className="min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center bg-[#FFD300]/10 border border-[#FFD300]/20 rounded-xl active:scale-90 transition-all"
                      >
                        <Send size="0.75rem" className="text-[#FFD300]" />
                      </button>
                      <button
                        onClick={() => deleteTemplate(t.id)}
                        className="min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center bg-red-500/10 border border-red-500/20 rounded-xl active:scale-90 transition-all"
                      >
                        <span className="text-red-400 text-xs font-bold">×</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {t.canais.map(c => (
                      <span
                        key={c}
                        className="text-[0.4375rem] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-white/5"
                      >
                        {c === 'IN_APP' ? 'In-App' : c === 'PUSH' ? 'Push' : 'Email'}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Tab: Agendados ── */}
        {activeTab === 'AGENDADOS' && (
          <div className="p-5 space-y-4">
            {loadingAgendados ? (
              <div className="text-center py-12">
                <Loader2 size={24} className="text-zinc-400 mx-auto animate-spin" />
              </div>
            ) : agendados.length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={32} className="text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400 text-sm">Nenhuma campanha agendada</p>
                <p className="text-zinc-500 text-xs mt-1">Ao enviar, escolha uma data futura</p>
              </div>
            ) : (
              agendados.map(a => {
                const isPendente = a.status === 'PENDENTE';
                const statusColor =
                  a.status === 'ENVIADO'
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    : a.status === 'CANCELADO'
                      ? 'text-zinc-500 bg-zinc-800 border-white/5'
                      : a.status === 'ERRO'
                        ? 'text-red-400 bg-red-500/10 border-red-500/20'
                        : 'text-[#FFD300] bg-[#FFD300]/10 border-[#FFD300]/20';
                return (
                  <div key={a.id} className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-sm font-bold truncate">{a.titulo}</p>
                        <p className="text-zinc-400 text-xs line-clamp-2 mt-0.5">{a.mensagem}</p>
                      </div>
                      {isPendente && (
                        <button
                          onClick={() => cancelarAgendado(a.id)}
                          className="min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center bg-red-500/10 border border-red-500/20 rounded-xl active:scale-90 transition-all shrink-0"
                        >
                          <span className="text-red-400 text-[0.5625rem] font-bold">Cancelar</span>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[0.4375rem] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusColor}`}
                      >
                        {a.status}
                      </span>
                      <span className="text-zinc-500 text-[0.5rem]">
                        {new Date(a.agendar_para).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {a.canais.map(c => (
                        <span
                          key={c}
                          className="text-[0.4375rem] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-white/5"
                        >
                          {c === 'IN_APP' ? 'In-App' : c === 'PUSH' ? 'Push' : 'Email'}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── Tab: Enviar (form original) ── */}
        {activeTab === 'ENVIAR' && (
          <>
            {/* Preview */}
            {(titulo || mensagem) && (
              <div className="mx-5 mt-5">
                <p className="text-[0.5625rem] text-zinc-400 font-black uppercase tracking-widest mb-2 ml-1">Preview</p>
                <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FFD300]/15 border border-[#FFD300]/20 flex items-center justify-center shrink-0">
                      <Bell size="1rem" className="text-[#FFD300]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm leading-none mb-0.5 truncate">
                        {titulo || 'Título da campanha'}
                      </p>
                      <p className="text-zinc-400 text-[0.625rem] leading-relaxed line-clamp-2">
                        {mensagem || 'Sua mensagem aparecerá aqui...'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/5">
                    {/* Canais */}
                    {canais.map(c => (
                      <span
                        key={c}
                        className="text-[0.4375rem] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFD300]/10 text-[#FFD300] border border-[#FFD300]/20"
                      >
                        {c === 'IN_APP' ? 'In-App' : c === 'PUSH' ? 'Push' : 'Email'}
                      </span>
                    ))}
                    {acao !== 'AVISO' && (
                      <span className="text-[0.4375rem] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 truncate max-w-[45%]">
                        {getAcaoLabel()}
                      </span>
                    )}
                    <span className="text-zinc-400 text-[0.5rem] font-black uppercase tracking-widest ml-auto truncate max-w-[40%]">
                      {getSegLabel()}
                      {destCount !== null && !countLoading && ` (${destCount})`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="p-5 space-y-5">
              {/* Canais */}
              <div className="space-y-1.5">
                <label className="text-[0.5625rem] text-zinc-400 font-black uppercase tracking-widest ml-1">
                  Canais
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'IN_APP' as CanalCampanha, label: 'In-App', Icon: Bell },
                    { id: 'PUSH' as CanalCampanha, label: 'Push', Icon: Smartphone },
                    { id: 'EMAIL' as CanalCampanha, label: 'Email', Icon: Mail },
                  ].map(({ id, label, Icon }) => {
                    const ativo = canais.includes(id);
                    return (
                      <button
                        key={id}
                        onClick={() => toggleCanal(id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all text-xs font-bold ${
                          ativo
                            ? 'bg-[#FFD300]/10 border-[#FFD300]/30 text-[#FFD300]'
                            : 'bg-zinc-900/40 border-white/5 text-zinc-400 active:bg-zinc-900/60'
                        }`}
                      >
                        <Icon size="0.875rem" />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Título */}
              <div className="space-y-1.5">
                <label className="text-[0.5625rem] text-zinc-400 font-black uppercase tracking-widest ml-1">
                  Título
                </label>
                <input
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  placeholder="Ex: Novo evento disponível"
                  className="w-full bg-zinc-900/40 border border-white/5 rounded-xl p-4 text-white text-sm focus:border-[#FFD300]/40 outline-none placeholder-zinc-700"
                />
              </div>

              {/* Mensagem */}
              <div className="space-y-1.5">
                <label className="text-[0.5625rem] text-zinc-400 font-black uppercase tracking-widest ml-1">
                  Mensagem
                </label>
                <textarea
                  value={mensagem}
                  onChange={e => setMensagem(e.target.value)}
                  placeholder="Escreva a mensagem que os membros vão receber..."
                  rows={4}
                  className="w-full bg-zinc-900/40 border border-white/5 rounded-xl p-4 text-white text-sm focus:border-[#FFD300]/40 outline-none placeholder-zinc-700 resize-none leading-relaxed"
                />
              </div>

              {/* Sobre o quê? (Ação / Deep Link) */}
              <div className="space-y-2">
                <label className="text-[0.5625rem] text-zinc-400 font-black uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Target size="0.625rem" className="text-zinc-400" />
                  Sobre o quê?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ACOES.map(a => {
                    const Icon = a.icon;
                    const ativo = acao === a.id;
                    return (
                      <button
                        key={a.id}
                        onClick={() => {
                          setAcao(a.id);
                          setAcaoValor('');
                          setAcaoDropdownOpen(a.needsValue);
                        }}
                        className={`flex flex-col items-center gap-1.5 p-3 border rounded-xl transition-all ${
                          ativo
                            ? 'bg-emerald-500/5 border-emerald-500/30'
                            : 'bg-zinc-900/40 border-white/5 active:bg-zinc-900/60'
                        }`}
                      >
                        <Icon size="0.875rem" className={ativo ? 'text-emerald-400' : 'text-zinc-400'} />
                        <span
                          className={`text-[0.5rem] font-bold text-center leading-tight ${ativo ? 'text-emerald-400' : 'text-zinc-400'}`}
                        >
                          {a.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Sub-dropdown para ações que precisam de valor */}
                {acaoNeedsValue && (
                  <div className="relative">
                    <button
                      onClick={() => setAcaoDropdownOpen(p => !p)}
                      className="w-full flex items-center justify-between p-4 bg-zinc-900/40 border border-white/5 rounded-xl text-sm transition-all active:bg-zinc-900/60"
                    >
                      <span className={acaoValor ? 'text-white truncate' : 'text-zinc-400'}>
                        {acaoValor
                          ? acao === 'NOVO_EVENTO'
                            ? (eventos.find(e => e.id === acaoValor)?.nome ?? acaoValor)
                            : (comunidades.find(c => c.id === acaoValor)?.nome ?? acaoValor)
                          : `Selecionar ${acao === 'NOVO_EVENTO' ? 'evento' : 'comunidade'}...`}
                      </span>
                      <ChevronDown
                        size="0.875rem"
                        className={`text-zinc-400 transition-transform shrink-0 ml-2 ${acaoDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {acaoDropdownOpen && (
                      <div className="absolute z-20 left-0 right-0 mt-1 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden max-h-48 overflow-y-auto no-scrollbar shadow-2xl">
                        {(acao === 'NOVO_EVENTO' ? eventos : comunidades).map(opt => {
                          const selected = acaoValor === opt.id;
                          return (
                            <button
                              key={opt.id}
                              onClick={() => {
                                setAcaoValor(opt.id);
                                setAcaoDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 text-sm border-b border-white/5 last:border-0 transition-all ${
                                selected ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-300 active:bg-white/5'
                              }`}
                            >
                              <span className="truncate block">{opt.nome}</span>
                            </button>
                          );
                        })}
                        {(acao === 'NOVO_EVENTO' ? eventos : comunidades).length === 0 && (
                          <p className="text-zinc-400 text-xs text-center py-4">Nenhuma opção disponível</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Destinatários */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[0.5625rem] text-zinc-400 font-black uppercase tracking-widest ml-1">
                    Destinatários
                  </label>
                  {destCount !== null && (
                    <span
                      className={`text-[0.5625rem] font-bold ${countLoading ? 'text-zinc-400 animate-pulse' : 'text-[#FFD300]'}`}
                    >
                      ~{destCount} {destCount === 1 ? 'membro' : 'membros'}
                    </span>
                  )}
                </div>

                {/* Segmentos */}
                <div className="grid grid-cols-3 gap-2">
                  {SEGMENTOS.map(seg => {
                    const Icon = seg.icon;
                    const ativo = segTipo === seg.tipo;
                    return (
                      <button
                        key={seg.tipo}
                        onClick={() => {
                          setSegTipo(seg.tipo);
                          setSegValor('');
                          setDropdownOpen(seg.needsValue);
                        }}
                        className={`flex flex-col items-center gap-1.5 p-3 border rounded-xl transition-all ${
                          ativo
                            ? 'bg-[#FFD300]/5 border-[#FFD300]/30'
                            : 'bg-zinc-900/40 border-white/5 active:bg-zinc-900/60'
                        }`}
                      >
                        <Icon size="1rem" className={ativo ? 'text-[#FFD300]' : 'text-zinc-400'} />
                        <span className={`text-[0.5625rem] font-bold ${ativo ? 'text-[#FFD300]' : 'text-zinc-400'}`}>
                          {seg.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Dropdown de valor (quando segmento precisa) */}
                {segTipo !== 'TODOS' && (
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(p => !p)}
                      className="w-full flex items-center justify-between p-4 bg-zinc-900/40 border border-white/5 rounded-xl text-sm transition-all active:bg-zinc-900/60"
                    >
                      <span className={segValor ? 'text-white' : 'text-zinc-400'}>
                        {segValor
                          ? (dropdownOptions.find(o => o.value === segValor)?.label ?? segValor)
                          : `Selecionar ${segTipo === 'TAG' ? 'tag' : segTipo === 'COMUNIDADE' ? 'comunidade' : segTipo === 'EVENTO' ? 'evento' : 'cidade'}...`}
                      </span>
                      <ChevronDown
                        size="0.875rem"
                        className={`text-zinc-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {dropdownOpen && dropdownOptions.length > 0 && (
                      <div className="absolute z-20 left-0 right-0 mt-1 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden max-h-48 overflow-y-auto no-scrollbar shadow-2xl">
                        {dropdownOptions.map(opt => {
                          const selected = segValor === opt.value;
                          return (
                            <button
                              key={opt.value}
                              onClick={() => {
                                setSegValor(opt.value);
                                setDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 text-sm border-b border-white/5 last:border-0 transition-all ${
                                selected ? 'bg-[#FFD300]/10 text-[#FFD300]' : 'text-zinc-300 active:bg-white/5'
                              }`}
                            >
                              <span className="truncate block">{opt.label}</span>
                            </button>
                          );
                        })}
                        {dropdownOptions.length === 0 && (
                          <p className="text-zinc-400 text-xs text-center py-4">Nenhuma opção disponível</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Agendar para */}
              <div className="space-y-1.5">
                <label className="text-[0.5625rem] text-zinc-400 font-black uppercase tracking-widest ml-1">
                  Agendar envio (opcional)
                </label>
                <input
                  type="datetime-local"
                  value={agendarPara}
                  onChange={e => setAgendarPara(e.target.value)}
                  className="w-full bg-zinc-900/40 border border-white/5 rounded-xl p-4 text-white text-sm focus:border-[#FFD300]/40 outline-none [color-scheme:dark]"
                />
                {agendarPara && (
                  <p className="text-[#FFD300] text-[0.5rem] ml-1">
                    Sera enviado em{' '}
                    {new Date(agendarPara).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>

              {/* Salvar como template */}
              {titulo.trim() && (
                <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 space-y-2">
                  <label className="text-[0.5625rem] text-zinc-400 font-black uppercase tracking-widest">
                    Salvar como template
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={templateNome}
                      onChange={e => setTemplateNome(e.target.value)}
                      placeholder="Nome do template..."
                      className="flex-1 bg-zinc-800/60 border border-white/5 rounded-lg px-3 py-2 text-white text-xs focus:border-[#FFD300]/40 outline-none placeholder-zinc-600"
                    />
                    <button
                      onClick={saveAsTemplate}
                      disabled={!templateNome.trim() || savingTemplate}
                      className="px-4 py-2 bg-zinc-800 border border-white/10 rounded-lg text-[0.5625rem] font-bold text-zinc-300 active:scale-95 transition-all disabled:opacity-40"
                    >
                      {savingTemplate ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                  {templateMsg && (
                    <p
                      className={`text-[0.5rem] ${templateMsg.includes('Erro') ? 'text-red-400' : 'text-emerald-400'}`}
                    >
                      {templateMsg}
                    </p>
                  )}
                </div>
              )}

              {/* Carregar template */}
              {templates.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[0.5625rem] text-zinc-400 font-black uppercase tracking-widest ml-1">
                    Usar template
                  </label>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {templates.map(t => (
                      <button
                        key={t.id}
                        onClick={() => loadTemplate(t)}
                        className="shrink-0 px-3 py-2 bg-zinc-900/60 border border-white/5 rounded-lg text-xs text-zinc-300 font-medium active:scale-95 transition-all hover-real:border-[#FFD300]/20"
                      >
                        {t.nome}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Resultado do envio */}
              {resultado &&
                status === 'SENT' &&
                (() => {
                  const totalEnviados = resultado.inApp.enviados + resultado.push.enviados + resultado.email.enviados;
                  const totalErros = resultado.inApp.erros + resultado.push.erros + resultado.email.erros;
                  const allFailed = totalEnviados === 0 && totalErros > 0;
                  return (
                    <div
                      className={`${allFailed ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'} border rounded-xl p-4 space-y-1.5`}
                    >
                      <p className={`${allFailed ? 'text-red-400' : 'text-emerald-400'} text-xs font-bold`}>
                        {allFailed
                          ? 'Falha no envio — verifique RLS da tabela notifications no Supabase'
                          : 'Campanha disparada!'}
                      </p>
                      {canais.includes('IN_APP') && (
                        <p className="text-zinc-400 text-[0.625rem]">
                          In-App: {resultado.inApp.enviados} enviados
                          {resultado.inApp.erros > 0 ? `, ${resultado.inApp.erros} erros` : ''}
                        </p>
                      )}
                      {canais.includes('PUSH') && (
                        <p className="text-zinc-400 text-[0.625rem]">
                          Push: {resultado.push.enviados} enviados
                          {resultado.push.erros > 0 ? `, ${resultado.push.erros} erros` : ''}
                          {resultado.push.enviados === 0 && resultado.push.erros === 0
                            ? ' (nenhum usuário com push ativado)'
                            : ''}
                        </p>
                      )}
                      {canais.includes('EMAIL') && (
                        <p className="text-zinc-400 text-[0.625rem]">
                          Email: {resultado.email.enviados} enviados
                          {resultado.email.erros > 0 ? `, ${resultado.email.erros} erros` : ''}
                        </p>
                      )}
                    </div>
                  );
                })()}
            </div>
          </>
        )}
      </div>

      {/* Footer — só na tab ENVIAR */}
      {activeTab === 'ENVIAR' && (
        <div className="px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] border-t border-white/5 shrink-0">
          <button
            onClick={handleSend}
            disabled={!canSend || status !== 'IDLE'}
            className={`w-full py-4 rounded-xl font-bold text-[0.625rem] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all disabled:opacity-40 ${
              status === 'SENT' ? 'bg-emerald-500 text-white' : 'bg-[#FFD300] text-black'
            }`}
          >
            {status === 'SENDING' && <Loader2 size="0.875rem" className="animate-spin" />}
            {status === 'SENT' && <Check size="0.875rem" />}
            {status === 'IDLE' && <Send size="0.875rem" />}
            {status === 'SENDING'
              ? 'Enviando...'
              : status === 'SENT'
                ? agendarPara
                  ? 'Agendado!'
                  : 'Enviado!'
                : agendarPara
                  ? 'Agendar Campanha'
                  : 'Disparar Campanha'}
          </button>
        </div>
      )}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};
