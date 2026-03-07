# Criado: 2026-03-07 | Ultima edicao: 2026-03-07

# Sub-modulo: Comemoracao (Aniversario/Despedida VIP)

## Pertence a: modulo_evento + modulo_comunidade (cross)

## Status: IMPLEMENTADO (v2 — solicitacao + aprovacao + timeline + ref_code + tracking vendas + cortesias auto + vinculo evento)

## Conceito
Membro comum solicita comemorar aniversario/despedida num evento ou comunidade.
Se aprovado, recebe link de vendas personalizado com beneficios escalonados por vendas.
Funciona como "promoter temporario" mas sistema TOTALMENTE SEPARADO do promoter.

## Fluxo completo

### 1. Solicitacao
- **Onde**: botao "Comemorar aqui" na pagina do EVENTO + na pagina da COMUNIDADE
- **Comunidade**: membro escolhe DATA desejada (evento pode nao existir ainda)
- **Evento**: solicita direto pro evento existente
- **Vinculo automatico**: se solicitou na comunidade com data, quando gerente criar evento pra aquela data, sistema vincula e notifica membro
- **Multi-evento na mesma data**: gerente escolhe em qual evento encaixar

### 2. Formulario de solicitacao
| Campo | Tipo | Obrigatorio | Condicao |
|---|---|---|---|
| Motivo | Select: Aniversario / Despedida / Outro | Sim | Sempre |
| Nome completo | Text | Sim | Sempre |
| Data de aniversario | Date | Sim | So se motivo = Aniversario |
| Data da comemoracao | Date | Sim | Sempre |
| Celular (WhatsApp) | Phone com DDI | Sim | Sempre |
| Instagram | Text | Sim | Sempre |

### 3. Aprovacao
- **Manual sempre** — gerente ou socio do evento avalia e aprova/recusa
- Notificacao pro gerente quando chega solicitacao
- Notificacao pro membro quando aprovado/recusado

### 4. Apos aprovacao
- Sistema gera **link de vendas personalizado**: URL do evento com `?ref=CODIGO_NOME`
- Membro recebe link + codigo via notificacao
- **Beneficio automatico**: fila exclusiva + ingresso antecipado com QR (toda comemoracao aprovada)

### 5. Faixas de beneficios
- **Configuravel por evento** — gerente define ao criar/editar evento (secao "Comemoracoes" no wizard)
- Cada faixa: { minVendas, cortesias (qtd), beneficioConsumo (texto livre: "Balde 5 cervejas", "Garrafa Fireball", etc) }
- **Deadline configuravel**: horario limite pra vendas contarem (ex: 14h do dia do evento)
- **Limite de comemoracoes por evento**: gerente define maximo
- **Datas bloqueadas**: gerente marca periodos onde nao aceita (ex: Carnaval, Reveillon)

### 6. Tracking de vendas
- Link com `?ref=CODIGO` rastreia compras
- **Contador ao vivo** — membro ve em tempo real: "12 vendas de 15 pra proxima faixa"
- Link expira no deadline configurado (vendas apos deadline nao contam pra faixa)

### 7. Cortesias ganhas
- Ao atingir faixa, sistema gera ingressos cortesia automaticamente
- **Membro insere os nomes** dos convidados que recebem cortesia (tela no perfil dele)
- Voucher digital (QR code) pro membro + notificacao pro gerente (dupla conferencia)

### 8. Tela do membro
- **Aba "Comemoracoes" no perfil** do membro
- Mostra: status (pendente/aprovado/recusado), contador de vendas, faixas desbloqueadas, cortesias disponiveis, link de compartilhamento

### 9. Tela do gerente
- **Secao no wizard de criacao/edicao do evento**: habilitar comemoracoes, definir faixas, limite, deadline, datas bloqueadas
- **Dashboard do evento**: lista de comemoracoes com status, vendas por aniversariante

## Nomenclatura
- Feature: "Comemoracao"
- Botao: "Comemorar aqui"
- Titulo perfil: "Minhas Comemoracoes"
- Titulo admin: "Comemoracoes"

## Tabelas (CRIADAS — migration 20260308010000)
- `comemoracoes` — solicitacao + status + dados formulario + ref_code + vendas_count
- `comemoracoes_faixas` — faixas de beneficios (min_vendas, cortesias, beneficio_consumo)
- `comemoracoes_config` — config por evento (habilitado, limite, deadline, datas bloqueadas)
- `comemoracoes_cortesias` — cortesias geradas + nomes convidados

## Arquivos
| Arquivo | Funcao |
|---|---|
| services/comemoracaoService.ts | CRUD + status + config + faixas + cortesias |
| modules/community/ComemoracaoFormView.tsx | Formulario do membro |
| features/admin/views/comunidades/ComemoracoesTab.tsx | Painel gerente (aprovar/recusar) |
| features/admin/views/eventoDashboard/ComemoracaoConfigSubView.tsx | Config faixas por evento |
| modules/profile/MinhasSolicitacoesView.tsx | Aba Comemoracoes no perfil membro (com progresso vendas) |
| modules/checkout/CheckoutPage.tsx | Propaga ref_code na RPC processar_compra_checkout |
| supabase/migrations/20260308010000_comemoracoes.sql | Migration 4 tabelas |
| supabase/migrations/20260308020000_comemoracao_ref_tracking_e_cortesias_auto.sql | RPC atualizada + cortesias auto + vinculo evento trigger |

## Pendencias
| Item | Status |
|---|---|
| Formulario membro | OK |
| Botao ComunidadePublicView | OK |
| Painel gerente (aprovar/recusar) | OK |
| Ref code gerado ao aprovar | OK |
| Config faixas (UI gerente no dashboard) | OK — ComemoracaoConfigSubView.tsx (toggle + limite + deadline + faixas editaveis) |
| Tracking vendas por ref code | OK — RPC processar_compra_checkout aceita p_ref_code, incrementa vendas_count |
| Contador ao vivo pro membro | OK — MinhasSolicitacoesView.tsx (barra progresso + faixas desbloqueadas) |
| Geracao automatica de cortesias | OK — RPC gerar_cortesias_comemoracao() chamada automaticamente |
| Membro insere nomes cortesias | OK — MinhasSolicitacoesView.tsx (UI inline nome+celular + salvar) |
| Voucher QR | OK — MinhasSolicitacoesView.tsx (QRCodeSVG modal, formato vanta://cortesia/{id}) |
| Botao no EventDetailView | OK — EventDetailView.tsx (botao "Comemorar aqui") |
| Aba "Comemoracoes" no perfil membro | OK — MinhasSolicitacoesView.tsx (aba COMEMORACOES) |
| Vinculo automatico comunidade->evento | OK — trigger trg_vincular_comemoracao_evento (INSERT eventos_admin) |
| Notificacoes push/in-app | OK — notify() em solicitar (gerentes), aprovar/recusar (solicitante) |
| Datas bloqueadas (UI) | OK — ComemoracaoConfigSubView.tsx (date picker + chips removiveis) |
