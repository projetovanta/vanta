import React, { useState, useRef, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, ZoomIn } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { getCroppedImg } from '../utils/imageUtils';
import { VantaSlider } from '../../../components/VantaSlider';
import { useModalBack } from '../../../hooks/useModalStack';

export const ImageCropperModal: React.FC<{ image: string; onConfirm: (img: string) => void; onCancel: () => void }> = ({
  image,
  onConfirm,
  onCancel,
}) => {
  useModalBack(true, onCancel, 'image-cropper');

  // Fix: react-easy-crop pode travar touch scroll ao desmontar.
  // Força restauração do scroll no container pai ao fechar.
  useEffect(() => {
    return () => {
      document.querySelectorAll('[style*="touch-action"]').forEach(el => {
        (el as HTMLElement).style.touchAction = '';
      });
    };
  }, []);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixels, setPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [skipped, setSkipped] = useState(false);

  // Ref estável para onConfirm
  const onConfirmRef = useRef(onConfirm);
  onConfirmRef.current = onConfirm;

  // Auto-skip: se a imagem já é quadrada (aspect ~1:1), usa direto sem forçar crop
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const aspect = img.naturalWidth / img.naturalHeight;
      const tolerance = 0.05; // 5%
      if (Math.abs(aspect - 1) < tolerance) {
        setSkipped(true);
        const maxPx = 1000;
        const ratio = Math.min(1, maxPx / Math.max(img.naturalWidth, img.naturalHeight));
        const outW = Math.round(img.naturalWidth * ratio);
        const outH = Math.round(img.naturalHeight * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, outW, outH);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          setTimeout(() => {
            if (!cancelled) onConfirmRef.current(dataUrl);
          }, 50);
        }
      }
    };
    img.src = image;
    return () => {
      cancelled = true;
    };
  }, [image]);

  // Auto-skip ativo: não renderiza o editor
  if (skipped) {
    return <div className="absolute inset-0 z-[400] bg-black" />;
  }

  return (
    <div className="absolute inset-0 z-[400] flex items-center justify-center bg-black/95 backdrop-blur-2xl">
      <div className="w-full max-w-[500px] h-full flex flex-col bg-black">
        <div
          className="px-6 pb-6 flex justify-between items-center border-b border-white/5"
          style={{ paddingTop: '1.5rem' }}
        >
          <div>
            <h2 style={TYPOGRAPHY.screenTitle} className="text-xl">
              Ajustar Foto
            </h2>
            <p className="text-[0.5625rem] text-[#FFD300] font-black uppercase mt-1">Curadoria</p>
          </div>
          <button onClick={onCancel} className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center">
            <X size="1.125rem" />
          </button>
        </div>
        <div className="relative flex-1 bg-[#050505]">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, p) => setPixels(p)}
          />
        </div>
        <div
          className="px-8 pt-8 space-y-8 bg-[#0a0a0a] border-t border-white/5"
          style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[0.625rem] text-zinc-400 uppercase font-black tracking-widest flex gap-2">
                <ZoomIn size="0.75rem" /> Zoom
              </span>
              <span className="text-[0.625rem] text-[#FFD300] font-mono">{Math.round(zoom * 100)}%</span>
            </div>
            <VantaSlider value={zoom} min={1} max={3} step={0.1} onChange={setZoom} className="w-full" />
          </div>
          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 py-4 bg-zinc-900 border border-white/5 text-white font-bold text-[0.625rem] uppercase rounded-xl"
            >
              Cancelar
            </button>
            <button
              onClick={async () => {
                if (!pixels) return;
                setIsProcessing(true);
                try {
                  const b64 = await getCroppedImg(image, pixels);
                  onConfirm(b64);
                } catch (e) {
                  console.error(e);
                } finally {
                  setIsProcessing(false);
                }
              }}
              disabled={isProcessing}
              className="flex-[2] py-4 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase rounded-xl shadow-xl flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                'Processando...'
              ) : (
                <>
                  <Check size="0.875rem" /> Confirmar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
