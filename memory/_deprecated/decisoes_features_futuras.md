---
name: Decisões de features futuras
description: 20 decisões tomadas pelo Dan em 17/mar/2026 sessão 5 sobre features que NÃO EXISTEM ainda — referência pra quando implementar
type: project
---

Decisões tomadas por Dan em 17/mar/2026 (sessão 5). Usar como referência quando implementar cada feature.

**Why:** Dan revisou todas as features mapeadas como "NÃO EXISTE" nas memórias e decidiu uma a uma como quer cada uma.

**How to apply:** Quando for implementar qualquer feature abaixo, consultar a decisão do Dan antes de codificar.

---

## Carteira / Ingresso

| Feature | Decisão Dan | Detalhe |
|---|---|---|
| PDF ingresso | Comprovante SEM QR | QR fica exclusivo no app/Wallet. PDF tem dados da compra + aviso "apresente no app". Equipe de segurança (Zara+Nix) recomendou |
| Apple/Google Wallet | Sim, os dois | QR dentro do pass nativo (protegido por biometria). Precisa conta Apple Developer + service account GCP |
| Histórico transferências | Lista com nome e status | Seção "Transferências" na carteira: pra quem enviou, quando, aceito/recusado |

## Busca

| Feature | Decisão Dan | Detalhe |
|---|---|---|
| Busca por lugares | Aba "Lugares" na busca | Ao lado de Eventos e Pessoas, aba dedicada pra bares/casas/restaurantes |
| Autocomplete | Sugestões ao vivo | Conforme digita, sugestões de eventos, lugares e pessoas |
| Histórico buscas | Com opção de limpar | Últimas buscas + botão "Limpar histórico" |

## Dashboard / Admin

| Feature | Decisão Dan | Detalhe |
|---|---|---|
| Dashboard realtime | Atualização ao vivo | Vendas e check-ins aparecem sem recarregar (Supabase Realtime) |
| Notificação promoter | Push + in-app | Quando gerente atribui cota, promoter recebe push + notificação no sino |
| Remover da lista | Só quem adicionou | Só quem colocou o nome pode remover. Mais ninguém |
| Audit RBAC | Com data e quem atribuiu | Toda atribuição registra quem deu, quando, pra quem. Visível no painel |
| Extrato financeiro | Completo com filtros | Lista de todas as transações: vendas, taxas, saques, reembolsos. Filtro por data e tipo |

## Chat / Social

| Feature | Decisão Dan | Detalhe |
|---|---|---|
| Chat fotos | Não, só texto | Chat continua só texto por enquanto |
| Grupo de chat | Não, só 1 a 1 | Grupo adiciona complexidade de moderação |

## RBAC / Cargos

| Feature | Decisão Dan | Detalhe |
|---|---|---|
| Cargo expira | Não, fica até remover | Cargo de evento já é limitado pelo contexto do evento naturalmente |

## Financeiro / Legal

| Feature | Decisão Dan | Detalhe |
|---|---|---|
| Nota fiscal | Via integração NFe.io | Quando tiver CNPJ ativo. Emissão automática após pagamento |
| Limite comunidades | Sem limite | Admin master pode criar quantas quiser |

## Comunidade

| Feature | Decisão Dan | Detalhe |
|---|---|---|
| Notif comunidade nova | Descartada | Sem sentido — comunidade nova não tem seguidores |
| Notif desativar comunidade | Não precisa | Comunidade some silenciosamente |
| Validar CNPJ | Consulta Receita Federal | API da Receita pra ver se CNPJ existe e está ativo |
| Histórico edições | Aba dedicada na comunidade | Dentro da comunidade, aba "Histórico" com todas as mudanças |
