/**
 * DealsMembroSection — Feed de deals disponíveis para o membro MAIS VANTA.
 * Mostra deals das cidades onde o membro tem passaporte aprovado.
 * Membro pode aplicar (1 deal ativo por vez, enforced por trigger no banco).
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Ticket, MapPin, Clock, Users, CheckCircle2, XCircle, AlertTriangle, Send, Eye, QrCode, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { clubeDealsService } from '../../features/admin/services/clube/clubeDealsService';
import { clubeResgatesService } from '../../features/admin/services/clube/clubeResgatesService';
import { clubeCidadesService } from '../../features/admin/services/clube/clubeCidadesService';
import { clubeService } from '../../features/admin/services/clubeService';
import type { DealMaisVanta, ResgateMaisVanta, CidadeMaisVanta } from '../../types';

interface Props {
  userId: string;
  onSuccess?: (msg: string) => void;
}

export const DealsMembroSection: React.FC<Props> = ({ userId, onSuccess }) => {
  const [deals, setDeals] = useState<DealMaisVanta[]>([]);
  const [meuResgate, setMeuResgate] = useState<ResgateMaisVanta | null>(null);
  const [meusResgates, setMeusResgates] = useState<ResgateMaisVanta[]>([]);
  const [loading, setLoading] = useState(true);
  const [aplicando, setAplicando] = useState(false);
  const [postUrl, setPostUrl] = useState('');
  const [showQr, setShowQr] = useState(false);
  const [cidadesMap, setCidadesMap] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);

    // Buscar cidades aprovadas do membro
    const passports = clubeService.getPassportAprovacoes(userId);
    const cidadesAprovadas = passports.filter(p => p.status === 'APROVADO' && p.cidade).map(p => p.cidade as string);

    // Buscar cidades MV para mapear IDs
    const todasCidades = await clubeCidadesService.listarAtivas();
    const map: Record<string, string> = {};
    todasCidades.forEach(c => {
      map[c.id] = c.nome;
    });
    setCidadesMap(map);

    // Filtrar cidades MV que batem com passaporte aprovado
    const cidadesMV = todasCidades.filter(c => cidadesAprovadas.includes(c.nome));

    // Buscar deals de todas as cidades aprovadas
    const allDeals: DealMaisVanta[] = [];
    for (const cidade of cidadesMV) {
      const d = await clubeDealsService.listarPorCidade(cidade.id);
      allDeals.push(...d);
    }
    setDeals(allDeals);

    // Buscar resgates do membro
    const resgates = await clubeResgatesService.listarPorUsuario(userId);
    setMeusResgates(resgates);

    // Deal ativo atual
    const ativo = resgates.find(r => ['APLICADO', 'SELECIONADO', 'CHECK_IN', 'PENDENTE_POST'].includes(r.status));
    setMeuResgate(ativo ?? null);

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAplicar = async (deal: DealMaisVanta) => {
    setAplicando(true);
    const { ok, erro } = await clubeResgatesService.aplicar(deal.id, userId, deal.parceiroId);
    if (ok) {
      onSuccess?.('Candidatura enviada! Aguarde a seleção.');
    } else {
      onSuccess?.(erro ?? 'Erro ao aplicar');
    }
    await load();
    setAplicando(false);
  };

  const handleCancelar = async (resgateId: string) => {
    await clubeResgatesService.cancelar(resgateId, userId);
    onSuccess?.('Candidatura cancelada');
    load();
  };

  const handleEnviarPost = async (resgateId: string) => {
    if (!postUrl.trim()) return;
    await clubeResgatesService.enviarPost(resgateId, postUrl.trim());
    setPostUrl('');
    onSuccess?.('Post enviado para verificação');
    load();
  };

  const getResgateParaDeal = (dealId: string) => meusResgates.find(r => r.dealId === dealId);

  const statusLabel = (status: string) => {
    const map: Record<string, { text: string; color: string; bg: string }> = {
      APLICADO: { text: 'Aguardando seleção', color: 'text-blue-400', bg: 'bg-blue-500/15' },
      SELECIONADO: { text: 'Selecionado!', color: 'text-[#FFD300]', bg: 'bg-[#FFD300]/15' },
      RECUSADO: { text: 'Não selecionado', color: 'text-zinc-400', bg: 'bg-zinc-700/50' },
      CHECK_IN: { text: 'Check-in feito', color: 'text-purple-400', bg: 'bg-purple-500/15' },
      PENDENTE_POST: { text: 'Post pendente', color: 'text-orange-400', bg: 'bg-orange-500/15' },
      CONCLUIDO: { text: 'Concluído', color: 'text-green-400', bg: 'bg-green-500/15' },
      NO_SHOW: { text: 'No-show', color: 'text-red-400', bg: 'bg-red-500/15' },
      CANCELADO: { text: 'Cancelado', color: 'text-zinc-400', bg: 'bg-zinc-700/50' },
    };
    return map[status] ?? { text: status, color: 'text-zinc-400', bg: 'bg-zinc-700/50' };
  };

  if (loading) {
    return (
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Ticket size="0.875rem" className="text-[#FFD300]" />
          <span className="text-white text-xs font-bold">Deals Disponíveis</span>
        </div>
        <div className="flex items-center justify-center py-6">
          <div className="w-4 h-4 border-2 border-[#FFD300] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <Ticket size="0.875rem" className="text-[#FFD300]" />
        <span className="text-white text-xs font-bold">Deals Disponíveis</span>
        {deals.length > 0 && <span className="text-zinc-400 text-[0.625rem]">({deals.length})</span>}
      </div>

      {/* Deal ativo do membro */}
      {meuResgate && (
        <div className="bg-[#FFD300]/5 border border-[#FFD300]/20 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size="0.75rem" className="text-[#FFD300]" />
            <span className="text-[#FFD300] text-[0.625rem] font-black uppercase tracking-wider">Deal Ativo</span>
          </div>
          <p className="text-white text-sm font-bold truncate">{meuResgate.dealTitulo ?? 'Deal'}</p>
          <p className="text-zinc-400 text-[0.625rem] mt-0.5">{meuResgate.parceiroNome}</p>

          {/* Status */}
          {(() => {
            const s = statusLabel(meuResgate.status);
            return (
              <span
                className={`inline-block mt-2 px-2 py-0.5 rounded text-[0.5625rem] font-bold uppercase ${s.bg} ${s.color}`}
              >
                {s.text}
              </span>
            );
          })()}

          {/* Ações conforme status */}
          {meuResgate.status === 'APLICADO' && (
            <button
              onClick={() => handleCancelar(meuResgate.id)}
              className="mt-3 w-full py-2 bg-zinc-800 text-zinc-400 rounded-xl text-[0.625rem] font-black uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <XCircle size="0.75rem" />
              Cancelar candidatura
            </button>
          )}

          {(meuResgate.status === 'CHECK_IN' || meuResgate.status === 'PENDENTE_POST') && !meuResgate.postUrl && (
            <div className="mt-3 space-y-2">
              <p className="text-zinc-400 text-[0.625rem]">Envie o link do seu post/story:</p>
              <div className="flex gap-2">
                <input
                  value={postUrl}
                  onChange={e => setPostUrl(e.target.value)}
                  placeholder="https://instagram.com/p/..."
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg text-xs text-white px-3 py-2 focus:outline-none focus:border-[#FFD300]/50"
                />
                <button
                  onClick={() => handleEnviarPost(meuResgate.id)}
                  className="px-3 py-2 bg-[#FFD300] text-black rounded-lg active:scale-90 transition-transform"
                >
                  <Send size="0.75rem" />
                </button>
              </div>
            </div>
          )}

          {meuResgate.postUrl && !meuResgate.postVerificado && (
            <div className="flex items-center gap-1.5 mt-2">
              <Clock size="0.625rem" className="text-amber-400" />
              <span className="text-amber-400 text-[0.5625rem]">Post enviado — aguardando verificação</span>
            </div>
          )}

          {meuResgate.postVerificado && (
            <div className="flex items-center gap-1.5 mt-2">
              <CheckCircle2 size="0.625rem" className="text-green-400" />
              <span className="text-green-400 text-[0.5625rem]">Post verificado</span>
            </div>
          )}

          {meuResgate.status === 'SELECIONADO' && (
            <button
              onClick={() => setShowQr(true)}
              className="mt-3 w-full bg-[#FFD300]/10 border border-[#FFD300]/30 rounded-xl p-3 text-center active:scale-95 transition-all"
            >
              <div className="flex items-center justify-center gap-2">
                <QrCode size="0.875rem" className="text-[#FFD300]" />
                <p className="text-[#FFD300] text-[0.625rem] font-bold">Abrir QR VIP</p>
              </div>
              <p className="text-zinc-400 text-[0.5625rem] mt-1">Apresente ao parceiro no local</p>
            </button>
          )}
        </div>
      )}

      {/* Lista de deals */}
      {deals.length === 0 ? (
        <p className="text-zinc-400 text-[0.625rem] text-center py-6">Nenhum deal disponível nas suas cidades</p>
      ) : (
        <div className="space-y-3">
          {deals.map(deal => {
            const resgate = getResgateParaDeal(deal.id);
            const vagasRestantes = deal.vagas - deal.vagasPreenchidas;
            const esgotado = vagasRestantes <= 0;
            const temDealAtivo = !!meuResgate;
            const jaAplicou = !!resgate;

            return (
              <div key={deal.id} className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0 border border-white/5">
                    <Ticket size="1.125rem" className="text-[#FFD300]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold truncate">{deal.titulo}</p>
                    <div className="flex items-center gap-2 text-[0.625rem] text-zinc-400 mt-0.5">
                      <span>{deal.parceiroNome}</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin size="0.5625rem" />
                        {deal.cidadeNome ?? cidadesMap[deal.cidadeId] ?? ''}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded text-[0.5625rem] font-bold uppercase ${
                      deal.tipo === 'BARTER' ? 'bg-purple-500/15 text-purple-400' : 'bg-green-500/15 text-green-400'
                    }`}
                  >
                    {deal.tipo}
                  </span>
                </div>

                {/* Descrição */}
                {deal.descricao && <p className="text-zinc-400 text-xs mt-2 line-clamp-2">{deal.descricao}</p>}

                {/* Obrigação barter */}
                {deal.tipo === 'BARTER' && deal.obrigacaoBarter && (
                  <div className="flex items-center gap-1.5 mt-2 text-zinc-400 text-[0.625rem]">
                    <Clock size="0.625rem" className="shrink-0" />
                    <span className="truncate">{deal.obrigacaoBarter}</span>
                  </div>
                )}

                {/* Desconto */}
                {deal.tipo === 'DESCONTO' && deal.descontoPercentual && (
                  <div className="mt-2">
                    <span className="text-green-400 text-lg font-bold">{deal.descontoPercentual}% OFF</span>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-[0.625rem]">
                    <Users size="0.625rem" />
                    <span>
                      {vagasRestantes > 0 ? `${vagasRestantes} vaga${vagasRestantes > 1 ? 's' : ''}` : 'Esgotado'}
                    </span>
                  </div>

                  {/* Status do resgate do membro neste deal */}
                  {resgate &&
                    (() => {
                      const s = statusLabel(resgate.status);
                      return (
                        <span className={`px-2 py-0.5 rounded text-[0.5625rem] font-bold uppercase ${s.bg} ${s.color}`}>
                          {s.text}
                        </span>
                      );
                    })()}

                  {/* Botão aplicar */}
                  {!jaAplicou && !esgotado && !temDealAtivo && (
                    <button
                      onClick={() => handleAplicar(deal)}
                      disabled={aplicando}
                      className="px-4 py-1.5 bg-[#FFD300] text-black rounded-lg text-[0.625rem] font-black uppercase tracking-wider active:scale-95 transition-all disabled:opacity-50"
                    >
                      {aplicando ? '...' : 'Quero resgatar'}
                    </button>
                  )}

                  {/* Mensagem se tem deal ativo e não é este */}
                  {!jaAplicou && !esgotado && temDealAtivo && (
                    <span className="text-zinc-400 text-[0.5625rem]">Conclua seu deal ativo primeiro</span>
                  )}

                  {!jaAplicou && esgotado && <span className="text-zinc-400 text-[0.5625rem]">Sem vagas</span>}
                </div>

                {/* Post link se resgate ativo */}
                {resgate?.postUrl && (
                  <a
                    href={resgate.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-zinc-400 text-[0.625rem] mt-2 hover:text-zinc-300 transition-colors"
                  >
                    <Eye size="0.625rem" /> Ver post
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Histórico de resgates passados */}
      {meusResgates.filter(r => ['CONCLUIDO', 'CANCELADO', 'RECUSADO', 'NO_SHOW', 'EXPIRADO'].includes(r.status))
        .length > 0 && (
        <div className="mt-6">
          <p className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-wider mb-2">Histórico</p>
          <div className="space-y-2">
            {meusResgates
              .filter(r => ['CONCLUIDO', 'CANCELADO', 'RECUSADO', 'NO_SHOW', 'EXPIRADO'].includes(r.status))
              .slice(0, 5)
              .map(r => {
                const s = statusLabel(r.status);
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between bg-zinc-900/40 border border-white/5 rounded-xl px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-xs truncate">{r.dealTitulo ?? 'Deal'}</p>
                      <p className="text-zinc-400 text-[0.5625rem]">{r.parceiroNome}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[0.5625rem] font-bold uppercase shrink-0 ${s.bg} ${s.color}`}
                    >
                      {s.text}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Modal QR VIP Dourado */}
      {showQr && meuResgate?.qrToken && (
        <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-xs space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[#FFD300] font-bold text-sm">QR VIP MAIS VANTA</h3>
              <button onClick={() => setShowQr(false)} className="active:scale-90 transition-all">
                <X size="1.125rem" className="text-zinc-400" />
              </button>
            </div>

            <div className="bg-gradient-to-b from-[#FFD300]/20 to-[#FFD300]/5 border-2 border-[#FFD300]/40 rounded-2xl p-6 flex flex-col items-center gap-4">
              <div className="bg-white rounded-xl p-4">
                <QRCodeSVG
                  value={`vanta://mv/${meuResgate.qrToken}`}
                  size="11.25rem"
                  fgColor="#1a1a1a"
                  bgColor="#ffffff"
                />
              </div>
              <div className="text-center space-y-1">
                <p className="text-white font-bold text-sm truncate">{meuResgate.dealTitulo ?? 'Deal'}</p>
                <p className="text-zinc-400 text-[0.625rem]">{meuResgate.parceiroNome}</p>
                <p className="text-[#FFD300]/60 text-[0.5rem] font-mono uppercase tracking-widest mt-2">
                  {meuResgate.qrToken.slice(0, 8)}...{meuResgate.qrToken.slice(-8)}
                </p>
              </div>
            </div>

            <p className="text-zinc-500 text-[0.5625rem] text-center">
              Mostre este QR ao parceiro para registrar seu check-in
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
