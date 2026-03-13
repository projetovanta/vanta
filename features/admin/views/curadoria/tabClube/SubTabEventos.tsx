import React from 'react';
import { AlertTriangle, ExternalLink, User, X } from 'lucide-react';
import type { MembroClubeVanta, EventoAdmin, ClubeConfig } from '../../../../../types';
import { clubeService } from '../../../services/clubeService';
import { formatDate } from '../types';
import type { PerfilEnriquecido } from './tierUtils';
import { VantaDropdown } from './VantaDropdown';

interface Props {
  eventosComLote: EventoAdmin[];
  eventoSelecionado: string;
  setEventoSelecionado: (v: string) => void;
  membros: MembroClubeVanta[];
  perfis: Record<string, PerfilEnriquecido>;
  clubeConfig: ClubeConfig | null;
  toastFn: (tipo: 'sucesso' | 'erro' | string, msg: string) => void;
  onOpenPerfil: (userId: string) => void;
  onRefresh: () => Promise<void>;
}

export const SubTabEventos: React.FC<Props> = ({
  eventosComLote,
  eventoSelecionado,
  setEventoSelecionado,
  membros,
  perfis,
  clubeConfig,
  toastFn,
  onOpenPerfil,
  onRefresh,
}) => (
  <div className="space-y-3">
    {/* Seletor de evento */}
    <VantaDropdown
      value={eventoSelecionado}
      onChange={v => setEventoSelecionado(v)}
      options={[
        { value: '', label: 'Selecione um evento' },
        ...eventosComLote.map(ev => ({ value: ev.id, label: `${ev.nome} — ${formatDate(ev.dataInicio)}` })),
      ]}
      placeholder="Selecione um evento"
      className="w-full"
    />

    {eventoSelecionado &&
      (() => {
        const reservasEvento = clubeService.getReservasEvento(eventoSelecionado);
        const evento = eventosComLote.find(ev => ev.id === eventoSelecionado);
        const eventoPassado = evento ? new Date(evento.dataFim) < new Date() : false;

        if (reservasEvento.length === 0) {
          return (
            <p className="text-zinc-400 text-xs text-center py-10">Nenhum membro reservou benefício neste evento</p>
          );
        }

        return (
          <div className="space-y-2">
            {/* Legenda */}
            <div className="flex items-center gap-4 px-1 py-2">
              <span className="flex items-center gap-1 text-[0.5625rem]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Postou
              </span>
              <span className="flex items-center gap-1 text-[0.5625rem]">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Não postou
              </span>
              <span className="flex items-center gap-1 text-[0.5625rem]">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Não compareceu
              </span>
            </div>

            {reservasEvento
              .filter(r => r.status !== 'CANCELADO')
              .map(r => {
                const p = perfis[r.userId];
                const membro = membros.find(m => m.userId === r.userId);
                const compareceu = r.status === 'USADO' || r.status === 'PENDENTE_POST';
                const postou = r.postVerificado;
                const noShow = eventoPassado && r.status === 'RESGATADO';

                let statusColor = 'border-zinc-700';
                let statusBg = 'bg-zinc-900/60';
                let statusLabel = 'Reservado';
                let statusLabelColor = 'text-zinc-400';

                if (postou) {
                  statusColor = 'border-emerald-500/30';
                  statusBg = 'bg-emerald-500/5';
                  statusLabel = 'Postou';
                  statusLabelColor = 'text-emerald-400';
                } else if (noShow) {
                  statusColor = 'border-red-500/30';
                  statusBg = 'bg-red-500/5';
                  statusLabel = 'Não compareceu';
                  statusLabelColor = 'text-red-400';
                } else if (compareceu && !postou) {
                  statusColor = 'border-amber-500/30';
                  statusBg = 'bg-amber-500/5';
                  statusLabel = 'Pendente post';
                  statusLabelColor = 'text-amber-400';
                }

                return (
                  <div key={r.id} className={`${statusBg} border ${statusColor} rounded-2xl p-3`}>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onOpenPerfil(r.userId)}
                        className="w-9 h-9 rounded-lg overflow-hidden border border-white/10 bg-zinc-800 shrink-0 active:scale-90 transition-all"
                      >
                        {p?.selfieSignedUrl ? (
                          <img loading="lazy" src={p.selfieSignedUrl} alt="" className="w-full h-full object-cover" />
                        ) : p?.foto ? (
                          <img loading="lazy" src={p.foto} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User size="0.875rem" className="text-zinc-400" />
                          </div>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-bold truncate">{p?.nome || r.userId.slice(0, 8)}</p>
                        {membro?.instagramHandle && (
                          <p className="text-zinc-400 text-[0.5625rem]">@{membro.instagramHandle}</p>
                        )}
                      </div>
                      <span className={`text-[0.5rem] font-black uppercase px-2 py-0.5 rounded ${statusLabelColor}`}>
                        {statusLabel}
                      </span>
                    </div>

                    {/* Ações contextuais */}
                    <div className="flex items-center gap-2 mt-2">
                      {/* Compareceu mas não postou → Lembrar de postar */}
                      {compareceu && !postou && (
                        <button
                          onClick={() => toastFn('sucesso', `Lembrete enviado para ${p?.nome || 'membro'}`)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-[0.5625rem] font-bold active:scale-90 transition-all"
                        >
                          <AlertTriangle size="0.625rem" /> Lembrar de postar
                        </button>
                      )}
                      {/* Registrar infração (no-show ou não postou) */}
                      {(noShow || (compareceu && !postou)) && !clubeService.estaBloqueado(r.userId) && (
                        <button
                          onClick={async () => {
                            const tipo = noShow ? ('NO_SHOW' as const) : ('NAO_POSTOU' as const);
                            const cfg = clubeConfig;
                            const result = await clubeService.registrarInfracao(
                              r.userId,
                              tipo,
                              '',
                              {
                                limite: cfg?.infracoesLimite ?? 3,
                                bloqueio1Dias: cfg?.bloqueio1Dias ?? 30,
                                bloqueio2Dias: cfg?.bloqueio2Dias ?? 60,
                              },
                              evento?.id,
                              evento?.nome,
                            );
                            const msgs: Record<string, string> = {
                              AVISO: `Infração registrada (${result.count}ª). ${p?.nome || 'Membro'} avisado.`,
                              BLOQUEIO_1: `${p?.nome || 'Membro'} bloqueado por ${cfg?.bloqueio1Dias ?? 30} dias (1º bloqueio).`,
                              BLOQUEIO_2: `${p?.nome || 'Membro'} bloqueado por ${cfg?.bloqueio2Dias ?? 60} dias. Avisado que a próxima será exclusão permanente.`,
                              BAN_PERMANENTE: `${p?.nome || 'Membro'} excluído permanentemente do MAIS VANTA.`,
                            };
                            toastFn(result.acao === 'AVISO' ? 'aviso' : 'erro', msgs[result.acao]);
                            await onRefresh();
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[0.5625rem] font-bold active:scale-90 transition-all"
                        >
                          <X size="0.625rem" /> Registrar infração ({noShow ? 'no-show' : 'não postou'})
                        </button>
                      )}
                      {clubeService.estaBloqueado(r.userId) && (
                        <span className="text-red-400 text-[0.5625rem] font-bold flex items-center gap-1">
                          <AlertTriangle size="0.625rem" />{' '}
                          {clubeService.isBanidoPermanente(r.userId)
                            ? 'Banido permanentemente'
                            : `Bloqueado até ${formatDate(clubeService.getBloqueioAte(r.userId) || '')}`}
                        </span>
                      )}
                      {/* Postou → verificado */}
                      {postou && r.postUrl && (
                        <a
                          href={r.postUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-emerald-400 text-[0.5625rem] font-bold"
                        >
                          <ExternalLink size="0.625rem" /> Ver post
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        );
      })()}
  </div>
);
