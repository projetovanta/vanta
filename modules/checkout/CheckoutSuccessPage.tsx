import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, Loader2, AlertTriangle, Share2 } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { logger } from '../../services/logger';
import { behaviorService } from '../../services/behaviorService';

type Status = 'polling' | 'confirmed' | 'failed' | 'timeout';

export const CheckoutSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const pedidoId = searchParams.get('pedido_id') ?? '';
  const [status, setStatus] = useState<Status>('polling');
  const [eventoNome, setEventoNome] = useState('');
  const [eventoId, setEventoId] = useState('');
  const [qtdIngressos, setQtdIngressos] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptsRef = useRef(0);
  const MAX_ATTEMPTS = 15; // 15 × 2s = 30s

  useEffect(() => {
    if (!pedidoId) {
      setStatus('failed');
      return;
    }

    const poll = async () => {
      attemptsRef.current++;
      try {
        // pedidos_checkout — cast necessário até regenerar types após migration
        const { data: pedido } = (await supabase
          .from('pedidos_checkout' as 'profiles')
          .select('status, evento_id, dados_compra')
          .eq('id', pedidoId)
          .maybeSingle()) as unknown as { data: Record<string, unknown> | null };

        if (!pedido) {
          setStatus('failed');
          if (pollRef.current) clearInterval(pollRef.current);
          return;
        }

        if (pedido.status === 'PAGO') {
          if (pollRef.current) clearInterval(pollRef.current);

          const dados = pedido.dados_compra as { itens?: { quantidade: number }[] };
          const total = (dados?.itens ?? []).reduce((s, i) => s + (i.quantidade ?? 0), 0);
          setQtdIngressos(total);
          setEventoId(pedido.evento_id as string);

          // Buscar nome do evento
          const { data: evt } = await supabase
            .from('eventos_admin')
            .select('nome')
            .eq('id', pedido.evento_id as string)
            .maybeSingle();
          if (evt) setEventoNome(evt.nome as string);

          // Notificar app principal via BroadcastChannel
          try {
            const bc = new BroadcastChannel('vanta_tickets');
            bc.postMessage({ type: 'VANTA_TICKET_PURCHASED' });
            bc.close();
          } catch {
            /* not supported */
          }

          setStatus('confirmed');

          // Behavior tracking: PURCHASE
          supabase.auth.getUser().then(({ data }) => {
            if (data?.user?.id && pedido.evento_id) {
              behaviorService.trackPurchase(data.user.id, pedido.evento_id as string);
            }
          });
          return;
        }

        if (pedido.status === 'CANCELADO' || pedido.status === 'EXPIRADO') {
          if (pollRef.current) clearInterval(pollRef.current);
          setStatus('failed');
          return;
        }

        // Ainda pendente
        if (attemptsRef.current >= MAX_ATTEMPTS) {
          if (pollRef.current) clearInterval(pollRef.current);
          setStatus('timeout');
        }
      } catch (err) {
        logger.error('[checkout-success] poll error', err);
        if (attemptsRef.current >= MAX_ATTEMPTS) {
          if (pollRef.current) clearInterval(pollRef.current);
          setStatus('timeout');
        }
      }
    };

    // Poll imediato + a cada 2s
    void poll();
    pollRef.current = setInterval(poll, 2000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [pedidoId]);

  const handleShare = async () => {
    if (!eventoId) return;
    const url = `https://maisvanta.com/e/${eventoId}`;
    const shareData = {
      title: eventoNome || 'Evento VANTA',
      text: `Eu vou pra "${eventoNome}"! Garanta o seu no VANTA`,
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* cancelado */
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${url}`);
      } catch {
        /* */
      }
    }
  };

  return (
    <div
      className="h-[100dvh] bg-[#0A0A0A] text-white flex flex-col items-center justify-center px-6"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {status === 'polling' && (
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 size="2.5rem" className="text-[#FFD300] animate-spin" />
          <p className="font-serif text-xl text-white">Confirmando pagamento...</p>
          <p className="text-zinc-400 text-xs">Aguarde enquanto processamos seu pagamento.</p>
        </div>
      )}

      {status === 'confirmed' && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Check size="1.75rem" className="text-emerald-400" />
          </div>
          <p className="font-serif text-2xl text-white">
            {qtdIngressos === 1 ? 'Ingresso Confirmado!' : `${qtdIngressos} Ingressos Confirmados!`}
          </p>
          {eventoNome && <p className="text-zinc-400 text-xs">{eventoNome}</p>}
          <p className="text-zinc-400 text-[0.625rem]">Seus ingressos já aparecem na Carteira do App.</p>

          <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-zinc-800/80 border border-white/10 rounded-xl active:scale-95 transition-all"
            >
              <Share2 size="0.875rem" className="text-[#FFD300]" />
              <span className="text-xs font-bold text-white">Compartilhar</span>
            </button>
            <button
              onClick={() => window.close()}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-[0.625rem] uppercase tracking-[0.2em] text-white active:scale-95 transition-all"
            >
              Voltar ao App
            </button>
          </div>
        </div>
      )}

      {(status === 'failed' || status === 'timeout') && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <AlertTriangle size="1.75rem" className="text-amber-400" />
          </div>
          <p className="font-serif text-xl text-white">
            {status === 'timeout' ? 'Processamento demorado' : 'Erro no pagamento'}
          </p>
          <p className="text-zinc-400 text-xs max-w-xs">
            {status === 'timeout'
              ? 'O pagamento ainda está sendo processado. Se foi cobrado, seus ingressos aparecerão na Carteira em breve.'
              : 'Houve um problema com o pagamento. Nenhum valor foi cobrado.'}
          </p>
          <button
            onClick={() => window.close()}
            className="mt-4 w-full max-w-xs py-4 bg-zinc-800 border border-white/10 rounded-xl font-bold text-[0.625rem] uppercase tracking-[0.2em] text-white active:scale-95 transition-all"
          >
            Voltar ao App
          </button>
        </div>
      )}
    </div>
  );
};
