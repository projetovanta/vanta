# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Mapa — RBAC / Permissões

## Arquivos Principais
| Arquivo | Linhas | Função |
|---|---|---|
| `features/admin/services/rbacService.ts` | 484 | Cache RBAC, CRUD atribuições, permissões, recrutamento |
| `features/admin/permissoes.ts` | 240 | Guards de acesso (canAccess*, getAcesso*) |
| `stores/authStore.ts` | 162 | accessNodes no login |

## Hierarquia de Cargos
```
GERENTE > SOCIO > PROMOTER > GER_PORTARIA_* > PORTARIA_* > CAIXA
```

## Cargos → Permissões (CARGO_PERMISSOES)
- GERENTE/SOCIO: VER_FINANCEIRO, GERIR_EQUIPE, GERIR_LISTAS, VENDER_PORTA, VALIDAR_ENTRADA
- PROMOTER: GERIR_LISTAS, INSERIR_LISTA
- GER_PORTARIA_*: VALIDAR_ENTRADA, GERIR_EQUIPE
- PORTARIA_*: VALIDAR_ENTRADA
- CAIXA: VENDER_PORTA

## Cargos → Portal Role (CARGO_TO_PORTAL)
- GERENTE → vanta_gerente
- SOCIO → vanta_socio
- PROMOTER → vanta_promoter
- etc

## Gate de Acesso
1. App.tsx: `role !== guest && accessNodes.length > 0` → mostra tab admin
2. AdminGateway: RPC `get_admin_access` → lista comunidades/eventos
3. AdminDashboardView: sidebar filtra seções por role
4. permissoes.ts: guards granulares (canAccessFinanceiro, canAccessListas, etc)

## Tabela Supabase: atribuicoes_rbac
Colunas: id, user_id, tenant_type (COMUNIDADE|EVENTO), tenant_id, cargo, permissoes, ativo, atribuido_por, atribuido_em, updated_at

## Cascata Comunidade → Evento
- GERENTE/SOCIO em comunidade → acesso a TODOS eventos da comunidade
- Operacionais (PROMOTER, PORTARIA, CAIXA) → só onde explicitamente atribuídos

## Recrutamento
- `rbacService.recrutar()` → atribui membro da comunidade a evento específico
- `rbacService.desrecrutar()` → revoga atribuição do evento
- Cargos recrutáveis: PROMOTER, PORTARIA_LISTA, PORTARIA_ANTECIPADO, CAIXA
