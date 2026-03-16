import React from 'react';
import { ArrowLeft, ExternalLink, LinkIcon, Mail, FileText, Shield, Instagram, MessageCircle } from 'lucide-react';
import { AdminViewHeader } from '../components/AdminViewHeader';
import { TYPOGRAPHY } from '../../../constants';

interface LinkItem {
  label: string;
  url: string;
  desc?: string;
  icon: React.ReactNode;
}

interface LinkSection {
  titulo: string;
  links: LinkItem[];
}

const LINKS_DATA: LinkSection[] = [
  {
    titulo: 'Suporte',
    links: [
      {
        label: 'WhatsApp Suporte',
        url: 'https://wa.me/5511999999999',
        desc: 'Atendimento em horário comercial',
        icon: <MessageCircle size="0.875rem" className="text-green-400" />,
      },
      {
        label: 'E-mail Suporte',
        url: 'mailto:suporte@vanta.app',
        desc: 'suporte@vanta.app',
        icon: <Mail size="0.875rem" className="text-blue-400" />,
      },
    ],
  },
  {
    titulo: 'Redes Sociais',
    links: [
      {
        label: 'Instagram VANTA',
        url: 'https://instagram.com/vanta.app',
        desc: '@vanta.app',
        icon: <Instagram size="0.875rem" className="text-pink-400" />,
      },
    ],
  },
  {
    titulo: 'Documentação & Políticas',
    links: [
      {
        label: 'Termos de Uso',
        url: '/termos',
        desc: 'Termos e condições da plataforma',
        icon: <FileText size="0.875rem" className="text-zinc-400" />,
      },
      {
        label: 'Política de Privacidade',
        url: '/privacidade',
        desc: 'Como tratamos seus dados',
        icon: <Shield size="0.875rem" className="text-zinc-400" />,
      },
      {
        label: 'Política de Reembolso',
        url: '/reembolso',
        desc: 'Regras de cancelamento e estorno',
        icon: <FileText size="0.875rem" className="text-zinc-400" />,
      },
    ],
  },
];

export const LinksUteisView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const handleOpen = (url: string) => {
    if (url.startsWith('/')) {
      window.open(window.location.origin + url, '_blank');
    } else {
      window.open(url, '_blank', 'noopener');
    }
  };

  return (
    <div className="flex-1 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <AdminViewHeader title="Links Úteis" subtitle="Recursos e contatos" onBack={onBack} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 space-y-6">
        {LINKS_DATA.map(section => (
          <div key={section.titulo}>
            <p className="text-[0.5625rem] font-black uppercase tracking-widest text-zinc-500 px-1 pb-2">
              {section.titulo}
            </p>
            <div className="space-y-1">
              {section.links.map(link => (
                <button
                  key={link.url}
                  onClick={() => handleOpen(link.url)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/5 active:bg-white/5 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                    {link.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-200 font-medium truncate">{link.label}</p>
                    {link.desc && <p className="text-[0.625rem] text-zinc-500 truncate">{link.desc}</p>}
                  </div>
                  <ExternalLink size="0.75rem" className="text-zinc-600 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
