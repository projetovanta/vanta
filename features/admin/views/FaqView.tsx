import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';

interface FaqItem {
  pergunta: string;
  resposta: string;
}

interface FaqSection {
  titulo: string;
  itens: FaqItem[];
}

const FAQ_DATA: FaqSection[] = [
  {
    titulo: 'Eventos',
    itens: [
      {
        pergunta: 'Como criar um evento?',
        resposta:
          'Acesse "Meus Eventos" no painel e clique em "Criar Evento". Preencha nome, data, local, foto e configure os ingressos. Após salvar, o evento ficará como RASCUNHO até você publicar.',
      },
      {
        pergunta: 'Qual a diferença entre RASCUNHO, PENDENTE e PUBLICADO?',
        resposta:
          'RASCUNHO: só você vê, ainda editando. PENDENTE: enviado para aprovação do master. PUBLICADO: visível para todos os usuários. EM_REVISAO: o master pediu correções antes de aprovar.',
      },
      {
        pergunta: 'Como configuro lotes de ingresso?',
        resposta:
          'Na criação do evento, etapa de ingressos, você pode criar múltiplos lotes com preço, quantidade e datas de início/fim diferentes. Quando um lote esgota ou expira, o próximo entra automaticamente.',
      },
      {
        pergunta: 'Posso criar evento recorrente?',
        resposta:
          'Sim. Na criação do evento, escolha a recorrência: Semanal, Quinzenal ou Mensal. O sistema gera automaticamente as próximas ocorrências mantendo as mesmas configurações.',
      },
      {
        pergunta: 'Como funciona o evento privado?',
        resposta:
          'Eventos privados só são visíveis para membros da comunidade. Para criar um, ative a opção "Evento Privado" na criação. Apenas membros com acesso à comunidade poderão ver e comprar ingressos.',
      },
    ],
  },
  {
    titulo: 'Financeiro',
    itens: [
      {
        pergunta: 'Quando posso solicitar saque?',
        resposta:
          'Você pode solicitar saque do saldo disponível a qualquer momento. O prazo de processamento é de até 3 dias úteis. O valor mínimo para saque é R$ 10,00.',
      },
      {
        pergunta: 'Como funciona o reembolso?',
        resposta:
          'Reembolsos podem ser solicitados pelo comprador até 7 dias antes do evento. Após esse prazo, fica a critério do organizador. O valor é estornado pela mesma forma de pagamento.',
      },
      {
        pergunta: 'O que é chargeback?',
        resposta:
          'Chargeback é quando o comprador contesta a cobrança direto com o banco/cartão. O valor é deduzido do seu saldo. Mantenha comprovantes de entrega e comunicação com os compradores para contestar.',
      },
      {
        pergunta: 'Quais são as taxas da VANTA?',
        resposta:
          'A VANTA cobra uma taxa por ingresso vendido, definida no contrato da comunidade. Você pode ver as taxas detalhadas na aba Financeiro do seu evento.',
      },
    ],
  },
  {
    titulo: 'Comunidade',
    itens: [
      {
        pergunta: 'Como convido pessoas para minha comunidade?',
        resposta:
          'Compartilhe o link da sua comunidade. Qualquer pessoa com o link pode seguir a comunidade e ver os eventos públicos. Para acesso administrativo, use Cargos para atribuir funções.',
      },
      {
        pergunta: 'Quais são os cargos disponíveis?',
        resposta:
          'Sócio: acesso total à comunidade. Gerente: gerencia eventos e equipe. Promoter: gerencia listas e cotas. Portaria: check-in e controle de acesso. Cada cargo tem permissões específicas.',
      },
      {
        pergunta: 'O que é o MAIS VANTA?',
        resposta:
          'MAIS VANTA é o programa de benefícios exclusivos para membros da comunidade. Inclui descontos em eventos, acesso antecipado, deals com parceiros e mais. Configure em MAIS VANTA > Config MV.',
      },
    ],
  },
  {
    titulo: 'Operações',
    itens: [
      {
        pergunta: 'Como funciona o check-in?',
        resposta:
          'Use a portaria QR para escanear o código do ingresso, ou a lista para check-in manual. O sistema valida automaticamente se o ingresso é válido, não foi usado e pertence ao evento.',
      },
      {
        pergunta: 'Posso fazer check-in offline?',
        resposta:
          'Sim. A portaria tem modo offline que sincroniza quando a conexão voltar. Os dados ficam salvos localmente no dispositivo até a sincronização.',
      },
      {
        pergunta: 'Como transfiro um ingresso?',
        resposta:
          'O comprador pode transferir o ingresso para outra pessoa pelo app. A transferência gera um novo QR code para o destinatário. O ingresso original é invalidado.',
      },
      {
        pergunta: 'O que são cortesias?',
        resposta:
          'Cortesias são ingressos gratuitos que você pode enviar para convidados especiais. Configure a quantidade de cortesias por evento na aba de configurações do evento.',
      },
    ],
  },
];

export const FaqView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (key: string) => setExpanded(prev => (prev === key ? null : key));

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-5 pt-5 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-xl active:bg-white/5">
            <ArrowLeft size="1.125rem" className="text-zinc-400" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 style={TYPOGRAPHY.screenTitle} className="text-white text-lg">
              Perguntas Frequentes
            </h1>
            <p className="text-zinc-500 text-[0.625rem] font-bold uppercase tracking-widest mt-0.5">
              Dúvidas sobre o painel
            </p>
          </div>
          <HelpCircle size="1.25rem" className="text-zinc-600 shrink-0" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 space-y-6">
        {FAQ_DATA.map(section => (
          <div key={section.titulo}>
            <p className="text-[0.5625rem] font-black uppercase tracking-widest text-zinc-500 px-1 pb-2">
              {section.titulo}
            </p>
            <div className="space-y-1">
              {section.itens.map((item, i) => {
                const key = `${section.titulo}-${i}`;
                const isOpen = expanded === key;
                return (
                  <div key={key} className="rounded-xl border border-white/5 overflow-hidden">
                    <button
                      onClick={() => toggle(key)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-white/5 transition-colors"
                    >
                      <span className="flex-1 text-xs text-zinc-200 font-medium">{item.pergunta}</span>
                      {isOpen ? (
                        <ChevronUp size="0.875rem" className="text-zinc-500 shrink-0" />
                      ) : (
                        <ChevronDown size="0.875rem" className="text-zinc-500 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-3 border-t border-white/5">
                        <p className="text-[0.6875rem] text-zinc-400 leading-relaxed pt-2">{item.resposta}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="py-6 text-center">
          <p className="text-[0.625rem] text-zinc-600">Não encontrou sua dúvida? Entre em contato com o suporte.</p>
        </div>
      </div>
    </div>
  );
};
