# Criado: 2026-03-07 | Ultima edicao: 2026-03-07

# Sub-modulo: Evento Privado (Corporativo/Particular)

## Pertence a: modulo_comunidade + modulo_evento (cross)

## Status: IMPLEMENTADO (v1 — formulario + timeline + painel gerente)

## Conceito
Membro solicita uso do espaco da comunidade para evento privado/corporativo.
Gerente avalia, aprova/recusa com mensagem. Timeline de 5 status acompanhavel.
Se aprovado, gerente pode converter em evento no sistema.

## Fluxo

### 1. Config (gerente)
- Na tabela `comunidades`: `evento_privado_ativo` (bool), `evento_privado_texto` (apresentacao), `evento_privado_fotos` (galeria), `evento_privado_formatos` (opcoes), `evento_privado_atracoes` (opcoes), `evento_privado_faixas_capacidade` (faixas)
- Gerente habilita na config da comunidade

### 2. Solicitacao (membro)
- Botao "Evento Privado" na ComunidadePublicView (so aparece se `evento_privado_ativo = true`)
- Formulario: nome, empresa, email, telefone, instagram, data evento ou estimativa, capacidade (faixas do gerente), horario (Diurno/Noturno/Dia inteiro), formatos (multi-select chips), atracoes (multi-select chips), descricao
- Todos obrigatorios exceto data_evento (pode usar estimativa)

### 3. Timeline de status (5 etapas)
ENVIADA -> VISUALIZADA (gerente abriu) -> EM_ANALISE -> APROVADA / RECUSADA
- Cada transicao registra timestamp
- Cada mudanca notifica solicitante (3 canais via notifyService)
- Gerente pode enviar mensagem opcional em qualquer acao

### 4. Painel gerente
- Aba "Privados" no ComunidadeDetalheView
- Cards expandiveis com dados completos + contato + detalhes evento
- Acoes: Em analise / Aprovar (+ mensagem) / Recusar (motivo obrigatorio + mensagem)
- Auto-marca "Visualizada" ao expandir card novo

### 5. Acompanhamento (membro)
- MinhasSolicitacoesPrivadoView: timeline visual com bolinhas coloridas + timestamps (arquivo standalone, não conectado)
- MinhasPendenciasView: aba "Eventos Privados" integrada com mesma timeline (ATIVO, conectado ao perfil)
- Mostra mensagem do gerente e motivo de recusa

## Tabela: eventos_privados
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| comunidade_id | UUID FK comunidades | |
| solicitante_id | UUID FK profiles | |
| status | TEXT | ENVIADA/VISUALIZADA/EM_ANALISE/APROVADA/RECUSADA/CONVERTIDA |
| nome_completo | TEXT | |
| empresa | TEXT | |
| email | TEXT | |
| telefone | TEXT | |
| instagram | TEXT | |
| data_evento | TEXT | data exata (opcional) |
| data_estimativa | TEXT | descricao livre (opcional) |
| faixa_capacidade | TEXT | |
| horario | TEXT | DIURNO/NOTURNO/DIA_INTEIRO |
| formatos | JSONB | string[] selecionados |
| atracoes | JSONB | string[] selecionados |
| descricao | TEXT | |
| evento_id | UUID FK eventos_admin | se convertido em evento |
| avaliado_por | UUID FK profiles | |
| avaliado_em | TIMESTAMPTZ | |
| motivo_recusa | TEXT | |
| mensagem_gerente | TEXT | |
| visualizado_em | TIMESTAMPTZ | |
| em_analise_em | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | trigger |

## Colunas adicionadas em comunidades
evento_privado_ativo, evento_privado_texto, evento_privado_fotos, evento_privado_formatos, evento_privado_atracoes, evento_privado_faixas_capacidade

## RLS
- Solicitante ve proprias (SELECT + INSERT)
- Gerente/Dono/Master ve e atualiza da comunidade (via atribuicoes_rbac)

## Arquivos
| Arquivo | Funcao |
|---|---|
| services/eventoPrivadoService.ts | CRUD + status transitions |
| modules/community/EventoPrivadoFormView.tsx | Formulario do membro |
| modules/profile/MinhasSolicitacoesView.tsx | Tela unificada no perfil (aba PRIVADOS + COMEMORACOES) |
| features/admin/views/comunidades/EventosPrivadosTab.tsx | Painel gerente |
| features/admin/views/comunidades/EditarModal.tsx | Config evento privado (toggle + texto + listas) |
| supabase/migrations/20260308000000_eventos_privados.sql | Migration |

## Pendencias
| Item | Status |
|---|---|
| Formulario membro | OK |
| Botao ComunidadePublicView | OK |
| Timeline status membro | OK |
| Painel gerente (aprovar/recusar) | OK |
| Config gerente (habilitar/texto/fotos/opcoes) | OK — EditarModal.tsx (toggle + texto + formatos/atracoes/faixas listas editaveis) |
| Notificacoes (push/in-app) | OK — notify() em solicitar (gerentes), aprovar/recusar (solicitante) |
| Converter em evento | OK — EventosPrivadosTab.tsx (botao + lista eventos + vincular) |
| Integrar MinhasSolicitacoes no perfil | OK — MinhasSolicitacoesView.tsx (aba PRIVADOS + COMEMORACOES) |
