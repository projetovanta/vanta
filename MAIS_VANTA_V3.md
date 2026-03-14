# MAIS VANTA — SISTEMA COMPLETO v3

> Documento de produto — todas as decisões, explicadas em detalhe
> Versão 3.0 | Março 2026

---

## 1. O QUE É O MAIS VANTA

O MAIS VANTA é o clube exclusivo do app VANTA. Pensa nele como um intermediário inteligente entre quem faz eventos, estabelecimentos parceiros, e pessoas que agregam valor — seja pela beleza, pelas conexões sociais, ou pela capacidade de gerar conteúdo e visibilidade.

O clube funciona como uma camada silenciosa sobre eventos e estabelecimentos. O membro nunca sabe em qual nível está classificado, nunca sabe o que outros membros recebem, e nunca é "rejeitado" — todo mundo que solicita acesso é aprovado em algum nível.

Existem 5 personagens nesse sistema:

**O Vanta (Curadoria)** é quem manda. Recebe as solicitações de acesso, analisa o perfil de cada pessoa (principalmente pelo Instagram), e classifica em um nível interno. O Vanta é o único que sabe o nível de cada membro. Quando um produtor de evento ou parceiro quer atrair membros do clube, o Vanta decide quem vai — ninguém escolhe pessoas, só escolhe perfis.

**O Produtor** é o dono do evento (balada, festa, show, etc). Ele paga uma mensalidade pro Vanta pra ter acesso ao clube. Em troca, pode configurar benefícios no evento dele pra diferentes perfis de membros — por exemplo, "quero 30 mulheres bonitas com entrada VIP gratuita e 5 influencers com camarote". Mas ele nunca sabe quem são essas pessoas individualmente. É como contratar um promoter digital: você pede o perfil, o Vanta entrega.

**O Parceiro** é um estabelecimento fixo (restaurante, bar, salão, hotel, loja) ou marca online que oferece benefícios pros membros em troca de posts no Instagram — é barter. Diferente do produtor (que faz eventos), o parceiro oferece deals no dia a dia. O parceiro também nunca sabe quem são os membros individualmente até o check-in no local. (Ver seção 10 pra detalhes completos.)

**O Membro** é a pessoa que solicitou acesso ao clube. Pra ela, é tudo gratuito — ela nunca paga nada. O "pagamento" dela é a presença no evento (se ela foi classificada como bonita/conectada) ou o conteúdo que gera (se foi classificada como criadora de conteúdo). Ela navega pelos eventos e deals no app, vê os benefícios disponíveis pro nível dela — mas nunca sabe que aquilo é por causa do nível.

**O Sistema de Convites** é o marketing boca a boca do clube. Membros aprovados recebem uma quantidade limitada de convites (links únicos) pra compartilhar com amigos. O amigo recebe o link, que abre direto o formulário de solicitação. Mas ter sido indicado não garante aprovação — a pessoa passa pela curadoria normal como todo mundo. A ideia é criar a sensação de escassez e exclusividade: "amiga, eu tenho convite pro MAIS VANTA, quer um?"

**Princípio central:** O Vanta decide QUEM vai. O produtor/parceiro decide O QUE oferecer. O membro decide SE quer ir.

---

## 2. OS NÍVEIS DO CLUBE (TIERS)

### 2.1 O que são os tiers

Tiers são os níveis internos do clube. Cada membro recebe um tier quando é aprovado. O tier define quais benefícios essa pessoa pode ver e resgatar nos eventos.

A regra mais importante de todo o sistema: **o membro NUNCA sabe qual é o tier dele.** Nem o membro, nem o produtor, nem quem indicou. O tier é informação interna do Vanta, ponto. A única coisa que o membro percebe é o benefício que aparece (ou não) em cada evento.

### 2.2 Quais são os tiers

São 5 tiers, do mais básico ao mais exclusivo:

**Tier 0 — LISTA (slug: `lista`)**
Todo mundo que solicita acesso ao clube é aprovado em pelo menos esse nível. São pessoas sem valor claro pro evento — não são bonitas a ponto de elevar o ambiente, não são conectadas, não são influencers. Mas elas querem se sentir especiais. O produtor pode usar esse tier pra encher o evento sem fazer promoção pública que desvalorize a marca. Exemplo de benefício: "seu nome na lista — pague R$30 até 23h" ou "10% de desconto no ingresso". A pessoa se sente VIP, mas na prática o produtor não perdeu nada.

Quando o benefício é um desconto no ingresso, ele aparece de forma silenciosa — o preço simplesmente é menor pra essa pessoa. Não aparece nenhum selo "MAIS VANTA" ou "benefício do clube". A pessoa nem percebe que é por causa do clube.

Quando o benefício é nome na lista, aí sim aparece como benefício do MAIS VANTA (a pessoa vê o card, resgata, etc).

**Tier 1 — PRESENÇA (slug: `presenca`)**
Essa pessoa é bonita. Agrega visualmente ao evento. Tem fotos boas no Instagram, se veste bem, frequenta lugares bonitos. A presença dela eleva o ambiente. Exemplo: modelos, pessoas com estilo marcante, gente que você olha e pensa "essa pessoa combina com esse evento".

Benefício típico: lista VIP gratuita, ingresso cortesia, acesso a área exclusiva.

**Tier 2 — SOCIAL (slug: `social`)**
Essa pessoa é bem conectada. Conhece gente, frequenta os lugares certos, traz o grupo dela junto. Ela agrega no social do evento — não necessariamente pela beleza, mas pela rede de contatos. Exemplo: socialites, promoters naturais, gente que todo mundo conhece na cena noturna.

A diferença entre PRESENÇA e SOCIAL: a PRESENÇA é bonita e ponto, o SOCIAL é bem relacionado e traz grupo. Uma pessoa pode ser os dois, mas o curador classifica pelo que mais se destaca.

Benefício típico: similar ao PRESENÇA — lista VIP, ingresso, acesso exclusivo.

**Tier 3 — CREATOR (slug: `creator`)**
Criador de conteúdo com alcance real. Essa pessoa vai ao evento e gera mídia — posts, stories, reels, vídeos. O valor dela pro produtor é a visibilidade que gera.

CREATOR tem 3 sub-níveis baseados no número de seguidores no Instagram:

- **Creator 200K (slug: `creator_200k`)**: entre 200 mil e 499 mil seguidores
- **Creator 500K (slug: `creator_500k`)**: entre 500 mil e 999 mil seguidores
- **Creator 1M (slug: `creator_1m`)**: 1 milhão ou mais de seguidores

A lógica dos sub-níveis: o produtor pode escolher a partir de qual faixa quer liberar benefício. Exemplo: "quero só creators acima de 500K no meu evento" — nesse caso, um creator com 200K não vê o benefício desse evento.

Importante: uma menina bonita que cria conteúdo mas tem poucos seguidores NÃO é CREATOR — é PRESENÇA. CREATOR é especificamente sobre alcance e capacidade de gerar visibilidade em escala.

Benefício típico: camarote VIP, open bar, ingresso premium. E tem obrigação: postar sobre o evento com @maisvanta e @ do evento.

**Tier 4 — BLACK (slug: `black`)**
O nível mais alto. Celebridades, artistas famosos, pessoas muito influentes. Gente com mais de 1 milhão de seguidores, ou que todo mundo conhece mesmo sem Instagram. A presença dessa pessoa no evento é um acontecimento.

BLACK é diferente de todos os outros tiers:
- BLACK nunca solicita acesso — o Vanta vai até ele e convida
- BLACK nunca preenche formulário
- O curador do Vanta adiciona manualmente
- O tratamento é VIP direto, gerenciado pessoalmente pela curadoria

Benefício típico: tudo que o Vanta negociar diretamente. Sem configuração automática.

### 2.3 Regras dos tiers que nunca mudam

- Todo mundo que solicita é aprovado em pelo menos LISTA (tier 0). Não existe rejeição
- Quando alguém é aprovado, recebe a mesma notificação independente do tier: "Você foi aprovado no MAIS VANTA!" — do tier 0 ao BLACK, a mensagem é igual. O que diferencia é o benefício que aparece em cada evento
- O tier pode mudar com o tempo. O Instagram é verificado periodicamente pelo sistema. Se uma pessoa crescer (ganhar seguidores, virar influencer), o curador pode promover ela pra um tier mais alto. Beleza é mais estável, influência muda rápido

---

## 3. COMO FUNCIONA A CURADORIA

### 3.1 Quem faz a curadoria

No lançamento, o Dan (dono do Vanta) centraliza toda a curadoria sozinho. Num futuro próximo, delega pra 1-2 pessoas do time. O sistema precisa estar preparado pra esse crescimento.

O volume esperado é de 100 a 500 solicitações por semana quando o app crescer. Por isso, as solicitações não podem chegar numa fila bagunçada — precisam chegar "mastigadas".

### 3.2 O que o membro preenche pra solicitar acesso

O formulário de solicitação tem 5 campos:

**Instagram (@)** — obrigatório. É a principal fonte de avaliação. O curador vai abrir o perfil e analisar: a pessoa é bonita? Se veste bem? Frequenta lugares legais? Conhece gente interessante? Tem seguidores? Cria conteúdo?

**Profissão / O que você faz** — obrigatório. Dá contexto sobre quem é a pessoa. "Modelo", "advogada", "digital influencer", "estudante", etc.

**Como conheceu o VANTA** — obrigatório. Serve pra entender de onde a pessoa veio. Marketing, indicação orgânica, redes sociais, etc.

**Cidade** — obrigatório. Define em qual cidade a pessoa terá acesso aos benefícios. O MAIS VANTA opera por cidades (ver seção 9).

**Aceite dos termos** — obrigatório. Checkbox legal.

O formulário NÃO pede foto (o Instagram resolve) e NÃO tem campo de indicação (quem veio indicado chega pelo link de convite, não por campo manual).

Se a pessoa chegou pelo link de convite de um amigo, esse link já abre direto o formulário e o sistema registra automaticamente quem indicou.

### 3.3 Como as solicitações chegam "mastigadas"

Quando o curador abre o painel de curadoria, ele NÃO vê uma fila de 300 pessoas em ordem de chegada. Ele vê as solicitações separadas em "baldes" automáticos, pré-classificadas pelo sistema:

**Balde "Provável CREATOR"** — pessoas com 200K+ seguidores, perfil público, que postam conteúdo regularmente. O curador só precisa confirmar o tier e escolher o sub-nível (200K, 500K ou 1M).

**Balde "Provável PRESENÇA"** — perfil visual forte, fotos bonitas, estilo de vida lifestyle. O curador confirma ou reclassifica.

**Balde "Provável SOCIAL"** — pessoa que segue e é seguida por vários membros já existentes do clube, frequenta eventos. O curador confirma ou reclassifica.

**Balde "Sem fit claro"** — perfil fechado, poucos seguidores, sem conexões visíveis com outros membros. Provavelmente vai pro LISTA (tier 0). O curador avalia manualmente.

**Balde "Indicado por tier alto"** — pessoa que chegou via convite de alguém que é CREATOR ou BLACK. Aparece destacado pra o curador priorizar a revisão.

### 3.4 O que o curador vê ao abrir uma solicitação

Cada solicitação mostra:
- Foto (puxada do Instagram), nome, profissão, cidade
- Link direto pro Instagram (abre no navegador)
- **Número de seguidores no Instagram** — visível direto na lista, sem precisar abrir o perfil
- Se veio por convite: quem indicou (sem mostrar o tier de quem indicou)
- Data da solicitação
- Balde sugerido pelo sistema

Ao clicar pra avaliar, o curador vê:
- Todos os dados que a pessoa preencheu
- **Número de seguidores no Instagram** (atualizado periodicamente pelo sistema)
- Um campo pra escolher o **Tier** (dropdown: LISTA / PRESENÇA / SOCIAL / CREATOR / BLACK)
- Se escolheu CREATOR: campo pra escolher o **Sub-nível** (200K / 500K / 1M)
- Campo pra marcar **Tags** (etiquetas internas — ver seção 3.6)
- Campo pra escrever **Nota interna** (texto livre, nunca visível ao membro)
- Três botões: **APROVAR**, **ADIAR** e nada mais

Não existe botão REJEITAR. Todo mundo é aprovado — a questão é em qual tier. ADIAR é pra quando o curador quer olhar com mais calma depois — a solicitação sai da fila principal e vai pra uma aba separada de "Adiados".

### 3.5 O que fazer quando o Instagram é fechado

Quando o perfil é fechado, o curador não consegue avaliar a pessoa direito. Nesses casos, o curador decide caso a caso qual abordagem usar:

**Opção A:** Pedir que a pessoa siga @maisvanta no Instagram pra que a curadoria possa ver o perfil

**Opção B:** Pedir que a pessoa abra o perfil temporariamente (por 48h)

O curador escolhe qual opção aplicar pra cada pessoa. Não é uma regra automática — é decisão caso a caso.

### 3.6 Tags internas

Tags são etiquetas que o curador coloca em cada membro pra classificação interna. O membro NUNCA vê essas tags. Servem pra filtragem e organização.

Categorias de tags:

**Sobre influência:** influ_200k (200K-500K seguidores), influ_500k (500K-1M), influ_1m (1M+), engajamento_alto (taxa de engajamento acima de 5%), engajamento_baixo (taxa abaixo de 0.5%)

**Sobre o perfil:** modelo, atriz, dj, chef, moda, fitness, midiática, celebridade_local, celebridade_nacional

**Sobre rede/indicação:** indicada_black (veio indicada por alguém BLACK), indicada_creator, indicada_social, indicada_presenca, orgânica (veio sozinha), rede_forte (conhece 5 ou mais membros ativos)

**Sobre comportamento:** posta_bem, nao_posta, cumpre_obrigacao, deveu_post, frequente, sumiu

**Sobre risco:** risco_comportamento, risco_imagem, observação

**Sobre fit com o clube:** sem_fit, fit_alto, fit_medio

### 3.7 Reavaliação de tier

O tier não é definitivo. Três formas de mudar:

1. **Automática:** o sistema verifica o Instagram periodicamente. Se a pessoa cresceu muito em seguidores, o curador é notificado pra reavaliar
2. **Espontânea:** o curador percebe que alguém merece subir e promove por conta própria
3. **Por atividade:** se a pessoa está muito ativa no app, comparecendo a eventos, resgatando benefícios, o sistema pode sinalizar pro curador

---

## 4. SISTEMA DE CONVITES (INDICAÇÃO)

### 4.1 O que é e como funciona

Todo membro aprovado recebe uma quantidade limitada de convites. Cada convite é um link único que o membro pode compartilhar com amigos. Quando o amigo clica no link, cai direto no formulário de solicitação do MAIS VANTA.

A ideia é criar marketing gratuito e orgânico pro clube. A dinâmica é tipo: "amiga, eu tenho convite pro MAIS VANTA, quer um? Peguei VIP pra festa de sábado lá". Isso cria a sensação de exclusividade, escassez e acesso privilegiado.

Mas ter sido indicado NÃO garante aprovação. A pessoa passa pela curadoria normal. O convite só facilita o acesso ao formulário e aparece destacado na fila do curador.

### 4.2 Quantos convites cada membro recebe

A quantidade de convites varia por tier, e é totalmente configurável pelo Dan no painel admin — ele pode mudar os números a qualquer momento sem precisar de código.

Exemplo de configuração inicial:

- LISTA: 1 convite
- PRESENÇA: 3 convites
- SOCIAL: 5 convites
- CREATOR: 7 convites
- BLACK: 10 convites

### 4.3 Convites se renovam por engajamento

Os convites não renovam por tempo — renovam por uso real do app. Se o membro resgatou um benefício E compareceu ao evento (fez check-in), ganha +1 convite. Isso recompensa engajamento real, não passividade.

### 4.4 O que acontece quando alguém usa o convite

Quando o amigo usa o link de convite e solicita acesso:
- Na fila de curadoria, ele aparece destacado: "Indicado por Fulana (membro ativo)"
- O curador NÃO vê o tier de quem indicou — só que é membro ativo
- Isso ajuda a priorizar a revisão, mas não aprova automaticamente

### 4.5 O membro que indicou fica sabendo?

Sim. Quando o indicado é aprovado, quem indicou recebe uma notificação: "Sua amiga foi aprovada no MAIS VANTA!" — mas NUNCA revela o tier do indicado. O membro também pode ver quantos convites usou: "2 de 3 convites usados".

---

## 5. O QUE O PRODUTOR FAZ

### 5.1 Planos e mensalidade

O produtor paga uma mensalidade fixa pro Vanta pra ter acesso ao MAIS VANTA. É como contratar um promoter digital — ele paga pelo serviço de atrair pessoas de qualidade pro evento dele.

Os planos são 100% configuráveis pelo Dan no painel admin. Ele pode criar, editar e deletar planos a qualquer momento, sem mexer em código. Cada plano define:

- Nome do plano (ex: "Básico", "Pro", "Premium", ou personalizado tipo "Plano Bosque Bar")
- Preço mensal
- Quantos eventos por mês o produtor pode usar o MAIS VANTA
- Quantos resgates por evento (quantos membros podem pegar benefício)
- Quais perfis de membros o produtor acessa (ex: plano básico só acessa LISTA e PRESENÇA, plano premium acessa até CREATOR)
- Quantas notificações/convites o produtor pode pedir ao Vanta por mês
- Preço de extras: se o produtor quiser mais eventos, mais notificações, etc além do plano, paga por unidade

Dan pode criar planos genéricos que valem pra todo mundo, ou planos personalizados negociados diretamente com um produtor específico.

### 5.2 Como o produtor ativa o MAIS VANTA num evento

Na tela de criação ou edição do evento, o produtor vê um toggle: "ATIVAR MAIS VANTA NESTE EVENTO". Quando ativa, abre uma seção pra configurar os benefícios.

Se é a primeira vez que o produtor ativa o MAIS VANTA, ele passa por um tutorial rápido que explica o que é cada perfil de membro, com exemplos reais.

### 5.3 Como o produtor configura os benefícios

O produtor vê os perfis de membros em linguagem simples (nunca os nomes internos dos tiers). Cada perfil tem uma descrição e exemplos pra ele entender exatamente quem está liberando:

**Público geral** — "Pessoas que recebem promoções e ofertas do evento. Ex: público que quer se sentir especial com desconto." O produtor pode dar desconto no ingresso ou colocar o nome na lista com um preço. Ele define o percentual de desconto ou qual lista usar, e o limite de vagas.

**Presença visual** — "Pessoas que elevam o ambiente visualmente. Ex: modelos, pessoas com estilo marcante." O produtor pode dar ingresso gratuito ou colocar na lista VIP. Ele escolhe qual lote de ingresso ou qual lista, e o limite de vagas.

**Conexão social** — "Pessoas bem relacionadas que trazem grupo e circulam nos lugares certos. Ex: socialites, promoters naturais." Mesma lógica de ingresso ou lista, com limite de vagas.

**Criadores de conteúdo** — "Influencers que vão gerar visibilidade pro evento. Ex: influencers, youtubers, tiktokers." Aqui o produtor escolhe a partir de qual sub-nível quer liberar: "A partir de 200K+ seguidores", "A partir de 500K+" ou "A partir de 1M+". Depois escolhe o benefício (ingresso ou lista) e o limite de vagas.

**Perfil premium** — "Celebridades e artistas — contato direto via curadoria Vanta." Esse o produtor não configura. É gerenciado diretamente pelo Vanta.

### 5.4 Limite de vagas — como funciona quando acaba

O produtor define um limite de segurança pra cada perfil (ex: 100 vagas pra PRESENÇA). Quando todas as vagas são resgatadas, o membro que chegar depois vê: "Vagas esgotadas". Nessa tela ele tem duas opções:

1. **Entrar na lista de espera** — se alguém desistir, o próximo da fila é notificado
2. **Comprar ingresso normal** — pode comprar pelo preço cheio ali mesmo

### 5.5 O que o produtor NÃO vê e NÃO faz

Isso é muito importante:

- O produtor **NUNCA vê nomes** de membros MAIS VANTA individualmente. Ele não sabe que "Maria Silva" vai no evento dele
- O produtor **NUNCA vê tiers** internos. Ele não sabe que "Presença visual" = tier 1
- O produtor **NUNCA escolhe pessoas** — ele escolhe PERFIS (tipos de pessoas), e o Vanta decide quem são essas pessoas
- O produtor **NUNCA manda convite direto** pra membros — se quiser que membros sejam notificados, pede ao Vanta
- Após o evento, o produtor vê um relatório com **números agregados** (quantos resgataram, quantos foram, quantos postaram), nunca dados individuais

### 5.6 Notificações pra membros — como o produtor pede

Os benefícios aparecem automaticamente na página do evento pra quem é elegível — sem nenhuma notificação. O membro descobre navegando.

Mas se o produtor quiser que os membros sejam notificados ativamente (push, email, dentro do app), ele precisa pedir autorização ao Vanta. A quantidade de notificações que ele pode pedir é definida pelo plano dele. Se exceder o limite, paga o valor extra configurado no plano.

O produtor nunca manda a notificação direto — ele pede, o Vanta decide se envia e pra quem.

---

## 6. CONVITE ESPECIAL DO VANTA

### 6.1 O que é

Além dos benefícios que aparecem automaticamente nos eventos, o Vanta pode CONVIDAR membros específicos pra eventos específicos. Isso é um "empurrão" — o benefício já estava disponível na página do evento, mas o convite garante que o membro veja e se sinta especial.

### 6.2 Como funciona na prática

O Vanta (Dan ou alguém do time) acessa o painel admin e seleciona membros pra convidar. Pode selecionar individualmente (uma pessoa específica) ou por filtro (ex: "todas as PRESENÇA da cidade do Rio de Janeiro" ou "todos os CREATOR 500K+ com tag fit_alto").

O membro selecionado recebe uma notificação (push no celular + email + dentro do app). Ao clicar, vê algo como: "Você foi convidado para o evento Bosque Domingo. Seu benefício: VIP feminino até 22h — entrada gratuita. Vamos?" E aí decide se quer resgatar ou não.

### 6.3 Quem pode fazer isso

Só o Vanta. O produtor pode pedir que o Vanta envie convites (e isso consome o limite do plano dele), mas quem decide se envia e pra quem é sempre o Vanta.

---

## 7. O QUE O MEMBRO VÊ E FAZ

### 7.1 Solicitando acesso ao clube

O membro acessa o app e vai em: Perfil → card "MAIS VANTA" → Solicitar acesso. Preenche o formulário (Instagram, profissão, como conheceu, cidade), aceita os termos, e envia. A tela mostra: "Sua solicitação está em análise. Você será notificado."

Se o membro chegou por link de convite de um amigo, o link abre direto o formulário — não precisa navegar até o perfil.

### 7.2 Sendo aprovado

Todo mundo é aprovado (pelo menos em LISTA). Quando o curador aprova, o membro recebe uma notificação: "Você foi aprovado no MAIS VANTA!" — a mesma mensagem pra todo mundo, do tier 0 ao BLACK. A partir daí, ao navegar pelos eventos, os benefícios vão aparecer conforme o tier (mas ele nunca sabe que é por causa do tier).

### 7.3 Descobrindo benefícios nos eventos

O membro aprovado tem uma área dentro do app pra ver os benefícios disponíveis. Mas a forma principal de descobrir é navegando: quando abre a página de um evento que tem MAIS VANTA ativo e o tier dele está configurado naquele evento, aparece um card tipo:

"SEU BENEFÍCIO MAIS VANTA — VIP feminino, entrada gratuita até 22h. Ao resgatar, você se compromete a comparecer ao evento. Vagas restantes: 12. [RESGATAR MEU BENEFÍCIO]"

Se o membro é CREATOR, aparece também a obrigação de post: "Publicar post com @maisvanta @evento #Publi em até 24h".

A obrigação SEMPRE aparece antes do clique em resgatar. Nunca tem surpresa depois.

### 7.4 Quando o benefício não aparece

Existem situações em que o membro não vê nada:

- Se o tier dele não está configurado naquele evento (o produtor não ativou aquele perfil)
- Se o membro ainda não foi aprovado (está pendente)
- Se as vagas daquele perfil já acabaram — nesse caso, vê "Vagas esgotadas" com opção de lista de espera ou comprar ingresso normal

E quando o tier é LISTA com desconto, o benefício é silencioso — o preço do ingresso simplesmente aparece menor, sem nenhum selo ou card do MAIS VANTA. A pessoa nem percebe que é do clube.

### 7.5 Depois de resgatar

O membro recebe uma confirmação com o resumo do benefício e da obrigação. No dia do evento, faz check-in na portaria normalmente — e o check-in encerra automaticamente a obrigação de presença.

Se é CREATOR, depois do evento precisa enviar o link do post pelo app. O curador valida se está dentro das regras (marcações corretas, prazo, etc).

### 7.6 Consequências de não ir ou não postar

Já definido no sistema existente. Faltas e posts não enviados geram registro interno (o membro não vê) e podem impactar benefícios futuros — tipo perder acesso temporariamente ou ser rebaixado de tier.

---

## 8. RELATÓRIO PÓS-EVENTO PRO PRODUTOR

Depois que o evento acontece, o produtor vê uma seção "MAIS VANTA" no relatório do evento dele. Mostra números agregados:

- Quantos benefícios foram resgatados (ex: 47)
- Quantos resgataram e compareceram (ex: 41 de 47 — 87%)
- Quantos posts foram enviados pelos creators (ex: 23 de 23 — 100%)
- Quantos posts foram verificados como válidos (ex: 21 de 23 — 91%)
- Alcance estimado dos posts (ex: ~124.000 pessoas)
- Opção de avaliar: "esse resultado foi eficiente?" ou "foi ineficiente?"

Isso ajuda o produtor a decidir se vale continuar usando o MAIS VANTA nos próximos eventos. Ele nunca vê nomes ou tiers — só números.

---

## 9. CIDADES E EXPANSÃO

### 9.1 Como funciona

O MAIS VANTA opera por cidades. Quando o membro solicita acesso ao clube, informa a cidade dele. Ele ganha acesso aos eventos daquela cidade.

O Vanta pode adicionar novas cidades a qualquer momento pelo painel admin, sem código.

### 9.2 O tier vale em todo lugar

Se a pessoa é CREATOR no Rio, é CREATOR em São Paulo também. O tier é global — não muda por cidade.

### 9.3 Acesso a novas cidades — estilo The Secret Society

TODOS os tiers — do LISTA ao BLACK — precisam solicitar acesso a cada cidade individualmente. Ninguém tem acesso automático. Funciona como o app The Secret Society: quando uma cidade nova é lançada, aparece uma notificação pra todos os membros: "SP ficou disponível! Quer ativar?" O membro clica, confirma, e pronto — sem passar por curadoria de novo, é só uma confirmação simples.

A ideia é que o acesso à cidade é uma decisão ativa do membro, não automática. Isso cria engajamento (o membro precisa "querer" estar naquela cidade) e permite ao Vanta medir o interesse real em cada praça antes de investir.

### 9.4 Como a expansão funciona na prática

Imagina que o app começa só no Rio. Um membro do Rio viaja pra São Paulo e quer usar o clube lá. Mas São Paulo ainda não está no MAIS VANTA. Quando o Vanta decidir lançar São Paulo, todos os membros — de qualquer tier — recebem: "Nova cidade disponível!" e podem solicitar acesso.

Isso permite crescimento controlado — o Vanta escolhe quando e onde expandir, e os membros escolhem onde querem estar ativos.

---

## 10. PARCEIROS & DEALS

### 10.1 O que são parceiros

Parceiros são estabelecimentos físicos (restaurantes, bares, salões, hotéis, lojas) ou marcas online que oferecem benefícios pros membros do MAIS VANTA em troca de posts no Instagram. É um sistema de barter: o parceiro dá algo de valor (refeição, serviço, experiência), o membro dá visibilidade (post no Instagram).

Parceiros são completamente separados de produtores de eventos. Produtor = faz eventos. Parceiro = estabelecimento fixo que oferece deals no dia a dia, sem evento. São coisas diferentes com sistemas diferentes.

Tudo que é relacionado a parceiros e deals é 100% interno do MAIS VANTA. Quem não é membro do clube nem sabe que existe.

### 10.2 Como o parceiro entra no ecossistema

Existem dois caminhos:

**Caminho A — O Vanta prospecta.** O Dan identifica um estabelecimento interessante, negocia diretamente, e cadastra o parceiro no painel admin com os dados negociados. O parceiro entra direto como APROVADO, sem formulário.

**Caminho B — O estabelecimento solicita.** O estabelecimento descobre o MAIS VANTA e preenche um formulário de solicitação de parceria. O Dan analisa e decide se aprova, adia ou encerra.

O formulário de solicitação do parceiro tem:
- Nome do estabelecimento
- Categoria (GASTRONOMIA / BELEZA & BEM-ESTAR / ENTRETENIMENTO / MODA & LIFESTYLE / OUTRO)
- Endereço + cidade
- Instagram @
- Descrição curta do estabelecimento
- Contato responsável (nome, telefone, email)
- Proposta de deal inicial ("o que você gostaria de oferecer?")
- Aceite dos termos de parceria

### 10.3 Ciclo de vida do parceiro

O parceiro passa por 5 status:

**PENDENTE** — solicitou parceria e está aguardando análise do Vanta. Ou o Vanta está prospectando e ainda não fechou.

**APROVADO** — curadoria analisou e aprovou a parceria. Ainda não tem deal ativo, mas pode criar.

**ATIVO** — tem pelo menos 1 deal rodando. Está operando normalmente.

**INATIVO** — sem deal ativo no momento, mas a parceria continua existindo. Pode voltar a ATIVO quando criar um deal novo.

**ENCERRADO** — parceria finalizada. Não volta mais.

O Dan pode pausar um parceiro inteiro a qualquer momento — quando pausa, os deals do parceiro somem do feed dos membros, mas resgates já feitos continuam válidos. O membro que já resgatou mantém o direito de usar.

### 10.4 Monetização — como o Vanta ganha com parceiros

A monetização é caso a caso. Quando o Dan aprova ou convida um parceiro, ele define como o Vanta vai ganhar naquela parceria específica. Três opções disponíveis:

**Mensalidade fixa** — o parceiro paga um valor mensal pro Vanta. Ex: R$500/mês pelo acesso aos membros do clube.

**Comissão por resgate** — o parceiro paga um valor por cada membro que resgatar um deal. Ex: R$10 por resgate.

**Gratuito / troca estratégica** — o parceiro não paga nada. A parceria é estratégica — o Vanta ganha visibilidade, o parceiro ganha mídia. Útil pra parceiros de alto valor que dão credibilidade ao clube.

O Dan pode criar planos pré-definidos pra facilitar (ex: "Parceiro Básico: gratuito", "Parceiro Pro: R$500/mês + R$5/resgate") E condições personalizadas caso a caso. Mesma lógica dos planos do produtor — planos genéricos + personalização.

### 10.5 O que é um deal

Deal é o benefício que o parceiro oferece pro membro. Todo deal é BARTER — troca. O membro recebe algo de valor e em troca posta no Instagram. Não existe deal de desconto puro sem obrigação de post. Se o parceiro quer dar desconto sem contrapartida, ele faz isso sozinho — não precisa do MAIS VANTA pra isso.

Cada deal define:
- **O que o membro ganha** (ex: "jantar pra 2 no restaurante", "sessão de beleza completa", "1 peça da nova coleção")
- **A obrigação de post** — configurável por deal: quantos stories, quantos posts no feed, quais marcações (@maisvanta + @parceiro), hashtags, prazo pra postar. Cada deal pode ter regra diferente
- **Tier mínimo** — a partir de qual perfil o membro pode ver e resgatar. Usa a mesma linguagem de perfis do produtor de evento ("público geral", "presença visual", "criadores de conteúdo", etc). O parceiro nunca vê os nomes internos dos tiers
- **Sub-nível de creator** — se o deal é pra creators, a partir de qual faixa (200K+ / 500K+ / 1M+)
- **Prazo de validade** — definido ao criar o deal (ex: "válido por 7 dias após resgate" ou "válido até 30/03"). Cada deal pode ter prazo diferente
- **Limite de vagas** — configurável: com limite (ex: 10 vagas) OU ilimitado. O parceiro/Vanta decide ao criar
- **Cidade** — deal de estabelecimento físico é vinculado à cidade do parceiro. Deal de parceiro online pode ser nacional (sem cidade)

Cada deal é único. Não tem recorrência automática. Quando acaba, cria outro se quiser.

### 10.6 Quem cria e aprova deals

O parceiro tem autonomia pra criar, editar, pausar e encerrar deals no painel dele. Mas tudo que envolve publicar ou editar deal ativo passa pela aprovação do Vanta antes de ir pro ar.

**Fluxo:** parceiro cria deal no painel (status RASCUNHO) → Vanta recebe notificação → Vanta revisa e aprova → deal vai pro ar (status ATIVO). O Vanta também pode criar deals direto pro parceiro pelo admin.

**O que o parceiro pode fazer sozinho (sem aprovação):**
- Pausar deal (para de aparecer no feed, mas resgates pendentes continuam válidos)
- Encerrar deal — **MAS SÓ SE** ninguém tem resgate pendente (resgatou e ainda não usou). Se tem resgate ativo, o sistema bloqueia o encerramento. O parceiro pode pausar, mas não pode encerrar e prejudicar quem já resgatou. **Isso está nos termos do parceiro.**
- Ver relatórios e resgates

**O que precisa de aprovação do Vanta:**
- Criar deal novo
- Editar deal ativo

### 10.7 Como o membro descobre e resgata deals

O membro aprovado no MAIS VANTA tem acesso a um **feed de deals** dentro da área do clube no app. O feed mostra os deals disponíveis na(s) cidade(s) ativa(s) do membro, com filtros por categoria (gastronomia, beleza, etc) e cidade, ordenado por novidade. Deals de parceiros online (nacionais) também aparecem.

O membro não tem limite de deals ativos ao mesmo tempo. Pode resgatar quantos quiser. Se não cumprir, o sistema de infrações cuida.

**Fluxo completo de resgate:**

1. Membro abre o feed de deals → vê deal disponível pro tier dele
2. Clica no deal → vê detalhes: o que ganha + obrigação de post (quantos stories/posts, marcações, prazo) + prazo de validade + vagas restantes
3. Clica "RESGATAR MEU BENEFÍCIO" → recebe QR VIP dourado (mesmo estilo visual de todo QR do MAIS VANTA — diferente do QR padrão de ingressos normais)
4. Vai ao local do parceiro dentro do prazo
5. Parceiro escaneia o QR no painel dele → check-in confirmado → nesse momento o parceiro vê nome e foto do membro (antes do check-in, não vê nada)
6. Membro recebe o benefício do parceiro
7. Membro posta no Instagram conforme a obrigação do deal
8. Sistema detecta automaticamente o post via Instagram API
9. Se o sistema não detectou: fallback — pede pro membro enviar o link manualmente pelo app
10. Curadoria valida se o post está dentro das regras → deal concluído

**Cancelamento:** o membro pode cancelar o deal resgatado até 12h antes do prazo expirar. A vaga volta pro pool, sem penalidade. Depois das 12h, não pode mais cancelar — se não cumprir, gera infração. Regra unificada com eventos.

**Lembrete:** 12h antes do prazo do deal expirar, o membro recebe notificação preventiva: "Seu deal no [parceiro] expira amanhã. Se não puder ir, cancele pra evitar infração."

**Quando o prazo vence** e o membro não fez check-in nem cancelou: deal expira automaticamente → gera infração NO_SHOW → entra no sistema progressivo unificado → vaga volta pro pool.

### 10.8 O parceiro não vê tiers

Mesma filosofia do produtor de evento. O parceiro NUNCA vê os nomes internos dos tiers. Na hora de criar/sugerir um deal, ele escolhe o "perfil" do membro que quer atrair usando linguagem simples:

- **Público geral** — "Pessoas que recebem promoções e ofertas"
- **Presença visual** — "Pessoas que elevam o ambiente visualmente"
- **Conexão social** — "Pessoas bem relacionadas que trazem grupo"
- **Criadores de conteúdo** — "Influencers que vão gerar visibilidade" (com sub-nível: a partir de 200K+ / 500K+ / 1M+)
- **Perfil premium** — "Celebridades e artistas — contato direto via curadoria Vanta"

### 10.9 O painel do parceiro

O parceiro acessa seu painel via RBAC — o Dan cria o acesso no admin, atribui o role de parceiro, e o usuário acessa `/parceiro`. Sem auto-cadastro de painel.

No painel, o parceiro vê:
- **Deals** — criar, editar, pausar, encerrar deals (com as restrições da seção 10.6)
- **Resgates** — lista de resgates dos deals dele. Antes do check-in: só quantidade. Depois do check-in: nome e foto do membro
- **QR Scan** — escaneador de QR pra fazer check-in quando o membro chega no local
- **Relatório de posts** — quantos posts foram feitos, alcance estimado, links pros posts (só @ do Instagram, sem dados pessoais do membro)
- **Nota média** — média das avaliações que membros deram sobre a experiência no estabelecimento (1 a 5 estrelas). O parceiro vê só a média geral, nunca as avaliações individuais
- **Notificações** — recebe notificação em tempo real quando um membro resgata um deal

O parceiro NÃO vê: tiers dos membros, dados pessoais antes do check-in, avaliações individuais, informações sobre outros parceiros.

### 10.10 Avaliação do membro sobre o parceiro

Depois do check-in no parceiro, o membro recebe uma avaliação simples dentro do app: nota de 1 a 5 estrelas + comentário opcional. O membro avalia a experiência no estabelecimento.

As avaliações individuais só o Vanta vê — o parceiro vê apenas a nota média. Isso alimenta o controle de qualidade: parceiro com nota baixa consistente pode ser pausado ou ter a parceria encerrada pelo Vanta, conforme previsto nos termos.

### 10.11 Infrações de deals — sistema unificado

Infrações de deals alimentam o MESMO sistema de infrações de eventos. Não existe contadores separados. Toda infração (NO_SHOW no evento, NO_SHOW no parceiro, NAO_POSTOU do evento, NAO_POSTOU do deal) vai pro mesmo histórico do membro.

A escala progressiva é a mesma (configurável via admin):
- Menos de 3 infrações: aviso (sem punição)
- 3 ou mais infrações: 1º bloqueio (30 dias)
- 6 ou mais infrações: 2º bloqueio (60 dias)
- Mais de 6 infrações: ban permanente (ativo = false definitivo)

O membro é notificado quando recebe infração: "Você não cumpriu a obrigação do deal no [parceiro]. Infração registrada."

### 10.12 Termos do parceiro

Quando o parceiro é aprovado, aceita termos de uso que cobrem:

1. **Proteção ao membro** — parceiro não pode cancelar ou negar benefício já resgatado por membro. Pausar ou encerrar deal não afeta resgates pendentes. O membro que resgatou mantém o direito de usar
2. **Dados confidenciais** — dados dos membros são confidenciais. O parceiro só vê o que o sistema permite (nome e foto após check-in, @ do Instagram nos posts)
3. **Monetização** — condições de pagamento conforme o modelo definido (mensalidade, comissão ou gratuito), prazo de vigência do contrato, multa por descumprimento
4. **Qualidade** — o Vanta pode avaliar a experiência do membro no local. Parceiro com avaliações ruins consistentes pode ser pausado ou ter a parceria encerrada
5. **Encerramento** — o Vanta pode encerrar a parceria a qualquer momento, respeitando resgates pendentes

---

## 11. TERMOS DE USO DO MEMBRO

### O que o membro aceita quando solicita acesso

1. Que a aprovação é discricionária — o Vanta aprova quem quiser, sem dar motivo
2. Que os benefícios variam por evento e por perfil — não é garantido benefício em todo evento
3. Que ao resgatar um benefício, assume obrigação (comparecer ou postar, dependendo do perfil)
4. Que descumprimento gera registro interno e pode impactar benefícios futuros
5. Que os dados do Instagram podem ser consultados pra análise de perfil
6. Que o tier e a classificação interna são sigilosos e nunca serão divulgados

### O que aparece antes de resgatar um benefício

Antes de clicar em "RESGATAR MEU BENEFÍCIO", o membro sempre vê:
- O benefício específico (ex: "VIP feminino até 22h — gratuito")
- A obrigação específica (ex: "comparecer ao evento" ou "publicar post em 24h com @maisvanta @evento #Publi")
- Quantas vagas restam
- Link pros termos completos

Nunca tem surpresa depois do clique.

---

## 12. REGRAS QUE NUNCA MUDAM

1. **Tier NUNCA é exibido** — nem ao membro, nem ao produtor, nem a quem indicou. É informação interna do Vanta
2. **Todo mundo é aprovado** — pelo menos em LISTA. Não existe rejeição
3. **Notificação de aprovação é igual pra todos** — o benefício que aparece em cada evento é que diferencia
4. **Produtor escolhe PERFIS, não PESSOAS** — ele pede "30 mulheres bonitas", o Vanta decide quem
5. **Produtor NUNCA vê nomes** de membros individualmente
6. **Obrigação SEMPRE aparece antes do resgate** — nunca surpresa pós-confirmação
7. **BLACK é convidado direto** — o Vanta vai até ele, ele nunca solicita
8. **CREATOR tem sub-níveis** — produtor escolhe a partir de qual faixa liberar (200K+ / 500K+ / 1M+)
9. **Convites de indicação são marketing** — criam escassez e exclusividade, mas não garantem aprovação
10. **Planos do produtor são configuráveis** — Dan cria e edita pelo painel admin sem código
11. **Notificações ativas pra membros requerem autorização do Vanta** — e consomem o limite do plano do produtor
12. **Desconto silencioso** — tier LISTA com desconto não aparece como "benefício MAIS VANTA"
13. **Vagas esgotadas** — membro vê lista de espera + opção de comprar ingresso
14. **Cidades** — tier vale em todo lugar, mas TODOS os tiers (do LISTA ao BLACK) precisam solicitar acesso a cada cidade individualmente — ninguém tem acesso automático (estilo The Secret Society)
15. **Deals são BARTER** — todo deal tem obrigação de post no Instagram. Não existe deal de desconto puro sem contrapartida
16. **Parceiro NUNCA cancela resgate** — pausar ou encerrar deal não afeta quem já resgatou. O membro mantém o direito de usar
17. **Parceiro não vê membros antes do check-in** — nome e foto só aparecem depois do QR scan
18. **Infrações unificadas** — NO_SHOW e NAO_POSTOU de deals e eventos alimentam o mesmo sistema progressivo
19. **Cancelamento até 12h** — membro pode cancelar deal ou benefício de evento até 12h antes. Depois, não cumprir gera infração
20. **QR VIP dourado** — todo QR do MAIS VANTA (deals + eventos) tem o mesmo estilo visual dourado, diferente do QR padrão de ingressos normais
21. **Monetização do parceiro é caso a caso** — Dan decide na hora de aprovar: mensalidade, comissão por resgate, ou gratuito

---

## 13. ESTRUTURA DE DADOS

Esta seção é referência técnica pra implementação. Mostra as tabelas necessárias e o que cada campo guarda.

### membros_clube
Guarda todos os membros aprovados do clube.
```
tier              → qual nível: 'lista', 'presenca', 'social', 'creator', 'black'
creator_sublevel  → se é creator, qual sub-nível: 'creator_200k', 'creator_500k', 'creator_1m' (null pra outros tiers)
status            → 'PENDENTE' ou 'APROVADO'
genero            → 'M', 'F' ou 'NB' — essencial pra filtros de deals e segmentação do produtor
meta_user_id      → Instagram Business ID — usado pra verificação automática de seguidores
nota_engajamento  → score interno calculado pelo sistema (frequência, check-ins, posts cumpridos)
cidade_principal  → cidade que informou no formulário
cidades_ativas    → lista de cidades onde tem acesso ativo
nota_interna      → texto livre escrito pelo curador (nunca visível ao membro)
tags              → etiquetas internas do curador (nunca visíveis ao membro)
convites_disponiveis → quantos convites ainda pode enviar
convites_usados   → quantos já enviou
```

**Colunas removidas do sistema anterior:** `alcance` (NANO/MICRO/MACRO/MEGA — substituído pelos sub-níveis de creator), `interesses` (não tem uso claro no V3), `comunidade_origem` (V3 desvincula o membro de comunidade — o membro é do MAIS VANTA, não de uma comunidade específica).

### solicitacoes_clube
Guarda todas as solicitações de acesso (pendentes e aprovadas).
```
status         → 'PENDENTE', 'ADIADO' ou 'APROVADO'
instagram      → @ do Instagram informado pela pessoa
profissao      → profissão informada
como_conheceu  → como conheceu o Vanta
cidade         → cidade informada
indicado_por   → se veio por convite, quem indicou (ID do membro)
convite_id     → qual convite foi usado (ID do convite)
balde_sugerido → classificação automática do sistema ('provavel_creator', 'provavel_presenca', etc)
```

### convites_clube
Guarda todos os convites gerados por membros.
```
membro_id → quem gerou o convite
codigo    → código único do link (ex: abc123)
usado_por → quem usou o convite (null se ainda não foi usado)
usado_em  → quando foi usado
status    → 'disponivel', 'usado' ou 'expirado'
```

### mais_vanta_config_evento
Guarda a configuração de benefícios que o produtor fez pra cada evento.
```
evento_id                → qual evento
tier_minimo              → qual perfil: 'lista', 'presenca', 'social', 'creator', 'black'
creator_sublevel_minimo  → se é creator, a partir de qual sub-nível: 'creator_200k', 'creator_500k', 'creator_1m'
tipo                     → tipo de benefício: 'ingresso', 'lista' ou 'desconto'
lote_id                  → se tipo é ingresso, qual lote
lista_id                 → se tipo é lista, qual lista
desconto_percentual      → se tipo é desconto, qual percentual
vagas_limite             → limite de segurança definido pelo produtor
vagas_resgatadas         → quantas vagas já foram usadas
ativo                    → se está ativo ou desativado
```

### planos_produtor
Guarda os planos que o Dan criou no painel admin.
```
nome                     → nome do plano (ex: "Básico", "Pro", "Plano Bosque Bar")
preco_mensal             → quanto custa por mês
limite_eventos_mes       → quantos eventos por mês o produtor pode usar
limite_resgates_evento   → quantos membros podem resgatar por evento
tiers_acessiveis         → quais perfis o produtor pode usar (ex: ['lista', 'presenca'])
limite_notificacoes_mes  → quantas notificações pode pedir ao Vanta por mês
preco_evento_extra       → preço de cada evento adicional além do plano
preco_notificacao_extra  → preço de cada notificação adicional
ativo                    → se o plano está disponível
personalizado_para       → se é plano exclusivo pra um produtor específico (null se genérico)
```

### produtor_plano
Liga cada produtor ao plano que ele assinou.
```
produtor_id → qual produtor
plano_id    → qual plano
inicio      → quando começou
fim         → quando termina
status      → 'ativo', 'cancelado' ou 'expirado'
```

### cidades_mais_vanta
Guarda as cidades onde o MAIS VANTA opera.
```
nome       → nome da cidade (ex: "Rio de Janeiro")
slug       → versão simplificada pra URL (ex: "rio-de-janeiro")
ativa      → se está ativa ou não
lancada_em → quando foi lançada
```

### parceiros_mais_vanta
Guarda todos os parceiros do clube.
```
nome               → nome do estabelecimento
categoria          → 'GASTRONOMIA', 'BELEZA_BEM_ESTAR', 'ENTRETENIMENTO', 'MODA_LIFESTYLE', 'OUTRO'
descricao          → descrição curta do estabelecimento
foto_url           → foto do parceiro
endereco           → endereço físico
cidade_id          → FK cidades_mais_vanta (null pra parceiros online/nacionais)
instagram_handle   → @ do Instagram
contato_nome       → nome do responsável
contato_telefone   → telefone do responsável
contato_email      → email do responsável
proposta_inicial   → o que o parceiro propôs quando solicitou ("o que você gostaria de oferecer?")
status             → 'PENDENTE', 'APROVADO', 'ATIVO', 'INATIVO', 'ENCERRADO'
modelo_monetizacao → 'MENSALIDADE', 'COMISSAO', 'GRATUITO'
valor_mensalidade  → se modelo é MENSALIDADE (null se não)
valor_comissao     → se modelo é COMISSAO, valor por resgate (null se não)
plano_id           → FK planos_parceiro (null se condições personalizadas)
nota_media         → média das avaliações dos membros (calculado)
total_resgates     → contador de resgates acumulados
user_id            → FK profiles — acesso ao painel via RBAC (nullable até o Dan criar o acesso)
ativo              → se está visível no sistema (default true)
```

### planos_parceiro
Guarda os planos pré-definidos que o Dan criou pra parceiros.
```
nome                  → nome do plano (ex: "Parceiro Básico", "Parceiro Pro")
modelo_monetizacao    → 'MENSALIDADE', 'COMISSAO', 'GRATUITO'
valor_mensalidade     → se modelo é MENSALIDADE
valor_comissao        → se modelo é COMISSAO, valor por resgate
descricao             → descrição do plano
ativo                 → se o plano está disponível
personalizado_para    → se é plano exclusivo pra um parceiro específico (null se genérico)
```

### deals_mais_vanta
Guarda todos os deals oferecidos por parceiros.
```
parceiro_id             → FK parceiros_mais_vanta
cidade_id               → FK cidades_mais_vanta (null = deal nacional/online)
titulo                  → título do deal (ex: "Jantar pra 2 no Bistrô")
descricao               → descrição detalhada do que o membro ganha
tier_minimo             → a partir de qual perfil: 'lista', 'presenca', 'social', 'creator', 'black'
creator_sublevel_minimo → se é creator, a partir de qual sub-nível: 'creator_200k', 'creator_500k', 'creator_1m'
obrigacao_stories       → quantos stories obrigatórios (ex: 2)
obrigacao_posts         → quantos posts no feed obrigatórios (ex: 1)
obrigacao_marcacoes     → quais marcações exigidas (ex: "@maisvanta @parceiro #Publi")
obrigacao_prazo_horas   → prazo em horas pra postar após check-in (ex: 48)
prazo_validade_dias     → quantos dias o membro tem pra usar após resgatar (ex: 7)
data_expiracao          → data fixa de expiração do deal (alternativa ao prazo em dias)
vagas_limite            → limite de vagas (null = ilimitado)
vagas_resgatadas        → quantas vagas já foram usadas
status                  → 'RASCUNHO', 'PENDENTE_APROVACAO', 'ATIVO', 'PAUSADO', 'ENCERRADO', 'EXPIRADO'
ativo                   → se está visível no feed dos membros
```

### resgates_mais_vanta
Guarda todos os resgates de deals por membros.
```
deal_id        → FK deals_mais_vanta
user_id        → FK profiles (membro)
parceiro_id    → FK parceiros_mais_vanta
qr_token       → token único do QR VIP dourado (hex 16 bytes)
status         → 'RESGATADO', 'CHECK_IN', 'PENDENTE_POST', 'CONCLUIDO', 'NO_SHOW', 'EXPIRADO', 'CANCELADO'
resgatado_em   → quando resgatou
checkin_em     → quando fez check-in via QR no parceiro
post_detectado → se o sistema detectou automaticamente via Instagram API (boolean)
post_url       → link do post (preenchido automaticamente ou pelo membro)
post_verificado    → se a curadoria validou o post (boolean)
post_verificado_em → quando foi verificado
concluido_em   → quando o deal foi concluído com sucesso
cancelado_em   → quando cancelou (se cancelou)
expira_em      → data/hora limite pra usar (calculado: resgatado_em + prazo_validade_dias)
UNIQUE(deal_id, user_id) → 1 resgate por membro por deal
```

### avaliacoes_parceiro
Guarda as avaliações que membros fazem dos parceiros após check-in.
```
resgate_id  → FK resgates_mais_vanta
user_id     → FK profiles (membro que avaliou)
parceiro_id → FK parceiros_mais_vanta
nota        → 1 a 5 estrelas
comentario  → texto livre opcional (nunca visível ao parceiro)
criado_em   → quando avaliou
```

### infracoes_mais_vanta
Guarda todas as infrações de membros (unificado: eventos + deals).
```
user_id     → FK profiles (membro)
tipo        → 'NO_SHOW' ou 'NAO_POSTOU'
origem      → 'EVENTO' ou 'DEAL'
referencia_id → ID do evento ou deal que gerou a infração
descricao   → descrição automática (ex: "Não compareceu ao deal Jantar no Bistrô")
criado_em   → quando a infração foi registrada
```

---

## 14. ORDEM DE IMPLEMENTAÇÃO SUGERIDA

### Fase 1 — Base de dados e curadoria
- Criar ou atualizar as tabelas (membros_clube, solicitacoes_clube, convites_clube)
- Montar o painel de curadoria com os baldes automáticos
- Criar o formulário de solicitação do membro (com campo de cidade)
- Implementar o sistema de aprovação (todo mundo entra em pelo menos LISTA)

### Fase 2 — Convites de indicação
- Geração de links únicos por membro
- Painel admin pra configurar quantidade de convites por tier
- Renovação automática de convites por engajamento (+1 ao comparecer)
- Notificação pra quem indicou quando o indicado é aprovado

### Fase 3 — Planos do produtor
- Painel admin pra criar, editar e deletar planos (genéricos e personalizados)
- Atribuição de plano a cada produtor
- Controle de limites (eventos por mês, resgates por evento, notificações)
- Lógica de cobrança de extras (eventos e notificações adicionais)

### Fase 4 — Benefícios no evento
- Toggle "ATIVAR MAIS VANTA" na criação/edição do evento
- Tela de configuração por perfil com descrições, exemplos e tutorial no primeiro uso
- Vagas com limite + lista de espera + opção de comprar ingresso quando esgota
- Card de resgate pelo membro com obrigação explícita antes do clique

### Fase 5 — Convite especial do Vanta
- Tela pra selecionar membros individual ou por filtro
- Envio de notificação push + email + in-app
- Controle de limite por plano do produtor

### Fase 6 — Cidades e expansão
- Tabela de cidades e painel admin pra adicionar/ativar
- Solicitação de acesso por cidade pra TODOS os tiers (estilo The Secret Society — ninguém tem acesso automático)
- Notificação quando nova cidade é lançada
- Campo `cidades_ativas[]` no membro (substitui tabela de passaportes)

### Fase 7 — Parceiros e deals
- Criar tabelas (parceiros_mais_vanta, planos_parceiro, deals_mais_vanta, resgates_mais_vanta, avaliacoes_parceiro)
- Formulário de solicitação de parceria (caminho B)
- Painel admin: cadastro de parceiro (caminho A), aprovação de solicitações, definição de monetização
- Painel admin: planos pré-definidos + condições personalizadas
- Painel admin: criação e aprovação de deals
- Painel do parceiro: deals, resgates, QR scan, relatório de posts, nota média
- Feed de deals pro membro (filtros por categoria + cidade, ordenado por novidade)
- QR VIP dourado pra deals (mesmo estilo visual do MAIS VANTA)
- Fluxo de resgate completo: resgate → QR → check-in → post → detecção automática → fallback manual → validação
- Avaliação do membro sobre o parceiro (1-5 estrelas + comentário)
- Notificação em tempo real pro parceiro quando membro resgata
- Lembrete 12h antes do prazo do deal expirar
- Unificar infrações: NO_SHOW e NAO_POSTOU de deals alimentam o mesmo sistema progressivo

### Fase 8 — Relatório e métricas
- Seção MAIS VANTA no relatório pós-evento (números agregados, sem nomes)
- Métricas: resgates, comparecimento, posts enviados, posts verificados, alcance
- Botão de avaliação eficiente/ineficiente pelo produtor
- Relatório do parceiro: resgates, check-ins, posts, alcance estimado, nota média
