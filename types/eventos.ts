import type { Cargo, ComunidadeLog, ContaVanta, Selo, PrivacidadeConfig } from './auth';
import type { MembroClubeVanta, TierMaisVanta, LoteMaisVanta } from './clube';
import type { CortesiaEvento } from './financeiro';
import type { DefinicaoCargoCustom } from './rbac';

// ── Horário de funcionamento ─────────────────────────────────────────────────
export interface HorarioSemanal {
  dia: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=dom, 1=seg, ..., 6=sáb
  aberto: boolean;
  abertura: string; // "HH:MM"
  fechamento: string; // "HH:MM"
}

export interface HorarioOverride {
  data: string; // "YYYY-MM-DD"
  aberto: boolean;
  abertura?: string; // "HH:MM" (se aberto)
  fechamento?: string; // "HH:MM" (se aberto)
  motivo?: string; // ex: "Feriado", "Evento especial"
}

// ── Comunidade (venue / local de eventos) ──────────────────────────────────
export interface Comunidade {
  id: string;
  nome: string;
  foto: string; // foto de perfil (avatar)
  fotoCapa?: string; // foto de capa (hero da página)
  descricao: string;
  cidade: string;
  estado?: string;
  cep?: string;
  endereco: string;
  coords?: { lat: number; lng: number };
  capacidadeMax?: number;
  /** @deprecated Fonte da verdade migrada para AtribuicaoRBAC via rbacService. Manter enquanto seedFromLegacy() usar este campo. */
  cargos: Cargo[];
  eventoIds: string[];
  ativa: boolean;
  logs?: ComunidadeLog[];
  curtidas?: string[]; // IDs dos membros que curtiram — no backend: GET /communities/:id/likes
  cargosCustomizados?: DefinicaoCargoCustom[];
  vanta_fee_percent?: number; // taxa de serviço % sobre ingressos app
  vanta_fee_fixed?: number; // taxa fixa por ingresso (legado)
  gateway_fee_mode?: 'ABSORVER' | 'REPASSAR';
  taxa_processamento_percent?: number; // gateway %, sempre produtor (default 2,5%)
  taxa_porta_percent?: number; // % sobre vendas na porta. null = mesma que vanta_fee_percent
  taxa_minima?: number; // mínimo por ingresso app (default R$2)
  cota_nomes_lista?: number; // nomes grátis na lista (default 500)
  taxa_nome_excedente?: number; // R$/nome excedente (default R$0,50)
  cota_cortesias?: number; // cortesias grátis (default 50)
  taxa_cortesia_excedente_pct?: number; // % valor face cortesia excedente (default 5%)
  donoId?: string; // ID do proprietário da comunidade (para transferência de titularidade)
  tierMinimoMaisVanta?: TierMaisVanta; // Tier mínimo do MAIS VANTA para acesso nesta comunidade
  horarioFuncionamento?: HorarioSemanal[];
  horarioOverrides?: HorarioOverride[];
  slug?: string; // URL slug para compartilhamento
  vanta_fee_repasse_percent?: number; // % da taxa VANTA que o master repassa ao sócio/gerente (0-1)
  cnpj?: string;
  razaoSocial?: string;
  telefone?: string;
  // ── Evento Privado config ──
  evento_privado_ativo?: boolean;
  evento_privado_texto?: string;
  evento_privado_fotos?: string[];
  evento_privado_formatos?: string[];
  evento_privado_atracoes?: string[];
  evento_privado_faixas_capacidade?: string[];
}

// ── VANTA Indica ───────────────────────────────────────────────────────────
export type TipoIndicaCard = 'DESTAQUE_EVENTO' | 'PUBLICIDADE' | 'INFORMATIVO';

export type TipoAcaoIndica = 'link' | 'evento' | 'cupom' | 'rota' | 'comemorar';

export interface AcaoIndicaCard {
  tipo: TipoAcaoIndica;
  valor: string; // URL, eventoId, codigoCupom ou rotaInterna
  descontoPct?: number; // apenas para tipo 'cupom'
}

export interface VantaIndicaCard {
  id: string;
  tipo: TipoIndicaCard;
  imagem?: string;
  badge: string;
  titulo: string;
  subtitulo: string;
  ativo: boolean;
  alvoLocalidades: string[]; // ['GLOBAL'] ou ['São Paulo', 'Rio de Janeiro']
  acaoLink: string; // URL externa ou rota interna
  acao?: AcaoIndicaCard;
  imgPosition: string; // CSS object-position: 'top' | 'center' | 'bottom'
  textAlign: string; // flex justify: 'start' | 'center' | 'end'
  layoutConfig?: {
    // posição X/Y de cada elemento (% do container)
    badge?: { x: number; y: number };
    titulo?: { x: number; y: number };
    subtitulo?: { x: number; y: number };
    // escala de cada elemento (1 = padrão, 0.5 = metade, 2 = dobro)
    badgeScale?: number;
    tituloScale?: number;
    subtituloScale?: number;
    /** @deprecated — legado, usar badge/titulo/subtitulo com x/y */
    badgeY?: number;
    tituloY?: number;
    subtituloY?: number;
  };
  criadoPor: string;
  criadoEm: string; // ISO 8601 -03:00
}

export interface Lote {
  nome: string;
  preco: number;
}

export interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  data: string; // Rótulo amigável: 'Hoje', 'Amanhã', '25 Abr'
  dataReal: string; // Formato ISO: 'YYYY-MM-DD'
  horario: string;
  horarioFim?: string;
  local: string;
  cidade: string;
  coords?: {
    lat: number;
    lng: number;
  };
  lotes: Lote[];
  ocultarValor?: boolean; // Se true, exibe "Preços sob consulta"
  urlIngressos?: string; // Se presente, botão "Ver Ingressos" abre este URL externamente (web)
  imagem: string;
  formato: string;
  estilos?: string[];
  experiencias?: string[];
  /** @deprecated Use formato */ categoria?: string;
  /** @deprecated Use estilos/experiencias */ subcategorias?: string[];
  membrosConfirmados: number;
  dressCode?: string;
  lineup?: string[];
  comunidade?: {
    id: string;
    nome: string;
    foto: string;
  };
  endereco?: string;
  dataInicioISO?: string; // ISO 8601 completo — usado para janela de validade do ingresso
  dataFimISO?: string; // ISO 8601 completo — usado para janela de validade do ingresso
  temBeneficioMaisVanta?: boolean; // true = tem lote MAIS VANTA com vagas disponíveis
  slug?: string; // URL slug para compartilhamento
}

export interface Ingresso {
  id: string;
  eventoId: string;
  tituloEvento: string;
  dataEvento: string;
  status: 'DISPONIVEL' | 'USADO' | 'CANCELADO' | 'TRANSFERIDO' | 'EXPIRADO' | 'REEMBOLSADO';
  codigoQR: string;
  tipo?: 'CORTESIA'; // undefined = ingresso comprado normalmente
  isAcompanhante?: boolean; // true = ingresso de acompanhante (sem conta VANTA)
  variacaoLabel?: string; // ex: "PISTA · Fem." — preenchido pelo checkout web
  nomeTitular?: string;
  cpf?: string;
  eventoLocal?: string;
  eventoImagem?: string;
  eventoDataInicioISO?: string; // ISO 8601 — janela de validade do ingresso
  eventoDataFimISO?: string; // ISO 8601 — janela de validade do ingresso
  comprovanteId?: string; // ref ao comprovante de meia-entrada usado na compra
  isMeiaEntrada?: boolean; // true = ingresso comprado com benefício meia
}

// ── Comprovante Meia-Entrada ──────────────────────────────────────────────────
export type StatusComprovante = 'PENDENTE' | 'APROVADO' | 'REJEITADO' | 'VENCIDO';

export interface ComprovanteFoto {
  label: string; // 'frente' | 'verso' | 'extra'
  path: string; // path no Storage (userId/frente.jpg)
}

export interface ComprovanteMeia {
  id: string;
  userId: string;
  tipo: string;
  fotoUrl: string; // legado (primeira foto)
  fotos: ComprovanteFoto[]; // múltiplos arquivos (frente/verso/extra)
  status: StatusComprovante;
  motivoRejeicao?: string;
  aprovadoPor?: string;
  aprovadoEm?: string;
  validadeAte?: string;
  criadoEm: string;
}

/** Tipos legais federais + complementares (lei estadual/municipal) */
export const TIPOS_COMPROVANTE_MEIA = [
  { id: 'ESTUDANTE', label: 'Estudante (CIE/DNE)', validadePadrao: 6 },
  { id: 'IDOSO', label: 'Idoso (60+)', validadePadrao: 0 },
  { id: 'PCD', label: 'Pessoa com Deficiência', validadePadrao: 60 },
  { id: 'ID_JOVEM', label: 'ID Jovem (CadÚnico 15-29)', validadePadrao: 12 },
  { id: 'PROFESSOR', label: 'Professor', validadePadrao: 12 },
  { id: 'DOADOR_SANGUE', label: 'Doador de Sangue', validadePadrao: 12 },
] as const;

export interface Membro {
  id: string;
  nome: string;
  email: string;
  instagram?: string;
  seguidoresInstagram?: number; // contagem de seguidores (preenchida no cadastro)
  dataNascimento?: string; // Novo campo: ISO 8601 YYYY-MM-DD
  telefone?: {
    ddd: string;
    numero: string;
  };
  estado?: string;
  cidade?: string;
  biografia: string;
  foto: string;
  fotos?: string[]; // Álbum: até 6 fotos. Base64 client-side; trocar por URL quando backend estiver pronto.
  cpf?: string; // preenchido no Nível 2 (primeira compra)
  genero?: 'MASCULINO' | 'FEMININO' | 'PREFIRO_NAO_DIZER'; // preenchido sob demanda (Nível 3)
  interesses: string[];
  privacidade?: PrivacidadeConfig;
  role?: ContaVanta;
  selos?: Selo[];
  notas?: string; // nota do admin — no backend: GET/PUT /members/:id/notes
  biometriaCaptured?: boolean; // true = foto oficial capturada via câmera no onboarding
  biometriaFoto?: string; // selfie capturada no onboarding — separada da foto de perfil
  tagsCuradoria?: string[]; // tags internas privadas, visíveis SOMENTE para master
  curadoriaConcluida?: boolean; // false = ainda na fila de curadoria; true = migrou para Membros
  destaque?: boolean; // true = marcado como destaque pelo master na curadoria
  cadastradoEm?: string; // ISO 8601 -03:00 — data de cadastro do membro
  clube?: MembroClubeVanta; // dados do Clube de Influência (se membro)
}

// ── Eventos criados via painel admin ──────────────────────────────────────
export type AreaIngresso = 'VIP' | 'PISTA' | 'CAMAROTE' | 'BACKSTAGE' | 'OUTRO';
export type GeneroIngresso = 'MASCULINO' | 'FEMININO' | 'UNISEX';
export type PapelEquipeEvento =
  | 'SOCIO'
  | 'PROMOTER'
  | 'GER_PORTARIA_LISTA'
  | 'PORTARIA_LISTA'
  | 'GER_PORTARIA_ANTECIPADO'
  | 'PORTARIA_ANTECIPADO'
  | 'CAIXA'
  | 'GERENTE';

export interface VariacaoIngresso {
  id: string;
  area: AreaIngresso;
  areaCustom?: string; // preenchido quando area === 'OUTRO'
  genero: GeneroIngresso;
  valor: number; // em reais
  limite: number; // capacidade máx. desta variação — backend: campo de bilheteria
  vendidos: number; // contador por variação — backend: POST /tickets/purchase
  requerComprovante?: boolean; // exige comprovante de meia-entrada aprovado
  tipoComprovante?: string; // tipo exigido (null = qualquer tipo aceito)
}

export interface LoteAdmin {
  id: string;
  nome: string; // 'Lote 1', 'Lote 2', …
  limitTotal: number; // máx. de ingressos neste lote
  dataValidade?: string; // YYYY-MM-DD
  variacoes: VariacaoIngresso[];
  vendidos: number;
  ativo: boolean; // lote 1 começa ativo
  virarPct?: number; // ex: 80 → vira ao atingir 80% vendido (Early Bird)
}

export interface MembroEquipeEvento {
  id: string;
  nome: string;
  papel: PapelEquipeEvento;
  permissoes?: string[]; // Permissões customizadas (ex: gerente)
}

export interface SocioEvento {
  id: string;
  eventoId: string;
  socioId: string;
  splitPercentual: number;
  permissoes: string[];
  status: 'PENDENTE' | 'NEGOCIANDO' | 'ACEITO' | 'RECUSADO' | 'CANCELADO' | 'EXPIRADO';
  rodadaNegociacao: number;
  mensagemNegociacao?: string;
  motivoRejeicao?: string;
  nome?: string; // joined from profiles
}

export interface EventoAdmin {
  id: string;
  comunidadeId: string;
  foto: string; // URL — dimensões recomendadas: 1080 × 1350 px (4:5)
  nome: string;
  descricao: string;
  dataInicio: string; // ISO 8601 -03:00
  dataFim: string; // ISO 8601 -03:00
  local: string; // nome da comunidade (editável só pelo masteradm)
  endereco: string; // endereço da comunidade (editável só pelo masteradm)
  cidade: string;
  coords?: { lat: number; lng: number };
  lotes: LoteAdmin[];
  readonly equipe: MembroEquipeEvento[];
  comunidade: { id: string; nome: string; foto: string };
  criadoEm: string; // ISO 8601 -03:00
  publicado: boolean;
  caixaAtivo?: boolean; // Se true, operadores CAIXA podem vender na porta
  taxaOverride?: number; // @deprecated
  vanta_fee_percent?: number; // taxa serviço % (override evento)
  vanta_fee_fixed?: number; // taxa fixa por ingresso (legado)
  gateway_fee_mode?: 'ABSORVER' | 'REPASSAR';
  taxa_processamento_percent?: number; // gateway % (null = herda comunidade)
  taxa_porta_percent?: number; // % porta (null = herda)
  taxa_minima?: number; // mínimo por ingresso (null = herda)
  taxa_fixa_evento?: number; // custo fixo do evento (default 0)
  quem_paga_servico?: 'PRODUTOR_ABSORVE' | 'COMPRADOR_PAGA' | 'PRODUTOR_ESCOLHE';
  cota_nomes_lista?: number; // nomes grátis lista (null = herda)
  taxa_nome_excedente?: number; // R$/nome excedente (null = herda)
  cota_cortesias?: number; // cortesias grátis (null = herda)
  taxa_cortesia_excedente_pct?: number; // % cortesia excedente (null = herda)
  prazo_pagamento_dias?: number; // dias após evento pra acerto
  cortesia?: CortesiaEvento;
  cortesiasEnviadas: number; // contagem global de cortesias enviadas — paralela aos lotes, sem impacto financeiro
  criadorId?: string; // userId do produtor que criou — usado no filtro getEventosImportaveis
  motivoRejeicao?: string; // motivo preenchido pelo master ao rejeitar
  rejeicaoCampos?: Record<string, string>; // campos apontados na rejeição {campo: comentário}
  rodadaRejeicao?: number; // rodadas de rejeição (máx 3, 0=nunca rejeitado)
  criadorNome?: string; // nome do produtor/sócio criador (para exibição na fila de pendentes)
  // ── Fluxo Com Sócio / Festa da Casa ──
  tipoFluxo?: 'COM_SOCIO' | 'FESTA_DA_CASA';
  statusEvento?:
    | 'RASCUNHO'
    | 'PENDENTE'
    | 'NEGOCIANDO'
    | 'EM_REVISAO'
    | 'ATIVO'
    | 'EM_ANDAMENTO'
    | 'FINALIZADO'
    | 'CANCELADO';
  socioConvidadoId?: string; // DEPRECATED — usar socios[]
  splitProdutor?: number; // DEPRECATED — calculado: 100 - soma(socios.splitPercentual)
  splitSocio?: number; // DEPRECATED — usar socios[0].splitPercentual
  socios?: SocioEvento[]; // N socios por evento (multi-socio)
  permissoesProdutor?: string[]; // toggles aceitos pelo produtor (VER_FINANCEIRO, GERIR_LISTAS, EMITIR_CORTESIAS)
  rodadaNegociacao?: number; // contagem de rodadas de negociação sócio (máx 3, default 1 ao criar COM_SOCIO)
  mensagemNegociacao?: string; // última mensagem/justificativa da negociação (contra-proposta ou reenvio)
  formato?: string; // label do formato (ex: 'Boate / Nightclub', 'Iate / Barco')
  estilos?: string[]; // labels dos estilos selecionados (mín 1, máx 5)
  experiencias?: string[]; // labels das experiências selecionadas (mín 1, máx 5)
  /** @deprecated */ categoria?: string;
  /** @deprecated */ subcategorias?: string[];
  // ── Mesas/Camarotes ──
  mesasAtivo?: boolean; // toggle — habilita mesas para este evento
  plantaMesas?: string; // URL da imagem da planta (Supabase Storage)
  // ── Aprovação de edição ──
  edicaoPendente?: Record<string, unknown>; // snapshot JSONB das mudanças pendentes
  edicaoStatus?: 'PENDENTE' | 'APROVADA' | 'REJEITADA';
  edicaoMotivo?: string; // motivo da rejeição
  // ── Clube MAIS VANTA ──
  loteMaisVanta?: LoteMaisVanta; // @deprecated: legado — usar lotesMaisVanta
  lotesMaisVanta?: LoteMaisVanta[]; // 1 lote por tier ativado
  // ── Venda externa / afiliado ──
  vendaVanta?: boolean; // true = venda pelo VANTA; false = venda externa (default true)
  linkExterno?: string; // URL da página de ingressos externa
  plataformaExterna?: string; // Sympla, Ingresse, etc
  comissaoVanta?: number; // % de comissão do VANTA como afiliado
  codigoAfiliado?: string; // código/link de comissário
  propostaStatus?: 'ENVIADA' | 'ACEITA' | 'RECUSADA' | 'NEGOCIANDO'; // status da Proposta VANTA
  propostaRodada?: number; // rodada atual da negociação (máx 3)
  propostaMensagem?: string; // última mensagem da proposta
  // ── Recorrência ──
  recorrencia?: 'UNICO' | 'SEMANAL' | 'QUINZENAL' | 'MENSAL'; // default UNICO
  recorrenciaAte?: string; // data limite ISO (YYYY-MM-DD) — até quando gerar ocorrências
  eventoOrigemId?: string; // se é ocorrência gerada, aponta pro evento template
}

// ── Reviews de Eventos ────────────────────────────────────────────────────
export interface ReviewEvento {
  id: string;
  eventoId: string;
  userId: string;
  rating: number; // 1–5
  comentario?: string;
  criadoEm: string; // ISO 8601
}

// ── Cupons ────────────────────────────────────────────────────────────────
export interface Cupom {
  id: string;
  codigo: string;
  tipo: 'PERCENTUAL' | 'FIXO';
  valor: number; // % (ex: 10 = 10%) ou R$ (ex: 25.00)
  limiteUsos?: number; // undefined = ilimitado
  usos: number;
  eventoId?: string; // undefined = global (comunidade)
  comunidadeId?: string;
  validoAte?: string; // ISO 8601; undefined = sem validade
  ativo: boolean;
  criadoPor: string;
  criadoEm: string; // ISO 8601 -03:00
}
