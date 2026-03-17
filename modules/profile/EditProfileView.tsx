import React, { useState, useRef, useMemo, useCallback } from 'react';
import { fmtTelefone } from '@/components/auth/authHelpers';
import {
  ArrowLeft,
  Camera,
  Check,
  Loader2,
  AlertTriangle,
  X,
  Plus,
  Trash2,
  Globe,
  Users,
  Lock,
  User,
  MapPin,
  Image as ImageIcon,
} from 'lucide-react';
import { Membro, PrivacidadeConfig, PrivacidadeOpcao } from '../../types';
import { TYPOGRAPHY } from '../../constants';
import { InterestSelector } from './components/InterestSelector';
import { ImageCropperModal } from './components/ImageCropperModal';
import { compressImage } from './utils/imageUtils';
import { uploadAvatar, deleteAvatar, syncAlbum } from '../../services/photoService';
import { useToast, ToastContainer } from '../../components/Toast';
import { ESTADOS_CIDADES, ESTADOS, DDDS } from '../../data/brData';
import { DEFAULT_AVATARS } from '../../data/avatars';
import { VantaPickerModal } from '../../components/VantaPickerModal';
import { VantaDatePicker } from '../../components/VantaDatePicker';

// ── Privacidade Inline ──────────────────────────────────────────────────────

const PRIVACY_CYCLE: PrivacidadeOpcao[] = ['TODOS', 'AMIGOS', 'NINGUEM'];
const PRIVACY_DISPLAY: Record<string, { icon: typeof Globe; label: string; color: string }> = {
  TODOS: { icon: Globe, label: 'Todos', color: 'text-emerald-400' },
  AMIGOS: { icon: Users, label: 'Amigos', color: 'text-blue-400' },
  NINGUEM: { icon: Lock, label: 'Só eu', color: 'text-zinc-400' },
};

const PrivacyToggle: React.FC<{ value: PrivacidadeOpcao; onChange: (v: PrivacidadeOpcao) => void }> = ({
  value,
  onChange,
}) => {
  const display = PRIVACY_DISPLAY[value] || PRIVACY_DISPLAY.TODOS;
  const Icon = display.icon;
  const cycle = () => {
    const idx = PRIVACY_CYCLE.indexOf(value);
    onChange(PRIVACY_CYCLE[(idx + 1) % PRIVACY_CYCLE.length]);
  };
  return (
    <button
      type="button"
      onClick={cycle}
      className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-900/60 border border-white/5 active:scale-95 transition-all ${display.color}`}
    >
      <Icon size="0.625rem" />
      <span className="text-[0.5rem] font-black uppercase tracking-wider">{display.label}</span>
    </button>
  );
};

// ── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_PRIVACY: PrivacidadeConfig = {
  adicionarAmigo: 'TODOS',
  verEmail: 'NINGUEM',
  verBio: 'TODOS',
  verInstagram: 'AMIGOS',
  verInteresses: 'AMIGOS',
  verEventos: 'TODOS',
  verAlbum: 'AMIGOS',
  verAniversario: 'AMIGOS',
  verConquistas: 'TODOS',
  verTelefone: 'NINGUEM',
  verCidade: 'AMIGOS',
  verGenero: 'AMIGOS',
  verMood: 'AMIGOS',
};

// ── Validação ────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ValidationError {
  field: string;
  message: string;
}

function validate(data: {
  nome: string;
  email: string;
  dataNascimento: string;
  telefone: { ddd: string; numero: string };
  estado: string;
  cidade: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!data.nome || data.nome.trim().length < 3) {
    errors.push({ field: 'nome', message: 'Nome deve ter pelo menos 3 caracteres' });
  }
  if (!data.email || !EMAIL_RE.test(data.email)) {
    errors.push({ field: 'email', message: 'E-mail inválido' });
  }
  if (data.dataNascimento) {
    const birth = new Date(data.dataNascimento);
    const now = new Date();
    if (birth > now) {
      errors.push({ field: 'dataNascimento', message: 'Data de nascimento não pode ser futura' });
    } else {
      const age = now.getFullYear() - birth.getFullYear();
      const monthDiff = now.getMonth() - birth.getMonth();
      const realAge = monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate()) ? age - 1 : age;
      if (realAge < 16) {
        errors.push({ field: 'dataNascimento', message: 'Idade mínima: 16 anos' });
      }
    }
  }
  if (!data.estado) {
    errors.push({ field: 'estado', message: 'Selecione o estado' });
  }
  if (!data.cidade) {
    errors.push({ field: 'cidade', message: 'Selecione a cidade' });
  }
  const num = data.telefone.numero.replace(/\D/g, '');
  if (num.length === 0) {
    errors.push({ field: 'telefone', message: 'Telefone é obrigatório' });
  } else if (num.length < 8 || num.length > 9) {
    errors.push({ field: 'telefone', message: 'Telefone deve ter 8 ou 9 dígitos' });
  }
  return errors;
}

// ── Componente ───────────────────────────────────────────────────────────────

export const EditProfileView: React.FC<{
  profile: Membro;
  onBack: () => void;
  onSave: (d: Partial<Membro>) => void;
}> = ({ profile, onBack, onSave }) => {
  const { toasts, dismiss, toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<'avatar' | number | null>(null);
  const [scrollKey, setScrollKey] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const [privacy, setPrivacy] = useState<PrivacidadeConfig>({
    ...DEFAULT_PRIVACY,
    ...profile.privacidade,
  });

  const [formData, setFormData] = useState({
    nome: profile.nome,
    email: profile.email,
    instagram: profile.instagram || '',
    dataNascimento: profile.dataNascimento || '',
    telefone: { ddd: profile.telefone?.ddd || '21', numero: profile.telefone?.numero || '' },
    estado: profile.estado || '',
    cidade: profile.cidade || '',
    biografia: profile.biografia || '',
    genero: profile.genero ?? '',
    foto: profile.foto,
    fotos: profile.fotos || [],
    interesses: profile.interesses,
  });

  const hasChanges = useMemo(() => {
    return (
      profile.nome !== formData.nome ||
      profile.email !== formData.email ||
      profile.foto !== formData.foto ||
      (profile.instagram || '') !== formData.instagram ||
      (profile.dataNascimento || '') !== formData.dataNascimento ||
      (profile.biografia || '') !== formData.biografia ||
      profile.genero !== formData.genero ||
      (profile.estado || '') !== formData.estado ||
      (profile.cidade || '') !== formData.cidade ||
      (profile.telefone?.ddd || '21') !== formData.telefone.ddd ||
      (profile.telefone?.numero || '') !== formData.telefone.numero ||
      JSON.stringify(profile.interesses) !== JSON.stringify(formData.interesses) ||
      JSON.stringify(profile.fotos || []) !== JSON.stringify(formData.fotos) ||
      JSON.stringify(profile.privacidade || DEFAULT_PRIVACY) !== JSON.stringify(privacy)
    );
  }, [profile, formData, privacy]);

  const cidades = formData.estado ? ESTADOS_CIDADES[formData.estado] || [] : [];

  const triggerFileInput = useCallback((target: 'avatar' | number) => {
    setCropTarget(target);
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setTempImage(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropConfirm = async (croppedImage: string) => {
    const compressed = await compressImage(croppedImage, cropTarget === 'avatar' ? 600 : 800, 0.78);
    if (cropTarget === 'avatar') {
      setFormData(prev => ({ ...prev, foto: compressed }));
    } else if (typeof cropTarget === 'number') {
      setFormData(prev => {
        const fotos = [...(prev.fotos || [])];
        fotos[cropTarget] = compressed;
        return { ...prev, fotos };
      });
    }
    setTempImage(null);
    setCropTarget(null);
    setScrollKey(k => k + 1);
  };

  const removeAlbumPhoto = (index: number) => {
    setFormData(prev => {
      const fotos = [...(prev.fotos || [])];
      fotos.splice(index, 1);
      return { ...prev, fotos };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate(formData);
    if (errors.length > 0) {
      errors.forEach(err => toast('erro', err.message));
      return;
    }
    setIsSaving(true);
    try {
      const userId = profile.id;
      let fotoFinal = formData.foto;
      let fotosFinal = formData.fotos || [];

      if (formData.foto.startsWith('data:')) {
        try {
          fotoFinal = await uploadAvatar(userId, formData.foto);
        } catch {
          toast('erro', 'Erro ao enviar foto de perfil');
        }
      } else if (
        Object.values(DEFAULT_AVATARS).includes(formData.foto) &&
        !Object.values(DEFAULT_AVATARS).includes(profile.foto)
      ) {
        try {
          await deleteAvatar(userId);
        } catch {
          // silently ignore — avatar may not exist in storage
        }
      }

      const estadoAnterior = profile.fotos || [];
      const novoEstado = (formData.fotos || []).map(f => f || undefined);
      try {
        fotosFinal = await syncAlbum(userId, novoEstado, estadoAnterior);
      } catch {
        toast('erro', 'Erro ao sincronizar álbum');
      }

      try {
        const { supabase } = await import('../../services/supabaseClient');
        const { error } = await supabase
          .from('profiles')
          .update({
            nome: formData.nome,
            email: formData.email,
            instagram: formData.instagram,
            data_nascimento: formData.dataNascimento,
            estado: formData.estado,
            cidade: formData.cidade,
            telefone_ddd: formData.telefone?.ddd,
            telefone_numero: formData.telefone?.numero,
            biografia: formData.biografia,
            genero: formData.genero,
            avatar_url: fotoFinal,
            interesses: formData.interesses ?? [],
            album_urls: fotosFinal.filter(Boolean),
            privacidade: { ...privacy, verTelefone: 'NINGUEM' },
          })
          .eq('id', userId);
        if (error) throw error;
      } catch {
        toast('erro', 'Erro ao salvar perfil');
        setIsSaving(false);
        return;
      }

      onSave({
        ...formData,
        foto: fotoFinal,
        fotos: fotosFinal,
        privacidade: privacy,
      });
      toast('sucesso', 'Perfil salvo');
    } catch {
      toast('erro', 'Erro inesperado ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  const updatePrivacy = (key: keyof PrivacidadeConfig, val: PrivacidadeOpcao) => {
    setPrivacy(p => ({ ...p, [key]: val }));
  };

  const MAX_PHOTOS = 6;
  const BIO_MAX = 200;

  const sectionCls = 'bg-zinc-900/40 rounded-2xl p-5 space-y-5 border border-white/5';
  const sectionTitleCls = 'flex items-center gap-2';
  const labelCls = 'text-[0.625rem] text-zinc-400 font-black uppercase tracking-widest ml-1';
  const inputCls =
    'w-full bg-black/30 border border-white/5 rounded-xl p-4 text-white text-sm focus:border-[#FFD300]/40 outline-none';

  return (
    <div className="absolute inset-0 bg-[#0a0a0a] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <div
        className="shrink-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 px-6 pb-4 flex items-center justify-between"
        style={{ paddingTop: '1rem' }}
      >
        <button
          onClick={() => (hasChanges ? setShowExitConfirm(true) : onBack())}
          className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10"
        >
          <ArrowLeft size="1.125rem" />
        </button>
        <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic">
          Editar Perfil
        </h1>
        <div className="w-10" />
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      <div key={scrollKey} className="flex-1 overflow-y-auto no-scrollbar">
        <form onSubmit={handleSubmit} className="p-5 space-y-5 pb-10">
          {/* ── SEÇÃO 1: Foto & Nome ──────────────────────────────── */}
          <div className="flex flex-col items-center pt-2 pb-2">
            <div
              onClick={() => !isSaving && triggerFileInput('avatar')}
              className="relative cursor-pointer active:scale-95 transition-all"
            >
              <div className="w-28 h-28 rounded-full p-[2px] bg-gradient-to-tr from-[#FFD300] to-transparent shadow-2xl">
                <div className="w-full h-full rounded-full border-4 border-[#0a0a0a] overflow-hidden bg-black">
                  <img loading="lazy" src={formData.foto} alt="Foto de perfil" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-2.5 rounded-full border backdrop-blur-sm bg-black/40 border-[#FFD300]/30">
                  <Camera size="1.125rem" className="text-[#FFD300]" />
                </div>
              </div>
            </div>
            {formData.foto && !Object.values(DEFAULT_AVATARS).includes(formData.foto) && (
              <button
                type="button"
                onClick={() => {
                  const defaultAvatar =
                    DEFAULT_AVATARS[formData.genero as keyof typeof DEFAULT_AVATARS] || DEFAULT_AVATARS.MASCULINO;
                  setFormData(p => ({ ...p, foto: defaultAvatar }));
                }}
                className="mt-3 text-[0.5625rem] text-zinc-400 font-bold uppercase active:text-red-400 transition-colors"
              >
                Remover foto
              </button>
            )}
            <div className="w-full mt-5 space-y-2">
              <label className={labelCls}>Nome Completo *</label>
              <input
                type="text"
                value={formData.nome}
                onChange={e => setFormData(p => ({ ...p, nome: e.target.value }))}
                className={inputCls}
                placeholder="Seu nome"
              />
            </div>
          </div>

          {/* ── SEÇÃO 2: Sobre Mim ────────────────────────────────── */}
          <div className={sectionCls}>
            <div className={sectionTitleCls}>
              <User size="0.875rem" className="text-[#FFD300]" />
              <h3 style={TYPOGRAPHY.uiLabel} className="!mb-0">
                Sobre Mim
              </h3>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={labelCls}>Biografia</label>
                <PrivacyToggle value={privacy.verBio} onChange={v => updatePrivacy('verBio', v)} />
              </div>
              <textarea
                value={formData.biografia}
                onChange={e => {
                  if (e.target.value.length <= BIO_MAX) {
                    setFormData(p => ({ ...p, biografia: e.target.value }));
                  }
                }}
                className={`${inputCls} resize-none h-24`}
                placeholder="Conte um pouco sobre você..."
              />
              <p className="text-[0.5625rem] text-zinc-400 text-right font-bold">
                {formData.biografia.length}/{BIO_MAX}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={labelCls}>Gênero</label>
                  <PrivacyToggle value={privacy.verGenero} onChange={v => updatePrivacy('verGenero', v)} />
                </div>
                <div className="flex bg-black/40 p-0.5 rounded-xl border border-white/5 w-full">
                  {(['MASCULINO', 'FEMININO', 'PREFIRO_NAO_DIZER'] as const).map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, genero: g }))}
                      className={`flex-1 py-2.5 rounded-lg text-[0.5rem] font-black uppercase transition-all flex items-center justify-center gap-1 ${
                        formData.genero === g ? 'bg-[#FFD300] text-black shadow-lg' : 'text-zinc-400'
                      }`}
                    >
                      {g === 'MASCULINO' ? 'Masc' : g === 'FEMININO' ? 'Fem' : 'N/I'}
                      {formData.genero === g && <Check size="0.625rem" strokeWidth={4} />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={labelCls}>Nascimento</label>
                  <PrivacyToggle value={privacy.verAniversario} onChange={v => updatePrivacy('verAniversario', v)} />
                </div>
                <VantaDatePicker
                  value={formData.dataNascimento}
                  onChange={v => setFormData(p => ({ ...p, dataNascimento: v }))}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className={labelCls}>Interesses</label>
                <PrivacyToggle value={privacy.verInteresses} onChange={v => updatePrivacy('verInteresses', v)} />
              </div>
              <InterestSelector
                selected={formData.interesses}
                onToggle={id =>
                  setFormData(p => ({
                    ...p,
                    interesses: p.interesses.includes(id) ? p.interesses.filter(i => i !== id) : [...p.interesses, id],
                  }))
                }
              />
            </div>
          </div>

          {/* ── SEÇÃO 3: Contato & Localização ────────────────────── */}
          <div className={sectionCls}>
            <div className={sectionTitleCls}>
              <MapPin size="0.875rem" className="text-[#FFD300]" />
              <h3 style={TYPOGRAPHY.uiLabel} className="!mb-0">
                Contato & Localização
              </h3>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={labelCls}>E-mail *</label>
                <PrivacyToggle value={privacy.verEmail} onChange={v => updatePrivacy('verEmail', v)} />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                className={inputCls}
                placeholder="seu@email.com"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={labelCls}>Instagram</label>
                <PrivacyToggle value={privacy.verInstagram} onChange={v => updatePrivacy('verInstagram', v)} />
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">@</span>
                <input
                  type="text"
                  value={formData.instagram.replace(/^@/, '')}
                  onChange={e => setFormData(p => ({ ...p, instagram: `@${e.target.value.replace(/^@/, '')}` }))}
                  className={`${inputCls} pl-8`}
                  placeholder="usuario"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelCls}>Telefone *</label>
              <div className="flex gap-2">
                <div className="w-24 shrink-0">
                  <VantaPickerModal
                    items={DDDS.map(d => ({ value: d, label: `(${d})` }))}
                    value={formData.telefone.ddd}
                    onChange={v => setFormData(p => ({ ...p, telefone: { ...p.telefone, ddd: v } }))}
                    label="DDD"
                    placeholder="DDD"
                    searchable
                  />
                </div>
                <input
                  type="tel"
                  value={fmtTelefone(formData.telefone.numero)}
                  onChange={e =>
                    setFormData(p => ({
                      ...p,
                      telefone: { ...p.telefone, numero: e.target.value.replace(/\D/g, '').slice(0, 9) },
                    }))
                  }
                  className={`${inputCls} flex-1 min-w-0`}
                  placeholder="99999-9999"
                  inputMode="numeric"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={labelCls}>Localização *</label>
                <PrivacyToggle value={privacy.verCidade} onChange={v => updatePrivacy('verCidade', v)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <VantaPickerModal
                  items={ESTADOS.map(uf => ({ value: uf, label: uf }))}
                  value={formData.estado}
                  onChange={v => setFormData(p => ({ ...p, estado: v, cidade: '' }))}
                  label="Estado"
                  placeholder="UF"
                  searchable
                />
                <VantaPickerModal
                  items={cidades.map(c => ({ value: c, label: c }))}
                  value={formData.cidade}
                  onChange={v => setFormData(p => ({ ...p, cidade: v }))}
                  label="Cidade"
                  placeholder="Cidade"
                  searchable
                  disabled={!formData.estado}
                />
              </div>
            </div>
          </div>

          {/* ── SEÇÃO 4: Álbum de Fotos ───────────────────────────── */}
          <div className={sectionCls}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon size="0.875rem" className="text-[#FFD300]" />
                <h3 style={TYPOGRAPHY.uiLabel} className="!mb-0">
                  Álbum de Fotos
                </h3>
                <PrivacyToggle value={privacy.verAlbum} onChange={v => updatePrivacy('verAlbum', v)} />
              </div>
              <span className="text-[0.5625rem] font-black uppercase tracking-widest text-zinc-400">
                {formData.fotos?.length || 0}/{MAX_PHOTOS}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: MAX_PHOTOS }, (_, i) => {
                const foto = formData.fotos?.[i];
                return (
                  <div key={i} className="relative aspect-square">
                    {foto ? (
                      <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/5">
                        <img loading="lazy" src={foto} alt="Foto do perfil" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-end justify-between p-1.5 bg-gradient-to-t from-black/60 to-transparent">
                          <button
                            type="button"
                            onClick={() => triggerFileInput(i)}
                            className="w-7 h-7 bg-black/60 backdrop-blur rounded-lg flex items-center justify-center active:scale-90 transition-transform"
                          >
                            <Camera size="0.75rem" className="text-white" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeAlbumPhoto(i)}
                            className="w-7 h-7 bg-black/60 backdrop-blur rounded-lg flex items-center justify-center active:scale-90 transition-transform"
                          >
                            <Trash2 size="0.75rem" className="text-red-400" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => !isSaving && triggerFileInput(i)}
                        className="w-full h-full bg-black/30 rounded-xl border border-white/5 border-dashed flex flex-col items-center justify-center gap-1 active:scale-95 transition-all active:border-[#FFD300]/30"
                      >
                        <Plus size="1rem" className="text-zinc-700" />
                        <span className="text-[0.5rem] font-bold uppercase text-zinc-700">{i + 1}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Botão Salvar ──────────────────────────────────────── */}
          <div className="pt-2" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
            <button
              aria-label="Carregando"
              type="submit"
              disabled={isSaving}
              className="w-full py-4 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-[0.3em] rounded-xl shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 transition-all"
            >
              {isSaving ? <Loader2 size="0.875rem" className="animate-spin" /> : <Check size="0.875rem" />}
              {isSaving ? 'Salvando...' : 'Confirmar Alterações'}
            </button>
          </div>
        </form>
      </div>

      {tempImage && cropTarget !== null && (
        <ImageCropperModal
          image={tempImage}
          onConfirm={handleCropConfirm}
          onCancel={() => {
            setTempImage(null);
            setCropTarget(null);
            setScrollKey(k => k + 1);
          }}
        />
      )}

      {showExitConfirm && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            role="presentation"
            onClick={() => setShowExitConfirm(false)}
          />
          <div className="relative w-full max-w-[85%] bg-[#0A0A0A] border border-[#FFD300]/20 rounded-[2.5rem] p-8 text-center shadow-[0_0_50px_rgba(255,211,0,0.08)] animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowExitConfirm(false)}
              className="absolute top-6 right-6 p-2 text-zinc-400 active:text-white transition-colors"
            >
              <X size="1.125rem" />
            </button>
            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#FFD300]/20 shadow-xl">
              <AlertTriangle size="1.75rem" className="text-[#FFD300]" />
            </div>
            <h2 style={TYPOGRAPHY.screenTitle} className="text-xl text-white mb-3 italic">
              Sair sem salvar?
            </h2>
            <p className="text-zinc-400 text-xs leading-relaxed mb-8 px-4">
              Suas alterações serão perdidas se você sair agora.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="w-full py-4 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all"
              >
                Continuar Editando
              </button>
              <button
                onClick={onBack}
                className="w-full py-4 text-zinc-400 font-bold text-[0.625rem] uppercase active:opacity-60 transition-all"
              >
                Sair sem salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
