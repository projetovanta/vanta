# VANTA — Documento Consolidado de Produto

## 1. O QUE É O VANTA

O VANTA é uma plataforma completa de gestão de eventos noturnos, entretenimento e vida social. Funciona simultaneamente como aplicativo nativo (App Store e Google Play) e como site acessível por navegador. A plataforma conecta três pontas: os usuários que buscam eventos e experiências, os organizadores (donos de casas noturnas, bares e produtoras) que criam e gerenciam os eventos, e as equipes operacionais (portaria, caixa, promoters) que executam o dia do evento.

O diferencial do VANTA em relação a concorrentes como Sympla e Ingresse é o modelo de curadoria: nenhum organizador publica eventos por conta própria. Toda entrada na plataforma passa por aprovação de um master admin, garantindo qualidade e alinhamento com a proposta da marca. Além disso, o VANTA integra todas as camadas da operação de um evento — da venda de ingressos online ao check-in por QR code na portaria, das listas de convidados por promoter ao controle financeiro com hierarquia de aprovação para saques e reembolsos.

A plataforma inclui ainda o MAIS VANTA, um programa de fidelidade e influência que conecta membros com alcance em redes sociais a parceiros comerciais (restaurantes, bares, academias), criando um ecossistema de benefícios exclusivos baseado em tiers de influência. O VANTA funciona como hub social também, com chat em tempo real, amizades, presença em eventos, conquistas e um feed personalizado.

---

## 2. PARA QUEM

**Usuários finais (público):**
- Jovens e adultos (18+) que frequentam eventos noturnos, festas, baladas, shows e experiências sociais
- Pessoas que querem descobrir eventos por cidade, estilo musical, localização (radar/mapa) ou recomendação personalizada
- Influenciadores digitais que desejam acesso a benefícios exclusivos via MAIS VANTA

**Organizadores:**
- Donos de casas noturnas, bares, casas de shows (espaços fixos)
- Produtoras de eventos (sem espaço fixo, eventos avulsos em locais variados)
- Co-produtores/sócios que participam de eventos com divisão de receita

**Equipe operacional:**
- Porteiros (check-in por QR code e por lista de nomes)
- Caixas (venda presencial de ingressos na porta)
- Promoters (gestão de listas de convidados e cotas)
- Gerentes de portaria (coordenação de equipes)

**Parceiros comerciais (MAIS VANTA):**
- Restaurantes, bares, academias, salões, hotéis e lojas que oferecem benefícios a membros do clube

---

## 3. FUNCIONALIDADES DO USUÁRIO

### Descoberta de eventos
- **Feed personalizado** com 8 seções: ao vivo agora, perto de você, esta semana, pra você (personalizado), novos na plataforma, salvos, destaques (VANTA Indica) e infinite scroll
- **Busca avançada** com filtros combináveis: cidade, estilo/categoria musical, horário (hoje, amanhã, semana, mês, data específica), preço máximo e benefícios MAIS VANTA
- **Busca de pessoas** por nome (tab separada)
- **Radar** — mapa interativo com geolocalização que mostra eventos próximos em tempo real
- **Landing page SEO** para cada evento (URL amigável /evento/:slug) com OG tags para compartilhamento em redes sociais

### Compra de ingressos
- **Checkout standalone** (página web, sem taxa Apple IAP) com seleção de lote, variação (área, gênero, preço), cupom de desconto, login inline
- **Meia-entrada** com upload de comprovante
- **Seleção de mesa/camarote** (quando habilitado pelo organizador)
- **Lista de espera** quando variação esgota
- Notificação em 3 canais (in-app, push, email) após compra confirmada

### Carteira digital
- **Ingressos agrupados por evento** em carrossel visual
- **QR code JWT** para cada ingresso (usado no check-in)
- **Transferência de ingresso** para amigos (aceitar/recusar, bidirecional com notificações)
- **Cortesias** — receber, aceitar, recusar ou devolver ingressos cortesia
- **Reembolso** — solicitar reembolso automático (com verificação de elegibilidade e limite mensal)
- **PIN de segurança** para proteger a carteira
- Separação entre próximos eventos e histórico de presenças

### Social
- **Amizades** — enviar pedido, aceitar, recusar, remover. Amigos mútuos visíveis
- **Chat 1:1 em tempo real** com reactions (emojis), soft delete, read receipts, indicador de online/offline
- **Presence** — ver quais amigos estão online e quais vão ao mesmo evento (social proof)
- **Perfil público** com foto, bio, cidade, conquistas, badges, comunidades seguidas, nível de prestígio, álbum de fotos

### Perfil e personalização
- Editar perfil (nome, bio, foto com crop, cidade, interesses)
- Selfie de verificação no cadastro (exibida na portaria para conferência)
- Histórico de eventos + conquistas desbloqueadas
- Níveis de prestígio (4 níveis)
- Salvar eventos favoritos
- Seguir comunidades
- Onboarding guiado pós-cadastro
- Upload de comprovante de meia-entrada (persistente)

### Comemorações
- Solicitar comemoração de aniversário ou despedida em evento ou comunidade (formulário com motivo, data, contato, Instagram)
- Acompanhar status com timeline visual (5 etapas)
- Link de vendas personalizado com tracking em tempo real
- Benefícios escalonados por número de vendas indicadas (cortesias automáticas)

### Eventos privados
- Solicitar uso do espaço de uma comunidade para evento corporativo/particular
- Formulário completo (empresa, formato, capacidade, atrações)
- Timeline de acompanhamento (5 etapas)

### Solicitação de parceria
- Donos de espaços/produtoras podem solicitar entrada na plataforma via wizard de 4 etapas (dados do espaço, presença digital, intenções, público-alvo + termos)

---

## 4. FUNCIONALIDADES DO ORGANIZADOR

### Gestão de comunidades
- Criar comunidade (wizard 3 etapas: identidade + taxas, localização com CEP automático, fotos com crop + produtores)
- Editar comunidade completa (nome, bio, fotos, endereço, horários, capacidade, taxas, CNPJ, gateway fee mode, cargos customizados, configuração de evento privado)
- Dois tipos: **Espaço Fixo** (local travado no endereço da comunidade) e **Produtora** (local editável por evento)
- Slug automático para URL amigável
- Habilitar/desabilitar comemorações e eventos privados
- Soft delete (desativar sem apagar)

### Criação de eventos (wizard 5 etapas)
- **Etapa 1 — Dados**: nome, descrição, foto (upload + crop), data/horário, formato, estilos musicais, experiências
- **Etapa 2 — Ingressos**: N lotes com M variações cada (área, gênero, valor, limite), virada automática por % ou data, lotes MAIS VANTA por tier
- **Etapa 3 — Listas**: regras de entrada (VIP, consumo, entrada paga), teto global, hora de corte, efeito abóbora, cotas por promoter
- **Etapa 4 — Equipe**: FESTA_DA_CASA (equipe própria) ou COM_SOCIO (convite de co-produtor com split de receita e negociação)
- **Etapa 5 — Financeiro**: aceite de termos de serviço obrigatório
- Copiar configuração de evento anterior
- Duplicar evento existente

### Tipos de evento
- **FESTA_DA_CASA**: gerente produz sozinho com equipe própria
- **COM_SOCIO**: co-produção com até N sócios, cada um com percentual de receita e permissões próprias
- **Evento Recorrente**: semanal, quinzenal ou mensal, com geração automática de ocorrências e navegação entre datas (SerieChips)

### Negociação com sócio
- Sistema turn-based estilo chat (tela cheia com balões alternados)
- Máximo 3 rodadas de contraproposta, 48h por turno
- Aceitar = evento publicado automaticamente
- Expirado = negociação cancelada (cron horário)
- Pós-falha: produtor pode reiniciar negociação ou convidar outro sócio

### Dashboard do evento (9 sub-views)
- **Resumo**: métricas principais + contadores
- **Analytics**: gráficos Recharts (vendas/dia, acumuladas, por variação, por origem, pico de vendas)
- **Lotes**: editar preços, limites, ativar/desativar inline
- **Cupons**: CRUD completo de cupons de desconto (%, valor fixo, limite de uso, validade)
- **Pedidos**: lista de tickets vendidos com filtros, export CSV, cancelar ingresso, reenviar
- **Listas**: editar regras de lista pós-criação
- **Comemorações**: configurar faixas de benefícios, limite, deadline, datas bloqueadas
- **Duplicar**: copiar configuração para novo evento
- **Participantes**: visualização de público com drill-down interativo por origem

### Aprovação de eventos (master)
- Lista de eventos pendentes com análise campo a campo (checkbox inline)
- Aceitar, rejeitar ou solicitar edições (campos marcados ficam vermelhos + sugestão do master)
- Acordo financeiro: definir todas as taxas na aprovação (11 campos)
- Máximo 3 rodadas de correção; após 3, cancelamento automático
- Edição pendente pós-aprovação (gerente edita, master aprova/rejeita a alteração)

### Relatórios
- **Por evento**: 3 tabs (geral com gráficos pie, ingressos por variação/lote, listas com check-ins e cotas por promoter)
- **Por comunidade**: ranking de eventos, receita, check-ins
- **Master consolidado**: receita total, por comunidade, por período, ranking
- Export Excel (xlsx) para evento e comunidade

### Vanta Indica
- Cards de destaque no feed com snap magnético, textos proporcionais (cqw), guias de alinhamento
- Ações: link externo, evento, cupom, rota interna, comemorar aniversário
- Gerenciável pelo master admin com editor visual drag-and-drop

---

## 5. FUNCIONALIDADES OPERACIONAIS

### Portaria — Check-in por QR
- Scanner de câmera com decodificação JWT
- Feedback visual em 3 cores: VERDE (válido), AMARELO (atenção), VERMELHO (inválido/já usado)
- Queima automática do ingresso (status muda para USADO)
- Exibição da selfie de verificação do titular para conferência visual

### Portaria — Check-in por lista
- Busca fuzzy por nome (index GIN trigram no PostgreSQL)
- Regras com hora de corte e efeito abóbora (transição de VIP para pagante após horário)
- Corte seco (bloqueio total após horário, sem opção de pagamento)
- Modal de cobrança na entrada (dinheiro, cartão, PIX) — forma de pagamento registrada
- Offline-first: funciona sem internet, sincroniza ao reconectar

### Caixa — Venda presencial
- Seleção de lote/variação com preços
- Geração de ingresso com QR code na hora
- Modo offline com fila de sincronização

### QR Dinâmico Anti-Fraude
- Nonce renovado a cada 30 segundos (screenshot fica obsoleto)
- Watermark com relógio ao vivo (1 segundo)
- Efeito shimmer CSS sobre o QR
- Ticket ID único vinculado

### Promoter
- Dashboard próprio: ver eventos onde tem cota, cotas por regra (alocado vs usado)
- Inserir nomes um a um ou em lote
- Comissão configurável (percentual ou fixo) por cota
- Tabela de pagamentos de comissão

### Offline
- IndexedDB com 4 stores: tickets, convidados, lotes/variações, fila de sincronização
- Cache pré-evento (portaria/caixa carrega dados com internet antes do evento)
- Fila de sincronização com retry e backoff
- Hook useConnectivity para detectar online/offline
- Indicador visual de status offline

---

## 6. MAIS VANTA (Clube de Influência)

### Conceito
Programa de fidelidade baseado em influência no Instagram. Membros verificados ganham acesso a benefícios exclusivos proporcionais ao seu alcance.

### Tiers
4 níveis: BRONZE, PRATA, OURO, DIAMANTE. Cada tier desbloqueia lotes exclusivos de ingressos e benefícios crescentes.

### Fluxo do membro
1. Solicita entrada (ClubeOptInView no perfil) informando Instagram
2. Admin analisa e aprova com tier definido (perfil enriquecido com dados Instagram)
3. Membro reserva ingresso exclusivo MV em eventos (tier >= tier mínimo do lote)
4. Vai ao evento e posta no Instagram
5. Admin verifica post; se não postou, registra infração

### Infrações
- NO_SHOW (não foi ao evento) e NAO_POSTOU (não publicou no Instagram)
- Trigger automático: quando evento muda para FINALIZADO, reservas não usadas geram NO_SHOW automaticamente + bloqueio progressivo + notificação
- Lembrete 12h antes do evento via cron (cancelar se não puder ir)

### Passaporte por cidade
- Membro pode solicitar uso de benefícios em cidades específicas
- Aprovação por admin, por cidade

### Convites via link
- Master/gerente cria convite (tipo MEMBRO ou PARCEIRO, com tier e cidade)
- Token único com expiração de 7 dias, uso único
- Página standalone /convite-mv/:token com AuthModal inline

### Parceiros e Deals
- **Parceiros**: restaurantes, bares, academias, salões, hotéis, lojas (8 tipos)
- Planos: STARTER, PRO, ELITE com limite mensal de resgates
- **Deals**: ofertas tipo BARTER (troca por post) ou DESCONTO, com vagas, vigência, curadoria interna (gênero, alcance, categoria)
- **Resgates**: membro aplica, é selecionado, faz check-in via QR VIP dourado, posta, conclui
- Fluxo completo: APLICADO → SELECIONADO → CHECK_IN → PENDENTE_POST → CONCLUÍDO
- Parceiro pode sugerir deals (status RASCUNHO, trigger notifica master)

### Painel do parceiro
- Página standalone /parceiro
- Ver deals, resgates, escanear QR VIP de membros, sugerir novos deals

### Gerente por cidade
- Acesso a membros, parceiros, deals e convites da cidade

---

## 7. COMEMORAÇÃO (Aniversário VIP)

### Conceito
Membro solicita comemorar aniversário, despedida ou outra ocasião especial em um evento ou comunidade. Se aprovado, recebe link de vendas personalizado e ganha benefícios escalonados conforme vendas indicadas.

### Fluxo completo
1. **Solicitação**: botão "Comemorar aqui" na página do evento ou da comunidade (ou via card Vanta Indica na Home)
2. **Vínculo automático**: se solicitou na comunidade com data, quando gerente criar evento para aquela data, sistema vincula automaticamente
3. **Aprovação manual**: gerente ou sócio avalia e aprova/recusa. Notificações em 3 canais
4. **Link personalizado**: URL do evento com ?ref=CODIGO_NOME para rastreamento de vendas
5. **Benefício básico**: toda comemoração aprovada recebe fila exclusiva + ingresso antecipado com QR
6. **Faixas de benefícios**: configuráveis por evento (mínimo de vendas → cortesias + benefício consumo livre)
7. **Tracking ao vivo**: membro vê progresso de vendas em tempo real no perfil
8. **Cortesias automáticas**: ao atingir faixa, sistema gera ingressos cortesia; membro insere nomes dos convidados
9. **Voucher QR**: QR code para cortesia

---

## 8. FINANCEIRO

### Modelo de taxas (totalmente negociável)
| Taxa | Default | Descrição |
|---|---|---|
| Taxa de serviço (%) | Master define | Sobre ingressos vendidos no app |
| Taxa de processamento (%) | 2,5% | Gateway de pagamento, sempre do produtor |
| Taxa porta (%) | = serviço | Sobre vendas na porta (caixa + lista paga) |
| Taxa mínima (R$) | R$ 2,00 | Mínimo por ingresso no app |
| Taxa fixa evento (R$) | R$ 0 | Custo fixo independente de receita |
| Cota nomes lista | 500 | Nomes grátis na lista |
| R$/nome excedente | R$ 0,50 | Por nome acima da cota |
| Cota cortesias | 50 | Cortesias grátis |
| % cortesia excedente | 5% | Sobre valor de face da cortesia excedente |
| Prazo pagamento (dias) | Negociado | Dias após evento para acerto |

### Herança de taxas (3 níveis)
Defaults globais → Comunidade (master define) → Evento (produtor pode modificar, master aprova)

### Quem paga a taxa de serviço
3 opções: PRODUTOR_ABSORVE, COMPRADOR_PAGA, PRODUTOR_ESCOLHE

### Saque — Fluxo hierárquico
SOLICITADO (gerente) → GERENTE_APROVADO (se COM_SOCIO) → MASTER_APROVADO → PAGO
- Chave PIX: CPF, CNPJ, email ou celular
- Recusa com motivo, estorno possível

### Reembolso — Fluxo hierárquico
- **Automático** (usuário solicita): verificação de elegibilidade + limite mensal
- **Manual** (admin inicia): com motivo
- Hierarquia: SOLICITADO → sócio (se COM_SOCIO) → gerente → master → APROVADO
- Email de confirmação via Edge Function

---

## 9. INFRAESTRUTURA TÉCNICA

| Componente | Tecnologia |
|---|---|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Estado | Zustand (5 stores) |
| Backend | Supabase (PostgreSQL + Auth + Storage + Realtime + Edge Functions) |
| Deploy web | Vercel |
| App nativo | Capacitor (iOS + Android) |
| Pagamento | Stripe (checkout sessions via Edge Function) |
| Push | Firebase Cloud Messaging (FCM) |
| Email | Resend API |
| Offline | IndexedDB + fila de sincronização |
| Segurança | RLS em todas as tabelas, JWT, QR anti-fraude, security headers |
| SEO | OG tags dinâmicas via serverless |

---

## 10. NÚMEROS

| Métrica | Valor |
|---|---|
| Migrations Supabase | 137+ |
| Tabelas principais | 40+ |
| Zustand Stores | 5 |
| Tipos de notificação | 43+ |
| RPCs Supabase | 20+ |
| Edge Functions | 8+ |
| Cron jobs | 6 ativos |
| Views públicas | 9 |
| Views admin | 30+ |
| Sub-views dashboard evento | 9 |
| Wizard criar evento | 5 etapas |
| Cargos RBAC | 8 |
| Permissões granulares | 10 |
| Tiers MAIS VANTA | 4 |
| Categorias de evento | 158 |
| Canais de notificação | 3 |
| Stores offline (IndexedDB) | 4 |

---

*Documento gerado em 09/03/2026 a partir da documentação técnica modular do projeto VANTA.*
