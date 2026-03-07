import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  X,
  Lock,
  ShoppingBag,
  Plus,
  Minus,
  Loader2,
  Bell,
  BellRing,
  Zap,
  AlertTriangle,
  Tag,
  UserPlus,
  MapPin,
} from 'lucide-react';
import { Ingresso, Mesa, Cupom } from '../../types';
import { supabase } from '../../services/supabaseClient';
import { cuponsService } from '../../features/admin/services/cuponsService';
import { comprovanteService } from '../../features/admin/services/comprovanteService';
import { notify } from '../../services/notifyService';
import { comemoracaoService } from '../../services/comemoracaoService';
import { SuccessScreen } from './SuccessScreen';
import { WaitlistModal } from './WaitlistModal';

// eventoId extraído via useParams dentro do componente

const fmtBrl = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

type Step = 'select' | 'login' | 'success';

// ── Stepper ──────────────────────────────────────────────────────────────────
const Stepper: React.FC<{ value: number; min?: number; max: number; onChange: (n: number) => void }> = ({
  value,
  min = 0,
  max,
  onChange,
}) => (
  <div className="flex items-center gap-2" role="presentation" onClick={e => e.stopPropagation()}>
    <button
      onClick={() => onChange(Math.max(min, value - 1))}
      disabled={value <= min}
      className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 active:scale-90 transition-all disabled:opacity-30"
    >
      <Minus size={12} />
    </button>
    <span className="w-5 text-center font-black text-sm text-white">{value}</span>
    <button
      onClick={() => onChange(Math.min(max, value + 1))}
      disabled={value >= max}
      className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 active:scale-90 transition-all disabled:opacity-30"
    >
      <Plus size={12} />
    </button>
  </div>
);

// ── Tipos locais do checkout ─────────────────────────────────────────────────
interface CheckoutEvento {
  id: string;
  titulo: string;
  data: string;
  dataReal: string;
  horario: string;
  local: string;
  formato: string;
  imagem: string;
  ocultarValor: boolean;
  lotes: { nome: string; preco: number }[];
  mesasAtivo: boolean;
  plantaMesas?: string;
}
interface CheckoutVariacao {
  id: string;
  area: string;
  areaCustom?: string;
  genero: string;
  valor: number;
  limite: number;
  vendidos: number;
  requerComprovante?: boolean;
  tipoComprovante?: string;
}

// ── Página Principal ─────────────────────────────────────────────────────────
export const CheckoutPage: React.FC = () => {
  const { slug: eventoId = '' } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') ?? '';
  const cupomUrl = searchParams.get('cupom') ?? '';
  const [evento, setEvento] = useState<CheckoutEvento | null>(null);
  const [variacoes, setVariacoes] = useState<CheckoutVariacao[]>([]);
  const [loteAtivoId, setLoteAtivoId] = useState('');
  const [totalLotes, setTotalLotes] = useState(0);
  const [loteOrdem, setLoteOrdem] = useState(0); // ordem do lote ativo (0-based)
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (eventoId) localStorage.setItem('vanta_checkout_eventoId', eventoId);

    const loadEvento = async () => {
      try {
        const { data: row } = await supabase
          .from('eventos_admin')
          .select(
            'id, nome, descricao, data_inicio, data_fim, local, cidade, foto, formato, categoria, mesas_ativo, planta_mesas',
          )
          .eq('id', eventoId)
          .eq('publicado', true)
          .maybeSingle();

        if (!row) {
          setPageLoading(false);
          return;
        }

        const dataInicio = new Date(row.data_inicio as string);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const eventDay = new Date(dataInicio);
        eventDay.setHours(0, 0, 0, 0);

        let dataLabel: string;
        if (eventDay.getTime() === today.getTime()) dataLabel = 'Hoje';
        else if (eventDay.getTime() === tomorrow.getTime()) dataLabel = 'Amanhã';
        else dataLabel = eventDay.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');

        setEvento({
          id: row.id as string,
          titulo: row.nome as string,
          data: dataLabel,
          dataReal: dataInicio.toISOString().split('T')[0],
          horario: dataInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          local: row.local as string,
          formato: (row.formato as string) ?? (row.categoria as string) ?? '',
          imagem: (row.foto as string) ?? '',
          ocultarValor: false,
          lotes: [],
          mesasAtivo: (row.mesas_ativo as boolean) ?? false,
          plantaMesas: (row.planta_mesas as string) ?? undefined,
        });

        // Buscar lotes + variações
        const { data: lotes } = await supabase
          .from('lotes')
          .select('id, nome, ativo, ordem')
          .eq('evento_id', eventoId)
          .order('ordem', { ascending: true });

        if (lotes && lotes.length > 0) {
          setTotalLotes(lotes.length);
          const loteAtivo = lotes.find((l: Record<string, unknown>) => l.ativo) ?? lotes[lotes.length - 1];
          const ordemAtivo = lotes.indexOf(loteAtivo);
          setLoteOrdem(ordemAtivo);
          setLoteAtivoId(loteAtivo.id as string);
          const { data: vars } = await supabase
            .from('variacoes_ingresso')
            .select('id, area, area_custom, genero, valor, limite, vendidos, requer_comprovante, tipo_comprovante')
            .eq('lote_id', loteAtivo.id);

          if (vars && vars.length > 0) {
            setVariacoes(
              vars.map((v: Record<string, unknown>) => ({
                id: v.id as string,
                area: v.area as string,
                areaCustom: v.area_custom as string | undefined,
                genero: v.genero as string,
                valor: Number(v.valor),
                limite: v.limite as number,
                vendidos: v.vendidos as number,
                requerComprovante: (v.requer_comprovante as boolean) ?? false,
                tipoComprovante: (v.tipo_comprovante as string) ?? undefined,
              })),
            );
          }
        }
      } catch {
        // silently fail
      } finally {
        setPageLoading(false);
      }
    };

    void loadEvento();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // qtd[variacaoId | 'lote-N'] = quantidade selecionada
  const [qtd, setQtdMap] = useState<Record<string, number>>({});
  const [step, setStep] = useState<Step>('select');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [tickets, setTickets] = useState<Ingresso[]>([]);

  // Mesas
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [selectedMesa, setSelectedMesa] = useState<string | null>(null);
  const [mesaPopup, setMesaPopup] = useState<string | null>(null);

  useEffect(() => {
    if (!evento?.mesasAtivo) return;
    supabase
      .from('mesas')
      .select('*')
      .eq('evento_id', eventoId)
      .then(
        ({ data }) => {
          if (data)
            setMesas(
              data.map((r: Record<string, unknown>) => ({
                id: r.id as string,
                eventoId: r.evento_id as string,
                label: (r.label as string) ?? '',
                x: (r.x as number) ?? 50,
                y: (r.y as number) ?? 50,
                capacidade: (r.capacidade as number) ?? 4,
                valor: Number(r.valor ?? 0),
                status: (r.status as Mesa['status']) ?? 'DISPONIVEL',
                reservadoPor: r.reservado_por as string | undefined,
              })),
            );
        },
        () => {
          /* audit-ok */
        },
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evento?.mesasAtivo]);

  const mesaSelecionada = mesas.find(m => m.id === selectedMesa);

  // Cupom
  const [cupomOpen, setCupomOpen] = useState(false);
  const [cupomCode, setCupomCode] = useState('');
  const [cupomAplicado, setCupomAplicado] = useState<Cupom | null>(null);
  const [cupomErro, setCupomErro] = useState('');
  const [cupomLoading, setCupomLoading] = useState(false);

  // Acompanhante
  const [acompanhantes, setAcompanhantes] = useState<Record<number, string>>({}); // idx → nome

  // Waitlist
  const [naFila, setNaFila] = useState<Record<string, boolean>>({}); // variacaoId → true se já inscrito
  const [waitlistModal, setWaitlistModal] = useState<string | null>(null); // variacaoId do modal aberto
  const [waitlistEmail, setWaitlistEmail] = useState('');

  // Comprovante meia-entrada — check de elegibilidade do user logado
  const [meiaElegivel, setMeiaElegivel] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        comprovanteService.refresh(user.id).then(() => {
          setMeiaElegivel(comprovanteService.isElegivel(user.id));
        });
      }
    });
  }, []);

  const setQtd = (key: string, value: number) =>
    setQtdMap(prev => {
      const next: Record<string, number> = { ...prev };
      if (value === 0) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });

  const totalItems = (Object.values(qtd) as number[]).reduce((s, n) => s + n, 0);
  const precoIngressos =
    variacoes.length > 0
      ? variacoes.reduce((s, v) => s + (qtd[v.id] ?? 0) * v.valor, 0)
      : (evento?.lotes ?? []).reduce((s, l, i) => s + (qtd[`lote-${i}`] ?? 0) * l.preco, 0);
  const subtotal = precoIngressos + (mesaSelecionada?.valor ?? 0);
  const desconto = cupomAplicado ? cuponsService.calcDesconto(cupomAplicado, subtotal) : 0;
  const totalPreco = Math.max(0, subtotal - desconto);

  const handleAplicarCupom = async () => {
    if (!cupomCode.trim() || !eventoId) return;
    setCupomLoading(true);
    setCupomErro('');
    const result = await cuponsService.validarCupom(cupomCode.trim(), eventoId);
    setCupomLoading(false);
    if (result.valido && result.cupom) {
      setCupomAplicado(result.cupom);
      setCupomErro('');
    } else {
      setCupomErro(result.erro ?? 'Cupom inválido');
    }
  };

  const removerCupom = () => {
    setCupomAplicado(null);
    setCupomCode('');
    setCupomErro('');
  };

  // Auto-aplicar cupom da URL (?cupom=VANTA10)
  useEffect(() => {
    if (!cupomUrl || !eventoId || cupomAplicado) return;
    cuponsService.validarCupom(cupomUrl, eventoId).then(result => {
      if (result.valido && result.cupom) {
        setCupomAplicado(result.cupom);
        setCupomCode(result.cupom.codigo);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cupomUrl, eventoId]);

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      setErro('Preencha email e senha.');
      return;
    }
    setLoading(true);
    setErro('');

    // Auth real
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha.trim(),
    });
    if (authError || !authData.user) {
      setErro(
        authError?.message === 'Invalid login credentials'
          ? 'Email ou senha incorretos.'
          : (authError?.message ?? 'Erro ao autenticar.'),
      );
      setLoading(false);
      return;
    }
    const compradorId = authData.user.id;

    // Processar compra via RPC para cada variação
    const gerados: Ingresso[] = [];
    let ticketIdx = 0;

    for (const v of variacoes) {
      const n = qtd[v.id] ?? 0;
      if (n === 0) continue;

      const { data: rpcResult, error: rpcError } = await supabase.rpc('processar_compra_checkout', {
        p_evento_id: eventoId,
        p_lote_id: loteAtivoId,
        p_variacao_id: v.id,
        p_email: email.trim(),
        p_valor_unit: v.valor,
        p_quantidade: n,
        p_comprador_id: compradorId,
        p_ref_code: refCode || null,
      });

      if (rpcError) {
        setErro(`Erro ao processar compra: ${rpcError.message}`);
        setLoading(false);
        return;
      }

      const result = rpcResult as { ok: boolean; erro?: string; tickets?: { ticketId: string }[] };
      if (!result?.ok) {
        setErro(result?.erro ?? 'Erro ao processar compra.');
        setLoading(false);
        return;
      }

      const area = v.area === 'OUTRO' ? (v.areaCustom ?? 'Outro') : v.area;
      const genero = v.genero === 'MASCULINO' ? 'Masc.' : v.genero === 'FEMININO' ? 'Fem.' : 'Unisex';
      const vlabel = `${area} · ${genero}`;

      (result.tickets ?? []).forEach(t => {
        const acompNome = acompanhantes[ticketIdx];
        gerados.push({
          id: t.ticketId,
          eventoId,
          tituloEvento: evento?.titulo ?? '',
          dataEvento: evento?.dataReal ?? '',
          status: 'DISPONIVEL',
          codigoQR: `VNT-${t.ticketId.slice(0, 8).toUpperCase()}`,
          variacaoLabel: vlabel,
          nomeTitular: acompNome ?? '',
          cpf: '',
          eventoLocal: evento?.local,
          eventoImagem: evento?.imagem,
          isAcompanhante: !!acompNome,
          isMeiaEntrada: v.requerComprovante === true,
        });
        ticketIdx++;
      });
    }

    // Registrar uso do cupom
    if (cupomAplicado) {
      void cuponsService.usarCupom(cupomAplicado.id);
    }

    // Notificar app principal via BroadcastChannel
    try {
      const bc = new BroadcastChannel('vanta_tickets');
      bc.postMessage({ type: 'VANTA_TICKET_PURCHASED', tickets: gerados });
      bc.close();
    } catch {
      /* BroadcastChannel not supported */
    }
    setTickets(gerados);
    setLoading(false);
    setStep('success');

    // Notificar comprador (3 canais: in-app + push + email)
    void notify({
      userId: compradorId,
      tipo: 'COMPRA_CONFIRMADA',
      titulo: 'Compra confirmada!',
      mensagem: `${gerados.length} ingresso(s) para ${evento?.titulo ?? 'evento'}. Confira na sua carteira.`,
      link: 'WALLET',
    });

    // Notificar solicitante da comemoração sobre nova venda (fire-and-forget)
    if (refCode) {
      void (async () => {
        try {
          const { data: com } = await supabase
            .from('comemoracoes')
            .select('id, solicitante_id, vendas_count')
            .eq('ref_code', refCode)
            .eq('status', 'APROVADA')
            .single();
          if (com?.solicitante_id) {
            void notify({
              userId: com.solicitante_id,
              tipo: 'COMEMORACAO_FAIXA_ATINGIDA',
              titulo: 'Nova venda pelo seu link!',
              mensagem: `Você tem ${com.vendas_count} venda(s). Confira suas cortesias!`,
              link: com.id,
            });
          }
        } catch {
          /* fire-and-forget */
        }
      })();
    }
  };

  if (pageLoading)
    return (
      <div className="min-h-[100dvh] bg-black flex items-center justify-center gap-3">
        <Loader2 size={24} className="text-zinc-600 animate-spin" />
      </div>
    );

  if (!evento)
    return (
      <div className="min-h-[100dvh] bg-black flex items-center justify-center">
        <p className="text-zinc-600 text-sm">Evento não encontrado.</p>
      </div>
    );

  if (step === 'success') return <SuccessScreen tickets={tickets} titulo={evento.titulo} data={evento.data} />;

  return (
    <div
      className="relative h-[100dvh] bg-[#0A0A0A] text-white flex flex-col overflow-hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Hero */}
      <div className="relative aspect-[21/9] max-h-56 shrink-0 overflow-hidden">
        <img loading="lazy" src={evento.imagem} alt={evento.titulo} className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A0A0A]" />
        <button
          onClick={() => window.close()}
          className="absolute left-4 p-2 bg-black/40 backdrop-blur-sm rounded-full border border-white/10"
          style={{ top: '1rem' }}
        >
          <X size={16} className="text-zinc-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 -mt-4 space-y-6 pb-4">
        {/* Info */}
        <div>
          <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-1">{evento.formato}</p>
          <h1 className="font-serif italic text-2xl text-white leading-tight truncate">{evento.titulo}</h1>
          <p className="text-zinc-500 text-xs mt-1">
            {evento.data} · {evento.horario} · {evento.local}
          </p>
        </div>

        {/* Seleção */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Selecionar ingressos</p>
            {totalLotes > 1 && loteOrdem === 0 && (
              <span className="text-[7px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Zap size={8} /> Early Bird
              </span>
            )}
            {totalLotes > 1 && loteOrdem === totalLotes - 1 && (
              <span className="text-[7px] font-black uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle size={8} /> Último lote
              </span>
            )}
          </div>

          {variacoes.length > 0
            ? variacoes.map(v => {
                const area = v.area === 'OUTRO' ? (v.areaCustom ?? 'Outro') : v.area;
                const genero = v.genero === 'MASCULINO' ? 'Masc.' : v.genero === 'FEMININO' ? 'Fem.' : 'Unisex';
                const esgotado = v.vendidos >= v.limite;
                const disponivel = Math.max(0, v.limite - v.vendidos);
                const poucos = !esgotado && disponivel <= Math.ceil(v.limite * 0.2);
                const q = qtd[v.id] ?? 0;
                const isMeia = v.requerComprovante === true;
                const meiaBloqueada = isMeia && !meiaElegivel;
                return (
                  <div
                    key={v.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      meiaBloqueada
                        ? 'opacity-50 border-white/5 bg-zinc-900/30'
                        : esgotado
                          ? 'opacity-40 border-white/5 bg-zinc-900/30'
                          : q > 0
                            ? 'border-[#FFD300]/40 bg-[#FFD300]/5'
                            : 'border-white/5 bg-zinc-900/40'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className={`text-sm font-bold truncate ${q > 0 ? 'text-white' : 'text-zinc-300'}`}>
                          {area} · {genero}
                        </p>
                        {isMeia && (
                          <span className="text-[7px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded-full shrink-0">
                            Meia
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        {cupomAplicado && <p className="text-xs text-zinc-600 line-through">{fmtBrl(v.valor)}</p>}
                        <p className={`text-base font-black ${q > 0 ? 'text-[#FFD300]' : 'text-zinc-400'}`}>
                          {cupomAplicado
                            ? fmtBrl(Math.max(0, v.valor - cuponsService.calcDesconto(cupomAplicado, v.valor)))
                            : fmtBrl(v.valor)}
                        </p>
                      </div>
                      {meiaBloqueada && (
                        <p className="text-[8px] font-black uppercase text-cyan-400 mt-0.5">
                          Comprovante de meia-entrada necessário no perfil
                        </p>
                      )}
                      {poucos && !meiaBloqueada && (
                        <p className="text-[8px] font-black uppercase text-amber-400 mt-0.5">
                          Faltam {disponivel} ingresso{disponivel !== 1 ? 's' : ''}!
                        </p>
                      )}
                      {esgotado && !meiaBloqueada && !naFila[v.id] && (
                        <p className="text-[8px] font-black uppercase text-red-500 mt-0.5">Esgotado</p>
                      )}
                      {esgotado && !meiaBloqueada && naFila[v.id] && (
                        <p className="text-[8px] font-black uppercase text-amber-400 mt-0.5 flex items-center gap-1">
                          <BellRing size={9} /> Na fila
                        </p>
                      )}
                    </div>
                    {!esgotado && !meiaBloqueada && (
                      <Stepper value={q} max={Math.min(10, disponivel)} onChange={n => setQtd(v.id, n)} />
                    )}
                    {esgotado && !meiaBloqueada && !naFila[v.id] && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setWaitlistModal(v.id);
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all shrink-0"
                      >
                        <Bell size={11} /> Fila
                      </button>
                    )}
                  </div>
                );
              })
            : evento.lotes.map((l, i) => {
                const q = qtd[`lote-${i}`] ?? 0;
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      q > 0 ? 'border-[#FFD300]/40 bg-[#FFD300]/5' : 'border-white/5 bg-zinc-900/40'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className={`text-sm font-bold truncate ${q > 0 ? 'text-white' : 'text-zinc-300'}`}>{l.nome}</p>
                      <p className={`text-base font-black mt-0.5 ${q > 0 ? 'text-[#FFD300]' : 'text-zinc-400'}`}>
                        {evento.ocultarValor ? 'Sob consulta' : fmtBrl(l.preco)}
                      </p>
                    </div>
                    <Stepper value={q} max={10} onChange={n => setQtd(`lote-${i}`, n)} />
                  </div>
                );
              })}
        </div>

        {/* Acompanhante (+1) */}
        {totalItems >= 2 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <UserPlus size={12} className="text-zinc-600" />
              <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Acompanhantes</p>
            </div>
            <p className="text-zinc-600 text-[10px]">Algum ingresso é para acompanhante? Informe o nome.</p>
            {Array.from({ length: totalItems }, (_, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-zinc-600 text-[9px] font-bold shrink-0 w-16">#{idx + 1}</span>
                <input
                  type="text"
                  placeholder={idx === 0 ? 'Para mim (deixe vazio)' : 'Nome do acompanhante'}
                  value={acompanhantes[idx] ?? ''}
                  onChange={e =>
                    setAcompanhantes(prev => {
                      const next = { ...prev };
                      if (e.target.value.trim()) next[idx] = e.target.value;
                      else delete next[idx];
                      return next;
                    })
                  }
                  className="flex-1 min-w-0 bg-zinc-900/60 border border-white/5 rounded-xl px-3 py-2.5 text-white text-xs outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
                />
              </div>
            ))}
          </div>
        )}

        {/* Mesas / Camarotes */}
        {evento.mesasAtivo && evento.plantaMesas && mesas.length > 0 && (
          <div className="space-y-3">
            <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Selecionar mesa</p>
            <div className="relative rounded-2xl overflow-hidden border border-white/5">
              <img
                loading="lazy"
                src={evento.plantaMesas}
                alt="Planta"
                className="w-full aspect-[16/9] object-contain bg-zinc-900"
              />
              {mesas.map(m => {
                const available = m.status === 'DISPONIVEL';
                const selected = selectedMesa === m.id;
                const cor = selected ? '#FFD300' : available ? '#FFD300' : '#52525b';
                return (
                  <button
                    key={m.id}
                    disabled={!available}
                    onClick={() => {
                      if (selected) {
                        setSelectedMesa(null);
                        setMesaPopup(null);
                      } else {
                        setSelectedMesa(m.id);
                        setMesaPopup(m.id);
                      }
                    }}
                    className={`absolute w-7 h-7 -ml-3.5 -mt-3.5 rounded-full border-2 flex items-center justify-center transition-all ${
                      selected ? 'scale-125 z-10' : available ? 'active:scale-110' : 'opacity-50 cursor-not-allowed'
                    }`}
                    style={{
                      left: `${m.x}%`,
                      top: `${m.y}%`,
                      backgroundColor: cor + (selected ? '40' : '20'),
                      borderColor: cor,
                    }}
                  >
                    <MapPin size={12} style={{ color: cor }} />
                  </button>
                );
              })}
            </div>

            {/* Popup da mesa selecionada */}
            {mesaPopup &&
              (() => {
                const m = mesas.find(x => x.id === mesaPopup);
                if (!m) return null;
                const selected = selectedMesa === m.id;
                return (
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      selected ? 'bg-[#FFD300]/5 border-[#FFD300]/30' : 'bg-zinc-900/40 border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-bold text-sm">{m.label}</p>
                        <p className="text-zinc-500 text-[9px]">{m.capacidade} pessoas</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-black text-base ${selected ? 'text-[#FFD300]' : 'text-zinc-400'}`}>
                          {fmtBrl(m.valor)}
                        </p>
                        {selected && <p className="text-emerald-400 text-[8px] font-bold uppercase">Selecionada</p>}
                      </div>
                    </div>
                  </div>
                );
              })()}
          </div>
        )}

        {/* Cupom */}
        <div className="space-y-2">
          {!cupomAplicado ? (
            <>
              <button
                onClick={() => setCupomOpen(p => !p)}
                className="flex items-center gap-2 text-zinc-500 active:text-zinc-300 transition-colors"
              >
                <Tag size={12} />
                <span className="text-[9px] font-bold uppercase tracking-widest">
                  {cupomOpen ? 'Fechar' : 'Tem um cupom?'}
                </span>
              </button>
              {cupomOpen && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Código do cupom"
                    value={cupomCode}
                    onChange={e => {
                      setCupomCode(e.target.value.toUpperCase());
                      setCupomErro('');
                    }}
                    className="flex-1 min-w-0 bg-zinc-900/60 border border-white/5 rounded-xl px-3 py-2.5 text-white text-xs outline-none focus:border-[#FFD300]/30 placeholder-zinc-700 uppercase tracking-wider"
                  />
                  <button
                    onClick={handleAplicarCupom}
                    disabled={cupomLoading || !cupomCode.trim()}
                    className="px-4 py-2.5 bg-[#FFD300]/10 border border-[#FFD300]/20 rounded-xl text-[#FFD300] text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all disabled:opacity-30 shrink-0"
                  >
                    {cupomLoading ? '...' : 'Aplicar'}
                  </button>
                </div>
              )}
              {cupomErro && <p className="text-red-400 text-[10px]">{cupomErro}</p>}
            </>
          ) : (
            <div className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
              <div className="flex items-center gap-2 min-w-0">
                <Tag size={12} className="text-emerald-400 shrink-0" />
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider truncate">
                  {cupomAplicado.codigo}
                </span>
                <span className="text-emerald-400/60 text-[9px] shrink-0">
                  −{cupomAplicado.tipo === 'PERCENTUAL' ? `${cupomAplicado.valor}%` : fmtBrl(cupomAplicado.valor)}
                </span>
              </div>
              <button
                onClick={removerCupom}
                className="p-1 text-zinc-600 active:text-red-400 transition-colors shrink-0"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 p-4 bg-[#0A0A0A] border-t border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">Total</p>
            <div className="flex items-baseline gap-2">
              {desconto > 0 && totalItems > 0 && !evento.ocultarValor && (
                <p className="text-sm text-zinc-600 line-through">{fmtBrl(subtotal)}</p>
              )}
              <p className="text-xl font-black text-[#FFD300]">
                {evento.ocultarValor ? 'Sob Consulta' : totalItems > 0 ? fmtBrl(totalPreco) : '—'}
              </p>
            </div>
            {totalItems > 0 && (
              <p className="text-zinc-600 text-[9px]">
                {totalItems} ingresso{totalItems !== 1 ? 's' : ''}
                {desconto > 0 && <span className="text-emerald-400 ml-1">· −{fmtBrl(desconto)} cupom</span>}
              </p>
            )}
          </div>
          <button
            onClick={() => setStep('login')}
            disabled={totalItems === 0}
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-[10px] uppercase tracking-widest text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-95 transition-all disabled:opacity-30 disabled:scale-100"
          >
            <ShoppingBag size={14} />
            {totalItems > 0 ? `Continuar (${totalItems})` : 'Continuar'}
          </button>
        </div>
        <p className="text-center text-zinc-700 text-[8px] flex items-center justify-center gap-1">
          <Lock size={9} /> Pagamento seguro · fora do app
        </p>
      </div>

      {/* Modal Waitlist */}
      {waitlistModal && (
        <WaitlistModal
          eventoId={eventoId}
          variacaoId={waitlistModal}
          onClose={() => {
            setWaitlistModal(null);
            setWaitlistEmail('');
          }}
          onSuccess={vid => {
            setNaFila(prev => ({ ...prev, [vid]: true }));
            setWaitlistModal(null);
            setWaitlistEmail('');
          }}
        />
      )}

      {/* Modal Login */}
      {step === 'login' && (
        <div
          className="absolute inset-0 z-50 flex items-end bg-black/80 backdrop-blur-sm"
          onClick={() => {
            setStep('select');
            setErro('');
          }}
        >
          <div
            className="w-full bg-[#111] border-t border-white/10 rounded-t-3xl p-6 space-y-5 animate-in slide-in-from-bottom duration-300"
            style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom, 2.5rem))' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto" />
            <div>
              <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">Identificação</p>
              <p className="text-white font-bold text-lg mt-0.5">Entrar com sua conta VANTA</p>
              <p className="text-zinc-500 text-xs mt-1">Use os mesmos dados do aplicativo</p>
            </div>
            {/* Resumo da sacola */}
            <div className="bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between">
              <p className="text-zinc-400 text-xs">
                {totalItems} ingresso{totalItems !== 1 ? 's' : ''}
              </p>
              <p className="text-[#FFD300] font-black text-sm">
                {evento.ocultarValor ? 'Sob Consulta' : fmtBrl(totalPreco)}
              </p>
            </div>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
              />
              <input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !loading && handleLogin()}
                className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
              />
              {erro && <p className="text-red-400 text-xs">{erro}</p>}
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] text-white active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Processando...' : `Confirmar ${totalItems} ingresso${totalItems !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
