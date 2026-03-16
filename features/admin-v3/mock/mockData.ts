// Dados mockados pra protótipo visual — sem Supabase, sem services reais

export const MOCK_KPIS = {
  receitaHoje: 12450,
  receitaSemana: 87320,
  membrosAtivos: 247,
  membrosPendentes: 7,
  eventosPendentes: 3,
  eventosAtivos: 12,
  comunidades: 8,
  vendasHoje: 89,
  checkinsHoje: 234,
  saquesAbertos: 2,
};

export const MOCK_ACOES_RAPIDAS = [
  { label: 'Criar evento', icon: 'Calendar', route: 'MEUS_EVENTOS' },
  { label: 'Enviar notificação', icon: 'Bell', route: 'NOTIFICACOES' },
  { label: 'Aprovar membro', icon: 'Star', route: 'CURADORIA_MV' },
  { label: 'Ver saques', icon: 'Banknote', route: 'FINANCEIRO_MASTER' },
];

export const MOCK_PENDENCIAS = [
  { tipo: 'curadoria', label: 'Maria Silva quer ser membro MV', tempo: '2h atrás' },
  { tipo: 'curadoria', label: 'João Santos quer ser membro MV', tempo: '3h atrás' },
  { tipo: 'evento', label: 'Festa Neon precisa de aprovação', tempo: '5h atrás' },
  { tipo: 'financeiro', label: 'Saque R$ 2.400 aguardando', tempo: '1d atrás' },
  { tipo: 'curadoria', label: 'Ana Costa quer ser membro MV', tempo: '1d atrás' },
];

export const MOCK_VENDAS_SEMANA = [
  { dia: 'Seg', valor: 3200 },
  { dia: 'Ter', valor: 4100 },
  { dia: 'Qua', valor: 2800 },
  { dia: 'Qui', valor: 6500 },
  { dia: 'Sex', valor: 15200 },
  { dia: 'Sáb', valor: 42300 },
  { dia: 'Dom', valor: 13220 },
];
