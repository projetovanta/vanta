import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Camera, CameraOff, ToggleLeft, ToggleRight, Keyboard } from 'lucide-react';
import { verifyTicketToken } from '../../services/jwtService';
import { comemoracaoService } from '../../../../services/comemoracaoService';
import { useCameraPermission } from '../../../../hooks/usePermission';
import type { FeedbackTela } from './checkinTypes';

export const QRScanner: React.FC<{
  eventoId: string;
  onFeedback: (f: FeedbackTela, nome?: string) => void;
  onValidated: () => void;
  onValidateAndBurn: (ticketId: string, eventoId: string) => Promise<{ resultado: string; nomeTitular?: string }>;
}> = ({ eventoId, onFeedback, onValidated, onValidateAndBurn }) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [continuous, setContinuous] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const scannerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { state: camState, request: requestCam } = useCameraPermission();

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (continuous) {
      inactivityTimer.current = setTimeout(() => {
        stopCamera();
      }, 60_000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [continuous]);

  const stopCamera = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState?.();
        if (state === 2 /* SCANNING */) {
          await scannerRef.current.stop();
        }
      } catch {
        /* ignore */
      }
      try {
        scannerRef.current.clear();
      } catch {
        /* ignore */
      }
      scannerRef.current = null;
    }
    const container = document.getElementById('qr-reader');
    if (container) {
      const videos = container.querySelectorAll('video');
      videos.forEach(v => {
        const ms = v.srcObject as MediaStream | null;
        if (ms) ms.getTracks().forEach(t => t.stop());
        v.srcObject = null;
      });
    }
    setCameraActive(false);
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null;
    }
  }, []);

  const processQR = useCallback(
    async (token: string) => {
      if (processing) return;
      setProcessing(true);

      try {
        // Cortesia QR: vanta://cortesia/{id}
        const cortesiaMatch = token.match(/^vanta:\/\/cortesia\/(.+)$/);
        if (cortesiaMatch) {
          const result = await comemoracaoService.resgatarCortesia(cortesiaMatch[1]);
          if (result.ok) {
            onFeedback('VERDE', result.nome ?? 'Cortesia');
            onValidated();
          } else if (result.erro === 'Já resgatada') {
            onFeedback('AMARELO');
          } else {
            onFeedback('VERMELHO');
          }
          return;
        }

        const verified = await verifyTicketToken(token);
        if (!verified) {
          onFeedback('VERMELHO');
          return;
        }

        const { resultado, nomeTitular } = await onValidateAndBurn(verified.tid, eventoId);

        if (resultado === 'VALIDO') {
          onFeedback('VERDE', nomeTitular);
          onValidated();
        } else if (resultado === 'JA_UTILIZADO') {
          onFeedback('AMARELO');
        } else {
          onFeedback('VERMELHO');
        }
      } catch {
        onFeedback('VERMELHO');
      } finally {
        setProcessing(false);

        if (!continuous) {
          stopCamera();
        } else {
          resetInactivityTimer();
        }
      }
    },
    [processing, eventoId, continuous, onFeedback, onValidated, onValidateAndBurn, stopCamera, resetInactivityTimer],
  );

  const startCamera = useCallback(async () => {
    const { stream: permStream, denied } = await requestCam({ video: { facingMode: 'environment' } });
    if (denied) {
      setManualMode(true);
      return;
    }
    if (permStream) {
      permStream.getTracks().forEach(t => t.stop());
    }

    const { Html5Qrcode } = await import('html5-qrcode');

    const containerId = 'qr-reader';
    const el = document.getElementById(containerId);
    if (!el) return;

    el.style.display = 'block';

    const scanner = new Html5Qrcode(containerId);
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 5,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: true,
        },
        (decodedText: string) => {
          processQR(decodedText);
        },
        () => {
          /* QR não detectado neste frame */
        },
      );
      setCameraActive(true);
      resetInactivityTimer();
    } catch (err) {
      console.error('[QRScanner] erro ao iniciar câmera:', err);
      setManualMode(true);
    }
  }, [requestCam, processQR, resetInactivityTimer]);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          const state = scannerRef.current.getState?.();
          if (state === 2) scannerRef.current.stop();
        } catch {
          /* ignore */
        }
        try {
          scannerRef.current.clear();
        } catch {
          /* ignore */
        }
      }
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, []);

  useEffect(() => {
    if (cameraActive && continuous) {
      resetInactivityTimer();
    }
  }, [continuous, cameraActive, resetInactivityTimer]);

  const handleManualSubmit = () => {
    const code = manualCode.trim();
    if (!code) return;
    setManualCode('');
    processQR(code);
  };

  return (
    <div className="flex flex-col items-center px-6 pt-6 pb-10">
      <div ref={containerRef} className="relative w-full max-w-[280px] aspect-square mb-5 mx-auto">
        <div className="absolute top-0 left-0 w-10 h-10 border-t-[3px] border-l-[3px] border-[#FFD300] rounded-tl-xl z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-10 h-10 border-t-[3px] border-r-[3px] border-[#FFD300] rounded-tr-xl z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-10 h-10 border-b-[3px] border-l-[3px] border-[#FFD300] rounded-bl-xl z-10 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-[3px] border-r-[3px] border-[#FFD300] rounded-br-xl z-10 pointer-events-none" />

        <div
          id="qr-reader"
          className={`absolute inset-2 rounded-xl overflow-hidden bg-zinc-900/60 ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
        />

        {!cameraActive && (
          <div className="absolute inset-3 bg-zinc-900/60 rounded-2xl flex flex-col items-center justify-center gap-3">
            {camState === 'denied' ? (
              <>
                <CameraOff size={48} className="text-red-500/60" />
                <p className="text-red-400/80 text-[9px] font-black uppercase tracking-widest text-center px-4">
                  Câmera bloqueada
                </p>
                <p className="text-zinc-600 text-[8px] text-center px-3">Libere nas configurações do navegador</p>
              </>
            ) : (
              <>
                <Camera size={48} className="text-zinc-700" />
                <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest text-center px-4">
                  Toque para ativar a câmera
                </p>
              </>
            )}
          </div>
        )}

        {cameraActive && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-2.5 py-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400 text-[7px] font-black uppercase tracking-widest">Câmera ativa</span>
          </div>
        )}
      </div>

      {!cameraActive ? (
        <button
          onClick={startCamera}
          disabled={processing}
          className="w-full py-4 bg-[#FFD300] text-black rounded-2xl font-black text-sm uppercase tracking-widest active:scale-[0.97] transition-all disabled:opacity-50 disabled:pointer-events-none mb-3 flex items-center justify-center gap-2"
        >
          <Camera size={16} /> Ativar Scanner
        </button>
      ) : (
        <button
          onClick={stopCamera}
          className="w-full py-4 bg-zinc-800 text-zinc-300 border border-white/10 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-[0.97] transition-all mb-3 flex items-center justify-center gap-2"
        >
          <CameraOff size={16} /> Desligar Câmera
        </button>
      )}

      <button
        onClick={() => setContinuous(c => !c)}
        className="flex items-center gap-2 mb-4 active:scale-95 transition-all"
      >
        {continuous ? (
          <ToggleRight size={22} className="text-[#FFD300]" />
        ) : (
          <ToggleLeft size={22} className="text-zinc-600" />
        )}
        <span
          className={`text-[9px] font-black uppercase tracking-widest ${continuous ? 'text-[#FFD300]' : 'text-zinc-600'}`}
        >
          Modo contínuo
        </span>
      </button>

      {continuous && (
        <p className="text-zinc-700 text-[8px] font-black uppercase tracking-widest text-center mb-4">
          Câmera fica ligada entre leituras · desliga após 60s sem leitura
        </p>
      )}

      {(manualMode || camState === 'denied') && (
        <div className="w-full mt-2 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Keyboard size={12} className="text-zinc-600 shrink-0" />
            <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">Digitar código do ingresso</p>
          </div>
          <div className="flex gap-2">
            <input
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              placeholder="Cole o código do QR aqui..."
              className="flex-1 bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none placeholder-zinc-700 min-w-0"
              onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
            />
            <button
              onClick={handleManualSubmit}
              disabled={!manualCode.trim() || processing}
              className="px-4 py-3 bg-[#FFD300] text-black rounded-xl font-black text-[9px] uppercase tracking-widest shrink-0 active:scale-95 transition-all disabled:opacity-40"
            >
              Validar
            </button>
          </div>
        </div>
      )}

      {!manualMode && camState !== 'denied' && (
        <button
          onClick={() => setManualMode(true)}
          className="text-zinc-700 text-[9px] font-black uppercase tracking-widest hover:text-zinc-500 transition-colors"
        >
          Sem câmera? Digitar código manualmente
        </button>
      )}

      {processing && (
        <div className="mt-4 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-[#FFD300] border-t-transparent animate-spin" />
          <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">Validando...</p>
        </div>
      )}
    </div>
  );
};
