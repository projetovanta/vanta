import React, { useState, useEffect, useCallback } from 'react';
import type {
  SolicitacaoClube,
  MembroClubeVanta,
  TierMaisVanta,
  ReservaMaisVanta,
  PassportAprovacao,
  EventoAdmin,
  ClubeConfig,
} from '../../../../../types';
import { clubeService } from '../../../services/clubeService';
import { assinaturaService } from '../../../services/assinaturaService';
import { supabase } from '../../../../../services/supabaseClient';
import { eventosAdminService } from '../../../services/eventosAdminService';
import { TIER_LABELS } from './tierUtils';
import type { PerfilEnriquecido, SubTab } from './tierUtils';
import { PerfilMembroOverlay } from './PerfilMembroOverlay';
import { SubTabSolicitacoes } from './SubTabSolicitacoes';
import { SubTabMembros } from './SubTabMembros';
import { SubTabEventos } from './SubTabEventos';
import { SubTabPosts } from './SubTabPosts';
import { SubTabPassaportes } from './SubTabPassaportes';
import { SubTabConfig } from './SubTabConfig';
import { SubTabNotificacoes } from './SubTabNotificacoes';

interface Props {
  adminId: string;
  toastFn: (tipo: 'sucesso' | 'erro', msg: string) => void;
  comunidadeId?: string;
}

export const TabClube: React.FC<Props> = ({ adminId, toastFn, comunidadeId }) => {
  const [subTab, setSubTab] = useState<SubTab>('SOLICITACOES');
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoClube[]>([]);
  const [membros, setMembros] = useState<MembroClubeVanta[]>([]);
  const [pendentePosts, setPendentePosts] = useState<ReservaMaisVanta[]>([]);
  const [passportsPendentes, setPassportsPendentes] = useState<PassportAprovacao[]>([]);
  const [perfis, setPerfis] = useState<Record<string, PerfilEnriquecido>>({});
  const [perfilDetalhe, setPerfilDetalhe] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<TierMaisVanta | ''>('');
  const [tierSelects, setTierSelects] = useState<Record<string, TierMaisVanta>>({});
  const [tagsSelects, setTagsSelects] = useState<Record<string, string[]>>({});
  const [notasInternas, setNotasInternas] = useState<Record<string, string>>({});
  const [atualizandoSeg, setAtualizandoSeg] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState<string>('');
  const [eventosComLote, setEventosComLote] = useState<EventoAdmin[]>([]);
  const [clubeConfig, setClubeConfig] = useState<ClubeConfig | null>(null);
  const [configDraft, setConfigDraft] = useState<Partial<ClubeConfig>>({});
  const [salvandoConfig, setSalvandoConfig] = useState(false);
  const [editandoTier, setEditandoTier] = useState<TierMaisVanta | null>(null);

  /** Busca profiles completos do Supabase + signed URL da selfie */
  const loadPerfis = useCallback(async (userIds: string[]) => {
    if (userIds.length === 0) return {};
    const { data } = await supabase
      .from('profiles')
      .select(
        'id, nome, email, cidade, estado, telefone_ddd, telefone_numero, avatar_url, biometria_url, instagram, created_at',
      )
      .in('id', userIds);

    const map: Record<string, PerfilEnriquecido> = {};
    if (!data) return map;

    for (const row of data) {
      let selfieSignedUrl: string | undefined;
      if (row.biometria_url) {
        const { data: pubData } = supabase.storage.from('selfies').getPublicUrl(row.biometria_url as string);
        if (pubData?.publicUrl) selfieSignedUrl = pubData.publicUrl;
      }
      const tel = row.telefone_ddd && row.telefone_numero ? `(${row.telefone_ddd}) ${row.telefone_numero}` : undefined;
      map[row.id as string] = {
        nome: (row.nome as string) || 'Usuário',
        email: (row.email as string) || '',
        cidade: (row.cidade as string) || undefined,
        estado: (row.estado as string) || undefined,
        telefone: tel,
        foto: (row.avatar_url as string) || undefined,
        biometriaUrl: (row.biometria_url as string) || undefined,
        selfieSignedUrl,
        cadastradoEm: (row.created_at as string) || undefined,
        instagram: (row.instagram as string) || undefined,
      };
    }
    return map;
  }, []);

  const refresh = useCallback(async () => {
    await clubeService.refresh();
    await assinaturaService.refresh();
    setSolicitacoes(clubeService.getSolicitacoesPendentes());
    setMembros(clubeService.getAllMembros());
    setPendentePosts(clubeService.getReservasPendentePost());
    setPassportsPendentes(clubeService.getPassportsPendentes());

    const allUserIds = new Set<string>();
    clubeService.getSolicitacoesPendentes().forEach(s => allUserIds.add(s.userId));
    clubeService.getAllMembros().forEach(m => allUserIds.add(m.userId));
    clubeService.getReservasPendentePost().forEach(r => allUserIds.add(r.userId));
    clubeService.getPassportsPendentes().forEach(p => allUserIds.add(p.userId));

    const perfisMap = await loadPerfis(Array.from(allUserIds));
    setPerfis(perfisMap);

    const allLotes = clubeService.getAllLotes();
    const todosEventos = eventosAdminService.getEventos();
    const eventosLote = todosEventos.filter(ev => allLotes.some(l => l.eventoId === ev.id));
    setEventosComLote(eventosLote);

    if (comunidadeId) {
      const cfg = await clubeService.getConfig(comunidadeId);
      setClubeConfig(cfg);
      if (cfg) setConfigDraft({});
    }
  }, [loadPerfis, comunidadeId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleAprovar = async (solId: string) => {
    const tier = tierSelects[solId] || 'lista';
    const tags = tagsSelects[solId] || [];
    const notaInterna = notasInternas[solId] || '';
    try {
      await clubeService.aprovarSolicitacao(solId, tier, adminId, comunidadeId, undefined, tags, notaInterna);
      toastFn('sucesso', `Membro aprovado como ${TIER_LABELS[tier]}`);
      await refresh();
    } catch {
      toastFn('erro', 'Erro ao aprovar');
    }
  };

  const handleAdiar = async (solId: string) => {
    try {
      await clubeService.adiarSolicitacao(solId);
      toastFn('sucesso', 'Solicitação adiada');
      await refresh();
    } catch {
      toastFn('erro', 'Erro ao adiar');
    }
  };

  const handleAlterarTier = async (userId: string, novoTier: TierMaisVanta) => {
    try {
      await clubeService.alterarTier(userId, novoTier, adminId);
      toastFn('sucesso', `Tier alterado para ${TIER_LABELS[novoTier]}`);
      await refresh();
    } catch {
      toastFn('erro', 'Erro ao alterar tier');
    }
  };

  const handleVerificarPost = async (reservaId: string) => {
    try {
      await clubeService.verificarPost(reservaId, adminId);
      toastFn('sucesso', 'Post verificado');
      await refresh();
    } catch {
      toastFn('erro', 'Erro ao verificar post');
    }
  };

  const handleVerificarAuto = async (reservaId: string, postUrl: string) => {
    const result = await clubeService.verificarPostAutomatico(reservaId, postUrl);
    if (result.placeholder) {
      toastFn('erro', 'Meta API não configurada. Use verificação manual.');
    } else if (result.verified) {
      await clubeService.verificarPost(reservaId, adminId);
      toastFn('sucesso', 'Post verificado automaticamente via Meta API');
      await refresh();
    } else {
      toastFn('erro', result.reason ?? 'Verificação falhou');
    }
  };

  const handleAtualizarSeguidores = async () => {
    setAtualizandoSeg(true);
    const result = await clubeService.atualizarSeguidores();
    setAtualizandoSeg(false);
    if (result.method === 'error') {
      toastFn('erro', 'Erro ao atualizar seguidores');
    } else {
      toastFn('sucesso', `${result.updated}/${result.total} membros atualizados (${result.method})`);
      await refresh();
    }
  };

  const handleAprovarPassport = async (passportId: string) => {
    try {
      await clubeService.aprovarPassport(passportId, adminId);
      toastFn('sucesso', 'Passaporte aprovado');
      await refresh();
    } catch {
      toastFn('erro', 'Erro ao aprovar passaporte');
    }
  };

  const handleRejeitarPassport = async (passportId: string) => {
    try {
      await clubeService.rejeitarPassport(passportId, adminId);
      toastFn('sucesso', 'Passaporte rejeitado');
      await refresh();
    } catch {
      toastFn('erro', 'Erro ao rejeitar passaporte');
    }
  };

  const filteredMembros = membros.filter(m => {
    const matchTier = !tierFilter || m.tier === tierFilter;
    const p = perfis[m.userId];
    const matchQ =
      !query ||
      (p?.nome ?? '').toLowerCase().includes(query.toLowerCase()) ||
      (m.instagramHandle ?? '').toLowerCase().includes(query.toLowerCase());
    return matchTier && matchQ;
  });

  /** Helper: abre Instagram via deep link (app) com fallback web */
  const openInstagram = (handle: string) => {
    window.location.href = `instagram://user?username=${handle}`;
    setTimeout(() => {
      window.open(`https://instagram.com/${handle}`, '_blank');
    }, 500);
  };

  const tabItems: { id: SubTab; label: string; count: number }[] = [
    { id: 'SOLICITACOES', label: 'Solicitações', count: solicitacoes.length },
    { id: 'MEMBROS_CLUBE', label: 'Membros', count: membros.length },
    { id: 'EVENTOS', label: 'Eventos', count: 0 },
    { id: 'POSTS', label: 'Posts', count: pendentePosts.length },
    { id: 'PASSAPORTES', label: 'Passaportes', count: passportsPendentes.length },
    { id: 'NOTIFICACOES', label: 'Notificações', count: 0 },
    { id: 'ASSINATURA', label: 'Config', count: 0 },
  ];

  // ── Overlay de perfil do membro ──
  const perfilAberto = perfilDetalhe ? perfis[perfilDetalhe] : null;
  const solAberta = perfilDetalhe ? solicitacoes.find(s => s.userId === perfilDetalhe) : null;
  const membroAberto = perfilDetalhe ? membros.find(m => m.userId === perfilDetalhe) : null;

  if (perfilDetalhe && perfilAberto) {
    return (
      <PerfilMembroOverlay
        userId={perfilDetalhe}
        perfil={perfilAberto}
        solicitacao={solAberta ?? undefined}
        membro={membroAberto ?? undefined}
        perfis={perfis}
        tierSelects={tierSelects}
        onTierSelectChange={(id, tier) => setTierSelects(p => ({ ...p, [id]: tier }))}
        onAprovar={handleAprovar}
        onClose={() => setPerfilDetalhe(null)}
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-4 pb-6">
      {/* Sub-tabs — scroll horizontal snap (mobile) */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {tabItems.map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`px-2.5 py-2 rounded-xl text-[0.5rem] font-black uppercase tracking-wider border transition-all ${
              subTab === t.id
                ? 'bg-[#FFD300]/10 border-[#FFD300]/30 text-[#FFD300]'
                : 'bg-zinc-900 border-white/5 text-zinc-400'
            }`}
          >
            {t.label}{' '}
            {t.count > 0 && (
              <span className="ml-1 bg-[#FFD300] text-black px-1 rounded-full text-[0.4375rem]">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {subTab === 'SOLICITACOES' && (
        <SubTabSolicitacoes
          solicitacoes={solicitacoes}
          perfis={perfis}
          tierSelects={tierSelects}
          tagsSelects={tagsSelects}
          notasInternas={notasInternas}
          onTierSelectChange={(id, tier) => setTierSelects(p => ({ ...p, [id]: tier }))}
          onTagsChange={(id, tags) => setTagsSelects(p => ({ ...p, [id]: tags }))}
          onNotaInternaChange={(id, nota) => setNotasInternas(p => ({ ...p, [id]: nota }))}
          onAprovar={handleAprovar}
          onAdiar={handleAdiar}
          onOpenPerfil={setPerfilDetalhe}
          onOpenInstagram={openInstagram}
        />
      )}

      {subTab === 'MEMBROS_CLUBE' && (
        <SubTabMembros
          filteredMembros={filteredMembros}
          perfis={perfis}
          query={query}
          setQuery={setQuery}
          tierFilter={tierFilter}
          setTierFilter={setTierFilter}
          atualizandoSeg={atualizandoSeg}
          onAtualizarSeguidores={handleAtualizarSeguidores}
          onAlterarTier={handleAlterarTier}
          onOpenPerfil={setPerfilDetalhe}
        />
      )}

      {subTab === 'EVENTOS' && (
        <SubTabEventos
          eventosComLote={eventosComLote}
          eventoSelecionado={eventoSelecionado}
          setEventoSelecionado={setEventoSelecionado}
          membros={membros}
          perfis={perfis}
          clubeConfig={clubeConfig}
          toastFn={toastFn}
          onOpenPerfil={setPerfilDetalhe}
          onRefresh={refresh}
        />
      )}

      {subTab === 'POSTS' && (
        <SubTabPosts
          pendentePosts={pendentePosts}
          perfis={perfis}
          onVerificarPost={handleVerificarPost}
          onVerificarAuto={handleVerificarAuto}
        />
      )}

      {subTab === 'PASSAPORTES' && (
        <SubTabPassaportes
          passportsPendentes={passportsPendentes}
          perfis={perfis}
          onAprovar={handleAprovarPassport}
          onRejeitar={handleRejeitarPassport}
        />
      )}

      {subTab === 'ASSINATURA' && (
        <SubTabConfig
          membros={membros}
          solicitacoesCount={solicitacoes.length}
          perfis={perfis}
          clubeConfig={clubeConfig}
          configDraft={configDraft}
          setConfigDraft={setConfigDraft}
          salvandoConfig={salvandoConfig}
          setSalvandoConfig={setSalvandoConfig}
          setClubeConfig={setClubeConfig}
          comunidadeId={comunidadeId}
          toastFn={toastFn}
          editandoTier={editandoTier}
          setEditandoTier={setEditandoTier}
        />
      )}

      {subTab === 'NOTIFICACOES' && <SubTabNotificacoes />}
    </div>
  );
};
