/**
 * ImageCropModal — editor de recorte/posicionamento de foto.
 *
 * Usa react-easy-crop para permitir que o usuário posicione e dê zoom
 * na imagem preenchendo sempre a área alvo.
 *
 * REGRA: a imagem deve preencher 100% da crop area com zoom mínimo.
 * O usuário NUNCA é forçado a cortar — pode confirmar direto.
 * Em desktop, o container é limitado a max-w-[500px] para evitar crop area gigante.
 */

import React, { useState, useCallback, useEffect } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react';
import { useModalBack } from '../hooks/useModalStack';
import { VantaSlider } from './VantaSlider';

// ── Gera o canvas recortado e retorna dataURL ──────────────────────────────────
const getCroppedImg = (imageSrc: string, pixelCrop: Area, maxPx = 1600, quality = 0.78): Promise<string> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const ratio = Math.min(1, maxPx / Math.max(pixelCrop.width, pixelCrop.height));
      const outW = Math.round(pixelCrop.width * ratio);
      const outH = Math.round(pixelCrop.height * ratio);

      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('canvas context'));
        return;
      }
      ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, outW, outH);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    image.onerror = reject;
    image.src = imageSrc;
  });

// ── Componente ─────────────────────────────────────────────────────────────────

interface ImageCropModalProps {
  src: string;
  aspect?: number;
  minWidth?: number;
  minHeight?: number;
  maxPx?: number;
  label?: string;
  onConfirm: (dataUrl: string) => void;
  onClose: () => void;
  autoSkipWhenFit?: boolean;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  src,
  aspect = 1,
  minWidth,
  minHeight,
  maxPx = 1600,
  label = 'Foto',
  onConfirm,
  onClose,
  autoSkipWhenFit = true,
}) => {
  useModalBack(true, onClose, 'image-crop');

  // Fix: react-easy-crop pode travar touch scroll ao desmontar.
  useEffect(() => {
    return () => {
      document.querySelectorAll('[style*="touch-action"]').forEach(el => {
        (el as HTMLElement).style.touchAction = '';
      });
    };
  }, []);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [perfectFit, setPerfectFit] = useState(false);
  const [skipped, setSkipped] = useState(false);

  const onConfirmRef = React.useRef(onConfirm);
  onConfirmRef.current = onConfirm;

  // Detecta se a proporção da imagem bate com o crop
  React.useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const diff = Math.abs(imgAspect - aspect) / aspect;
      const isExact = diff < 0.02;
      setPerfectFit(isExact);

      if (isExact && autoSkipWhenFit) {
        setSkipped(true);
        const ratio = Math.min(1, maxPx / Math.max(img.naturalWidth, img.naturalHeight));
        const outW = Math.round(img.naturalWidth * ratio);
        const outH = Math.round(img.naturalHeight * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, outW, outH);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.78);
          setTimeout(() => {
            if (!cancelled) onConfirmRef.current(dataUrl);
          }, 50);
        }
      }
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src, aspect, autoSkipWhenFit, maxPx]);

  const onCropComplete = useCallback((_: Area, pixelCrop: Area) => {
    setCroppedArea(pixelCrop);
  }, []);

  const handleConfirm = async () => {
    if (!croppedArea) return;
    setConfirming(true);
    try {
      const dataUrl = await getCroppedImg(src, croppedArea, maxPx);
      onConfirm(dataUrl);
    } catch {
      // Silencioso
    } finally {
      setConfirming(false);
    }
  };

  const handleUseOriginal = async () => {
    setConfirming(true);
    try {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(1, maxPx / Math.max(img.naturalWidth, img.naturalHeight));
        const outW = Math.round(img.naturalWidth * ratio);
        const outH = Math.round(img.naturalHeight * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setConfirming(false);
          return;
        }
        ctx.drawImage(img, 0, 0, outW, outH);
        onConfirm(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.onerror = () => setConfirming(false);
      img.src = src;
    } catch {
      setConfirming(false);
    }
  };

  const aspectLabel =
    aspect === 1
      ? '1:1'
      : aspect === 4 / 5
        ? '4:5'
        : aspect === 3
          ? '3:1'
          : aspect === 16 / 9
            ? '16:9'
            : `${aspect.toFixed(1)}`;

  const dimLabel =
    minWidth && minHeight
      ? `${minWidth}×${minHeight}px · ${aspectLabel}`
      : minWidth
        ? `Mín. ${minWidth}px de largura · ${aspectLabel}`
        : minHeight
          ? `Mín. ${minHeight}px de altura · ${aspectLabel}`
          : aspectLabel;

  if (skipped) {
    return <div className="absolute inset-0 z-[500] bg-black" />;
  }

  return (
    <div className="absolute inset-0 z-[500] flex items-center justify-center bg-black">
      {/* Container limitado — evita crop area gigante em desktop */}
      <div className="w-full max-w-[500px] h-full flex flex-col">
        {/* Header */}
        <div
          className="shrink-0 flex items-center justify-between px-5 pb-4 bg-black/90"
          style={{ paddingTop: '2.5rem' }}
        >
          <div>
            <p className="text-[0.5625rem] text-zinc-400 font-black uppercase tracking-widest mb-0.5">
              Ajustar {label}
            </p>
            {dimLabel && (
              <p className="text-[0.5625rem] text-[#FFD300]/80 font-black uppercase tracking-widest">{dimLabel}</p>
            )}
            {perfectFit && (
              <p className="text-[0.5625rem] text-emerald-400 font-black uppercase tracking-widest mt-0.5">
                Imagem já está no tamanho ideal
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
          >
            <X size="1rem" className="text-zinc-400" />
          </button>
        </div>

        {/* Área de crop — container limitado a max-w-[500px] */}
        <div className="flex-1 relative min-h-0">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="contain"
            showGrid={false}
            style={{
              containerStyle: { background: '#000' },
              cropAreaStyle: { borderColor: '#FFD300', borderWidth: 2 },
            }}
          />

          <p className="absolute bottom-3 left-0 right-0 text-center text-[0.5625rem] text-white/30 font-black uppercase tracking-widest pointer-events-none">
            Arraste para posicionar · Pinch ou deslize para zoom
          </p>
        </div>

        {/* Controles de zoom + confirmar */}
        <div
          className="shrink-0 px-5 pt-4 bg-black/90 space-y-4"
          style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setZoom(z => Math.max(1, z - 0.1))}
              className="min-w-[2.75rem] min-h-[2.75rem] rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:opacity-70 transition-opacity shrink-0"
            >
              <ZoomOut size="0.875rem" className="text-zinc-400" />
            </button>
            <VantaSlider min={1} max={3} step={0.01} value={zoom} onChange={setZoom} className="flex-1" />
            <button
              onClick={() => setZoom(z => Math.min(3, z + 0.1))}
              className="min-w-[2.75rem] min-h-[2.75rem] rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:opacity-70 transition-opacity shrink-0"
            >
              <ZoomIn size="0.875rem" className="text-zinc-400" />
            </button>
          </div>

          {perfectFit && (
            <button
              aria-label="Confirmar"
              onClick={handleUseOriginal}
              disabled={confirming}
              className="w-full py-4 bg-emerald-600 text-white font-bold text-[0.625rem] uppercase tracking-[0.25em] rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40 mb-2"
            >
              <Check size="0.875rem" />
              {confirming ? 'Processando…' : 'Usar imagem original'}
            </button>
          )}

          <button
            aria-label="Confirmar"
            onClick={handleConfirm}
            disabled={confirming || !croppedArea}
            className="w-full py-4 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-[0.25em] rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40"
          >
            <Check size="0.875rem" />
            {confirming ? 'Processando…' : perfectFit ? 'Recortar mesmo assim' : 'Usar esta foto'}
          </button>
        </div>
      </div>
    </div>
  );
};
