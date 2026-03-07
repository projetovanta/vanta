# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Memória — RBAC Definitivo

## Migration
- `20260303060000_rbac_definitivo_roles.sql` — roles/cargos definitivos

## Cargos (CargoUnificado)
GERENTE | SOCIO | PROMOTER | GER_PORTARIA_LISTA | PORTARIA_LISTA | GER_PORTARIA_ANTECIPADO | PORTARIA_ANTECIPADO | CAIXA

## Permissões (PermissaoVanta)
VER_FINANCEIRO | GERIR_EQUIPE | GERIR_LISTAS | VENDER_PORTA | VALIDAR_ENTRADA | INSERIR_LISTA

## Mapeamento Cargo → Permissões
Ver `CARGO_PERMISSOES` em `rbacService.ts`

## Tabela atribuicoes_rbac
Colunas: id, user_id, tenant_type, tenant_id, cargo, permissoes, ativo, atribuido_por, atribuido_em, updated_at, scope, community_id, inherited_from_community, recruited_to_event

## Diferença de RBAC V2
RBAC V2 foi ELIMINADO (commit c2f530a). Agora só existe RBAC definitivo (V1 com cargos limpos).
