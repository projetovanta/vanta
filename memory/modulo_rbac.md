# Criado: 2026-03-06 01:42 | Ultima edicao: 2026-03-07

# Modulo: RBAC (Permissoes + Equipe)

## O que e
RBAC = Role-Based Access Control. Define quem pode fazer o que no admin.
Hierarquia: masteradm > gerente > socio > promoter > portaria > caixa.
Cada cargo tem permissoes granulares. Atribuicoes sao por COMUNIDADE ou por EVENTO.

## Tabelas Supabase

### cargos (cargos fixos por comunidade)
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| membro_id | UUID FK profiles | Membro |
| comunidade_id | UUID FK comunidades | Comunidade |
| tipo | TEXT | masteradm, gerente, socio, promoter, portaria, caixa |
| atribuido_por | UUID FK profiles | Quem atribuiu |
| atribuido_em | TIMESTAMPTZ | auto |

### atribuicoes_rbac (permissoes granulares)
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| user_id | UUID FK profiles | Usuario |
| tenant_type | TEXT | COMUNIDADE ou EVENTO |
| tenant_id | UUID | ID da comunidade ou evento |
| cargo | TEXT | Nome do cargo |
| permissoes | TEXT[] | Array de permissoes (default []) |
| atribuido_por | UUID FK profiles | Quem atribuiu |
| atribuido_em | TIMESTAMPTZ | auto |
| ativo | BOOLEAN | Default true |
| updated_at | TIMESTAMPTZ | auto |
| UNIQUE | (user_id, tenant_type, tenant_id, cargo) | |

### equipe_evento (ja documentada em modulo_evento.md)
Membros da equipe por evento com papel e liberar_lista.

## Servico

### rbacService (features/admin/services/rbacService.ts, 512L)
**Constantes:**
- `CARGO_TO_PORTAL` — mapa cargo → portal de acesso
- `CARGO_LABELS` — labels legiveis por cargo
- `CARGO_PERMISSOES` — permissoes default por cargo (FONTE DA VERDADE)

**Metodos:**
- `atribuir({userId, tenantType, tenantId, cargo, permissoes, atribuidoPor})` — INSERT atribuicoes_rbac
- `revogar(id)` — DELETE atribuicao
- `getCargosCustomizados(tenantTipo, tenantId)` — retorna cargos customizados da comunidade
- `getPermissoesPlataforma()` — permissões do cargo plataforma
- `getAtribuicoes(userId)` — todas atribuições do usuário
- `getAtribuicoesTenant(tipo, tenantId)` — atribuições de um tenant
- `getRecrutados(eventoId, cargo?)` — equipe recrutada pro evento
- `getElegiveis(comunidadeId, eventoId, cargo)` — elegíveis pra recrutamento

## Regras de nivel (DEFINITIVO)
- **GERENTE** = SOMENTE nivel COMUNIDADE
- **SOCIO, PROMOTER, GER_PORTARIA_LISTA, PORTARIA_LISTA, GER_PORTARIA_ANTECIPADO, PORTARIA_ANTECIPADO, CAIXA** = SOMENTE nivel EVENTO
- **masteradm** = pode tudo, sempre, em tudo (via role na tabela profiles)

## CARGO_PERMISSOES (fonte da verdade)
| Cargo | Level | Permissoes |
|---|---|---|
| GERENTE | COMUNIDADE | VER_FINANCEIRO, GERIR_EQUIPE, GERIR_LISTAS, INSERIR_LISTA, CRIAR_REGRA_LISTA, VER_LISTA, CHECKIN_LISTA, VALIDAR_QR, VALIDAR_ENTRADA |
| SOCIO | EVENTO | VER_FINANCEIRO, GERIR_EQUIPE, GERIR_LISTAS, INSERIR_LISTA, CRIAR_REGRA_LISTA, VER_LISTA |
| PROMOTER | EVENTO | INSERIR_LISTA |
| GER_PORTARIA_LISTA | EVENTO | CHECKIN_LISTA, VER_LISTA, INSERIR_LISTA, CRIAR_REGRA_LISTA, GERIR_EQUIPE |
| PORTARIA_LISTA | EVENTO | CHECKIN_LISTA, VER_LISTA |
| GER_PORTARIA_ANTECIPADO | EVENTO | VALIDAR_QR, GERIR_EQUIPE |
| PORTARIA_ANTECIPADO | EVENTO | VALIDAR_QR |
| CAIXA | EVENTO | VENDER_PORTA |

## Fluxos especiais
- **Estorno**: comprador solicita → socio+gerente aceitam → master autoriza (sem socio: gerente aceita → master autoriza)
- **Saque**: socio solicita → gerente aprova → master autoriza (sem socio: gerente solicita → master autoriza)
- **Cortesia**: promoter tem cota e envia direto; gerente+socio+master criam; gerente+socio enviam direto
- **Devolver cortesia**: somente o remetente pode devolver
- **Cancelamento evento**: gerente+socio solicitam → master aceita ou rejeita

## Hierarquia de cargos
```
masteradm — acesso total (is_masteradm() ou is_vanta_admin())
  gerente — gerencia comunidade + eventos (RBAC tenant COMUNIDADE)
    socio — co-produtor de evento especifico (RBAC tenant EVENTO)
      promoter — gerencia lista de nomes (cota)
      ger_portaria_lista — gerente de portaria (listas)
      portaria_lista — portaria (listas)
      ger_portaria_antecipado — gerente de portaria (QR/antecipado)
      caixa — venda presencial
```
**Fonte da verdade dos cargos**: `types/rbac.ts` (type CargoRBAC)

## Onde este modulo aparece (propagacao)

| Tela | O que usa |
|---|---|
| AdminGateway | Filtra acesso por cargo |
| AdminDashboardView | Menu baseado em permissoes |
| CriarEventoView Step 4 | Atribuir equipe |
| EditarEventoView | Editar equipe |
| FinanceiroView | Verifica permissao de saque |
| MasterFinanceiroView | Verifica is_masteradm |
| EventosPendentesView | Apenas master |
| ComunidadeDetalheView | Tab Equipe |

## Checklist de status
| # | Item | Status | Detalhe |
|---|---|---|---|
| 1 | Atribuir cargo | OK | rbacService.atribuir |
| 2 | Revogar cargo | OK | rbacService.revogar |
| 3 | Permissoes granulares | OK | TEXT[] permissoes |
| 4 | Cargos customizados | OK | cargos_customizados JSONB na comunidade |
| 5 | Tenant COMUNIDADE | OK | GERENTE somente |
| 6 | Tenant EVENTO | OK | SOCIO, PROMOTER, PORTARIA*, CAIXA |
| 7 | Hierarquia master > gerente > socio | OK | Implementado |
| 8 | RLS | OK | atribuicoes_rbac + cargos com RLS |
| 9 | Soberania acesso | OK | soberania_acesso tabela + SovereigntyGuard |
| 10 | RPC aceitar_convite_socio | OK | Cria RBAC SOCIO no EVENTO com permissoes corretas |
| 11 | Audit log de atribuicoes | OK | atribuido_por + atribuido_em na tabela + getAllAtribuicoes() + CARGO_DESCRICOES |
| 12 | Expirar cargo automaticamente | DECISAO: NAO | Dan decidiu que não precisa — evento já limita naturalmente |
