import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Check, Camera, RefreshCw } from 'lucide-react';
import { analyzeOvalRegion, classifyOval, analyzeSelfie, OVAL_VB } from './selfieAnalysis';

type SelfieStatus =
  | 'LOADING'
  | 'IDLE'
  | 'SCANNING'
  | 'FACE_DETECTED'
  | 'ANALYZING'
  | 'CAPTURED'
  | 'APPROVED'
  | 'DARK'
  | 'NO_FACE'
  | 'PARTIAL'
  | 'CAM_ERROR';

const SELFIE_MSGS: Record<SelfieStatus, string> = {
  LOADING: 'Iniciando câmera…',
  IDLE: 'Tire uma selfie com boa iluminação e rosto centralizado',
  SCANNING: 'Posicione seu rosto dentro do oval',
  FACE_DETECTED: 'Rosto posicionado',
  ANALYZING: 'Analisando sua foto…',
  CAPTURED: 'Verifique sua foto',
  APPROVED: 'Biometria concluída',
  DARK: 'Muito escuro — vá para um lugar bem iluminado',
  NO_FACE: 'Rosto não detectado — centralize dentro do oval',
  PARTIAL: 'Ajuste seu rosto para caber inteiro no oval',
  CAM_ERROR: 'Câmera indisponível. Use o botão para tirar uma foto.',
};

const selfieStatusColor = (s: SelfieStatus) => {
  if (s === 'APPROVED') return 'text-emerald-500';
  if (s === 'FACE_DETECTED' || s === 'CAPTURED') return 'text-emerald-400';
  if (s === 'DARK' || s === 'NO_FACE' || s === 'PARTIAL') return 'text-red-400';
  return 'text-zinc-500';
};

const FACE_FRAMES_REQUIRED = 3;

export const SelfieCameraComponent: React.FC<{
  onCapture: (dataUrl: string) => void;
}> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyzeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const faceFramesRef = useRef(0);
  const inputId = useRef(`selfie-input-${Date.now()}`).current;

  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<SelfieStatus>('LOADING');
  const [useLive, setUseLive] = useState<boolean | null>(null); // null = checking
  const [pulseKey, setPulseKey] = useState(0);

  const stopCamera = useCallback(() => {
    analyzeRef.current && clearInterval(analyzeRef.current);
    analyzeRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  // Detecta rosto via YCbCr DENTRO DO OVAL guia (viewBox 300×400 mapeado para canvas)
  const detectFaceLive = useCallback((): 'FACE' | 'DARK' | 'NO_FACE' | 'PARTIAL' => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return 'NO_FACE';
    // Canvas com aspect ratio 3:4 (igual ao viewBox do oval)
    const W = 240,
      H = 320;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.scale(-1, 1);
    ctx.drawImage(video, -W, 0, W, H);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    return classifyOval(analyzeOvalRegion(ctx, W, H));
  }, []);

  const startAnalysis = useCallback(() => {
    analyzeRef.current && clearInterval(analyzeRef.current);
    faceFramesRef.current = 0;
    analyzeRef.current = setInterval(() => {
      setStatus(prev => {
        if (prev === 'APPROVED' || prev === 'ANALYZING') return prev;
        const result = detectFaceLive();
        if (result !== 'FACE') {
          faceFramesRef.current = 0;
          return result === 'DARK' ? 'DARK' : result === 'PARTIAL' ? 'PARTIAL' : 'SCANNING';
        }
        faceFramesRef.current += 1;
        if (faceFramesRef.current >= FACE_FRAMES_REQUIRED) {
          if (prev !== 'FACE_DETECTED') setPulseKey(k => k + 1);
          return 'FACE_DETECTED';
        }
        return 'SCANNING';
      });
    }, 400);
  }, [detectFaceLive]);

  // Conecta stream ao <video> quando ambos existem
  const attachStream = useCallback(async (stream: MediaStream) => {
    const v = videoRef.current;
    if (!v) return;
    v.setAttribute('autoplay', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.srcObject = stream;
    await new Promise<void>(resolve => {
      if (v.readyState >= 1) {
        resolve();
        return;
      }
      const onLoaded = () => {
        v.removeEventListener('loadedmetadata', onLoaded);
        resolve();
      };
      v.addEventListener('loadedmetadata', onLoaded);
      setTimeout(resolve, 3000);
    });
    try {
      await v.play();
    } catch {
      /* autoplay já ativo */
    }
  }, []);

  // Tenta câmera ao vivo; se falhar → fallback para file input
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
        if (alive) {
          setUseLive(false);
          setStatus('IDLE');
        }
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        });
        if (!alive) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        // Seta useLive ANTES de conectar — o <video> será montado no próximo render
        setUseLive(true);
        setStatus('SCANNING');
        startAnalysis();
      } catch (err: unknown) {
        if (!alive) return;
        const name = err instanceof DOMException ? err.name : '';
        if (
          name === 'NotAllowedError' ||
          name === 'NotFoundError' ||
          name === 'DevicesNotFoundError' ||
          name === 'NotReadableError' ||
          name === 'AbortError'
        ) {
          setUseLive(false);
          setStatus('CAM_ERROR');
        } else {
          setUseLive(false);
          setStatus('IDLE');
        }
      }
    })();
    return () => {
      alive = false;
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Callback ref: quando o <video> é montado no DOM, conecta o stream imediatamente
  const videoCallbackRef = useCallback(
    (node: HTMLVideoElement | null) => {
      (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = node;
      if (node && streamRef.current) {
        attachStream(streamRef.current);
      }
    },
    [attachStream],
  );

  // Flash visual ao capturar
  const [flash, setFlash] = useState(false);

  // Captura do video ao vivo — só permitida com FACE_DETECTED → vai pra CAPTURED (preview)
  const handleCaptureLive = () => {
    if (status !== 'FACE_DETECTED') return;
    const video = videoRef.current,
      canvas = canvasRef.current;
    if (!video || !canvas) return;
    analyzeRef.current && clearInterval(analyzeRef.current);

    // Flash real — tela toda branca brilho máximo ANTES da captura (ilumina o rosto)
    setFlash(true);
    setTimeout(() => {
      // Captura o frame DURANTE o flash (rosto iluminado pela tela branca)
      const fullW = video.videoWidth || 640;
      const fullH = video.videoHeight || 480;
      canvas.width = fullW;
      canvas.height = fullH;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      ctx.scale(-1, 1);
      ctx.drawImage(video, -fullW, 0, fullW, fullH);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

      // Validação final contra oval
      const valW = 240,
        valH = 320;
      canvas.width = valW;
      canvas.height = valH;
      const vctx = canvas.getContext('2d', { willReadFrequently: true })!;
      vctx.scale(-1, 1);
      vctx.drawImage(video, -valW, 0, valW, valH);
      vctx.setTransform(1, 0, 0, 1, 0, 0);
      const result = classifyOval(analyzeOvalRegion(vctx, valW, valH));

      setFlash(false);

      if (result !== 'FACE') {
        setStatus(result === 'DARK' ? 'DARK' : result === 'PARTIAL' ? 'PARTIAL' : 'NO_FACE');
        startAnalysis();
        return;
      }

      stopCamera();
      setPreview(dataUrl);
      setStatus('CAPTURED');
    }, 200); // 200ms de tela branca antes de capturar — ilumina o rosto
  };

  // Confirmar selfie após preview
  const handleConfirmSelfie = () => {
    if (!preview) return;
    setStatus('APPROVED');
    onCapture(preview);
  };

  // Captura via file input (fallback)
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus('ANALYZING');
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      const img = new Image();
      img.onload = () => {
        const result = analyzeSelfie(img);
        setStatus(result);
        if (result === 'APPROVED') onCapture(dataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRetryLive = async () => {
    setPreview(null);
    setStatus('LOADING');
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
      setUseLive(false);
      setStatus('IDLE');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      setUseLive(true);
      // attachStream será chamado pelo useEffect [useLive]
      // Mas como useLive já pode ser true, forçamos a conexão aqui também
      await attachStream(stream);
      setStatus('SCANNING');
      startAnalysis();
    } catch {
      setUseLive(false);
      setStatus('CAM_ERROR');
    }
  };

  const handleRetryFile = () => {
    setPreview(null);
    setStatus('IDLE');
  };

  const rejected = status === 'DARK' || status === 'NO_FACE' || status === 'PARTIAL';
  const faceOk = status === 'FACE_DETECTED';
  const isLiveScanning = useLive && !preview && status !== 'APPROVED' && status !== 'CAM_ERROR';
  const ovalColor = faceOk ? '#22c55e' : rejected ? '#ef4444' : '#FFD300';

  // ── Ainda verificando se tem câmera ao vivo
  if (useLive === null) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <div className="w-10 h-10 border-2 border-zinc-300 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-400 text-xs font-bold">Iniciando câmera…</p>
      </div>
    );
  }

  // ── Modo CÂMERA AO VIVO (HTTPS / localhost)
  if (useLive) {
    return (
      <div className="flex flex-col items-center gap-3 flex-1 min-h-0">
        {/* Viewfinder oval — flex-1 adapta ao espaço, max limita em desktop */}
        <div
          className="relative w-full max-w-[240px] mx-auto flex-1 min-h-0 max-h-[320px]"
          style={{ aspectRatio: '3/4' }}
        >
          {/* Vídeo atrás da máscara */}
          {!preview && (
            <video
              ref={videoCallbackRef}
              autoPlay
              playsInline
              muted
              {...({ 'webkit-playsinline': '' } as any)}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
          )}
          {/* Preview da foto capturada */}
          {preview && (
            <img loading="lazy" src={preview} alt="selfie" className="absolute inset-0 w-full h-full object-cover" />
          )}
          {/* Máscara oval — #0A0A0A sólido fora, vídeo só dentro */}
          <svg
            viewBox="0 0 300 400"
            preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          >
            <defs>
              <mask id="oval-mask-bio">
                <rect width="300" height="400" fill="white" />
                <ellipse cx="150" cy="175" rx="105" ry="130" fill="black" />
              </mask>
            </defs>
            <rect width="300" height="400" fill="#0A0A0A" mask="url(#oval-mask-bio)" />
            <ellipse
              cx="150"
              cy="175"
              rx="105"
              ry="130"
              fill="none"
              stroke={status === 'APPROVED' ? '#22c55e' : ovalColor}
              strokeWidth="2"
              style={{ transition: 'stroke 0.3s ease' }}
            />
          </svg>
          {/* Check de aprovação */}
          {status === 'APPROVED' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center">
                <Check size={24} className="text-emerald-400" />
              </div>
            </div>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />

        {/* Flash fullscreen — tela toda branca brilho máximo para iluminar rosto */}
        {flash && (
          <div className="absolute inset-0 z-[9999] pointer-events-none" style={{ backgroundColor: '#FFFFFF' }} />
        )}

        {/* Status text */}
        <p className={`shrink-0 text-xs font-bold text-center px-4 min-h-[18px] ${selfieStatusColor(status)}`}>
          {status === 'LOADING' ? '' : SELFIE_MSGS[status]}
        </p>

        {/* Botões — shrink-0 garante visibilidade sem scroll */}
        <div className="shrink-0 w-full">
          {status === 'APPROVED' ? (
            <button
              onClick={handleRetryLive}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
            >
              <RefreshCw size={13} /> Tirar outra
            </button>
          ) : status === 'CAPTURED' ? (
            <div className="w-full flex gap-2">
              <button
                onClick={handleRetryLive}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
              >
                <RefreshCw size={13} /> Refazer
              </button>
              <button
                onClick={handleConfirmSelfie}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
              >
                <Check size={13} /> Confirmar
              </button>
            </div>
          ) : status !== 'LOADING' && !preview ? (
            <button
              onClick={handleCaptureLive}
              disabled={status !== 'FACE_DETECTED'}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                status === 'FACE_DETECTED'
                  ? 'bg-[#FFD300] text-black active:scale-95'
                  : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              }`}
            >
              <Camera size={13} /> Capturar
            </button>
          ) : null}
        </div>

        <style>{`@keyframes flashFade { from { opacity: 0.9; } to { opacity: 0; } }`}</style>
      </div>
    );
  }

  // ── Modo FILE INPUT (HTTP no celular — fallback)
  return (
    <div className="flex flex-col items-center gap-3 flex-1 min-h-0">
      <div
        className="relative w-full max-w-[240px] mx-auto flex-1 min-h-0 max-h-[320px]"
        style={{ aspectRatio: '3/4' }}
      >
        {preview ? (
          <>
            <img loading="lazy" src={preview} alt="selfie" className="absolute inset-0 w-full h-full object-cover" />
            {/* Máscara oval escura sobre a foto */}
            <svg
              viewBox="0 0 300 400"
              preserveAspectRatio="none"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
            >
              <defs>
                <mask id="oval-mask-file">
                  <rect width="300" height="400" fill="white" />
                  <ellipse cx="150" cy="175" rx="105" ry="130" fill="black" />
                </mask>
              </defs>
              <rect width="300" height="400" fill="#0A0A0A" mask="url(#oval-mask-file)" />
              <ellipse
                cx="150"
                cy="175"
                rx="105"
                ry="130"
                fill="none"
                stroke={status === 'APPROVED' ? '#22c55e' : rejected ? '#ef4444' : '#FFD300'}
                strokeWidth="2"
              />
            </svg>
            {status === 'ANALYZING' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-[#FFD300] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {status === 'APPROVED' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center">
                  <Check size={24} className="text-emerald-400" />
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Oval placeholder vazio */}
            <svg
              viewBox="0 0 300 400"
              preserveAspectRatio="none"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            >
              <ellipse
                cx="150"
                cy="175"
                rx="105"
                ry="130"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2"
                strokeDasharray="8 4"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
              <Camera size={32} className="text-zinc-600" />
              <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Tire uma selfie</p>
            </div>
          </>
        )}
      </div>
      <p className={`shrink-0 text-xs font-bold text-center px-4 min-h-[18px] ${selfieStatusColor(status)}`}>
        {SELFIE_MSGS[status]}
      </p>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFile}
        className="sr-only"
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
        tabIndex={-1}
      />
      <div className="shrink-0 w-full flex gap-2">
        {status === 'APPROVED' ? (
          <button
            onClick={handleRetryFile}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            <RefreshCw size={13} /> Tirar outra
          </button>
        ) : rejected ? (
          <label
            htmlFor={inputId}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw size={13} /> Tentar novamente
          </label>
        ) : status === 'ANALYZING' ? (
          <div className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-zinc-900 border border-white/10 rounded-xl text-zinc-600 text-[10px] font-black uppercase tracking-widest">
            Analisando…
          </div>
        ) : (
          <label
            htmlFor={inputId}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#FFD300] text-black rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all cursor-pointer"
          >
            <Camera size={13} /> Tirar Selfie
          </label>
        )}
      </div>
    </div>
  );
};
