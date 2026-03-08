import React, { useState, useEffect, useRef } from 'react';
import { X, Shield, FileCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Ingresso } from '../../../types';
import { signTicketToken } from '../../../features/admin/services/jwtService';
import { comprovanteService } from '../../../features/admin/services/comprovanteService';
import { supabase } from '../../../services/supabaseClient';

interface TicketQRModalProps {
  ticket: Ingresso;
  onClose: () => void;
}

const REFRESH_INTERVAL = 15_000; // 15 segundos

export const TicketQRModal: React.FC<TicketQRModalProps> = ({ ticket, onClose }) => {
  const [token, setToken] = useState<string | null>(null);
  const [clockTime, setClockTime] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(REFRESH_INTERVAL / 1000);
  const lastRefresh = useRef(0);

  // Gerar novo JWT a cada 15s
  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      const jwt = await signTicketToken(ticket.id);
      if (mounted) {
        setToken(jwt);
        lastRefresh.current = Date.now();
        setSecondsLeft(REFRESH_INTERVAL / 1000);
      }
    };
    refresh();
    const interval = setInterval(refresh, REFRESH_INTERVAL);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [ticket.id]);

  // Relógio atualiza a cada 1s
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClockTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      const elapsed = Math.floor((Date.now() - lastRefresh.current) / 1000);
      setSecondsLeft(Math.max(0, REFRESH_INTERVAL / 1000 - elapsed));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Comprovante meia-entrada (múltiplas fotos)
  const [compFotos, setCompFotos] = useState<{ label: string; url: string }[]>([]);
  const [compModalOpen, setCompModalOpen] = useState(false);
  const [compFotoIdx, setCompFotoIdx] = useState(0);

  useEffect(() => {
    if (!ticket.isMeiaEntrada) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user)
        comprovanteService.getFotoUrls(user.id).then(urls => {
          if (urls.length > 0) setCompFotos(urls);
        });
    });
  }, [ticket.isMeiaEntrada]);

  const isCortesia = ticket.tipo === 'CORTESIA';

  return (
    <div className="absolute inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" role="presentation" onClick={onClose} />

      <div className="relative w-full max-w-[300px] bg-[#1a1a1a] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header gradiente */}
        <div
          className="p-6 text-center"
          style={{
            background: isCortesia
              ? 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)'
              : 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
          }}
        >
          <h3 className="text-sm font-bold text-white mb-1 leading-tight truncate">{ticket.tituloEvento}</h3>
          <p className="text-white/70 text-[10px] uppercase tracking-wider">{ticket.dataEvento}</p>
          {ticket.variacaoLabel && <p className="text-white/90 text-[9px] font-bold mt-1">{ticket.variacaoLabel}</p>}
          {ticket.isMeiaEntrada && (
            <span className="inline-block mt-1.5 text-[8px] font-black uppercase tracking-widest text-cyan-300 bg-cyan-500/20 border border-cyan-400/30 px-2.5 py-0.5 rounded-full">
              Meia-entrada
            </span>
          )}
        </div>

        {/* QR Zone */}
        <div className="p-6 flex flex-col items-center bg-white relative">
          {/* Recortes laterais */}
          <div className="absolute -left-3 top-0 w-6 h-6 bg-[#1a1a1a] rounded-full translate-y-[-50%]" />
          <div className="absolute -right-3 top-0 w-6 h-6 bg-[#1a1a1a] rounded-full translate-y-[-50%]" />

          {/* QR Code real com JWT dinâmico */}
          <div className="w-full max-w-[200px] aspect-square mb-3 relative">
            {token ? (
              <QRCodeSVG
                value={token}
                size={200}
                level="M"
                bgColor="#FFFFFF"
                fgColor="#000000"
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-zinc-100 flex items-center justify-center rounded-lg">
                <div className="w-6 h-6 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Relógio watermark */}
          <div className="flex items-center gap-1.5 mb-2">
            <Shield size={10} className="text-emerald-600" />
            <p className="text-black font-mono text-xs font-bold tracking-wider">{clockTime}</p>
          </div>

          {/* Barra de progresso de renovação */}
          <div className="w-full max-w-[180px] h-1 bg-zinc-200 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-emerald-500 transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${(secondsLeft / (REFRESH_INTERVAL / 1000)) * 100}%` }}
            />
          </div>

          <p className="text-zinc-400 text-[8px] uppercase tracking-widest text-center">
            Renova em {secondsLeft}s · Anti-fraude ativo
          </p>

          {/* Nome do titular */}
          {ticket.nomeTitular?.trim() && (
            <p className="text-zinc-400 text-[9px] font-bold mt-2 truncate max-w-full">{ticket.nomeTitular}</p>
          )}

          {/* Botão abrir comprovante meia-entrada */}
          {ticket.isMeiaEntrada && compFotos.length > 0 && (
            <button
              onClick={() => {
                setCompFotoIdx(0);
                setCompModalOpen(true);
              }}
              className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl active:scale-95 transition-all"
            >
              <FileCheck size={12} className="text-cyan-500" />
              <span className="text-cyan-500 text-[9px] font-black uppercase tracking-wider">
                Abrir Comprovante{compFotos.length > 1 ? ` (${compFotos.length})` : ''}
              </span>
            </button>
          )}
        </div>

        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 bg-black/20 hover:bg-black/40 rounded-full text-white/70 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Modal foto comprovante (múltiplas) */}
      {compModalOpen && compFotos.length > 0 && (
        <div className="absolute inset-0 z-[210] flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/90" role="presentation" onClick={() => setCompModalOpen(false)} />
          <div className="relative w-full max-w-md animate-in zoom-in-95 duration-300">
            {compFotos.length > 1 && (
              <div className="flex gap-1 mb-3 justify-center relative z-10">
                {compFotos.map((f, i) => (
                  <button
                    key={f.label}
                    onClick={() => setCompFotoIdx(i)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
                      compFotoIdx === i ? 'bg-white/10 text-white' : 'text-zinc-400'
                    }`}
                  >
                    {f.label === 'frente'
                      ? 'Frente'
                      : f.label === 'verso'
                        ? 'Verso'
                        : f.label === 'extra'
                          ? 'Extra'
                          : f.label}
                  </button>
                ))}
              </div>
            )}
            <img
              src={compFotos[compFotoIdx].url}
              alt="Comprovante"
              className="w-full rounded-2xl border border-white/10"
            />
            <button
              onClick={() => setCompModalOpen(false)}
              className="absolute top-3 right-3 p-2 bg-black/60 rounded-full z-10"
            >
              <X size={16} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
