# Criado: 2026-03-06 01:51 | Ultima edicao: 2026-03-06 01:51

# Sub-modulo: MAIS VANTA Admin (Curadoria + Gestao)

## Pertence a: modulo_clube.md

## TabClube — Hub principal (11 arquivos, 1745L)
**Navegacao**: Painel Admin -> Curadoria -> Tab Clube

### Sub-tabs
| Sub-tab | Arquivo | Linhas | Funcao |
|---|---|---|---|
| SOLICITACOES | SubTabSolicitacoes.tsx | 148 | Aprovar/rejeitar pedidos de entrada |
| MEMBROS_CLUBE | SubTabMembros.tsx | 147 | Lista membros ativos, mudar tier |
| EVENTOS | SubTabEventos.tsx | 202 | Eventos com lotes MV |
| POSTS | SubTabPosts.tsx | 64 | Verificar posts Instagram |
| PASSAPORTES | SubTabPassaportes.tsx | 50 | Passaportes por cidade |
| ASSINATURA | SubTabConfig.tsx | 427 | Config assinatura + beneficios |
| NOTIFICACOES | SubTabNotificacoes.tsx | 42 | Notificacoes do clube |

### Arquivos suporte
| Arquivo | Linhas | Funcao |
|---|---|---|
| index.tsx | 360 | TabClube hub |
| PerfilMembroOverlay.tsx | 219 | Overlay com perfil enriquecido do membro |
| tierUtils.ts | 83 | Labels, cores, beneficios por tier |
| VantaDropdown.tsx | 3 | Re-export dropdown |

## Views dedicadas (top-level)
| Arquivo | Linhas | Funcao |
|---|---|---|
| AssinaturasMaisVantaView.tsx | 286 | Gerenciar assinaturas por comunidade |
| PassaportesMaisVantaView.tsx | 274 | Gerenciar passaportes por cidade |
| MonitoramentoMaisVantaView.tsx | ? | Monitoramento geral MV |
| MembrosGlobaisMaisVantaView.tsx | ? | Membros globais |
| InfracoesGlobaisMaisVantaView.tsx | ? | Infracoes globais |

## Fluxos

### APROVAR SOLICITACAO (SubTabSolicitacoes)
```
Admin ve solicitacoes pendentes
-> Clica no perfil -> PerfilMembroOverlay (dados + Instagram)
-> Define tier (BRONZE/PRATA/OURO/DIAMANTE)
-> clubeService.aprovarSolicitacao
   -> UPDATE solicitacoes_clube status=APROVADO
   -> INSERT membros_clube (tier, instagram_handle, etc)
-> Membro recebe notificacao MV_APROVADO
```

### GERENCIAR MEMBROS (SubTabMembros)
```
Admin ve lista de membros ativos
-> Pode mudar tier (upgrade/downgrade)
-> Pode desativar membro (ativo=false)
-> PerfilMembroOverlay mostra dados enriquecidos
```

### VERIFICAR POSTS (SubTabPosts)
```
Admin ve reservas com status PENDENTE_POST
-> Verifica URL do post
-> Marca como verificado (post_verificado=true)
-> Se nao postou: registra infracao NAO_POSTOU
```

### CONFIG ASSINATURA (SubTabConfig, 427L)
```
Admin configura beneficios por tier
-> BENEFICIOS_DISPONIVEIS (constante)
-> Define quais beneficios cada tier recebe
-> Valor mensal da assinatura
-> Ativa/cancela assinatura da comunidade
```

## Checklist
| # | Item | Status | Detalhe |
|---|---|---|---|
| 1 | TabClube hub | OK | 360L, 7 sub-tabs |
| 2 | Aprovar solicitacao | OK | SubTabSolicitacoes 148L |
| 3 | Gerenciar membros | OK | SubTabMembros 147L |
| 4 | Mudar tier | OK | PerfilMembroOverlay |
| 5 | Verificar posts | OK | SubTabPosts 64L |
| 6 | Passaportes tab | OK | SubTabPassaportes 50L |
| 7 | Config assinatura | OK | SubTabConfig 427L |
| 8 | Perfil enriquecido | OK | PerfilMembroOverlay 219L |
| 9 | Tier utils | OK | Labels, cores, beneficios |
| 10 | Assinaturas view | OK | AssinaturasMaisVantaView 286L |
| 11 | Passaportes view | OK | PassaportesMaisVantaView 274L |
| 12 | Infracoes globais | OK | InfracoesGlobaisMaisVantaView |
| 13 | Membros globais | OK | MembrosGlobaisMaisVantaView |
