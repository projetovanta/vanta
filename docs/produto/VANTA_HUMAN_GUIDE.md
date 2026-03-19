# VANTA — Guia Prático para Humanos

> Versão: 2026-02-22 | Aplicativo mobile-first (iOS, Android, browser)

---

## O que é o VANTA?

VANTA é uma plataforma de experiências exclusivas que conecta membros a eventos privados, comunidades e produtores de alto padrão. O app funciona como um ecossistema fechado: você descobre eventos, compra ingressos, gerencia cortesias e — se tiver cargo — acessa o portal operacional de produção.

---

## 1. NAVEGAÇÃO GERAL

O app tem **5 abas** na barra inferior:

| Aba | O que faz |
|---|---|
| **Início** | Feed de eventos + destaques da sua cidade |
| **Radar** | Mapa + calendário premium de eventos |
| **Buscar** | Pesquisa por evento, pessoa ou comunidade |
| **Mensagens** | Chat 1:1 com outros membros |
| **Perfil** | Sua conta, carteira, ingressos e configurações |

> **Visitante (não logado)**: Pode ver Início, Radar e Buscar. Mensagens, Perfil e Área Admin requerem cadastro.

---

## 2. CADASTRO (ONBOARDING)

### Como se cadastrar
1. Tente acessar qualquer área restrita (Perfil, Mensagens).
2. Aparece o modal "Área Restrita" → toque **"Sim, quero me cadastrar"**.
3. Preencha: nome completo, gênero, e-mail, Instagram, cidade, data de nascimento, interesses.
4. Aceite os termos de uso.
5. **Biometria**: o app abre a câmera frontal. Enquadre seu rosto → sistema detecta pele automaticamente → botão "Capturar" fica habilitado → toque para tirar a selfie.
6. Pronto! Você entra automaticamente como `vanta_member`.

> **Selfie**: é a sua identidade vinculada à conta. Separada da foto de perfil (que você troca livremente).

---

## 3. PERFIL

Acesse: aba **Perfil** → botões no topo.

### O que você pode fazer
- **Editar Perfil**: foto, biografia, Instagram, cidade, interesses, álbum (até 6 fotos)
- **Minha Carteira**: ingressos comprados, RSVPs, cortesias recebidas
- **Meus Ingressos**: carteira digital com QR Code anti-print
- **Privacidade**: controlar quem vê seu e-mail, bio, Instagram, eventos, etc.
- **Preferências**: notificações, idioma

### Botão "Portal Admin"
Aparece no perfil se você tiver algum cargo atribuído. Toque para acessar o portal correspondente.

> Se você recebeu uma notificação de acesso liberado, uma estrela pulsante dourada vai aparecer no botão admin para indicar a novidade.

---

## 4. EVENTOS

### Descobrir eventos
- **Início**: eventos da sua cidade em destaque
- **Radar**: mapa interativo + calendário
- **Buscar**: filtre por categoria, cidade, preço, horário

### Abrir um evento
Toque no card do evento. Você verá:
- Foto, título, descrição, data, horário, local
- Dress code e line-up (se disponível)
- Membros confirmados
- Botão **"Confirmar Presença"** (RSVP gratuito) ou **"Comprar Ingresso"**

### Comprar ingresso (Checkout)
1. Toque "Comprar Ingresso" → tela de checkout
2. Selecione lote e variação (ex: VIP Feminino, Pista Masculino)
3. Escolha a quantidade
4. Insira seu e-mail
5. Veja o resumo: valor bruto, taxa VANTA (5%), total
6. Confirme → seu ingresso aparece em **Meus Ingressos** com QR Code

> **QR Code anti-print**: o código muda a cada 30 segundos. Screenshots ficam inválidos.

### Comunidades
Toque no nome da comunidade no card do evento → veja o perfil da comunidade, eventos passados e futuros, e curtidas.

---

## 5. CARTEIRA (WALLET)

Acesse: Perfil → Minha Carteira.

### O que aparece
- **Próximos**: ingressos e RSVPs para eventos futuros
- **Passados**: ingressos utilizados ou eventos já realizados

### Ações disponíveis
- **Ver QR Code**: abre o ticket com QR anti-print para apresentar na portaria
- **Devolver cortesia**: se recebeu uma cortesia de um produtor, pode devolver (restaura o saldo ao pool)
- **Transferir ingresso**: enviado para outro membro (ele aparece na carteira dele)

---

## 6. SOCIAL

### Amizades
- Abra o perfil de outro membro (busca ou evento) → "Solicitar amizade"
- Aceite pedidos pelas notificações (sino no canto superior)
- Amigos aparecem em "Mensagens" como contatos

### Chat
- Acesse "Mensagens" → toque num chat existente
- Ou abra o perfil de alguém → botão "Enviar mensagem"

### Notificações
- Sino no topo da Início (só para membros logados)
- Tipos: eventos, amizades, sistema, aniversários, cortesias

---

## 7. PORTAL DO GERENTE (`vanta_gerente`)

**Quem acessa**: gerentes cadastrados pelo masteradm em uma comunidade (antigo "produtor").

### Dashboard Principal
Cards de ação:
- **Minha Comunidade** → ver e gerenciar eventos da comunidade
- **Listas** → gerenciar listas de convidados
- **Check-in** → validar entradas na portaria
- **Finanças** → saldo e saques

### Financeiro
1. Acesse **Finanças**
2. Veja: Faturamento Total, Saldo Disponível, A Receber, Saques Processados
3. Cadastre sua chave PIX (CPF/CNPJ, e-mail, celular ou chave aleatória)
4. Toque **"Solicitar Saque"** → informe o valor → confirme
5. O masteradm aprova o saque → você recebe notificação

> **Taxa VANTA**: 5% de cada venda. `valorLiquido = valorBruto × 0.95`

---

## 8. PORTAL DO SÓCIO (`vanta_socio`)

**Quem acessa**: sócios organizadores de eventos.

### Meus Eventos
- Lista de todos os eventos do sócio
- Botão **"+ Novo Evento"** → formulário completo de criação

### Criar Evento
Preencha:
- Nome, descrição, foto (URL), data início, data fim
- Local, endereço, cidade, coordenadas (opcional)
- Lotes: nome, limite, data validade
- Variações por lote: área (VIP/Pista/Camarote/Backstage/Outro), gênero (Masc./Fem./Unisex), valor, limite

### Gerenciar Evento (EventManagementView)

#### Aba Resumo
- Faturamento bruto, check-ins, ingressos vendidos vs total
- Gráfico horário de vendas

#### Aba Equipe
- Adicionar membros à equipe: busca por e-mail/nome → seleciona papel (Promoter/Portaria/Staff/Host)
- Toggle "Liberar Lista" → permite ao membro inserir convidados
- Quotas por categoria para cada membro

#### Aba Lista (Gestão de Convidados)
- Ver lotação global e por categoria
- Distribuir cotas aos promoters
- Ver lista de convidados com status de check-in

#### Aba Lotes
- Ativar/desativar lotes
- Ver progresso de vendas por variação

#### Aba Cortesias
- Pool de cortesias disponíveis
- Enviar cortesia: busca destinatário por e-mail → seleciona variação e quantidade
- Log de transferências (remetente, destinatário, data)

#### Aba Funções (Cargos Customizados)
- Criar cargos personalizados para a comunidade (ex: "Segurança da Casa")
- Definir permissões: VER_FINANCEIRO, VENDER_PORTA, VALIDAR_ENTRADA, GERIR_LISTAS, GERIR_EQUIPE
- Editar e deletar funções criadas

#### Aba Caixa (toggle `caixaAtivo`)
- Liga/desliga a venda na porta para operadores CAIXA
- Só eventos com `caixaAtivo = true` aparecem no CaixaView

---

## 9. PORTAL DO CAIXA (`vanta_caixa`)

**Quem acessa**: operadores de venda física na entrada do evento.

### Como usar
1. Tela inicial: lista de eventos com caixa ativo
2. Toque no evento desejado
3. Selecione o lote ativo e a variação (área + gênero)
4. Digite o e-mail do comprador
5. Toque **"Confirmar Venda"**
6. Aparece o ticket VANTA dourado com QR Code
7. O comprador pode apresentar esse QR na portaria

> O QR muda a cada 30s. Se o comprador tirar screenshot, o código expira em até 30 segundos.

---

## 10. PORTAL DA PORTARIA (`vanta_*portaria*`)

**Quem acessa**: operadores de check-in na entrada do evento.
- `vanta_ger_portaria_lista` / `vanta_portaria_lista` — check-in por lista
- `vanta_ger_portaria_antecipado` / `vanta_portaria_antecipado` — scanner QR (antecipado)

### Modo QR (padrão)
1. Selecione o evento
2. Aponte a câmera para o QR Code do ingresso
3. Feedback imediato:
   - 🟢 **Verde pulsante** = "ENTRADA LIBERADA" — ingresso válido
   - 🔴 **Vermelho** = "INGRESSO JÁ QUEIMADO" ou "INVÁLIDO"
4. Próximo ingresso em 3 segundos (automático)

> Sem câmera? Use o modo **"Manual"** — digite o código do ticket.

### Modo Listas
1. Toque no toggle "Listas" (ao lado de "QR")
2. Selecione o evento
3. Busque o nome do convidado
4. Toque **"Check-in"** → confirmado com badge verde

---

## 11. PORTAL DO PROMOTER (`vanta_promoter`)

**Quem acessa**: promoters com acesso à gestão de listas.

### Adicionar convidados em massa
1. Selecione o evento
2. Escolha a categoria (regra) — ex: "VIP Feminino"
3. Cole os nomes na caixa de texto (um por linha):
   ```
   Maria Silva
   João Santos
   Ana Oliveira
   ```
4. Toque **"Salvar"** → modal de confirmação mostra o resumo
5. Confirme → nomes adicionados à lista

### Ver lista
- Convidados aparecem abaixo do textarea
- Badge "Confirmado" (verde) indica quem já fez check-in
- Contador de vagas por categoria

---

## 12. PORTAL MASTERADM (`vanta_masteradm`)

**Quem acessa**: administradores do ecossistema VANTA.

### Curadoria
- Revisar selfies de novos membros
- Aprovar (→ role `vanta_member`) ou Rejeitar cadastros
- Ver badge "LIVE" para dados reais do Supabase vs "MOCK" para demonstração

### Membros
- Ver todos os membros com prestígio atribuído
- Adicionar notas internas

### Prestígio
- Criar níveis de prestígio (nome, cor hex, ícone)
- Atribuir nível a um membro
- Ver histórico de atribuições

### Comunidades
- Criar e editar comunidades (nome, foto, capa, endereço, capacidade)
- Gerenciar cargos dos membros dentro de cada comunidade

### VANTA Indica
- Gerenciar cards promocionais da tela Início
- Tipos: Publicidade, Função do App, Lista de Evento, Cupom, Destaque
- Ativar/desativar cards por localidade (Global ou cidade específica)

### Notificações
- Criar e disparar notificações para todos os membros ou segmentos
- Rascunhos e histórico de envios

### Definir Cargos
1. Busque o membro por e-mail
2. Selecione o destino: Comunidade ou Evento
3. Escolha o cargo: Produtor, Host, Portaria, Staff, Caixa
4. Modal de confirmação → membro recebe notificação

> O membro não tem o role alterado — acesso é **derivado automaticamente** do cargo em tempo real.

### Financeiro Master
- Faturamento total da plataforma
- Receita VANTA (5% de cada transação)
- Gráfico dos últimos 7 dias

### Gestão de Saques
- Pendentes: aprovar ou estornar saques dos produtores
- Histórico: saques processados e estornados
- Aprovação → notificação automática para o produtor

### Scanner (Portaria Master)
- Mesmo fluxo da portaria, mas com acesso a todos os eventos

### Supabase Status
- Verifica conectividade com o Supabase
- Exibe latência em ms
- Valida variáveis de ambiente (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- Calculadora financeira: taxa × valor bruto

---

## 13. CONTAS DE DESENVOLVIMENTO (DEV SWITCHER)

No modo DEV, um painel flutuante aparece no canto inferior direito para trocar de conta rapidamente:

| Botão | Conta | Role |
|---|---|---|
| guest | Visitante | vanta_guest |
| member | Membro Simples | vanta_member |
| master | Admin VANTA | vanta_masteradm |
| prod | Dono da Boate | vanta_gerente |
| socio | Dono da Festa | vanta_socio |
| m1 | Ricardo Almeida | vanta_member + GERENTE em joa-club |
| c1 | Vendedor Porta | vanta_member + CAIXA em ev_joa_prod |

---

## 14. BANCO DE DADOS (SUPABASE)

Schema: `supabase/schema.sql` (v5 — reset completo em DEV)

### Tabelas Principais
| Tabela | O que armazena |
|---|---|
| profiles | Dados dos usuários (estende auth.users) |
| niveis_prestigio | Níveis de prestígio |
| comunidades | Locais/espaços de eventos |
| cargos | Cargos de membros em comunidades |
| eventos_admin | Eventos criados no painel |
| equipe_evento | Equipe de cada evento |
| lotes | Lotes de ingressos por evento |
| variacoes_ingresso | Variações (área, gênero, valor) |
| tickets_caixa | Ingressos emitidos na porta |
| transactions | Transações financeiras |
| solicitacoes_saque | Saques dos produtores |
| listas_evento | Listas de convidados por evento |
| cotas_promoter | Quotas individuais de cada promoter |
| regras_lista | Categorias (VIP Fem., Pista Masc., etc.) |
| convidados_lista | Convidados inseridos na lista |
| audit_logs | Log imutável de ações administrativas |
| vendas_log | Log individual de vendas |

### RPCs (Funções Atômicas)
- `queimar_ingresso(ticketId, eventId, operadorId)` — valida e marca ingresso como USADO
- `processar_compra_checkout(...)` — venda pública (tipo VENDA_CHECKOUT)
- `processar_venda_caixa(...)` — venda na porta (tipo VENDA_CAIXA)

### Como aplicar o schema
1. Acesse o Supabase Dashboard → SQL Editor
2. Cole o conteúdo de `supabase/schema.sql`
3. Execute — o script dropa e recria todas as tabelas VANTA (seguro para DEV)
4. Nunca apaga `auth.users` nem a tabela `profiles` (só adiciona colunas)

---

## 15. CONFIGURAÇÃO DO AMBIENTE

### Arquivo .env
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

### Rodar o projeto
```bash
npm install
npm run dev
```

### Verificar TypeScript
```bash
npx tsc --noEmit
# Deve retornar 0 erros
```

---

## 16. GLOSSÁRIO

| Termo | Significado |
|---|---|
| vanta_guest | Visitante sem cadastro |
| vanta_member | Membro cadastrado (sem cargo) |
| vanta_masteradm | Administrador total do ecossistema |
| vanta_gerente | Gerente responsável por uma comunidade (antigo produtor) |
| vanta_socio | Sócio organizador de eventos |
| vanta_caixa | Operador de venda física |
| vanta_ger_portaria_lista | Gerente de portaria — modo lista |
| vanta_portaria_lista | Operador de check-in — modo lista |
| vanta_ger_portaria_antecipado | Gerente de portaria — modo antecipado (QR) |
| vanta_portaria_antecipado | Operador de check-in — modo antecipado (QR) |
| vanta_promoter | Promoter (gestão de listas) |
| AccessNode | Nó de acesso derivado de um cargo real |
| RSVP | Confirmação de presença (gratuita, sem ingresso) |
| Cortesia | Ingresso gratuito enviado pelo produtor/sócio |
| Pool de Cortesias | Estoque de cortesias disponíveis para envio |
| Lote | Grupo de ingressos com validade e preço |
| Variação | Combinação de área (VIP, Pista) + gênero dentro de um lote |
| saldoBanco | Vagas disponíveis no "banco" central de uma regra de lista |
| cota alocado | Vagas distribuídas ao promoter |
| cota usado | Vagas já inseridas (nomes adicionados) |
| qrNonce | Código aleatório que invalida screenshots (renova a 30s) |
| taxaOverride | Taxa customizada por evento (substitui 5% padrão) |
| VANTA_FEE | Taxa padrão da plataforma = 5% (0.05) |
