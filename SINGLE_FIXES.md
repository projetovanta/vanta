# SINGLE_FIXES.md — Análise .single() no projeto VANTA

**Generated:** 2026-03-13
**Branch:** main
**Método:** grep + leitura manual de contexto (10 linhas antes de cada `.single()`)

---

## 1. CLASSIFICAÇÃO

### 🟢 SAFE — INSERT/UPSERT().select().single() (46/46)

INSERT sempre retorna exatamente 1 row. `.single()` é seguro e correto.

| # | Arquivo | Linha | Tipo |
|---|---|---|---|
| 1 | `services/messagesService.ts` | :82 | INSERT |
| 2 | `services/comemoracaoService.ts` | :100 | INSERT |
| 3 | `services/comemoracaoService.ts` | :329 | INSERT |
| 4 | `services/transferenciaService.ts` | :150 | INSERT |
| 5 | `services/eventoPrivadoService.ts` | :79 | INSERT |
| 6 | `features/admin/services/cargosPlataformaService.ts` | :80 | INSERT |
| 7 | `features/admin/services/pushTemplatesService.ts` | :66 | INSERT |
| 8 | `features/admin/services/pushTemplatesService.ts` | :123 | INSERT |
| 9 | `features/admin/services/comprovanteService.ts` | :178 | UPSERT |
| 10 | `features/admin/services/notificationsService.ts` | :73 | INSERT |
| 11 | `features/admin/services/mesasService.ts` | :53 | INSERT |
| 12 | `features/admin/services/assinaturaService.ts` | :138 | INSERT |
| 13 | `features/admin/services/assinaturaService.ts` | :318 | INSERT |
| 14 | `features/admin/services/listasService.ts` | :406 | INSERT |
| 15 | `features/admin/services/listasService.ts` | :491 | INSERT |
| 16 | `features/admin/services/listasService.ts` | :722 | INSERT |
| 17 | `features/admin/services/listasService.ts` | :819 | INSERT |
| 18 | `features/admin/services/listasService.ts` | :870 | INSERT |
| 19 | `features/admin/services/listasService.ts` | :897 | INSERT |
| 20 | `features/admin/services/rbacService.ts` | :411 | UPSERT |
| 21 | `features/admin/services/eventosAdminCrud.ts` | :91 | INSERT |
| 22 | `features/admin/services/eventosAdminCrud.ts` | :138 | INSERT |
| 23 | `features/admin/services/eventosAdminCrud.ts` | :342 | INSERT |
| 24 | `features/admin/services/clube/clubeNotifProdutorService.ts` | :73 | INSERT |
| 25 | `features/admin/services/clube/clubeDealsService.ts` | :132 | INSERT |
| 26 | `features/admin/services/clube/clubeConvitesService.ts` | :70 | INSERT |
| 27 | `features/admin/services/clube/clubeConvitesIndicacaoService.ts` | :22 | INSERT |
| 28 | `features/admin/services/clube/clubeTiersService.ts` | :47 | INSERT |
| 29 | `features/admin/services/clube/clubeCidadesService.ts` | :56 | INSERT |
| 30 | `features/admin/services/clube/clubeReservasService.ts` | :56 | INSERT |
| 31 | `features/admin/services/clube/clubeParceirosService.ts` | :86 | INSERT |
| 32 | `features/admin/services/clube/clubePassportService.ts` | :57 | INSERT |
| 33 | `features/admin/services/clube/clubeConfigService.ts` | :40 | UPSERT |
| 34 | `features/admin/services/clube/clubePlanosService.ts` | :71 | INSERT |
| 35 | `features/admin/services/clube/clubePlanosService.ts` | :140 | INSERT |
| 36 | `features/admin/services/clube/clubeSolicitacoesService.ts` | :98 | INSERT |
| 37 | `features/admin/services/clube/clubeSolicitacoesService.ts` | :120 | INSERT |
| 38 | `features/admin/services/reembolsoService.ts` | :290 | INSERT |
| 39 | `features/admin/services/reembolsoService.ts` | :354 | INSERT |
| 40 | `features/admin/services/eventosAdminFinanceiro.ts` | :255 | INSERT |
| 41 | `features/admin/services/adminService.ts` | :172 | INSERT |
| 42 | `features/admin/services/comunidadesService.ts` | :136 | INSERT |
| 43 | `features/admin/services/parceriaService.ts` | :130 | INSERT |
| 44 | `features/admin/services/auditService.ts` | :142 | INSERT |
| 45 | `supabase/functions/notif-infraccao-registrada/index.ts` | :184 | INSERT |
| 46 | `supabase/functions/create-ticket-checkout/index.ts` | :221 | INSERT |

### 🔴 MUST FIX — SELECT/UPDATE/DELETE().single()

**Nenhum encontrado.** ✅

### 🟡 REVIEW

**Nenhum pendente.** Todos os 46 casos foram classificados com leitura de contexto.

#### Nota sobre `clubePlanosService.ts:140`

Este caso parece ser UPDATE à primeira vista porque existe um `.update()` 4 linhas acima. Porém o `.single()` pertence a um **INSERT separado** que vem logo depois:

```typescript
// Linha 135: UPDATE (sem .single())
.from('produtor_plano')
.update({ status: 'CANCELADO', fim: tsBR() })
.eq('produtor_id', produtorId)
.eq('status', 'ATIVO');

// Linha 138-140: INSERT (com .single()) — SAFE
const { data, error } = await supabase
  .from('produtor_plano')
  .insert({ produtor_id: produtorId, plano_id: planoId, ... })
  .select('*, planos_produtor(nome), ...')
  .single();
```

---

## 2. MUST FIX — Detalhes

Não aplicável — zero conversões necessárias.

---

## 3. STATS FINAIS

| Categoria | Total |
|---|---|
| 🟢 SAFE (INSERT/UPSERT) | **46** |
| 🔴 MUST FIX (SELECT/UPDATE/DELETE) | **0** |
| 🟡 REVIEW | **0** |
| **Total `.single()` no projeto** | **46** |
| **Conversões necessárias** | **0** |

### Conclusão

O projeto já segue o padrão correto:
- **`.maybeSingle()`** é usado em todas as queries SELECT/UPDATE que podem não encontrar registro (52 ocorrências no projeto)
- **`.single()`** é usado **apenas** em INSERT/UPSERT que sempre retornam exatamente 1 row

**Nenhuma ação necessária.**
