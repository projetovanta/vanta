import React from 'react';

export const SubTabNotificacoes: React.FC = () => (
  <div className="space-y-4">
    <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 space-y-3">
      <h3 className="text-white font-bold text-sm">Notificações Automáticas</h3>
      <p className="text-zinc-400 text-xs">Sistema automático envia notificações quando:</p>
      <ul className="text-zinc-400 text-[10px] space-y-1 ml-3 list-disc">
        <li>Membro confirma presença (check-in)</li>
        <li>Evento começa (lembrete de postar)</li>
        <li>Evento termina (alerta se não postou)</li>
        <li>Prazo de 12h para postar está vencendo</li>
        <li>Infração é registrada por não-postagem</li>
      </ul>
    </div>

    <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-white font-bold text-xs">Ativar Notificações Automáticas</p>
          <p className="text-zinc-400 text-[9px] mt-1">Para esta comunidade</p>
        </div>
        <button className="px-3 py-1.5 bg-[#FFD300]/10 border border-[#FFD300]/25 rounded-lg text-[#FFD300] text-[8px] font-bold active:scale-95 transition-all">
          ATIVAR
        </button>
      </div>
    </div>

    <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 space-y-2">
      <p className="text-amber-400 font-bold text-xs">ℹ️ Informação</p>
      <p className="text-amber-200/80 text-[9px] leading-relaxed">
        Notificações são enviadas automaticamente para membros MAIS VANTA quando eventos iniciam e terminam. O sistema
        rastreia posts e registra infrações progressivas (3 = 30d bloqueio, 6 = 60d, 9 = ban permanente).
      </p>
    </div>

    <div className="text-zinc-400 text-[9px] text-center py-6">
      Configuração avançada em painel administrativo global
    </div>
  </div>
);
