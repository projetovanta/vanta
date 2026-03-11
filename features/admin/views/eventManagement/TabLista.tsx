import React, { useState, useEffect } from 'react';
import { Users, Plus, Check, Search, X, WifiOff, RefreshCw } from 'lucide-react';
import { ListaEvento } from '../../../../types';
import { listasService } from '../../services/listasService';
import { offlineEventService } from '../../../../services/offlineEventService';
import { useConnectivity } from '../../../../hooks/useConnectivity';
import { inputCls } from './types';

export const TabLista: React.FC<{
  lista: ListaEvento;
  isSocio: boolean;
  currentUserId: string;
  currentUserNome: string;
  refresh: () => void;
}> = ({ lista, isSocio, currentUserId, currentUserNome, refresh }) => {
  const [regraId, setRegraId] = useState(lista.regras[0]?.id ?? '');
  const [nome, setNome] = useState('');
  const [tel, setTel] = useState('');
  const [erro, setErro] = useState('');
  const [search, setSearch] = useState('');
  const [checkinIds, setCheckinIds] = useState<Set<string>>(() => {
    const ja = new Set<string>();
    lista.convidados.filter(c => c.checkedIn).forEach(c => ja.add(c.id));
    return ja;
  });
  const { isOnline, pendingSyncCount, syncing } = useConnectivity();

  // Popular cache IndexedDB para suporte offline
  useEffect(() => {
    if (lista.eventoId) {
      void offlineEventService.loadConvidados(lista.eventoId);
    }
  }, [lista.eventoId]);

  const handleAdicionar = () => {
    setErro('');
    if (!regraId) {
      setErro('Selecione uma categoria.');
      return;
    }
    if (!nome.trim()) {
      setErro('Informe o nome.');
      return;
    }
    if (!tel.trim()) {
      setErro('Informe o telefone.');
      return;
    }
    const ok = isSocio
      ? listasService.inserirForce(lista.id, regraId, nome, tel, currentUserId, currentUserNome)
      : listasService.inserirConvidado(lista.id, regraId, nome, tel, currentUserId, currentUserNome);
    if (!ok) {
      setErro(isSocio ? 'Saldo no banco esgotado.' : 'Sem saldo disponível nesta categoria.');
      return;
    }
    setNome('');
    setTel('');
    refresh();
  };

  const [avisoCorte, setAvisoCorte] = useState<{ nome: string; hora: string } | null>(null);
  const [avisoAbobora, setAvisoAbobora] = useState<{
    nome: string;
    hora: string;
    valor: number;
    convidadoId: string;
    listaId: string;
  } | null>(null);
  const [avisoPagamento, setAvisoPagamento] = useState<{
    nome: string;
    valor: number;
    regraLabel: string;
    convidadoId: string;
    listaId: string;
    isAbobora?: boolean;
    horaCorte?: string;
  } | null>(null);

  const handleCheckin = async (convidadoId: string) => {
    const eventoId = lista.eventoId ?? '';
    const convidado = lista.convidados.find(c => c.id === convidadoId);
    const result = await offlineEventService.checkInConvidado(lista.id, convidadoId, eventoId, currentUserNome);
    if (result.bloqueado) {
      setAvisoCorte({ nome: convidado?.nome ?? '', hora: result.horaCorte ?? '' });
      return;
    }
    if (result.pendente) {
      setAvisoPagamento({
        nome: convidado?.nome ?? '',
        valor: result.valorAbobora ?? 0,
        regraLabel: result.regraDestinoLabel ?? '',
        convidadoId,
        listaId: lista.id,
        isAbobora: true,
        horaCorte: result.horaCorte,
      });
      return;
    }
    if (result.pendentePagamento) {
      setAvisoPagamento({
        nome: convidado?.nome ?? '',
        valor: result.valorRegra ?? 0,
        regraLabel: result.regraLabel ?? '',
        convidadoId,
        listaId: lista.id,
      });
      return;
    }
    if (result.ok) setCheckinIds(prev => new Set(prev).add(convidadoId));
    refresh();
  };

  const confirmarPagamento = async (forma: 'DINHEIRO' | 'CARTAO' | 'PIX') => {
    if (!avisoPagamento) return;
    const eventoId = lista.eventoId ?? '';
    if (avisoPagamento.isAbobora) {
      await offlineEventService.confirmarCheckInAbobora(
        avisoPagamento.listaId,
        avisoPagamento.convidadoId,
        eventoId,
        forma,
        currentUserNome,
      );
    } else {
      await offlineEventService.confirmarCheckInPago(
        avisoPagamento.listaId,
        avisoPagamento.convidadoId,
        eventoId,
        forma,
        currentUserNome,
      );
    }
    setCheckinIds(prev => new Set(prev).add(avisoPagamento.convidadoId));
    setAvisoPagamento(null);
    refresh();
  };

  // "Efeito Abóbora": a regra "virou abóbora" quando o horário do evento passou do horaCorte
  // (ex: "VIP Fem. até 20h" — após as 20h deixa de ser gratuita) OU quando a regra é paga.
  // Na portaria, convidados sem check-in em regra abóbora recebem badge de atenção.
  const isRegraAbobora = (regra: (typeof lista.regras)[0] | undefined): boolean => {
    if (!regra) return false;
    // Regra paga (valor > 0) → sempre abóbora se não confirmado
    if (regra.valor && regra.valor > 0) return true;
    // Regra com horaCorte → abóbora se já passou do horário limite
    if (regra.horaCorte) {
      const [hh, mm] = regra.horaCorte.split(':').map(Number);
      const agora = new Date();
      const limite = new Date();
      limite.setHours(hh, mm, 0, 0);
      return agora > limite;
    }
    return false;
  };

  const base = isSocio ? lista.convidados : lista.convidados.filter(c => c.inseridoPor === currentUserId);

  // Ordem alfabética + busca
  const filtrados = [...base]
    .filter(c => !search.trim() || c.nome.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  const dentroCount = filtrados.filter(c => checkinIds.has(c.id)).length;
  const meusTotais = lista.convidados.filter(c => c.inseridoPor === currentUserId);
  const meusEntrar = meusTotais.filter(c => c.checkedIn).length;

  return (
    <div className="space-y-4">
      {/* Contador sticky */}
      <div className="sticky top-0 z-10 bg-[#0A0A0A] pb-3 -mx-6 px-6 pt-1">
        <div className="flex items-center p-4 bg-zinc-900/80 border border-white/5 rounded-2xl backdrop-blur-sm gap-3">
          <div className="text-center flex-1">
            <p className="text-white font-black text-2xl leading-none">{filtrados.length}</p>
            <p className="text-zinc-400 text-[0.5rem] font-black uppercase tracking-widest mt-0.5">na lista</p>
          </div>
          <div className="w-px h-8 bg-white/5 shrink-0" />
          <div className="text-center flex-1">
            <p className="text-emerald-400 font-black text-2xl leading-none">{dentroCount}</p>
            <p className="text-zinc-400 text-[0.5rem] font-black uppercase tracking-widest mt-0.5">dentro</p>
          </div>
          <div className="w-px h-8 bg-white/5 shrink-0" />
          <div className="text-center flex-1">
            <p className="text-zinc-400 font-black text-2xl leading-none">{filtrados.length - dentroCount}</p>
            <p className="text-zinc-400 text-[0.5rem] font-black uppercase tracking-widest mt-0.5">aguardando</p>
          </div>
        </div>
        {/* Badge de conectividade */}
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {syncing ? (
            <>
              <RefreshCw size="0.5625rem" className="text-blue-400 animate-spin shrink-0" />
              <span className="text-blue-400 text-[0.5rem] font-black uppercase tracking-widest">
                Sincronizando {pendingSyncCount}...
              </span>
            </>
          ) : isOnline ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-emerald-500 text-[0.5rem] font-black uppercase tracking-widest">
                Realtime ativo
              </span>
            </>
          ) : (
            <>
              <WifiOff size="0.5625rem" className="text-amber-400 shrink-0" />
              <span className="text-amber-400 text-[0.5rem] font-black uppercase tracking-widest">
                Offline{pendingSyncCount > 0 ? ` · ${pendingSyncCount} pendente${pendingSyncCount > 1 ? 's' : ''}` : ''}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          size="0.875rem"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
        />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar convidado…"
          className="w-full bg-zinc-900/60 border border-white/5 rounded-xl pl-9 pr-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 active:text-white transition-all"
          >
            <X size="0.8125rem" />
          </button>
        )}
      </div>

      {/* Formulário de inserção */}
      <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl space-y-3">
        <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest">Inserir convidado</p>

        {/* Pills de categoria */}
        <div className="flex gap-1.5 flex-wrap">
          {lista.regras.map(r => {
            const saldo = isSocio ? r.saldoBanco : listasService.getSaldoDisponivel(lista.id, currentUserId, r.id);
            const ativo = regraId === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setRegraId(r.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-[0.5625rem] font-black uppercase tracking-wide transition-all ${
                  ativo
                    ? 'bg-[#FFD300] text-black border-transparent'
                    : 'bg-zinc-900 text-zinc-400 border-white/5 active:bg-zinc-800'
                }`}
              >
                {r.label}
                {r.valor && r.valor > 0 && (
                  <span className={`text-[0.4375rem] font-black ${ativo ? 'text-black/50' : 'text-amber-500/70'}`}>
                    R${r.valor}
                  </span>
                )}
                <span className={`text-[0.5rem] font-black ${ativo ? 'text-black/60' : 'text-zinc-400'}`}>
                  ·{saldo}
                </span>
              </button>
            );
          })}
        </div>

        {/* Inputs */}
        <div className="flex gap-2">
          <input
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Nome"
            className={inputCls + ' flex-1'}
          />
          <input
            value={tel}
            onChange={e => setTel(e.target.value)}
            placeholder="Telefone"
            className={inputCls + ' flex-1'}
            type="tel"
          />
        </div>

        {erro && <p className="text-red-400 text-[0.625rem] font-black uppercase tracking-widest">{erro}</p>}

        <button
          onClick={handleAdicionar}
          className="w-full py-3 bg-[#FFD300] text-black rounded-xl text-[0.625rem] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 active:scale-95 transition-all"
        >
          <Plus size="0.75rem" /> Adicionar
        </button>
      </div>

      {/* Barra de resumo (só promoter) */}
      {!isSocio && meusTotais.length > 0 && (
        <div className="flex items-center justify-between p-3.5 bg-zinc-900/40 border border-white/5 rounded-xl">
          <p className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest">Meus Convidados</p>
          <p className="text-white text-[0.625rem] font-black">
            <span className="text-emerald-400">{meusEntrar}</span>
            <span className="text-zinc-400"> de </span>
            <span>{meusTotais.length}</span>
            <span className="text-zinc-400"> entraram</span>
          </p>
        </div>
      )}

      {/* Lista — ordem alfabética */}
      {filtrados.length === 0 && (
        <div className="flex flex-col items-center py-10 gap-4">
          <Users size="2rem" className="text-zinc-800" />
          <p className="text-zinc-700 text-[0.625rem] font-black uppercase tracking-widest text-center">
            {search
              ? 'Nenhum resultado para a busca'
              : isSocio
                ? 'Nenhum convidado inserido'
                : 'Você ainda não inseriu nomes'}
          </p>
        </div>
      )}

      <div className="space-y-2">
        {filtrados.map(c => {
          const regra = lista.regras.find(r => r.id === c.regraId);
          const cor = regra?.cor;
          const dentro = checkinIds.has(c.id);
          const pago = isRegraAbobora(regra);

          return (
            <div
              key={c.id}
              className={`flex items-center gap-3 p-3.5 border rounded-2xl transition-all ${
                dentro ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-zinc-900/40 border-white/5'
              }`}
            >
              {/* Avatar inicial */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-base transition-all ${
                  dentro ? 'bg-zinc-800/50 text-zinc-400' : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                {c.nome.charAt(0).toUpperCase()}
              </div>

              {/* Dados */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <p className={`font-bold text-sm leading-none truncate ${dentro ? 'text-zinc-400' : 'text-white'}`}>
                  {c.nome}
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Inserido por */}
                  <p className="text-zinc-400 text-[0.5625rem] truncate">via {c.inseridoPorNome}</p>
                  {/* Variação / regra */}
                  <span
                    style={cor ? { backgroundColor: cor + '15', borderColor: cor + '30', color: cor } : {}}
                    className={`text-[0.5rem] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                      cor ? '' : 'bg-zinc-900 text-zinc-400 border-white/5'
                    }`}
                  >
                    {c.regraLabel}
                  </span>
                  {/* Efeito Abóbora — regra paga ou com horário expirado, sem check-in */}
                  {pago && !dentro && (
                    <span className="text-[0.5rem] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border bg-amber-500/10 border-amber-500/20 text-amber-400">
                      {regra?.valor && regra.valor > 0 ? `R$${regra.valor}` : `Expirou ${regra?.horaCorte}`}
                    </span>
                  )}
                </div>
              </div>

              {/* Estado dentro / botão check-in */}
              {dentro ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                    <Check size="0.6875rem" className="text-emerald-400" />
                  </div>
                  <span className="text-[0.5625rem] font-black uppercase tracking-widest text-emerald-500">Dentro</span>
                </div>
              ) : (
                <button
                  onClick={() => handleCheckin(c.id)}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[0.5625rem] font-black uppercase tracking-wider text-zinc-400 hover:bg-[#FFD300]/10 hover:text-[#FFD300] hover:border-[#FFD300]/20 active:scale-95 transition-all"
                >
                  Check-in
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Aviso de hora de corte — check-in bloqueado */}
      {avisoCorte && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-zinc-900 border border-red-500/30 rounded-2xl p-5 max-w-xs w-full text-center space-y-3">
            <div className="text-red-400 text-sm font-bold">Check-in bloqueado</div>
            <p className="text-zinc-300 text-xs">
              <span className="font-semibold text-white">{avisoCorte.nome}</span> está na lista VIP até às{' '}
              <span className="font-semibold text-[#FFD300]">{avisoCorte.hora}</span>. O horário já passou e esta lista
              não tem valor após o corte.
            </p>
            <button
              onClick={() => setAvisoCorte(null)}
              className="w-full py-2.5 bg-zinc-800 border border-white/10 rounded-xl text-zinc-300 text-xs font-bold uppercase tracking-wider"
            >
              Entendi
            </button>
          </div>
        </div>
      )}

      {/* Modal de pagamento — lista paga ou abóbora */}
      {avisoPagamento && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-zinc-900 border border-[#FFD300]/30 rounded-2xl p-5 max-w-xs w-full text-center space-y-4">
            {avisoPagamento.isAbobora && (
              <div className="text-[#FFD300] text-sm font-bold">VIP até às {avisoPagamento.horaCorte} encerrado</div>
            )}
            <p className="text-zinc-300 text-xs">
              <span className="font-semibold text-white">{avisoPagamento.nome}</span>
              {avisoPagamento.regraLabel ? ` (${avisoPagamento.regraLabel})` : ''} — cobrar{' '}
              <span className="font-black text-[#FFD300] text-base">
                R${avisoPagamento.valor.toFixed(2).replace('.', ',')}
              </span>
            </p>
            <p className="text-[0.5625rem] text-zinc-500 font-black uppercase tracking-widest">Como vai pagar?</p>
            <div className="flex gap-2">
              {(['DINHEIRO', 'CARTAO', 'PIX'] as const).map(forma => (
                <button
                  key={forma}
                  onClick={() => confirmarPagamento(forma)}
                  className="flex-1 py-3 bg-[#FFD300]/10 border border-[#FFD300]/30 rounded-xl text-[#FFD300] text-[0.625rem] font-bold uppercase tracking-wider active:scale-95 transition-transform"
                >
                  {forma === 'DINHEIRO' ? 'Dinheiro' : forma === 'CARTAO' ? 'Cartão' : 'Pix'}
                </button>
              ))}
            </div>
            <button
              onClick={() => setAvisoPagamento(null)}
              className="w-full py-2 bg-zinc-800 border border-white/10 rounded-xl text-zinc-400 text-[0.625rem] font-bold uppercase tracking-wider"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
