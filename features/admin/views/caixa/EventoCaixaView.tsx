import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, X, Sparkles, Clock, Camera, User, AlertTriangle, Mail, Tag, WifiOff, RefreshCw } from 'lucide-react';
import { EventoAdmin, LoteAdmin, VariacaoIngresso } from '../../../../types';
import { eventosAdminService } from '../../services/eventosAdminService';
import { offlineEventService } from '../../../../services/offlineEventService';
import { useConnectivity } from '../../../../hooks/useConnectivity';
import { signTicketToken } from '../../services/jwtService';
import { supabase } from '../../../../services/supabaseClient';
import { dataURLtoBlob, fmtBRL } from '../../../../utils';
import { useCameraPermission } from '../../../../hooks/usePermission';

const genLabel = (v: VariacaoIngresso) =>
  v.genero === 'MASCULINO' ? 'Masc.' : v.genero === 'FEMININO' ? 'Fem.' : 'Unisex';

const formatCPF = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

type VendaStep = 'LOTES' | 'CADASTRO' | 'EMAIL' | 'SELFIE' | 'SUCESSO';
type SelVar = { variacao: VariacaoIngresso; loteId: string };

const EventoCaixaView: React.FC<{
  evento: EventoAdmin;
  onBack: () => void;
}> = ({ evento }) => {
  const [step, setStep] = useState<VendaStep>('LOTES');
  const [sel, setSel] = useState<SelVar | null>(null);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [nomeErro, setNomeErro] = useState('');
  const [cpfErro, setCpfErro] = useState('');
  const [email, setEmail] = useState('');
  const [emailErro, setEmailErro] = useState('');
  const [selfiePreview, setSelfie] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState('');
  const [qrToken, setQrToken] = useState('');
  const [clockTime, setClockTime] = useState(() =>
    new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  );
  const [ownerFound, setOwnerFound] = useState<boolean | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { request: requestCam } = useCameraPermission();
  const [camDenied, setCamDenied] = useState(false);
  const { isOnline, pendingSyncCount, syncing } = useConnectivity();

  // Popular cache IndexedDB para suporte offline
  useEffect(() => {
    void offlineEventService.loadLotesVariacoes(evento.id);
  }, [evento.id]);

  // Relógio (1s) + renovação do token JWT (14s)
  useEffect(() => {
    if (step !== 'SUCESSO') return;
    const clockId = setInterval(
      () =>
        setClockTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })),
      1_000,
    );
    const tokenId = setInterval(async () => {
      if (!ticketId) return;
      const t = await signTicketToken(ticketId);
      setQrToken(t);
    }, 14_000);
    return () => {
      clearInterval(clockId);
      clearInterval(tokenId);
    };
  }, [step, ticketId]);

  const lotesAtivos = evento.lotes.filter(l => l.ativo);

  const handleVender = (lote: LoteAdmin, v: VariacaoIngresso) => {
    setSel({ variacao: v, loteId: lote.id });
    setNome('');
    setCpf('');
    setNomeErro('');
    setCpfErro('');
    setEmail('');
    setEmailErro('');
    setSelfie(null);
    setStep('CADASTRO');
  };

  const handleCadastroNext = () => {
    const nomeOk = nome.trim().length >= 2;
    const cpfOk = cpf.replace(/\D/g, '').length === 11;
    if (!nomeOk) {
      setNomeErro('Informe o nome completo.');
      return;
    }
    if (!cpfOk) {
      setCpfErro('CPF inválido.');
      return;
    }
    setStep('EMAIL');
  };

  const handleEmailNext = async () => {
    if (!email.includes('@')) {
      setEmailErro('E-mail inválido.');
      return;
    }
    // Lookup no profiles para associar owner_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();
    setOwnerFound(!!profile);
    setStep('SELFIE');
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    const { stream, denied } = await requestCam({
      video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 480 } },
      audio: false,
    });
    if (denied || !stream) {
      setCamDenied(true);
      return;
    }
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
    setCameraActive(true);
  }, [requestCam]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setSelfie(dataUrl);
    stopCamera();
  }, [stopCamera]);

  // Cleanup câmera ao desmontar ou mudar step
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [step, stopCamera]);

  const uploadSelfie = async (ticketId: string, base64: string): Promise<string | undefined> => {
    try {
      const blob = dataURLtoBlob(base64);
      const { data, error } = await supabase.storage
        .from('selfies')
        .upload(`tickets/${ticketId}.jpg`, blob, { contentType: 'image/jpeg', upsert: true });
      if (error || !data) return undefined;
      return supabase.storage.from('selfies').getPublicUrl(data.path).data.publicUrl;
    } catch {
      return undefined;
    }
  };

  const confirmarVenda = async () => {
    if (!sel) return;
    const { ok, ticketId: newId } = await offlineEventService.registrarVendaOffline(
      evento.id,
      sel.loteId,
      sel.variacao.id,
      email.trim().toLowerCase(),
      { nomeTitular: nome, cpf: cpf.replace(/\D/g, '') },
    );
    if (!ok) return;

    const finalId = newId ?? `offline_${Date.now()}`;
    setTicketId(finalId);

    // Online: associar owner_id + selfie + gerar QR real
    if (newId && navigator.onLine) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (profile?.id) {
        const { error: errOwner } = await supabase
          .from('tickets_caixa')
          .update({ owner_id: profile.id })
          .eq('id', newId);
        if (errOwner) console.error('[EventoCaixaView] owner_id update:', errOwner);
      }

      if (selfiePreview) {
        const url = await uploadSelfie(newId, selfiePreview);
        if (url) await eventosAdminService.atualizarSelfieUrl(newId, url);
      }

      const token = await signTicketToken(newId);
      setQrToken(token);
    }
    // Offline: sem QR real mas mostra tela de sucesso

    setStep('SUCESSO');
  };

  const reiniciar = () => {
    stopCamera();
    setStep('LOTES');
    setSel(null);
    setNome('');
    setCpf('');
    setEmail('');
    setNomeErro('');
    setCpfErro('');
    setEmailErro('');
    setSelfie(null);
    setTicketId('');
    setQrToken('');
    setOwnerFound(null);
    setCamDenied(false);
  };

  // ── SUCESSO ──
  if (step === 'SUCESSO' && sel) {
    const { variacao } = sel;
    const emissaoLabel = new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col items-center justify-center px-6 py-8 max-w-3xl mx-auto w-full">
        <style>{`
          @keyframes shimmerQR {
            0%   { transform: translateX(-100%) rotate(15deg); }
            100% { transform: translateX(250%) rotate(15deg); }
          }
        `}</style>

        <div
          className="w-full max-w-[300px] rounded-3xl p-px animate-in slide-in-from-bottom duration-300"
          style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' }}
        >
          <div className="bg-zinc-950 rounded-[calc(1.5rem-1px)] overflow-hidden backdrop-blur-xl">
            <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center">
              <p className="text-[8px] font-black uppercase tracking-[0.35em] text-purple-400/70 mb-4">
                Ingresso Emitido
              </p>

              {/* Selfie do titular (se capturada) */}
              {selfiePreview && (
                <img
                  src={selfiePreview}
                  alt="Selfie"
                  className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/40 mb-3"
                />
              )}

              {/* QR Code real com JWT */}
              <div className="relative w-36 h-36 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5 mb-3 overflow-hidden">
                {qrToken ? (
                  <QRCodeSVG
                    value={qrToken}
                    size={112}
                    fgColor="#e4e4e7"
                    bgColor="#09090b"
                    style={{ borderRadius: 4 }}
                  />
                ) : (
                  <div className="w-28 h-28 animate-pulse bg-zinc-800 rounded-lg" />
                )}
                {/* Logo VANTA no centro */}
                <div className="absolute w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center border border-purple-500/30">
                  <Sparkles size={14} className="text-[#FFD300]" />
                </div>
                {/* Shimmer anti-print */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(105deg, transparent 30%, rgba(139,92,246,0.35) 50%, transparent 70%)',
                    animation: 'shimmerQR 2.4s ease-in-out infinite',
                  }}
                />
                {/* Watermark de tempo */}
                <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 opacity-40">
                  <Clock size={7} className="text-purple-300" />
                  <span className="text-[6px] font-black text-purple-300 tabular-nums">{clockTime}</span>
                </div>
              </div>

              {/* Dados do ingresso */}
              <p className="text-white font-black text-base leading-none">
                {variacao.area} · {genLabel(variacao)}
              </p>
              {nome && <p className="text-zinc-400 text-xs mt-1 truncate max-w-full">{nome}</p>}
              <p
                className="font-black text-lg mt-1"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {fmtBRL(variacao.valor)}
              </p>
              <p className="text-zinc-400 text-[10px] mt-1 truncate max-w-full">{email}</p>
              <p className="text-zinc-700 text-[8px] font-black uppercase tracking-widest mt-1">{evento.nome}</p>
            </div>

            {/* Separador perfurado */}
            <div className="relative flex items-center px-4">
              <div className="w-5 h-5 rounded-full bg-black shrink-0 -ml-4 border-r border-white/5" />
              <div className="flex-1 border-t border-dashed border-white/10 mx-1" />
              <div className="w-5 h-5 rounded-full bg-black shrink-0 -mr-4 border-l border-white/5" />
            </div>

            <div className="px-6 py-4 flex flex-col items-center gap-2">
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full border"
                style={{ background: 'rgba(139,92,246,0.08)', borderColor: 'rgba(139,92,246,0.25)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-purple-300">
                  Vendido na Porta
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
              </div>
              {ownerFound !== null && (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                    ownerFound ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                  }`}
                >
                  {ownerFound ? (
                    <>
                      <Check size={9} className="text-emerald-400" />
                      <span className="text-[7px] font-black uppercase tracking-widest text-emerald-400">
                        Enviado ao app
                      </span>
                    </>
                  ) : (
                    <>
                      <Mail size={9} className="text-amber-400" />
                      <span className="text-[7px] font-black uppercase tracking-widest text-amber-400">
                        Enviado por e-mail
                      </span>
                    </>
                  )}
                </div>
              )}
              <p className="text-zinc-700 text-[8px] font-black">{emissaoLabel}</p>
              {ticketId && <p className="text-zinc-800 text-[7px] font-black tracking-widest">{ticketId}</p>}
            </div>
          </div>
        </div>

        <button
          onClick={reiniciar}
          className="mt-7 px-8 py-4 bg-[#FFD300] text-black font-bold text-[10px] uppercase tracking-[0.3em] rounded-xl active:scale-[0.98] transition-all"
        >
          Nova Venda
        </button>
      </div>
    );
  }

  // ── SELFIE ──
  if (step === 'SELFIE' && sel) {
    return (
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-5 max-w-3xl mx-auto w-full">
        {/* Resumo */}
        <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl">
          <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest mb-1">Ingresso</p>
          <p className="text-white font-bold text-sm">
            {sel.variacao.area} · {genLabel(sel.variacao)}
          </p>
          <p className="text-zinc-400 text-xs mt-0.5 truncate">{nome}</p>
        </div>

        {/* Info: ingresso vai pro app ou por email */}
        {ownerFound !== null && (
          <div
            className={`p-3 rounded-xl border flex items-start gap-2.5 ${
              ownerFound ? 'bg-emerald-500/8 border-emerald-500/20' : 'bg-amber-500/8 border-amber-500/20'
            }`}
          >
            {ownerFound ? (
              <>
                <Check size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-emerald-300 text-[10px] leading-relaxed">
                  Ingresso será enviado direto para o app do comprador.
                </p>
              </>
            ) : (
              <>
                <Mail size={14} className="text-amber-400 mt-0.5 shrink-0" />
                <p className="text-amber-300 text-[10px] leading-relaxed">
                  Comprador não tem cadastro no app. O ingresso será enviado por e-mail.
                </p>
              </>
            )}
          </div>
        )}

        <div className="flex flex-col items-center gap-4 py-2">
          {/* Preview ou câmera ao vivo */}
          {selfiePreview ? (
            <img
              src={selfiePreview}
              alt="Selfie"
              className="w-32 h-32 rounded-full object-cover border-4 border-purple-500/40"
            />
          ) : cameraActive ? (
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/40 relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-zinc-900/60 border-2 border-dashed border-white/10 flex items-center justify-center">
              <Camera size={32} className="text-zinc-700" />
            </div>
          )}

          {camDenied ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1.5 text-red-400">
                <AlertTriangle size={12} />
                <span className="text-[10px] font-black uppercase tracking-widest">Câmera bloqueada</span>
              </div>
              <p className="text-zinc-400 text-[9px] text-center max-w-[220px]">
                Libere o acesso à câmera nas configurações do navegador.
              </p>
            </div>
          ) : cameraActive ? (
            <button
              onClick={capturePhoto}
              className="px-6 py-3 bg-purple-600 border border-purple-500/30 text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center gap-2"
            >
              <Camera size={14} />
              Capturar
            </button>
          ) : (
            <button
              onClick={
                selfiePreview
                  ? () => {
                      setSelfie(null);
                      startCamera();
                    }
                  : startCamera
              }
              className="px-6 py-3 bg-zinc-800 border border-white/10 text-zinc-300 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center gap-2"
            >
              <Camera size={14} />
              {selfiePreview ? 'Tirar Nova Selfie' : 'Abrir Câmera'}
            </button>
          )}

          <p className="text-zinc-400 text-[9px] text-center leading-relaxed max-w-[200px]">
            Opcional — foto usada na portaria para conferência de identidade
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              stopCamera();
              setStep('EMAIL');
            }}
            className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center active:scale-90 transition-all shrink-0"
          >
            <X size={16} className="text-zinc-400" />
          </button>
          <button
            onClick={confirmarVenda}
            className="flex-1 h-12 bg-[#FFD300] text-black rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
          >
            <Check size={14} /> Confirmar Venda
          </button>
        </div>
      </div>
    );
  }

  // ── EMAIL ──
  if (step === 'EMAIL' && sel) {
    return (
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-5 max-w-3xl mx-auto w-full">
        <div className="p-5 bg-zinc-900/40 border border-white/5 rounded-2xl">
          <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest mb-2">Ingresso selecionado</p>
          <p className="text-white font-bold">
            {sel.variacao.area} · {genLabel(sel.variacao)}
          </p>
          <p className="text-[#FFD300] font-black text-lg mt-1">{fmtBRL(sel.variacao.valor)}</p>
          <p className="text-zinc-400 text-xs mt-1 truncate">{nome}</p>
        </div>

        <div>
          <label className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-2 block">
            E-mail do comprador
          </label>
          <input
            className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
            placeholder="comprador@email.com"
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              setEmailErro('');
            }}
            type="email"
            autoFocus
          />
          {emailErro && (
            <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mt-1.5">{emailErro}</p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setStep('CADASTRO');
              setEmailErro('');
            }}
            className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center active:scale-90 transition-all shrink-0"
          >
            <X size={16} className="text-zinc-400" />
          </button>
          <button
            onClick={handleEmailNext}
            disabled={!email}
            className="flex-1 h-12 bg-[#FFD300] text-black rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            Continuar →
          </button>
        </div>
      </div>
    );
  }

  // ── CADASTRO ──
  if (step === 'CADASTRO' && sel) {
    return (
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-5 max-w-3xl mx-auto w-full">
        <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl">
          <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest mb-1">Ingresso selecionado</p>
          <p className="text-white font-bold text-sm">
            {sel.variacao.area} · {genLabel(sel.variacao)}
          </p>
          <p className="text-[#FFD300] font-black text-base mt-1">{fmtBRL(sel.variacao.valor)}</p>
        </div>

        {/* Nome completo */}
        <div>
          <label className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-2 block">
            Nome completo
          </label>
          <div className="relative">
            <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              className="w-full bg-zinc-900/60 border border-white/5 rounded-xl pl-9 pr-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
              placeholder="Nome Sobrenome"
              value={nome}
              onChange={e => {
                setNome(e.target.value);
                setNomeErro('');
              }}
              autoFocus
            />
          </div>
          {nomeErro && (
            <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mt-1.5">{nomeErro}</p>
          )}
        </div>

        {/* CPF */}
        <div>
          <label className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-2 block">CPF</label>
          <input
            className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700 tabular-nums"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={e => {
              setCpf(formatCPF(e.target.value));
              setCpfErro('');
            }}
            inputMode="numeric"
          />
          {cpfErro && <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mt-1.5">{cpfErro}</p>}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setStep('LOTES');
            }}
            className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center active:scale-90 transition-all shrink-0"
          >
            <X size={16} className="text-zinc-400" />
          </button>
          <button
            onClick={handleCadastroNext}
            disabled={!nome || cpf.replace(/\D/g, '').length < 11}
            className="flex-1 h-12 bg-[#FFD300] text-black rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            Continuar →
          </button>
        </div>
      </div>
    );
  }

  // ── Lista de lotes ──
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4 max-w-3xl mx-auto w-full">
      {/* Badge de conectividade */}
      <div className="flex items-center justify-center gap-1.5">
        {syncing ? (
          <>
            <RefreshCw size={9} className="text-blue-400 animate-spin shrink-0" />
            <span className="text-blue-400 text-[8px] font-black uppercase tracking-widest">
              Sincronizando {pendingSyncCount}...
            </span>
          </>
        ) : isOnline ? (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-emerald-500 text-[8px] font-black uppercase tracking-widest">Realtime ativo</span>
          </>
        ) : (
          <>
            <WifiOff size={9} className="text-amber-400 shrink-0" />
            <span className="text-amber-400 text-[8px] font-black uppercase tracking-widest">
              Offline{pendingSyncCount > 0 ? ` · ${pendingSyncCount} pendente${pendingSyncCount > 1 ? 's' : ''}` : ''}
            </span>
          </>
        )}
      </div>

      {lotesAtivos.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
            <Tag size={28} className="text-zinc-700" />
          </div>
          <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest text-center">
            Nenhum lote ativo
          </p>
          <p className="text-zinc-800 text-[9px] text-center leading-relaxed max-w-[200px]">
            Todos os lotes estão encerrados ou sem capacidade disponível.
          </p>
        </div>
      ) : (
        lotesAtivos.map(lote => (
          <div key={lote.id} className="bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-5 pt-4 pb-3 border-b border-white/5">
              <div className="flex items-center justify-between">
                <p className="text-white font-bold text-sm">{lote.nome}</p>
                <span className="text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400">
                  Ativo
                </span>
              </div>
              <p className="text-zinc-400 text-[9px] mt-0.5">
                {lote.vendidos} / {lote.limitTotal} vendidos
              </p>
            </div>
            <div className="p-3 space-y-2">
              {lote.variacoes.map(v => {
                const disponivel = v.limite - v.vendidos;
                return (
                  <div
                    key={v.id}
                    className="flex items-center gap-3 p-3 bg-zinc-900/60 rounded-xl border border-white/5"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium leading-none">
                        {v.area} · {genLabel(v)}
                      </p>
                      <p className="text-zinc-400 text-[9px] mt-0.5 font-black uppercase tracking-widest">
                        {disponivel > 0 ? `${disponivel} disponíveis` : 'Esgotado'}
                      </p>
                    </div>
                    <p className="text-[#FFD300] font-black text-sm shrink-0">{fmtBRL(v.valor)}</p>
                    <button
                      onClick={() => handleVender(lote, v)}
                      disabled={disponivel <= 0}
                      className="px-4 py-2 bg-[#FFD300] text-black rounded-xl font-black text-[9px] uppercase tracking-widest active:scale-95 transition-all shrink-0 disabled:opacity-25 disabled:pointer-events-none"
                    >
                      Vender
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default EventoCaixaView;
