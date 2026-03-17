# Criado: 2026-03-06 01:50 | Ultima edicao: 2026-03-06 01:50

# Sub-modulo: Comunidade CRUD + Pagina Publica

## Pertence a: modulo_comunidade.md

## Criar Comunidade (4 arquivos, 942L)
| Arquivo | Linhas | Funcao |
|---|---|---|
| criarComunidade/index.tsx | 358 | CriarComunidadeView — wizard 3 steps |
| criarComunidade/Step1Identidade.tsx | 141 | Nome, bio, capacidade, taxa, horarios, CNPJ |
| criarComunidade/Step2Localizacao.tsx | 170 | CEP auto → endereco + coords |
| criarComunidade/Step3Fotos.tsx | 273 | Foto perfil/capa (crop) + produtores |

### Fluxo Criar
```
Master -> ComunidadesView -> "+ Nova Comunidade" -> CriarComunidadeView

Step 1 IDENTIDADE (141L):
- nome, descricao, capacidade_max
- vanta_fee_percent, horario_funcionamento
- CNPJ, razao_social, telefone

Step 2 LOCALIZACAO (170L):
- CEP → cepService auto-preenche endereco, cidade, estado, coords

Step 3 FOTOS (273L):
- foto perfil (ImageCropModal)
- foto capa (ImageCropModal)
- Produtores (busca por nome, min 1 obrigatorio)

AO FINALIZAR:
1. comunidadesService.criar → INSERT comunidades
2. Upload fotos → bucket comunidades → UPDATE URLs
3. UPDATE vanta_fee_percent
4. Para cada produtor: rbacService.atribuir (cargo GERENTE, permissoes completas)
5. generateSlug(nome) → slug unico
```

## Gestao de Comunidade (14 arquivos, 2041L)
| Arquivo | Linhas | Funcao |
|---|---|---|
| ComunidadesView.tsx | 138 | Lista de comunidades |
| ComunidadeDetalheView.tsx | 170 | Detalhe com 5 tabs |
| EditarModal.tsx | 521 | Editar todos campos |
| EquipeTab.tsx | 173 | Equipe RBAC da comunidade |
| AdicionarMembroModal.tsx | 159 | Adicionar membro + cargo |
| CentralEventosView.tsx | 83 | Hub eventos (criar/proximos/encerrados) |
| ProximosEventosTab.tsx | 59 | Eventos futuros |
| EventosEncerradosTab.tsx | 86 | Eventos passados |
| ResumoEventoModal.tsx | 171 | Resumo de evento encerrado |
| CaixaTab.tsx | 121 | Caixa da comunidade |
| CaixaDrilldownModal.tsx | 202 | Detalhamento caixa |
| LogsTab.tsx | 118 | Logs de auditoria |
| types.ts | 38 | Tipos e constantes |
| index.ts | 2 | Re-export |

### ComunidadeDetalheView — 5 tabs
```
EVENTOS: CentralEventosView (criar + proximos + encerrados)
EQUIPE: EquipeTab (membros RBAC + AdicionarMembroModal)
LOGS: LogsTab (auditService)
CAIXA: CaixaTab + CaixaDrilldownModal
RELATORIO: navega para relatorios
```

### EditarModal (~960L) — campos editaveis
nome, bio, foto, capa, endereco, horarios, capacidade, taxa VANTA, repasse, gateway fee mode, cargos custom, CNPJ, razao, telefone, dono, horario_overrides, instagram, whatsapp, tiktok, site (secao "Redes Sociais" grid 2x2)

### CuponsComunidadeTab — cupons por comunidade
Tab "Cupons" na ComunidadeDetalheView. Criar/toggle/remover cupons que valem pra todos os eventos da comunidade. Service: `cuponsService.getCuponsByComunidade()`

## Pagina Publica
| Arquivo | Linhas | Funcao |
|---|---|---|
| ComunidadePublicView.tsx | ~660 | Pagina publica da comunidade |

### Fluxo
```
Usuario ve evento -> clica nome/logo comunidade -> ComunidadePublicView
- Foto + capa
- Nome, bio, cidade, endereco
- Icones redes sociais (Instagram rosa, WhatsApp verde, TikTok cyan, Site cinza) — so mostra se preenchido
- Horario de funcionamento (HorarioPublicDisplay)
- Eventos futuros da comunidade
- Reviews (reviewsService)
- Botao Seguir/Desseguir (communityFollowService)
- Contador seguidores
```

## Checklist
| # | Item | Status | Detalhe |
|---|---|---|---|
| 1 | Wizard 3 steps | OK | 942L total |
| 2 | CEP auto | OK | cepService |
| 3 | Upload foto/capa crop | OK | ImageCropModal |
| 4 | Slug automatico | OK | generateSlug |
| 5 | RBAC auto (GERENTE) | OK | rbacService.atribuir |
| 6 | 5 tabs detalhe | OK | EVENTOS, EQUIPE, LOGS, CAIXA, RELATORIO |
| 7 | Editar 15+ campos | OK | EditarModal 521L |
| 8 | Equipe RBAC | OK | EquipeTab + AdicionarMembroModal |
| 9 | Logs auditoria | OK | LogsTab + auditService |
| 10 | Caixa drilldown | OK | CaixaTab + CaixaDrilldownModal |
| 11 | Pagina publica | OK | ComunidadePublicView 490L |
| 12 | Seguir/desseguir | OK | communityFollowService |
| 13 | Reviews | OK | reviewsService |
| 14 | Horarios publicos | OK | HorarioPublicDisplay |
| 15 | UnsavedChangesModal | OK | Aviso ao sair sem salvar |
| 16 | Horario overrides | OK | HorarioOverridesEditor |
