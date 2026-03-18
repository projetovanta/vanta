/**
 * ComprovanteMeiaSection — View standalone para gestão de comprovante meia-entrada.
 * Suporta múltiplos arquivos (frente/verso/extra) via câmera, galeria ou arquivo.
 * Privacidade: somente o usuário e o master podem visualizar.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  FileCheck,
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  X,
  Camera,
  Image,
  File,
  Plus,
  Trash2,
  Eye,
  Shield,
} from 'lucide-react';
import { comprovanteService, getVersion } from '../../features/admin/services/comprovanteService';
import { TIPOS_COMPROVANTE_MEIA } from '../../types';
import type { ComprovanteMeia } from '../../types';

interface Props {
  userId: string;
  onSuccess?: (msg: string) => void;
  onBack?: () => void;
}

interface ArquivoUpload {
  label: string;
  dataUrl: string;
  filename: string;
}

const LABELS_DISPONIVEIS = ['frente', 'verso', 'extra'] as const;
const LABEL_DISPLAY: Record<string, string> = { frente: 'Frente', verso: 'Verso', extra: 'Extra' };

export const ComprovanteMeiaSection: React.FC<Props> = ({ userId, onSuccess, onBack }) => {
  const [comp, setComp] = useState<ComprovanteMeia | null>(null);
  const [loading, setLoading] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState('');
  const [tipoCustom, setTipoCustom] = useState('');
  const [arquivos, setArquivos] = useState<ArquivoUpload[]>([]);
  const [showFotoModal, setShowFotoModal] = useState(false);
  const [fotoModalUrls, setFotoModalUrls] = useState<{ label: string; url: string }[]>([]);
  const [fotoModalIdx, setFotoModalIdx] = useState(0);
  const [showTipoDropdown, setShowTipoDropdown] = useState(false);
  const [showSourcePicker, setShowSourcePicker] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [svcVersion, setSvcVersion] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setSvcVersion(getVersion()), 2000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    setComp(comprovanteService.getComprovante(userId));
  }, [userId, svcVersion]);

  useEffect(() => {
    comprovanteService.refresh(userId);
  }, [userId]);

  const diasRestantes = comprovanteService.diasRestantes(userId);
  const proximoLabel = LABELS_DISPONIVEIS.find(l => !arquivos.some(a => a.label === l)) ?? null;

  const handleFileLoaded = (label: string, file: globalThis.File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setArquivos(prev => {
        const filtered = prev.filter(a => a.label !== label);
        return [...filtered, { label, dataUrl: reader.result as string, filename: file.name }];
      });
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (label: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileLoaded(label, file);
    e.target.value = '';
    setShowSourcePicker(null);
  };

  const removeArquivo = (label: string) => {
    setArquivos(prev => prev.filter(a => a.label !== label));
  };

  const handleSubmit = async () => {
    if (arquivos.length === 0 || !tipoSelecionado) return;
    const tipo = tipoSelecionado === 'CUSTOM' ? tipoCustom.trim() : tipoSelecionado;
    if (!tipo) return;

    setLoading(true);
    try {
      await comprovanteService.uploadComprovante(
        userId,
        tipo,
        arquivos.map(a => ({ label: a.label, dataUrl: a.dataUrl })),
      );
      setArquivos([]);
      setTipoSelecionado('');
      setTipoCustom('');
      onSuccess?.('Comprovante enviado! Aguardando aprovação.');
    } catch (err) {
      console.error('[ComprovanteMeiaSection] upload:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerFotos = async () => {
    const urls = await comprovanteService.getFotoUrls(userId);
    if (urls.length > 0) {
      setFotoModalUrls(urls);
      setFotoModalIdx(0);
      setShowFotoModal(true);
    }
  };

  const statusConfig = {
    PENDENTE: {
      icon: Clock,
      label: 'Aguardando aprovação',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      color: '#f59e0b',
    },
    APROVADO: {
      icon: CheckCircle,
      label: 'Aprovado',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      color: '#10b981',
    },
    REJEITADO: {
      icon: XCircle,
      label: 'Não aprovado',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-400',
      color: '#ef4444',
    },
    VENCIDO: {
      icon: AlertTriangle,
      label: 'Vencido',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-400',
      color: '#ef4444',
    },
  };

  const tipoLabel = comp ? (TIPOS_COMPROVANTE_MEIA.find(t => t.id === comp.tipo)?.label ?? comp.tipo) : '';

  const isVencendo = diasRestantes !== null && diasRestantes > 0 && diasRestantes <= 30;
  const showUploadArea = !comp || comp.status === 'REJEITADO' || comp.status === 'VENCIDO' || isVencendo;

  return (
    <div className="absolute inset-0 flex flex-col bg-[#0A0A0A] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-4 pb-3 border-b border-white/5" style={{ paddingTop: '1rem' }}>
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              aria-label="Voltar"
              onClick={onBack}
              className="p-1.5 hover-real:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowLeft size="1.125rem" className="text-zinc-400" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-white truncate">Meia-Entrada</h1>
            <p className="text-[0.625rem] text-zinc-400">Comprovante para ingressos meia-entrada</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Shield size="0.625rem" className="text-zinc-400" />
            <span className="text-[0.5rem] text-zinc-400 font-bold uppercase tracking-wider">Privado</span>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
        {/* Status Card */}
        {comp && (
          <div className={`rounded-2xl border p-4 ${statusConfig[comp.status].bg} ${statusConfig[comp.status].border}`}>
            <div className="flex items-center gap-3">
              {React.createElement(statusConfig[comp.status].icon, {
                size: 20,
                className: statusConfig[comp.status].text,
              })}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${statusConfig[comp.status].text}`}>
                  {isVencendo ? `Vence em ${diasRestantes} dias` : statusConfig[comp.status].label}
                </p>
                <p className="text-[0.625rem] text-zinc-400 mt-0.5 truncate">{tipoLabel}</p>
                {comp.status === 'APROVADO' && comp.validadeAte && (
                  <p className="text-[0.5625rem] text-zinc-400 mt-0.5">
                    Válido até {new Date(comp.validadeAte).toLocaleDateString('pt-BR')}
                    {comp.fotos.length > 1 && <span className="text-zinc-400"> · {comp.fotos.length} arquivos</span>}
                  </p>
                )}
              </div>
              {comp.status === 'APROVADO' && (
                <button
                  onClick={handleVerFotos}
                  className="shrink-0 px-3 py-1.5 bg-emerald-500/20 rounded-lg flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <Eye size="0.75rem" className="text-emerald-400" />
                  <span className="text-emerald-400 text-[0.5625rem] font-bold uppercase tracking-wider">Ver</span>
                </button>
              )}
            </div>

            {comp.status === 'REJEITADO' && comp.motivoRejeicao && (
              <div className="mt-3 p-2.5 bg-red-500/10 rounded-xl">
                <p className="text-[0.625rem] text-red-400">
                  <span className="font-bold">Motivo:</span> {comp.motivoRejeicao}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Formulário de Upload */}
        {showUploadArea && (
          <div className="space-y-4">
            {!comp && (
              <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4">
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Adicione seu comprovante de meia-entrada para desbloquear ingressos com desconto. O documento será
                  analisado pelo administrador.
                </p>
              </div>
            )}

            {/* Tipo de comprovante */}
            <div>
              <label className="text-[0.625rem] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">
                Tipo de Documento
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowTipoDropdown(!showTipoDropdown)}
                  className="w-full bg-zinc-900/60 border border-white/10 rounded-xl px-3 py-2.5 text-left text-sm text-white flex items-center justify-between"
                >
                  <span className={tipoSelecionado ? 'text-white' : 'text-zinc-400'}>
                    {tipoSelecionado === 'CUSTOM'
                      ? 'Outro tipo...'
                      : (TIPOS_COMPROVANTE_MEIA.find(t => t.id === tipoSelecionado)?.label ?? 'Selecione o tipo')}
                  </span>
                  <ChevronDown size="0.875rem" className="text-zinc-400" />
                </button>
                {showTipoDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-white/10 rounded-xl overflow-hidden z-10 shadow-2xl max-h-48 overflow-y-auto">
                    {TIPOS_COMPROVANTE_MEIA.map(t => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setTipoSelecionado(t.id);
                          setShowTipoDropdown(false);
                        }}
                        className="w-full px-3 py-2.5 text-left text-sm text-white hover-real:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                      >
                        {t.label}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setTipoSelecionado('CUSTOM');
                        setShowTipoDropdown(false);
                      }}
                      className="w-full px-3 py-2.5 text-left text-sm text-zinc-400 hover-real:bg-white/5 transition-colors"
                    >
                      Outro tipo...
                    </button>
                  </div>
                )}
              </div>
              {tipoSelecionado === 'CUSTOM' && (
                <input
                  type="text"
                  value={tipoCustom}
                  onChange={e => setTipoCustom(e.target.value)}
                  placeholder="Ex: Funcionário Parceiro"
                  className="mt-2 w-full bg-zinc-900/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-400"
                />
              )}
            </div>

            {/* Arquivos — frente/verso/extra */}
            <div>
              <label className="text-[0.625rem] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">
                Documentos
              </label>
              <p className="text-[0.5625rem] text-zinc-400 mb-2">Adicione frente e verso do documento (se aplicável)</p>
              <div className="space-y-2">
                {arquivos.map(arq => (
                  <div key={arq.label} className="rounded-xl border border-white/10 overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50">
                      <span className="text-[0.5625rem] font-bold uppercase tracking-wider text-cyan-400 flex-1">
                        {LABEL_DISPLAY[arq.label] ?? arq.label}
                      </span>
                      <span className="text-[0.5625rem] text-zinc-400 truncate max-w-[7.5rem]">{arq.filename}</span>
                      <button
                        onClick={() => removeArquivo(arq.label)}
                        className="p-1 text-zinc-400 hover-real:text-red-400 transition-colors shrink-0"
                      >
                        <Trash2 size="0.75rem" />
                      </button>
                    </div>
                    {arq.dataUrl.startsWith('data:image') && (
                      <img loading="lazy" src={arq.dataUrl} alt={arq.label} className="w-full h-32 object-cover" />
                    )}
                    {arq.dataUrl.startsWith('data:application/pdf') && (
                      <div className="h-16 bg-zinc-800 flex items-center justify-center gap-2">
                        <File size="1.25rem" className="text-zinc-400" />
                        <span className="text-zinc-400 text-xs">PDF</span>
                      </div>
                    )}
                  </div>
                ))}

                {proximoLabel && (
                  <div className="relative">
                    <button
                      onClick={() => setShowSourcePicker(showSourcePicker ? null : proximoLabel)}
                      className="w-full h-24 bg-zinc-900/40 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-1.5 hover-real:border-white/20 transition-colors active:scale-[0.98]"
                    >
                      <Plus size="1.125rem" className="text-zinc-400" />
                      <span className="text-[0.5625rem] text-zinc-400 font-bold uppercase tracking-wider">
                        {arquivos.length === 0
                          ? 'Adicionar frente'
                          : `Adicionar ${LABEL_DISPLAY[proximoLabel]?.toLowerCase() ?? proximoLabel}`}
                      </span>
                    </button>

                    {showSourcePicker && (
                      <div className="absolute bottom-full left-0 right-0 mb-2 bg-zinc-800 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-10 animate-in fade-in slide-in-from-bottom-2 duration-150">
                        <button
                          onClick={() => cameraRef.current?.click()}
                          className="w-full flex items-center gap-3 px-4 py-3 text-white hover-real:bg-white/5 transition-colors border-b border-white/5"
                        >
                          <Camera size="1rem" className="text-cyan-400 shrink-0" />
                          <span className="text-sm">Tirar foto agora</span>
                        </button>
                        <button
                          onClick={() => galleryRef.current?.click()}
                          className="w-full flex items-center gap-3 px-4 py-3 text-white hover-real:bg-white/5 transition-colors border-b border-white/5"
                        >
                          <Image size="1rem" className="text-purple-400 shrink-0" />
                          <span className="text-sm">Escolher da galeria</span>
                        </button>
                        <button
                          onClick={() => fileRef.current?.click()}
                          className="w-full flex items-center gap-3 px-4 py-3 text-white hover-real:bg-white/5 transition-colors"
                        >
                          <File size="1rem" className="text-amber-400 shrink-0" />
                          <span className="text-sm">Enviar arquivo (PDF/imagem)</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleInputChange(showSourcePicker ?? proximoLabel ?? 'frente')}
                className="hidden"
              />
              <input
                ref={galleryRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange(showSourcePicker ?? proximoLabel ?? 'frente')}
                className="hidden"
              />
              <input
                ref={fileRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleInputChange(showSourcePicker ?? proximoLabel ?? 'frente')}
                className="hidden"
              />
            </div>

            {/* Info legal */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-3 flex items-start gap-2.5">
              <Shield size="0.875rem" className="text-zinc-400 shrink-0 mt-0.5" />
              <p className="text-[0.5625rem] text-zinc-400 leading-relaxed">
                Seus documentos são privados e visíveis apenas para você e o administrador. Aceitos: CIE, DNE, RG
                (idoso), laudo médico (PCD), ID Jovem, carteira funcional.
              </p>
            </div>

            {/* Botão enviar */}
            <button
              onClick={handleSubmit}
              disabled={
                loading ||
                arquivos.length === 0 ||
                !tipoSelecionado ||
                (tipoSelecionado === 'CUSTOM' && !tipoCustom.trim())
              }
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none bg-white text-black"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Enviando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Upload size="0.875rem" />
                  Enviar{' '}
                  {arquivos.length > 0
                    ? `${arquivos.length} arquivo${arquivos.length !== 1 ? 's' : ''}`
                    : 'comprovante'}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Quando aprovado sem necessidade de re-upload */}
        {comp?.status === 'APROVADO' && !isVencendo && (
          <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-4 space-y-2">
            <p className="text-zinc-400 text-xs">
              Seu comprovante está ativo. Variações de meia-entrada estarão disponíveis automaticamente no checkout de
              qualquer evento.
            </p>
            <button
              onClick={() => setArquivos([])}
              className="text-[0.5625rem] text-zinc-400 font-bold uppercase tracking-wider hover-real:text-zinc-400 transition-colors"
            >
              Deseja atualizar o comprovante?
            </button>
          </div>
        )}
      </div>

      {/* Modal de visualização das fotos */}
      {showFotoModal && fotoModalUrls.length > 0 && (
        <div className="absolute inset-0 z-[110] flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/90" role="presentation" onClick={() => setShowFotoModal(false)} />
          <div className="relative w-full max-w-[500px] animate-in zoom-in-95 duration-300">
            {fotoModalUrls.length > 1 && (
              <div className="flex gap-1 mb-3 justify-center relative z-10">
                {fotoModalUrls.map((f, i) => (
                  <button
                    key={f.label}
                    onClick={() => setFotoModalIdx(i)}
                    className={`px-3 py-1.5 rounded-lg text-[0.5625rem] font-bold uppercase tracking-wider transition-all ${
                      fotoModalIdx === i ? 'bg-white/10 text-white' : 'text-zinc-400'
                    }`}
                  >
                    {LABEL_DISPLAY[f.label] ?? f.label}
                  </button>
                ))}
              </div>
            )}
            <img
              loading="lazy"
              src={fotoModalUrls[fotoModalIdx].url}
              alt={fotoModalUrls[fotoModalIdx].label}
              className="w-full rounded-2xl border border-white/10"
            />
            <button
              onClick={() => setShowFotoModal(false)}
              className="absolute top-3 right-3 p-2 bg-black/60 rounded-full z-10"
            >
              <X size="1rem" className="text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
