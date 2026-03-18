/**
 * LegalEditorView — Editar Termos de Uso, Privacidade, Termos MV.
 * Versionamento com publicação controlada.
 */
import React, { useState, useEffect } from 'react';
import { FileText, Loader2, Plus, Eye, Upload } from 'lucide-react';
import { AdminViewHeader } from '../components/AdminViewHeader';
import { useToast, ToastContainer } from '../../../components/Toast';
import { legalService, type LegalDocument } from '../services/legalService';
import DOMPurify from 'dompurify';

const TIPOS = [
  { id: 'TERMOS_USO', label: 'Termos de Uso' },
  { id: 'POLITICA_PRIVACIDADE', label: 'Política de Privacidade' },
  { id: 'TERMOS_MV', label: 'Termos MAIS VANTA' },
];

export const LegalEditorView: React.FC<{
  onBack: () => void;
  currentUserId: string;
}> = ({ onBack, currentUserId }) => {
  const { toasts, dismiss, toast } = useToast();
  const [tipoAtivo, setTipoAtivo] = useState('TERMOS_USO');
  const [versoes, setVersoes] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<LegalDocument | null>(null);
  const [conteudo, setConteudo] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const loadVersoes = async () => {
    setLoading(true);
    const data = await legalService.getVersoes(tipoAtivo);
    setVersoes(data);
    setLoading(false);
  };

  useEffect(() => {
    void loadVersoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoAtivo]);

  const handleNovaVersao = async () => {
    setSaving(true);
    const atual = versoes.find(v => v.publicado);
    const id = await legalService.criarVersao(tipoAtivo, atual?.conteudo ?? '', currentUserId);
    if (id) {
      toast('sucesso', 'Rascunho criado');
      await loadVersoes();
      const novas = await legalService.getVersoes(tipoAtivo);
      const nova = novas.find(v => v.id === id);
      if (nova) {
        setEditando(nova);
        setConteudo(nova.conteudo);
      }
    } else {
      toast('erro', 'Erro ao criar versão');
    }
    setSaving(false);
  };

  const handlePublicar = async () => {
    if (!editando) return;
    setSaving(true);
    // Salvar conteúdo primeiro (update direto)
    const { error } = await (await import('../../../services/supabaseClient')).supabase
      .from('legal_documents')
      .update({ conteudo })
      .eq('id', editando.id);
    if (error) {
      toast('erro', 'Erro ao salvar');
      setSaving(false);
      return;
    }
    const ok = await legalService.publicar(editando.id, currentUserId);
    if (ok) {
      toast('sucesso', 'Documento publicado. Usuários serão notificados na próxima abertura.');
      setEditando(null);
      await loadVersoes();
    } else {
      toast('erro', 'Erro ao publicar');
    }
    setSaving(false);
  };

  const publicada = versoes.find(v => v.publicado);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AdminViewHeader title="Documentos Legais" kicker="Termos, Privacidade, MAIS VANTA" onBack={onBack} />

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 max-w-3xl mx-auto w-full">
        {/* Tabs de tipo */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {TIPOS.map(t => (
            <button
              key={t.id}
              onClick={() => {
                setTipoAtivo(t.id);
                setEditando(null);
              }}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                tipoAtivo === t.id ? 'bg-[#FFD300] text-black' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size="1.25rem" className="text-zinc-400 animate-spin" />
          </div>
        ) : editando ? (
          /* Editor */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-white text-sm font-bold">
                Versão {editando.versao} {editando.publicado ? '(publicada)' : '(rascunho)'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-xs font-bold"
                >
                  <Eye size="0.75rem" className="inline mr-1" />
                  {showPreview ? 'Editar' : 'Preview'}
                </button>
                <button
                  onClick={() => setEditando(null)}
                  className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-xs font-bold"
                >
                  Voltar
                </button>
              </div>
            </div>

            {showPreview ? (
              <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 prose prose-invert prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(conteudo.replace(/\n/g, '<br/>')) }} />
              </div>
            ) : (
              <textarea
                value={conteudo}
                onChange={e => setConteudo(e.target.value)}
                rows={20}
                className="w-full bg-zinc-800/60 border border-white/5 rounded-xl px-4 py-3 text-white text-xs font-mono resize-none leading-relaxed"
                placeholder="Escreva o documento aqui..."
              />
            )}

            <button
              onClick={handlePublicar}
              disabled={saving}
              className="w-full py-3 bg-[#FFD300] text-black rounded-xl text-xs font-bold disabled:opacity-40"
            >
              <Upload size="0.75rem" className="inline mr-1" />
              {saving ? 'Publicando...' : 'Publicar esta versão'}
            </button>
          </div>
        ) : (
          /* Lista de versões */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-zinc-400 text-xs">
                {publicada ? `Versão ${publicada.versao} publicada` : 'Nenhuma versão publicada'}
              </p>
              <button
                onClick={handleNovaVersao}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#FFD300]/10 border border-[#FFD300]/20 rounded-xl text-[#FFD300] text-[0.5625rem] font-black uppercase active:scale-95 transition-all"
              >
                <Plus size="0.75rem" /> Nova Versão
              </button>
            </div>

            {versoes.map(v => (
              <button
                key={v.id}
                onClick={() => {
                  setEditando(v);
                  setConteudo(v.conteudo);
                  setShowPreview(false);
                }}
                className={`w-full text-left p-4 rounded-2xl border transition-all active:scale-[0.98] ${
                  v.publicado ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-zinc-900/50 border-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size="0.875rem" className={v.publicado ? 'text-emerald-400' : 'text-zinc-500'} />
                    <span className="text-white text-sm font-bold">Versão {v.versao}</span>
                  </div>
                  <span
                    className={`text-[0.5rem] font-black uppercase px-2 py-1 rounded-lg ${
                      v.publicado ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {v.publicado ? 'Publicada' : 'Rascunho'}
                  </span>
                </div>
                <p className="text-zinc-500 text-xs mt-1 line-clamp-2">{v.conteudo.slice(0, 120)}...</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};
