# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Memória — Permissões / RBAC

## Arquivos
- `features/admin/services/rbacService.ts` (484L) — cache + CRUD atribuições
- `features/admin/permissoes.ts` (240L) — guards de acesso

## Guards de Acesso (permissoes.ts)
| Função | Lógica |
|---|---|
| `getAccessNodes(userId)` | Consolida comunidades + eventos onde user tem cargo |
| `getAcessoComunidades(userId, role)` | master=todas, demais=onde tem cargo |
| `getAcessoEventos(userId, role)` | master=todos, demais=cargo direto + comunidade |
| `canAccessFinanceiro(userId, role, ctx)` | GERENTE/SOCIO ou master |
| `canAccessListas(userId, role, ctx)` | qualquer cargo ativo |
| `canAccessCheckin(userId, role, ctx)` | PORTARIA_* ou superior |
| `canAccessQR(userId, role, ctx)` | PORTARIA_* ou superior |
| `canAccessCaixa(userId, role, ctx)` | CAIXA ou superior |
| `canAccessPortariaScanner(userId, role, ctx)` | PORTARIA ou superior |
| `canAccessComunidades(userId, role)` | GERENTE ou master |
| `isMasterOnly(userId, role)` | role === 'vanta_masteradm' |
| `canAccessMeusEventos(userId, role)` | qualquer cargo ativo |
| `isSocioEvento(eventoId, userId, role)` | cargo SOCIO no evento ou comunidade |

## rbacService — API
- `refresh()` — carrega atribuicoes_rbac + comunidades + eventos do Supabase
- `getAtribuicoes(userId)` — retorna todas AtribuicaoRBAC do user
- `getAtribuicao(userId, tipo, tenantId)` — atribuição específica
- `temPermissao(userId, tipo, tenantId, permissao)` — check granular
- `temPermissaoCtx(userId, permissao, ctx)` — check com cascata comunidade→evento
- `atribuir(args)` — cria atribuição no Supabase + cache
- `revogar(id)` — soft delete (ativo=false)
- `recrutar(args)` — atribui membro de comunidade a evento
- `desrecrutar(userId, eventoId, cargo)` — revoga atribuição de evento

## RPC get_admin_access
- Migration: `20260305000000_rpc_get_admin_access.sql`
- `get_admin_access(p_user_id UUID)` → JSONB {role, comunidades[], eventos[]}
- SECURITY DEFINER — bypassa RLS
- Usado pelo AdminGateway como 1 fonte de verdade para o gate
