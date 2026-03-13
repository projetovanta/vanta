# Criado: 2026-03-06 01:45 | Ultima edicao: 2026-03-06 01:45

# Sub-modulo: Criar Evento (Wizard 5 Steps)

## Pertence a: modulo_evento.md

## Arquivos (13 arquivos, 2900L total)
| Arquivo | Linhas | Funcao |
|---|---|---|
| CriarEventoView.tsx | 868 | Wizard principal — orquestra steps + handlePublicar |
| TipoEventoScreen.tsx | 75 | Escolha FESTA_DA_CASA ou COM_SOCIO |
| Step1Evento.tsx | 378 | Dados basicos do evento |
| Step2Ingressos.tsx | 650 | Lotes + variacoes + MV |
| Step3Listas.tsx | 252 | Regras de lista + cotas |
| Step4EquipeCasa.tsx | 479 | Equipe (tipo FESTA_DA_CASA) |
| Step4EquipeSocio.tsx | 457 | Equipe + convite socio (tipo COM_SOCIO) |
| Step5Financeiro.tsx | 135 | Aceitar ToS |
| CopiarModal.tsx | 178 | Copiar config de evento anterior |
| CargoModal.tsx | 70 | Modal de selecao de cargo |
| CapacidadeModal.tsx | 57 | Modal de capacidade |
| types.ts | 75 | Tipos: VariacaoForm, LoteForm, VarListaForm, QuotaForm, EquipeForm, SplitForm |
| constants.ts | 48 | AREA_LABELS, PAPEIS_CASA, PERMISSOES_TOGGLE, COR_PALETTE |
| utils.ts | 46 | novaVar, novoLote, novaVarLista, buildLabel |

## Types (types.ts)
```
VariacaoForm: id, area (AreaIngresso), areaCustom, genero, valor, limite, requerComprovante, tipoComprovante, vendidos?
LoteForm: id, dataValidade, horaValidade, virarPct, variacoes[], aberto
VarListaForm: id, tipo (VIP|CONSUMO|ENTRADA|OUTRO), cor, genero, area (AreaLista), validadeTipo, validadeHora, ababoraAtivo, ababoraAlvoId, limite, valor
QuotaForm: varListaId, quantidade
EquipeForm: id, membroId, nome, email, foto, papel, liberarLista, quotas[]
TipoFluxoEvento: COM_SOCIO | FESTA_DA_CASA
SplitForm: percentProdutor, percentSocio
SocioConviteForm: membroId, nome, email, foto, permissoes[], splitPercentual
SocioEvento: id, eventoId, socioId, splitPercentual, permissoes[], status, rodadaNegociacao, nome?
BeneficioMVForm: tierId, ativo, tipo (ingresso|lista), loteId, listaVarId, descontoPercentual
MaisVantaEventoForm: enabled, beneficios[]
TierEventoMV: @deprecated (compat)
LoteMaisVantaForm: @deprecated (compat)
```

## Fluxo detalhado step-by-step

### PASSO 0 — TIPO DO EVENTO (TipoEventoScreen)
**Opcoes**: FESTA_DA_CASA (gerente produz sozinho) ou COM_SOCIO (co-producao com socio)
**Impacto**: define qual Step4 renderizar e se tem convite/split

### PASSO 1 — DADOS (Step1Evento)
**Campos**:
- nome (obrigatorio)
- descricao (obrigatorio)
- foto (upload + crop via ImageCropModal)
- data do evento (date) — campo unico
- hora inicio (VantaDropdown 30min slots)
- hora encerramento (VantaDropdown 30min slots) — se horaFim <= horaInicio, sistema calcula dia seguinte automaticamente
- formato (acordeao colapsavel, selecao unica)
- estilos (acordeao colapsavel, multi-select max 5)
- experiencias (acordeao colapsavel, multi-select max 5)
**NOTA**: data_fim NAO aparece no form — calculado automaticamente a partir de dataInicio + horaInicio + horaFim

**Upload**: foto vai para bucket `eventos` como `{eventoId}/capa.jpg`

### PASSO 2 — INGRESSOS (Step2Ingressos, 650L)
**Estrutura**: N lotes, cada lote com M variacoes
**Lote**: nome auto (1o Lote, 2o Lote...), data virada, % virada
**Variacao**: area (PISTA/VIP/CAMAROTE/OUTRO + custom), genero (UNISEX/M/F), valor, limite
**Meia-entrada**: requerComprovante + tipoComprovante por variacao
**MAIS VANTA**: se MV ativo, vincula benefícios por tier (DESCONTO→VANTA_BLACK) a lotes/listas reais do evento (mais_vanta_lotes_evento)

### PASSO 3 — LISTAS (Step3Listas, 252L)
**Estrutura**: N regras de lista por evento
**Regra**: tipo (VIP/CONSUMO/ENTRADA/OUTRO), cor, genero, validade (NOITE_TODA ou HORARIO), limite, valor
**Cotas**: por membro da equipe, quantos nomes pode inserir por regra
**Teto global**: total maximo de convidados

### PASSO 4A — EQUIPE CASA (Step4EquipeCasa, 479L)
**Para**: FESTA_DA_CASA
**O que faz**:
- Busca membros por nome/email (authService)
- Define papel: promoter, portaria, caixa, gerente (PAPEIS_CASA)
- Define se libera lista
- Define cotas de lista por membro
- Permissoes toggle: VER_FINANCEIRO, GERIR_LISTAS, EMITIR_CORTESIAS

### PASSO 4B — EQUIPE SOCIO (Step4EquipeSocio, 457L)
**Para**: COM_SOCIO
**O que faz**:
- Convida N socios (busca por nome/email) — multi-socio suportado
- Define split por socio (soma dos splits + split produtor = 100)
- Define permissoes por socio
- Dados salvos em socios_evento (tabela dedicada)
- Resto da equipe igual ao Step4EquipeCasa

### PASSO 5 — FINANCEIRO (Step5Financeiro, 135L)
**O que faz**: TosAcceptModal obrigatorio (termos de servico)
**Obrigacao**: nao pode publicar sem aceitar

### COPIAR (CopiarModal, 178L)
**Quando**: ao iniciar criacao, botao "Copiar de evento anterior"
**O que faz**: carrega evento anterior, preenche lotes, variacoes, listas, equipe
**Fonte**: eventosAdminService.getEvento + listasService

## handlePublicar — 8 reacoes atomicas
```
1. eventosAdminService.criarEvento → INSERT eventos_admin
   Status: PENDENTE (sempre — negociação sócio removida)
   publicado: false
1b. INSERT socios_evento (N socios, cada um com split_percentual)
    Notifica cada socio com SOCIO_ADICIONADO
2. INSERT lotes (por lote: nome, ordem, data_validade)
3. INSERT variacoes_ingresso (por variacao: area, genero, valor, limite)
4. cortesiasService.initCortesia (se habilitado)
5. clubeService.salvarBeneficiosEvento (se MV ativo, benefícios por tier → mais_vanta_lotes_evento)
6. listasService.criarLista → INSERT listas_evento + regras_lista
   listasService.distribuirCota → INSERT cotas_promoter
7. adminService.addCard → INSERT vanta_indica (card inativo auto)
8. Para cada membro equipe: INSERT equipe_evento
```

## Checklist
| # | Item | Status | Detalhe |
|---|---|---|---|
| 1 | TipoEventoScreen | OK | 75L, 2 opcoes |
| 2 | Step1 dados | OK | 378L, todos campos |
| 3 | Step2 ingressos | OK | 650L, lotes + variacoes + MV |
| 4 | Step3 listas | OK | 252L, regras + cotas |
| 5 | Step4 equipe casa | OK | 479L |
| 6 | Step4 equipe socio | OK | 457L, split + convite |
| 7 | Step5 financeiro | OK | 135L, ToS |
| 8 | Copiar de anterior | OK | 178L |
| 9 | Upload foto crop | OK | ImageCropModal |
| 10 | Meia-entrada config | OK | requerComprovante por variacao |
| 11 | MV por tier | OK | TierEventoMV com quantidade/acompanhantes |
| 12 | Validacao de campos | OK | Steps validam antes de avancar |
| 13 | Draft/rascunho | NAO EXISTE | Se sair no meio, perde tudo |
| 14 | Preview antes de publicar | NAO EXISTE | Sem preview visual do evento |
