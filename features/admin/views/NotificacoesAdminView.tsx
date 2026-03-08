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
import { supabase } from '../../../services/supabaseClient';
import {
  campanhasService,
  type CanalCampanha,
  type SegmentoAlvo,
  type CampanhaResultado,
} from '../services/campanhasService';

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

export const NotificacoesAdminView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
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

  // Dados para dropdowns
  const [tags, setTags] = useState<string[]>([]);
  const [comunidades, setComunidades] = useState<{ id: string; nome: string }[]>([]);
  const [eventos, setEventos] = useState<{ id: string; nome: string }[]>([]);
  const [cidades, setCidades] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    // Tags distintas de curadoria
    Promise.resolve(
      supabase
        .from('profiles')
        .select('tags_curadoria')
        .eq('curadoria_concluida', true)
        .not('tags_curadoria', 'is', null),
    )
      .then(({ data }) => {
        const set = new Set<string>();
        (data ?? []).forEach((r: Record<string, unknown>) => {
          const arr = r.tags_curadoria as string[] | null;
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
      | 'CONVITE_SOCIO'
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

    try {
      const { tipo: tipoNotif, link: linkNotif } = resolveAcao();
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

    setTimeout(() => {
      setStatus('IDLE');
      setTitulo('');
      setMensagem('');
      setCanais(['IN_APP']);
      setAcao('AVISO');
      setAcaoValor('');
      setSegTipo('TODOS');
      setSegValor('');
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
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-4 pb-4 flex justify-between items-start shrink-0">
        <div>
          <p style={TYPOGRAPHY.sectionKicker} className="mb-1.5">
            Portal Admin
          </p>
          <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic">
            Campanhas
          </h1>
        </div>
        <button aria-label="Voltar"
          onClick={onBack}
          className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all mt-1"
        >
          <ArrowLeft size={18} className="text-zinc-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar max-w-3xl mx-auto w-full">
        {/* Preview */}
        {(titulo || mensagem) && (
          <div className="mx-5 mt-5">
            <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest mb-2 ml-1">Preview</p>
            <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFD300]/15 border border-[#FFD300]/20 flex items-center justify-center shrink-0">
                  <Bell size={16} className="text-[#FFD300]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm leading-none mb-0.5 truncate">
                    {titulo || 'Título da campanha'}
                  </p>
                  <p className="text-zinc-400 text-[10px] leading-relaxed line-clamp-2">
                    {mensagem || 'Sua mensagem aparecerá aqui...'}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/5">
                {/* Canais */}
                {canais.map(c => (
                  <span
                    key={c}
                    className="text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFD300]/10 text-[#FFD300] border border-[#FFD300]/20"
                  >
                    {c === 'IN_APP' ? 'In-App' : c === 'PUSH' ? 'Push' : 'Email'}
                  </span>
                ))}
                {acao !== 'AVISO' && (
                  <span className="text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 truncate max-w-[45%]">
                    {getAcaoLabel()}
                  </span>
                )}
                <span className="text-zinc-400 text-[8px] font-black uppercase tracking-widest ml-auto truncate max-w-[40%]">
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
            <label className="text-[9px] text-zinc-400 font-black uppercase tracking-widest ml-1">Canais</label>
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
                    <Icon size={14} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Título */}
          <div className="space-y-1.5">
            <label className="text-[9px] text-zinc-400 font-black uppercase tracking-widest ml-1">Título</label>
            <input
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ex: Novo evento disponível"
              className="w-full bg-zinc-900/40 border border-white/5 rounded-xl p-4 text-white text-sm focus:border-[#FFD300]/40 outline-none placeholder-zinc-700"
            />
          </div>

          {/* Mensagem */}
          <div className="space-y-1.5">
            <label className="text-[9px] text-zinc-400 font-black uppercase tracking-widest ml-1">Mensagem</label>
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
            <label className="text-[9px] text-zinc-400 font-black uppercase tracking-widest ml-1 flex items-center gap-1.5">
              <Target size={10} className="text-zinc-400" />
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
                    <Icon size={14} className={ativo ? 'text-emerald-400' : 'text-zinc-400'} />
                    <span
                      className={`text-[8px] font-bold text-center leading-tight ${ativo ? 'text-emerald-400' : 'text-zinc-400'}`}
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
                    size={14}
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
              <label className="text-[9px] text-zinc-400 font-black uppercase tracking-widest ml-1">
                Destinatários
              </label>
              {destCount !== null && (
                <span
                  className={`text-[9px] font-bold ${countLoading ? 'text-zinc-400 animate-pulse' : 'text-[#FFD300]'}`}
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
                    <Icon size={16} className={ativo ? 'text-[#FFD300]' : 'text-zinc-400'} />
                    <span className={`text-[9px] font-bold ${ativo ? 'text-[#FFD300]' : 'text-zinc-400'}`}>
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
                    size={14}
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
                    <p className="text-zinc-400 text-[10px]">
                      In-App: {resultado.inApp.enviados} enviados
                      {resultado.inApp.erros > 0 ? `, ${resultado.inApp.erros} erros` : ''}
                    </p>
                  )}
                  {canais.includes('PUSH') && (
                    <p className="text-zinc-400 text-[10px]">
                      Push: {resultado.push.enviados} enviados
                      {resultado.push.erros > 0 ? `, ${resultado.push.erros} erros` : ''}
                    </p>
                  )}
                  {canais.includes('EMAIL') && (
                    <p className="text-zinc-400 text-[10px]">
                      Email: {resultado.email.enviados} enviados
                      {resultado.email.erros > 0 ? `, ${resultado.email.erros} erros` : ''}
                    </p>
                  )}
                </div>
              );
            })()}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] border-t border-white/5 shrink-0">
        <button
          onClick={handleSend}
          disabled={!canSend || status !== 'IDLE'}
          className={`w-full py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all disabled:opacity-40 ${
            status === 'SENT' ? 'bg-emerald-500 text-white' : 'bg-[#FFD300] text-black'
          }`}
        >
          {status === 'SENDING' && <Loader2 size={14} className="animate-spin" />}
          {status === 'SENT' && <Check size={14} />}
          {status === 'IDLE' && <Send size={14} />}
          {status === 'SENDING' ? 'Enviando...' : status === 'SENT' ? 'Enviado!' : 'Disparar Campanha'}
        </button>
      </div>
    </div>
  );
};
