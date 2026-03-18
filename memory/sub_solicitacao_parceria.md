# Sub-modulo: Solicitacao de Parceria

## Pertence a: modulo_comunidade.md
## Status: IMPLEMENTADO (wizard + notif + upload)

## Conceito
Donos de boates/produtoras que ainda nao estao no VANTA podem solicitar entrada na plataforma.
Diferencial do VANTA vs Sympla/Ingresse: CURADORIA — master decide quem entra.
Sympla/Ingresse sao self-service (qualquer um cria evento). VANTA tem aprovacao.

## Pre-requisito
- Usuario DEVE ter conta no VANTA (logado)
- So aparece pra usuarios que NAO sao gerente/master

## Acesso
- CTA no perfil do usuario (card discreto)
- Texto: "E dono de um espaco ou produtora? Faca parte da rede VANTA"
- Botao: "SOLICITAR CADASTRO"
- Condicional: so renderiza se user NAO tem cargo gerente/master em nenhuma comunidade

## Wizard 4 Steps

### Step 1 — SOBRE VOCE
- Tipo: [ ] Espaco fixo (boate/bar/casa de shows) | [ ] Produtora/Evento avulso
- Nome do espaco/marca
- Cidade
- Categoria (boate, bar, casa de shows, festival, pool party, etc)
- Capacidade media
- Tempo de mercado (opcoes: <1 ano, 1-3 anos, 3-5 anos, 5+ anos)

### Step 2 — PRESENCA DIGITAL
- Instagram (@) — obrigatorio
- Site (opcional)
- Fotos do espaco/eventos anteriores (upload, ate 5)
- Link Google Maps (opcional)

### Step 3 — INTENCAO (multi-select)
- [ ] Vitrine (so mostrar eventos no app)
- [ ] Vender ingressos pelo VANTA
- [ ] Usar listas de convidados
- [ ] Operar equipe (portaria/caixa)
- [ ] Clube MAIS VANTA (beneficios)
Cada opcao com breve descricao do que oferece

### Step 4 — PUBLICO + TERMOS
- Publico-alvo: faixa etaria (multi-select: 18-21, 21-25, 25-30, 30+)
- Estilos musicais (multi-select das opcoes existentes)
- Frequencia de eventos (semanal, quinzenal, mensal, pontual)
- Media de publico por evento (opcoes: <100, 100-500, 500-1000, 1000-5000, 5000+)
- [x] Checkbox obrigatorio: "Li e aceito os Termos de Parceria VANTA"
- Link abre pagina com texto dos termos

## Termos de Parceria (texto provisorio, ajustar com advogado)
Clausulas obrigatorias:
1. Solicitacao NAO garante aprovacao
2. Veracidade das informacoes (dados falsos = exclusao)
3. VANTA = intermediador, NAO organizador dos eventos
4. Responsabilidade do organizador: preco, qualidade, entrega, reembolso, lei
5. Autorizacao uso de marca/imagem no app
6. LGPD: dados tratados conforme lei brasileira
7. Taxas/condicoes comerciais definidas apos aprovacao
8. VANTA pode encerrar parceria a qualquer momento
9. Foro da comarca de [cidade]
Ref: Sympla, Ingresse e Eventbrite usam modelo similar

## Tabela: solicitacoes_parceria
```sql
id UUID PK DEFAULT gen_random_uuid()
user_id UUID NOT NULL REFERENCES profiles(id)
tipo TEXT NOT NULL -- 'ESPACO_FIXO' | 'PRODUTORA'
nome TEXT NOT NULL
cidade TEXT NOT NULL
categoria TEXT NOT NULL
capacidade_media TEXT
tempo_mercado TEXT
instagram TEXT NOT NULL
email_contato TEXT
telefone TEXT
site TEXT
fotos TEXT[] -- URLs no storage
google_maps TEXT
intencoes TEXT[] NOT NULL -- array de intencoes selecionadas
publico_alvo TEXT[] -- faixas etarias
estilos TEXT[]
frequencia TEXT
media_publico TEXT
aceite_termos BOOLEAN NOT NULL DEFAULT false
aceite_termos_em TIMESTAMPTZ
status TEXT NOT NULL DEFAULT 'PENDENTE' -- PENDENTE | APROVADA | REJEITADA
motivo_rejeicao TEXT
analisado_por UUID REFERENCES profiles(id)
analisado_em TIMESTAMPTZ
comunidade_criada_id UUID REFERENCES comunidades(id) -- preenchido apos aprovacao
criado_em TIMESTAMPTZ DEFAULT now()
```

## Coluna nova em comunidades
```sql
tipo_comunidade TEXT DEFAULT 'ESPACO_FIXO' -- 'ESPACO_FIXO' | 'PRODUTORA'
```
- ESPACO_FIXO: local do evento = endereco da comunidade (travado no Step1Evento)
- PRODUTORA: local do evento eh editavel pelo gerente (campo aberto no Step1Evento)

## Painel Master — Solicitacoes
- Nova secao no painel admin: "Solicitacoes de Parceria"
- Lista com status PENDENTE (badge com contagem)
- Ao abrir: ve dossie completo (todos os dados do wizard)
- Acoes:
  - APROVAR: master define taxas VANTA + cria comunidade com tipo_comunidade e instagram + atribui cargo GERENTE via rbacService ao solicitante + notifica
  - REJEITAR: com motivo (contato via WhatsApp se necessario)
- Notificacoes: push + in-app ao solicitante quando status muda
- Fix 16/mar: RBAC GERENTE agora e atribuido na aprovacao (antes faltava). tipo_comunidade e instagram passados pro criar().

## Onboarding pos-aprovacao
- Solicitante recebe notificacao: "Sua solicitacao foi aprovada!"
- Ao abrir o app, ve que agora tem acesso ao painel de gerente
- Wizard de onboarding guiado pra completar dados:
  - Fotos (perfil + capa da comunidade)
  - Horarios de funcionamento
  - Endereco completo (se espaco fixo)
  - Criar primeiro evento

## Impacto no Step1Evento (criarEvento)
- Hoje: campo Local esta TRAVADO (vinculado a comunidade)
- Mudanca: se comunidade.tipo_comunidade === 'PRODUTORA', campo Local eh EDITAVEL
- Campos editaveis: local (nome), endereco, cidade, coords

## Notificacoes (3 canais via notifyService)
| Evento | Destinatario | Tipo |
|---|---|---|
| Nova solicitacao enviada | Master (vanta_masteradm) | PARCERIA_NOVA |
| Solicitacao aprovada | Solicitante | PARCERIA_APROVADA |
| Solicitacao rejeitada | Solicitante | PARCERIA_REJEITADA |

## Upload de fotos
- Bucket Supabase Storage: `parceria-fotos` (publico)
- Metodo: `parceriaService.uploadFotos(files: File[])` → retorna URLs publicas
- Limite: ate 5 fotos por solicitacao
- RLS: upload autenticado, leitura publica, delete apenas dono (path user_id/)
- Migration: `20260307210000_bucket_parceria_fotos.sql`

## Arquivos criados/modificados
| Arquivo | Funcao |
|---|---|
| supabase/migrations/20260307100000_solicitacoes_parceria.sql | Migration tabela + RLS + tipo_comunidade |
| supabase/migrations/20260307210000_bucket_parceria_fotos.sql | Bucket Storage parceria-fotos + policies |
| features/admin/services/parceriaService.ts | Service CRUD + notificacoes + uploadFotos |
| features/admin/views/SolicitarParceriaView.tsx | Wizard 4 steps + upload fotos com preview |
| features/admin/views/SolicitacoesParceriaView.tsx | Painel master: lista + dossie + aprovar/rejeitar |
| features/admin/components/AdminSidebar.tsx | Item SOLICITACOES_PARCERIA na sidebar master |
| features/dashboard-v2/DashboardV2Gateway.tsx | Routing + lazy import |
| modules/profile/ProfileView.tsx | CTA "Quero ser parceiro" + subView handler |
| types/auth.ts | ProfileSubView SOLICITAR_PARCERIA + 3 tipos notificacao |
| types/supabase.ts | Regenerado com novas tabelas/colunas |
| supabase/migrations/20260314100000_onboarding_comunidade.sql | Coluna onboarding_completo em comunidades |
| features/admin/components/OnboardingWelcome.tsx | Tela boas-vindas pos-aprovacao (1x) |
| features/admin/components/OnboardingChecklist.tsx | Checklist completude comunidade no painel |
| features/admin/components/AdminDashboardHome.tsx | Integra welcome + checklist |
| features/admin/views/criarEvento/Step1Evento.tsx | Campos local editaveis se PRODUTORA |
| features/admin/views/CriarEventoView.tsx | States localNome/localEndereco/localCidade |
| features/admin/views/EditarEventoView.tsx | Mesma logica local editavel |
| types/eventos.ts | tipo_comunidade + onboarding_completo no type Comunidade |

## Checklist
| # | Item | Status |
|---|---|---|
| 1 | Tabela solicitacoes_parceria | OK |
| 2 | Coluna tipo_comunidade em comunidades | OK |
| 3 | RLS policies | OK |
| 4 | Service (parceriaService.ts) | OK |
| 5 | Wizard 4 steps (frontend) | OK |
| 6 | CTA no perfil do usuario | OK |
| 7 | Painel master — lista solicitacoes | OK |
| 8 | Painel master — dossie + aprovar/rejeitar | OK |
| 9 | Sidebar + routing admin | OK |
| 10 | Termos inline no Step 4 | OK |
| 11 | Notificacoes (3 canais) | OK — nova→master, aprovada/rejeitada→solicitante |
| 12 | Upload fotos no wizard | OK — bucket parceria-fotos, ate 5 fotos, preview + remocao |
| 13 | Step1Evento: local editavel se PRODUTORA | OK — campos Local/Endereco/Cidade editaveis quando tipo_comunidade=PRODUTORA, em CriarEventoView e EditarEventoView |
| 14 | Onboarding pos-aprovacao | OK — tela boas-vindas (1x, localStorage) + checklist no painel (foto, capa, endereco, horarios, 1o evento). Auto-marca onboarding_completo=true |
| 15 | Aprovar -> criar comunidade com taxas | OK — painel de taxas VANTA (10 campos), cria comunidade + define taxas + aprova + notifica. Foto fullscreen com zoom 2x |
