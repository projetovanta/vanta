/**
 * PendenciasAppView — Checklist de configurações pendentes do app.
 * Só master vê. Itens adicionados sob demanda pelo Dan.
 */

import React from 'react';
import { AlertCircle, Mail, Building2, CheckCircle2 } from 'lucide-react';
import { AdminViewHeader } from '../components/AdminViewHeader';

interface PendenciaItem {
  id: string;
  titulo: string;
  descricao: string;
  icon: React.ReactNode;
  status: 'PENDENTE' | 'CONFIGURADO';
  oQueFalta: string;
}

const PENDENCIAS: PendenciaItem[] = [
  {
    id: 'email-caixa',
    titulo: 'Email do caixa',
    descricao: 'Enviar ingresso por email após venda na porta',
    icon: <Mail size="1.25rem" className="text-amber-400" />,
    status: 'PENDENTE',
    oQueFalta:
      'Configurar chave Resend (RESEND_API_KEY) no Supabase Dashboard. A Edge Function send-notification-email já existe — falta a chave pra funcionar.',
  },
  {
    id: 'cnpj',
    titulo: 'CNPJ da empresa',
    descricao: 'Necessário pra Stripe, App Store e emails oficiais',
    icon: <Building2 size="1.25rem" className="text-amber-400" />,
    status: 'PENDENTE',
    oQueFalta:
      'Registrar CNPJ, configurar conta Stripe Connect, obter DUNS pra Apple Developer. Após CNPJ: configurar secrets Stripe no Supabase.',
  },
];

export const PendenciasAppView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const pendentes = PENDENCIAS.filter(p => p.status === 'PENDENTE').length;
  const configurados = PENDENCIAS.filter(p => p.status === 'CONFIGURADO').length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AdminViewHeader
        title="Pendências App"
        kicker={`${pendentes} pendente${pendentes !== 1 ? 's' : ''} · ${configurados} configurado${configurados !== 1 ? 's' : ''}`}
        onBack={onBack}
        badge={pendentes > 0 ? pendentes : undefined}
        badgeColor="bg-amber-500"
      />

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3 max-w-3xl mx-auto w-full">
        <p className="text-zinc-500 text-xs">
          Itens que precisam de ação externa (configuração, cadastro, chaves) pra funcionar no app.
        </p>

        {PENDENCIAS.map(item => (
          <div
            key={item.id}
            className={`rounded-2xl border p-4 space-y-2 ${
              item.status === 'PENDENTE'
                ? 'bg-amber-500/5 border-amber-500/20'
                : 'bg-emerald-500/5 border-emerald-500/20'
            }`}
          >
            <div className="flex items-center gap-3">
              {item.status === 'PENDENTE' ? item.icon : <CheckCircle2 size="1.25rem" className="text-emerald-400" />}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-bold">{item.titulo}</p>
                <p className="text-zinc-400 text-xs">{item.descricao}</p>
              </div>
              <span
                className={`text-[0.5rem] font-black uppercase px-2 py-1 rounded-lg ${
                  item.status === 'PENDENTE' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {item.status === 'PENDENTE' ? 'Pendente' : 'OK'}
              </span>
            </div>

            {item.status === 'PENDENTE' && (
              <div className="bg-black/30 rounded-xl p-3">
                <p className="text-zinc-300 text-xs leading-relaxed">
                  <AlertCircle size="0.75rem" className="inline text-amber-400 mr-1" />
                  {item.oQueFalta}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
