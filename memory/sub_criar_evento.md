# Criado: 2026-03-06 01:45 | Ultima edicao: 2026-03-18

# Sub-modulo: Criar Evento (Wizard 5 Steps)

## Pertence a: modulo_evento.md

## Arquivos (13 arquivos, 2900L total)
| Arquivo | Linhas | Funcao |
|---|---|---|
| CriarEventoView.tsx | 941 | Wizard principal — orquestra steps + handlePublicar + toast + scrollRef |
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

### PASSO 1 — ESSENCIAL (Step1Evento, showClassification=false)
**Campos**:
- nome, descricao (obrigatorios)
- foto (upload + crop, max 5MB JPEG/PNG/WebP)
- data, hora inicio, hora encerramento
- recorrência, local (se produtora)
- classificação etária (LIVRE/16+/18+)
**NOTA**: formato/estilo/experiência REMOVIDOS deste step (movidos pro step 2)

### PASSO 2 — INGRESSOS + CLASSIFICAÇÃO (Step2Ingressos + ClassificacaoInline)
**Ingressos**: N lotes x M variações (área, gênero, valor, limite, meia-entrada)
**MAIS VANTA**: benefícios por tier em AccordionSection
**Classificação** (AccordionSection colapsável no final):
- Formato: obrigatório (1 escolha)
- Estilo: obrigatório (mín 1, sem teto)
- Experiência: OPCIONAL (max 5)

### PASSO 3 — EQUIPE E LISTAS (fundidos)
**Equipe**: Step4EquipeCasa OU Step4EquipeSocio (conforme tipo)
**Listas**: Step3Listas abaixo com separador visual
Fundidos porque cotas de lista dependem da equipe

### PASSO 4 — REVISAR + PUBLICAR (inline no CriarEventoView)
- Mini preview card (foto, nome, data, local)
- Resumo (lotes, equipe, regras lista, classificação)
- Split financeiro (só COM_SOCIO, Step5Financeiro inline)
- Botão "Publicar" / "Enviar Convite"
- CelebrationScreen no sucesso

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
| 13 | Draft/rascunho | NAO EXISTE → PLANEJADO | Plano Wizards v2 Fase 4 (tabela drafts, auto-save 3s) |
| 14 | Preview antes de publicar | NAO EXISTE → PLANEJADO | Plano Wizards v2 Fase 3 (step 4 Revisar+Publicar) |
| 15 | Toast sucesso/erro | OK (18/mar) | useToast + ToastContainer |
| 16 | Scroll to error | OK (18/mar) | scrollRef.scrollTo no handlePublicar catch |
| 17 | Upload validação | OK (18/mar) | Tipo real JPEG/PNG/WebP + máx 5MB |
| 18 | Labels mínimo 10px | OK (18/mar) | text-[0.4375rem] e text-[0.5rem] → text-[0.625rem] em 11 arquivos |
