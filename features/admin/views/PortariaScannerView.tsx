import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, QrCode, Check, X, AlertTriangle, Scan, RefreshCw } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { eventosAdminService, TicketCaixa } from '../services/eventosAdminService';
import { signTicketToken, verifyTicketToken } from '../services/jwtService';

type FeedbackTipo = 'VERDE' | 'AMARELO' | 'VERMELHO';

interface FeedbackData {
  tipo: FeedbackTipo;
  titulo: string;
  sub: string;
  selfieBase64?: string; // foto do titular para conferência visual
}

// ── Overlay fullscreen de feedback ───────────────────────────────────────────
const FeedbackOverlay: React.FC<{ data: FeedbackData; onDismiss: () => void }> = ({ data, onDismiss }) => {
  const cfg: Record<
    FeedbackTipo,
    { bg: string; Icon: React.FC<{ size: number; className: string; strokeWidth: number }> }
  > = {
    VERDE: { bg: '#059669', Icon: Check },
    AMARELO: { bg: '#D97706', Icon: AlertTriangle },
    VERMELHO: { bg: '#DC2626', Icon: X },
  };
  const { bg, Icon } = cfg[data.tipo];

  useEffect(() => {
    const id = setTimeout(onDismiss, 2500);
    return () => clearTimeout(id);
  }, [onDismiss]);

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 animate-in fade-in duration-150"
      style={{ backgroundColor: bg }}
      onClick={onDismiss}
    >
      {/* Selfie do titular — exibida acima do ícone para conferência */}
      {data.selfieBase64 && (
        <img
          src={data.selfieBase64}
          alt="Titular"
          className="w-20 h-20 rounded-full object-cover border-4 border-white/20"
        />
      )}
      <div
        className="w-28 h-28 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.2)' }}
      >
        <Icon size={56} className="text-white" strokeWidth={2.5} />
      </div>
      <div className="text-center px-8">
        <p className="text-white font-black text-3xl leading-none mb-3">{data.titulo}</p>
        <p className="text-white/70 text-sm">{data.sub}</p>
      </div>
      <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mt-4">Toque para fechar</p>
    </div>
  );
};

// ── Frame de scanner (placeholder visual) ─────────────────────────────────────
const ScannerFrame: React.FC<{ scanning: boolean }> = ({ scanning }) => (
  <div className="relative w-full max-w-[260px] aspect-square mx-auto">
    {/* Cantos */}
    {(
      ['top-0 left-0', 'top-0 right-0 rotate-90', 'bottom-0 right-0 rotate-180', 'bottom-0 left-0 -rotate-90'] as const
    ).map((pos, i) => (
      <div key={i} className={`absolute ${pos} w-8 h-8`}>
        <div className="absolute top-0 left-0 w-full h-0.5 bg-[#FFD300]" />
        <div className="absolute top-0 left-0 h-full w-0.5 bg-[#FFD300]" />
      </div>
    ))}
    {/* Interior */}
    <div className="absolute inset-3 rounded-xl bg-zinc-900/30 border border-white/5 flex flex-col items-center justify-center gap-4 overflow-hidden">
      {scanning ? (
        <>
          <div
            className="absolute left-3 right-3 h-0.5 bg-[#FFD300]/60 rounded-full"
            style={{ animation: 'scan-line 2s ease-in-out infinite', top: '20%' }}
          />
          <QrCode size={40} className="text-white/20" />
          <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">Aguardando QR Code</p>
        </>
      ) : (
        <>
          <QrCode size={40} className="text-zinc-700" />
          <p className="text-[9px] text-zinc-700 font-black uppercase tracking-widest text-center px-4">
            Aponte a câmera para o ingresso
          </p>
        </>
      )}
    </div>
    <style>{`
      @keyframes scan-line {
        0%, 100% { top: 20%; opacity: 0.8; }
        50%       { top: 75%; opacity: 1;   }
      }
    `}</style>
  </div>
);

// ── Componente principal ───────────────────────────────────────────────────────
interface Props {
  onBack: () => void;
  eventoId?: string;
}

export const PortariaScannerView: React.FC<Props> = ({ onBack, eventoId }) => {
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [scanning, setScanning] = useState(true);
  const [lastTicket, setLastTicket] = useState<TicketCaixa | null>(null);
  const [contador, setContador] = useState({ validos: 0, invalidos: 0 });

  // Resolve o evento ativo — usa o primeiro evento com caixaAtivo se não for passado
  const eventoAtivo = useMemo(() => {
    if (eventoId) return eventosAdminService.getEvento(eventoId);
    return eventosAdminService.getEventos().find(e => e.caixaAtivo) ?? null;
  }, [eventoId]);

  const evId = eventoAtivo?.id ?? '';

  const dismissFeedback = useCallback(() => {
    setFeedback(null);
    setScanning(true);
  }, []);

  // Simula leitura de QR — gera JWT real, valida via verifyTicketToken, então queima
  const handleSimularLeitura = useCallback(async () => {
    if (!evId || !scanning) return;
    setScanning(false);

    const tickets = await eventosAdminService.getTicketsCaixaByEvento(evId);
    const disponiveis = tickets.filter(t => t.status === 'DISPONIVEL');

    if (disponiveis.length === 0) {
      const usado = tickets.find(t => t.status === 'USADO');
      if (usado) {
        const { resultado } = await eventosAdminService.validarEQueimarIngresso(usado.id, evId);
        if (resultado === 'JA_UTILIZADO') {
          setFeedback({ tipo: 'AMARELO', titulo: 'Já Utilizado', sub: 'Este ingresso já foi lido anteriormente.' });
          setContador(p => ({ ...p, invalidos: p.invalidos + 1 }));
          return;
        }
      }
      setFeedback({ tipo: 'AMARELO', titulo: 'Todos Presentes', sub: 'Não há mais ingressos disponíveis.' });
      return;
    }

    const ticket = disponiveis[Math.floor(Math.random() * disponiveis.length)];

    // 1. Gera JWT simulando o QR exibido no celular do cliente
    const token = await signTicketToken(ticket.id);

    // 2. Valida assinatura + expiração
    const verified = await verifyTicketToken(token);
    if (!verified) {
      setFeedback({
        tipo: 'VERMELHO',
        titulo: 'Token Expirado',
        sub: 'QR Code inválido ou expirado. Solicite novo ingresso.',
      });
      setContador(p => ({ ...p, invalidos: p.invalidos + 1 }));
      return;
    }

    // 3. Queima ingresso via tid extraído do JWT
    const { resultado } = await eventosAdminService.validarEQueimarIngresso(verified.tid, evId);

    if (resultado === 'VALIDO') {
      setLastTicket(ticket);
      setFeedback({
        tipo: 'VERDE',
        titulo: 'Entrada Confirmada',
        sub: ticket.nomeTitular ? `Bem-vindo, ${ticket.nomeTitular}!` : `${ticket.variacaoLabel} · ${ticket.email}`,
        selfieBase64: ticket.selfieUrl ?? ticket.selfieBase64,
      });
      setContador(p => ({ ...p, validos: p.validos + 1 }));
    } else if (resultado === 'JA_UTILIZADO') {
      setFeedback({ tipo: 'AMARELO', titulo: 'Já Utilizado', sub: 'Este ingresso já foi validado.' });
      setContador(p => ({ ...p, invalidos: p.invalidos + 1 }));
    } else if (resultado === 'EVENTO_INCORRETO') {
      setFeedback({ tipo: 'VERMELHO', titulo: 'Evento Incorreto', sub: 'Este ingresso é de outro evento.' });
      setContador(p => ({ ...p, invalidos: p.invalidos + 1 }));
    } else {
      setFeedback({ tipo: 'VERMELHO', titulo: 'Inválido', sub: 'QR Code não reconhecido.' });
      setContador(p => ({ ...p, invalidos: p.invalidos + 1 }));
    }
  }, [evId, scanning]);

  return (
    <div className="absolute inset-0 bg-[#050505] flex flex-col overflow-hidden">
      {/* Overlay de feedback */}
      {feedback && <FeedbackOverlay data={feedback} onDismiss={dismissFeedback} />}

      {/* Header */}
      <div
        className="bg-[#050505]/95 backdrop-blur-xl border-b border-white/5 px-6 pb-5 shrink-0"
        style={{ paddingTop: '2rem' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p style={TYPOGRAPHY.sectionKicker} className="mb-1">
              Portaria
            </p>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic">
              Scanner QR
            </h1>
          </div>
          <button
            aria-label="Voltar"
            onClick={onBack}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all shrink-0"
          >
            <ArrowLeft size={18} className="text-zinc-400" />
          </button>
        </div>
        {eventoAtivo && (
          <p className="text-zinc-700 text-[9px] font-black uppercase tracking-widest mt-2 truncate">
            {eventoAtivo.nome}
          </p>
        )}
      </div>

      {/* Área central */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
        {/* Contadores */}
        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-emerald-400 font-black text-3xl leading-none">{contador.validos}</p>
            <p className="text-zinc-400 text-[8px] font-black uppercase tracking-widest mt-0.5">entradas</p>
          </div>
          <div className="w-px bg-white/5" />
          <div className="text-center">
            <p className="text-red-400 font-black text-3xl leading-none">{contador.invalidos}</p>
            <p className="text-zinc-400 text-[8px] font-black uppercase tracking-widest mt-0.5">recusados</p>
          </div>
        </div>

        {/* Frame do scanner */}
        <ScannerFrame scanning={scanning} />

        {/* Último ticket validado */}
        {lastTicket && (
          <div className="w-full max-w-xs px-4 py-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl flex items-center gap-3">
            {(lastTicket.selfieUrl ?? lastTicket.selfieBase64) ? (
              <img
                src={lastTicket.selfieUrl ?? lastTicket.selfieBase64}
                alt="Titular"
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-emerald-500/30"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Check size={12} className="text-emerald-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-emerald-300 text-xs font-bold truncate">
                {lastTicket.nomeTitular || lastTicket.email}
              </p>
              <p className="text-zinc-400 text-[9px] truncate">{lastTicket.variacaoLabel}</p>
            </div>
          </div>
        )}
      </div>

      {/* Botões de ação */}
      <div className="px-6 pb-10 pt-4 space-y-3 shrink-0">
        {!evId ? (
          <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <AlertTriangle size={14} className="text-amber-400 shrink-0" />
            <p className="text-amber-300 text-xs font-bold">Nenhum evento com caixa ativo encontrado.</p>
          </div>
        ) : (
          <button
            onClick={handleSimularLeitura}
            disabled={!scanning}
            className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2"
            style={{ background: scanning ? 'linear-gradient(135deg, #059669, #10b981)' : '#18181b', color: '#fff' }}
          >
            {scanning ? (
              <>
                <Scan size={14} /> Simular Leitura
              </>
            ) : (
              <>
                <RefreshCw size={14} className="animate-spin" /> Processando…
              </>
            )}
          </button>
        )}
        <p className="text-zinc-700 text-[9px] font-black uppercase tracking-widest text-center">
          Em produção: câmera nativa substituirá o botão de simulação
        </p>
      </div>
    </div>
  );
};
