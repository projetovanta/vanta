# Criado: 2026-03-08 | Ultima edicao: 2026-03-08

# MAIS VANTA v2 — Modelo Completo

## Inspiracao: The Secret Society (Dubai)
App de marketplace exclusivo pra influenciadores. 65k+ membros. 1200+ parceiros.
Modelo barter: acesso premium em troca de promocao no Instagram.
Funciona como "passaporte global" — uma conta, multiplas cidades.

## Visao: MAIS VANTA = diferencial do VANTA
Clube exclusivo de curadoria. Membros ganham acesso a deals premium.
Parceiros (comunidades/eventos/venues externos) pagam plano pra receber membros qualificados.

---

## 1. ENTRADA NO CLUBE

### Duas formas:
- **Solicitacao**: membro pede entrada, master avalia perfil/Instagram e aprova
- **Convite do master**: master convida, pessoa recebe notificacao, aceita, master ainda aprova

### Curadoria na aprovacao (dados INTERNOS, membro nao ve):
| Campo | Descricao | Fonte |
|---|---|---|
| Categoria | LIFESTYLE / INFLUENCER / CREATOR / VIP | Master define |
| Alcance | NANO (1k-10k) / MICRO (10k-50k) / MACRO (50k-500k) / MEGA (500k+) | Auto do Instagram |
| Genero | M / F | Perfil |
| Cidade base | Auto do perfil | Perfil |
| Interesses | Tags da curadoria | Master define |
| Nota engajamento | Taxa engajamento real | Meta Graph API |

**REGRA**: tier/categoria sao informacao INTERNA do master. Membro NAO ve sua classificacao. So sabe que eh "Membro MAIS VANTA".

---

## 2. PASSAPORTE + CIDADES

- Aprovado = ganha Passaporte MAIS VANTA
- Passaporte sem cidade liberada = nao ve deals
- **Master cria cidade** → push + in-app pra TODOS os membros: "Nova cidade: Salvador!"
- **Membro solicita acesso** a cidade → master aprova manualmente
- Cada cidade = selo no passaporte
- **Gerente por cidade**: master delega gerente local pra cada cidade (selecionar membros, gerenciar deals)

---

## 3. PARCEIROS

### Tipos de parceiro:
1. **Comunidades do VANTA** — ja existem no sistema
2. **Eventos do VANTA** — ja existem no sistema
3. **Venues externos** — restaurantes, bares, clubs, gyms, saloes (cadastro similar a comunidade)

### Cadastro de parceiro externo:
- Master cria no painel (nome, foto, endereco, cidade, tipo, Instagram, contato)
- Parceiro recebe link de acesso ao painel dele (visao limitada)
- No painel ve: membros selecionados, status dos deals, relatorio de uso
- Parceiro NAO seleciona membros — so recebe os que master/gerente mandou

### Adesao:
- Master convida parceiro (botao no painel, tipo Vanta Indica)
- Parceiro ve: o que eh o MAIS VANTA, planos disponiveis, trial gratis opcional
- Parceiro escolhe plano e aceita

### Planos do parceiro:
| | STARTER | PRO | ELITE |
|---|---|---|---|
| Preco | R$ X/mes | R$ Y/mes | R$ Z/mes |
| Resgates/mes | 5 | 20 | Ilimitado |
| Perfis disponiveis | Nano+Micro | Todos | Todos |
| Filtros | Genero | Genero+Categoria | Todos |
| Destaque | Nao | Sim, na lista | Banner + Push |
| Relatorio | Basico | Completo | Completo + ROI |
| Trial gratis | Opcional (X meses) | Opcional | Opcional |

"Resgates" = quantos membros MV podem usar deal daquele parceiro por mes.

---

## 4. DEALS

### Parceiro cria deal:
| Campo | Descricao |
|---|---|
| Titulo | "VIP + Open Bar no Evento X" |
| Tipo | BARTER ou DESCONTO |
| Obrigacao (barter) | Ex: 1 story + 1 post com @marca |
| Desconto (se desconto) | % ou valor fixo |
| Filtro de membro | Genero, alcance, categoria (conforme plano permite) |
| Validade | Data inicio/fim |
| Limite | Conforme resgates do plano |
| Foto/imagem | Visual do deal |
| Descricao | Detalhes do que o membro recebe |

### Fluxo do deal:
1. Parceiro cria deal no painel
2. Membro ve deals da cidade dele (aba MAIS VANTA no perfil)
3. Membro ve card completo: foto, nome, descricao, tipo, obrigacao, vagas
4. **Membro aplica** ("Quero resgatar") — so pode ter 1 deal ativo por vez
5. **Master/gerente da cidade seleciona** quem vai (curadoria interna)
6. Membro selecionado recebe notificacao + **QR VIP dourado especifico do deal**
7. Membro vai ao local, apresenta QR
8. Portaria escaneia → registra CHECK-IN MV
9. Se barter: membro posta no Instagram
10. Meta API verifica post automaticamente (ou membro envia print manual)
11. Deal marcado como CONCLUIDO

### Regra do 1 por vez:
- Membro so pode aplicar pra 1 deal ativo
- So aplica pro proximo quando o anterior for CONCLUIDO ou EXPIRADO
- Cria exclusividade e compromisso

---

## 5. QR VIP MAIS VANTA

### Visual:
- Fundo escuro
- Modulos dourados (#FFD300)
- Logo MAIS VANTA no centro do QR
- Texto: "MEMBRO MAIS VANTA"
- Nome do membro
- QR unico por deal (nao fixo)

### Dados no QR (ao escanear):
- ID do membro
- ID do deal
- Status (SELECIONADO, USADO, etc)
- Sem tier/categoria expostos

### Tracking via QR:
- Cada scan registra: membro, deal, parceiro, data/hora, local
- Dashboard de analytics: perfil de consumo por membro, frequencia, tipos de deal preferidos, taxa de post cumprido

---

## 6. TRACKING (Meta Graph API)

### Requisitos:
- Membro conecta Instagram Business/Creator no app
- App registrado como Meta App com permissoes de mentions

### Apos resgate barter:
- API busca mencoes/@tags do parceiro no perfil do membro
- Calcula alcance + engajamento real do post
- Parceiro ve relatorio: ROI do deal (alcance total, impressoes, engajamento)
- Membro ganha "reputacao" (historico de cumprimento)

### Infracoes:
- NAO_POSTOU: membro foi ao deal barter e nao postou dentro do prazo
- NO_SHOW: membro foi selecionado e nao apareceu
- 3 infracoes = bloqueio temporario
- Sistema progressivo ja implementado (infracoes_mais_vanta)

---

## 7. NOTIFICACOES

| Evento | Quem recebe | Tipo |
|---|---|---|
| Nova cidade criada | Todos os membros MV | Push + in-app |
| Membro solicitou cidade | Master + gerente cidade | In-app (Pendencias) |
| Cidade aprovada | Membro | Push + in-app |
| Novo deal na cidade | Membros da cidade | Push + in-app |
| Membro aplicou pro deal | Master + gerente cidade | In-app (Pendencias) |
| Selecionado pro deal | Membro | Push + in-app |
| Nao selecionado | Membro | In-app |
| Infracao registrada | Membro | Push + in-app |
| Post verificado | Membro + parceiro | In-app |

---

## 8. PAINEL DO PARCEIRO

- Parceiro externo recebe cargo `vanta_parceiro_mv` no RBAC
- Entra no MESMO painel admin existente (reutiliza infra)
- Sidebar exclusivo mostra apenas:
  - Dashboard MV (visao geral)
  - Meus Deals (criar/editar)
  - Membros Selecionados (quem foi mandado pro deal)
  - Relatorios (uso, ROI, engajamento)
- Visual com detalhes dourados (premium)
- Parceiro NAO seleciona membros — so ve quem o master/gerente mandou

## 9. ESCALA

| Funcao | Quem faz |
|---|---|
| Criar cidade | Master |
| Aprovar membro no clube | Master |
| Aprovar membro na cidade | Master ou gerente da cidade |
| Cadastrar parceiro externo | Master |
| Criar deal | Parceiro (no painel dele) |
| Selecionar membros pro deal | Master ou gerente da cidade |
| Verificar post | Automatico (Meta API) ou manual |

---

## 10. O QUE JA EXISTE (implementado)

| Item | Status | Tabela/Service |
|---|---|---|
| Solicitacao entrada | OK | solicitacoes_clube |
| Aprovacao com tier | OK | membros_clube |
| Tiers BRONZE-DIAMANTE | OK | tiers_mais_vanta |
| Passaporte por cidade | OK | passport_aprovacoes |
| Lotes exclusivos por evento | OK | lotes_mais_vanta |
| Reservas de beneficio | OK | reservas_mais_vanta |
| Infracoes progressivas | OK | infracoes_mais_vanta |
| Assinaturas comunidade | OK | assinaturas_mais_vanta |
| Planos MV | OK | planos_mais_vanta |
| Config global | OK | mais_vanta_config |
| Instagram verificacao | PLACEHOLDER | Edge Function sem META_ACCESS_TOKEN |
| Stripe pagamento | PLACEHOLDER | Edge Function sem STRIPE_SECRET_KEY |

## 11. O QUE FALTA IMPLEMENTAR

| # | Item | Prioridade |
|---|---|---|
| 1 | Curadoria v2 (categoria + alcance + engajamento) | ALTA |
| 2 | Tabela parceiros_mais_vanta (venues externos) | ALTA |
| 3 | Tabela deals_mais_vanta | ALTA |
| 4 | Tabela resgates_mais_vanta (aplicacoes + selecoes) | ALTA |
| 5 | QR VIP dourado por deal | ALTA |
| 6 | Feed de deals no perfil do membro | ALTA |
| 7 | Painel do parceiro (visao limitada) | MEDIA |
| 8 | Gerente por cidade | MEDIA |
| 9 | Planos parceiro (STARTER/PRO/ELITE) | MEDIA |
| 10 | Meta Graph API integracao | MEDIA |
| 11 | Dashboard analytics MV | BAIXA |
| 12 | Notificacoes MV v2 (nova cidade, deal, selecao) | MEDIA |
| 13 | Convite master → membro | MEDIA |
| 14 | Convite master → parceiro | MEDIA |
| 15 | Regra 1 deal ativo por vez | ALTA |
