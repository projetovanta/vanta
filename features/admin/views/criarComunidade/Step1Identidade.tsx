import React, { useRef, useState } from 'react';
import { Upload, Camera } from 'lucide-react';
import { ImageCropModal } from '../../../../components/ImageCropModal';
import { globalToast } from '../../../../components/Toast';

const inputCls =
  'w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700';
const labelCls = 'text-[0.625rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5 block';

export const Step1Identidade: React.FC<{
  nome: string;
  setNome(v: string): void;
  bio: string;
  setBio(v: string): void;
  fotoPerfil: string;
  setFotoPerfil(v: string): void;
  fotoCapa: string;
  setFotoCapa(v: string): void;
}> = ({ nome, setNome, bio, setBio, fotoPerfil, setFotoPerfil, fotoCapa, setFotoCapa }) => {
  const perfilRef = useRef<HTMLInputElement>(null);
  const capaRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<'perfil' | 'capa' | null>(null);

  const pickImg = (ref: React.RefObject<HTMLInputElement>, target: 'perfil' | 'capa') => {
    const file = ref.current?.files?.[0];
    if (!file) return;
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      globalToast('erro', 'A imagem deve ter no máximo 5MB');
      if (ref.current) ref.current.value = '';
      return;
    }
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      globalToast('erro', 'Formato aceito: JPEG, PNG ou WebP');
      if (ref.current) ref.current.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const src = e.target?.result as string;
      if (src) {
        setCropSrc(src);
        setCropTarget(target);
      }
    };
    reader.readAsDataURL(file);
    if (ref.current) ref.current.value = '';
  };

  const handleCropConfirm = (dataUrl: string) => {
    if (cropTarget === 'perfil') setFotoPerfil(dataUrl);
    if (cropTarget === 'capa') setFotoCapa(dataUrl);
    setCropSrc(null);
    setCropTarget(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className={labelCls}>Nome da Comunidade *</label>
        <input
          value={nome}
          onChange={e => setNome(e.target.value)}
          placeholder="Ex: Mansão no Joá"
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Bio / Descrição *</label>
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          placeholder="Descreva o local, atmosfera e proposta da comunidade..."
          rows={4}
          className={inputCls + ' resize-none leading-relaxed'}
        />
      </div>

      {/* Fotos */}
      <div>
        <label className={labelCls}>Imagens</label>
        <div className="flex gap-3 items-end">
          {/* Foto de perfil */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <input
              ref={perfilRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={() => pickImg(perfilRef, 'perfil')}
            />
            <button
              type="button"
              onClick={() => perfilRef.current?.click()}
              className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-dashed border-white/15 relative group active:scale-95 transition-all bg-zinc-900"
            >
              {fotoPerfil ? (
                <img loading="lazy" src={fotoPerfil} alt="perfil" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera size="1.125rem" className="text-zinc-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-active:opacity-100 flex items-center justify-center">
                <Upload size="0.875rem" className="text-white" />
              </div>
            </button>
            <p className="text-[0.625rem] text-zinc-400 font-black uppercase tracking-widest">Perfil *</p>
            <p className="text-[0.625rem] text-zinc-700 font-black uppercase tracking-widest">Mín. 400x400</p>
          </div>

          {/* Foto de capa */}
          <div className="flex-1 flex flex-col gap-1.5">
            <input
              ref={capaRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={() => pickImg(capaRef, 'capa')}
            />
            <button
              type="button"
              onClick={() => capaRef.current?.click()}
              className="w-full h-20 rounded-2xl overflow-hidden border-2 border-dashed border-white/15 relative group active:scale-95 transition-all bg-zinc-900"
            >
              {fotoCapa ? (
                <img loading="lazy" src={fotoCapa} alt="capa" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                  <Camera size="1.125rem" className="text-zinc-400" />
                  <p className="text-zinc-700 text-[0.625rem] font-black uppercase tracking-widest">Capa</p>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-active:opacity-100 flex items-center justify-center">
                <Upload size="0.875rem" className="text-white" />
              </div>
            </button>
            <p className="text-[0.625rem] text-zinc-400 font-black uppercase tracking-widest">Capa *</p>
            <p className="text-[0.625rem] text-zinc-700 font-black uppercase tracking-widest">Mín. 1200x400</p>
          </div>
        </div>
      </div>

      {/* Editor de crop */}
      {cropSrc && cropTarget && (
        <ImageCropModal
          src={cropSrc}
          aspect={cropTarget === 'perfil' ? 1 : 3}
          minWidth={cropTarget === 'perfil' ? 400 : 1200}
          minHeight={cropTarget === 'perfil' ? 400 : 400}
          maxPx={cropTarget === 'perfil' ? 400 : 1200}
          label={cropTarget === 'perfil' ? 'Foto de Perfil' : 'Foto de Capa'}
          onConfirm={handleCropConfirm}
          onClose={() => {
            setCropSrc(null);
            setCropTarget(null);
          }}
        />
      )}
    </div>
  );
};
