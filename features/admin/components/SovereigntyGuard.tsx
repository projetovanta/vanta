import React, { useState } from 'react';
import { LockKeyhole, Clock } from 'lucide-react';
import { PermissaoVanta, ContaVanta } from '../../../types';
import { rbacService } from '../services/rbacService';
import { eventosAdminService } from '../services/eventosAdminService';
import { auditService } from '../services/auditService';

interface SovereigntyGuardProps {
  eventoId: string;
  userId: string;
  permissao: PermissaoVanta;
  currentUserRole?: ContaVanta;
  children: React.ReactNode;
}

const PERMISSAO_LABEL: Record<PermissaoVanta, string> = {
  VER_FINANCEIRO: 'ver o financeiro',
  VENDER_PORTA: 'vender na porta',
  VALIDAR_ENTRADA: 'validar entradas',
  CHECKIN_LISTA: 'fazer check-in por lista',
  VALIDAR_QR: 'validar QR code',
  GERIR_LISTAS: 'gerenciar as listas',
  GERIR_EQUIPE: 'gerenciar a equipe',
  INSERIR_LISTA: 'inserir nomes na lista',
  CRIAR_REGRA_LISTA: 'criar variações na lista',
  VER_LISTA: 'ver nomes da lista',
};

export const SovereigntyGuard: React.FC<SovereigntyGuardProps> = ({
  eventoId,
  userId,
  permissao,
  currentUserRole,
  children,
}) => {
  const [solicitado, setSolicitado] = useState(false);
  const [interveio, setInterveio] = useState(false);

  const temAcesso = interveio || rbacService.temAcessoSoberano(userId, eventoId);

  if (temAcesso) return <>{children}</>;

  const nomeEvento = eventosAdminService.getEvento(eventoId)?.nome ?? 'este evento';
  const permissaoLabel = PERMISSAO_LABEL[permissao] ?? 'acessar este recurso';
  const isMaster = currentUserRole === 'vanta_masteradm';

  const handleSolicitar = async () => {
    await rbacService.solicitarAcesso(eventoId, userId);
    setSolicitado(true);
  };

  const handleIntervir = async () => {
    await rbacService.autorizarAcesso(eventoId, userId);
    auditService.log(userId, 'INTERVENCAO_MASTER', 'EVENTO', eventoId, undefined, { autorizado: true });
    setInterveio(true);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-12 px-6">
      <div className="flex flex-col items-center gap-5 p-7 rounded-2xl bg-zinc-900/60 border border-white/5 text-center w-full max-w-xs">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <LockKeyhole size="1.375rem" className="text-amber-400" />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-bold text-white/80 leading-snug">Aguardando autorização</p>
          <p className="text-xs text-white/40 leading-relaxed">
            Para <span className="text-white/60 font-semibold">{permissaoLabel}</span> em{' '}
            <span className="text-white/60 font-semibold">{nomeEvento}</span>, você precisa de autorização do Gerente do
            Evento.
          </p>
          <p className="text-[0.5625rem] text-zinc-400 font-black uppercase tracking-widest mt-1">
            O sócio/dono do evento deve aprovar seu acesso no painel dele.
          </p>
        </div>

        {solicitado ? (
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 font-semibold">
            <Clock size="0.75rem" />
            Solicitação enviada — aguardando aprovação
          </div>
        ) : (
          <button
            onClick={handleSolicitar}
            className="w-full px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60 font-semibold hover:bg-white/10 hover:text-white/80 active:scale-95 transition-all"
          >
            Solicitar acesso ao Gerente
          </button>
        )}

        {isMaster && (
          <button
            onClick={handleIntervir}
            className="w-full px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-semibold hover:bg-red-500/15 active:scale-95 transition-all"
          >
            ⚡ Intervir como Administrador
          </button>
        )}
      </div>
    </div>
  );
};
